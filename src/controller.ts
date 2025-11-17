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
import { getKeyboardShortcutService } from './services/KeyboardShortcutService';
import { getCommandHistoryService } from './services/CommandHistoryService';

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
    #keyboardShortcutService = getKeyboardShortcutService();
    #commandHistoryService = getCommandHistoryService();

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
        // 키보드 단축키 설정
        this.setupKeyboardShortcuts();
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
        this.#keyboardShortcutService.stop();
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

    // ===== 키보드 단축키 설정 =====

    /**
     * @description 키보드 단축키 설정 및 등록
     */
    setupKeyboardShortcuts(): void {
        this.#keyboardShortcutService.registerMany([
            // Ctrl+Enter: 빠른 계산
            {
                shortcut: { key: 'Enter', ctrl: true },
                handler: () => {
                    logger.debug('Keyboard shortcut: Ctrl+Enter (Calculate)', 'Controller');
                    this.view.announce('계산 시작', 'polite');
                    this.calculationManager.handleCalculate();
                },
                description: '빠른 계산',
            },

            // Ctrl+1~9: 포트폴리오 전환
            {
                shortcut: { key: '1', ctrl: true },
                handler: () => this.#switchToPortfolioByIndex(0),
                description: '첫 번째 포트폴리오로 전환',
            },
            {
                shortcut: { key: '2', ctrl: true },
                handler: () => this.#switchToPortfolioByIndex(1),
                description: '두 번째 포트폴리오로 전환',
            },
            {
                shortcut: { key: '3', ctrl: true },
                handler: () => this.#switchToPortfolioByIndex(2),
                description: '세 번째 포트폴리오로 전환',
            },
            {
                shortcut: { key: '4', ctrl: true },
                handler: () => this.#switchToPortfolioByIndex(3),
                description: '네 번째 포트폴리오로 전환',
            },
            {
                shortcut: { key: '5', ctrl: true },
                handler: () => this.#switchToPortfolioByIndex(4),
                description: '다섯 번째 포트폴리오로 전환',
            },
            {
                shortcut: { key: '6', ctrl: true },
                handler: () => this.#switchToPortfolioByIndex(5),
                description: '여섯 번째 포트폴리오로 전환',
            },
            {
                shortcut: { key: '7', ctrl: true },
                handler: () => this.#switchToPortfolioByIndex(6),
                description: '일곱 번째 포트폴리오로 전환',
            },
            {
                shortcut: { key: '8', ctrl: true },
                handler: () => this.#switchToPortfolioByIndex(7),
                description: '여덟 번째 포트폴리오로 전환',
            },
            {
                shortcut: { key: '9', ctrl: true },
                handler: () => this.#switchToPortfolioByIndex(8),
                description: '아홉 번째 포트폴리오로 전환',
            },

            // ESC: 모달 닫기
            {
                shortcut: { key: 'Escape' },
                handler: () => {
                    logger.debug('Keyboard shortcut: ESC (Close Modal)', 'Controller');
                    this.view.closeTransactionModal();
                },
                description: '모달 닫기',
            },

            // Ctrl+S: 데이터 저장 (브라우저 저장 방지 override)
            {
                shortcut: { key: 's', ctrl: true },
                handler: () => {
                    logger.debug('Keyboard shortcut: Ctrl+S (Save)', 'Controller');
                    this.view.announce('데이터 저장됨', 'polite');
                    this.state.saveActivePortfolio();
                },
                description: '데이터 저장',
            },

            // Ctrl+N: 새 종목 추가
            {
                shortcut: { key: 'n', ctrl: true },
                handler: async () => {
                    logger.debug('Keyboard shortcut: Ctrl+N (New Stock)', 'Controller');
                    const result = await this.stockManager.handleAddNewStock();
                    if (result.needsFullRender) {
                        await this.fullRender();
                    }
                    if (result.stockId) {
                        this.view.focusOnNewStock(result.stockId);
                    }
                },
                description: '새 종목 추가',
            },

            // Ctrl+E: 데이터 내보내기
            {
                shortcut: { key: 'e', ctrl: true },
                handler: () => {
                    logger.debug('Keyboard shortcut: Ctrl+E (Export)', 'Controller');
                    this.dataManager.handleExportData();
                },
                description: '데이터 내보내기',
            },

            // Ctrl+Z: 실행 취소 (Undo)
            {
                shortcut: { key: 'z', ctrl: true },
                handler: () => {
                    logger.debug('Keyboard shortcut: Ctrl+Z (Undo)', 'Controller');
                    this.handleUndo();
                },
                description: '실행 취소',
            },

            // Ctrl+Y or Ctrl+Shift+Z: 다시 실행 (Redo)
            {
                shortcut: { key: 'y', ctrl: true },
                handler: () => {
                    logger.debug('Keyboard shortcut: Ctrl+Y (Redo)', 'Controller');
                    this.handleRedo();
                },
                description: '다시 실행',
            },
            {
                shortcut: { key: 'z', ctrl: true, shift: true },
                handler: () => {
                    logger.debug('Keyboard shortcut: Ctrl+Shift+Z (Redo)', 'Controller');
                    this.handleRedo();
                },
                description: '다시 실행 (대체)',
            },
        ]);

        // 키보드 단축키 서비스 시작
        this.#keyboardShortcutService.start();

        logger.info('Keyboard shortcuts initialized', 'Controller');
    }

    /**
     * @description 인덱스로 포트폴리오 전환
     */
    #switchToPortfolioByIndex(index: number): void {
        const portfolios = this.state.getAllPortfolios();
        if (index < 0 || index >= portfolios.length) {
            logger.debug(`Portfolio index ${index} out of range`, 'Controller');
            return;
        }

        const targetPortfolio = portfolios[index];
        logger.debug(`Keyboard shortcut: Ctrl+${index + 1} (Switch to ${targetPortfolio.name})`, 'Controller');
        this.view.announce(`포트폴리오 전환: ${targetPortfolio.name}`, 'polite');

        this.portfolioManager.handleSwitchPortfolio(targetPortfolio.id).then(() => {
            this.fullRender();
        });
    }

    // ===== Undo/Redo 기능 =====

    /**
     * @description 실행 취소 (Undo)
     */
    handleUndo(): void {
        try {
            const success = this.#commandHistoryService.undo();
            if (success) {
                const commandName = this.#commandHistoryService.getLastRedoCommandName();
                this.view.announce(
                    commandName ? `${commandName} 취소됨` : '작업이 취소되었습니다',
                    'polite'
                );
                this.view.showToast('작업이 취소되었습니다', 'info');
                this.fullRender();
            } else {
                this.view.announce('취소할 작업이 없습니다', 'polite');
                this.view.showToast('취소할 작업이 없습니다', 'info');
            }
        } catch (error) {
            logger.error('Undo failed', 'Controller.handleUndo', error);
            this.view.showToast('실행 취소 실패', 'error');
        }
    }

    /**
     * @description 다시 실행 (Redo)
     */
    handleRedo(): void {
        try {
            const success = this.#commandHistoryService.redo();
            if (success) {
                const commandName = this.#commandHistoryService.getLastUndoCommandName();
                this.view.announce(
                    commandName ? `${commandName} 다시 실행됨` : '작업이 다시 실행되었습니다',
                    'polite'
                );
                this.view.showToast('작업이 다시 실행되었습니다', 'info');
                this.fullRender();
            } else {
                this.view.announce('다시 실행할 작업이 없습니다', 'polite');
                this.view.showToast('다시 실행할 작업이 없습니다', 'info');
            }
        } catch (error) {
            logger.error('Redo failed', 'Controller.handleRedo', error);
            this.view.showToast('다시 실행 실패', 'error');
        }
    }

    /**
     * @description CommandHistoryService getter (매니저들이 접근할 수 있도록)
     */
    get commandHistoryService() {
        return this.#commandHistoryService;
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
