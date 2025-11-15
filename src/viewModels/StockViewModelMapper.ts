// src/viewModels/StockViewModelMapper.ts
import type { CalculatedStock, Stock } from '../types';
import type { StockTableViewModel, StockRowViewModel } from './types';
import Decimal from 'decimal.js';
import { formatNumber, formatCurrency } from '../utils';

/**
 * @class StockViewModelMapper
 * @description Maps Stock domain models to StockTableViewModel
 */
export class StockViewModelMapper {
    /**
     * @description Convert calculated stocks to StockTableViewModel
     * @param stocks - Array of calculated stocks
     * @param currency - Current currency
     * @param totalRatio - Total ratio sum
     * @returns StockTableViewModel
     */
    static toTableViewModel(
        stocks: (CalculatedStock | Stock)[],
        currency: 'krw' | 'usd',
        totalRatio: Decimal
    ): StockTableViewModel {
        const rows: StockRowViewModel[] = stocks.map((stock) =>
            this.toRowViewModel(stock, currency)
        );

        return {
            rows,
            currency,
            totalRatio: totalRatio.toFixed(2),
        };
    }

    /**
     * @description Convert single stock to StockRowViewModel
     * @param stock - Stock data (with or without calculated fields)
     * @param currency - Current currency
     * @returns StockRowViewModel
     */
    static toRowViewModel(
        stock: CalculatedStock | Stock,
        currency: 'krw' | 'usd'
    ): StockRowViewModel {
        const row: StockRowViewModel = {
            id: stock.id,
            name: stock.name,
            ticker: stock.ticker,
            sector: stock.sector,
            targetRatio: new Decimal(stock.targetRatio || 0).toFixed(2),
            currentPrice: formatCurrency(stock.currentPrice || 0, currency),
            manualAmount: formatCurrency(stock.manualAmount || 0, currency),
            isFixedBuyEnabled: stock.isFixedBuyEnabled || false,
            fixedBuyAmount: formatCurrency(stock.fixedBuyAmount || 0, currency),
        };

        // Add calculated fields if available
        if ('calculated' in stock && stock.calculated) {
            const calc = stock.calculated;
            row.calculated = {
                currentAmount: formatCurrency(calc.currentAmount, currency),
                currentRatio: new Decimal(calc.currentRatio || 0).toFixed(2),
                deviation: new Decimal(calc.deviation || 0).toFixed(2),
                recommendation: formatNumber(calc.recommendation || 0, 0),
                profitLoss: formatCurrency(calc.profitLoss || 0, currency),
                profitLossRate: new Decimal(calc.profitLossRate || 0).toFixed(2),
            };
        }

        return row;
    }
}
