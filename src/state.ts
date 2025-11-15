// src/state.ts
import Decimal from 'decimal.js';
import { CONFIG } from './constants';
import { t } from './i18n';
import { Validator } from './validator';
import { generateId } from './utils';
import type { Stock, Transaction, Portfolio, PortfolioSettings, MetaState } from './types';
import { createDefaultPortfolio, createDefaultStock } from './state/helpers';
import { validateAndUpgradeData } from './state/validation';
import { PortfolioRepository } from './state/PortfolioRepository';
import { logger } from './services/Logger';

export class PortfolioState {
    #portfolios: Record<string, Portfolio> = {};
    #activePortfolioId: string | null = null;
    #initializationPromise: Promise<void> | null = null;
    #portfolioRepo: PortfolioRepository;

    constructor() {
        this.#portfolioRepo = new PortfolioRepository();
        this.#initializationPromise = this._initialize();
    }

    /**
     * @description Ensure state initialization is complete before use
     */
    async ensureInitialized(): Promise<void> {
        await this.#initializationPromise;
    }

    /**
     * @description Async initialization and LocalStorage migration logic
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
                logger.info(
                    'IndexedDB empty. Attempting migration from LocalStorage...',
                    'PortfolioState'
                );
                const migrated = await this._migrateFromLocalStorage();

                if (migrated) {
                    logger.info(
                        'Migration successful. Reloading from IndexedDB.',
                        'PortfolioState'
                    );
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
                logger.warn(
                    'No valid portfolios found or active ID invalid. Creating default portfolio.',
                    'PortfolioState'
                );
                await this.resetData(false); // resetData를 async로 변경
            }

            logger.info('PortfolioState initialized (async).', 'PortfolioState');
        } catch (error) {
            logger.error('Initialization failed, resetting data.', 'PortfolioState._initialize', error);
            await this.resetData(false); // resetData를 async로 변경
        }
    }

    /**
     * @description Migrate data from LocalStorage to IndexedDB (delegated to PortfolioRepository)
     */
    async _migrateFromLocalStorage(): Promise<boolean> {
        return await this.#portfolioRepo.migrateFromLocalStorage();
    }

    /**
     * @description Load meta state from IndexedDB (delegated to PortfolioRepository)
     */
    async _loadMeta(): Promise<MetaState | null> {
        return await this.#portfolioRepo.loadMeta();
    }

    /**
     * @description IDB에서 Portfolios 로드 (PortfolioRepository 위임)
     */
    async _loadPortfolios(): Promise<Record<string, Portfolio> | null> {
        return await this.#portfolioRepo.loadPortfolios();
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
            logger.error(
                `Portfolio with ID ${id} not found`,
                'PortfolioState.setActivePortfolioId',
                new Error(`Portfolio not found: ${id}`)
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
            logger.warn('Cannot delete the last portfolio.', 'PortfolioState');
            return false;
        }
        if (!this.#portfolios[id]) {
            logger.warn(`Portfolio with ID ${id} not found for deletion.`, 'PortfolioState');
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
            logger.error(
                `Portfolio with ID ${id} not found for renaming`,
                'PortfolioState.renamePortfolio',
                new Error(`Portfolio not found: ${id}`)
            );
        }
    }

