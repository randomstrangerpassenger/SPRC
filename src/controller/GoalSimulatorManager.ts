// src/controller/GoalSimulatorManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { GoalSimulatorService } from '../services/GoalSimulatorService';
import type { GoalSimulationInput } from '../types';
import { logger } from '../services/Logger';
import { formatCurrency } from '../utils';
import { isInputElement } from '../utils';
import Decimal from 'decimal.js';
import { DECIMAL_ZERO } from '../constants';

/**
 * Helper function to format percentage
 */
function formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
}

/**
 * @class GoalSimulatorManager
 * @description 목표 달성 시뮬레이터 UI 관리
 */
export class GoalSimulatorManager {
    #state: PortfolioState;
    #view: PortfolioView;

    constructor(state: PortfolioState, view: PortfolioView) {
        this.#state = state;
        this.#view = view;
    }

    /**
     * @description Show goal simulator section
     */
    showGoalSimulator(): void {
        if (this.#view.dom.goalSimulatorSection) {
            this.#view.dom.goalSimulatorSection.classList.remove('hidden');
        }
    }

    /**
     * @description Handle simulate goal button click
     */
    handleSimulateGoal(): void {
        const dom = this.#view.dom;

        // Validate inputs
        if (
            !isInputElement(dom.goalCurrentValue) ||
            !isInputElement(dom.goalTargetAmount) ||
            !isInputElement(dom.goalMonthlyContribution) ||
            !isInputElement(dom.goalExpectedReturn)
        ) {
            this.#view.showToast('필수 입력 항목이 누락되었습니다.', 'error');
            return;
        }

        const currentValue = new Decimal(dom.goalCurrentValue.value || 0);
        const targetAmount = new Decimal(dom.goalTargetAmount.value || 0);
        const monthlyContribution = new Decimal(dom.goalMonthlyContribution.value || 0);
        const expectedAnnualReturn = parseFloat(dom.goalExpectedReturn.value || '7');

        // Validate values
        if (targetAmount.lessThanOrEqualTo(DECIMAL_ZERO)) {
            this.#view.showToast('목표 금액을 입력하세요.', 'error');
            return;
        }

        if (monthlyContribution.lessThan(DECIMAL_ZERO)) {
            this.#view.showToast('월 적립금은 0 이상이어야 합니다.', 'error');
            return;
        }

        try {
            const input: GoalSimulationInput = {
                currentValue,
                targetAmount,
                monthlyContribution,
                expectedAnnualReturn,
            };

            const result = GoalSimulatorService.simulateGoal(input);

            this.renderSimulationResult(result);
            this.#view.showToast('시뮬레이션이 완료되었습니다.', 'success');
        } catch (error) {
            logger.error('Failed to simulate goal', 'GoalSimulatorManager', error);
            this.#view.showToast('시뮬레이션 실패', 'error');
        }
    }

