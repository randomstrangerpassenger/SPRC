// src/services/GoalSimulatorService.ts
import Decimal from 'decimal.js';
import { DECIMAL_ZERO } from '../constants';
import type {
    GoalSimulationInput,
    GoalSimulationResult,
    MonthlyProjection,
} from '../types';
import { logger } from './Logger';

/**
 * @class GoalSimulatorService
 * @description 목표 달성 시뮬레이터 서비스
 */
export class GoalSimulatorService {
    /**
     * @description Simulate goal achievement with monthly contributions
     */
    static simulateGoal(input: GoalSimulationInput): GoalSimulationResult {
        const startTime = performance.now();

        try {
            const { currentValue, targetAmount, monthlyContribution, expectedAnnualReturn } =
                input;

            // 월 수익률 계산 (연간 수익률을 월 단위로 변환)
            const monthlyReturn = new Decimal(expectedAnnualReturn).div(100).div(12);

            // 목표 금액이 현재 가치보다 작거나 같은 경우
            if (targetAmount.lessThanOrEqualTo(currentValue)) {
                const endTime = performance.now();
                if (import.meta.env.DEV) {
                    logger.debug(
                        `Goal simulation completed in ${(endTime - startTime).toFixed(2)} ms`,
                        'GoalSimulatorService'
                    );
                }

                return {
                    input,
                    monthsToGoal: 0,
                    yearsToGoal: 0,
                    finalValue: currentValue,
                    totalContributions: DECIMAL_ZERO,
                    totalGains: DECIMAL_ZERO,
                    monthlyProjections: [],
                    achievable: true,
                    message: '이미 목표 금액을 달성했습니다!',
                };
            }

            // 월별 시뮬레이션 실행
            let currentPortfolioValue = currentValue;
            let totalContributions = DECIMAL_ZERO;
            const monthlyProjections: MonthlyProjection[] = [];
            let month = 0;
            const MAX_MONTHS = 1200; // 100년 (안전장치)

            while (currentPortfolioValue.lessThan(targetAmount) && month < MAX_MONTHS) {
                month++;

                // 월 수익 적용
                const monthlyGain = currentPortfolioValue.times(monthlyReturn);
                currentPortfolioValue = currentPortfolioValue.plus(monthlyGain);

                // 월 적립금 추가
                currentPortfolioValue = currentPortfolioValue.plus(monthlyContribution);
                totalContributions = totalContributions.plus(monthlyContribution);

                // 매 12개월마다 또는 마지막 개월에 projection 저장
                if (month % 12 === 0 || currentPortfolioValue.greaterThanOrEqualTo(targetAmount)) {
                    const totalGains = currentPortfolioValue.minus(currentValue).minus(totalContributions);
                    monthlyProjections.push({
                        month,
                        portfolioValue: currentPortfolioValue,
                        totalContributions,
                        totalGains,
                    });
                }
            }

            // 목표 달성 불가능한 경우
            if (month >= MAX_MONTHS) {
                const endTime = performance.now();
                if (import.meta.env.DEV) {
                    logger.debug(
                        `Goal simulation completed in ${(endTime - startTime).toFixed(2)} ms`,
                        'GoalSimulatorService'
                    );
                }

                return {
                    input,
                    monthsToGoal: MAX_MONTHS,
                    yearsToGoal: Math.floor(MAX_MONTHS / 12),
                    finalValue: currentPortfolioValue,
                    totalContributions,
                    totalGains: currentPortfolioValue.minus(currentValue).minus(totalContributions),
                    monthlyProjections,
                    achievable: false,
                    message: '현재 조건으로는 목표 달성이 매우 어렵습니다. 월 적립금 또는 예상 수익률을 조정해보세요.',
                };
            }

            const totalGains = currentPortfolioValue.minus(currentValue).minus(totalContributions);

            const endTime = performance.now();
            if (import.meta.env.DEV) {
                logger.debug(
                    `Goal simulation completed in ${(endTime - startTime).toFixed(2)} ms`,
                    'GoalSimulatorService'
                );
            }

            return {
                input,
                monthsToGoal: month,
                yearsToGoal: Math.floor(month / 12),
                finalValue: currentPortfolioValue,
                totalContributions,
                totalGains,
                monthlyProjections,
                achievable: true,
                message: `목표 달성까지 약 ${Math.floor(month / 12)}년 ${month % 12}개월이 소요됩니다.`,
            };
        } catch (error) {
            logger.error('Failed to simulate goal', 'GoalSimulatorService', error);
            throw error;
        }
    }

    /**
     * @description Calculate required monthly contribution to reach goal in specified years
     */
    static calculateRequiredMonthlyContribution(
        currentValue: Decimal,
        targetAmount: Decimal,
        yearsToGoal: number,
        expectedAnnualReturn: number
    ): Decimal {
        try {
            if (yearsToGoal <= 0) {
                throw new Error('목표 기간은 0보다 커야 합니다.');
            }

            const monthlyReturn = new Decimal(expectedAnnualReturn).div(100).div(12);
            const months = yearsToGoal * 12;

            // 목표 금액이 현재 가치보다 작거나 같은 경우
            if (targetAmount.lessThanOrEqualTo(currentValue)) {
                return DECIMAL_ZERO;
            }

            // Future Value of Lump Sum (현재 가치의 미래가치)
            const futureValueOfCurrent = currentValue.times(
                new Decimal(1).plus(monthlyReturn).pow(months)
            );

            // Remaining amount to be accumulated through monthly contributions
            const remainingAmount = targetAmount.minus(futureValueOfCurrent);

            if (remainingAmount.lessThanOrEqualTo(DECIMAL_ZERO)) {
                return DECIMAL_ZERO; // 현재 가치만으로도 목표 달성 가능
            }

            // Future Value of Annuity 공식을 사용하여 월 적립금 계산
            // FV = PMT * [(1 + r)^n - 1] / r
            // PMT = FV / [(1 + r)^n - 1] * r

            const onePlusR = new Decimal(1).plus(monthlyReturn);
            const futureValueFactor = onePlusR.pow(months).minus(1).div(monthlyReturn);

            const requiredMonthlyContribution = remainingAmount.div(futureValueFactor);

            return requiredMonthlyContribution;
        } catch (error) {
            logger.error(
                'Failed to calculate required monthly contribution',
                'GoalSimulatorService',
                error
            );
            throw error;
        }
    }
}
