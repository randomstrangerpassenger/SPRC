// src/controller/SnapshotManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { SnapshotRepository } from '../state/SnapshotRepository';
import { ChartLoaderService } from '../services/ChartLoaderService';
import { PerformanceChartService } from '../services/PerformanceChartService';
import { RiskMetricsService } from '../services/RiskMetricsService';
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
     * @description Display risk metrics
     */
    async handleShowRiskMetrics(): Promise<void> {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) return;

        try {
            const snapshots = await this.#snapshotRepo.getByPortfolioId(activePortfolio.id);

            if (snapshots.length < 2) {
                this.#view.showToast(
                    '리스크 지표를 계산하려면 최소 2개 이상의 스냅샷이 필요합니다.',
                    'info'
                );
                return;
            }

            const riskMetrics = RiskMetricsService.calculateRiskMetrics(snapshots);

            if (!riskMetrics) {
                this.#view.showToast('리스크 지표를 계산할 수 없습니다.', 'warning');
                return;
            }

            // Hide other charts
            this.#hideAllChartContainers();

            // Show risk metrics panel
            const container = this.#view.dom.riskMetricsContainer;
            if (!container) return;

            container.classList.remove('hidden');

            // Render risk metrics
            this.renderRiskMetrics(riskMetrics);

            this.#view.showToast('리스크 지표를 표시했습니다.', 'success');
        } catch (error) {
            logger.error('Failed to display risk metrics', 'SnapshotManager', error);
            this.#view.showToast('리스크 지표를 표시하는데 실패했습니다.', 'error');
        }
    }

    /**
     * @description Render risk metrics in HTML
     */
    private renderRiskMetrics(metrics: any): void {
        const container = this.#view.dom.riskMetricsContent;
        if (!container) return;

        const grade = RiskMetricsService.evaluateRiskGrade(metrics.sharpeRatio);
        const gradeDesc = RiskMetricsService.getRiskGradeDescription(grade);

        const html = `
            <div class="risk-metrics-grid">
                <div class="risk-metric-card">
                    <h4>📈 수익률 지표</h4>
                    <div class="metric-row">
                        <span class="metric-label">총 수익률:</span>
                        <span class="metric-value ${metrics.totalReturn >= 0 ? 'positive' : 'negative'}">
                            ${metrics.totalReturn >= 0 ? '+' : ''}${metrics.totalReturn.toFixed(2)}%
                        </span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">연환산 수익률 (CAGR):</span>
                        <span class="metric-value ${metrics.cagr >= 0 ? 'positive' : 'negative'}">
                            ${metrics.cagr >= 0 ? '+' : ''}${metrics.cagr.toFixed(2)}%
                        </span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">평균 일일 수익률:</span>
                        <span class="metric-value ${metrics.avgDailyReturn >= 0 ? 'positive' : 'negative'}">
                            ${metrics.avgDailyReturn >= 0 ? '+' : ''}${metrics.avgDailyReturn.toFixed(4)}%
                        </span>
                    </div>
                </div>

                <div class="risk-metric-card">
                    <h4>⚠️ 리스크 지표</h4>
                    <div class="metric-row">
                        <span class="metric-label">변동성 (연환산):</span>
                        <span class="metric-value">${metrics.volatility.toFixed(2)}%</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">최대 낙폭 (MDD):</span>
                        <span class="metric-value negative">${metrics.maxDrawdown.toFixed(2)}%</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">최대 낙폭 기간:</span>
                        <span class="metric-value">${metrics.maxDrawdownDays}일</span>
                    </div>
                </div>

                <div class="risk-metric-card">
                    <h4>🎯 위험 조정 수익률</h4>
                    <div class="metric-row">
                        <span class="metric-label">샤프 비율:</span>
                        <span class="metric-value ${metrics.sharpeRatio >= 1 ? 'positive' : ''}">
                            ${metrics.sharpeRatio.toFixed(2)}
                        </span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">소르티노 비율:</span>
                        <span class="metric-value">${metrics.sortinoRatio.toFixed(2)}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">칼마 비율:</span>
                        <span class="metric-value">${metrics.calmarRatio.toFixed(2)}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">평가 등급:</span>
                        <span class="metric-value risk-grade-${grade}">${gradeDesc}</span>
                    </div>
                </div>

                <div class="risk-metric-card">
                    <h4>📊 기타 통계</h4>
                    <div class="metric-row">
                        <span class="metric-label">승률:</span>
                        <span class="metric-value">${metrics.winRate.toFixed(2)}%</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">최대 연속 상승일:</span>
                        <span class="metric-value positive">${metrics.maxConsecutiveWins}일</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">최대 연속 하락일:</span>
                        <span class="metric-value negative">${metrics.maxConsecutiveLosses}일</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">분석 기간:</span>
                        <span class="metric-value">${metrics.periodDays}일</span>
                    </div>
                </div>
            </div>

            <div class="risk-metrics-info mt-4">
                <p><strong>📌 지표 설명:</strong></p>
                <ul>
                    <li><strong>샤프 비율:</strong> 위험 대비 수익률. 1 이상이면 양호, 2 이상이면 우수, 3 이상이면 매우 우수</li>
                    <li><strong>소르티노 비율:</strong> 하방 리스크만 고려한 위험 조정 수익률</li>
                    <li><strong>칼마 비율:</strong> CAGR을 MDD로 나눈 값. 높을수록 좋음</li>
                    <li><strong>MDD:</strong> 고점 대비 최대 손실률. 낮을수록 좋음</li>
                </ul>
            </div>
        `;

        container.innerHTML = html;
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
            this.#view.dom.riskMetricsContainer,
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
