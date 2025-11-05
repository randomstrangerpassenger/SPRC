// src/calculator.ts (Strategy Pattern Applied)
import Decimal from 'decimal.js';
import { nanoid } from 'nanoid';
import { CONFIG, DECIMAL_ZERO, DECIMAL_HUNDRED } from './constants.ts';
import { ErrorService } from './errorService.ts';
import type { Stock, CalculatedStock, CalculatedStockMetrics, Currency, PortfolioSnapshot } from './types.ts';
import type { IRebalanceStrategy } from './calculationStrategies.ts';

/**
 * @description 주식 ID와 현재 가격의 조합을 기반으로 캐시 키를 생성합니다.
 */
function _generateStockKey(stock: Stock): string {
    // 모든 거래 ID를 조합하여 중간 거래 수정/삭제도 감지
    const txIds = stock.transactions.map(tx => tx.id).join(',');

    // 섹터 정보도 계산에 영향을 주지 않으므로 제외
    return `${stock.id}:${stock.currentPrice}:${txIds}`;
}

/**
 * @description 포트폴리오 전체를 위한 캐시 키를 생성합니다.
 */
function _generatePortfolioKey(
    portfolioData: Stock[],
    exchangeRate: number,
    currentCurrency: Currency
): string {
    // 주식 ID 기준으로 정렬하여 배열 순서와 무관하게 일관된 캐시 키 생성
    const sortedData = [...portfolioData].sort((a, b) => a.id.localeCompare(b.id));
    const stockKeys = sortedData.map(_generateStockKey).join('|');
    const settingsKey = `${exchangeRate}:${currentCurrency}`;
    return `${stockKeys}|${settingsKey}`;
}

export interface PortfolioCalculationResult {
    portfolioData: CalculatedStock[];
    currentTotal: Decimal;
    cacheKey: string;
}

interface CalculatorCache {
    key: string;
    result: PortfolioCalculationResult;
}

export class Calculator {
    static #cache: CalculatorCache | null = null;

