import { PortfolioState } from './state.js';
import { PortfolioView } from './view.js';
import { Calculator } from './calculator.js';
import { Validator } from './validator.js';
import { CONFIG, MESSAGES } from './constants.js';
import { generateAddModeResultsHTML, generateSellModeResultsHTML, generateSectorAnalysisHTML } from './templates.js';
import { bindEventListeners } from './eventBinder.js';
import { ErrorService, ValidationError } from './errorService.js';
import Decimal from 'decimal.js';

export class PortfolioController {
    constructor() {
        this.state = new PortfolioState();
        this.view = PortfolioView;
    }

    init() {
        this.view.cacheDomElements();
        bindEventListeners(this, this.view.dom);
        this.fullRender();
        this.view.dom.darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    }

    // --- State Update & Rendering ---
    fullRender() {
        try {
            const activePortfolio = this.state.getActivePortfolio();
            if (!activePortfolio) throw new Error("활성화된 포트폴리오가 없습니다.");
            
            const calculatedPortfolioData = Calculator.calculatePortfolioState({ portfolioData: activePortfolio.portfolioData });
            const { settings } = activePortfolio;

            this.view.renderPortfolioSelector(this.state.portfolios, this.state.activePortfolioId);
            this.view.renderTable(calculatedPortfolioData, settings.currentCurrency, settings.mainMode);
            this.view.updateMainModeUI(settings.mainMode);
            this.view.updateCurrencyModeUI(settings.currentCurrency);
            this.updateRatioSumDisplay();
            this.view.hideResults();
        } catch (error) {
            ErrorService.handle(error, 'fullRender');
        }
    }
    
    updateUIState() {
        try {
            const activePortfolio = this.state.getActivePortfolio();
            const calculatedPortfolioData = Calculator.calculatePortfolioState({ portfolioData: activePortfolio.portfolioData });
            
            calculatedPortfolioData.forEach(stock => {
                this.view.updateStockRowOutputs(stock.id, stock, activePortfolio.settings.currentCurrency, activePortfolio.settings.mainMode);
            });
            this.updateRatioSumDisplay();
        } catch(error) {
            ErrorService.handle(error, 'updateUIState');
        }
    }

    updateRatioSumDisplay() {
        const sum = this.state.getRatioSum();
        this.view.updateRatioSum(sum.toNumber());
    }

    // --- Event Handlers ---
    handleToggleDarkMode() {
        const isDark = document.body.classList.toggle('dark-mode');
        this.view.dom.darkModeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem(CONFIG.DARK_MODE_KEY, isDark);
    }

    handlePortfolioBodyChange(e, updateCallback) {
        const target = e.target;
        const row = target.closest('tr[data-id]');
        if (!row || !target.dataset.field) return;

        const id = row.dataset.id;
        const field = target.dataset.field;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        
        const numericFields = ['targetRatio', 'currentPrice', 'fixedBuyAmount'];
        if (numericFields.includes(field)) {
            const { isValid, value: validatedValue, message } = Validator.validateNumericInput(value);
            this.view.toggleInputValidation(target, isValid, message);
            if (!isValid) return;
            this.state.updateStock(id, field, validatedValue);
        } else {
             this.state.updateStock(id, field, value);
        }
        
        if (target.type === 'checkbox') {
             // Re-render the input part of the row to update disabled state
             const stock = this.state.getActivePortfolio().portfolioData.find(s => s.id === id);
             const mode = this.state.getActivePortfolio().settings.mainMode;
             row.innerHTML = this.view.getStockInputsHTML(stock, mode);
             row.querySelector(`[data-field="${field}"]`).focus();
        }

        if (['currentPrice', 'targetRatio', 'fixedBuyAmount', 'isFixedBuyEnabled'].includes(field)) {
            updateCallback();
        }
    }

