import { CONFIG, MESSAGES } from './constants.js';
import { Validator } from './validator.js';
import { getRatioSum as calculateRatioSum } from './utils.js';

/**
 * @typedef {'buy'|'sell'} TransactionType
 * @typedef {Object} Transaction
 * @property {string} id - 거래 고유 ID
 * @property {TransactionType} type - 거래 종류
 * @property {string} date - 거래 날짜 (ISO 8601)
 * @property {number} quantity - 수량
 * @property {number} price - 개당 가격
 * @typedef {Object} Stock
 * @property {number} id
 * @property {string} name
 * @property {string} ticker
 * @property {string} sector
 * @property {number} targetRatio
 * @property {number} currentPrice - 현재가 (사용자 입력)
 * @property {Array<Transaction>} transactions - 거래 내역 배열
 * @property {boolean} isFixedBuyEnabled - 고정 매수 활성화 여부
 * @property {number} fixedBuyAmount - 고정 매수 금액
 */
export class PortfolioState {
    portfolios = {};
    activePortfolioId = null;

    constructor() {
        this.init();
    }

    createStock(id, name, ticker, sector = '미분류') {
        return { 
            id, name, ticker, sector,
            targetRatio: 0, 
            currentPrice: 0,
            transactions: [],
            isFixedBuyEnabled: false,
            fixedBuyAmount: 0,
        };
    }

    loadTemplateData(name = "기본 포트폴리오") {
        const id = Date.now();
        const templateData = {
            name: name,
            portfolioData: [
                { id: Date.now() + 1, name: "알파벳 A", ticker: "GOOGL", sector: "기술주", targetRatio: 25, currentPrice: 175, transactions: [
                    { id: Date.now() + 101, type: 'buy', date: '2023-01-15', quantity: 10, price: 95 },
                    { id: Date.now() + 102, type: 'buy', date: '2023-06-20', quantity: 5, price: 125 },
                ], isFixedBuyEnabled: false, fixedBuyAmount: 0 },
                { id: Date.now() + 2, name: "엔비디아", ticker: "NVDA", sector: "기술주", targetRatio: 30, currentPrice: 120, transactions: [
                    { id: Date.now() + 201, type: 'buy', date: '2023-03-10', quantity: 20, price: 45 },
                ], isFixedBuyEnabled: false, fixedBuyAmount: 0 },
                { id: Date.now() + 3, name: "마이크로소프트", ticker: "MSFT", sector: "기술주", targetRatio: 25, currentPrice: 445, transactions: [], isFixedBuyEnabled: false, fixedBuyAmount: 0 },
                { id: Date.now() + 4, name: "코카콜라", ticker: "KO", sector: "소비재", targetRatio: 20, currentPrice: 62, transactions: [], isFixedBuyEnabled: false, fixedBuyAmount: 0 },
            ],
            settings: {
                mainMode: 'add',
                currentCurrency: 'usd',
            }
        };
        return { id, data: templateData };
    }

    init() {
        const savedDataString = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
        if (savedDataString) {
            try {
                const savedData = JSON.parse(savedDataString);
                if (!Validator.isDataStructureValid(savedData)) {
                    throw new Error("Invalid data structure");
                }
                this.portfolios = savedData.portfolios;
                this.activePortfolioId = savedData.activePortfolioId;
                if (!this.portfolios[this.activePortfolioId]) {
                    this.activePortfolioId = Object.keys(this.portfolios)[0];
                    if (!this.activePortfolioId) throw new Error("No portfolios found.");
                }
            } catch (error) {
                console.error("Failed to load saved portfolios:", error);
                const defaultPortfolio = this.loadTemplateData();
                this.portfolios = { [defaultPortfolio.id]: defaultPortfolio.data };
                this.activePortfolioId = defaultPortfolio.id;
            }
        } else {
            const defaultPortfolio = this.loadTemplateData();
            this.portfolios = { [defaultPortfolio.id]: defaultPortfolio.data };
            this.activePortfolioId = defaultPortfolio.id;
        }

        const savedDarkMode = localStorage.getItem(CONFIG.DARK_MODE_KEY);
        if (savedDarkMode === 'true') document.body.classList.add('dark-mode');
    }

