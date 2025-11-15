// src/services/PortfolioMetricsService.ts
import type { Stock } from '../types';
import { toNumber } from '../utils/converterUtil';

/**
 * @description Portfolio metrics calculation result type
 */
export interface StockMetrics {
    totalBuyQty: number;
    totalSellQty: number;
    netHoldings: number;
    avgBuyPrice: number;
    currentPrice: number;
    totalInvested: number;
    currentValue: number;
    unrealizedPL: number;
    unrealizedPLPercent: number;
}

/**
 * @class PortfolioMetricsService
 * @description Portfolio and stock metrics calculation service
 * - Integrates calculation logic commonly used by PDF, Excel, and Email services
 */
export class PortfolioMetricsService {
    /**
     * @description Calculate stock-specific metrics
     * @param stock - Stock data
     * @returns Calculated metrics (holdings, average price, return rate, etc.)
     */
    static calculateStockMetrics(stock: Stock): StockMetrics {
        let totalBuyQty = 0;
        let totalSellQty = 0;
        let totalBuyAmount = 0;

        stock.transactions.forEach((tx) => {
            const qty = toNumber(tx.quantity);
            const price = toNumber(tx.price);

            if (tx.type === 'buy') {
                totalBuyQty += qty;
                totalBuyAmount += qty * price;
            } else if (tx.type === 'sell') {
                totalSellQty += qty;
            }
        });

        const netHoldings = totalBuyQty - totalSellQty;
        const avgBuyPrice = totalBuyQty > 0 ? totalBuyAmount / totalBuyQty : 0;
        const currentPrice = toNumber(stock.currentPrice);
        const currentValue = netHoldings * currentPrice;
        const totalInvested = netHoldings * avgBuyPrice;
        const unrealizedPL = currentValue - totalInvested;
        const unrealizedPLPercent = totalInvested > 0 ? (unrealizedPL / totalInvested) * 100 : 0;

        return {
            totalBuyQty,
            totalSellQty,
            netHoldings,
            avgBuyPrice,
            currentPrice,
            totalInvested,
            currentValue,
            unrealizedPL,
            unrealizedPLPercent,
        };
    }
}
