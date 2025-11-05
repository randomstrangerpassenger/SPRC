// src/view/ResultsRenderer.ts
import { t } from '../i18n';
import type { Chart } from 'chart.js';

/**
 * @class ResultsRenderer
 * @description 계산 결과, 섹터 분석, 차트 렌더링 관리
 */
export class ResultsRenderer {
    private dom: any;
    private chartInstance: Chart | null = null;
    private currentObserver: IntersectionObserver | null = null;

    constructor(dom: any) {
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

            rows.forEach((row) => this.currentObserver?.observe(row as Element));
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
                title: { display: true, text: title, font: { size: 16 } }
            }
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
                        '#FFD1DC'
                    ],
                    borderColor: document.body.classList.contains('dark-mode') ? '#2d2d2d' : '#ffffff',
                    borderWidth: 2
                }
            ]
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
                    options: chartOptions
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
    }

    /**
     * @description 모든 리소스를 정리합니다.
     */
    cleanup(): void {
        this.cleanupObserver();
        this.destroyChart();
    }
}
