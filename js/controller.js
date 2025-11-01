// js/controller.js (async/await + DOMPurify 적용)
// @ts-check
import { PortfolioState } from './state.js';
import { PortfolioView } from './view.js';
import { Calculator } from './calculator.js';
import { Validator } from './validator.js';
import { debounce, formatCurrency, getRatioSum } from './utils.js';
import { CONFIG } from './constants.js';
import { ErrorService, ValidationError } from './errorService.js';
import { t } from './i18n.js';
import { generateSectorAnalysisHTML, generateAddModeResultsHTML, generateSellModeResultsHTML } from './templates.js';
import Decimal from 'decimal.js';
import { apiService } from './apiService.js';
import { AddRebalanceStrategy, SellRebalanceStrategy } from './calculationStrategies.js';
import DOMPurify from 'dompurify'; // ▼▼▼ [신규] DOMPurify 임포트 ▼▼▼

// ▼▼▼ [추가] eventBinder.js 임포트 ▼▼▼
import { bindEventListeners } from './eventBinder.js';
// ▲▲▲ [추가] ▲▲▲

/** @typedef {import('./types.js').CalculatedStock} CalculatedStock */
/** @typedef {import('./types.js').Portfolio} Portfolio */
/** @typedef {import('./types.js').ValidationErrorDetail} ValidationErrorDetail */

export class PortfolioController {
    /** @type {PortfolioState} */
    state;
    /** @type {PortfolioView} */
    view;
    /** @type {Function} */
    debouncedSave;
    /** @type {string | null} */
    #lastCalculationKey = null;

    /**
     * @param {PortfolioState} state
     * @param {PortfolioView} view
     */
    constructor(state, view) {
        this.state = state;
        this.view = view;
        this.debouncedSave = debounce(() => this.state.saveActivePortfolio(), 500);
        this.initialize();
    }

    async initialize() {
        await this.state.ensureInitialized();
        this.view.cacheDomElements();
        this.setupInitialUI();
        this.bindControllerEvents();

        // ▼▼▼ [추가] 실제 DOM 이벤트 바인딩 호출 ▼▼▼
        bindEventListeners(this.view);
        // ▲▲▲ [추가] ▲▲▲
    }

