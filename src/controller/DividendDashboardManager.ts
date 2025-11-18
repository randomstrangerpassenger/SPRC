// src/controller/DividendDashboardManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { DividendAnalysisService } from '../services/DividendAnalysisService';
import type { CalculatedStock, DividendAnalysisResult } from '../types';
import { logger } from '../services/Logger';
import { formatCurrency } from '../utils';
import Decimal from 'decimal.js';

/**
 * Helper function to format percentage
 */
function formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
}

/**
 * @class DividendDashboardManager
 * @description 배당금 대시보드 UI 관리
 */
export class DividendDashboardManager {
    #state: PortfolioState;
    #view: PortfolioView;
    #currentAnalysis: DividendAnalysisResult | null = null;

    constructor(state: PortfolioState, view: PortfolioView) {
        this.#state = state;
        this.#view = view;
    }

    /**
     * @description Update dividend dashboard with current portfolio data
     */
    updateDashboard(portfolioData: CalculatedStock[], currentTotalValue: Decimal): void {
        try {
            // Run dividend analysis
            this.#currentAnalysis = DividendAnalysisService.analyzeDividends(
                portfolioData,
                currentTotalValue
            );

            // Update summary cards
            this.renderSummary(this.#currentAnalysis);

            // Show dashboard
            if (this.#view.dom.dividendDashboardSection) {
                this.#view.dom.dividendDashboardSection.classList.remove('hidden');
            }

            logger.info('Dividend dashboard updated', 'DividendDashboardManager');
        } catch (error) {
            logger.error('Failed to update dividend dashboard', 'DividendDashboardManager', error);
            this.#view.showToast('배당금 대시보드 업데이트 실패', 'error');
        }
    }

    /**
     * @description Render summary cards
     */
    private renderSummary(analysis: DividendAnalysisResult): void {
        const dom = this.#view.dom;

        // Total dividends
        if (dom.totalDividendsAmount) {
            dom.totalDividendsAmount.textContent = formatCurrency(
                analysis.totalDividends.toNumber()
            );
        }

        // Estimated annual dividend
        if (dom.estimatedAnnualDividend) {
            dom.estimatedAnnualDividend.textContent = formatCurrency(
                analysis.estimatedAnnualDividend.toNumber()
            );
        }

        // Dividend yield
        if (dom.dividendYield) {
            dom.dividendYield.textContent = `수익률: ${formatPercentage(analysis.dividendYield.toNumber())}`;
        }
    }