    /**
     * @description 단일 주식의 매입 단가, 현재 가치, 손익 등을 계산합니다.
     * @important stock.currentPrice는 항상 USD로 저장되어 있어야 합니다.
     * 통화 표시는 calculatePortfolioState에서 환율을 적용하여 처리합니다.
     */
    static calculateStockMetrics(stock: Stock): CalculatedStockMetrics {
        try {
            const result: CalculatedStockMetrics = {
                totalBuyQuantity: DECIMAL_ZERO,
                totalSellQuantity: DECIMAL_ZERO,
                quantity: DECIMAL_ZERO,
                totalBuyAmount: DECIMAL_ZERO,
                totalSellAmount: DECIMAL_ZERO,
                currentAmount: DECIMAL_ZERO,
                currentAmountUSD: DECIMAL_ZERO,
                currentAmountKRW: DECIMAL_ZERO,
                avgBuyPrice: DECIMAL_ZERO,
                profitLoss: DECIMAL_ZERO,
                profitLossRate: DECIMAL_ZERO,
                totalDividends: DECIMAL_ZERO,
                realizedPL: DECIMAL_ZERO,
                totalRealizedPL: DECIMAL_ZERO,
            };

            const currentPrice = new Decimal(stock.currentPrice || 0);

            // 1. 매수/매도 수량 및 금액 합산, 배당금 집계
            for (const tx of stock.transactions) {
                const txQuantity = new Decimal(tx.quantity || 0);
                const txPrice = new Decimal(tx.price || 0);

                if (tx.type === 'buy') {
                    result.totalBuyQuantity = result.totalBuyQuantity.plus(txQuantity);
                    result.totalBuyAmount = result.totalBuyAmount.plus(
                        txQuantity.times(txPrice)
                    );
                } else if (tx.type === 'sell') {
                    result.totalSellQuantity = result.totalSellQuantity.plus(txQuantity);
                    result.totalSellAmount = result.totalSellAmount.plus(
                        txQuantity.times(txPrice)
                    );
                } else if (tx.type === 'dividend') {
                    // 배당금: quantity 필드에 배당금액 저장, price는 1로 가정
                    result.totalDividends = result.totalDividends.plus(txQuantity.times(txPrice));
                }
            }

            // 2. 순 보유 수량
            result.quantity = Decimal.max(
                0,
                result.totalBuyQuantity.minus(result.totalSellQuantity)
            );

            // 3. 평균 매입 단가 (totalBuyAmount / totalBuyQuantity)
            if (result.totalBuyQuantity.greaterThan(0)) {
                result.avgBuyPrice = result.totalBuyAmount.div(result.totalBuyQuantity);
            }

            // 4. 실현 손익 계산 (매도금액 - 매도수량 × 평균매입가)
            if (result.totalSellQuantity.greaterThan(0) && result.avgBuyPrice.greaterThan(0)) {
                const costBasisOfSold = result.totalSellQuantity.times(result.avgBuyPrice);
                result.realizedPL = result.totalSellAmount.minus(costBasisOfSold);
            }

            // 5. 총 실현 손익 (실현손익 + 배당금)
            result.totalRealizedPL = result.realizedPL.plus(result.totalDividends);

            // 6. 현재 가치 (quantity * currentPrice)
            result.currentAmount = result.quantity.times(currentPrice);

            // 7. 미실현 손익 계산 (currentAmount - (quantity * avgBuyPrice))
            const originalCostOfHolding = result.quantity.times(result.avgBuyPrice);
            result.profitLoss = result.currentAmount.minus(originalCostOfHolding);

            // 8. 미실현 손익률
            if (originalCostOfHolding.isZero()) {
                result.profitLossRate = DECIMAL_ZERO;
            } else {
                result.profitLossRate = result.profitLoss
                    .div(originalCostOfHolding)
                    .times(DECIMAL_HUNDRED);
            }

            return result;
        } catch (error) {
            ErrorService.handle(error as Error, 'calculateStockMetrics');
            // 에러 발생 시 기본값 반환
            return {
                totalBuyQuantity: DECIMAL_ZERO,
                totalSellQuantity: DECIMAL_ZERO,
                quantity: DECIMAL_ZERO,
                totalBuyAmount: DECIMAL_ZERO,
                totalSellAmount: DECIMAL_ZERO,
                avgBuyPrice: DECIMAL_ZERO,
                currentAmount: DECIMAL_ZERO,
                currentAmountUSD: DECIMAL_ZERO,
                currentAmountKRW: DECIMAL_ZERO,
                profitLoss: DECIMAL_ZERO,
                profitLossRate: DECIMAL_ZERO,
                totalDividends: DECIMAL_ZERO,
                realizedPL: DECIMAL_ZERO,
                totalRealizedPL: DECIMAL_ZERO,
            };
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

        if (Calculator.#cache && Calculator.#cache.key === cacheKey) {
            return Calculator.#cache.result;
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

        // 캐시 업데이트
        Calculator.#cache = { key: cacheKey, result: result };

        return result;
    }

    /**
     * @description '전략' 객체를 받아 리밸런싱 계산을 실행합니다.
     */
    static calculateRebalancing(strategy: IRebalanceStrategy): { results: any[] } {
        return strategy.calculate();
    }

    /**
     * @description 포트폴리오의 섹터별 금액 및 비율을 계산합니다.
     */
    static calculateSectorAnalysis(
        portfolioData: CalculatedStock[],
        currentCurrency: Currency = 'krw'
    ): { sector: string; amount: Decimal; percentage: Decimal }[] {
        const startTime = performance.now();

        const sectorMap = new Map<string, Decimal>();
        let currentTotal = DECIMAL_ZERO;

        for (const s of portfolioData) {
            const sector = s.sector || 'Unclassified';
            const amount = currentCurrency === 'krw'
                ? (s.calculated?.currentAmountKRW || DECIMAL_ZERO)
                : (s.calculated?.currentAmountUSD || DECIMAL_ZERO);
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

        if (import.meta.env.DEV) {
            const endTime = performance.now();
            console.log(
                `[Perf] calculateSectorAnalysis for ${portfolioData.length} stocks took ${(endTime - startTime).toFixed(2)} ms`
            );
        }

        return result;
    }

    /**
     * @description 포트폴리오 계산 캐시를 초기화합니다.
     */
    static clearPortfolioStateCache(): void {
        Calculator.#cache = null;
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
                id: nanoid(),
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
                stockCount: portfolioData.filter(s => s.calculated && s.calculated.quantity.greaterThan(0)).length,
            };

            return snapshot;
        } catch (error) {
            ErrorService.handle(error as Error, 'Calculator.createSnapshot');
            // Return empty snapshot on error
            const now = new Date();
            return {
                id: nanoid(),
                portfolioId,
                timestamp: now.getTime(),
                date: now.toISOString().split('T')[0],
                totalValue: 0,
                totalValueKRW: 0,
                totalInvestedCapital: 0,
                totalUnrealizedPL: 0,
                totalRealizedPL: 0,
                totalDividends: 0,
                totalOverallPL: 0,
                exchangeRate,
                stockCount: 0,
            };
        }
    }
}