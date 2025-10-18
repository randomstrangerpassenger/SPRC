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
        
        this.updateUI();
        
        this.view.dom.darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    }

    updateUI() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) {
            console.error("No active portfolio found. Cannot update UI.");
            return;
        }
        
        const calculatedPortfolioData = Calculator.calculatePortfolioState({ portfolioData: activePortfolio.portfolioData });
        const { settings } = activePortfolio;

        this.view.renderPortfolioSelector(this.state.portfolios, this.state.activePortfolioId);
        this.view.renderTable(calculatedPortfolioData, settings.currentCurrency, settings.mainMode);
        this.view.updateMainModeUI(settings.mainMode);
        this.view.updateCurrencyModeUI(settings.currentCurrency);
        this.handleRatioUpdate();
        this.view.hideResults();
    }
    
    handleToggleDarkMode() {
        const isDark = document.body.classList.toggle('dark-mode');
        this.view.dom.darkModeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem(CONFIG.DARK_MODE_KEY, isDark);
    }

    handlePortfolioBodyChange(e, updateCallback) {
        const target = e.target;
        const row = target.closest('tr[data-id]');
        if (!row || !target.dataset.field) return;

        const id = parseInt(row.dataset.id, 10);
        const field = target.dataset.field;
        const value = target.type === 'checkbox' ? target.checked : target.value;

        this.handleStockUpdate(id, field, value, target, updateCallback);
    }

    handlePortfolioBodyClick(e) {
        const button = e.target.closest('button[data-action]');
        if (!button) return;

        const row = button.closest('tr[data-id]');
        if (!row) return;

        const action = button.dataset.action;
        const id = parseInt(row.dataset.id, 10);
        
        if (action === 'delete') {
            this.handleDeleteStock(id);
        } else if (action === 'manage') {
            const stock = this.state.getActivePortfolio().portfolioData.find(s => s.id === id);
            const currency = this.state.getActivePortfolio().settings.currentCurrency;
            if (stock) this.view.openTransactionModal(stock, currency);
        }
    }

    handleAddNewStock() {
        const newStock = this.state.addNewStock();
        this.updateUI();

        requestAnimationFrame(() => {
            const newRow = this.view.dom.portfolioBody.querySelector(`tr[data-id="${newStock.id}"]`);
            if (newRow) {
                newRow.querySelector('[data-field="name"]').focus();
            }
        });
    }

    handleDeleteStock(id) {
        if (this.state.deleteStock(id)) {
            this.updateUI();
        }
    }

    handleStockUpdate(id, field, value, element, updateCallback) {
        const numericFields = ['targetRatio', 'currentPrice', 'fixedBuyAmount'];
        
        if (numericFields.includes(field)) {
            const { isValid, value: validatedValue, message } = Validator.validateNumericInput(value);
            this.view.toggleInputValidation(element, isValid, message);
            if (!isValid) return;
            
            this.state.updateStock(id, field, validatedValue);
        } else {
             this.state.updateStock(id, field, value);
        }

        const updatedStock = this.state.getActivePortfolio().portfolioData.find(s => s.id === id);
        if (element.type !== 'checkbox' && String(element.value) !== String(updatedStock[field])) {
            element.value = updatedStock[field];
        }
        
        if (['currentPrice', 'targetRatio', 'fixedBuyAmount', 'isFixedBuyEnabled'].includes(field)) {
            updateCallback();
        }
    }
    
    handleAddNewTransaction(e) {
        e.preventDefault();
        const dom = this.view.dom;
        const stockId = parseInt(dom.transactionModal.dataset.stockId, 10);
        if (!stockId) return;

        const txData = {
            type: dom.newTransactionForm.txType.value,
            date: dom.txDate.value,
            quantity: parseFloat(dom.txQuantity.value),
            price: parseFloat(dom.txPrice.value),
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
            this.updateUI();
        }
    }
    
    handleTransactionListClick(e) {
        const button = e.target.closest('button[data-action="delete-tx"]');
        if (!button) return;

        if (confirm(MESSAGES.CONFIRM_DELETE_TRANSACTION)) {
            const stockId = parseInt(this.view.dom.transactionModal.dataset.stockId, 10);
            const txId = button.closest('tr').dataset.txId;
            
            if (this.state.deleteTransaction(stockId, txId)) {
                this.view.showToast(MESSAGES.TRANSACTION_DELETED, 'info');
                const currency = this.state.getActivePortfolio().settings.currentCurrency;
                const updatedStock = this.state.getActivePortfolio().portfolioData.find(s => s.id === stockId);
                this.view.renderTransactionList(updatedStock.transactions, currency);
                this.updateUI();
            }
        }
    }

    handleRatioUpdate() {
        const sum = this.state.getRatioSum();
        this.view.updateRatioSum(sum);
    }

    handleResetData() {
        if (confirm(MESSAGES.CONFIRM_RESET)) {
            const newPortfolio = this.state.loadTemplateData("초기화된 포트폴리오");
            this.state.getActivePortfolio().portfolioData = newPortfolio.data.portfolioData;
            this.updateUI();
            this.view.showToast(MESSAGES.DATA_RESET, "info");
        }
    }

    handleNormalizeRatios() {
        if (!this.state.normalizeRatios()) {
            this.view.showToast(MESSAGES.NO_RATIOS_TO_NORMALIZE, "error");
            return;
        }
        this.updateUI();
        this.view.showToast(MESSAGES.RATIOS_NORMALIZED, "success");
    }

    handleSaveData(showToast = true) {
        const result = this.state.saveState();
        if (showToast) {
            this.view.showToast(result.message, result.success ? "success" : "error");
        }
    }

    handleLoadData() {
        if (confirm(MESSAGES.CONFIRM_LOAD)) {
            this.state.init();
            this.updateUI();
            this.view.showToast(MESSAGES.LOAD_SUCCESS, 'info');
        }
    }

    handleExportData() {
        const dataToExport = {
            portfolios: this.state.portfolios,
            activePortfolioId: this.state.activePortfolioId
        };
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolios_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
                    throw new Error("Invalid or corrupted file structure.");
                }
                
                this.state.portfolios = importedData.portfolios;
                this.state.activePortfolioId = importedData.activePortfolioId;
                this.state.saveState();
                this.updateUI();
                this.view.showToast(MESSAGES.IMPORT_SUCCESS, "success");

            } catch (error) {
                ErrorService.handle(new Error("파일을 불러오는 중 오류가 발생했습니다."), 'handleFileSelected');
            } finally {
                e.target.value = '';
            }
        };
        reader.readAsText(file);
    }
    
    handleNewPortfolio() {
        const name = prompt(MESSAGES.PROMPT_NEW_PORTFOLIO_NAME, `포트폴리오 ${Object.keys(this.state.portfolios).length + 1}`);
        if (name && name.trim()) {
            const newPortfolio = this.state.addPortfolio(name.trim());
            this.updateUI();
            this.view.showToast(MESSAGES.PORTFOLIO_CREATED(newPortfolio.name), 'success');
        }
    }

    handleRenamePortfolio() {
        const activePortfolio = this.state.getActivePortfolio();
        const newName = prompt(MESSAGES.PROMPT_RENAME_PORTFOLIO, activePortfolio.name);
        if (newName && newName.trim() && newName.trim() !== activePortfolio.name) {
            if (this.state.renamePortfolio(this.state.activePortfolioId, newName)) {
                this.updateUI();
                this.view.showToast(MESSAGES.PORTFOLIO_RENAMED, 'success');
            }
        }
    }
    
    handleDeletePortfolio() {
        const activePortfolio = this.state.getActivePortfolio();
        if (confirm(MESSAGES.CONFIRM_DELETE_PORTFOLIO(activePortfolio.name))) {
            if (this.state.deletePortfolio(this.state.activePortfolioId)) {
                this.updateUI();
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
            this.updateUI();
        }
    }

    handleMainModeChange(mode) {
        this.state.getActivePortfolio().settings.mainMode = mode;
        this.updateUI();
    }

    handleCurrencyModeChange(mode) {
        this.state.getActivePortfolio().settings.currentCurrency = mode;
        this.updateUI();
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

    async handleCalculate() {
        this.view.displaySkeleton();
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            const activePortfolio = this.state.getActivePortfolio();
            const { settings } = activePortfolio;
            const { mainMode, currentCurrency } = settings;
            
            const calculatedPortfolioData = Calculator.calculatePortfolioState({ portfolioData: activePortfolio.portfolioData });
            const additionalInvestment = this.getInvestmentAmountInKRW();

            const validationErrors = Validator.validateForCalculation({ mainMode, portfolioData: calculatedPortfolioData, additionalInvestment });
            if (validationErrors.length > 0) {
                throw new ValidationError(validationErrors.join('\n'));
            }

            const currency = currentCurrency.toUpperCase();
            
            if (mainMode === 'add') {
                const totalRatio = this.state.getRatioSum();
                if (Math.abs(totalRatio - 100) > CONFIG.RATIO_TOLERANCE && totalRatio > 0) {
                     if (!confirm(MESSAGES.CONFIRM_RATIO_SUM_WARN(totalRatio))) {
                        this.view.displayResults('');
                        return;
                     }
                }
                const { results, summary } = Calculator.calculateAddRebalancing({ portfolioData: calculatedPortfolioData, additionalInvestment });
                this.view.displayResults(generateAddModeResultsHTML(results, summary, currency));
            } else {
                const { results } = Calculator.calculateSellRebalancing({ portfolioData: calculatedPortfolioData });
                this.view.displayResults(generateSellModeResultsHTML(results, currency));
            }
            
            const sectorResults = Calculator.analyzeSectors({ portfolioData: calculatedPortfolioData });
            this.view.displaySectorAnalysis(generateSectorAnalysisHTML(sectorResults, currency));

            const chartData = activePortfolio.portfolioData.filter(stock => stock.targetRatio > 0);
            const labels = chartData.map(stock => stock.name);
            const data = chartData.map(stock => stock.targetRatio);

            this.view.displayChart(labels, data, '목표 비율(%) 구성');

        } catch (error) {
            this.view.displayResults(''); 
            ErrorService.handle(error, 'handleCalculate');
        }
    }
}