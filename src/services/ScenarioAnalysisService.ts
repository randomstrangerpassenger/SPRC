// src/services/ScenarioAnalysisService.ts
import Decimal from 'decimal.js';
import { DECIMAL_ZERO, DECIMAL_HUNDRED } from '../constants';
import type {
    CalculatedStock,
    MarketScenario,
    ScenarioResult,
    ScenarioAnalysisResult,
} from '../types';
import { logger } from './Logger';

/**
 * @class ScenarioAnalysisService
 * @description 시장 시나리오 분석 서비스
 */
export class ScenarioAnalysisService {
    /**
     * @description Analyze market scenarios
     */
    static analyzeScenarios(portfolioData: CalculatedStock[]): ScenarioAnalysisResult {
        const startTime = performance.now();

        try {
            // 현재 총 가치 계산
            const currentTotalValue = portfolioData.reduce(
                (sum, stock) => sum.plus(stock.calculated?.currentAmount || DECIMAL_ZERO),
                DECIMAL_ZERO
            );

            // 기본 시나리오 정의
            const scenarios: MarketScenario[] = [
                { name: '시장 +10%', marketChange: 10, description: '시장이 10% 상승하는 경우' },
                { name: '시장 +20%', marketChange: 20, description: '시장이 20% 상승하는 경우' },
                { name: '시장 +30%', marketChange: 30, description: '시장이 30% 상승하는 경우' },
                { name: '시장 -10%', marketChange: -10, description: '시장이 10% 하락하는 경우' },
                { name: '시장 -20%', marketChange: -20, description: '시장이 20% 하락하는 경우' },
                { name: '시장 -30%', marketChange: -30, description: '시장이 30% 하락하는 경우' },
            ];

            // 각 시나리오에 대해 분석 수행
            const marketScenarios = scenarios.map((scenario) =>
                this.calculateScenarioResult(portfolioData, currentTotalValue, scenario)
            );

            const result: ScenarioAnalysisResult = {
                currentTotalValue,
                marketScenarios,
            };

            const endTime = performance.now();
            if (import.meta.env.DEV) {
                logger.debug(
                    `Scenario analysis completed in ${(endTime - startTime).toFixed(2)} ms`,
                    'ScenarioAnalysisService'
                );
            }

            return result;
        } catch (error) {
            logger.error('Failed to analyze scenarios', 'ScenarioAnalysisService', error);
            throw error;
        }
    }

    /**
     * @description Calculate result for a specific scenario
     */
    private static calculateScenarioResult(
        portfolioData: CalculatedStock[],
        currentTotalValue: Decimal,
        scenario: MarketScenario
    ): ScenarioResult {
        const changeMultiplier = new Decimal(1).plus(new Decimal(scenario.marketChange).div(100));

        const newStockValues = portfolioData.map((stock) => {
            const currentValue = stock.calculated?.currentAmount || DECIMAL_ZERO;
            const newValue = currentValue.times(changeMultiplier);
            const change = newValue.minus(currentValue);
            const changePercent = currentValue.isZero()
                ? DECIMAL_ZERO
                : change.div(currentValue).times(DECIMAL_HUNDRED);

            return {
                stockId: stock.id,
                stockName: stock.name,
                currentValue,
                newValue,
                change,
                changePercent,
            };
        });

        const newTotalValue = newStockValues.reduce(
            (sum, stock) => sum.plus(stock.newValue),
            DECIMAL_ZERO
        );
        const valueChange = newTotalValue.minus(currentTotalValue);
        const valueChangePercent = currentTotalValue.isZero()
            ? DECIMAL_ZERO
            : valueChange.div(currentTotalValue).times(DECIMAL_HUNDRED);

        return {
            scenario,
            newTotalValue,
            valueChange,
            valueChangePercent,
            newStockValues,
        };
    }

    /**
     * @description Analyze custom scenario with user-defined market change
     */
    static analyzeCustomScenario(
        portfolioData: CalculatedStock[],
        customMarketChange: number
    ): ScenarioResult {
        const currentTotalValue = portfolioData.reduce(
            (sum, stock) => sum.plus(stock.calculated?.currentAmount || DECIMAL_ZERO),
            DECIMAL_ZERO
        );

        const customScenario: MarketScenario = {
            name: `사용자 지정 (${customMarketChange > 0 ? '+' : ''}${customMarketChange}%)`,
            marketChange: customMarketChange,
            description: `시장이 ${customMarketChange}% 변동하는 경우`,
        };

        return this.calculateScenarioResult(portfolioData, currentTotalValue, customScenario);
    }
}
