// src/calculator.ts
import Decimal from 'decimal.js';
import { generateId } from './utils';
import { CONFIG, DECIMAL_ZERO, DECIMAL_HUNDRED, CACHE } from './constants';
import { ErrorService } from './errorService';
import { LRUCache } from './cache/LRUCache';
import { logger } from './services/Logger';
import type {
    Stock,
    CalculatedStock,
    CalculatedStockMetrics,
    Currency,
    PortfolioSnapshot,
} from './types';
import type { IRebalanceStrategy } from './calculationStrategies';

/**
 * @description Generates cache key based on stock ID and current price combination
 */
function _generateStockKey(stock: Stock): string {
    // Combine all transaction IDs to detect modifications/deletions of intermediate transactions
    const txIds = stock.transactions.map((tx) => tx.id).join(',');

    // Exclude sector information as it does not affect calculations
    return `${stock.id}:${stock.currentPrice}:${txIds}`;
}

/**
 * @description Generates cache key for entire portfolio
 * Optimization: Sort IDs only instead of full objects, reducing O(n log n) to O(n + k log k) (k=number of stocks)
 */
function _generatePortfolioKey(
    portfolioData: Stock[],
    exchangeRate: number,
    currentCurrency: Currency
): string {
    // Create ID -> stock key mapping using Map (O(n))
    const stockKeyMap = new Map<string, string>();
    for (const stock of portfolioData) {
        stockKeyMap.set(stock.id, _generateStockKey(stock));
    }

    // Sort IDs only (O(k log k), k = number of stocks, faster than sorting objects)
    const sortedIds = Array.from(stockKeyMap.keys()).sort();

    // Combine keys in sorted ID order (O(k))
    const stockKeys = sortedIds.map((id) => stockKeyMap.get(id)!).join('|');
    const settingsKey = `${exchangeRate}:${currentCurrency}`;
    return `${stockKeys}|${settingsKey}`;
}

export interface PortfolioCalculationResult {
    portfolioData: CalculatedStock[];
    currentTotal: Decimal;
    cacheKey: string;
}

