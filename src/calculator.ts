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
 * @description 주식 ID와 현재 가격의 조합을 기반으로 캐시 키를 생성합니다.
 */
function _generateStockKey(stock: Stock): string {
    // 모든 거래 ID를 조합하여 중간 거래 수정/삭제도 감지
    const txIds = stock.transactions.map((tx) => tx.id).join(',');

    // 섹터 정보도 계산에 영향을 주지 않으므로 제외
    return `${stock.id}:${stock.currentPrice}:${txIds}`;
}

/**
 * @description 포트폴리오 전체를 위한 캐시 키를 생성합니다.
 * 최적화: 전체 객체 정렬 대신 ID만 정렬하여 O(n log n) -> O(n + k log k) (k=종목 수)
 */
function _generatePortfolioKey(
    portfolioData: Stock[],
    exchangeRate: number,
    currentCurrency: Currency
): string {
    // Map을 사용하여 ID -> stock key 매핑 생성 (O(n))
    const stockKeyMap = new Map<string, string>();
    for (const stock of portfolioData) {
        stockKeyMap.set(stock.id, _generateStockKey(stock));
    }

    // ID만 정렬 (O(k log k), k = 종목 수, 객체 정렬보다 빠름)
    const sortedIds = Array.from(stockKeyMap.keys()).sort();

    // 정렬된 ID 순서로 키 조합 (O(k))
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
    // LRU 캐시로 여러 계산 결과 저장
    static #portfolioCache = new LRUCache<string, PortfolioCalculationResult>(
        CACHE.PORTFOLIO_CACHE_SIZE
    );

    // 섹터 분석 결과 캐시
    static #sectorAnalysisCache = new LRUCache<
        string,
        { sector: string; amount: Decimal; percentage: Decimal }[]
    >(20);

    /**
     * @description 단일 주식의 매입 단가, 현재 가치, 손익 등을 계산합니다.
     * @important stock.currentPrice는 항상 USD로 저장되어 있어야 합니다.
     * 통화 표시는 calculatePortfolioState에서 환율을 적용하여 처리합니다.
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
     * @description 포트폴리오 상태를 계산하고 캐싱합니다.
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
     * @description 포트폴리오의 섹터별 금액 및 비율을 계산합니다.
     * @memoized LRU 캐시 적용 (크기: 20)
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

        // 금액 내림차순 정렬
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
     * @description 포트폴리오 계산 캐시를 초기화합니다.
     */
    static clearPortfolioStateCache(): void {
        Calculator.#portfolioCache.clear();
        Calculator.#sectorAnalysisCache.clear();
    }

    /**
     * @description 현재 포트폴리오 상태에서 스냅샷을 생성합니다.
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

            // 모든 주식의 메트릭 집계
            for (const stock of portfolioData) {
                const metrics = stock.calculated;
                if (!metrics) continue;

                // USD 기준으로 집계
                totalValue = totalValue.plus(metrics.currentAmountUSD || 0);

                // 투자 원금 = 현재 보유수량 × 평균매입가
                const investedForHolding = metrics.quantity.times(metrics.avgBuyPrice);
                totalInvestedCapital = totalInvestedCapital.plus(investedForHolding);

                // 미실현 손익
                totalUnrealizedPL = totalUnrealizedPL.plus(metrics.profitLoss || 0);

                // 실현 손익
                totalRealizedPL = totalRealizedPL.plus(metrics.realizedPL || 0);

                // 배당금
                totalDividends = totalDividends.plus(metrics.totalDividends || 0);
            }

            // 총 전체 손익 = 미실현 + 실현 + 배당금
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
            // 에러를 상위로 전파 (빈 스냅샷을 저장하지 않음)
            throw new Error(
                `Failed to create snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }
}
