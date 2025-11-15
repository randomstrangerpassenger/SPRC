// src/viewModels/types.ts
/**
 * @description ViewModel type definitions
 * ViewModels transform domain models into view-optimized data structures
 */

/**
 * @description Portfolio list item for selector UI
 */
export interface PortfolioListItemViewModel {
    id: string;
    name: string;
    isActive: boolean;
}

/**
 * @description Portfolio list for selector
 */
export interface PortfolioListViewModel {
    items: PortfolioListItemViewModel[];
    activeId: string;
}

/**
 * @description Stock row for virtual scroll table
 */
export interface StockRowViewModel {
    id: string;
    name: string;
    ticker: string;
    sector: string;
    targetRatio: string; // Formatted as percentage
    currentPrice: string; // Formatted with currency
    manualAmount: string; // Formatted with currency
    isFixedBuyEnabled: boolean;
    fixedBuyAmount: string; // Formatted with currency

    // Calculated fields (if available)
    calculated?: {
        currentAmount: string;
        currentRatio: string;
        deviation: string;
        recommendation: string;
        profitLoss: string;
        profitLossRate: string;
    };
}

/**
 * @description Stock table for virtual scroll
 */
export interface StockTableViewModel {
    rows: StockRowViewModel[];
    currency: 'krw' | 'usd';
    totalRatio: string; // Formatted as percentage
}

/**
 * @description Transaction row for modal
 */
export interface TransactionRowViewModel {
    id: string;
    type: 'buy' | 'sell' | 'dividend';
    typeLabel: string; // Localized label
    date: string; // ISO format
    dateFormatted: string; // User-friendly format
    quantity: string; // Formatted number
    price: string; // Formatted with currency
    totalAmount: string; // Formatted with currency
}

/**
 * @description Transaction list for modal
 */
export interface TransactionListViewModel {
    stockName: string;
    transactions: TransactionRowViewModel[];
    currency: 'krw' | 'usd';
    totalQuantity: string;
    totalInvested: string;
    averagePrice: string;
}

/**
 * @description Portfolio settings for UI
 */
export interface PortfolioSettingsViewModel {
    mainMode: 'add' | 'sell' | 'simple';
    currentCurrency: 'krw' | 'usd';
    exchangeRate: string; // Formatted number
    additionalInvestment: string; // Formatted with currency
    additionalInvestmentUSD: string; // Formatted with currency
}