    handlePortfolioBodyClick(e) {
        try {
            const button = e.target.closest('button[data-action]');
            if (!button) return;

            const row = button.closest('tr[data-id]');
            if (!row) return;

            const action = button.dataset.action;
            const id = row.dataset.id;
            
            if (action === 'delete') this.handleDeleteStock(id);
            else if (action === 'manage') {
                const stock = this.state.getActivePortfolio().portfolioData.find(s => s.id === id);
                const currency = this.state.getActivePortfolio().settings.currentCurrency;
                if (stock) this.view.openTransactionModal(stock, currency);
            }
        } catch (error) {
            ErrorService.handle(error, 'handlePortfolioBodyClick');
        }
    }

    handleAddNewStock() {
        const newStock = this.state.addNewStock();
        const { currentCurrency, mainMode } = this.state.getActivePortfolio().settings;
        const fragment = this.view.createStockRowFragment({ ...newStock, calculated: Calculator.calculateStockMetrics(newStock) }, currentCurrency, mainMode);
        this.view.dom.portfolioBody.appendChild(fragment);

        requestAnimationFrame(() => {
            const newRow = this.view.dom.portfolioBody.querySelector(`tr[data-id="${newStock.id}"]`);
            if (newRow) newRow.querySelector('[data-field="name"]').focus();
        });
    }

    async handleDeleteStock(id) {
        if (this.state.deleteStock(id)) {
            this.view.dom.portfolioBody.querySelector(`.stock-inputs[data-id="${id}"]`)?.remove();
            this.view.dom.portfolioBody.querySelector(`.stock-outputs[data-id="${id}"]`)?.remove();
            this.updateUIState();
        }
    }
    
    async handleAddNewTransaction(e) {
        e.preventDefault();
        try {
            const dom = this.view.dom;
            const stockId = dom.transactionModal.dataset.stockId;
            if (!stockId) return;

            const txData = {
                type: dom.newTransactionForm.txType.value, date: dom.txDate.value,
                quantity: parseFloat(dom.txQuantity.value), price: parseFloat(dom.txPrice.value),
            };
            
            const validation = Validator.validateTransaction(txData);
            if (!validation.isValid) {
                this.view.showToast(validation.message, 'error');
                return;
            }

            if (this.state.addTransaction(stockId, txData)) {
                this.view.showToast(MESSAGES.TRANSACTION_ADDED, 'success');
                const currency = this.state.getActivePortfolio().settings.currentCurrency;
                const updatedStock = this.state.getActivePortfolio().portfolioData.find(s => s.id === stockId);
                this.view.renderTransactionList(updatedStock.transactions, currency);
                dom.newTransactionForm.reset();
                dom.txDate.valueAsDate = new Date();
                this.updateUIState();
            }
        } catch (error) {
            ErrorService.handle(error, 'handleAddNewTransaction');
        }
    }
    
    async handleTransactionListClick(e) {
        const button = e.target.closest('button[data-action="delete-tx"]');
        if (!button) return;

        const confirmed = await this.view.showConfirm(MESSAGES.CONFIRM_DELETE_TRANSACTION_TITLE, MESSAGES.CONFIRM_DELETE_TRANSACTION_MSG);
        if (confirmed) {
            const stockId = this.view.dom.transactionModal.dataset.stockId;
            const txId = button.closest('tr').dataset.txId;
            
            if (this.state.deleteTransaction(stockId, txId)) {
                this.view.showToast(MESSAGES.TRANSACTION_DELETED, 'info');
                const currency = this.state.getActivePortfolio().settings.currentCurrency;
                const updatedStock = this.state.getActivePortfolio().portfolioData.find(s => s.id === stockId);
                this.view.renderTransactionList(updatedStock.transactions, currency);
                this.updateUIState();
            }
        }
    }

    async handleResetData() {
        const confirmed = await this.view.showConfirm(MESSAGES.CONFIRM_RESET_TITLE, MESSAGES.CONFIRM_RESET_MSG);
        if (confirmed) {
            const newPortfolio = this.state.loadTemplateData("초기화된 포트폴리오");
            this.state.getActivePortfolio().portfolioData = newPortfolio.data.portfolioData;
            this.fullRender();
            this.view.showToast(MESSAGES.DATA_RESET, "info");
        }
    }

