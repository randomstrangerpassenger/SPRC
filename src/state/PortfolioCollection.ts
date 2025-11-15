// src/state/PortfolioCollection.ts
import type { Portfolio } from '../types';
import { logger } from '../services/Logger';

/**
 * @class PortfolioCollection
 * @description Manages the collection of portfolios and active portfolio selection
 * - Encapsulates portfolios dictionary and activePortfolioId
 * - Provides CRUD operations for portfolio management
 * - Handles active portfolio switching
 */
export class PortfolioCollection {
    #portfolios: Record<string, Portfolio> = {};
    #activePortfolioId: string | null = null;

    constructor(
        portfolios: Record<string, Portfolio> = {},
        activePortfolioId: string | null = null
    ) {
        this.#portfolios = portfolios;
        this.#activePortfolioId = activePortfolioId;
    }

    /**
     * @description Get the currently active portfolio
     * @returns Active portfolio or null
     */
    getActive(): Portfolio | null {
        return this.#activePortfolioId ? this.#portfolios[this.#activePortfolioId] : null;
    }

    /**
     * @description Get portfolio by ID
     * @param id - Portfolio ID
     * @returns Portfolio or undefined
     */
    get(id: string): Portfolio | undefined {
        return this.#portfolios[id];
    }

    /**
     * @description Get all portfolios
     * @returns Portfolios dictionary
     */
    getAll(): Record<string, Portfolio> {
        return this.#portfolios;
    }

    /**
     * @description Get active portfolio ID
     * @returns Active portfolio ID or null
     */
    getActiveId(): string | null {
        return this.#activePortfolioId;
    }

    /**
     * @description Set active portfolio by ID
     * @param id - Portfolio ID
     * @returns True if successful, false otherwise
     */
    setActive(id: string): boolean {
        if (this.#portfolios[id]) {
            this.#activePortfolioId = id;
            return true;
        }
        logger.warn(`Cannot set active portfolio: ID ${id} not found`, 'PortfolioCollection');
        return false;
    }

    /**
     * @description Add a new portfolio to the collection
     * @param portfolio - Portfolio to add
     * @param setAsActive - Whether to set as active (default: true)
     */
    add(portfolio: Portfolio, setAsActive: boolean = true): void {
        this.#portfolios[portfolio.id] = portfolio;
        if (setAsActive) {
            this.#activePortfolioId = portfolio.id;
        }
    }

    /**
     * @description Delete a portfolio from the collection
     * @param id - Portfolio ID to delete
     * @returns True if deleted, false otherwise
     */
    delete(id: string): boolean {
        if (Object.keys(this.#portfolios).length <= 1) {
            logger.warn('Cannot delete the last portfolio', 'PortfolioCollection');
            return false;
        }

        if (!this.#portfolios[id]) {
            logger.warn(`Portfolio with ID ${id} not found for deletion`, 'PortfolioCollection');
            return false;
        }

        delete this.#portfolios[id];

        // If deleted portfolio was active, switch to another one
        if (this.#activePortfolioId === id) {
            this.#activePortfolioId = Object.keys(this.#portfolios)[0] || null;
        }

        return true;
    }

    /**
     * @description Rename a portfolio
     * @param id - Portfolio ID
     * @param newName - New name
     * @returns True if renamed, false otherwise
     */
    rename(id: string, newName: string): boolean {
        if (this.#portfolios[id]) {
            this.#portfolios[id].name = newName.trim();
            return true;
        }
        logger.warn(`Portfolio with ID ${id} not found for renaming`, 'PortfolioCollection');
        return false;
    }

    /**
     * @description Check if a portfolio exists
     * @param id - Portfolio ID
     * @returns True if exists
     */
    has(id: string): boolean {
        return id in this.#portfolios;
    }

    /**
     * @description Get the number of portfolios
     * @returns Portfolio count
     */
    count(): number {
        return Object.keys(this.#portfolios).length;
    }

    /**
     * @description Check if collection is empty
     * @returns True if empty
     */
    isEmpty(): boolean {
        return this.count() === 0;
    }

    /**
     * @description Replace entire portfolio collection
     * @param portfolios - New portfolios dictionary
     * @param activeId - New active portfolio ID
     */
    replaceAll(portfolios: Record<string, Portfolio>, activeId: string | null): void {
        this.#portfolios = portfolios;
        this.#activePortfolioId = activeId;
    }

    /**
     * @description Clear all portfolios
     */
    clear(): void {
        this.#portfolios = {};
        this.#activePortfolioId = null;
    }
}
