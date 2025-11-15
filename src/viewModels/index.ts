// src/viewModels/index.ts
/**
 * @description ViewModel layer for view-optimized data structures
 *
 * ViewModels transform domain models into view-friendly formats:
 * - Formatting numbers and currencies
 * - Converting dates
 * - Calculating display values
 * - Providing localized labels
 *
 * This decouples the View from domain logic and business rules.
 */

export * from './types';
export { PortfolioViewModelMapper } from './PortfolioViewModelMapper';
export { StockViewModelMapper } from './StockViewModelMapper';
export { TransactionViewModelMapper } from './TransactionViewModelMapper';