    /**
     * @description Render simulation result
     */
    private renderSimulationResult(result: any): void {
        const summaryDiv = this.#view.dom.goalSimulationSummary;
        const chartDiv = this.#view.dom.goalSimulationChart;
        const container = this.#view.dom.goalSimulationResult;

        if (!summaryDiv || !chartDiv || !container) return;

        // Show container
        container.classList.remove('hidden');

        // Render summary
        const achievableClass = result.achievable ? 'positive' : 'negative';
        const achievableText = result.achievable ? '✅ 달성 가능' : '⚠️ 달성 어려움';

        let html = `
            <div class="summary-cards">
                <div class="summary-card ${achievableClass}">
                    <h3>달성 가능 여부</h3>
                    <p class="amount-large">${achievableText}</p>
                    <small>${result.message || ''}</small>
                </div>
                <div class="summary-card">
                    <h3>소요 기간</h3>
                    <p class="amount-large">${result.yearsToGoal}년 ${result.monthsToGoal % 12}개월</p>
                    <small>총 ${result.monthsToGoal}개월</small>
                </div>
            </div>
            <div class="summary-cards mt-3">
                <div class="summary-card">
                    <h3>최종 포트폴리오 가치</h3>
                    <p class="amount-large">${formatCurrency(result.finalValue.toNumber())}</p>
                </div>
                <div class="summary-card">
                    <h3>총 적립금</h3>
                    <p class="amount-large">${formatCurrency(result.totalContributions.toNumber())}</p>
                </div>
                <div class="summary-card">
                    <h3>총 수익금</h3>
                    <p class="amount-large positive">${formatCurrency(result.totalGains.toNumber())}</p>
                </div>
            </div>
        `;

        summaryDiv.innerHTML = html;

        // Render chart (simple table)
        if (result.monthlyProjections && result.monthlyProjections.length > 0) {
            let chartHtml = `
                <h4>연도별 예상 추이</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>경과 년수</th>
                            <th>포트폴리오 가치</th>
                            <th>총 적립금</th>
                            <th>총 수익금</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            result.monthlyProjections.forEach((projection: any) => {
                const years = Math.floor(projection.month / 12);
                if (projection.month % 12 === 0) {
                    chartHtml += `
                        <tr>
                            <td>${years}년</td>
                            <td>${formatCurrency(projection.portfolioValue.toNumber())}</td>
                            <td>${formatCurrency(projection.totalContributions.toNumber())}</td>
                            <td class="positive">${formatCurrency(projection.totalGains.toNumber())}</td>
                        </tr>
                    `;
                }
            });

            chartHtml += `
                    </tbody>
                </table>
            `;

            chartDiv.innerHTML = chartHtml;
        } else {
            chartDiv.innerHTML = '';
        }
    }

    /**
     * @description Handle calculate required contribution button click
     */
    handleCalculateRequiredContribution(): void {
        const dom = this.#view.dom;

        // Show required contribution section first
        if (dom.requiredContributionResult) {
            dom.requiredContributionResult.classList.remove('hidden');
        }

        // Validate inputs
        if (
            !isInputElement(dom.goalCurrentValue) ||
            !isInputElement(dom.goalTargetAmount) ||
            !isInputElement(dom.goalExpectedReturn) ||
            !isInputElement(dom.goalYearsToGoal)
        ) {
            this.#view.showToast('필수 입력 항목이 누락되었습니다.', 'error');
            return;
        }

        const currentValue = new Decimal(dom.goalCurrentValue.value || 0);
        const targetAmount = new Decimal(dom.goalTargetAmount.value || 0);
        const expectedAnnualReturn = parseFloat(dom.goalExpectedReturn.value || '7');
        const yearsToGoal = parseInt(dom.goalYearsToGoal.value || '20', 10);

        // Validate values
        if (targetAmount.lessThanOrEqualTo(DECIMAL_ZERO)) {
            this.#view.showToast('목표 금액을 입력하세요.', 'error');
            return;
        }

        if (yearsToGoal <= 0) {
            this.#view.showToast('목표 달성 기간은 1년 이상이어야 합니다.', 'error');
            return;
        }

        try {
            const requiredMonthlyContribution =
                GoalSimulatorService.calculateRequiredMonthlyContribution(
                    currentValue,
                    targetAmount,
                    yearsToGoal,
                    expectedAnnualReturn
                );

            this.renderRequiredContributionResult(
                requiredMonthlyContribution,
                currentValue,
                targetAmount,
                yearsToGoal,
                expectedAnnualReturn
            );

            this.#view.showToast('필요 적립금 계산이 완료되었습니다.', 'success');
        } catch (error) {
            logger.error(
                'Failed to calculate required contribution',
                'GoalSimulatorManager',
                error
            );
            this.#view.showToast('필요 적립금 계산 실패', 'error');
        }
    }

    /**
     * @description Render required contribution result
     */
    private renderRequiredContributionResult(
        requiredMonthlyContribution: Decimal,
        currentValue: Decimal,
        targetAmount: Decimal,
        yearsToGoal: number,
        expectedAnnualReturn: number
    ): void {
        const summaryDiv = this.#view.dom.requiredContributionSummary;

        if (!summaryDiv) return;

        const totalContributions = requiredMonthlyContribution.times(yearsToGoal * 12);
        const futureValueOfCurrent = currentValue.times(
            new Decimal(1).plus(new Decimal(expectedAnnualReturn).div(100)).pow(yearsToGoal)
        );
        const totalGains = targetAmount.minus(currentValue).minus(totalContributions);

        let html = `
            <div class="summary-cards">
                <div class="summary-card">
                    <h3>필요 월 적립금</h3>
                    <p class="amount-large">${formatCurrency(requiredMonthlyContribution.toNumber())}</p>
                    <small>${yearsToGoal}년간 매월</small>
                </div>
                <div class="summary-card">
                    <h3>총 적립금</h3>
                    <p class="amount-large">${formatCurrency(totalContributions.toNumber())}</p>
                </div>
                <div class="summary-card">
                    <h3>예상 수익금</h3>
                    <p class="amount-large positive">${formatCurrency(totalGains.toNumber())}</p>
                </div>
            </div>
            <div class="mt-3">
                <p><strong>현재 포트폴리오 가치:</strong> ${formatCurrency(currentValue.toNumber())}</p>
                <p><strong>목표 금액:</strong> ${formatCurrency(targetAmount.toNumber())}</p>
                <p><strong>목표 달성 기간:</strong> ${yearsToGoal}년</p>
                <p><strong>예상 연간 수익률:</strong> ${formatPercentage(expectedAnnualReturn)}</p>
            </div>
        `;

        if (requiredMonthlyContribution.isZero()) {
            html += `<p class="positive mt-3">✅ 현재 포트폴리오 가치만으로도 목표를 달성할 수 있습니다!</p>`;
        }

        summaryDiv.innerHTML = html;
    }

    /**
     * @description Hide goal simulator section
     */
    hideGoalSimulator(): void {
        if (this.#view.dom.goalSimulatorSection) {
            this.#view.dom.goalSimulatorSection.classList.add('hidden');
        }
    }
}
