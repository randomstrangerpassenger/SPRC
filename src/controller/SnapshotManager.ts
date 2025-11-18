// src/controller/SnapshotManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { SnapshotRepository } from '../state/SnapshotRepository';
import { ChartLoaderService } from '../services/ChartLoaderService';
import { BenchmarkComparisonService } from '../services/BenchmarkComparisonService';
import { logger } from '../services/Logger';
import type { PortfolioSnapshot, BenchmarkComparison } from '../types';
import Decimal from 'decimal.js';

/**
 * @class SnapshotManager
 * @description Manages portfolio snapshots (performance history, snapshot lists, etc.)
 * Handles snapshot-related logic separated from Controller
 */
export class SnapshotManager {
    #state: PortfolioState;
    #view: PortfolioView;
    #snapshotRepo: SnapshotRepository;

    constructor(
        state: PortfolioState,
        view: PortfolioView,
        snapshotRepo: SnapshotRepository
    ) {
        this.#state = state;
        this.#view = view;
        this.#snapshotRepo = snapshotRepo;
    }

    /**
     * @description Display performance history
     * @param includeBenchmark - 벤치마크 비교 포함 여부 (기본값: true)
     */
    async handleShowPerformanceHistory(includeBenchmark: boolean = true): Promise<void> {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) return;

        try {
            const snapshots = await this.#snapshotRepo.getByPortfolioId(activePortfolio.id);

            if (snapshots.length === 0) {
                this.#view.showToast(
                    '성과 히스토리 데이터가 없습니다. 계산을 실행하여 데이터를 생성하세요.',
                    'info'
                );
                return;
            }

            this.#view.resultsRenderer.showPerformanceHistoryView(true);

            const ChartClass = await ChartLoaderService.getChart();

            // Benchmark comparison (optional)
            let benchmarkComparison:
                | {
                      portfolioNormalized: Array<{ date: string; value: Decimal }>;
                      benchmarkNormalized: Array<{ date: string; value: Decimal }>;
                      benchmarkName?: string;
                  }
                | undefined;

            if (includeBenchmark && snapshots.length >= 2) {
                try {
                    // Sort snapshots by date
                    const sorted = [...snapshots].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
                    const startDate = sorted[0].timestamp.split('T')[0];
                    const endDate = sorted[sorted.length - 1].timestamp.split('T')[0];

                    // Fetch benchmark history (SPY)
                    const benchmarkHistory =
                        await BenchmarkComparisonService.fetchBenchmarkHistory(
                            'SPY',
                            startDate,
                            endDate
                        );

                    // Compare to benchmark
                    const comparison = BenchmarkComparisonService.compareToBenchmark(
                        snapshots,
                        benchmarkHistory
                    );

                    benchmarkComparison = {
                        portfolioNormalized: comparison.portfolioNormalized,
                        benchmarkNormalized: comparison.benchmarkNormalized,
                        benchmarkName: benchmarkHistory.name,
                    };

                    logger.info(
                        `Benchmark comparison successful: Alpha = ${comparison.alpha.toFixed(2)}%`,
                        'SnapshotManager'
                    );
                } catch (error) {
                    logger.warn('Failed to fetch benchmark data, displaying without comparison', 'SnapshotManager', error);
                    // Continue without benchmark comparison
                }
            }

            await this.#view.displayPerformanceHistory(
                ChartClass,
                snapshots,
                activePortfolio.settings.currentCurrency,
                benchmarkComparison
            );

            const message = benchmarkComparison
                ? `${snapshots.length}개의 스냅샷을 불러왔습니다 (S&P 500 비교 포함)`
                : `${snapshots.length}개의 스냅샷을 불러왔습니다`;
            this.#view.showToast(message, 'success');
        } catch (error) {
            logger.error('Failed to display performance history', 'SnapshotManager', error);
            this.#view.showToast('성과 히스토리를 불러오는데 실패했습니다.', 'error');
        }
    }

    /**
     * @description Display snapshot list
     */
    async handleShowSnapshotList(): Promise<void> {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) return;

        try {
            const snapshots = await this.#snapshotRepo.getByPortfolioId(activePortfolio.id);

            if (snapshots.length === 0) {
                this.#view.showToast(
                    '저장된 스냅샷이 없습니다. 계산을 실행하여 데이터를 생성하세요.',
                    'info'
                );
                return;
            }

            this.#view.resultsRenderer.showSnapshotListView(true);
            this.renderSnapshotList(snapshots, activePortfolio.settings.currentCurrency);

            this.#view.showToast(`${snapshots.length}개의 스냅샷을 불러왔습니다.`, 'success');
        } catch (error) {
            logger.error('Failed to display snapshot list', 'SnapshotManager', error);
            this.#view.showToast('스냅샷 목록을 불러오는데 실패했습니다.', 'error');
        }
    }

    /**
     * @description Render snapshot list
     */
    private renderSnapshotList(snapshots: PortfolioSnapshot[], currency: 'krw' | 'usd'): void {
        this.#view.resultsRenderer.displaySnapshotList(snapshots, currency);
    }

    /**
     * @description Get snapshot count for specific portfolio
     */
    async getSnapshotCount(portfolioId: string): Promise<number> {
        try {
            const snapshots = await this.#snapshotRepo.getByPortfolioId(portfolioId);
            return snapshots.length;
        } catch (error) {
            logger.error('Failed to get snapshot count', 'SnapshotManager', error);
            return 0;
        }
    }

    /**
     * @description Get latest snapshot for specific portfolio
     */
    async getLatestSnapshot(portfolioId: string): Promise<PortfolioSnapshot | null> {
        try {
            return await this.#snapshotRepo.getLatest(portfolioId);
        } catch (error) {
            logger.error('Failed to get latest snapshot', 'SnapshotManager', error);
            return null;
        }
    }

    /**
     * @description Delete snapshots for specific portfolio
     */
    async deleteSnapshots(portfolioId: string): Promise<boolean> {
        try {
            await this.#snapshotRepo.deleteByPortfolioId(portfolioId);
            logger.info(`Snapshots deleted for portfolio ${portfolioId}`, 'SnapshotManager');
            return true;
        } catch (error) {
            logger.error('Failed to delete snapshots', 'SnapshotManager', error);
            return false;
        }
    }
}
