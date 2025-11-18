// src/controller/ScenarioAnalysisManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { ScenarioAnalysisService } from '../services/ScenarioAnalysisService';
import type { CalculatedStock, ScenarioAnalysisResult } from '../types';
import { logger } from '../services/Logger';
import { formatCurrency } from '../utils';
import { isInputElement } from '../utils';
import Decimal from 'decimal.js';

/**
 * Helper function to format percentage
 */
function formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
}

/**
 * @class ScenarioAnalysisManager
 * @description 시나리오 분석 UI 관리
 */
export class ScenarioAnalysisManager {
    #state: PortfolioState;
    #view: PortfolioView;
    #currentAnalysis: ScenarioAnalysisResult | null = null;
    #currentPortfolioData: CalculatedStock[] = [];

    constructor(state: PortfolioState, view: PortfolioView) {
        this.#state = state;
        this.#view = view;
    }

    /**
     * @description Update scenario analysis with current portfolio data
     */
    updateScenarioAnalysis(portfolioData: CalculatedStock[], currentTotalValue: Decimal): void {
        try {
            this.#currentPortfolioData = portfolioData;

            // Update current value display
            if (this.#view.dom.scenarioCurrentValue) {
                this.#view.dom.scenarioCurrentValue.textContent =
                    formatCurrency(currentTotalValue.toNumber());
            }

            // Update goal simulator current value input (Phase 3.12)
            if (this.#view.dom.goalCurrentValue && isInputElement(this.#view.dom.goalCurrentValue)) {
                this.#view.dom.goalCurrentValue.value = currentTotalValue.toNumber().toFixed(2);
            }

            // Show section
            if (this.#view.dom.scenarioAnalysisSection) {
                this.#view.dom.scenarioAnalysisSection.classList.remove('hidden');
            }

            logger.info('Scenario analysis updated', 'ScenarioAnalysisManager');
        } catch (error) {
            logger.error('Failed to update scenario analysis', 'ScenarioAnalysisManager', error);
            this.#view.showToast('시나리오 분석 업데이트 실패', 'error');
        }
    }

    /**
     * @description Handle analyze scenario button click
     */
    handleAnalyzeScenario(): void {
        if (this.#currentPortfolioData.length === 0) {
            this.#view.showToast('포트폴리오 데이터가 없습니다.', 'warning');
            return;
        }

        try {
            // Run scenario analysis
            this.#currentAnalysis = ScenarioAnalysisService.analyzeScenarios(
                this.#currentPortfolioData
            );

            // Show results
            const container = this.#view.dom.scenarioResultsContainer;
            const table = this.#view.dom.scenarioResultsTable;

            if (!container || !table) return;

            container.classList.remove('hidden');
            this.renderScenarioResults(table, this.#currentAnalysis);

            this.#view.showToast('시나리오 분석이 완료되었습니다.', 'success');
        } catch (error) {
            logger.error('Failed to analyze scenarios', 'ScenarioAnalysisManager', error);
            this.#view.showToast('시나리오 분석 실패', 'error');
        }
    }

