// src/controller.ts
import { PortfolioState } from './state';
import { PortfolioView } from './view';
import { Calculator } from './calculator';
import { DataStore } from './dataStore';
import { debounce, getRatioSum, isInputElement } from './utils';
import { CONFIG, DECIMAL_ZERO, THRESHOLDS } from './constants';
import { ErrorService } from './errorService';
import { generateSectorAnalysisHTML } from './templates';
import { TemplateRegistry } from './templates/TemplateRegistry';
import Decimal from 'decimal.js';
import { bindEventListeners } from './eventBinder';
import type { PortfolioSnapshot } from './types';

import { getCalculatorWorkerService } from './services/CalculatorWorkerService';
import { ChartLoaderService } from './services/ChartLoaderService';
import { logger } from './services/Logger';

// 분리된 매니저 모듈들
import { PortfolioManager } from './controller/PortfolioManager';
import { StockManager } from './controller/StockManager';
import { TransactionManager } from './controller/TransactionManager';
import { CalculationManager } from './controller/CalculationManager';
import { DataManager } from './controller/DataManager';
import { AppInitializer } from './controller/AppInitializer';

/**
 * @class PortfolioController
 * @description 포트폴리오 컨트롤러
 */
export class PortfolioController {
    state: PortfolioState;
    view: PortfolioView;
    debouncedSave: () => void;

    // 분리된 매니저들
    private portfolioManager: PortfolioManager;
    private stockManager: StockManager;
    private transactionManager: TransactionManager;
    private calculationManager: CalculationManager;
    private dataManager: DataManager;
    private appInitializer: AppInitializer;

    private calculatorWorker = getCalculatorWorkerService();

    #lastCalculationKey: string | null = null;
    #eventAbortController: AbortController | null = null;

    constructor(state: PortfolioState, view: PortfolioView) {
        this.state = state;
        this.view = view;
        this.debouncedSave = debounce(() => this.state.saveActivePortfolio(), 500);

        // 매니저 인스턴스 생성
        this.portfolioManager = new PortfolioManager(this.state, this.view);
        this.stockManager = new StockManager(this.state, this.view, this.debouncedSave);
        this.transactionManager = new TransactionManager(this.state, this.view);
        this.calculationManager = new CalculationManager(
            this.state,
            this.view,
            this.debouncedSave,
            this.getInvestmentAmountInKRW.bind(this)
        );
        this.dataManager = new DataManager(this.state, this.view);
        this.appInitializer = new AppInitializer(this.state, this.view);

        // 초기화 에러 처리
        void this.initialize().catch((error) => {
            ErrorService.handle(error as Error, 'Controller initialization failed');
            this.view.showToast('앱 초기화 실패. 페이지를 새로고침해주세요.', 'error');
        });
    }

    /**
     * @description 컨트롤러 초기화 (AppInitializer로 위임)
     */
    async initialize(): Promise<void> {
        this.#eventAbortController = await this.appInitializer.initialize(
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
        this.appInitializer.cleanup();
    }

