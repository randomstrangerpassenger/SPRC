// src/state.ts
import Decimal from 'decimal.js';
import { CONFIG } from './constants.ts';
import { t } from './i18n.ts';
import { ErrorService } from './errorService.ts';
import { Validator } from './validator.ts';
import { generateId } from './utils.ts';
import type { Stock, Transaction, Portfolio, PortfolioSettings, MetaState } from './types.ts';
import { createDefaultPortfolio, createDefaultStock } from './state/helpers.ts';
import { validateAndUpgradeData } from './state/validation.ts';
import { PersistenceRepository } from './state/PersistenceRepository.ts';

export class PortfolioState {
    #portfolios: Record<string, Portfolio> = {};
    #activePortfolioId: string | null = null;
    #initializationPromise: Promise<void> | null = null;
    #persistenceRepo: PersistenceRepository;

    constructor() {
        this.#persistenceRepo = new PersistenceRepository();
        this.#initializationPromise = this._initialize();
    }

    /**
     * @description public async 메서드로 변경
     */
    async ensureInitialized(): Promise<void> {
        await this.#initializationPromise;
    }

    /**
     * @description 비동기 초기화 및 LocalStorage 마이그레이션 로직
     */
    async _initialize(): Promise<void> {
        try {
            // IndexedDB에서 데이터 로드 시도
            let loadedMetaData = await this._loadMeta();
            let loadedPortfolios = await this._loadPortfolios();

            // IDB에 데이터가 없는 경우, LocalStorage에서 마이그레이션 시도
            if (
                !loadedMetaData ||
                !loadedPortfolios ||
                Object.keys(loadedPortfolios).length === 0
            ) {
                console.log('IndexedDB empty. Attempting migration from LocalStorage...');
                const migrated = await this._migrateFromLocalStorage();

                if (migrated) {
                    console.log('Migration successful. Reloading from IndexedDB.');
                    loadedMetaData = await this._loadMeta();
                    loadedPortfolios = await this._loadPortfolios();
                }
            }

            // 데이터 유효성 검사 (소독 포함) - validation 모듈 사용
            const { meta, portfolios } = validateAndUpgradeData(loadedMetaData, loadedPortfolios);

            this.#portfolios = portfolios;
            this.#activePortfolioId = meta.activePortfolioId;

            // 유효한 데이터가 전혀 없으면 기본값 생성 (비동기 저장)
            if (
                Object.keys(this.#portfolios).length === 0 ||
                !this.#portfolios[this.#activePortfolioId]
            ) {
                console.warn(
                    'No valid portfolios found or active ID invalid. Creating default portfolio.'
                );
                await this.resetData(false); // resetData를 async로 변경
            }

            console.log('PortfolioState initialized (async).');
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ error, '_initialize');
            console.error('Initialization failed, resetting data.');
            await this.resetData(false); // resetData를 async로 변경
        }
    }

    /**
     * @description LocalStorage -> IndexedDB 마이그레이션 (PersistenceRepository 위임)
     */
    async _migrateFromLocalStorage(): Promise<boolean> {
        return await this.#persistenceRepo.migrateFromLocalStorage();
    }

    /**
     * @description IDB에서 Meta 로드 (PersistenceRepository 위임)
     */
    async _loadMeta(): Promise<MetaState | null> {
        return await this.#persistenceRepo.loadMeta();
    }

    /**
     * @description IDB에서 Portfolios 로드 (PersistenceRepository 위임)
     */
    async _loadPortfolios(): Promise<Record<string, Portfolio> | null> {
        return await this.#persistenceRepo.loadPortfolios();
    }

    // Phase 2-2: _validateAndUpgradeData 제거 (state/validation.ts로 이동)

    getActivePortfolio(): Portfolio | null {
        return this.#activePortfolioId ? this.#portfolios[this.#activePortfolioId] : null;
    }

    getAllPortfolios(): Record<string, Portfolio> {
        return this.#portfolios;
    }

    async setActivePortfolioId(id: string): Promise<void> {
        if (this.#portfolios[id]) {
            this.#activePortfolioId = id;
            await this.saveMeta(); // 비동기 저장
        } else {
            ErrorService.handle(
                new Error(`Portfolio with ID ${id} not found.`),
                'setActivePortfolioId'
            );
        }
    }

