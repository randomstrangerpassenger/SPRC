// src/services/ChartLoaderService.ts
import type { ChartType, ChartConfiguration } from 'chart.js';
import { logger } from './Logger';

/**
 * @class ChartLoaderService
 * @description Chart.js module loading and caching service (singleton)
 * - Prevents duplicate loading of Chart.js from multiple locations
 * - Caches Promise to ensure loading only once
 */
export class ChartLoaderService {
    private static chartJsPromise: Promise<typeof import('chart.js/auto')> | null = null;

    /**
     * @description Load Chart.js module (returns cached Promise)
     * @returns Chart.js module Promise
     */
    static async loadChartJs(): Promise<typeof import('chart.js/auto')> {
        if (!this.chartJsPromise) {
            logger.info('Loading Chart.js module', 'ChartLoaderService');
            this.chartJsPromise = import('chart.js/auto');
        }
        return this.chartJsPromise;
    }

    /**
     * @description Get Chart constructor from Chart.js
     * @returns Chart constructor
     */
    static async getChart() {
        const chartJs = await this.loadChartJs();
        return chartJs.Chart;
    }

    /**
     * @description Clear cache (for testing)
     */
    static clearCache(): void {
        this.chartJsPromise = null;
    }
}

// Re-export useful types
export type { ChartType, ChartConfiguration };
