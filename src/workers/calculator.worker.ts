// src/workers/calculator.worker.ts
/**
 * @description Web Worker for portfolio calculations
 * - Offloads heavy calculations from main thread
 * - Improves UI responsiveness during computation
 */

import Decimal from 'decimal.js';
import { DECIMAL_ZERO, DECIMAL_HUNDRED } from '../constants';
import type { Stock, CalculatedStock, Currency, Transaction } from '../types';

// Serialized types for worker communication (Decimal -> string)
interface SerializedCalculatedMetrics {
    totalBuyQuantity: string;
    totalSellQuantity: string;
    quantity: string;
    totalBuyAmount: string;
    totalSellAmount: string;
    avgBuyPrice: string;
    currentAmount: string;
    currentAmountUSD: string;
    currentAmountKRW: string;
    profitLoss: string;
    profitLossRate: string;
    totalDividends: string;
    realizedPL: string;
    totalRealizedPL: string;
}

// Worker message types
interface CalculateStockMetricsMessage {
    type: 'calculateStockMetrics';
    data: {
        stock: Stock;
    };
}

interface CalculatePortfolioStateMessage {
    type: 'calculatePortfolioState';
    data: {
        portfolioData: Stock[];
        exchangeRate: number;
        currentCurrency: Currency;
    };
}

interface CalculateSectorAnalysisMessage {
    type: 'calculateSectorAnalysis';
    data: {
        portfolioData: CalculatedStock[];
        currentCurrency: Currency;
    };
}

type WorkerMessage =
    | CalculateStockMetricsMessage
    | CalculatePortfolioStateMessage
    | CalculateSectorAnalysisMessage;

/**
 * @description Calculate metrics for a single stock
 */
