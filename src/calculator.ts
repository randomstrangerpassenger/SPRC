// js/calculator.ts (Strategy Pattern Applied)
import Decimal from 'decimal.js';
import { CONFIG } from './constants.ts';
import { ErrorService } from './errorService.ts';
import type { Stock, CalculatedStock, CalculatedStockMetrics, Currency } from './types.ts';
import type { IRebalanceStrategy } from './calculationStrategies.ts';

/**
 * @description 주식 ID와 현재 가격의 조합을 기반으로 캐시 키를 생성합니다.
 */
function _generateStockKey(stock: Stock): string {
    // transactions는 state.js에서 정렬되어 관리되므로, 단순히 배열의 길이와 마지막 거래 정보를 포함
    const lastTx = stock.transactions[stock.transactions.length - 1];
    const txSignature = lastTx
        ? `${lastTx.type}-${lastTx.quantity.toString()}-${lastTx.price.toString()}`
        : 'none';

    // 섹터 정보도 계산에 영향을 주지 않으므로 제외
    return `${stock.id}:${stock.currentPrice}:${stock.transactions.length}:${txSignature}`;
}

/**
 * @description 포트폴리오 전체를 위한 캐시 키를 생성합니다.
 */
function _generatePortfolioKey(portfolioData: Stock[]): string {
    // 주식 ID 기준으로 정렬하여 배열 순서와 무관하게 일관된 캐시 키 생성
    const sortedData = [...portfolioData].sort((a, b) => a.id.localeCompare(b.id));
    return sortedData.map(_generateStockKey).join('|');
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
     */
    static calculateStockMetrics(stock: Stock): CalculatedStockMetrics {
        try {
            const result: any = {
                totalBuyQuantity: new Decimal(0),
                totalSellQuantity: new Decimal(0),
                quantity: new Decimal(0),
                totalBuyAmount: new Decimal(0),
                currentAmount: new Decimal(0),
                currentAmountUSD: new Decimal(0),
                currentAmountKRW: new Decimal(0),
                avgBuyPrice: new Decimal(0),
                profitLoss: new Decimal(0),
                profitLossRate: new Decimal(0),
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
                result.profitLossRate = new Decimal(0);
            } else {
                result.profitLossRate = result.profitLoss
                    .div(originalCostOfHolding)
                    .times(100);
            }

            return result;
        } catch (error) {
            ErrorService.handle(error as Error, 'calculateStockMetrics');
            // 에러 발생 시 기본값 반환
            return {
                quantity: new Decimal(0),
                avgBuyPrice: new Decimal(0),
                currentAmount: new Decimal(0),
                profitLoss: new Decimal(0),
                profitLossRate: new Decimal(0),
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

        const cacheKey = _generatePortfolioKey(portfolioData);

        if (Calculator.#cache && Calculator.#cache.key === cacheKey) {
            return Calculator.#cache.result;
        }

        const exchangeRateDec = new Decimal(exchangeRate);
        let currentTotal = new Decimal(0);

        const calculatedPortfolioData: CalculatedStock[] = portfolioData.map((stock) => {
            const calculatedMetrics = Calculator.calculateStockMetrics(stock);

            // 현재가치를 KRW와 USD로 변환
            const metricsWithCurrency: any = { ...calculatedMetrics };
            if (currentCurrency === 'krw') {
                metricsWithCurrency.currentAmountKRW = calculatedMetrics.currentAmount;
                metricsWithCurrency.currentAmountUSD =
                    calculatedMetrics.currentAmount.div(exchangeRateDec);
            } else {
                // usd
                metricsWithCurrency.currentAmountUSD = calculatedMetrics.currentAmount;
                metricsWithCurrency.currentAmountKRW =
                    calculatedMetrics.currentAmount.times(exchangeRateDec);
            }

            // Calculate total based on the selected currency
            currentTotal = currentTotal.plus(calculatedMetrics.currentAmount);

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
        portfolioData: CalculatedStock[]
    ): { sector: string; amount: Decimal; percentage: Decimal }[] {
        const startTime = performance.now();

        const sectorMap = new Map<string, Decimal>();
        let currentTotal = new Decimal(0);

        for (const s of portfolioData) {
            const sector = s.sector || 'Unclassified';
            const amount = s.calculated?.currentAmount || new Decimal(0);
            currentTotal = currentTotal.plus(amount);

            const currentSectorAmount = sectorMap.get(sector) || new Decimal(0);
            sectorMap.set(sector, currentSectorAmount.plus(amount));
        }

        const result: { sector: string; amount: Decimal; percentage: Decimal }[] = [];
        for (const [sector, amount] of sectorMap.entries()) {
            const percentage = currentTotal.isZero()
                ? new Decimal(0)
                : amount.div(currentTotal).times(100);
            result.push({ sector, amount, percentage });
        }

        // 금액 내림차순 정렬
        result.sort((a, b) => b.amount.comparedTo(a.amount));

        const endTime = performance.now();
        console.log(
            `[Perf] calculateSectorAnalysis for ${portfolioData.length} stocks took ${(endTime - startTime).toFixed(2)} ms`
        );

        return result;
    }

    /**
     * @description 포트폴리오 계산 캐시를 초기화합니다.
     */
    static clearPortfolioStateCache(): void {
        Calculator.#cache = null;
    }
}