    /**
     * @description 컨트롤러 이벤트 바인딩
     */
    bindControllerEvents(): void {
        // 포트폴리오 관리
        this.view.on('newPortfolioClicked', async () => {
            await this.portfolioManager.handleNewPortfolio();
            this.fullRender();
        });
        this.view.on('renamePortfolioClicked', () => this.portfolioManager.handleRenamePortfolio());
        this.view.on('deletePortfolioClicked', async () => {
            await this.portfolioManager.handleDeletePortfolio();
        });
        this.view.on('portfolioSwitched', async (data) => {
            await this.portfolioManager.handleSwitchPortfolio(data.newId);
            this.fullRender();
        });

        // 주식 관리
        this.view.on('addNewStockClicked', async () => {
            const result = await this.stockManager.handleAddNewStock();
            if (result.needsFullRender) {
                this.fullRender();
                if (result.stockId) this.view.focusOnNewStock(result.stockId);
            }
        });
        this.view.on('normalizeRatiosClicked', () =>
            this.calculationManager.handleNormalizeRatios()
        );
        this.view.on('applyTemplateClicked', (data) => this.handleApplyTemplate(data.template));
        this.view.on('fetchAllPricesClicked', async () => {
            const result = await this.calculationManager.handleFetchAllPrices();
            if (result.needsUIUpdate) this.updateUIState();
        });

        // 데이터 관리
        this.view.on('resetDataClicked', async () => {
            const result = await this.dataManager.handleResetData();
            if (result.needsFullRender) this.fullRender();
        });
        this.view.on('exportDataClicked', () => this.dataManager.handleExportData());
        this.view.on('importDataClicked', () => this.dataManager.handleImportData());
        this.view.on('exportTransactionsCSVClicked', () =>
            this.dataManager.handleExportTransactionsCSV()
        );
        this.view.on('fileSelected', async (e) => {
            const result = await this.dataManager.handleFileSelected(e);
            if (result.needsUISetup) this.setupInitialUI();
        });

        // 테이블 상호작용
        this.view.on('portfolioBodyChanged', (e) => this.stockManager.handlePortfolioBodyChange(e));
        this.view.on('portfolioBodyClicked', (e) => {
            const result = this.stockManager.handlePortfolioBodyClick(e);
            if (result.action === 'manage' && result.stockId) {
                this.transactionManager.openTransactionModalByStockId(result.stockId);
            } else if (result.action === 'delete' && result.stockId) {
                this.stockManager.handleDeleteStock(result.stockId).then((deleteResult) => {
                    if (deleteResult.needsFullRender) this.fullRender();
                });
            }
        });
        this.view.on('manageStockClicked', (data) =>
            this.transactionManager.openTransactionModalByStockId(data.stockId)
        );
        this.view.on('deleteStockShortcut', async (data) => {
            const result = await this.stockManager.handleDeleteStock(data.stockId);
            if (result.needsFullRender) this.fullRender();
        });

        // 계산 및 통화
        this.view.on('calculateClicked', () => this.calculationManager.handleCalculate());
        this.view.on('showPerformanceHistoryClicked', () => this.handleShowPerformanceHistory());
        this.view.on('showSnapshotListClicked', () => this.handleShowSnapshotList());
        this.view.on('mainModeChanged', async (data) => {
            const result = await this.calculationManager.handleMainModeChange(data.mode);
            if (result.needsFullRender) this.fullRender();
        });
        this.view.on('currencyModeChanged', async (data) => {
            const result = await this.calculationManager.handleCurrencyModeChange(data.currency);
            if (result.needsFullRender) this.fullRender();
        });
        this.view.on('currencyConversion', (data) =>
            this.calculationManager.handleCurrencyConversion(data.source)
        );
        this.view.on('portfolioExchangeRateChanged', (data) =>
            this.calculationManager.handlePortfolioExchangeRateChange(data.rate)
        );
        this.view.on('rebalancingToleranceChanged', (data) =>
            this.handleRebalancingToleranceChange(data.tolerance)
        );

        // 모달 상호작용
        this.view.on('closeTransactionModalClicked', () => this.view.closeTransactionModal());
        this.view.on('newTransactionSubmitted', async (e) => {
            const result = await this.transactionManager.handleAddNewTransaction(e);
            if (result.needsFullRender) this.fullRender();
        });
        this.view.on('transactionDeleteClicked', async (data) => {
            const result = await this.transactionManager.handleTransactionListClick(
                data.stockId,
                data.txId
            );
            if (result.needsUIUpdate) this.updateUIState();
        });

        // 기타
        this.view.on('darkModeToggleClicked', () => this.handleToggleDarkMode());
        this.view.on('pageUnloading', () => this.handleSaveDataOnExit());
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
            const calculatedState = await this.calculatorWorker.calculatePortfolioState({
                portfolioData: activePortfolio.portfolioData,
                exchangeRate: activePortfolio.settings.exchangeRate,
                currentCurrency: activePortfolio.settings.currentCurrency,
            });

            this.view.renderTable(
                calculatedState.portfolioData,
                activePortfolio.settings.currentCurrency,
                activePortfolio.settings.mainMode
            );

            const ratioSum = getRatioSum(activePortfolio.portfolioData);
            this.view.updateRatioSum(ratioSum.toNumber());

            const sectorData = await this.calculatorWorker.calculateSectorAnalysis(
                calculatedState.portfolioData,
                activePortfolio.settings.currentCurrency
            );
            this.view.displaySectorAnalysis(
                generateSectorAnalysisHTML(sectorData, activePortfolio.settings.currentCurrency)
            );

            // 리밸런싱 경고 확인 및 표시
            this.checkRebalancingNeeds(
                calculatedState.portfolioData,
                calculatedState.currentTotal,
                activePortfolio.settings.rebalancingTolerance
            );

            // 리스크 분석 (Phase 4.3)
            this.checkRiskWarnings(
                calculatedState.portfolioData,
                calculatedState.currentTotal,
                sectorData
            );

            this.view.updateMainModeUI(activePortfolio.settings.mainMode);

            activePortfolio.portfolioData = calculatedState.portfolioData;
            this.debouncedSave();
        } catch (error) {
            ErrorService.handle(error as Error, 'Controller.fullRender');
            this.view.showToast('계산 중 오류가 발생했습니다.', 'error');
            // Fallback은 CalculatorWorkerService에서 자동으로 처리됨
        } finally {
            // 로딩 UI 숨김
            this.view.hideCalculationLoading();
        }
    }

    /**
     * @description UI 상태 업데이트 (가상 스크롤 데이터 업데이트) (Web Worker 사용)
     */
    async updateUIState(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        try {
            const calculatedState = await this.calculatorWorker.calculatePortfolioState({
                portfolioData: activePortfolio.portfolioData,
                exchangeRate: activePortfolio.settings.exchangeRate,
                currentCurrency: activePortfolio.settings.currentCurrency,
            });

            this.view.updateVirtualTableData(calculatedState.portfolioData);

            const ratioSum = getRatioSum(activePortfolio.portfolioData);
            this.view.updateRatioSum(ratioSum.toNumber());

            const sectorData = await this.calculatorWorker.calculateSectorAnalysis(
                calculatedState.portfolioData,
                activePortfolio.settings.currentCurrency
            );
            this.view.displaySectorAnalysis(
                generateSectorAnalysisHTML(sectorData, activePortfolio.settings.currentCurrency)
            );

            activePortfolio.portfolioData = calculatedState.portfolioData;
            this.debouncedSave();
        } catch (error) {
            logger.error('updateUIState error', 'Controller', error);
            // Fallback은 CalculatorWorkerService에서 자동으로 처리됨
        }
    }

    // === 기타 핸들러 ===

    /**
     * @description 리밸런싱 필요 여부 확인
     */
    checkRebalancingNeeds(
        portfolioData: import('./types').CalculatedStock[],
        currentTotal: Decimal,
        rebalancingTolerance?: number
    ): void {
        const tolerance = rebalancingTolerance ?? 5;
        if (tolerance <= 0) return; // 허용 오차가 0이면 체크 안 함

        const currentTotalDec = new Decimal(currentTotal);
        if (currentTotalDec.isZero()) return;

        const stocksNeedingRebalancing: string[] = [];

        for (const stock of portfolioData) {
            const currentAmount = stock.calculated?.currentAmount;
            if (!currentAmount) continue;

            const currentAmountDec = new Decimal(currentAmount);
            const currentRatio = currentAmountDec.div(currentTotalDec).times(100);
            const targetRatio = new Decimal(stock.targetRatio ?? 0);
            const diff = currentRatio.minus(targetRatio).abs();

            if (diff.greaterThan(tolerance)) {
                stocksNeedingRebalancing.push(
                    `${stock.name}: 현재 ${currentRatio.toFixed(1)}% (목표 ${targetRatio.toFixed(1)}%)`
                );
            }
        }

        // 경고 메시지 표시
        if (stocksNeedingRebalancing.length > 0) {
            const message = `🔔 리밸런싱이 필요한 종목: ${stocksNeedingRebalancing.join(', ')}`;
            this.view.showToast(message, 'info');
        }
    }

    /**
     * @description 자산 배분 템플릿 적용 (Strategy Pattern)
     */
    handleApplyTemplate(templateName: string): void {
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
        this.state.saveActivePortfolio();
        this.fullRender();
        this.view.showToast(`✨ ${templateName} 템플릿이 적용되었습니다!`, 'success');
    }

    /**
     * @description 리스크 경고 확인
     */
    checkRiskWarnings(
        portfolioData: import('./types').CalculatedStock[],
        currentTotal: Decimal,
        sectorData: import('./types').SectorData[]
    ): void {
        const warnings: string[] = [];
        const currentTotalDec = new Decimal(currentTotal);

        if (currentTotalDec.isZero()) return;

        // 단일 종목 비중 경고
        for (const stock of portfolioData) {
            const currentAmount = new Decimal(stock.calculated?.currentAmount || 0);
            const ratio = currentAmount.div(currentTotalDec).times(100);

            if (ratio.greaterThan(THRESHOLDS.SINGLE_STOCK_WARNING)) {
                warnings.push(`⚠️ ${stock.name}: ${ratio.toFixed(1)}% (단일 종목 비중 높음)`);
            }
        }

        // 섹터 집중도 경고
        for (const sector of sectorData) {
            const percentage = new Decimal(sector.percentage || 0);

            if (percentage.greaterThan(THRESHOLDS.SECTOR_CONCENTRATION_WARNING)) {
                warnings.push(
                    `⚠️ ${sector.sector} 섹터: ${percentage.toFixed(1)}% (섹터 집중도 높음)`
                );
            }
        }

        // 경고 메시지 표시
        if (warnings.length > 0) {
            const message = `🔍 리스크 경고: ${warnings.join(', ')}`;
            this.view.showToast(message, 'warning');
        }
    }

    /**
     * @description 성과 히스토리 표시
     */
    async handleShowPerformanceHistory(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        try {
            const snapshots = await DataStore.getSnapshotsForPortfolio(activePortfolio.id);

            if (snapshots.length === 0) {
                this.view.showToast(
                    '성과 히스토리 데이터가 없습니다. 계산을 실행하여 데이터를 생성하세요.',
                    'info'
                );
                return;
            }

            this.view.resultsRenderer.showPerformanceHistoryView(true);

            const ChartClass = await ChartLoaderService.getChart();
            await this.view.displayPerformanceHistory(
                ChartClass,
                snapshots,
                activePortfolio.settings.currentCurrency
            );

            this.view.showToast(`${snapshots.length}개의 스냅샷을 불러왔습니다.`, 'success');
        } catch (error) {
            logger.error('Failed to display performance history', 'Controller', error);
            this.view.showToast('성과 히스토리를 불러오는데 실패했습니다.', 'error');
        }
    }

    /**
     * @description 스냅샷 목록 표시
     */
    async handleShowSnapshotList(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        try {
            const snapshots = await DataStore.getSnapshotsForPortfolio(activePortfolio.id);

            if (snapshots.length === 0) {
                this.view.showToast(
                    '저장된 스냅샷이 없습니다. 계산을 실행하여 데이터를 생성하세요.',
                    'info'
                );
                return;
            }

            this.view.resultsRenderer.showSnapshotListView(true);
            this.renderSnapshotList(snapshots, activePortfolio.settings.currentCurrency);

            this.view.showToast(`${snapshots.length}개의 스냅샷을 불러왔습니다.`, 'success');
        } catch (error) {
            logger.error('Failed to display snapshot list', 'Controller', error);
            this.view.showToast('스냅샷 목록을 불러오는데 실패했습니다.', 'error');
        }
    }

    /**
     * @description 스냅샷 목록 렌더링
     */
    private renderSnapshotList(snapshots: PortfolioSnapshot[], currency: 'krw' | 'usd'): void {
        this.view.resultsRenderer.displaySnapshotList(snapshots, currency);
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
        this.appInitializer.getDarkModeManager().toggleDarkMode();
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
        } catch (e) {
            logger.error('Error parsing investment amount', 'Controller', e);
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
