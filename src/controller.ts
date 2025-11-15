// src/controller.ts
import { PortfolioState } from './state';
import { PortfolioView } from './view';
import { debounce, isInputElement } from './utils';
import { CONFIG, DECIMAL_ZERO, TIMING } from './constants';
import { TemplateRegistry } from './templates/TemplateRegistry';
import Decimal from 'decimal.js';
import { bindEventListeners } from './eventBinder';
import { SnapshotRepository } from './state/SnapshotRepository';

import { getCalculatorWorkerService } from './services/CalculatorWorkerService';
import { logger } from './services/Logger';
import { ErrorHandler } from './errors/ErrorHandler';

// Command Pattern
import {
    CommandPipeline,
    CalculationCommand,
    WarningAnalysisCommand,
    PersistenceCommand,
    type CommandContext,
} from './controller/commands';

// 분리된 매니저 모듈들
import { PortfolioManager } from './controller/PortfolioManager';
import { StockManager } from './controller/StockManager';
import { TransactionManager } from './controller/TransactionManager';
import { CalculationManager } from './controller/CalculationManager';
import { DataManager } from './controller/DataManager';
import { AppInitializer } from './controller/AppInitializer';
import { SnapshotManager } from './controller/SnapshotManager';
import { bindControllerEvents as bindControllerEventsExternal } from './controller/ControllerEventBinder';

/**
 * @class PortfolioController
 * @description 포트폴리오 컨트롤러
 */
export class PortfolioController {
    state: PortfolioState;
    view: PortfolioView;
    debouncedSave: () => void;

    // 분리된 매니저들 (public - ControllerEventBinder 접근용)
    portfolioManager: PortfolioManager;
    stockManager: StockManager;
    transactionManager: TransactionManager;
    calculationManager: CalculationManager;
    dataManager: DataManager;
    snapshotManager: SnapshotManager;
    #appInitializer: AppInitializer;

    // Repository 인스턴스
    #snapshotRepo: SnapshotRepository;

    #calculatorWorker = getCalculatorWorkerService();

    #eventAbortController: AbortController | null = null;

    // Command Pipeline
    #commandPipeline: CommandPipeline;
    #errorHandler: ErrorHandler;

    constructor(state: PortfolioState, view: PortfolioView) {
        this.state = state;
        this.view = view;
        this.debouncedSave = debounce(
            () => this.state.saveActivePortfolio(),
            TIMING.DEBOUNCE_SAVE_DELAY
        );

        // Repository 인스턴스 생성
        this.#snapshotRepo = new SnapshotRepository();

        // 매니저 인스턴스 생성
        this.portfolioManager = new PortfolioManager(this.state, this.view);
        this.stockManager = new StockManager(this.state, this.view, this.debouncedSave);
        this.transactionManager = new TransactionManager(this.state, this.view);
        this.calculationManager = new CalculationManager(
            this.state,
            this.view,
            this.debouncedSave,
            this.getInvestmentAmountInKRW.bind(this),
            this.#snapshotRepo
        );
        this.dataManager = new DataManager(this.state, this.view);
        this.snapshotManager = new SnapshotManager(this.state, this.view, this.#snapshotRepo);
        this.#appInitializer = new AppInitializer(this.state, this.view);

        // ErrorHandler 및 Command Pipeline 초기화
        this.#errorHandler = new ErrorHandler(logger);
        this.#commandPipeline = new CommandPipeline(
            [
                new CalculationCommand(),
                new WarningAnalysisCommand(),
                new PersistenceCommand(this.debouncedSave),
            ],
            this.#errorHandler
        );

        // 초기화 에러 처리
        void this.initialize().catch((error) => {
            logger.error('Controller initialization failed', 'Controller.constructor', error);
            this.view.showToast('앱 초기화 실패. 페이지를 새로고침해주세요.', 'error');
        });
    }

