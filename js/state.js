// js/state.js (IndexedDB + Async + DOMPurify)
// @ts-check
import { nanoid } from 'nanoid';
import Decimal from 'decimal.js';
import { CONFIG } from './constants.js';
import { t } from './i18n.js';
import { ErrorService } from './errorService.js';
import { Validator } from './validator.js';
import { get, set, del } from 'idb-keyval';
import DOMPurify from 'dompurify'; // ▼▼▼ [신규] DOMPurify 임포트 ▼▼▼

/** @typedef {import('./types.js').Stock} Stock */
/** @typedef {import('./types.js').Transaction} Transaction */
/** @typedef {import('./types.js').Portfolio} Portfolio */
/** @typedef {import('./types.js').PortfolioSettings} PortfolioSettings */
/** @typedef {import('./types.js').MetaState} MetaState */

export class PortfolioState {
    /** @type {Record<string, Portfolio>} */
    #portfolios = {};
    /** @type {string | null} */
    #activePortfolioId = null;
    /** @type {Promise<void> | null} */
    #initializationPromise = null;

    constructor() {
        this.#initializationPromise = this._initialize();
    }

    /**
     * @description public async 메서드로 변경
     */
    async ensureInitialized() {
        await this.#initializationPromise;
    }

    /**
     * @description 비동기 초기화 및 LocalStorage 마이그레이션 로직
     */
    async _initialize() {
        try {
            // 1. IndexedDB에서 데이터 로드 시도
            let loadedMetaData = await this._loadMeta();
            let loadedPortfolios = await this._loadPortfolios();

            // 2. IDB에 데이터가 없는 경우, LocalStorage에서 마이그레이션 시도
            if (!loadedMetaData || !loadedPortfolios || Object.keys(loadedPortfolios).length === 0) {
                console.log("IndexedDB empty. Attempting migration from LocalStorage...");
                const migrated = await this._migrateFromLocalStorage();
                
                if (migrated) {
                    console.log("Migration successful. Reloading from IndexedDB.");
                    loadedMetaData = await this._loadMeta();
                    loadedPortfolios = await this._loadPortfolios();
                }
            }

            // 3. 데이터 유효성 검사 (DOMPurify 소독 포함)
            const { meta, portfolios } = this._validateAndUpgradeData(loadedMetaData, loadedPortfolios);

            this.#portfolios = portfolios;
            this.#activePortfolioId = meta.activePortfolioId;

            // 4. 유효한 데이터가 전혀 없으면 기본값 생성 (비동기 저장)
            if (Object.keys(this.#portfolios).length === 0 || !this.#portfolios[this.#activePortfolioId]) {
                 console.warn("No valid portfolios found or active ID invalid. Creating default portfolio.");
                await this.resetData(false); // resetData를 async로 변경
            }
            
            console.log("PortfolioState initialized (async).");
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), '_initialize');
            console.error("Initialization failed, resetting data.");
            await this.resetData(false); // resetData를 async로 변경
        }
    }
    
    /**
     * @description LocalStorage -> IndexedDB 마이그레이션
     * @returns {Promise<boolean>} 마이그레이션 성공 여부
     */
    async _migrateFromLocalStorage() {
        try {
            const lsMeta = localStorage.getItem(CONFIG.LEGACY_LS_META_KEY); 
            const lsPortfolios = localStorage.getItem(CONFIG.LEGACY_LS_PORTFOLIOS_KEY); 

            if (lsMeta && lsPortfolios) {
                const metaData = JSON.parse(lsMeta);
                const portfolioData = JSON.parse(lsPortfolios);

                // 1. 새 IDB 키로 데이터 쓰기
                await set(CONFIG.IDB_META_KEY, metaData);
                await set(CONFIG.IDB_PORTFOLIOS_KEY, portfolioData);

                // 2. 마이그레이션 성공 후 레거시 LocalStorage 데이터 삭제
                localStorage.removeItem(CONFIG.LEGACY_LS_META_KEY);
                localStorage.removeItem(CONFIG.LEGACY_LS_PORTFOLIOS_KEY);
                
                console.log("Successfully migrated data from LocalStorage to IndexedDB.");
                return true;
            }
            console.log("No legacy data found in LocalStorage to migrate.");
            return false;
        } catch (error) {
            console.error("Failed to migrate from LocalStorage:", error);
            return false;
        }
    }

    /**
     * @description IDB에서 Meta 로드 (async)
     */
    async _loadMeta() {
        try {
            const metaData = await get(CONFIG.IDB_META_KEY);
            return metaData ? metaData : null;
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), '_loadMeta - IDB get');
            return null;
        }
    }

    /**
     * @description IDB에서 Portfolios 로드 (async)
     */
    async _loadPortfolios() {
        try {
            const portfolioData = await get(CONFIG.IDB_PORTFOLIOS_KEY); 
            return portfolioData ? portfolioData : null;
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), '_loadPortfolios - IDB get');
            return null;
        }
    }

     _validateAndUpgradeData(loadedMetaData, loadedPortfolios) {
        const currentVersion = CONFIG.DATA_VERSION;
        const loadedVersion = loadedMetaData?.version;

        if (loadedVersion !== currentVersion) {
            console.warn(`Data version mismatch. Loaded: ${loadedVersion}, Current: ${currentVersion}. Attempting migration/reset.`);
        }
        
        const validatedPortfolios = {};
        let validatedActiveId = loadedMetaData?.activePortfolioId;
        let foundActive = false;

        if (loadedPortfolios && typeof loadedPortfolios === 'object') {
            Object.keys(loadedPortfolios).forEach(portId => {
                const portfolio = loadedPortfolios[portId];
                const newId = portId; 

                if (portfolio && typeof portfolio === 'object' && portfolio.id === portId && portfolio.name) {
                    validatedPortfolios[newId] = {
                        id: newId,
                        // ▼▼▼ [수정] DOMPurify.sanitize 적용 ▼▼▼
                        name: DOMPurify.sanitize(portfolio.name),
                        // ▲▲▲ [수정] ▲▲▲
                        settings: {
                            mainMode: ['add', 'sell', 'simple'].includes(portfolio.settings?.mainMode) ? portfolio.settings.mainMode : 'simple',
                            currentCurrency: ['krw', 'usd'].includes(portfolio.settings?.currentCurrency) ? portfolio.settings.currentCurrency : 'krw',
                            exchangeRate: typeof portfolio.settings?.exchangeRate === 'number' && portfolio.settings.exchangeRate > 0 ? portfolio.settings.exchangeRate : CONFIG.DEFAULT_EXCHANGE_RATE,
                        },
                        portfolioData: Array.isArray(portfolio.portfolioData) ? portfolio.portfolioData.map(stock => {
                             const targetRatio = new Decimal(stock.targetRatio ?? 0);
                             const currentPrice = new Decimal(stock.currentPrice ?? 0);
                             const fixedBuyAmount = new Decimal(stock.fixedBuyAmount ?? 0);

                            return {
                                id: stock.id || `s-${nanoid()}`,
                                // ▼▼▼ [수정] DOMPurify.sanitize 적용 ▼▼▼
                                name: DOMPurify.sanitize(stock.name || t('defaults.newStock')),
                                ticker: DOMPurify.sanitize(stock.ticker || ''),
                                sector: DOMPurify.sanitize(stock.sector || ''),
                                // ▲▲▲ [수정] ▲▲▲
                                targetRatio: targetRatio.isNaN() ? new Decimal(0) : targetRatio,
                                currentPrice: currentPrice.isNaN() ? new Decimal(0) : currentPrice,
                                isFixedBuyEnabled: typeof stock.isFixedBuyEnabled === 'boolean' ? stock.isFixedBuyEnabled : false,
                                fixedBuyAmount: fixedBuyAmount.isNaN() ? new Decimal(0) : fixedBuyAmount,
                                transactions: Array.isArray(stock.transactions) ? stock.transactions.map(tx => {
                                    const quantity = new Decimal(tx.quantity ?? 0);
                                    const price = new Decimal(tx.price ?? 0);
                                    return {
                                        id: tx.id || `tx-${nanoid()}`,
                                        type: tx.type === 'sell' ? 'sell' : 'buy',
                                        date: typeof tx.date === 'string' ? tx.date : new Date().toISOString().slice(0, 10),
                                        quantity: quantity.isNaN() ? new Decimal(0) : quantity,
                                        price: price.isNaN() ? new Decimal(0) : price,
                                    };
                                })
                                .filter(tx => tx.quantity.greaterThan(0) && tx.price.greaterThan(0))
                                .sort((a, b) => a.date.localeCompare(b.date)) : []
                            };
                        }) : []
                    };
                    if (newId === validatedActiveId) {
                        foundActive = true;
                    }
                } else {
                     console.warn(`Invalid portfolio structure skipped for ID: ${portId}`);
                }
            });
        }

        if (!foundActive || !validatedPortfolios[validatedActiveId]) {
            const firstValidId = Object.keys(validatedPortfolios)[0];
            if (firstValidId) {
                console.warn(`Active portfolio ID '${validatedActiveId}' not found. Setting active ID to '${firstValidId}'.`);
                validatedActiveId = firstValidId;
            } else {
                 console.warn(`No valid portfolios loaded. Active ID set to null.`);
                validatedActiveId = null;
            }
        }

        const validatedMeta = {
            activePortfolioId: validatedActiveId,
            version: currentVersion
        };

        return { meta: validatedMeta, portfolios: validatedPortfolios };
     }


    getActivePortfolio() {
        return this.#activePortfolioId ? this.#portfolios[this.#activePortfolioId] : null;
    }

    getAllPortfolios() {
        return this.#portfolios;
    }

    async setActivePortfolioId(id) {
        if (this.#portfolios[id]) {
            this.#activePortfolioId = id;
            await this.saveMeta(); // 비동기 저장
        } else {
            ErrorService.handle(new Error(`Portfolio with ID ${id} not found.`), 'setActivePortfolioId');
        }
    }

    async createNewPortfolio(name) {
        const newId = `p-${nanoid()}`;
        const newPortfolio = this._createDefaultPortfolio(newId, name);
        this.#portfolios[newId] = newPortfolio;
        this.#activePortfolioId = newId;
        await this.savePortfolios(); // 비동기 저장
        await this.saveMeta(); // 비동기 저장
        return newPortfolio;
    }

    async deletePortfolio(id) {
        if (Object.keys(this.#portfolios).length <= 1) {
            console.warn("Cannot delete the last portfolio.");
            return false;
        }
        if (!this.#portfolios[id]) {
             console.warn(`Portfolio with ID ${id} not found for deletion.`);
             return false;
        }

        delete this.#portfolios[id];

        if (this.#activePortfolioId === id) {
            this.#activePortfolioId = Object.keys(this.#portfolios)[0] || null;
            await this.saveMeta(); // 비동기 저장
        }
        await this.savePortfolios(); // 비동기 저장
        return true;
    }

    async renamePortfolio(id, newName) {
        if (this.#portfolios[id]) {
            this.#portfolios[id].name = newName.trim();
            await this.savePortfolios(); // 비동기 저장
        } else {
             ErrorService.handle(new Error(`Portfolio with ID ${id} not found for renaming.`), 'renamePortfolio');
        }
    }

    async updatePortfolioSettings(key, value) {
        const activePortfolio = this.getActivePortfolio();
        if (activePortfolio) {
            if (key === 'exchangeRate' && (typeof value !== 'number' || value <= 0)) {
                 activePortfolio.settings[key] = CONFIG.DEFAULT_EXCHANGE_RATE;
            } else if (key === 'mainMode' && !['add', 'sell'].includes(/** @type {string} */(value))) {
                 activePortfolio.settings[key] = 'add';
            } else if (key === 'currentCurrency' && !['krw', 'usd'].includes(/** @type {string} */(value))) {
                 activePortfolio.settings[key] = 'krw';
            }
            else {
                activePortfolio.settings[key] = value;
            }
            await this.saveActivePortfolio(); // 비동기 저장
        }
    }


    async addNewStock() {
        const activePortfolio = this.getActivePortfolio();
        if (activePortfolio) {
            const newStock = this._createDefaultStock();
            activePortfolio.portfolioData.push(newStock);
            await this.saveActivePortfolio(); // 비동기 저장
            return newStock;
        }
        return null;
    }

    async deleteStock(stockId) {
        const activePortfolio = this.getActivePortfolio();
        if (activePortfolio) {
             if (activePortfolio.portfolioData.length <= 1) {
                 console.warn("Cannot delete the last stock in the portfolio.");
                 return false;
             }
            const initialLength = activePortfolio.portfolioData.length;
            activePortfolio.portfolioData = activePortfolio.portfolioData.filter(stock => stock.id !== stockId);

            if (activePortfolio.portfolioData.length < initialLength) {
                 await this.saveActivePortfolio(); // 비동기 저장
                 return true;
            } else {
                 console.warn(`Stock with ID ${stockId} not found for deletion.`);
                 return false;
            }
        }
        return false;
    }

    getStockById(stockId) {
        const activePortfolio = this.getActivePortfolio();
        return activePortfolio?.portfolioData.find(s => s.id === stockId);
    }

    updateStockProperty(stockId, field, value) {
        const activePortfolio = this.getActivePortfolio();
        if (activePortfolio) {
            const stockIndex = activePortfolio.portfolioData.findIndex(s => s.id === stockId);
            if (stockIndex > -1) {
                const stock = activePortfolio.portfolioData[stockIndex];
                 if (['targetRatio', 'currentPrice', 'fixedBuyAmount'].includes(field)) {
                     try {
                         const decimalValue = new Decimal(value ?? 0);
                         if (decimalValue.isNaN()) throw new Error('Invalid number for Decimal');
                          // @ts-ignore
                         stock[field] = decimalValue;
                     } catch (e) {
                         ErrorService.handle(new Error(`Invalid numeric value for ${field}: ${value}`), 'updateStockProperty');
                          // @ts-ignore
                         stock[field] = new Decimal(0);
                     }
                 } else if (field === 'isFixedBuyEnabled') {
                      // @ts-ignore
                     stock[field] = Boolean(value);
                 } else if (typeof stock[field] !== 'undefined') {
                      // @ts-ignore
                     stock[field] = value;
                 } else {
                      console.warn(`Attempted to update non-existent property '${field}' on stock ${stockId}`);
                 }
            }
        }
    }

    async addTransaction(stockId, transactionData) {
        const stock = this.getStockById(stockId);
        if (stock) {
            const validation = Validator.validateTransaction({
                ...transactionData,
                quantity: transactionData.quantity,
                price: transactionData.price,
            });
            if (!validation.isValid) {
                 ErrorService.handle(new Error(`Invalid transaction data: ${validation.message}`), 'addTransaction');
                 return false;
            }

            try {
                const newTransaction = {
                    ...transactionData,
                    id: `tx-${nanoid()}`,
                     quantity: new Decimal(transactionData.quantity),
                     price: new Decimal(transactionData.price)
                };
                if (newTransaction.quantity.isNaN() || newTransaction.price.isNaN()){
                     throw new Error('Quantity or Price resulted in NaN after Decimal conversion.');
                }

                stock.transactions.push(newTransaction);
                stock.transactions.sort((a, b) => a.date.localeCompare(b.date));
                await this.saveActivePortfolio(); // 비동기 저장
                return true;
            } catch (e) {
                 ErrorService.handle(new Error(`Error converting transaction data to Decimal: ${e.message}`), 'addTransaction');
                 return false;
            }
        }
        return false;
    }

    async deleteTransaction(stockId, transactionId) {
        const stock = this.getStockById(stockId);
        if (stock) {
            const initialLength = stock.transactions.length;
            stock.transactions = stock.transactions.filter(tx => tx.id !== transactionId);
            if (stock.transactions.length < initialLength) {
                 await this.saveActivePortfolio(); // 비동기 저장
                 return true;
            } else {
                 console.warn(`State: Transaction ID ${transactionId} not found for stock ${stockId}.`);
                 return false;
            }
        }
        console.error(`State: Stock with ID ${stockId} not found.`);
        return false;
    }


    getTransactions(stockId) {
        const stock = this.getStockById(stockId);
        const transactions = stock ? [...stock.transactions] : []; // Return a copy
        return transactions;
    }

    normalizeRatios() {
        const activePortfolio = this.getActivePortfolio();
        if (!activePortfolio || activePortfolio.portfolioData.length === 0) return false;

        let totalRatio = new Decimal(0);
        activePortfolio.portfolioData.forEach(stock => {
            const ratio = stock.targetRatio instanceof Decimal ? stock.targetRatio : new Decimal(stock.targetRatio || 0);
            totalRatio = totalRatio.plus(ratio);
        });


        if (totalRatio.isZero() || totalRatio.isNaN()) {
            console.warn("Total target ratio is zero or NaN, cannot normalize.");
            return false;
        }

        const factor = new Decimal(100).div(totalRatio);
        activePortfolio.portfolioData.forEach(stock => {
            const currentRatio = stock.targetRatio instanceof Decimal ? stock.targetRatio : new Decimal(stock.targetRatio || 0);
            stock.targetRatio = currentRatio.times(factor).toDecimalPlaces(2); // Keep as Decimal
        });

        let newSum = new Decimal(0);
        activePortfolio.portfolioData.forEach(stock => {
            newSum = newSum.plus(stock.targetRatio);
        });
        let diff = new Decimal(100).minus(newSum);

        if (!diff.isZero() && activePortfolio.portfolioData.length > 0) {
             let stockToAdjust = activePortfolio.portfolioData.reduce((maxStock, currentStock) => {
                 const currentRatio = currentStock.targetRatio instanceof Decimal ? currentStock.targetRatio : new Decimal(0);
                 const maxRatio = maxStock.targetRatio instanceof Decimal ? maxStock.targetRatio : new Decimal(0);
                 return (currentRatio.greaterThan(maxRatio)) ? currentStock : maxStock;
             }, activePortfolio.portfolioData[0]);

             const currentAdjustRatio = stockToAdjust.targetRatio instanceof Decimal ? stockToAdjust.targetRatio : new Decimal(stockToAdjust.targetRatio || 0);
             stockToAdjust.targetRatio = currentAdjustRatio.plus(diff).toDecimalPlaces(2);
        }

        return true;
    }

    async resetData(save = true) {
        const defaultPortfolio = this._createDefaultPortfolio(`p-${nanoid()}`);
        this.#portfolios = { [defaultPortfolio.id]: defaultPortfolio };
        this.#activePortfolioId = defaultPortfolio.id;
        if (save) {
            await this.savePortfolios(); // 비동기 저장
            await this.saveMeta(); // 비동기 저장
        }
        console.log("Data reset to default.");
    }

    exportData() {
         const exportablePortfolios = {};
         Object.entries(this.#portfolios).forEach(([id, portfolio]) => {
             exportablePortfolios[id] = {
                 ...portfolio,
                 portfolioData: portfolio.portfolioData.map(stock => ({
                     ...stock,
                     targetRatio: stock.targetRatio.toNumber(),
                     currentPrice: stock.currentPrice.toNumber(),
                     fixedBuyAmount: stock.fixedBuyAmount.toNumber(),
                     transactions: stock.transactions.map(tx => ({
                         ...tx,
                         quantity: tx.quantity.toNumber(),
                         price: tx.price.toNumber(),
                     }))
                 }))
             };
         });

        return {
            meta: { activePortfolioId: this.#activePortfolioId, version: CONFIG.DATA_VERSION },
            portfolios: exportablePortfolios
        };
    }

    async importData(importedData) {
         if (!Validator.isDataStructureValid(importedData)) {
            throw new Error("Imported data structure is invalid.");
         }

        // ▼▼▼ [수정] _validateAndUpgradeData가 소독을 처리 ▼▼▼
        const { meta, portfolios } = this._validateAndUpgradeData(importedData.meta, importedData.portfolios);

        this.#portfolios = portfolios;
        this.#activePortfolioId = meta.activePortfolioId;

        if (Object.keys(this.#portfolios).length === 0 || !this.#portfolios[this.#activePortfolioId]) {
            console.warn("Imported data resulted in no valid portfolios. Resetting to default.");
            await this.resetData(false); // 비동기 리셋
        }

        await this.savePortfolios(); // 비동기 저장
        await this.saveMeta(); // 비동기 저장
        console.log("Data imported successfully.");
    }


    async saveMeta() {
        try {
            const metaData = { activePortfolioId: this.#activePortfolioId, version: CONFIG.DATA_VERSION };
            await set(CONFIG.IDB_META_KEY, metaData); 
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), 'saveMeta - IDB set');
        }
    }

    async savePortfolios() {
        try {
             const saveablePortfolios = {};
             Object.entries(this.#portfolios).forEach(([id, portfolio]) => {
                 saveablePortfolios[id] = {
                     ...portfolio,
                     portfolioData: portfolio.portfolioData.map(stock => {
                        // ▼▼▼▼▼ [수정된 부분] ▼▼▼▼▼
                        // 'calculated' 속성을 분해해서 저장 대상에서 제외
                        const { calculated, ...saveableStock } = stock;
                        // ▲▲▲▲▲ [수정된 부분] ▲▲▲▲▲

                         return {
                             // ▼▼▼ [수정] stock 대신 saveableStock 사용
                             ...saveableStock,
                             targetRatio: saveableStock.targetRatio.toNumber(),
                             currentPrice: saveableStock.currentPrice.toNumber(),
                             fixedBuyAmount: saveableStock.fixedBuyAmount.toNumber(),
                             transactions: saveableStock.transactions.map(tx => ({
                                 ...tx,
                                 quantity: tx.quantity.toNumber(),
                                 price: tx.price.toNumber(),
                             }))
                             // ▲▲▲ [수정]
                         };
                     })
                 };
             });
            await set(CONFIG.IDB_PORTFOLIOS_KEY, saveablePortfolios); 
        } catch (error) {
             if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                 ErrorService.handle(error, 'savePortfolios - Quota Exceeded');
             } else {
                 ErrorService.handle(/** @type {Error} */ (error), 'savePortfolios - IDB set');
             }
        }
    }

    async saveActivePortfolio() {
        await this.savePortfolios();
    }

    // --- Private Helper Methods ---

    _createDefaultPortfolio(id, name = t('defaults.defaultPortfolioName')) {
        return {
            id: id,
            name: name,
            settings: {
                mainMode: 'simple',
                currentCurrency: 'krw',
                exchangeRate: CONFIG.DEFAULT_EXCHANGE_RATE,
            },
            portfolioData: [this._createDefaultStock()]
        };
    }

    _createDefaultStock() {
        return {
            id: `s-${nanoid()}`,
            name: t('defaults.newStock'),
            ticker: '',
            sector: '',
            targetRatio: new Decimal(0), // Use Decimal
            currentPrice: new Decimal(0), // Use Decimal
            isFixedBuyEnabled: false,
            fixedBuyAmount: new Decimal(0), // Use Decimal
            transactions: []
        };
    }
}