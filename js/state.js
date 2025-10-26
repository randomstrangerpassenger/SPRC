// js/state.js
// @ts-check
import { nanoid } from 'nanoid';
import Decimal from 'decimal.js';
import { CONFIG } from './constants.js';
import { t } from './i18n.js';
import { ErrorService } from './errorService.js';
import { Validator } from './validator.js'; // Validator import 추가

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
     * @description 비동기 초기화를 수행하고 완료될 때까지 기다립니다.
     */
    async ensureInitialized() {
        await this.#initializationPromise;
    }

    /**
     * @description 로컬 스토리지에서 데이터를 로드하거나 기본값을 생성하여 상태를 초기화합니다.
     * @private
     */
    async _initialize() {
        try {
            const loadedMetaData = this._loadMeta();
            const loadedPortfolios = this._loadPortfolios();

            // 데이터 구조 검증 및 업그레이드
            const { meta, portfolios } = this._validateAndUpgradeData(loadedMetaData, loadedPortfolios);

            this.#portfolios = portfolios;
            this.#activePortfolioId = meta.activePortfolioId;

            // 유효한 포트폴리오가 하나도 없는 경우 기본 포트폴리오 생성
            if (Object.keys(this.#portfolios).length === 0 || !this.#portfolios[this.#activePortfolioId]) {
                 console.warn("No valid portfolios found or active ID invalid. Creating default portfolio.");
                this.resetData(false); // Don't save immediately after reset in constructor
            }

            console.log("PortfolioState initialized.");

        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), '_initialize');
            console.error("Initialization failed, resetting data.");
            // 초기화 실패 시 안전하게 기본값으로 리셋
            this.resetData(false);
        }
    }


    /**
     * @description 로컬 스토리지에서 메타데이터를 로드합니다.
     * @returns {MetaState | null} 로드된 메타데이터 또는 null
     * @private
     */
    _loadMeta() {
        try {
            const metaData = localStorage.getItem(CONFIG.LOCAL_STORAGE_META_KEY);
            return metaData ? JSON.parse(metaData) : null;
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), '_loadMeta - JSON Parsing');
            localStorage.removeItem(CONFIG.LOCAL_STORAGE_META_KEY); // Remove corrupted data
            return null;
        }
    }

    /**
     * @description 로컬 스토리지에서 포트폴리오 데이터를 로드합니다.
     * @returns {Record<string, any> | null} 로드된 포트폴리오 데이터 또는 null
     * @private
     */
    _loadPortfolios() {
        try {
            const portfolioData = localStorage.getItem(CONFIG.LOCAL_STORAGE_PORTFOLIOS_KEY);
            return portfolioData ? JSON.parse(portfolioData) : null;
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), '_loadPortfolios - JSON Parsing');
            localStorage.removeItem(CONFIG.LOCAL_STORAGE_PORTFOLIOS_KEY); // Remove corrupted data
            return null;
        }
    }


    /**
     * @description 로드된 데이터 구조를 검증하고 최신 버전으로 마이그레이션합니다.
     * @param {object | null} loadedMetaData - 로드된 메타 데이터
     * @param {object | null} loadedPortfolios - 로드된 포트폴리오 데이터
     * @returns {{meta: MetaState, portfolios: Record<string, Portfolio>}} 검증/업그레이드된 데이터
     * @private
     */
    _validateAndUpgradeData(loadedMetaData, loadedPortfolios) {
        // --- 데이터 버전 관리 (간단한 예시) ---
        // 이전 버전 데이터 구조 변경 시 여기에 마이그레이션 로직 추가
        const currentVersion = CONFIG.DATA_VERSION;
        const loadedVersion = loadedMetaData?.version;

        if (loadedVersion !== currentVersion) {
            console.warn(`Data version mismatch. Loaded: ${loadedVersion}, Current: ${currentVersion}. Attempting migration/reset.`);
            // TODO: Add migration logic here if possible, otherwise reset
            // For now, we'll proceed assuming basic structure or reset later
        }

        const validatedPortfolios = {};
        let validatedActiveId = loadedMetaData?.activePortfolioId;
        let foundActive = false;

        // 포트폴리오 데이터 검증 및 기본값 채우기
        if (loadedPortfolios && typeof loadedPortfolios === 'object') {
            Object.keys(loadedPortfolios).forEach(portId => {
                const portfolio = loadedPortfolios[portId];
                // --- ⬇️ 수정: nanoid() 대신 portId 사용 ---
                const newId = portId; // <-- 수정된 코드: 로드된 ID 유지
                // --- ⬆️ 수정 ⬆️ ---

                // Basic portfolio structure validation
                if (portfolio && typeof portfolio === 'object' && portfolio.id === portId && portfolio.name) {
                    validatedPortfolios[newId] = {
                        id: newId,
                        name: portfolio.name,
                        settings: {
                            mainMode: ['add', 'sell'].includes(portfolio.settings?.mainMode) ? portfolio.settings.mainMode : 'add',
                            currentCurrency: ['krw', 'usd'].includes(portfolio.settings?.currentCurrency) ? portfolio.settings.currentCurrency : 'krw',
                            exchangeRate: typeof portfolio.settings?.exchangeRate === 'number' && portfolio.settings.exchangeRate > 0 ? portfolio.settings.exchangeRate : CONFIG.DEFAULT_EXCHANGE_RATE,
                        },
                        portfolioData: Array.isArray(portfolio.portfolioData) ? portfolio.portfolioData.map(stock => ({
                            id: stock.id || `s-${nanoid()}`,
                            name: stock.name || t('defaults.newStock'),
                            ticker: stock.ticker || '',
                            sector: stock.sector || '', // Ensure sector exists
                            targetRatio: typeof stock.targetRatio === 'number' ? stock.targetRatio : 0,
                            currentPrice: typeof stock.currentPrice === 'number' ? stock.currentPrice : 0,
                            // --- ⬇️ 수정: Decimal로 기본값/로드값 설정 ⬇️ ---
                            isFixedBuyEnabled: typeof stock.isFixedBuyEnabled === 'boolean' ? stock.isFixedBuyEnabled : false,
                            fixedBuyAmount: new Decimal(typeof stock.fixedBuyAmount === 'number' || typeof stock.fixedBuyAmount === 'string' ? stock.fixedBuyAmount : 0), // Use Decimal, allow string for loading old data
                            // --- ⬆️ 수정 ⬆️ ---
                            transactions: Array.isArray(stock.transactions) ? stock.transactions.map(tx => ({
                                id: tx.id || `tx-${nanoid()}`,
                                type: tx.type === 'sell' ? 'sell' : 'buy',
                                date: typeof tx.date === 'string' ? tx.date : new Date().toISOString().slice(0, 10),
                                // --- ⬇️ 수정: Decimal로 값 설정 ⬇️ ---
                                quantity: new Decimal(typeof tx.quantity === 'number' || typeof tx.quantity === 'string' ? tx.quantity : 0), // Use Decimal
                                price: new Decimal(typeof tx.price === 'number' || typeof tx.price === 'string' ? tx.price : 0), // Use Decimal
                                // --- ⬆️ 수정 ⬆️ ---
                            }))
                            // Ensure quantities/prices are valid Decimals before sorting or further processing
                            .filter(tx => tx.quantity.greaterThan(0) && tx.price.greaterThan(0)) // Filter out potentially invalid transactions after Decimal conversion
                            .sort((a, b) => a.date.localeCompare(b.date)) // Sort valid transactions by date
                            : []
                        })) : []
                    };
                    // Check transactions again to ensure Decimal conversion was successful
                    validatedPortfolios[newId].portfolioData.forEach(stock => {
                        stock.transactions = stock.transactions.filter(tx =>
                            tx.quantity instanceof Decimal && !tx.quantity.isNaN() &&
                            tx.price instanceof Decimal && !tx.price.isNaN()
                        );
                    });


                    if (newId === validatedActiveId) {
                        foundActive = true;
                    }
                } else {
                     console.warn(`Invalid portfolio structure skipped for ID: ${portId}`);
                }
            });
        }

        // 활성 ID가 유효하지 않으면 첫 번째 포트폴리오 ID로 설정
        if (!foundActive || !validatedPortfolios[validatedActiveId]) {
            const firstValidId = Object.keys(validatedPortfolios)[0];
            if (firstValidId) {
                console.warn(`Active portfolio ID '${validatedActiveId}' not found. Setting active ID to '${firstValidId}'.`);
                validatedActiveId = firstValidId;
            } else {
                 console.warn(`No valid portfolios loaded. Active ID set to null.`);
                validatedActiveId = null; // No valid portfolios at all
            }
        }

        // 최종 메타데이터 생성
        const validatedMeta = {
            activePortfolioId: validatedActiveId,
            version: currentVersion
        };


        return { meta: validatedMeta, portfolios: validatedPortfolios };
    }


    /**
     * @description 현재 활성화된 포트폴리오 객체를 반환합니다.
     * @returns {Portfolio | null} 활성 포트폴리오 또는 null
     */
    getActivePortfolio() {
        return this.#activePortfolioId ? this.#portfolios[this.#activePortfolioId] : null;
    }

    /**
     * @description 모든 포트폴리오 객체를 반환합니다. (읽기 전용 목적)
     * @returns {Readonly<Record<string, Portfolio>>} 포트폴리오 맵
     */
    getAllPortfolios() {
        return this.#portfolios; // Consider returning a deep clone if mutation is a risk
    }

    /**
     * @description 활성 포트폴리오 ID를 설정합니다.
     * @param {string} id - 새 활성 포트폴리오 ID
     */
    setActivePortfolioId(id) {
        if (this.#portfolios[id]) {
            this.#activePortfolioId = id;
            this.saveMeta();
        } else {
            ErrorService.handle(new Error(`Portfolio with ID ${id} not found.`), 'setActivePortfolioId');
        }
    }

    /**
     * @description 새 포트폴리오를 생성하고 활성화합니다.
     * @param {string} name - 새 포트폴리오 이름
     * @returns {Portfolio} 생성된 포트폴리오 객체
     */
    createNewPortfolio(name) {
        const newId = `p-${nanoid()}`;
        const newPortfolio = this._createDefaultPortfolio(newId, name);
        this.#portfolios[newId] = newPortfolio;
        this.#activePortfolioId = newId;
        this.savePortfolios();
        this.saveMeta();
        return newPortfolio;
    }

    /**
     * @description 특정 ID의 포트폴리오를 삭제합니다. 마지막 포트폴리오는 삭제할 수 없습니다.
     * @param {string} id - 삭제할 포트폴리오 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deletePortfolio(id) {
        if (Object.keys(this.#portfolios).length <= 1) {
            console.warn("Cannot delete the last portfolio.");
            return false; // 마지막 포트폴리오는 삭제 불가
        }
        if (!this.#portfolios[id]) {
             console.warn(`Portfolio with ID ${id} not found for deletion.`);
             return false; // 존재하지 않는 포트폴리오
        }

        delete this.#portfolios[id];

        // 삭제된 포트폴리오가 활성 상태였다면 다른 포트폴리오를 활성화
        if (this.#activePortfolioId === id) {
            this.#activePortfolioId = Object.keys(this.#portfolios)[0] || null;
            this.saveMeta();
        }
        this.savePortfolios();
        return true;
    }

    /**
     * @description 포트폴리오 이름을 변경합니다.
     * @param {string} id - 이름을 변경할 포트폴리오 ID
     * @param {string} newName - 새 이름
     */
    renamePortfolio(id, newName) {
        if (this.#portfolios[id]) {
            this.#portfolios[id].name = newName.trim();
            this.savePortfolios();
        } else {
             ErrorService.handle(new Error(`Portfolio with ID ${id} not found for renaming.`), 'renamePortfolio');
        }
    }

    /**
     * @description 활성 포트폴리오의 설정을 업데이트합니다.
     * @param {keyof PortfolioSettings} key - 업데이트할 설정 키
     * @param {PortfolioSettings[keyof PortfolioSettings]} value - 새 설정 값
     */
    updatePortfolioSettings(key, value) {
        const activePortfolio = this.getActivePortfolio();
        if (activePortfolio) {
            // 타입 검증 추가 (예시)
            if (key === 'exchangeRate' && (typeof value !== 'number' || value <= 0)) {
                 console.warn(`Invalid exchange rate value: ${value}. Using default.`);
                 activePortfolio.settings[key] = CONFIG.DEFAULT_EXCHANGE_RATE;
            } else if (key === 'mainMode' && !['add', 'sell'].includes(/** @type {string} */(value))) {
                 console.warn(`Invalid main mode value: ${value}. Using default.`);
                 activePortfolio.settings[key] = 'add';
            } else if (key === 'currentCurrency' && !['krw', 'usd'].includes(/** @type {string} */(value))) {
                 console.warn(`Invalid currency mode value: ${value}. Using default.`);
                 activePortfolio.settings[key] = 'krw';
            }
            else {
                activePortfolio.settings[key] = value;
            }
            this.saveActivePortfolio();
        }
    }


    /**
     * @description 활성 포트폴리오에 새 주식 항목을 추가합니다.
     * @returns {Stock | null} 추가된 주식 객체 또는 null
     */
    addNewStock() {
        const activePortfolio = this.getActivePortfolio();
        if (activePortfolio) {
            const newStock = this._createDefaultStock();
            activePortfolio.portfolioData.push(newStock);
            this.saveActivePortfolio();
            return newStock;
        }
        return null;
    }

    /**
     * @description 활성 포트폴리오에서 특정 주식을 삭제합니다. 마지막 주식은 삭제할 수 없습니다.
     * @param {string} stockId - 삭제할 주식 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteStock(stockId) {
        const activePortfolio = this.getActivePortfolio();
        if (activePortfolio) {
             if (activePortfolio.portfolioData.length <= 1) {
                 console.warn("Cannot delete the last stock in the portfolio.");
                 return false; // 마지막 주식은 삭제 불가
             }
            const initialLength = activePortfolio.portfolioData.length;
            activePortfolio.portfolioData = activePortfolio.portfolioData.filter(stock => stock.id !== stockId);

            if (activePortfolio.portfolioData.length < initialLength) {
                 this.saveActivePortfolio();
                 return true;
            } else {
                 console.warn(`Stock with ID ${stockId} not found for deletion.`);
                 return false; // 삭제할 주식이 없었음
            }
        }
        return false;
    }

    /**
     * @description 특정 주식 객체를 ID로 찾습니다.
     * @param {string} stockId - 찾을 주식 ID
     * @returns {Stock | undefined} 주식 객체 또는 undefined
     */
    getStockById(stockId) {
        const activePortfolio = this.getActivePortfolio();
        return activePortfolio?.portfolioData.find(s => s.id === stockId);
    }

    /**
     * @description 활성 포트폴리오 내 특정 주식의 속성을 업데이트합니다.
     * @param {string} stockId - 업데이트할 주식 ID
     * @param {keyof Stock | string} field - 업데이트할 속성 이름
     * @param {any} value - 새 값
     */
    updateStockProperty(stockId, field, value) {
        const activePortfolio = this.getActivePortfolio();
        if (activePortfolio) {
            const stockIndex = activePortfolio.portfolioData.findIndex(s => s.id === stockId);
            if (stockIndex > -1) {
                const stock = activePortfolio.portfolioData[stockIndex];
                // 숫자 필드는 Decimal로 변환 시도
                 if (['targetRatio', 'currentPrice', 'fixedBuyAmount'].includes(field)) {
                     try {
                         // Ensure value is not null/undefined before creating Decimal
                         const decimalValue = new Decimal(value ?? 0);
                         if (decimalValue.isNaN()) throw new Error('Invalid number for Decimal');
                          // @ts-ignore - Allow assignment based on field name
                         stock[field] = decimalValue;
                     } catch (e) {
                         ErrorService.handle(new Error(`Invalid numeric value for ${field}: ${value}`), 'updateStockProperty');
                         // Optionally reset to 0 or keep the old value
                          // @ts-ignore
                         stock[field] = new Decimal(0);
                     }
                 } else if (field === 'isFixedBuyEnabled') {
                      // @ts-ignore
                     stock[field] = Boolean(value);
                 } else if (typeof stock[field] !== 'undefined') { // Check if the field exists on the Stock type
                      // @ts-ignore
                     stock[field] = value;
                 } else {
                      console.warn(`Attempted to update non-existent property '${field}' on stock ${stockId}`);
                 }
                // No immediate save here, expects debouncedSave in controller or explicit save call
            }
        }
    }

    /**
     * @description 특정 주식에 거래 내역을 추가합니다.
     * @param {string} stockId - 주식 ID
     * @param {Omit<Transaction, 'id'>} transactionData - 거래 데이터 (ID 제외)
     * @returns {boolean} 추가 성공 여부
     */
    addTransaction(stockId, transactionData) {
        const stock = this.getStockById(stockId);
        if (stock) {
            // Validate transaction data before adding
            const validation = Validator.validateTransaction(transactionData);
            if (!validation.isValid) {
                 ErrorService.handle(new Error(`Invalid transaction data: ${validation.message}`), 'addTransaction');
                 return false;
            }

            const newTransaction = {
                ...transactionData,
                id: `tx-${nanoid()}`,
                 // Ensure quantity and price are Decimals
                 quantity: new Decimal(transactionData.quantity),
                 price: new Decimal(transactionData.price)
            };
            stock.transactions.push(newTransaction);
            // 거래 내역 추가 후 날짜순 정렬 유지
            stock.transactions.sort((a, b) => a.date.localeCompare(b.date));
            this.saveActivePortfolio();
            return true;
        }
        return false;
    }

    /**
     * @description 특정 주식에서 거래 내역을 삭제합니다.
     * @param {string} stockId - 주식 ID
     * @param {string} transactionId - 삭제할 거래 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteTransaction(stockId, transactionId) {
        const stock = this.getStockById(stockId);
        if (stock) {
            const initialLength = stock.transactions.length;
            stock.transactions = stock.transactions.filter(tx => tx.id !== transactionId);
            if (stock.transactions.length < initialLength) {
                 this.saveActivePortfolio();
                 return true;
            } else {
                 console.warn(`Transaction ID ${transactionId} not found for stock ${stockId}.`);
                 return false;
            }
        }
        return false;
    }

    /**
     * @description 특정 주식의 모든 거래 내역을 반환합니다.
     * @param {string} stockId - 주식 ID
     * @returns {Transaction[]} 거래 내역 배열 (없으면 빈 배열)
     */
    getTransactions(stockId) {
        const stock = this.getStockById(stockId);
        return stock ? [...stock.transactions] : []; // Return a copy
    }


    /**
     * @description 활성 포트폴리오의 목표 비율 합계가 100%가 되도록 정규화합니다.
     * @returns {boolean} 정규화 실행 여부 (비율 0인 경우 false)
     */
    normalizeRatios() {
        const activePortfolio = this.getActivePortfolio();
        if (!activePortfolio || activePortfolio.portfolioData.length === 0) return false;

        const totalRatio = activePortfolio.portfolioData.reduce((sum, stock) => sum.plus(stock.targetRatio || 0), new Decimal(0));

        if (totalRatio.isZero() || totalRatio.isNaN()) {
            console.warn("Total target ratio is zero or NaN, cannot normalize.");
            return false; // 0으로 나눌 수 없음
        }

        const factor = new Decimal(100).div(totalRatio);
        activePortfolio.portfolioData.forEach(stock => {
            stock.targetRatio = new Decimal(stock.targetRatio || 0).times(factor).toDecimalPlaces(2).toNumber(); // 소수점 2자리까지 반올림
        });

        // 정규화 후 합계가 정확히 100이 아닐 수 있는 미세 오차 조정 (가장 큰 비율 항목에 추가/감산)
        let newSum = activePortfolio.portfolioData.reduce((sum, stock) => sum.plus(stock.targetRatio || 0), new Decimal(0));
        let diff = new Decimal(100).minus(newSum);

        if (!diff.isZero() && activePortfolio.portfolioData.length > 0) {
             // Find stock with the largest target ratio to adjust
             let stockToAdjust = activePortfolio.portfolioData.reduce((maxStock, currentStock) => {
                 return (currentStock.targetRatio > maxStock.targetRatio) ? currentStock : maxStock;
             }, activePortfolio.portfolioData[0]);

             stockToAdjust.targetRatio = new Decimal(stockToAdjust.targetRatio).plus(diff).toDecimalPlaces(2).toNumber();
        }


        // No immediate save here, controller should handle saving
        return true;
    }

    /**
     * @description 모든 포트폴리오 데이터를 초기 상태로 리셋합니다.
     * @param {boolean} [save=true] - 리셋 후 즉시 저장할지 여부
     */
    resetData(save = true) {
        const defaultPortfolio = this._createDefaultPortfolio(`p-${nanoid()}`);
        this.#portfolios = { [defaultPortfolio.id]: defaultPortfolio };
        this.#activePortfolioId = defaultPortfolio.id;
        if (save) {
            this.savePortfolios();
            this.saveMeta();
        }
        console.log("Data reset to default.");
    }

    /**
     * @description 데이터를 JSON 파일로 내보내기 위한 객체를 생성합니다.
     * @returns {{meta: MetaState, portfolios: Record<string, Portfolio>}} 내보낼 데이터
     */
    exportData() {
        // Ensure Decimals are converted to strings/numbers for JSON compatibility
         const exportablePortfolios = {};
         Object.entries(this.#portfolios).forEach(([id, portfolio]) => {
             exportablePortfolios[id] = {
                 ...portfolio,
                 portfolioData: portfolio.portfolioData.map(stock => ({
                     ...stock,
                     // Convert Decimal fields back to number for export
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

    /**
     * @description JSON 파일에서 데이터를 가져와 현재 상태에 병합/교체합니다. (구조 검증 포함)
     * @param {any} importedData - JSON.parse로 읽어온 데이터
     * @returns {Promise<void>}
     */
    async importData(importedData) {
         // Use Validator to check structure
         if (!Validator.isDataStructureValid(importedData)) {
            throw new Error("Imported data structure is invalid.");
         }

        // Validate and upgrade/sanitize the imported data
        const { meta, portfolios } = this._validateAndUpgradeData(importedData.meta, importedData.portfolios);

        // Replace current state
        this.#portfolios = portfolios;
        this.#activePortfolioId = meta.activePortfolioId;

        // Ensure at least one portfolio exists after import, otherwise reset
        if (Object.keys(this.#portfolios).length === 0 || !this.#portfolios[this.#activePortfolioId]) {
            console.warn("Imported data resulted in no valid portfolios. Resetting to default.");
            this.resetData(false); // Reset without saving yet
        }

        // Save the imported and validated data
        this.savePortfolios();
        this.saveMeta();
        console.log("Data imported successfully.");
        // Reload or re-render might be needed in the controller
    }


    /**
     * @description 현재 메타데이터를 로컬 스토리지에 저장합니다.
     */
    saveMeta() {
        try {
            const metaData = { activePortfolioId: this.#activePortfolioId, version: CONFIG.DATA_VERSION };
            localStorage.setItem(CONFIG.LOCAL_STORAGE_META_KEY, JSON.stringify(metaData));
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), 'saveMeta');
        }
    }

    /**
     * @description 모든 포트폴리오 데이터를 로컬 스토리지에 저장합니다. (Decimal -> number 변환 포함)
     */
    savePortfolios() {
        try {
            // Convert Decimal back to number before saving
             const saveablePortfolios = {};
             Object.entries(this.#portfolios).forEach(([id, portfolio]) => {
                 saveablePortfolios[id] = {
                     ...portfolio,
                     portfolioData: portfolio.portfolioData.map(stock => ({
                         ...stock,
                         // Convert Decimal fields
                         fixedBuyAmount: stock.fixedBuyAmount.toNumber(),
                         transactions: stock.transactions.map(tx => ({
                             ...tx,
                             quantity: tx.quantity.toNumber(),
                             price: tx.price.toNumber(),
                         }))
                     }))
                 };
             });
            localStorage.setItem(CONFIG.LOCAL_STORAGE_PORTFOLIOS_KEY, JSON.stringify(saveablePortfolios));
        } catch (error) {
             // Handle potential quota exceeded error
             if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                 ErrorService.handle(error, 'savePortfolios - Quota Exceeded');
             } else {
                 ErrorService.handle(/** @type {Error} */ (error), 'savePortfolios');
             }
        }
    }

    /**
     * @description 현재 활성 포트폴리오 데이터만 로컬 스토리지에 저장합니다. (효율적)
     * @remarks 이 함수는 개별 포트폴리오를 별도 키로 저장하는 경우 유용하지만,
     * 현재 구조에서는 전체 포트폴리오를 저장하는 savePortfolios가 더 적합합니다.
     * savePortfolios를 호출하도록 변경합니다.
     */
    saveActivePortfolio() {
        // const activePortfolio = this.getActivePortfolio();
        // if (activePortfolio) {
        //     try {
        //         localStorage.setItem(CONFIG.LOCAL_STORAGE_PORTFOLIOS_KEY + activePortfolio.id, JSON.stringify(activePortfolio));
        //     } catch (error) {
        //        ErrorService.handle(/** @type {Error} */ (error), 'saveActivePortfolio');
        //     }
        // }
        // --- ⬇️ 전체 저장으로 변경 ⬇️ ---
        this.savePortfolios();
        // --- ⬆️ 전체 저장으로 변경 ⬆️ ---
    }

    // --- Private Helper Methods ---

    /**
     * @description 기본 포트폴리오 객체를 생성합니다.
     * @param {string} id - 포트폴리오 ID
     * @param {string} [name] - 포트폴리오 이름 (없으면 기본값 사용)
     * @returns {Portfolio} 기본 포트폴리오 객체
     * @private
     */
    _createDefaultPortfolio(id, name = t('defaults.defaultPortfolioName')) {
        return {
            id: id,
            name: name,
            settings: {
                mainMode: 'add',
                currentCurrency: 'krw',
                exchangeRate: CONFIG.DEFAULT_EXCHANGE_RATE,
            },
            portfolioData: [this._createDefaultStock()] // 기본 주식 1개 포함
        };
    }

    /**
     * @description 기본 주식 객체를 생성합니다.
     * @returns {Stock} 기본 주식 객체
     * @private
     */
    _createDefaultStock() {
        return {
            id: `s-${nanoid()}`,
            name: t('defaults.newStock'),
            ticker: '',
            sector: '', // 기본 섹터는 비워둠
            targetRatio: 0,
            currentPrice: 0,
            isFixedBuyEnabled: false,
            fixedBuyAmount: new Decimal(0), // Use Decimal
            transactions: []
        };
    }
}