    /**
     * @description Render scenario results table
     */
    private renderScenarioResults(container: HTMLElement, analysis: ScenarioAnalysisResult): void {
        if (analysis.marketScenarios.length === 0) {
            container.innerHTML = '<p class="text-muted">시나리오 결과가 없습니다.</p>';
            return;
        }

        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>시나리오</th>
                        <th>새 포트폴리오 가치</th>
                        <th>변화 금액</th>
                        <th>변화율</th>
                    </tr>
                </thead>
                <tbody>
        `;

        analysis.marketScenarios.forEach((scenario) => {
            const changeClass =
                scenario.valueChange.toNumber() > 0
                    ? 'positive'
                    : scenario.valueChange.toNumber() < 0
                      ? 'negative'
                      : '';

            const changeSign = scenario.valueChange.toNumber() > 0 ? '+' : '';

            html += `
                <tr>
                    <td>${scenario.scenario.name}</td>
                    <td>${formatCurrency(scenario.newTotalValue.toNumber())}</td>
                    <td class="${changeClass}">${changeSign}${formatCurrency(scenario.valueChange.toNumber())}</td>
                    <td class="${changeClass}">${changeSign}${formatPercentage(scenario.valueChangePercent.toNumber())}</td>
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
     * @description Handle custom scenario button click
     */
    handleCustomScenarioToggle(): void {
        const container = this.#view.dom.customScenarioContainer;
        if (!container) return;

        // Toggle visibility
        container.classList.toggle('hidden');
    }

    /**
     * @description Handle run custom scenario button click
     */
    handleRunCustomScenario(): void {
        if (this.#currentPortfolioData.length === 0) {
            this.#view.showToast('포트폴리오 데이터가 없습니다.', 'warning');
            return;
        }

        const input = this.#view.dom.customMarketChange;
        const resultDiv = this.#view.dom.customScenarioResult;

        if (!input || !resultDiv || !isInputElement(input)) return;

        const marketChange = parseFloat(input.value);

        if (isNaN(marketChange)) {
            this.#view.showToast('올바른 변동률을 입력하세요.', 'error');
            return;
        }

        try {
            const result = ScenarioAnalysisService.analyzeCustomScenario(
                this.#currentPortfolioData,
                marketChange
            );

            this.renderCustomScenarioResult(resultDiv, result);
            this.#view.showToast('사용자 지정 시나리오 분석이 완료되었습니다.', 'success');
        } catch (error) {
            logger.error('Failed to analyze custom scenario', 'ScenarioAnalysisManager', error);
            this.#view.showToast('사용자 지정 시나리오 분석 실패', 'error');
        }
    }

    /**
     * @description Render custom scenario result
     */
    private renderCustomScenarioResult(container: HTMLElement, result: any): void {
        const changeClass =
            result.valueChange.toNumber() > 0
                ? 'positive'
                : result.valueChange.toNumber() < 0
                  ? 'negative'
                  : '';

        const changeSign = result.valueChange.toNumber() > 0 ? '+' : '';

        let html = `
            <div class="summary-cards">
                <div class="summary-card">
                    <h3>새 포트폴리오 가치</h3>
                    <p class="amount-large">${formatCurrency(result.newTotalValue.toNumber())}</p>
                </div>
                <div class="summary-card">
                    <h3>변화 금액</h3>
                    <p class="amount-large ${changeClass}">${changeSign}${formatCurrency(result.valueChange.toNumber())}</p>
                    <small class="${changeClass}">${changeSign}${formatPercentage(result.valueChangePercent.toNumber())}</small>
                </div>
            </div>

            <h4 class="mt-4">종목별 상세 변화</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>종목</th>
                        <th>현재 가치</th>
                        <th>새 가치</th>
                        <th>변화</th>
                    </tr>
                </thead>
                <tbody>
        `;

        result.newStockValues.forEach((stock: any) => {
            const stockChangeClass =
                stock.change.toNumber() > 0
                    ? 'positive'
                    : stock.change.toNumber() < 0
                      ? 'negative'
                      : '';

            const stockChangeSign = stock.change.toNumber() > 0 ? '+' : '';

            html += `
                <tr>
                    <td>${stock.stockName}</td>
                    <td>${formatCurrency(stock.currentValue.toNumber())}</td>
                    <td>${formatCurrency(stock.newValue.toNumber())}</td>
                    <td class="${stockChangeClass}">${stockChangeSign}${formatCurrency(stock.change.toNumber())} (${stockChangeSign}${formatPercentage(stock.changePercent.toNumber())})</td>
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
     * @description Hide scenario analysis section
     */
    hideScenarioAnalysis(): void {
        if (this.#view.dom.scenarioAnalysisSection) {
            this.#view.dom.scenarioAnalysisSection.classList.add('hidden');
        }
    }
}
