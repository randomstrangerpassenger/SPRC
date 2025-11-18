// src/view/AssetAllocationRenderer.ts
import type { Chart } from 'chart.js';
import type {
    AssetAllocationAnalysis,
    AssetTypeAllocation,
    CountryAllocation,
    HeatmapCell,
    DOMElements,
} from '../types';
import { CSS_CLASSES } from '../constants';
import { escapeHTML } from '../utils';

/**
 * @class AssetAllocationRenderer
 * @description 자산 배분 상세 뷰 렌더링 (자산 유형별, 국가별 분산, 히트맵)
 */
export class AssetAllocationRenderer {
    #dom: DOMElements;
    #assetAllocationChartInstance: Chart | null = null;
    #countryAllocationChartInstance: Chart | null = null;
    #heatmapChartInstance: Chart | null = null;

    constructor(dom: DOMElements) {
        this.#dom = dom;
    }

    /**
     * @description Update DOM reference
     * @param dom - New DOM reference
     */
    setDom(dom: DOMElements): void {
        this.#dom = dom;
    }

    /**
     * @description 자산 유형별 배분 표시
     * @param ChartClass - Chart.js class
     * @param assetTypeAllocations - 자산 유형별 배분 데이터
     * @param currency - Currency mode
     */
    displayAssetTypeAllocation(
        ChartClass: typeof Chart,
        assetTypeAllocations: AssetTypeAllocation[],
        currency: 'krw' | 'usd'
    ): void {
        const section = this.#dom.assetAllocationSection;
        const canvas = this.#dom.assetAllocationChart;

        if (!section || !(canvas instanceof HTMLCanvasElement)) return;

        section.classList.remove(CSS_CLASSES.HIDDEN);

        const currencySymbol = currency === 'krw' ? '₩' : '$';

        // Prepare chart data
        const labels = assetTypeAllocations.map((a) => this.getAssetTypeLabel(a.assetType));
        const data = assetTypeAllocations.map((a) => a.percentage.toNumber());
        const values = assetTypeAllocations.map((a) => a.totalValue.toNumber());

        const chartData = {
            labels,
            datasets: [
                {
                    label: '자산 유형별 비율 (%)',
                    data: data,
                    backgroundColor: [
                        '#36A2EB',
                        '#FF6384',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40',
                    ],
                    borderColor: document.body.classList.contains('dark-mode')
                        ? '#2d2d2d'
                        : '#ffffff',
                    borderWidth: 2,
                },
            ],
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' as const },
                title: {
                    display: true,
                    text: '자산 유형별 배분',
                    font: { size: 16 },
                },
                tooltip: {
                    callbacks: {
                        label: function (context: any) {
                            const index = context.dataIndex;
                            const percentage = data[index].toFixed(2);
                            const value = values[index].toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                            });
                            return `${context.label}: ${percentage}% (${currencySymbol}${value})`;
                        },
                    },
                },
            },
        };

        if (this.#assetAllocationChartInstance) {
            this.#assetAllocationChartInstance.data = chartData;
            this.#assetAllocationChartInstance.options = chartOptions;
            this.#assetAllocationChartInstance.update();
        } else {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                this.#assetAllocationChartInstance = new ChartClass(ctx, {
                    type: 'doughnut',
                    data: chartData,
                    options: chartOptions,
                });
            }
        }

        // Render table below chart
        this.renderAssetTypeTable(assetTypeAllocations, currency);
    }

    /**
     * @description 국가별 배분 표시
     * @param ChartClass - Chart.js class
     * @param countryAllocations - 국가별 배분 데이터
     * @param currency - Currency mode
     */
    displayCountryAllocation(
        ChartClass: typeof Chart,
        countryAllocations: CountryAllocation[],
        currency: 'krw' | 'usd'
    ): void {
        const section = this.#dom.countryAllocationSection;
        const canvas = this.#dom.countryAllocationChart;

        if (!section || !(canvas instanceof HTMLCanvasElement)) return;

        section.classList.remove(CSS_CLASSES.HIDDEN);

        const currencySymbol = currency === 'krw' ? '₩' : '$';

        // Prepare chart data
        const labels = countryAllocations.map((a) => a.countryName);
        const data = countryAllocations.map((a) => a.percentage.toNumber());
        const values = countryAllocations.map((a) => a.totalValue.toNumber());

        const chartData = {
            labels,
            datasets: [
                {
                    label: '국가별 비율 (%)',
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
                    ],
                    borderColor: document.body.classList.contains('dark-mode')
                        ? '#2d2d2d'
                        : '#ffffff',
                    borderWidth: 2,
                },
            ],
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' as const },
                title: {
                    display: true,
                    text: '국가별 배분',
                    font: { size: 16 },
                },
                tooltip: {
                    callbacks: {
                        label: function (context: any) {
                            const index = context.dataIndex;
                            const percentage = data[index].toFixed(2);
                            const value = values[index].toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                            });
                            return `${context.label}: ${percentage}% (${currencySymbol}${value})`;
                        },
                    },
                },
            },
        };

        if (this.#countryAllocationChartInstance) {
            this.#countryAllocationChartInstance.data = chartData;
            this.#countryAllocationChartInstance.options = chartOptions;
            this.#countryAllocationChartInstance.update();
        } else {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                this.#countryAllocationChartInstance = new ChartClass(ctx, {
                    type: 'pie',
                    data: chartData,
                    options: chartOptions,
                });
            }
        }

        // Render table below chart
        this.renderCountryTable(countryAllocations, currency);
    }

    /**
     * @description 히트맵 표시 (국가 x 자산 유형)
     * @param ChartClass - Chart.js class
     * @param heatmapCells - 히트맵 셀 데이터
     * @param currency - Currency mode
     */
    displayHeatmap(
        ChartClass: typeof Chart,
        heatmapCells: HeatmapCell[],
        currency: 'krw' | 'usd'
    ): void {
        const section = this.#dom.heatmapSection;
        const container = this.#dom.heatmapContainer;

        if (!section || !container) return;

        section.classList.remove(CSS_CLASSES.HIDDEN);

        const currencySymbol = currency === 'krw' ? '₩' : '$';

        // Build heatmap matrix
        const rows = Array.from(new Set(heatmapCells.map((c) => c.row)));
        const cols = Array.from(new Set(heatmapCells.map((c) => c.col)));

        // Create table
        let tableHTML = `
            <div class="heatmap-wrapper">
                <table class="heatmap-table">
                    <caption>자산 배분 히트맵 (국가 × 자산 유형)</caption>
                    <thead>
                        <tr>
                            <th>국가 \\ 자산 유형</th>
                            ${cols.map((col) => `<th>${escapeHTML(col)}</th>`).join('')}
                            <th>합계</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        rows.forEach((row) => {
            const rowCells = heatmapCells.filter((c) => c.row === row);
            const rowTotal = rowCells.reduce(
                (sum, cell) => sum + cell.value.toNumber(),
                0
            );

            tableHTML += `<tr><td class="row-label">${escapeHTML(row)}</td>`;

            cols.forEach((col) => {
                const cell = rowCells.find((c) => c.col === col);
                if (cell) {
                    const percentage = cell.percentage.toNumber();
                    const intensity = Math.min(100, percentage * 10); // Scale for color intensity
                    const value = cell.value.toNumber();
                    tableHTML += `<td class="heatmap-cell" style="background-color: rgba(54, 162, 235, ${intensity / 100}); color: ${intensity > 50 ? '#fff' : '#000'};" title="${col} in ${row}: ${percentage.toFixed(2)}%">
                        <div>${currencySymbol}${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                        <div class="heatmap-percentage">${percentage.toFixed(1)}%</div>
                    </td>`;
                } else {
                    tableHTML += `<td class="heatmap-cell empty">-</td>`;
                }
            });

            tableHTML += `<td class="row-total">${currencySymbol}${rowTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td></tr>`;
        });

        // Column totals
        tableHTML += `<tr><td class="row-label"><strong>합계</strong></td>`;
        cols.forEach((col) => {
            const colCells = heatmapCells.filter((c) => c.col === col);
            const colTotal = colCells.reduce(
                (sum, cell) => sum + cell.value.toNumber(),
                0
            );
            tableHTML += `<td class="col-total"><strong>${currencySymbol}${colTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</strong></td>`;
        });

        const grandTotal = heatmapCells.reduce(
            (sum, cell) => sum + cell.value.toNumber(),
            0
        );
        tableHTML += `<td class="grand-total"><strong>${currencySymbol}${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</strong></td>`;
        tableHTML += `</tr></tbody></table></div>`;

        container.innerHTML = tableHTML;
    }

    /**
     * @description 자산 유형별 테이블 렌더링
     */
    private renderAssetTypeTable(
        assetTypeAllocations: AssetTypeAllocation[],
        currency: 'krw' | 'usd'
    ): void {
        const container = this.#dom.assetAllocationTableContainer;
        if (!container) return;

        const currencySymbol = currency === 'krw' ? '₩' : '$';

        let tableHTML = `
            <div class="allocation-table-wrapper">
                <table class="allocation-table">
                    <caption>자산 유형별 상세 내역</caption>
                    <thead>
                        <tr>
                            <th>자산 유형</th>
                            <th>평가액</th>
                            <th>비율</th>
                            <th>종목 수</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        assetTypeAllocations.forEach((allocation) => {
            const label = this.getAssetTypeLabel(allocation.assetType);
            const value = allocation.totalValue.toNumber();
            const percentage = allocation.percentage.toNumber();

            tableHTML += `
                <tr>
                    <td>${escapeHTML(label)}</td>
                    <td style="text-align: right;">${currencySymbol}${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    <td style="text-align: right;">${percentage.toFixed(2)}%</td>
                    <td style="text-align: center;">${allocation.stockCount}</td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table></div>`;
        container.innerHTML = tableHTML;
    }

    /**
     * @description 국가별 테이블 렌더링
     */
    private renderCountryTable(
        countryAllocations: CountryAllocation[],
        currency: 'krw' | 'usd'
    ): void {
        const container = this.#dom.countryAllocationTableContainer;
        if (!container) return;

        const currencySymbol = currency === 'krw' ? '₩' : '$';

        let tableHTML = `
            <div class="allocation-table-wrapper">
                <table class="allocation-table">
                    <caption>국가별 상세 내역</caption>
                    <thead>
                        <tr>
                            <th>국가</th>
                            <th>평가액</th>
                            <th>비율</th>
                            <th>종목 수</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        countryAllocations.forEach((allocation) => {
            const value = allocation.totalValue.toNumber();
            const percentage = allocation.percentage.toNumber();

            tableHTML += `
                <tr>
                    <td>${escapeHTML(allocation.countryName)}</td>
                    <td style="text-align: right;">${currencySymbol}${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    <td style="text-align: right;">${percentage.toFixed(2)}%</td>
                    <td style="text-align: center;">${allocation.stockCount}</td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table></div>`;
        container.innerHTML = tableHTML;
    }

    /**
     * @description 자산 유형 라벨 가져오기
     */
    private getAssetTypeLabel(assetType: string): string {
        const labels: Record<string, string> = {
            stock: '주식',
            bond: '채권',
            cash: '현금',
            etf: 'ETF',
            other: '기타',
            unclassified: '미분류',
        };
        return labels[assetType] || assetType;
    }

    /**
     * @description Hide all asset allocation views
     */
    hideAllViews(): void {
        const assetSection = this.#dom.assetAllocationSection;
        const countrySection = this.#dom.countryAllocationSection;
        const heatmapSection = this.#dom.heatmapSection;

        if (assetSection) assetSection.classList.add(CSS_CLASSES.HIDDEN);
        if (countrySection) countrySection.classList.add(CSS_CLASSES.HIDDEN);
        if (heatmapSection) heatmapSection.classList.add(CSS_CLASSES.HIDDEN);
    }

    /**
     * @description Destroy chart instances
     */
    destroyCharts(): void {
        if (this.#assetAllocationChartInstance) {
            this.#assetAllocationChartInstance.destroy();
            this.#assetAllocationChartInstance = null;
        }
        if (this.#countryAllocationChartInstance) {
            this.#countryAllocationChartInstance.destroy();
            this.#countryAllocationChartInstance = null;
        }
        if (this.#heatmapChartInstance) {
            this.#heatmapChartInstance.destroy();
            this.#heatmapChartInstance = null;
        }
    }

    /**
     * @description Clean up all resources
     */
    cleanup(): void {
        this.destroyCharts();
    }
}
