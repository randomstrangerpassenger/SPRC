// src/workers/calculator.worker.ts
/**
 * @description Web Worker for portfolio calculations
 * - Offloads heavy calculations from main thread
 * - Improves UI responsiveness during computation
 */

import Decimal from 'decimal.js';
import { DECIMAL_ZERO, DECIMAL_HUNDRED } from '../constants';

// Worker message types
interface CalculateStockMetricsMessage {
    type: 'calculateStockMetrics';
    data: {
        stock: any; // Stock type from types.ts
    };
}

interface CalculatePortfolioStateMessage {
    type: 'calculatePortfolioState';
    data: {
        portfolioData: any[]; // Stock[] type
        exchangeRate: number;
        currentCurrency: 'krw' | 'usd';
    };
}

interface CalculateSectorAnalysisMessage {
    type: 'calculateSectorAnalysis';
    data: {
        portfolioData: any[]; // CalculatedStock[] type
        currentCurrency: 'krw' | 'usd';
    };
}

type WorkerMessage = CalculateStockMetricsMessage | CalculatePortfolioStateMessage | CalculateSectorAnalysisMessage;

/**
 * @description Calculate metrics for a single stock
 */
function calculateStockMetrics(stock: any): any {
    try {
        const result: any = {
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

        // 1. Sum buy/sell transactions
        for (const tx of stock.transactions || []) {
            const txQuantity = new Decimal(tx.quantity || 0);
            const txPrice = new Decimal(tx.price || 0);

            if (tx.type === 'buy') {
                result.totalBuyQuantity = result.totalBuyQuantity.plus(txQuantity);
                result.totalBuyAmount = result.totalBuyAmount.plus(txQuantity.times(txPrice));
            } else if (tx.type === 'sell') {
                result.totalSellQuantity = result.totalSellQuantity.plus(txQuantity);
            }
        }

        // 2. Net quantity
        result.quantity = Decimal.max(0, result.totalBuyQuantity.minus(result.totalSellQuantity));

        // 3. Average buy price
        if (result.totalBuyQuantity.greaterThan(0)) {
            result.avgBuyPrice = result.totalBuyAmount.div(result.totalBuyQuantity);
        }

        // 4. Current amount
        result.currentAmount = result.quantity.times(currentPrice);

        // 5. Profit/loss
        const originalCostOfHolding = result.quantity.times(result.avgBuyPrice);
        result.profitLoss = result.currentAmount.minus(originalCostOfHolding);

        // 6. Profit/loss rate
        if (originalCostOfHolding.isZero()) {
            result.profitLossRate = DECIMAL_ZERO;
        } else {
            result.profitLossRate = result.profitLoss.div(originalCostOfHolding).times(DECIMAL_HUNDRED);
        }

        // Convert Decimal to serializable format
        return serializeCalculatedMetrics(result);
    } catch (error) {
        console.error('Worker: calculateStockMetrics error', error);
        return {
            quantity: '0',
            avgBuyPrice: '0',
            currentAmount: '0',
            currentAmountUSD: '0',
            currentAmountKRW: '0',
            profitLoss: '0',
            profitLossRate: '0',
        };
    }
}

/**
 * @description Calculate entire portfolio state
 */
function calculatePortfolioState(options: any): any {
    const { portfolioData, exchangeRate = 1300, currentCurrency = 'krw' } = options;

    const exchangeRateDec = new Decimal(exchangeRate);
    let currentTotal = DECIMAL_ZERO;

    const calculatedPortfolioData = portfolioData.map((stock: any) => {
        const calculatedMetrics = calculateStockMetrics(stock);

        // Deserialize back to Decimal for calculations
        const currentAmount = new Decimal(calculatedMetrics.currentAmount || 0);

        const metricsWithCurrency: any = {
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
function calculateSectorAnalysis(portfolioData: any[], currentCurrency: 'krw' | 'usd'): any[] {
    const sectorMap = new Map<string, Decimal>();
    let currentTotal = DECIMAL_ZERO;

    for (const s of portfolioData) {
        const sector = s.sector || 'Unclassified';
        const amount = currentCurrency === 'krw'
            ? new Decimal(s.calculated?.currentAmountKRW || 0)
            : new Decimal(s.calculated?.currentAmountUSD || 0);
        currentTotal = currentTotal.plus(amount);

        const currentSectorAmount = sectorMap.get(sector) || DECIMAL_ZERO;
        sectorMap.set(sector, currentSectorAmount.plus(amount));
    }

    const result: any[] = [];
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
function serializeCalculatedMetrics(metrics: any): any {
    const serialized: any = {};
    for (const key in metrics) {
        const value = metrics[key];
        serialized[key] = value instanceof Decimal ? value.toString() : value;
    }
    return serialized;
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
                const sectorAnalysis = calculateSectorAnalysis(data.portfolioData, data.currentCurrency);
                self.postMessage({ type: 'calculateSectorAnalysis', result: sectorAnalysis });
                break;

            default:
                console.warn('Worker: Unknown message type', type);
        }
    } catch (error) {
        self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    }
};

// Export for TypeScript
export {};