    async createNewPortfolio(name: string): Promise<Portfolio> {
        const newId = `p-${generateId()}`;
        // helpers 모듈 사용
        const newPortfolio = createDefaultPortfolio(newId, name);
        this.#portfolios[newId] = newPortfolio;
        this.#activePortfolioId = newId;
        await this.savePortfolios(); // 비동기 저장
        await this.saveMeta(); // 비동기 저장
        return newPortfolio;
    }

    async deletePortfolio(id: string): Promise<boolean> {
        if (Object.keys(this.#portfolios).length <= 1) {
            console.warn('Cannot delete the last portfolio.');
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

    async renamePortfolio(id: string, newName: string): Promise<void> {
        if (this.#portfolios[id]) {
            this.#portfolios[id].name = newName.trim();
            await this.savePortfolios(); // 비동기 저장
        } else {
            ErrorService.handle(
                new Error(`Portfolio with ID ${id} not found for renaming.`),
                'renamePortfolio'
            );
        }
    }

    async updatePortfolioSettings<K extends keyof PortfolioSettings>(
        key: K,
        value: PortfolioSettings[K]
    ): Promise<void> {
        const activePortfolio = this.getActivePortfolio();
        console.log(`[DEBUG] updatePortfolioSettings called: key=${key}, value=${value}`);
        if (activePortfolio) {
            if (key === 'exchangeRate' && (typeof value !== 'number' || value <= 0)) {
                activePortfolio.settings[key] =
                    CONFIG.DEFAULT_EXCHANGE_RATE as PortfolioSettings[K];
            } else if (key === 'mainMode' && !['add', 'sell', 'simple'].includes(value as string)) {
                console.log(`[DEBUG] Invalid mainMode detected: ${value}, resetting to 'add'`);
                activePortfolio.settings[key] = 'add' as PortfolioSettings[K];
            } else if (key === 'currentCurrency' && !['krw', 'usd'].includes(value as string)) {
                activePortfolio.settings[key] = 'krw' as PortfolioSettings[K];
            } else {
                console.log(`[DEBUG] Setting ${key} = ${value}`);
                activePortfolio.settings[key] = value;
            }
            console.log(`[DEBUG] After update, mainMode = ${activePortfolio.settings.mainMode}`);
            await this.saveActivePortfolio(); // 비동기 저장
        }
    }

    async addNewStock(): Promise<Stock | null> {
        const activePortfolio = this.getActivePortfolio();
        if (activePortfolio) {
            // helpers 모듈 사용
            const newStock = createDefaultStock();
            activePortfolio.portfolioData.push(newStock);
            await this.saveActivePortfolio(); // 비동기 저장
            return newStock;
        }
        return null;
    }

    async deleteStock(stockId: string): Promise<boolean> {
        const activePortfolio = this.getActivePortfolio();
        if (activePortfolio) {
            if (activePortfolio.portfolioData.length <= 1) {
                console.warn('Cannot delete the last stock in the portfolio.');
                return false;
            }
            const initialLength = activePortfolio.portfolioData.length;
            activePortfolio.portfolioData = activePortfolio.portfolioData.filter(
                (stock) => stock.id !== stockId
            );

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

    getStockById(stockId: string): Stock | undefined {
        const activePortfolio = this.getActivePortfolio();
        return activePortfolio?.portfolioData.find((s) => s.id === stockId);
    }

    updateStockProperty(
        stockId: string,
        field: keyof Stock,
        value: string | number | boolean | Decimal
    ): void {
        const activePortfolio = this.getActivePortfolio();
        if (activePortfolio) {
            const stockIndex = activePortfolio.portfolioData.findIndex((s) => s.id === stockId);
            if (stockIndex > -1) {
                const stock = activePortfolio.portfolioData[stockIndex];

                // Type-safe property updates with type guards
                if (field === 'targetRatio' || field === 'currentPrice' || field === 'fixedBuyAmount' || field === 'manualAmount') {
                    try {
                        const decimalValue = new Decimal(value ?? 0);
                        if (decimalValue.isNaN()) throw new Error('Invalid number for Decimal');
                        stock[field] = decimalValue;
                    } catch (e) {
                        ErrorService.handle(
                            new Error(`Invalid numeric value for ${field}: ${value}`),
                            'updateStockProperty'
                        );
                        stock[field] = new Decimal(0);
                    }
                } else if (field === 'isFixedBuyEnabled') {
                    stock[field] = Boolean(value);
                } else if (field === 'name' || field === 'ticker' || field === 'sector') {
                    stock[field] = String(value);
                } else if (field === 'id') {
                    // ID should not be changed, log warning
                    console.warn(`Attempted to change immutable field 'id' on stock ${stockId}`);
                } else if (field === 'transactions') {
                    // Transactions should not be directly set, use addTransaction/deleteTransaction
                    console.warn(`Attempted to directly set 'transactions' on stock ${stockId}. Use addTransaction/deleteTransaction instead.`);
                } else {
                    // TypeScript will catch any fields not handled above
                    const _exhaustiveCheck: never = field;
                    console.warn(`Unhandled field '${_exhaustiveCheck}' on stock ${stockId}`);
                }
            }
        }
    }

    async addTransaction(stockId: string, transactionData: Partial<Transaction>): Promise<boolean> {
        const stock = this.getStockById(stockId);
        if (stock) {
            const validation = Validator.validateTransaction({
                ...transactionData,
                quantity: transactionData.quantity,
                price: transactionData.price,
            });
            if (!validation.isValid) {
                ErrorService.handle(
                    new Error(`Invalid transaction data: ${validation.message}`),
                    'addTransaction'
                );
                return false;
            }

            try {
                const newTransaction = {
                    ...transactionData,
                    id: `tx-${generateId()}`,
                    quantity: new Decimal(transactionData.quantity),
                    price: new Decimal(transactionData.price),
                };
                if (newTransaction.quantity.isNaN() || newTransaction.price.isNaN()) {
                    throw new Error('Quantity or Price resulted in NaN after Decimal conversion.');
                }

                stock.transactions.push(newTransaction);
                stock.transactions.sort((a, b) => a.date.localeCompare(b.date));
                await this.saveActivePortfolio(); // 비동기 저장
                return true;
            } catch (e) {
                ErrorService.handle(
                    new Error(`Error converting transaction data to Decimal: ${e.message}`),
                    'addTransaction'
                );
                return false;
            }
        }
        return false;
    }

    async deleteTransaction(stockId: string, transactionId: string): Promise<boolean> {
        const stock = this.getStockById(stockId);
        if (stock) {
            const initialLength = stock.transactions.length;
            stock.transactions = stock.transactions.filter((tx) => tx.id !== transactionId);
            if (stock.transactions.length < initialLength) {
                await this.saveActivePortfolio(); // 비동기 저장
                return true;
            } else {
                console.warn(
                    `State: Transaction ID ${transactionId} not found for stock ${stockId}.`
                );
                return false;
            }
        }
        console.error(`State: Stock with ID ${stockId} not found.`);
        return false;
    }

    getTransactions(stockId: string): Transaction[] {
        const stock = this.getStockById(stockId);
        const transactions = stock ? [...stock.transactions] : []; // Return a copy
        return transactions;
    }

    normalizeRatios(): boolean {
        const activePortfolio = this.getActivePortfolio();
        if (!activePortfolio || activePortfolio.portfolioData.length === 0) return false;

        let totalRatio = new Decimal(0);
        activePortfolio.portfolioData.forEach((stock) => {
            const ratio =
                stock.targetRatio instanceof Decimal
                    ? stock.targetRatio
                    : new Decimal(stock.targetRatio || 0);
            totalRatio = totalRatio.plus(ratio);
        });

        if (totalRatio.isZero() || totalRatio.isNaN()) {
            console.warn('Total target ratio is zero or NaN, cannot normalize.');
            return false;
        }

        const factor = new Decimal(100).div(totalRatio);
        activePortfolio.portfolioData.forEach((stock) => {
            const currentRatio =
                stock.targetRatio instanceof Decimal
                    ? stock.targetRatio
                    : new Decimal(stock.targetRatio || 0);
            stock.targetRatio = currentRatio.times(factor).toDecimalPlaces(2); // Keep as Decimal
        });

        let newSum = new Decimal(0);
        activePortfolio.portfolioData.forEach((stock) => {
            newSum = newSum.plus(stock.targetRatio);
        });
        const diff = new Decimal(100).minus(newSum);

        if (!diff.isZero() && activePortfolio.portfolioData.length > 0) {
            const stockToAdjust = activePortfolio.portfolioData.reduce((maxStock, currentStock) => {
                const currentRatio =
                    currentStock.targetRatio instanceof Decimal
                        ? currentStock.targetRatio
                        : new Decimal(0);
                const maxRatio =
                    maxStock.targetRatio instanceof Decimal ? maxStock.targetRatio : new Decimal(0);
                return currentRatio.greaterThan(maxRatio) ? currentStock : maxStock;
            }, activePortfolio.portfolioData[0]);

            const currentAdjustRatio =
                stockToAdjust.targetRatio instanceof Decimal
                    ? stockToAdjust.targetRatio
                    : new Decimal(stockToAdjust.targetRatio || 0);
            stockToAdjust.targetRatio = currentAdjustRatio.plus(diff).toDecimalPlaces(2);
        }

        return true;
    }

    async resetData(save: boolean = true): Promise<void> {
        // helpers 모듈 사용 (generateId는 helpers에서 사용)
        const defaultPortfolio = createDefaultPortfolio(`p-${Date.now()}`);
        this.#portfolios = { [defaultPortfolio.id]: defaultPortfolio };
        this.#activePortfolioId = defaultPortfolio.id;
        if (save) {
            await this.savePortfolios(); // 비동기 저장
            await this.saveMeta(); // 비동기 저장
        }
        console.log('Data reset to default.');
    }

    exportData(): { meta: MetaState; portfolios: Record<string, Portfolio> } {
        const exportablePortfolios: Record<string, Portfolio> = {};
        Object.entries(this.#portfolios).forEach(([id, portfolio]) => {
            exportablePortfolios[id] = {
                ...portfolio,
                portfolioData: portfolio.portfolioData.map((stock) => ({
                    ...stock,
                    targetRatio: stock.targetRatio.toNumber(),
                    currentPrice: stock.currentPrice.toNumber(),
                    fixedBuyAmount: stock.fixedBuyAmount.toNumber(),
                    manualAmount: stock.manualAmount !== undefined ? (typeof stock.manualAmount === 'number' ? stock.manualAmount : stock.manualAmount.toNumber()) : undefined,
                    transactions: stock.transactions.map((tx) => ({
                        ...tx,
                        quantity: typeof tx.quantity === 'number' ? tx.quantity : tx.quantity.toNumber(),
                        price: typeof tx.price === 'number' ? tx.price : tx.price.toNumber(),
                    })),
                })),
            };
        });

        return {
            meta: { activePortfolioId: this.#activePortfolioId, version: CONFIG.DATA_VERSION },
            portfolios: exportablePortfolios,
        };
    }

    async importData(importedData: unknown): Promise<void> {
        if (!Validator.isDataStructureValid(importedData)) {
            throw new Error('Imported data structure is invalid.');
        }

        // validation 모듈이 소독을 처리
        const { meta, portfolios } = validateAndUpgradeData(
            importedData.meta,
            importedData.portfolios
        );

        this.#portfolios = portfolios;
        this.#activePortfolioId = meta.activePortfolioId;

        if (
            Object.keys(this.#portfolios).length === 0 ||
            !this.#portfolios[this.#activePortfolioId]
        ) {
            console.warn('Imported data resulted in no valid portfolios. Resetting to default.');
            await this.resetData(false); // 비동기 리셋
        }

        await this.savePortfolios(); // 비동기 저장
        await this.saveMeta(); // 비동기 저장
        console.log('Data imported successfully.');
    }

    async saveMeta(): Promise<void> {
        await this.#persistenceRepo.saveMeta(this.#activePortfolioId);
    }

    async savePortfolios(): Promise<void> {
        await this.#persistenceRepo.savePortfolios(this.#portfolios);
    }

    async saveActivePortfolio(): Promise<void> {
        await this.savePortfolios();
    }

    // --- Private Helper Methods ---

}