    saveState() {
        try {
            const stateToSave = {
                portfolios: this.portfolios,
                activePortfolioId: this.activePortfolioId
            };
            localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
            return { success: true, message: MESSAGES.SAVE_SUCCESS };
        } catch (error) {
            console.error("Save state error:", error);
            if (error.name === 'QuotaExceededError') {
                return { success: false, message: MESSAGES.SAVE_ERROR_QUOTA };
            }
            return { success: false, message: MESSAGES.SAVE_ERROR_GENERAL };
        }
    }
    
    getActivePortfolio() {
        return this.portfolios[this.activePortfolioId];
    }
    
    addPortfolio(name) {
        const newPortfolio = this.loadTemplateData(name);
        this.portfolios[newPortfolio.id] = newPortfolio.data;
        this.activePortfolioId = newPortfolio.id;
        this.saveState();
        return { id: newPortfolio.id, name };
    }

    renamePortfolio(id, newName) {
        if (this.portfolios[id] && newName.trim()) {
            this.portfolios[id].name = newName.trim();
            this.saveState();
            return true;
        }
        return false;
    }
    
    deletePortfolio(id) {
        if (Object.keys(this.portfolios).length <= 1) {
            return false;
        }
        delete this.portfolios[id];
        if (this.activePortfolioId === id) {
            this.activePortfolioId = Object.keys(this.portfolios)[0];
        }
        this.saveState();
        return true;
    }

    switchPortfolio(id) {
        if (this.portfolios[id]) {
            this.activePortfolioId = id;
            return true;
        }
        return false;
    }
    
    addNewStock() {
        const activePortfolioData = this.getActivePortfolio().portfolioData;
        const newStock = this.createStock(Date.now(), "새 종목", "NEW");
        activePortfolioData.push(newStock);
        return newStock;
    }

    deleteStock(id) {
        const activePortfolioData = this.getActivePortfolio().portfolioData;
        if (activePortfolioData.length <= 1) return false;
        
        this.getActivePortfolio().portfolioData = activePortfolioData.filter(s => s.id !== id);
        return true;
    }

    updateStock(id, field, value) {
        const stock = this.getActivePortfolio().portfolioData.find(s => s.id === id);
        if (!stock) return null;

        const numericFields = ['targetRatio', 'currentPrice', 'fixedBuyAmount'];
        
        if (field === 'isFixedBuyEnabled') {
            stock.isFixedBuyEnabled = Boolean(value);
            if (!value) stock.fixedBuyAmount = 0;
        } else if (numericFields.includes(field)) {
            const { isValid, value: validatedValue } = Validator.validateNumericInput(value);
            if(isValid) stock[field] = validatedValue;
        } else {
            stock[field] = value;
        }
        return stock[field];
    }
    
    addTransaction(stockId, transactionData) {
        const stock = this.getActivePortfolio().portfolioData.find(s => s.id === stockId);
        if (!stock) return false;

        const newTransaction = {
            ...transactionData,
            id: `tx_${Date.now()}`
        };
        stock.transactions.push(newTransaction);
        return true;
    }

    deleteTransaction(stockId, transactionId) {
        const stock = this.getActivePortfolio().portfolioData.find(s => s.id === stockId);
        if (!stock) return false;
        
        stock.transactions = stock.transactions.filter(tx => tx.id !== transactionId);
        return true;
    }

    getRatioSum() {
        const portfolioData = this.getActivePortfolio().portfolioData;
        return calculateRatioSum(portfolioData);
    }

    normalizeRatios() {
        const portfolioData = this.getActivePortfolio().portfolioData;
        
        const sum = calculateRatioSum(portfolioData);
        if (sum === 0) return false;
        
        let total = 0;
        portfolioData.forEach((stock, index) => {
            if (index === portfolioData.length - 1) {
                stock.targetRatio = parseFloat((100 - total).toFixed(4));
            } else {
                const normalized = (stock.targetRatio / sum) * 100;
                const rounded = parseFloat(normalized.toFixed(4));
                stock.targetRatio = rounded;
                total += rounded;
            }
        });
        return true;
    }
}