    async updatePortfolioSettings<K extends keyof PortfolioSettings>(
        key: K,
        value: PortfolioSettings[K]
    ): Promise<void> {
        const activePortfolio = this.getActivePortfolio();
        logger.debug(
            `updatePortfolioSettings called: key=${key}, value=${value}`,
            'PortfolioState'
        );
        if (activePortfolio) {
            if (key === 'exchangeRate' && (typeof value !== 'number' || value <= 0)) {
                activePortfolio.settings[key] =
                    CONFIG.DEFAULT_EXCHANGE_RATE as PortfolioSettings[K];
            } else if (key === 'mainMode' && !['add', 'sell', 'simple'].includes(value as string)) {
                logger.debug(
                    `Invalid mainMode detected: ${value}, resetting to 'add'`,
                    'PortfolioState'
                );
                activePortfolio.settings[key] = 'add' as PortfolioSettings[K];
            } else if (key === 'currentCurrency' && !['krw', 'usd'].includes(value as string)) {
                activePortfolio.settings[key] = 'krw' as PortfolioSettings[K];
            } else {
                logger.debug(`Setting ${key} = ${value}`, 'PortfolioState');
                activePortfolio.settings[key] = value;
            }
            logger.debug(
                `After update, mainMode = ${activePortfolio.settings.mainMode}`,
                'PortfolioState'
            );
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
                logger.warn('Cannot delete the last stock in the portfolio.', 'PortfolioState');
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
                logger.warn(`Stock with ID ${stockId} not found for deletion.`, 'PortfolioState');
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
                if (
                    field === 'targetRatio' ||
                    field === 'currentPrice' ||
                    field === 'fixedBuyAmount' ||
                    field === 'manualAmount'
                ) {
                    try {
                        const decimalValue = new Decimal(value ?? 0);
                        if (decimalValue.isNaN()) throw new Error('Invalid number for Decimal');
                        stock[field] = decimalValue;
                    } catch (error) {
                        logger.error(
                            `Invalid numeric value for ${field}: ${value}`,
                            'PortfolioState.updateStockProperty',
                            error
                        );
                        stock[field] = new Decimal(0);
                    }
                } else if (field === 'isFixedBuyEnabled') {
                    stock[field] = Boolean(value);
                } else if (field === 'name' || field === 'ticker' || field === 'sector') {
                    stock[field] = String(value);
                } else if (field === 'id') {
                    // ID should not be changed, log warning
                    logger.warn(
                        `Attempted to change immutable field 'id' on stock ${stockId}`,
                        'PortfolioState'
                    );
                } else if (field === 'transactions') {
                    // Transactions should not be directly set, use addTransaction/deleteTransaction
                    logger.warn(
                        `Attempted to directly set 'transactions' on stock ${stockId}. Use addTransaction/deleteTransaction instead.`,
                        'PortfolioState'
                    );
                } else {
                    // TypeScript will catch any fields not handled above
                    const _exhaustiveCheck: never = field;
                    logger.warn(
                        `Unhandled field '${_exhaustiveCheck}' on stock ${stockId}`,
                        'PortfolioState'
                    );
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
                logger.error(
                    `Invalid transaction data: ${validation.message}`,
                    'PortfolioState.addTransaction',
                    new Error(validation.message)
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
            } catch (error) {
                logger.error(
                    'Error converting transaction data to Decimal',
                    'PortfolioState.addTransaction',
                    error
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
                logger.warn(
                    `Transaction ID ${transactionId} not found for stock ${stockId}.`,
                    'PortfolioState'
                );
                return false;
            }
        }
        logger.error(`Stock with ID ${stockId} not found.`, 'PortfolioState');
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
            logger.warn('Total target ratio is zero or NaN, cannot normalize.', 'PortfolioState');
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
        logger.info('Data reset to default.', 'PortfolioState');
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
                    manualAmount:
                        stock.manualAmount !== undefined
                            ? typeof stock.manualAmount === 'number'
                                ? stock.manualAmount
                                : stock.manualAmount.toNumber()
                            : undefined,
                    transactions: stock.transactions.map((tx) => ({
                        ...tx,
                        quantity:
                            typeof tx.quantity === 'number' ? tx.quantity : tx.quantity.toNumber(),
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
            logger.warn(
                'Imported data resulted in no valid portfolios. Resetting to default.',
                'PortfolioState'
            );
            await this.resetData(false); // 비동기 리셋
        }

        await this.savePortfolios(); // 비동기 저장
        await this.saveMeta(); // 비동기 저장
        logger.info('Data imported successfully.', 'PortfolioState');
    }

    async saveMeta(): Promise<void> {
        await this.#portfolioRepo.saveMeta(this.#activePortfolioId);
    }

    async savePortfolios(): Promise<void> {
        await this.#portfolioRepo.savePortfolios(this.#portfolios);
    }

    async saveActivePortfolio(): Promise<void> {
        await this.savePortfolios();
    }

    // --- Private Helper Methods ---
}