function calculateStockMetrics(stock: Stock): SerializedCalculatedMetrics {
    try {
        const result: Record<string, Decimal> = {
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
        for (const tx of stock.transactions || []) {
            const txQuantity = new Decimal(tx.quantity || 0);
            const txPrice = new Decimal(tx.price || 0);

            if (tx.type === 'buy') {
                result.totalBuyQuantity = result.totalBuyQuantity.plus(txQuantity);
                result.totalBuyAmount = result.totalBuyAmount.plus(txQuantity.times(txPrice));
            } else if (tx.type === 'sell') {
                result.totalSellQuantity = result.totalSellQuantity.plus(txQuantity);
                result.totalSellAmount = result.totalSellAmount.plus(txQuantity.times(txPrice));
            } else if (tx.type === 'dividend') {
                // 배당금: quantity 필드에 배당금액 저장, price는 1로 가정
                result.totalDividends = result.totalDividends.plus(txQuantity.times(txPrice));
            }
        }

        // 2. Net quantity
        result.quantity = Decimal.max(0, result.totalBuyQuantity.minus(result.totalSellQuantity));

        // 3. Average buy price
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

        // 6. Current amount
        result.currentAmount = result.quantity.times(currentPrice);

        // 7. 미실현 손익 계산 (currentAmount - (quantity * avgBuyPrice))
        const originalCostOfHolding = result.quantity.times(result.avgBuyPrice);
        result.profitLoss = result.currentAmount.minus(originalCostOfHolding);

        // 8. Profit/loss rate
        if (originalCostOfHolding.isZero()) {
            result.profitLossRate = DECIMAL_ZERO;
        } else {
            result.profitLossRate = result.profitLoss
                .div(originalCostOfHolding)
                .times(DECIMAL_HUNDRED);
        }

        // Convert Decimal to serializable format
        return serializeCalculatedMetrics(result);
    } catch (error) {
        // In worker context, we can't import logger, so use console
        // This is acceptable as it's in a separate worker thread
        console.error('Worker: calculateStockMetrics error', error);
        return {
            totalBuyQuantity: '0',
            totalSellQuantity: '0',
            quantity: '0',
            totalBuyAmount: '0',
            totalSellAmount: '0',
            avgBuyPrice: '0',
            currentAmount: '0',
            currentAmountUSD: '0',
            currentAmountKRW: '0',
            profitLoss: '0',
            profitLossRate: '0',
            totalDividends: '0',
            realizedPL: '0',
            totalRealizedPL: '0',
        };
    }
}

/**
 * @description Calculate entire portfolio state
 */
function calculatePortfolioState(options: {
    portfolioData: Stock[];
    exchangeRate?: number;
    currentCurrency?: Currency;
}): { portfolioData: CalculatedStock[]; currentTotal: string } {
    const { portfolioData, exchangeRate = 1300, currentCurrency = 'krw' } = options;

    const exchangeRateDec = new Decimal(exchangeRate);
    let currentTotal = DECIMAL_ZERO;

    const calculatedPortfolioData = portfolioData.map((stock: Stock) => {
        const calculatedMetrics = calculateStockMetrics(stock);

        // Deserialize back to Decimal for calculations
        const currentAmount = new Decimal(calculatedMetrics.currentAmount || 0);

        const metricsWithCurrency: SerializedCalculatedMetrics = {
            ...calculatedMetrics,
            currentAmountUSD: currentAmount.toString(),
            currentAmountKRW: currentAmount.times(exchangeRateDec).toString(),
        };

        if (currentCurrency === 'krw') {
            currentTotal = currentTotal.plus(new Decimal(metricsWithCurrency.currentAmountKRW));
        } else {
            currentTotal = currentTotal.plus(new Decimal(metricsWithCurrency.currentAmountUSD));
        }

        return { ...stock, calculated: metricsWithCurrency };
    });

    return {
        portfolioData: calculatedPortfolioData,
        currentTotal: currentTotal.toString(),
    };
}

/**
 * @description Calculate sector analysis
 */
function calculateSectorAnalysis(
    portfolioData: CalculatedStock[],
    currentCurrency: Currency
): Array<{ sector: string; amount: string; percentage: string }> {
    const sectorMap = new Map<string, Decimal>();
    let currentTotal = DECIMAL_ZERO;

    for (const s of portfolioData) {
        const sector = s.sector || 'Unclassified';
        const amount =
            currentCurrency === 'krw'
                ? new Decimal(s.calculated?.currentAmountKRW || 0)
                : new Decimal(s.calculated?.currentAmountUSD || 0);
        currentTotal = currentTotal.plus(amount);

        const currentSectorAmount = sectorMap.get(sector) || DECIMAL_ZERO;
        sectorMap.set(sector, currentSectorAmount.plus(amount));
    }

    const result: Array<{ sector: string; amount: string; percentage: string }> = [];
    for (const [sector, amount] of sectorMap.entries()) {
        const percentage = currentTotal.isZero()
            ? DECIMAL_ZERO
            : amount.div(currentTotal).times(DECIMAL_HUNDRED);
        result.push({
            sector,
            amount: amount.toString(),
            percentage: percentage.toString(),
        });
    }

    // Sort by amount descending
    result.sort((a, b) => new Decimal(b.amount).comparedTo(new Decimal(a.amount)));

    return result;
}

/**
 * @description Serialize Decimal objects to strings for postMessage
 */
function serializeCalculatedMetrics(metrics: Record<string, Decimal>): SerializedCalculatedMetrics {
    const serialized: Record<string, string> = {};
    for (const key in metrics) {
        const value = metrics[key];
        serialized[key] = value instanceof Decimal ? value.toString() : String(value);
    }
    return serialized as SerializedCalculatedMetrics;
}

// Listen for messages from main thread
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
    const { type, data } = event.data;

    try {
        switch (type) {
            case 'calculateStockMetrics':
                const stockMetrics = calculateStockMetrics(data.stock);
                self.postMessage({ type: 'calculateStockMetrics', result: stockMetrics });
                break;

            case 'calculatePortfolioState':
                const portfolioState = calculatePortfolioState(data);
                self.postMessage({ type: 'calculatePortfolioState', result: portfolioState });
                break;

            case 'calculateSectorAnalysis':
                const sectorAnalysis = calculateSectorAnalysis(
                    data.portfolioData,
                    data.currentCurrency
                );
                self.postMessage({ type: 'calculateSectorAnalysis', result: sectorAnalysis });
                break;

            default:
                // In worker context, console is acceptable for debugging
                console.warn('Worker: Unknown message type', type);
        }
    } catch (error) {
        self.postMessage({
            type: 'error',
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

// Export for TypeScript
export {};
