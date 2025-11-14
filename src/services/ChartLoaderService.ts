// src/services/ChartLoaderService.ts
import type { ChartType, ChartConfiguration } from 'chart.js';
import { logger } from './Logger';

/**
 * @class ChartLoaderService
 * @description Chart.js 모듈 로딩 및 캐싱 서비스 (싱글톤)
 * - 여러 곳에서 Chart.js를 중복 로드하는 것을 방지
 * - Promise를 캐시하여 한 번만 로드되도록 보장
 */
export class ChartLoaderService {
    private static chartJsPromise: Promise<typeof import('chart.js/auto')> | null = null;

    /**
     * @description Chart.js 모듈 로드 (캐시된 Promise 반환)
     * @returns Chart.js 모듈 Promise
     */
    static async loadChartJs(): Promise<typeof import('chart.js/auto')> {
        if (!this.chartJsPromise) {
            logger.info('Loading Chart.js module', 'ChartLoaderService');
            this.chartJsPromise = import('chart.js/auto');
        }
        return this.chartJsPromise;
    }

    /**
     * @description Chart.js의 Chart 생성자 가져오기
     * @returns Chart 생성자
     */
    static async getChart() {
        const chartJs = await this.loadChartJs();
        return chartJs.Chart;
    }

    /**
     * @description 캐시 초기화 (테스트용)
     */
    static clearCache(): void {
        this.chartJsPromise = null;
    }
}

// Re-export useful types
export type { ChartType, ChartConfiguration };