    /**
     * @description 컨트롤러 초기화 (AppInitializer로 위임)
     */
    async initialize(): Promise<void> {
        this.#eventAbortController = await this.#appInitializer.initialize(
            this.bindControllerEvents.bind(this),
            bindEventListeners
        );
        // fullRender는 초기화 후 호출
        this.fullRender();
    }

    /**
     * @description 이벤트 리스너 정리 (메모리 누수 방지)
     */
    cleanup(): void {
        if (this.#eventAbortController) {
            this.#eventAbortController.abort();
            this.#eventAbortController = null;
            logger.debug('Event listeners cleaned up', 'Controller');
        }
        this.#appInitializer.cleanup();
    }

    /**
     * @description 컨트롤러 이벤트 바인딩 (ControllerEventBinder로 위임)
     */
    bindControllerEvents(): void {
        bindControllerEventsExternal(this);
    }

    // === 렌더링 메서드 ===

    /**
     * @description 전체 렌더링 (Web Worker 사용)
     */
    async fullRender(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        // 로딩 UI 표시
        this.view.showCalculationLoading();

        try {
            await this.applyCalculatedState('full');
        } catch (error) {
            logger.error('Full render failed', 'Controller.fullRender', error);
            this.view.showToast('계산 중 오류가 발생했습니다.', 'error');
        } finally {
            // 로딩 UI 숨김
            this.view.hideCalculationLoading();
        }
    }

    /**
     * @description UI 상태 업데이트 (가상 스크롤 데이터 업데이트) (Web Worker 사용)
     */
    async updateUIState(): Promise<void> {
        try {
            await this.applyCalculatedState('partial');
        } catch (error) {
            logger.error('updateUIState error', 'Controller', error);
        }
    }

    /**
     * @description 계산된 상태를 적용하는 공통 로직 (Command Pattern)
     * @param mode - 'full': 전체 렌더링, 'partial': 부분 업데이트
     */
    private async applyCalculatedState(mode: 'full' | 'partial'): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        // Command Context 생성
        const context: CommandContext = {
            mode,
            activePortfolio,
            view: this.view,
            calculatorWorker: this.#calculatorWorker,
        };

        // Command Pipeline 실행
        // - CalculationCommand: 계산 + 기본 렌더링 + 섹터 분석
        // - WarningAnalysisCommand: 리밸런싱/리스크 경고 (full 모드만)
        // - PersistenceCommand: 상태 저장
        await this.#commandPipeline.execute(context);
    }

    // === 기타 핸들러 ===

    /**
     * @description 자산 배분 템플릿 적용 (Strategy Pattern)
     */
    async handleApplyTemplate(templateName: string): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio || activePortfolio.portfolioData.length === 0) {
            this.view.showToast('적용할 종목이 없습니다.', 'warning');
            return;
        }

        const stocks = activePortfolio.portfolioData;

        // TemplateRegistry에서 템플릿 전략 조회
        const templateRegistry = TemplateRegistry.getInstance();
        const template = templateRegistry.get(templateName);

        if (!template) {
            this.view.showToast('알 수 없는 템플릿입니다.', 'error');
            return;
        }

        // 템플릿 전략 적용
        template.apply(stocks);

        // 저장 및 UI 업데이트
        await this.state.saveActivePortfolio();
        this.fullRender();
        this.view.showToast(`✨ ${templateName} 템플릿이 적용되었습니다!`, 'success');
    }

    /**
     * @description 리밸런싱 허용 오차 변경
     */
    async handleRebalancingToleranceChange(tolerance: number): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        activePortfolio.settings.rebalancingTolerance = tolerance;
        await this.state.saveActivePortfolio();
        this.updateUIState(); // UI 업데이트로 경고 표시 갱신
    }

    /**
     * @description 다크 모드 토글
     */
    handleToggleDarkMode(): void {
        this.#appInitializer.getDarkModeManager().toggleDarkMode();
        this.view.destroyChart();
        this.fullRender(); // async but we don't await
    }

    /**
     * @description 페이지 종료 시 저장
     */
    handleSaveDataOnExit(): void {
        logger.debug('Page unloading. Relaying on debounced save.', 'Controller');
    }

    /**
     * @description KRW로 투자 금액 가져오기
     * @returns Decimal
     */
    getInvestmentAmountInKRW(): Decimal {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return DECIMAL_ZERO;

        const { currentCurrency } = activePortfolio.settings;
        const { additionalAmountInput, additionalAmountUSDInput, exchangeRateInput } =
            this.view.dom;

        if (
            !isInputElement(additionalAmountInput) ||
            !isInputElement(additionalAmountUSDInput) ||
            !isInputElement(exchangeRateInput)
        ) {
            return DECIMAL_ZERO;
        }

        const amountKRWStr = additionalAmountInput.value || '0';
        const amountUSDStr = additionalAmountUSDInput.value || '0';
        const exchangeRateStr = exchangeRateInput.value || String(CONFIG.DEFAULT_EXCHANGE_RATE);

        try {
            const amountKRW = new Decimal(amountKRWStr);
            const amountUSD = new Decimal(amountUSDStr);
            const exchangeRate = new Decimal(exchangeRateStr);

            if (currentCurrency === 'krw') {
                return amountKRW.isNegative() ? DECIMAL_ZERO : amountKRW;
            } else {
                if (exchangeRate.isZero() || exchangeRate.isNegative()) return DECIMAL_ZERO;
                const calculatedKRW = amountUSD.times(exchangeRate);
                return calculatedKRW.isNegative() ? DECIMAL_ZERO : calculatedKRW;
            }
        } catch (error) {
            logger.error('Error parsing investment amount', 'Controller', error);
            return DECIMAL_ZERO;
        }
    }

    // ===== Proxy methods for testing compatibility =====
    async handleCalculate(): Promise<void> {
        return this.calculationManager.handleCalculate();
    }

    async handleFetchAllPrices(): Promise<void> {
        return this.calculationManager.handleFetchAllPrices();
    }

    async handleTransactionListClick(stockId: string, txId: string): Promise<void> {
        return this.transactionManager.handleTransactionListClick(stockId, txId);
    }
}
