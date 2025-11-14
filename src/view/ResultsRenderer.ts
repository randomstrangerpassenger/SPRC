// src/view/ResultsRenderer.ts
import { t } from '../i18n';
import type { Chart } from 'chart.js';
import type { PortfolioSnapshot, DOMElements } from '../types';

/**
 * @class ResultsRenderer
 * @description 계산 결과, 섹터 분석, 차트 렌더링 관리
 */
export class ResultsRenderer {
    private dom: DOMElements;
    private chartInstance: Chart | null = null;
    private performanceChartInstance: Chart | null = null;
    private currentObserver: IntersectionObserver | null = null;

    constructor(dom: DOMElements) {
        this.dom = dom;
    }

    /**
     * @description 스켈레톤 로딩 화면을 표시합니다.
     */
    displaySkeleton(): void {
        const skeletonHTML = `
            <div class="skeleton-container">
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
            </div>
        `;
        const resultsEl = this.dom.resultsSection;
        if (!resultsEl) return;

        resultsEl.innerHTML = skeletonHTML;
        resultsEl.classList.remove('hidden');
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * @description 계산 결과를 표시합니다.
     * @param html - 결과 HTML
     */
    displayResults(html: string): void {
        requestAnimationFrame(() => {
            const resultsEl = this.dom.resultsSection;
            if (!resultsEl) return;

            resultsEl.innerHTML = html;
            resultsEl.classList.remove('hidden');
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

            const rows = resultsEl.querySelectorAll('.result-row-highlight');
            if (rows.length === 0) return;

            this.cleanupObserver();
            this.currentObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const target = entry.target as HTMLElement;
                            target.style.transitionDelay = target.dataset.delay || '0s';
                            target.classList.add('in-view');
                            this.currentObserver?.unobserve(target);
                        }
                    });
                },
                { threshold: 0.1 }
            );

            rows.forEach((row) => this.currentObserver?.observe(row));
        });
    }

    /**
     * @description 섹터 분석을 표시합니다.
     * @param html - 섹터 분석 HTML
     */
    displaySectorAnalysis(html: string): void {
        requestAnimationFrame(() => {
            const sectorEl = this.dom.sectorAnalysisSection;
            if (!sectorEl) return;

            sectorEl.innerHTML = html;
            sectorEl.classList.remove('hidden');
        });
    }

    /**
     * @description 포트폴리오 차트를 표시합니다.
     * @param ChartClass - Chart.js 클래스
     * @param labels - 차트 레이블
     * @param data - 차트 데이터
     * @param title - 차트 제목
     */
    displayChart(ChartClass: typeof Chart, labels: string[], data: number[], title: string): void {
        const chartEl = this.dom.chartSection;
        const canvas = this.dom.portfolioChart;

        if (!chartEl || !(canvas instanceof HTMLCanvasElement)) return;

        chartEl.classList.remove('hidden');

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' as const },
                title: { display: true, text: title, font: { size: 16 } },
            },
        };

        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: t('template.ratio'),
                    data: data,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40',
                        '#C9CBCF',
                        '#77DD77',
                        '#FDFD96',
                        '#836FFF',
                        '#FFB347',
                        '#FFD1DC',
                    ],
                    borderColor: document.body.classList.contains('dark-mode')
                        ? '#2d2d2d'
                        : '#ffffff',
                    borderWidth: 2,
                },
            ],
        };

        if (this.chartInstance) {
            this.chartInstance.data = chartData;
            this.chartInstance.options = chartOptions;
            this.chartInstance.update();
        } else {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                this.chartInstance = new ChartClass(ctx, {
                    type: 'doughnut',
                    data: chartData,
                    options: chartOptions,
                });
            }
        }
    }

    /**
     * @description 결과 화면을 숨깁니다.
     */
    hideResults(): void {
        const resultsEl = this.dom.resultsSection;
        const sectorEl = this.dom.sectorAnalysisSection;
        const chartEl = this.dom.chartSection;

        if (resultsEl) {
            resultsEl.innerHTML = '';
            resultsEl.classList.add('hidden');
        }
        if (sectorEl) {
            sectorEl.innerHTML = '';
            sectorEl.classList.add('hidden');
        }
        if (chartEl) {
            chartEl.classList.add('hidden');
        }

        this.cleanupObserver();
    }

    /**
     * @description 포트폴리오 성과 히스토리 차트를 표시합니다.
     * @param ChartClass - Chart.js 클래스
     * @param snapshots - 포트폴리오 스냅샷 배열
     * @param currency - 통화 모드
     */
    async displayPerformanceHistory(
        ChartClass: typeof Chart,
        snapshots: PortfolioSnapshot[],
        currency: 'krw' | 'usd'
    ): Promise<void> {
        const section = this.dom.performanceHistorySection;
        const container = this.dom.performanceChartContainer;
        const canvas = this.dom.performanceChart;

        if (!section || !container || !(canvas instanceof HTMLCanvasElement)) return;

        // Show section
        section.classList.remove('hidden');
        container.classList.remove('hidden');

        // Sort snapshots by date (oldest first for chart)
        const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);

        // Prepare chart data
        const labels = sorted.map((s) => s.date);
        const totalValueData = sorted.map((s) =>
            currency === 'krw' ? s.totalValueKRW : s.totalValue
        );
        const totalInvestedData = sorted.map((s) => s.totalInvestedCapital);
        const unrealizedPLData = sorted.map((s) => s.totalUnrealizedPL);
        const realizedPLData = sorted.map((s) => s.totalRealizedPL);

        const chartData = {
            labels,
            datasets: [
                {
                    label: '총 자산 가치',
                    data: totalValueData,
                    borderColor: '#36A2EB',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.4,
                    fill: true,
                },
                {
                    label: '투자 원금',
                    data: totalInvestedData,
                    borderColor: '#9966FF',
                    backgroundColor: 'rgba(153, 102, 255, 0.1)',
                    tension: 0.4,
                    fill: false,
                    borderDash: [5, 5],
                },
            ],
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top' as const,
                    labels: {
                        font: { size: 12 },
                    },
                },
                title: {
                    display: true,
                    text: '포트폴리오 가치 변화 추이',
                    font: { size: 16 },
                },
                tooltip: {
                    callbacks: {
                        label: function (context: unknown) {
                            const ctx = context as {
                                dataset: { label?: string };
                                parsed: { y: number };
                            };
                            const label = ctx.dataset.label || '';
                            const value = ctx.parsed.y;
                            const formatted = value.toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                            });
                            return `${label}: ${currency === 'krw' ? '₩' : '$'}${formatted}`;
                        },
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value: unknown) {
                            return (
                                (currency === 'krw' ? '₩' : '$') +
                                (typeof value === 'number' ? value.toLocaleString() : String(value))
                            );
                        },
                    },
                },
            },
        };

        if (this.performanceChartInstance) {
            this.performanceChartInstance.data = chartData;
            this.performanceChartInstance.options = chartOptions;
            this.performanceChartInstance.update();
        } else {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                this.performanceChartInstance = new ChartClass(ctx, {
                    type: 'line',
                    data: chartData,
                    options: chartOptions,
                });
            }
        }

        // Scroll to chart
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * @description Intersection Observer를 정리합니다.
     */
    cleanupObserver(): void {
        if (this.currentObserver) {
            this.currentObserver.disconnect();
            this.currentObserver = null;
        }
    }

    /**
     * @description 차트 인스턴스를 제거합니다.
     */
    destroyChart(): void {
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
        if (this.performanceChartInstance) {
            this.performanceChartInstance.destroy();
            this.performanceChartInstance = null;
        }
    }

    /**
     * @description 모든 리소스를 정리합니다.
     */
    cleanup(): void {
        this.cleanupObserver();
        this.destroyChart();
    }

    /**
     * @description 스냅샷 목록을 렌더링합니다.
     * @param snapshots - 스냅샷 배열
     * @param currency - 통화 ('krw' | 'usd')
     */
    displaySnapshotList(snapshots: PortfolioSnapshot[], currency: 'krw' | 'usd'): void {
        const listEl = this.dom.snapshotList;
        if (!listEl) return;

        const currencySymbol = currency === 'krw' ? '₩' : '$';
        const formatNumber = (num: number) => {
            return num.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            });
        };

        const formatPercent = (num: number) => {
            return num.toFixed(2);
        };

        const rows = snapshots
            .map((snapshot) => {
                const totalValue =
                    currency === 'krw' ? snapshot.totalValueKRW : snapshot.totalValue;
                const totalReturn = snapshot.totalUnrealizedPL + snapshot.totalRealizedPL;
                const returnRate =
                    snapshot.totalInvestedCapital > 0
                        ? (totalReturn / snapshot.totalInvestedCapital) * 100
                        : 0;

                const isProfit = totalReturn >= 0;
                const profitClass = isProfit ? 'profit-positive' : 'profit-negative';

                return `
                <tr>
                    <td>${snapshot.date}</td>
                    <td style="text-align: right; font-weight: bold;">${currencySymbol}${formatNumber(totalValue)}</td>
                    <td style="text-align: right;">${currencySymbol}${formatNumber(snapshot.totalInvestedCapital)}</td>
                    <td style="text-align: right;" class="${profitClass}">
                        ${currencySymbol}${formatNumber(totalReturn)}
                        <br>
                        <small>(${isProfit ? '+' : ''}${formatPercent(returnRate)}%)</small>
                    </td>
                    <td style="text-align: center;">${snapshot.stockCount}</td>
                </tr>
            `;
            })
            .join('');

        listEl.innerHTML = `
            <div class="table-responsive">
                <table>
                    <caption>포트폴리오 스냅샷 목록</caption>
                    <thead>
                        <tr>
                            <th>날짜</th>
                            <th style="text-align: right;">총 자산</th>
                            <th style="text-align: right;">투자 원금</th>
                            <th style="text-align: right;">총 수익</th>
                            <th style="text-align: center;">종목 수</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * @description 성과 히스토리 차트를 표시/숨김합니다.
     * @param show - 표시 여부
     */
    showPerformanceHistoryView(show: boolean): void {
        const section = this.dom.performanceHistorySection;
        const chartContainer = this.dom.performanceChartContainer;
        const listContainer = this.dom.snapshotListContainer;

        if (show) {
            section?.classList.remove('hidden');
            chartContainer?.classList.remove('hidden');
            listContainer?.classList.add('hidden');
        } else {
            section?.classList.add('hidden');
        }
    }

    /**
     * @description 스냅샷 목록을 표시/숨김합니다.
     * @param show - 표시 여부
     */
    showSnapshotListView(show: boolean): void {
        const section = this.dom.performanceHistorySection;
        const chartContainer = this.dom.performanceChartContainer;
        const listContainer = this.dom.snapshotListContainer;

        if (show) {
            section?.classList.remove('hidden');
            chartContainer?.classList.add('hidden');
            listContainer?.classList.remove('hidden');
        } else {
            section?.classList.add('hidden');
        }
    }
}