    /**
     * @description Show yearly dividends table
     */
    handleShowYearlyDividends(): void {
        if (!this.#currentAnalysis) {
            this.#view.showToast('배당 분석 데이터가 없습니다.', 'warning');
            return;
        }

        const container = this.#view.dom.yearlyDividendsContainer;
        const table = this.#view.dom.yearlyDividendsTable;

        if (!container || !table) return;

        // Toggle visibility
        const isHidden = container.classList.contains('hidden');
        container.classList.toggle('hidden', !isHidden);

        // If showing, render data
        if (isHidden) {
            this.renderYearlyDividendsTable(table, this.#currentAnalysis.yearlyDividends);
        }
    }

    /**
     * @description Render yearly dividends table
     */
    private renderYearlyDividendsTable(
        container: HTMLElement,
        yearlyDividends: DividendAnalysisResult['yearlyDividends']
    ): void {
        if (yearlyDividends.length === 0) {
            container.innerHTML = '<p class="text-muted">연도별 배당 데이터가 없습니다.</p>';
            return;
        }

        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>연도</th>
                        <th>총 배당금</th>
                        <th>평균 월별 배당</th>
                        <th>배당 지급 종목 수</th>
                    </tr>
                </thead>
                <tbody>
        `;

        yearlyDividends.forEach((yearly) => {
            html += `
                <tr>
                    <td>${yearly.year}</td>
                    <td>${formatCurrency(yearly.totalAmount.toNumber())}</td>
                    <td>${formatCurrency(yearly.averageMonthly.toNumber())}</td>
                    <td>${yearly.stockCount}개</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    }

    /**
     * @description Show monthly dividends table
     */
    handleShowMonthlyDividends(): void {
        if (!this.#currentAnalysis) {
            this.#view.showToast('배당 분석 데이터가 없습니다.', 'warning');
            return;
        }

        const container = this.#view.dom.monthlyDividendsContainer;
        const table = this.#view.dom.monthlyDividendsTable;

        if (!container || !table) return;

        // Toggle visibility
        const isHidden = container.classList.contains('hidden');
        container.classList.toggle('hidden', !isHidden);

        // If showing, render data
        if (isHidden) {
            this.renderMonthlyDividendsTable(table, this.#currentAnalysis.monthlyDividends);
        }
    }

    /**
     * @description Render monthly dividends table
     */
    private renderMonthlyDividendsTable(
        container: HTMLElement,
        monthlyDividends: DividendAnalysisResult['monthlyDividends']
    ): void {
        if (monthlyDividends.length === 0) {
            container.innerHTML = '<p class="text-muted">월별 배당 데이터가 없습니다.</p>';
            return;
        }

        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>연월</th>
                        <th>배당금</th>
                        <th>배당 거래 수</th>
                    </tr>
                </thead>
                <tbody>
        `;

        monthlyDividends.forEach((monthly) => {
            html += `
                <tr>
                    <td>${monthly.year}년 ${monthly.month}월</td>
                    <td>${formatCurrency(monthly.amount.toNumber())}</td>
                    <td>${monthly.count}건</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    }

    /**
     * @description Show dividend growth chart
     */
    handleShowDividendGrowth(): void {
        if (!this.#currentAnalysis) {
            this.#view.showToast('배당 분석 데이터가 없습니다.', 'warning');
            return;
        }

        const container = this.#view.dom.dividendGrowthContainer;
        const chartDiv = this.#view.dom.dividendGrowthChart;

        if (!container || !chartDiv) return;

        // Toggle visibility
        const isHidden = container.classList.contains('hidden');
        container.classList.toggle('hidden', !isHidden);

        // If showing, render data
        if (isHidden) {
            this.renderDividendGrowthChart(chartDiv, this.#currentAnalysis.dividendGrowth);
        }
    }

    /**
     * @description Render dividend growth chart (simple table for now)
     */
    private renderDividendGrowthChart(
        container: HTMLElement,
        dividendGrowth: DividendAnalysisResult['dividendGrowth']
    ): void {
        if (dividendGrowth.length === 0) {
            container.innerHTML = '<p class="text-muted">배당 성장률 데이터가 없습니다.</p>';
            return;
        }

        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>연도</th>
                        <th>총 배당금</th>
                        <th>전년 대비 성장률</th>
                    </tr>
                </thead>
                <tbody>
        `;

        dividendGrowth.forEach((growth) => {
            const growthRateClass =
                growth.growthRate.toNumber() > 0
                    ? 'positive'
                    : growth.growthRate.toNumber() < 0
                      ? 'negative'
                      : '';
            const growthRateText =
                growth.growthRate.toNumber() > 0
                    ? `+${formatPercentage(growth.growthRate.toNumber())}`
                    : growth.growthRate.toNumber() === 0
                      ? '-'
                      : formatPercentage(growth.growthRate.toNumber());

            html += `
                <tr>
                    <td>${growth.year}</td>
                    <td>${formatCurrency(growth.totalDividend.toNumber())}</td>
                    <td class="${growthRateClass}">${growthRateText}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    }

    /**
     * @description Hide dashboard
     */
    hideDashboard(): void {
        if (this.#view.dom.dividendDashboardSection) {
            this.#view.dom.dividendDashboardSection.classList.add('hidden');
        }
    }
}