    handleNormalizeRatios() {
        if (!this.state.normalizeRatios()) {
            this.view.showToast(MESSAGES.NO_RATIOS_TO_NORMALIZE, "error");
            return;
        }
        this.fullRender();
        this.view.showToast(MESSAGES.RATIOS_NORMALIZED, "success");
    }

    handleSaveDataOnExit() {
        this.state.saveState();
    }
    
    handleExportData() {
        try {
            const dataStr = JSON.stringify({
                portfolios: this.state.portfolios,
                activePortfolioId: this.state.activePortfolioId
            }, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `portfolios_${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            ErrorService.handle(error, 'handleExportData');
        }
    }

    handleImportData() {
        document.getElementById('importFileInput').click();
    }

    handleFileSelected(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                if (!Validator.isDataStructureValid(importedData)) {
                    throw new Error(MESSAGES.INVALID_FILE_STRUCTURE);
                }
                
                this.state.portfolios = importedData.portfolios;
                this.state.activePortfolioId = importedData.activePortfolioId;
                this.state.saveState();
                this.fullRender();
                this.view.showToast(MESSAGES.IMPORT_SUCCESS, "success");

            } catch (error) {
                ErrorService.handle(error, 'handleFileSelected');
            } finally {
                e.target.value = '';
            }
        };
        reader.readAsText(file);
    }
    
    async handleNewPortfolio() {
        const name = await this.view.showPrompt(MESSAGES.PROMPT_NEW_PORTFOLIO_NAME_TITLE, MESSAGES.PROMPT_NEW_PORTFOLIO_NAME_MSG, `포트폴리오 ${Object.keys(this.state.portfolios).length + 1}`);
        if (name && name.trim()) {
            const newPortfolio = this.state.addPortfolio(name.trim());
            this.fullRender();
            this.view.showToast(MESSAGES.PORTFOLIO_CREATED(newPortfolio.name), 'success');
        }
    }

    async handleRenamePortfolio() {
        const activePortfolio = this.state.getActivePortfolio();
        const newName = await this.view.showPrompt(MESSAGES.PROMPT_RENAME_PORTFOLIO_TITLE, MESSAGES.PROMPT_RENAME_PORTFOLIO_MSG, activePortfolio.name);
        if (newName && newName.trim() && newName.trim() !== activePortfolio.name) {
            if (this.state.renamePortfolio(this.state.activePortfolioId, newName)) {
                this.fullRender();
                this.view.showToast(MESSAGES.PORTFOLIO_RENAMED, 'success');
            }
        }
    }
    
    async handleDeletePortfolio() {
        const activePortfolio = this.state.getActivePortfolio();
        const confirmed = await this.view.showConfirm(MESSAGES.CONFIRM_DELETE_PORTFOLIO_TITLE, MESSAGES.CONFIRM_DELETE_PORTFOLIO_MSG(activePortfolio.name));
        if (confirmed) {
            if (this.state.deletePortfolio(this.state.activePortfolioId)) {
                this.fullRender();
                this.view.showToast(MESSAGES.PORTFOLIO_DELETED, 'info');
            } else {
                this.view.showToast(MESSAGES.LAST_PORTFOLIO_DELETE_ERROR, 'error');
            }
        }
    }

    handleSwitchPortfolio() {
        const selectedId = this.view.dom.portfolioSelector.value;
        if(this.state.switchPortfolio(selectedId)) {
            this.state.saveState();
            this.fullRender();
        }
    }

    handleMainModeChange(mode) {
        this.state.getActivePortfolio().settings.mainMode = mode;
        this.fullRender();
    }

    handleCurrencyModeChange(mode) {
        this.state.getActivePortfolio().settings.currentCurrency = mode;
        this.fullRender();
    }
    
    handleCurrencyConversion(source) {
        const activePortfolio = this.state.getActivePortfolio();
        if (activePortfolio.settings.currentCurrency !== 'usd') return;
        try {
            const rateVal = parseFloat(this.view.dom.exchangeRateInput.value);
            if (isNaN(rateVal) || rateVal <= 0) return;

            const rate = new Decimal(rateVal);
            if (source === 'krw') {
                const krwAmount = new Decimal(this.view.dom.additionalAmountInput.value || 0);
                this.view.dom.additionalAmountUSDInput.value = krwAmount.div(rate).toDecimalPlaces(2).toString();
            } else {
                const usdAmount = new Decimal(this.view.dom.additionalAmountUSDInput.value || 0);
                this.view.dom.additionalAmountInput.value = usdAmount.times(rate).round().toString();
            }
        } catch (e) { console.error("Currency conversion error:", e); }
    }

    getInvestmentAmountInKRW() {
        const dom = this.view.dom;
        const currency = this.state.getActivePortfolio().settings.currentCurrency;
        if (currency === 'krw') {
            return new Decimal(dom.additionalAmountInput.value || 0);
        } else {
            const usdAmount = new Decimal(dom.additionalAmountUSDInput.value || 0);
            const rate = new Decimal(dom.exchangeRateInput.value || CONFIG.DEFAULT_EXCHANGE_RATE);
            return usdAmount.times(rate).round();
        }
    }
    
    // --- 계산 로직 (리팩토링됨) ---

    _getInputsForCalculation() {
        const activePortfolio = this.state.getActivePortfolio();
        const { settings, portfolioData } = activePortfolio;
        const calculatedPortfolioData = Calculator.calculatePortfolioState({ portfolioData });
        const additionalInvestment = this.getInvestmentAmountInKRW();
        return { ...settings, calculatedPortfolioData, additionalInvestment };
    }

    async _runRebalancingLogic({ mainMode, calculatedPortfolioData, additionalInvestment }) {
        if (mainMode === 'add') {
            const totalRatio = this.state.getRatioSum();
            if (Math.abs(totalRatio.toNumber() - 100) > CONFIG.RATIO_TOLERANCE && totalRatio.gt(0)) {
                const confirmed = await this.view.showConfirm(MESSAGES.CONFIRM_RATIO_SUM_WARN_TITLE, MESSAGES.CONFIRM_RATIO_SUM_WARN_MSG(totalRatio.toNumber()));
                if (!confirmed) return null;
            }
            return Calculator.calculateAddRebalancing({ portfolioData: calculatedPortfolioData, additionalInvestment });
        } else {
            return Calculator.calculateSellRebalancing({ portfolioData: calculatedPortfolioData });
        }
    }

    async _updateResultsView(mainMode, resultsData, currency, portfolioData) {
        if (!resultsData) return;

        const resultsHTML = mainMode === 'add'
            ? generateAddModeResultsHTML(resultsData.results, resultsData.summary, currency)
            : generateSellModeResultsHTML(resultsData.results, currency);
        this.view.displayResults(resultsHTML);

        const sectorResults = Calculator.analyzeSectors({ portfolioData });
        this.view.displaySectorAnalysis(generateSectorAnalysisHTML(sectorResults, currency));

        try {
            const Chart = (await import('chart.js/auto')).default;
            const chartData = portfolioData.filter(stock => stock.targetRatio > 0);
            this.view.displayChart(
                Chart,
                chartData.map(stock => stock.name),
                chartData.map(stock => stock.targetRatio),
                '목표 비율(%) 구성'
            );
        } catch (chartError) {
            console.error("차트 라이브러리를 로드하는 데 실패했습니다.", chartError);
            this.view.showToast("차트 시각화에 실패했습니다.", "error");
        }
    }
    
    async handleCalculate() {
        this.view.displaySkeleton();
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            const inputs = this._getInputsForCalculation();
            
            const validationErrors = Validator.validateForCalculation(inputs);
            if (validationErrors.length > 0) {
                throw new ValidationError(validationErrors.join('\n'));
            }

            const resultsData = await this._runRebalancingLogic(inputs);

            await this._updateResultsView(inputs.mainMode, resultsData, inputs.currentCurrency.toUpperCase(), inputs.calculatedPortfolioData);

        } catch (error) {
            this.view.hideResults();
            ErrorService.handle(error, 'handleCalculate');
        }
    }
}