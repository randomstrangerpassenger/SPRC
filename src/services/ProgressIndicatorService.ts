// src/services/ProgressIndicatorService.ts
/**
 * @description Service for showing progress indicators during long-running operations
 * - Provides consistent UX feedback during async calculations
 * - Prevents user interaction during critical operations
 * - Improves perceived performance
 */

import type { PortfolioView } from '../view';
import { logger } from './Logger';

export class ProgressIndicatorService {
    #view: PortfolioView;
    #isActive: boolean = false;

    constructor(view: PortfolioView) {
        this.#view = view;
    }

    /**
     * @description Show progress indicator for rebalancing calculation
     */
    showRebalancingProgress(): void {
        if (this.#isActive) {
            logger.warn('Progress indicator already active', 'ProgressIndicatorService');
            return;
        }

        this.#isActive = true;
        this.#view.showCalculationLoading();
        logger.debug('Rebalancing progress indicator shown', 'ProgressIndicatorService');
    }

    /**
     * @description Hide progress indicator
     */
    hideProgress(): void {
        if (!this.#isActive) {
            return;
        }

        this.#isActive = false;
        this.#view.hideCalculationLoading();
        logger.debug('Progress indicator hidden', 'ProgressIndicatorService');
    }

    /**
     * @description Execute async operation with progress indicator
     * @param operation - Async operation to execute
     * @returns Promise with operation result
     */
    async withProgress<T>(operation: () => Promise<T>): Promise<T> {
        this.showRebalancingProgress();
        try {
            const result = await operation();
            return result;
        } finally {
            // Ensure progress indicator is hidden even if operation fails
            this.hideProgress();
        }
    }

    /**
     * @description Check if progress indicator is active
     */
    isActive(): boolean {
        return this.#isActive;
    }
}
