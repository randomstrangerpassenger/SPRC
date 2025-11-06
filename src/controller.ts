// src/controller.ts (리팩토링: 모듈화)
import { PortfolioState } from './state';
import { PortfolioView } from './view';
import { Calculator } from './calculator';
import { DataStore } from './dataStore';
import { debounce, getRatioSum } from './utils';
import { CONFIG, DECIMAL_ZERO } from './constants';
import { ErrorService } from './errorService';
import { generateSectorAnalysisHTML } from './templates';
import Decimal from 'decimal.js';
import { bindEventListeners } from './eventBinder';

// ===== [Phase 2.2 Web Worker 통합] =====
import { getCalculatorWorkerService } from './services/CalculatorWorkerService';
// ===== [Phase 2.2 Web Worker 통합 끝] =====

// 분리된 매니저 모듈들
import { PortfolioManager } from './controller/PortfolioManager';
import { StockManager } from './controller/StockManager';
import { TransactionManager } from './controller/TransactionManager';
import { CalculationManager } from './controller/CalculationManager';
import { DataManager } from './controller/DataManager';

/**
 * @class PortfolioController
 * @description 포트폴리오 컨트롤러 (리팩토링: 모듈화)
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

    // ===== [Phase 2.2 Web Worker 통합] =====
    private calculatorWorker = getCalculatorWorkerService();
    // ===== [Phase 2.2 Web Worker 통합 끝] =====

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

        this.initialize();
    }

    /**
     * @description 컨트롤러 초기화
     */
    async initialize(): Promise<void> {
        await this.state.ensureInitialized();
        this.view.cacheDomElements();
        ErrorService.setViewInstance(this.view);
        this.setupInitialUI();
        this.bindControllerEvents();
        this.#eventAbortController = bindEventListeners(this.view);
    }

    /**
     * @description 이벤트 리스너 정리 (메모리 누수 방지)
     */
    cleanup(): void {
        if (this.#eventAbortController) {
            this.#eventAbortController.abort();
            this.#eventAbortController = null;
            console.log('[Controller] Event listeners cleaned up');
        }
    }

    /**
     * @description 초기 UI 설정
     */
    setupInitialUI(): void {
        const storedDarkMode = localStorage.getItem(CONFIG.DARK_MODE_KEY);
        if (storedDarkMode === 'true') {
            document.body.classList.add('dark-mode');
        } else if (storedDarkMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
            localStorage.setItem(CONFIG.DARK_MODE_KEY, 'true');
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            const storedMode = localStorage.getItem(CONFIG.DARK_MODE_KEY);
            if (storedMode === null) {
                document.body.classList.toggle('dark-mode', e.matches);
            }
        });

        const activePortfolio = this.state.getActivePortfolio();
        if (activePortfolio) {
            this.view.renderPortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id);
            this.view.updateCurrencyModeUI(activePortfolio.settings.currentCurrency);
            this.view.updateMainModeUI(activePortfolio.settings.mainMode);

            const { exchangeRateInput, portfolioExchangeRateInput, rebalancingToleranceInput } = this.view.dom;
            if (exchangeRateInput instanceof HTMLInputElement) {
                exchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
            }
            if (portfolioExchangeRateInput instanceof HTMLInputElement) {
                portfolioExchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
            }
            if (rebalancingToleranceInput instanceof HTMLInputElement) {
                rebalancingToleranceInput.value = (activePortfolio.settings.rebalancingTolerance ?? 5).toString();
            }

            this.fullRender();
        }
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
        this.view.on('normalizeRatiosClicked', () => this.calculationManager.handleNormalizeRatios());
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
        this.view.on('manageStockClicked', (data) => this.transactionManager.openTransactionModalByStockId(data.stockId));
        this.view.on('deleteStockShortcut', async (data) => {
            const result = await this.stockManager.handleDeleteStock(data.stockId);
            if (result.needsFullRender) this.fullRender();
        });

        // 계산 및 통화
        this.view.on('calculateClicked', () => this.calculationManager.handleCalculate());
        this.view.on('showPerformanceHistoryClicked', () => this.handleShowPerformanceHistory());
        this.view.on('mainModeChanged', async (data) => {
            const result = await this.calculationManager.handleMainModeChange(data.mode);
            if (result.needsFullRender) this.fullRender();
        });
        this.view.on('currencyModeChanged', async (data) => {
            const result = await this.calculationManager.handleCurrencyModeChange(data.currency);
            if (result.needsFullRender) this.fullRender();
        });
        this.view.on('currencyConversion', (data) => this.calculationManager.handleCurrencyConversion(data.source));
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
            const result = await this.transactionManager.handleTransactionListClick(data.stockId, data.txId);
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

        try {
            // ===== [Phase 2.2 Web Worker 통합] =====
            const calculatedState = await this.calculatorWorker.calculatePortfolioState({
                portfolioData: activePortfolio.portfolioData,
                exchangeRate: activePortfolio.settings.exchangeRate,
                currentCurrency: activePortfolio.settings.currentCurrency
            });
            // ===== [Phase 2.2 Web Worker 통합 끝] =====

            this.view.renderTable(
                calculatedState.portfolioData,
                activePortfolio.settings.currentCurrency,
                activePortfolio.settings.mainMode
            );

            const ratioSum = getRatioSum(activePortfolio.portfolioData);
            this.view.updateRatioSum(ratioSum.toNumber());

            // ===== [Phase 2.2 Web Worker 통합] =====
            const sectorData = await this.calculatorWorker.calculateSectorAnalysis(
                calculatedState.portfolioData,
                activePortfolio.settings.currentCurrency
            );
            // ===== [Phase 2.2 Web Worker 통합 끝] =====
            this.view.displaySectorAnalysis(generateSectorAnalysisHTML(sectorData, activePortfolio.settings.currentCurrency));

            // 리밸런싱 경고 확인 및 표시
            this.checkRebalancingNeeds(calculatedState.portfolioData, calculatedState.currentTotal, activePortfolio.settings.rebalancingTolerance);

            this.view.updateMainModeUI(activePortfolio.settings.mainMode);

            activePortfolio.portfolioData = calculatedState.portfolioData;
            this.debouncedSave();
        } catch (error) {
            console.error('[Controller] fullRender error:', error);
            // Fallback은 CalculatorWorkerService에서 자동으로 처리됨
        }
    }

    /**
     * @description UI 상태 업데이트 (가상 스크롤 데이터 업데이트) (Web Worker 사용)
     */
    async updateUIState(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        try {
            // ===== [Phase 2.2 Web Worker 통합] =====
            const calculatedState = await this.calculatorWorker.calculatePortfolioState({
                portfolioData: activePortfolio.portfolioData,
                exchangeRate: activePortfolio.settings.exchangeRate,
                currentCurrency: activePortfolio.settings.currentCurrency
            });
            // ===== [Phase 2.2 Web Worker 통합 끝] =====

            this.view.updateVirtualTableData(calculatedState.portfolioData);

            const ratioSum = getRatioSum(activePortfolio.portfolioData);
            this.view.updateRatioSum(ratioSum.toNumber());

            // ===== [Phase 2.2 Web Worker 통합] =====
            const sectorData = await this.calculatorWorker.calculateSectorAnalysis(
                calculatedState.portfolioData,
                activePortfolio.settings.currentCurrency
            );
            // ===== [Phase 2.2 Web Worker 통합 끝] =====
            this.view.displaySectorAnalysis(generateSectorAnalysisHTML(sectorData, activePortfolio.settings.currentCurrency));

            activePortfolio.portfolioData = calculatedState.portfolioData;
            this.debouncedSave();
        } catch (error) {
            console.error('[Controller] updateUIState error:', error);
            // Fallback은 CalculatorWorkerService에서 자동으로 처리됨
        }
    }

    // === 기타 핸들러 ===

    /**
     * @description 리밸런싱 필요 여부 확인
     */
    checkRebalancingNeeds(
        portfolioData: any[],
        currentTotal: any,
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
     * @description 성과 히스토리 표시
     */
    async handleShowPerformanceHistory(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        try {
            const snapshots = await DataStore.getSnapshotsForPortfolio(activePortfolio.id);

            if (snapshots.length === 0) {
                this.view.showToast('성과 히스토리 데이터가 없습니다. 계산을 실행하여 데이터를 생성하세요.', 'info');
                return;
            }

            const ChartClass = (await import('chart.js/auto')).default;
            await this.view.displayPerformanceHistory(
                ChartClass,
                snapshots,
                activePortfolio.settings.currentCurrency
            );

            this.view.showToast(`${snapshots.length}개의 스냅샷을 불러왔습니다.`, 'success');
        } catch (error) {
            console.error('[Controller] Failed to display performance history:', error);
            this.view.showToast('성과 히스토리를 불러오는데 실패했습니다.', 'error');
        }
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
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem(CONFIG.DARK_MODE_KEY, isDarkMode ? 'true' : 'false');
        this.view.destroyChart();
        this.fullRender(); // async but we don't await
    }

    /**
     * @description 페이지 종료 시 저장
     */
    handleSaveDataOnExit(): void {
        console.log('Page unloading. Relaying on debounced save.');
    }

    /**
     * @description KRW로 투자 금액 가져오기
     * @returns Decimal
     */
    getInvestmentAmountInKRW(): Decimal {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return DECIMAL_ZERO;

        const { currentCurrency } = activePortfolio.settings;
        const { additionalAmountInput, additionalAmountUSDInput, exchangeRateInput } = this.view.dom;

        if (
            !(additionalAmountInput instanceof HTMLInputElement) ||
            !(additionalAmountUSDInput instanceof HTMLInputElement) ||
            !(exchangeRateInput instanceof HTMLInputElement)
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
            console.error('Error parsing investment amount:', e);
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