// src/controller.ts (리팩토링: 모듈화)
import { PortfolioState } from './state';
import { PortfolioView } from './view';
import { Calculator } from './calculator';
import { debounce, getRatioSum } from './utils';
import { CONFIG, DECIMAL_ZERO } from './constants';
import { ErrorService } from './errorService';
import { generateSectorAnalysisHTML } from './templates';
import Decimal from 'decimal.js';
import { bindEventListeners } from './eventBinder';

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

            const { exchangeRateInput, portfolioExchangeRateInput } = this.view.dom;
            if (exchangeRateInput instanceof HTMLInputElement) {
                exchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
            }
            if (portfolioExchangeRateInput instanceof HTMLInputElement) {
                portfolioExchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
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
     * @description 전체 렌더링
     */
    fullRender(): void {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const calculatedState = Calculator.calculatePortfolioState({
            portfolioData: activePortfolio.portfolioData,
            exchangeRate: activePortfolio.settings.exchangeRate,
            currentCurrency: activePortfolio.settings.currentCurrency
        });

        this.view.renderTable(
            calculatedState.portfolioData,
            activePortfolio.settings.currentCurrency,
            activePortfolio.settings.mainMode
        );

        const ratioSum = getRatioSum(activePortfolio.portfolioData);
        this.view.updateRatioSum(ratioSum.toNumber());

        const sectorData = Calculator.calculateSectorAnalysis(
            calculatedState.portfolioData,
            activePortfolio.settings.currentCurrency
        );
        this.view.displaySectorAnalysis(generateSectorAnalysisHTML(sectorData, activePortfolio.settings.currentCurrency));

        this.view.updateMainModeUI(activePortfolio.settings.mainMode);

        activePortfolio.portfolioData = calculatedState.portfolioData;
        this.debouncedSave();
    }

    /**
     * @description UI 상태 업데이트 (가상 스크롤 데이터 업데이트)
     */
    updateUIState(): void {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const calculatedState = Calculator.calculatePortfolioState({
            portfolioData: activePortfolio.portfolioData,
            exchangeRate: activePortfolio.settings.exchangeRate,
            currentCurrency: activePortfolio.settings.currentCurrency
        });

        this.view.updateVirtualTableData(calculatedState.portfolioData);

        const ratioSum = getRatioSum(activePortfolio.portfolioData);
        this.view.updateRatioSum(ratioSum.toNumber());

        const sectorData = Calculator.calculateSectorAnalysis(
            calculatedState.portfolioData,
            activePortfolio.settings.currentCurrency
        );
        this.view.displaySectorAnalysis(generateSectorAnalysisHTML(sectorData, activePortfolio.settings.currentCurrency));

        activePortfolio.portfolioData = calculatedState.portfolioData;
        this.debouncedSave();
    }

    // === 기타 핸들러 ===

    /**
     * @description 다크 모드 토글
     */
    handleToggleDarkMode(): void {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem(CONFIG.DARK_MODE_KEY, isDarkMode ? 'true' : 'false');
        this.view.destroyChart();
        this.fullRender();
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
}