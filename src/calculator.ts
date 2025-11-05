// src/calculator.ts (Strategy Pattern Applied)
import Decimal from 'decimal.js';
import { CONFIG, DECIMAL_ZERO, DECIMAL_HUNDRED } from './constants.ts';
import { ErrorService } from './errorService.ts';
import type { Stock, CalculatedStock, CalculatedStockMetrics, Currency } from './types.ts';
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
                currentAmount: DECIMAL_ZERO,
                currentAmountUSD: DECIMAL_ZERO,
                currentAmountKRW: DECIMAL_ZERO,
                avgBuyPrice: DECIMAL_ZERO,
                profitLoss: DECIMAL_ZERO,
                profitLossRate: DECIMAL_ZERO,
            };

            const currentPrice = new Decimal(stock.currentPrice || 0);

            // 1. 매수/매도 수량 및 금액 합산
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

            // 4. 현재 가치 (quantity * currentPrice)
            result.currentAmount = result.quantity.times(currentPrice);

            // 5. 손익 계산 (currentAmount - (quantity * avgBuyPrice))
            const originalCostOfHolding = result.quantity.times(result.avgBuyPrice);
            result.profitLoss = result.currentAmount.minus(originalCostOfHolding);

            // 6. 손익률
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
                quantity: DECIMAL_ZERO,
                avgBuyPrice: DECIMAL_ZERO,
                currentAmount: DECIMAL_ZERO,
                profitLoss: DECIMAL_ZERO,
                profitLossRate: DECIMAL_ZERO,
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
}