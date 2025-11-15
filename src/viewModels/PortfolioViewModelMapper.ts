// src/viewModels/PortfolioViewModelMapper.ts
import type { Portfolio } from '../types';
import type { PortfolioListViewModel, PortfolioListItemViewModel } from './types';

/**
 * @class PortfolioViewModelMapper
 * @description Maps Portfolio domain models to PortfolioListViewModel
 */
export class PortfolioViewModelMapper {
    /**
     * @description Convert portfolios map to PortfolioListViewModel
     * @param portfolios - Record of portfolios
     * @param activeId - Active portfolio ID
     * @returns PortfolioListViewModel
     */
    static toListViewModel(
        portfolios: Record<string, Portfolio>,
        activeId: string
    ): PortfolioListViewModel {
        const items: PortfolioListItemViewModel[] = Object.entries(portfolios).map(
            ([id, portfolio]) => ({
                id,
                name: portfolio.name,
                isActive: id === activeId,
            })
        );

        return {
            items,
            activeId,
        };
    }

    /**
     * @description Convert single portfolio to list item
     * @param id - Portfolio ID
     * @param portfolio - Portfolio data
     * @param activeId - Active portfolio ID
     * @returns PortfolioListItemViewModel
     */
    static toListItemViewModel(
        id: string,
        portfolio: Portfolio,
        activeId: string
    ): PortfolioListItemViewModel {
        return {
            id,
            name: portfolio.name,
            isActive: id === activeId,
        };
    }
}
