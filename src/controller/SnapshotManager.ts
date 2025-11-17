// src/controller/SnapshotManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { SnapshotRepository } from '../state/SnapshotRepository';
import { ChartLoaderService } from '../services/ChartLoaderService';
import { PerformanceChartService } from '../services/PerformanceChartService';
import { logger } from '../services/Logger';
import type { PortfolioSnapshot } from '../types';
import type { Chart } from 'chart.js';

/**
 * @class SnapshotManager
 * @description Manages portfolio snapshots (performance history, snapshot lists, etc.)
 * Handles snapshot-related logic separated from Controller
 */
export class SnapshotManager {
    #state: PortfolioState;
    #view: PortfolioView;
    #snapshotRepo: SnapshotRepository;
    #sectorChartInstance: Chart | null = null;
    #allocationChartInstance: Chart | null = null;
    #dailyReturnChartInstance: Chart | null = null;

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
     */
    async handleShowPerformanceHistory(): Promise<void> {
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
            await this.#view.displayPerformanceHistory(
                ChartClass,
                snapshots,
                activePortfolio.settings.currentCurrency
            );

            this.#view.showToast(`${snapshots.length}개의 스냅샷을 불러왔습니다.`, 'success');
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

    /**
     * @description Display sector pie chart
     */
    async handleShowSectorChart(): Promise<void> {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) return;

        try {
            const portfolioData = activePortfolio.portfolioData;

            if (portfolioData.length === 0) {
                this.#view.showToast('포트폴리오에 종목이 없습니다.', 'info');
                return;
            }

            // Hide other charts
            this.#hideAllChartContainers();

            // Show sector chart container
            const container = this.#view.dom.sectorChartContainer;
            const canvas = this.#view.dom.sectorChart;

            if (!container || !(canvas instanceof HTMLCanvasElement)) return;

            container.classList.remove('hidden');

            // Destroy previous chart
            if (this.#sectorChartInstance) {
                this.#sectorChartInstance.destroy();
                this.#sectorChartInstance = null;
            }

            // Create new chart
            this.#sectorChartInstance = await PerformanceChartService.createSectorPieChart(
                canvas,
                portfolioData as any,
                'doughnut'
            );

            this.#view.showToast('섹터별 분포 차트를 표시했습니다.', 'success');
        } catch (error) {
            logger.error('Failed to display sector chart', 'SnapshotManager', error);
            this.#view.showToast('섹터 차트를 표시하는데 실패했습니다.', 'error');
        }
    }

    /**
     * @description Display allocation change chart
     */
    async handleShowAllocationChart(): Promise<void> {
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

            // Hide other charts
            this.#hideAllChartContainers();

            // Show allocation chart container
            const container = this.#view.dom.allocationChartContainer;
            const canvas = this.#view.dom.allocationChart;

            if (!container || !(canvas instanceof HTMLCanvasElement)) return;

            container.classList.remove('hidden');

            // Destroy previous chart
            if (this.#allocationChartInstance) {
                this.#allocationChartInstance.destroy();
                this.#allocationChartInstance = null;
            }

            // Create new chart
            this.#allocationChartInstance =
                await PerformanceChartService.createAllocationChangeChart(
                    canvas,
                    snapshots,
                    activePortfolio.portfolioData as any
                );

            this.#view.showToast('자산 배분 변화 차트를 표시했습니다.', 'success');
        } catch (error) {
            logger.error('Failed to display allocation chart', 'SnapshotManager', error);
            this.#view.showToast('배분 변화 차트를 표시하는데 실패했습니다.', 'error');
        }
    }

    /**
     * @description Display daily return bar chart
     */
    async handleShowDailyReturnChart(): Promise<void> {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) return;

        try {
            const snapshots = await this.#snapshotRepo.getByPortfolioId(activePortfolio.id);

            if (snapshots.length < 2) {
                this.#view.showToast(
                    '일일 수익률을 계산하려면 최소 2개 이상의 스냅샷이 필요합니다.',
                    'info'
                );
                return;
            }

            // Hide other charts
            this.#hideAllChartContainers();

            // Show daily return chart container
            const container = this.#view.dom.dailyReturnChartContainer;
            const canvas = this.#view.dom.dailyReturnChart;

            if (!container || !(canvas instanceof HTMLCanvasElement)) return;

            container.classList.remove('hidden');

            // Destroy previous chart
            if (this.#dailyReturnChartInstance) {
                this.#dailyReturnChartInstance.destroy();
                this.#dailyReturnChartInstance = null;
            }

            // Create new chart
            this.#dailyReturnChartInstance = await PerformanceChartService.createDailyReturnBarChart(
                canvas,
                snapshots
            );

            if (!this.#dailyReturnChartInstance) {
                this.#view.showToast('일일 수익률 차트를 생성할 수 없습니다.', 'warning');
                return;
            }

            this.#view.showToast('일일 수익률 차트를 표시했습니다.', 'success');
        } catch (error) {
            logger.error('Failed to display daily return chart', 'SnapshotManager', error);
            this.#view.showToast('일일 수익률 차트를 표시하는데 실패했습니다.', 'error');
        }
    }

    /**
     * @description Hide all chart containers
     */
    #hideAllChartContainers(): void {
        const containers = [
            this.#view.dom.performanceChartContainer,
            this.#view.dom.sectorChartContainer,
            this.#view.dom.allocationChartContainer,
            this.#view.dom.dailyReturnChartContainer,
            this.#view.dom.snapshotListContainer,
        ];

        containers.forEach((container) => {
            if (container) {
                container.classList.add('hidden');
            }
        });
    }

    /**
     * @description Destroy all chart instances
     */
    destroyCharts(): void {
        if (this.#sectorChartInstance) {
            this.#sectorChartInstance.destroy();
            this.#sectorChartInstance = null;
        }
        if (this.#allocationChartInstance) {
            this.#allocationChartInstance.destroy();
            this.#allocationChartInstance = null;
        }
        if (this.#dailyReturnChartInstance) {
            this.#dailyReturnChartInstance.destroy();
            this.#dailyReturnChartInstance = null;
        }
    }
}