    setupInitialUI() {
        if (localStorage.getItem(CONFIG.DARK_MODE_KEY) === 'true') {
            document.body.classList.add('dark-mode');
        }

        const activePortfolio = this.state.getActivePortfolio();
        if (activePortfolio) {
            this.view.renderPortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id);
            this.view.updateCurrencyModeUI(activePortfolio.settings.currentCurrency);
            this.view.updateMainModeUI(activePortfolio.settings.mainMode);

            const { exchangeRateInput } = this.view.dom;
            if (exchangeRateInput instanceof HTMLInputElement) {
                exchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
            }

            this.fullRender();
        }
    }

    bindControllerEvents() {
        // Pub/Sub 패턴: View가 발행(emit)한 이벤트를 Controller가 구독(on)합니다.
        
        // 포트폴리오 관리
        this.view.on('newPortfolioClicked', () => this.handleNewPortfolio());
        this.view.on('renamePortfolioClicked', () => this.handleRenamePortfolio());
        this.view.on('deletePortfolioClicked', () => this.handleDeletePortfolio());
        this.view.on('portfolioSwitched', (data) => this.handleSwitchPortfolio(data.newId));

        // 포트폴리오 설정
        this.view.on('addNewStockClicked', () => this.handleAddNewStock());
        this.view.on('resetDataClicked', () => this.handleResetData());
        this.view.on('normalizeRatiosClicked', () => this.handleNormalizeRatios());
        this.view.on('fetchAllPricesClicked', () => this.handleFetchAllPrices());

        // 데이터 관리
        this.view.on('exportDataClicked', () => this.handleExportData());
        this.view.on('importDataClicked', () => this.handleImportData());
        this.view.on('fileSelected', (e) => this.handleFileSelected(e));

        // 테이블 상호작용
        this.view.on('portfolioBodyChanged', (e) => this.handlePortfolioBodyChange(e, null));
        this.view.on('portfolioBodyClicked', (e) => this.handlePortfolioBodyClick(e));
        this.view.on('manageStockClicked', (data) => this.openTransactionModalByStockId(data.stockId));
        this.view.on('deleteStockShortcut', (data) => this.handleDeleteStock(data.stockId));


        // 계산 및 통화
        this.view.on('calculateClicked', () => this.handleCalculate());
        this.view.on('mainModeChanged', (data) => this.handleMainModeChange(data.mode));
        this.view.on('currencyModeChanged', (data) => this.handleCurrencyModeChange(data.currency));
        this.view.on('currencyConversion', (data) => this.handleCurrencyConversion(data.source));

        // 모달 상호작용
        this.view.on('closeTransactionModalClicked', () => this.view.closeTransactionModal());
        this.view.on('newTransactionSubmitted', (e) => this.handleAddNewTransaction(e));
        this.view.on('transactionDeleteClicked', (data) => this.handleTransactionListClick(data.stockId, data.txId));
        
        // 기타
        this.view.on('darkModeToggleClicked', () => this.handleToggleDarkMode());
        this.view.on('pageUnloading', () => this.handleSaveDataOnExit());
    }

    // --- UI 렌더링 ---

    fullRender() {
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

        const sectorData = Calculator.calculateSectorAnalysis(calculatedState.portfolioData);
        this.view.displaySectorAnalysis(generateSectorAnalysisHTML(sectorData, activePortfolio.settings.currentCurrency));

        this.view.updateMainModeUI(activePortfolio.settings.mainMode);

        activePortfolio.portfolioData = calculatedState.portfolioData;
        this.debouncedSave();
    }

    updateUIState() {
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

        const sectorData = Calculator.calculateSectorAnalysis(calculatedState.portfolioData);
        this.view.displaySectorAnalysis(generateSectorAnalysisHTML(sectorData, activePortfolio.settings.currentCurrency));

        activePortfolio.portfolioData = calculatedState.portfolioData;
        this.debouncedSave();
    }

    // --- 포트폴리오 관리 핸들러 ---
    async handleNewPortfolio() {
        let name = await this.view.showPrompt(t('modal.promptNewPortfolioNameTitle'), t('modal.promptNewPortfolioNameMsg'));
        if (name) {
            // ▼▼▼ [수정] 입력값 소독 ▼▼▼
            name = DOMPurify.sanitize(name);
            await this.state.createNewPortfolio(name); 
            // ▲▲▲ [수정] ▲▲▲
            this.view.renderPortfolioSelector(this.state.getAllPortfolios(), this.state.getActivePortfolio()?.id || '');
            this.fullRender();
            this.view.showToast(t('toast.portfolioCreated', { name }), "success");
        }
     }
    async handleRenamePortfolio() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        let newName = await this.view.showPrompt(t('modal.promptRenamePortfolioTitle'), t('modal.promptRenamePortfolioMsg'), activePortfolio.name);
        if (newName && newName.trim()) {
            // ▼▼▼ [수정] 입력값 소독 ▼▼▼
            newName = DOMPurify.sanitize(newName.trim());
            await this.state.renamePortfolio(activePortfolio.id, newName); 
            // ▲▲▲ [수정] ▲▲▲
            this.view.renderPortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id);
            this.view.showToast(t('toast.portfolioRenamed'), "success");
        }
     }
    async handleDeletePortfolio() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        if (Object.keys(this.state.getAllPortfolios()).length <= 1) {
            this.view.showToast(t('toast.lastPortfolioDeleteError'), "error");
            return;
        }

        const confirmDelete = await this.view.showConfirm(t('modal.confirmDeletePortfolioTitle'), t('modal.confirmDeletePortfolioMsg', { name: activePortfolio.name }));
        if (confirmDelete) {
            const deletedId = activePortfolio.id;
            if (await this.state.deletePortfolio(deletedId)) { 
                const newActivePortfolio = this.state.getActivePortfolio();
                if (newActivePortfolio) {
                    this.view.renderPortfolioSelector(this.state.getAllPortfolios(), newActivePortfolio.id);
                    this.fullRender();
                    this.view.showToast(t('toast.portfolioDeleted'), "success");
                }
            }
        }
     }
    
    async handleSwitchPortfolio(newId) {
        // ▼▼▼ [수정] event.target 대신 newId를 받도록 수정 ▼▼▼
        const selector = this.view.dom.portfolioSelector;
        let targetId = newId;
        
        // newId가 없는 경우(eventBinder.js에서 직접 호출된 경우) event.target에서 값을 찾음
        if (!targetId && selector instanceof HTMLSelectElement) {
             targetId = selector.value;
        }
        
        if (targetId) {
            await this.state.setActivePortfolioId(targetId); 
            const activePortfolio = this.state.getActivePortfolio();
            if (activePortfolio) {
                this.view.updateCurrencyModeUI(activePortfolio.settings.currentCurrency);
                this.view.updateMainModeUI(activePortfolio.settings.mainMode);
                const { exchangeRateInput } = this.view.dom;
                if (exchangeRateInput instanceof HTMLInputElement) {
                    exchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
                }
            }
            this.fullRender();
        }
        // ▲▲▲ [수정] ▲▲▲
     }


    // --- 주식/데이터 관리 핸들러 ---
    async handleAddNewStock() {
        const newStock = await this.state.addNewStock(); 
        this.fullRender();
        if (newStock) {
             this.view.focusOnNewStock(newStock.id);
        }
     }
    async handleDeleteStock(stockId) {
        const stockName = this.state.getStockById(stockId)?.name || t('defaults.unknownStock');
        const confirmDelete = await this.view.showConfirm(
            t('modal.confirmDeleteStockTitle'),
            t('modal.confirmDeleteStockMsg', { name: stockName })
        );
        if (confirmDelete) {
            if(await this.state.deleteStock(stockId)){ 
                Calculator.clearPortfolioStateCache();
                this.fullRender();
                this.view.showToast(t('toast.transactionDeleted'), "success"); 
            } else {
                 this.view.showToast(t('toast.lastStockDeleteError'), "error");
            }
        }
     }
    async handleResetData() {
        const confirmReset = await this.view.showConfirm(t('modal.confirmResetTitle'), t('modal.confirmResetMsg'));
        if (confirmReset) {
            await this.state.resetData(); 
            Calculator.clearPortfolioStateCache();
            const activePortfolio = this.state.getActivePortfolio();
             if (activePortfolio) {
                this.view.renderPortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id);
                this.view.updateCurrencyModeUI(activePortfolio.settings.currentCurrency);
                this.view.updateMainModeUI(activePortfolio.settings.mainMode);
                const { exchangeRateInput } = this.view.dom;
                if (exchangeRateInput instanceof HTMLInputElement) {
                    exchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
                }
             }
            this.fullRender();
            this.view.showToast(t('toast.dataReset'), "success");
        }
     }
    handleNormalizeRatios() {
        try {
            const success = this.state.normalizeRatios();
            if (!success) {
                this.view.showToast(t('toast.noRatiosToNormalize'), "info");
                return;
            }
            const activePortfolio = this.state.getActivePortfolio();
            if (!activePortfolio) return;
            this.view.updateAllTargetRatioInputs(activePortfolio.portfolioData);
            const sum = getRatioSum(activePortfolio.portfolioData);
            this.view.updateRatioSum(sum.toNumber());
            this.debouncedSave();
            this.view.showToast(t('toast.ratiosNormalized'), "success");
        } catch (error) {
             ErrorService.handle(/** @type {Error} */ (error), 'handleNormalizeRatios');
             this.view.showToast(t('toast.normalizeRatiosError'), "error");
        }
     }

    handlePortfolioBodyChange(e, _debouncedUpdate) {
        const target = /** @type {HTMLInputElement | HTMLSelectElement} */ (e.target);
        // ▼▼▼ [수정] 'tr' -> 'div[data-id]' ▼▼▼
        const row = target.closest('div[data-id]'); 
        // ▲▲▲ [수정] ▲▲▲
        if (!row) return;

        const stockId = row.dataset.id;
        const field = target.dataset.field;
        if (!stockId || !field) return;

        let value = (target.type === 'checkbox' && target instanceof HTMLInputElement) ? target.checked : target.value;
        let isValid = true;

        switch (field) {
            case 'targetRatio':
            case 'currentPrice':
            case 'fixedBuyAmount':
                const validationResult = Validator.validateNumericInput(value);
                isValid = validationResult.isValid;
                if(isValid) value = validationResult.value ?? 0;
                break;
            case 'isFixedBuyEnabled':
                value = Boolean(value);
                break;
            // ▼▼▼ [수정] 문자열 입력 소독 ▼▼▼
            case 'sector':
            case 'name':
            case 'ticker':
            default:
                value = DOMPurify.sanitize(String(value).trim()); // 소독 추가
                break;
            // ▲▲▲ [수정] ▲▲▲
        }

        this.view.toggleInputValidation(target, isValid);

        if (isValid) {
            this.state.updateStockProperty(stockId, field, value);
            Calculator.clearPortfolioStateCache();

            const activePortfolio = this.state.getActivePortfolio();
            if (!activePortfolio) return;

            const calculatedState = Calculator.calculatePortfolioState({
                portfolioData: activePortfolio.portfolioData,
                exchangeRate: activePortfolio.settings.exchangeRate,
                currentCurrency: activePortfolio.settings.currentCurrency
            });
            activePortfolio.portfolioData = calculatedState.portfolioData;

            this.view.updateVirtualTableData(calculatedState.portfolioData);

            const newRatioSum = getRatioSum(activePortfolio.portfolioData);
            this.view.updateRatioSum(newRatioSum.toNumber());

            const newSectorData = Calculator.calculateSectorAnalysis(calculatedState.portfolioData);
            this.view.displaySectorAnalysis(generateSectorAnalysisHTML(newSectorData, activePortfolio.settings.currentCurrency));

            this.debouncedSave();

            if (field === 'isFixedBuyEnabled') {
               const amountInput = row.querySelector('input[data-field="fixedBuyAmount"]');
               if (amountInput instanceof HTMLInputElement) {
                   amountInput.disabled = !value;
                   if (!value) {
                       amountInput.value = '0';
                       this.state.updateStockProperty(stockId, 'fixedBuyAmount', 0);
                       this.debouncedSave();
                   }
               }
           }
        }
     }


    handlePortfolioBodyClick(e) {
        const target = /** @type {HTMLElement} */ (e.target);
        const actionButton = target.closest('button[data-action]');
        if (!actionButton) return;
        
        // ▼▼▼ [수정] 'tr' -> 'div[data-id]' ▼▼▼
        const row = actionButton.closest('div[data-id]'); 
        // ▲▲▲ [수정] ▲▲▲
        if (!row?.dataset.id) return;

        const stockId = row.dataset.id;
        const action = actionButton.dataset.action;

        if (action === 'manage') {
            this.openTransactionModalByStockId(stockId);
        } else if (action === 'delete') {
            this.handleDeleteStock(stockId);
        }
     }
     
    openTransactionModalByStockId(stockId) {
        const stock = this.state.getStockById(stockId);
        const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
        if (stock && currency) {
            this.view.openTransactionModal(stock, currency, this.state.getTransactions(stockId));
        }
    }


    // --- 계산 및 통화 핸들러 ---
    async handleCalculate() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const additionalInvestment = this.getInvestmentAmountInKRW();

        const inputs = {
            mainMode: activePortfolio.settings.mainMode,
            portfolioData: activePortfolio.portfolioData,
            additionalInvestment: additionalInvestment
        };

        const validationErrors = Validator.validateForCalculation(inputs);

        if (validationErrors.length > 0) {
            const errorMessages = validationErrors.map(err => err.message).join('\n');
            ErrorService.handle(new ValidationError(errorMessages), 'handleCalculate - Validation');
            this.view.hideResults();
            return;
        }

        const totalRatio = getRatioSum(inputs.portfolioData);
        if (Math.abs(totalRatio.toNumber() - 100) > CONFIG.RATIO_TOLERANCE) {
            const proceed = await this.view.showConfirm(
                t('modal.confirmRatioSumWarnTitle'),
                t('modal.confirmRatioSumWarnMsg', { totalRatio: totalRatio.toFixed(1) })
            );
            if (!proceed) {
                this.view.hideResults();
                return;
            }
        }

        const calculatedState = Calculator.calculatePortfolioState({
            portfolioData: inputs.portfolioData,
            exchangeRate: activePortfolio.settings.exchangeRate,
            currentCurrency: activePortfolio.settings.currentCurrency
        });
        activePortfolio.portfolioData = calculatedState.portfolioData;

        // ▼▼▼ [수정] 전략 패턴 적용 ▼▼▼
        let strategy;
        if (activePortfolio.settings.mainMode === 'add') {
            strategy = new AddRebalanceStrategy(calculatedState.portfolioData, additionalInvestment);
        } else {
            strategy = new SellRebalanceStrategy(calculatedState.portfolioData);
        }
        const rebalancingResults = Calculator.calculateRebalancing(strategy);
        // ▲▲▲ [수정] ▲▲▲

        const resultsHTML = activePortfolio.settings.mainMode === 'add'
             ? generateAddModeResultsHTML(rebalancingResults.results, {
                   currentTotal: calculatedState.currentTotal,
                   additionalInvestment: additionalInvestment,
                   finalTotal: calculatedState.currentTotal.plus(additionalInvestment)
               }, activePortfolio.settings.currentCurrency)
             : generateSellModeResultsHTML(rebalancingResults.results, activePortfolio.settings.currentCurrency);

        this.view.displayResults(resultsHTML);
        this.debouncedSave();
        this.view.showToast(t('toast.calculateSuccess'), "success");
     }


    async handleFetchAllPrices() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio || activePortfolio.portfolioData.length === 0) {
            this.view.showToast(t('api.noUpdates'), "info");
            return;
        }

        const tickersToFetch = activePortfolio.portfolioData
            .filter(s => s.ticker && s.ticker.trim() !== '')
            .map(s => ({ id: s.id, ticker: s.ticker.trim() }));

        if (tickersToFetch.length === 0) {
            this.view.showToast(t('toast.noTickersToFetch'), "info");
            return;
        }

        this.view.toggleFetchButton(true);

        try {
            let successCount = 0;
            let failureCount = 0;
            const failedTickers = [];

            const results = await apiService.fetchAllStockPrices(tickersToFetch);

            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value) {
                    this.state.updateStockProperty(result.id, 'currentPrice', result.value);
                    this.view.updateCurrentPriceInput(result.id, result.value.toFixed(2));
                    successCount++;
                } else {
                    failureCount++;
                    failedTickers.push(result.ticker);
                    console.error(`[API] Failed to fetch price for ${result.ticker}:`, result.reason);
                }
            });

            Calculator.clearPortfolioStateCache();
            this.updateUIState(); 

            if (successCount === tickersToFetch.length) {
                this.view.showToast(t('api.fetchSuccessAll', { count: successCount }), "success");
            } else if (successCount > 0) {
                this.view.showToast(t('api.fetchSuccessPartial', { count: successCount, failed: failureCount }), "warning");
            } else {
                this.view.showToast(t('api.fetchFailedAll', { failed: failureCount }), "error");
            }
            if (failedTickers.length > 0) {
                console.log("Failed tickers:", failedTickers.join(', '));
            }
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), 'handleFetchAllPrices');
            this.view.showToast(t('api.fetchErrorGlobal', { message: error.message }), 'error');
        } finally {
            this.view.toggleFetchButton(false);
        }
     }

    async handleMainModeChange(newMode) {
        if (newMode !== 'add' && newMode !== 'sell') return;
        await this.state.updatePortfolioSettings('mainMode', newMode); 
        this.fullRender(); 
        const modeName = newMode === 'add' ? t('ui.addMode') : t('ui.sellMode');
        this.view.showToast(t('toast.modeChanged', { mode: modeName }), "info");
     }

    async handleCurrencyModeChange(newCurrency) {
         if (newCurrency !== 'krw' && newCurrency !== 'usd') return;
        await this.state.updatePortfolioSettings('currentCurrency', newCurrency); 
        this.fullRender(); 
        this.view.showToast(t('toast.currencyChanged', { currency: newCurrency.toUpperCase() }), "info");
     }

    async handleCurrencyConversion(source) {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const { additionalAmountInput, additionalAmountUSDInput, exchangeRateInput } = this.view.dom;

         if (!(additionalAmountInput instanceof HTMLInputElement) || !(additionalAmountUSDInput instanceof HTMLInputElement) || !(exchangeRateInput instanceof HTMLInputElement)) return;

        const exchangeRateNum = Number(exchangeRateInput.value) || CONFIG.DEFAULT_EXCHANGE_RATE;
        const isValidRate = exchangeRateNum > 0;
        let currentExchangeRate = CONFIG.DEFAULT_EXCHANGE_RATE;

        if (isValidRate) {
            await this.state.updatePortfolioSettings('exchangeRate', exchangeRateNum); 
            currentExchangeRate = exchangeRateNum;
        } else {
             await this.state.updatePortfolioSettings('exchangeRate', CONFIG.DEFAULT_EXCHANGE_RATE); 
             exchangeRateInput.value = CONFIG.DEFAULT_EXCHANGE_RATE.toString();
             this.view.showToast(t('toast.invalidExchangeRate'), "error");
        }
        const currentExchangeRateDec = new Decimal(currentExchangeRate);

        let krwAmountDec = new Decimal(0);
        let usdAmountDec = new Decimal(0);

        try {
            if (source === 'krw') {
                krwAmountDec = new Decimal(additionalAmountInput.value || 0);
                 if (krwAmountDec.isNegative()) throw new Error('Negative KRW input');
                usdAmountDec = currentExchangeRateDec.isZero() ? new Decimal(0) : krwAmountDec.div(currentExchangeRateDec);
            } else {
                usdAmountDec = new Decimal(additionalAmountUSDInput.value || 0);
                if (usdAmountDec.isNegative()) throw new Error('Negative USD input');
                krwAmountDec = usdAmountDec.times(currentExchangeRateDec);
            }

            if (source === 'krw') {
                 additionalAmountUSDInput.value = usdAmountDec.toFixed(2);
            } else {
                additionalAmountInput.value = krwAmountDec.toFixed(0);
            }

            this.debouncedSave();

        } catch(e) {
             console.error("Error during currency conversion:", e);
             this.view.showToast(t('toast.amountInputError'), "error");
             if (source === 'krw') additionalAmountUSDInput.value = ''; else additionalAmountInput.value = '';
        }
     }


    // --- 거래 내역 모달 핸들러 ---

    async handleAddNewTransaction(e) {
        e.preventDefault();
        const form = /** @type {HTMLFormElement} */ (e.target);
        const modal = form.closest('#transactionModal');
        const stockId = modal?.dataset.stockId;
        if (!stockId) return;

        const typeInput = form.querySelector('input[name="txType"]:checked');
        const dateInput = /** @type {HTMLInputElement} */ (form.querySelector('#txDate'));
        const quantityInput = /** @type {HTMLInputElement} */ (form.querySelector('#txQuantity'));
        const priceInput = /** @type {HTMLInputElement} */ (form.querySelector('#txPrice'));

        if (!typeInput || !dateInput || !quantityInput || !priceInput) return;

        const type = (typeInput instanceof HTMLInputElement && typeInput.value === 'sell') ? 'sell' : 'buy';
        const date = dateInput.value;
        const quantityStr = quantityInput.value;
        const priceStr = priceInput.value;

        const txData = { type, date, quantity: quantityStr, price: priceStr };
        const validationResult = Validator.validateTransaction(txData);

        if (!validationResult.isValid) {
            this.view.showToast(validationResult.message || t('toast.invalidTransactionInfo'), "error");
            return;
        }

        const success = await this.state.addTransaction(stockId, { 
             type,
             date,
             quantity: Number(quantityStr),
             price: Number(priceStr)
        });

        if (success) {
            const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
            if (currency) {
                 this.view.renderTransactionList(this.state.getTransactions(stockId), currency);
            }
            form.reset();
            dateInput.valueAsDate = new Date();
            this.view.showToast(t('toast.transactionAdded'), "success");

            Calculator.clearPortfolioStateCache();
            this.fullRender();
        } else {
             this.view.showToast(t('toast.transactionAddFailed'), "error");
        }
     }


    async handleTransactionListClick(stockId, txId) {
        if (stockId && txId) {
             const confirmDelete = await this.view.showConfirm(t('modal.confirmDeleteTransactionTitle'), t('modal.confirmDeleteTransactionMsg'));
             if(confirmDelete) {
                 const success = await this.state.deleteTransaction(stockId, txId); 
                 if (success) {
                    const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
                    if (currency) {
                         const transactionsBeforeRender = this.state.getTransactions(stockId);
                         this.view.renderTransactionList(transactionsBeforeRender, currency);
                    }
                    this.view.showToast(t('toast.transactionDeleted'), "success");
                    Calculator.clearPortfolioStateCache();
                    this.updateUIState();
                 } else {
                     this.view.showToast(t('toast.transactionDeleteFailed'), "error");
                 }
            }
        } else {
             console.error("handleTransactionListClick received invalid IDs:", stockId, txId);
        }
     }


    // --- 기타 핸들러 ---
    handleToggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem(CONFIG.DARK_MODE_KEY, isDarkMode ? 'true' : 'false');
        this.view.destroyChart();
        this.fullRender();
     }
    handleSaveDataOnExit() {
        console.log("Page unloading. Relaying on debounced save.");
    }
    handleImportData() {
        const fileInput = this.view.dom.importFileInput;
        if (fileInput instanceof HTMLInputElement) fileInput.click();
     }
    handleFileSelected(e) {
        const fileInput = /** @type {HTMLInputElement} */ (e.target);
        const file = fileInput.files?.[0];

        if (file) {
            if (file.type !== 'application/json') {
                this.view.showToast(t('toast.invalidFileType'), "error");
                fileInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = async (event) => { 
                try {
                    const jsonString = event.target?.result;
                    if (typeof jsonString === 'string') {
                        const loadedData = JSON.parse(jsonString);
                        await this.state.importData(loadedData); 
                        Calculator.clearPortfolioStateCache();
                        this.setupInitialUI();
                        this.view.showToast(t('toast.importSuccess'), "success");
                    } else {
                         throw new Error("Failed to read file content.");
                    }
                } catch (error) {
                    ErrorService.handle(/** @type {Error} */ (error), 'handleFileSelected');
                    this.view.showToast(t('toast.importError'), "error");
                } finally {
                    fileInput.value = '';
                }
            };
             reader.onerror = () => {
                 ErrorService.handle(new Error("File reading error"), 'handleFileSelected - Reader Error');
                 this.view.showToast(t('toast.importError'), "error");
                 fileInput.value = '';
             };
            reader.readAsText(file);
        }
     }
    handleExportData() {
        try {
            const dataToExport = this.state.exportData();
            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const activePortfolio = this.state.getActivePortfolio();
            const filename = `portfolio_data_${activePortfolio?.name || 'export'}_${Date.now()}.json`;

            const a = document.createElement('a');
            a.href = url;
            a.download = filename.replace(/\s+/g, '_');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.view.showToast(t('toast.exportSuccess'), "success");
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), 'handleExportData');
            this.view.showToast(t('toast.exportError'), "error");
        }
     }

    getInvestmentAmountInKRW() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return new Decimal(0);
        
        const { currentCurrency } = activePortfolio.settings;
        const { additionalAmountInput, additionalAmountUSDInput, exchangeRateInput } = this.view.dom;
        
        if (!(additionalAmountInput instanceof HTMLInputElement) || 
            !(additionalAmountUSDInput instanceof HTMLInputElement) || 
            !(exchangeRateInput instanceof HTMLInputElement)) {
            return new Decimal(0);
        }
        
        const amountKRWStr = additionalAmountInput.value || '0';
        const amountUSDStr = additionalAmountUSDInput.value || '0';
        const exchangeRateStr = exchangeRateInput.value || String(CONFIG.DEFAULT_EXCHANGE_RATE);

        try {
            const amountKRW = new Decimal(amountKRWStr);
            const amountUSD = new Decimal(amountUSDStr);
            const exchangeRate = new Decimal(exchangeRateStr);

            if (currentCurrency === 'krw') {
                return amountKRW.isNegative() ? new Decimal(0) : amountKRW;
            } else {
                 if (exchangeRate.isZero() || exchangeRate.isNegative()) return new Decimal(0);
                const calculatedKRW = amountUSD.times(exchangeRate);
                return calculatedKRW.isNegative() ? new Decimal(0) : calculatedKRW;
            }
        } catch (e) {
             console.error("Error parsing investment amount:", e);
             return new Decimal(0);
        }
     }
}