export class Calculator {
    // Store multiple calculation results using LRU cache
    static #portfolioCache = new LRUCache<string, PortfolioCalculationResult>(
        CACHE.PORTFOLIO_CACHE_SIZE
    );

    // Sector analysis result cache
    static #sectorAnalysisCache = new LRUCache<
        string,
        { sector: string; amount: Decimal; percentage: Decimal }[]
    >(20);

    /**
     * @description Calculates average purchase price, current value, profit/loss for a single stock
     * @important stock.currentPrice must always be stored in USD
     * Currency display is handled in calculatePortfolioState by applying exchange rates
     */
    /**
     * @description Aggregate transaction data (buy/sell/dividend)
     */
    private static aggregateTransactions(
        transactions: Transaction[]
    ): Pick<
        CalculatedStockMetrics,
        | 'totalBuyQuantity'
        | 'totalSellQuantity'
        | 'totalBuyAmount'
        | 'totalSellAmount'
        | 'totalDividends'
    > {
        const result = {
            totalBuyQuantity: DECIMAL_ZERO,
            totalSellQuantity: DECIMAL_ZERO,
            totalBuyAmount: DECIMAL_ZERO,
            totalSellAmount: DECIMAL_ZERO,
            totalDividends: DECIMAL_ZERO,
        };

        for (const tx of transactions) {
            const txQuantity = new Decimal(tx.quantity || 0);
            const txPrice = new Decimal(tx.price || 0);

            if (tx.type === 'buy') {
                result.totalBuyQuantity = result.totalBuyQuantity.plus(txQuantity);
                result.totalBuyAmount = result.totalBuyAmount.plus(txQuantity.times(txPrice));
            } else if (tx.type === 'sell') {
                result.totalSellQuantity = result.totalSellQuantity.plus(txQuantity);
                result.totalSellAmount = result.totalSellAmount.plus(txQuantity.times(txPrice));
            } else if (tx.type === 'dividend') {
                result.totalDividends = result.totalDividends.plus(txQuantity.times(txPrice));
            }
        }

        return result;
    }

    /**
     * @description Calculate stock indicators (quantity, avgBuyPrice, profitLoss, etc.)
     */
    private static calculateStockIndicators(
        aggregated: ReturnType<typeof Calculator.aggregateTransactions>,
        currentPrice: Decimal
    ): CalculatedStockMetrics {
        const quantity = Decimal.max(0, aggregated.totalBuyQuantity.minus(aggregated.totalSellQuantity));

        const avgBuyPrice = aggregated.totalBuyQuantity.greaterThan(0)
            ? aggregated.totalBuyAmount.div(aggregated.totalBuyQuantity)
            : DECIMAL_ZERO;

        const realizedPL =
            aggregated.totalSellQuantity.greaterThan(0) && avgBuyPrice.greaterThan(0)
                ? aggregated.totalSellAmount.minus(aggregated.totalSellQuantity.times(avgBuyPrice))
                : DECIMAL_ZERO;

        const totalRealizedPL = realizedPL.plus(aggregated.totalDividends);
        const currentAmount = quantity.times(currentPrice);
        const originalCostOfHolding = quantity.times(avgBuyPrice);
        const profitLoss = currentAmount.minus(originalCostOfHolding);
        const profitLossRate = originalCostOfHolding.isZero()
            ? DECIMAL_ZERO
            : profitLoss.div(originalCostOfHolding).times(DECIMAL_HUNDRED);

        return {
            ...aggregated,
            quantity,
            avgBuyPrice,
            realizedPL,
            totalRealizedPL,
            currentAmount,
            currentAmountUSD: DECIMAL_ZERO,
            currentAmountKRW: DECIMAL_ZERO,
            profitLoss,
            profitLossRate,
        };
    }

    static calculateStockMetrics(stock: Stock): CalculatedStockMetrics {
        try {
            const currentPrice = new Decimal(stock.currentPrice || 0);
            const aggregated = Calculator.aggregateTransactions(stock.transactions);
            const result = Calculator.calculateStockIndicators(aggregated, currentPrice);
            return result;
        } catch (error) {
            ErrorService.handle(error as Error, 'calculateStockMetrics');
            throw new Error(
                `Failed to calculate metrics for stock: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * @description Calculates and caches portfolio state
     */
    static calculatePortfolioState(options: {
        portfolioData: Stock[];
        exchangeRate?: number;
        currentCurrency?: Currency;
    }): PortfolioCalculationResult {
        const {
            portfolioData,
            exchangeRate = CONFIG.DEFAULT_EXCHANGE_RATE,
            currentCurrency = 'krw',
        } = options;

        const cacheKey = _generatePortfolioKey(portfolioData, exchangeRate, currentCurrency);

        // LRU 캐시에서 결과 조회
        const cachedResult = Calculator.#portfolioCache.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        const exchangeRateDec = new Decimal(exchangeRate);
        let currentTotal = DECIMAL_ZERO;

        const calculatedPortfolioData: CalculatedStock[] = portfolioData.map((stock) => {
            const calculatedMetrics = Calculator.calculateStockMetrics(stock);

            // currentPrice는 항상 USD로 저장되어 있다고 가정
            // currentAmount는 USD 기준 (quantity * currentPriceUSD)
            const metricsWithCurrency: CalculatedStockMetrics = {
                ...calculatedMetrics,
                currentAmountUSD: calculatedMetrics.currentAmount,
                currentAmountKRW: calculatedMetrics.currentAmount.times(exchangeRateDec),
            };

            // Calculate total based on the selected currency
            if (currentCurrency === 'krw') {
                currentTotal = currentTotal.plus(metricsWithCurrency.currentAmountKRW);
            } else {
                currentTotal = currentTotal.plus(metricsWithCurrency.currentAmountUSD);
            }

            return { ...stock, calculated: metricsWithCurrency };
        });

        const result: PortfolioCalculationResult = {
            portfolioData: calculatedPortfolioData,
            currentTotal: currentTotal,
            cacheKey: cacheKey,
        };

        // LRU 캐시에 결과 저장
        Calculator.#portfolioCache.set(cacheKey, result);

        return result;
    }

    /**
     * @description '전략' 객체를 받아 리밸런싱 계산을 실행합니다.
     */
    static calculateRebalancing(strategy: import('./calculationStrategies').IRebalanceStrategy): {
        results: import('./calculationStrategies').RebalancingResult[];
    } {
        return strategy.calculate();
    }

    /**
     * @description Calculates sector-wise amounts and percentages for portfolio
     * @memoized LRU cache applied (size: 20)
     */
    static calculateSectorAnalysis(
        portfolioData: CalculatedStock[],
        currentCurrency: Currency = 'krw'
    ): { sector: string; amount: Decimal; percentage: Decimal }[] {
        // Generate cache key based on stock IDs, sectors, amounts, and currency
        const cacheKey =
            portfolioData
                .map((s) => {
                    const amount =
                        currentCurrency === 'krw'
                            ? s.calculated?.currentAmountKRW || DECIMAL_ZERO
                            : s.calculated?.currentAmountUSD || DECIMAL_ZERO;
                    return `${s.id}:${s.sector}:${amount.toString()}`;
                })
                .join('|') + `:${currentCurrency}`;

        // Check cache
        const cached = Calculator.#sectorAnalysisCache.get(cacheKey);
        if (cached) {
            if (import.meta.env.DEV) {
                logger.debug('calculateSectorAnalysis: cache hit', 'Calculator');
            }
            return cached;
        }

        let startTime: number | undefined;
        if (import.meta.env.DEV) {
            startTime = performance.now();
        }

        const sectorMap = new Map<string, Decimal>();
        let currentTotal = DECIMAL_ZERO;

        for (const s of portfolioData) {
            const sector = s.sector || 'Unclassified';
            const amount =
                currentCurrency === 'krw'
                    ? s.calculated?.currentAmountKRW || DECIMAL_ZERO
                    : s.calculated?.currentAmountUSD || DECIMAL_ZERO;
            currentTotal = currentTotal.plus(amount);

            const currentSectorAmount = sectorMap.get(sector) || DECIMAL_ZERO;
            sectorMap.set(sector, currentSectorAmount.plus(amount));
        }

        const result: { sector: string; amount: Decimal; percentage: Decimal }[] = [];
        for (const [sector, amount] of sectorMap.entries()) {
            const percentage = currentTotal.isZero()
                ? DECIMAL_ZERO
                : amount.div(currentTotal).times(DECIMAL_HUNDRED);
            result.push({ sector, amount, percentage });
        }

        // Sort by amount in descending order
        result.sort((a, b) => b.amount.comparedTo(a.amount));

        // Store in cache
        Calculator.#sectorAnalysisCache.set(cacheKey, result);

        if (import.meta.env.DEV && startTime !== undefined) {
            const endTime = performance.now();
            logger.debug(
                `calculateSectorAnalysis for ${portfolioData.length} stocks took ${(endTime - startTime).toFixed(2)} ms`,
                'Calculator'
            );
        }

        return result;
    }

    /**
     * @description Clears portfolio calculation cache
     */
    static clearPortfolioStateCache(): void {
        Calculator.#portfolioCache.clear();
        Calculator.#sectorAnalysisCache.clear();
    }

    /**
     * @description Creates snapshot from current portfolio state
     */
    static createSnapshot(
        portfolioId: string,
        portfolioData: CalculatedStock[],
        exchangeRate: number,
        currentCurrency: Currency = 'krw'
    ): PortfolioSnapshot {
        try {
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

            let totalValue = DECIMAL_ZERO;
            let totalInvestedCapital = DECIMAL_ZERO;
            let totalUnrealizedPL = DECIMAL_ZERO;
            let totalRealizedPL = DECIMAL_ZERO;
            let totalDividends = DECIMAL_ZERO;

            // Aggregate metrics from all stocks
            for (const stock of portfolioData) {
                const metrics = stock.calculated;
                if (!metrics) continue;

                // Aggregate in USD
                totalValue = totalValue.plus(metrics.currentAmountUSD || 0);

                // Invested capital = current holding quantity × average buy price
                const investedForHolding = metrics.quantity.times(metrics.avgBuyPrice);
                totalInvestedCapital = totalInvestedCapital.plus(investedForHolding);

                // Unrealized profit/loss
                totalUnrealizedPL = totalUnrealizedPL.plus(metrics.profitLoss || 0);

                // Realized profit/loss
                totalRealizedPL = totalRealizedPL.plus(metrics.realizedPL || 0);

                // Dividends
                totalDividends = totalDividends.plus(metrics.totalDividends || 0);
            }

            // Total overall P/L = unrealized + realized + dividends
            const totalOverallPL = totalUnrealizedPL.plus(totalRealizedPL).plus(totalDividends);

            const exchangeRateDec = new Decimal(exchangeRate);
            const totalValueKRW = totalValue.times(exchangeRateDec);

            const snapshot: PortfolioSnapshot = {
                id: generateId(),
                portfolioId,
                timestamp: now.getTime(),
                date: dateStr,
                totalValue: totalValue.toNumber(),
                totalValueKRW: totalValueKRW.toNumber(),
                totalInvestedCapital: totalInvestedCapital.toNumber(),
                totalUnrealizedPL: totalUnrealizedPL.toNumber(),
                totalRealizedPL: totalRealizedPL.toNumber(),
                totalDividends: totalDividends.toNumber(),
                totalOverallPL: totalOverallPL.toNumber(),
                exchangeRate,
                stockCount: portfolioData.filter(
                    (s) => s.calculated && s.calculated.quantity.greaterThan(0)
                ).length,
            };

            return snapshot;
        } catch (error) {
            ErrorService.handle(error as Error, 'Calculator.createSnapshot');
            // Propagate error to caller (do not save empty snapshot)
            throw new Error(
                `Failed to create snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }
}
