// src/calculationStrategies.ts
import Decimal from 'decimal.js';
import type { CalculatedStock, RebalancingRules } from './types';
import { DECIMAL_ZERO, DECIMAL_HUNDRED } from './constants';
import { logger } from './services/Logger';

// ==================== 공통 유틸리티 함수 ====================

/**
 * @description 포트폴리오의 목표 비율 합계 계산
 */
function calculateTotalRatio(portfolioData: CalculatedStock[]): Decimal {
    return portfolioData.reduce((sum, s) => sum.plus(s.targetRatio || 0), DECIMAL_ZERO);
}

/**
 * @description 목표 비율을 100%로 정규화하기 위한 계수 계산
 */
function calculateRatioMultiplier(totalRatio: Decimal): Decimal {
    return totalRatio.isZero() ? DECIMAL_ZERO : DECIMAL_HUNDRED.div(totalRatio);
}

/**
 * @description 고정 매수 금액을 먼저 할당하고 남은 투자금 반환
 */
function allocateFixedBuyAmounts(
    portfolioData: CalculatedStock[],
    additionalInvestment: Decimal,
    results: RebalancingResult[]
): Decimal {
    const zero = DECIMAL_ZERO;
    let remainingInvestment = additionalInvestment;

    for (const s of portfolioData) {
        let buyAmount = zero;
        if (s.isFixedBuyEnabled) {
            const fixedAmountDec = new Decimal(s.fixedBuyAmount || 0);
            if (remainingInvestment.greaterThanOrEqualTo(fixedAmountDec)) {
                buyAmount = fixedAmountDec;
                remainingInvestment = remainingInvestment.minus(fixedAmountDec);
            } else {
                buyAmount = remainingInvestment;
                remainingInvestment = zero;
            }
        }
        // results 배열에서 해당 종목을 찾아 finalBuyAmount 설정
        const resultItem = results.find((r) => r.id === s.id);
        if (resultItem) {
            resultItem.finalBuyAmount = buyAmount;
        }
    }

    return remainingInvestment;
}

/**
 * @description 목표 금액 대비 부족분(deficit) 계산 및 비율에 따라 남은 투자금 배분
 */
function distributeRemainingInvestment(
    results: RebalancingResult[],
    totalInvestment: Decimal,
    remainingInvestment: Decimal,
    ratioMultiplier: Decimal
): void {
    const zero = DECIMAL_ZERO;

    const targetAmounts = results.map((s) => {
        const targetRatioNormalized = new Decimal(s.targetRatio || 0).times(ratioMultiplier);
        const currentAmount = s.calculated?.currentAmount || zero;
        return {
            id: s.id,
            targetAmount: totalInvestment.times(targetRatioNormalized.div(100)),
            currentAmount: currentAmount,
        };
    });

    const adjustmentTargets = targetAmounts
        .map((t) => {
            const currentTotalBeforeRatioAlloc = t.currentAmount.plus(
                results.find((s) => s.id === t.id)?.finalBuyAmount || zero
            );
            const deficit = t.targetAmount.minus(currentTotalBeforeRatioAlloc);
            return { ...t, deficit: deficit.greaterThan(zero) ? deficit : zero };
        })
        .filter((t) => t.deficit.greaterThan(zero));

    const totalDeficit = adjustmentTargets.reduce((sum, t) => sum.plus(t.deficit), zero);

    if (remainingInvestment.greaterThan(zero) && totalDeficit.greaterThan(zero)) {
        for (const target of adjustmentTargets) {
            const ratio = target.deficit.div(totalDeficit);
            const allocatedAmount = remainingInvestment.times(ratio);
            const resultItem = results.find((r) => r.id === target.id);
            if (resultItem) {
                resultItem.finalBuyAmount = resultItem.finalBuyAmount.plus(allocatedAmount);
            }
        }
    }
}

/**
 * @description 맞춤형 리밸런싱 규칙 적용
 */
function applyRebalancingRules(
    results: RebalancingResult[],
    totalInvestment: Decimal,
    rules?: RebalancingRules
): void {
    if (!rules || !rules.enabled) {
        return;
    }

    const zero = DECIMAL_ZERO;

    // 1. 밴드 규칙 적용: 목표 비율과의 차이가 밴드 내에 있으면 매수 금액을 0으로 설정
    if (rules.bandPercentage !== undefined && rules.bandPercentage > 0) {
        const bandDec = new Decimal(rules.bandPercentage);
        for (const result of results) {
            const currentAmount = result.calculated?.currentAmount || zero;
            const currentRatio = totalInvestment.isZero()
                ? zero
                : currentAmount.div(totalInvestment).times(DECIMAL_HUNDRED);
            const targetRatio = new Decimal(result.targetRatio || 0);
            const diff = currentRatio.minus(targetRatio).abs();

            // 목표 비율과의 차이가 밴드 내에 있으면 매수하지 않음
            if (diff.lessThanOrEqualTo(bandDec)) {
                result.finalBuyAmount = zero;
            }
        }
    }

    // 2. 최소 거래 금액 규칙 적용
    if (rules.minTradeAmount !== undefined && rules.minTradeAmount > 0) {
        const minTradeDec = new Decimal(rules.minTradeAmount);
        for (const result of results) {
            if (result.finalBuyAmount.lessThan(minTradeDec)) {
                result.finalBuyAmount = zero;
            }
        }
    }

    // 3. 종목별 상한선 적용
    if (rules.stockLimits && rules.stockLimits.length > 0) {
        for (const limit of rules.stockLimits) {
            const result = results.find((r) => r.id === limit.stockId);
            if (!result) continue;

            // 최대 할당 비율 적용
            if (limit.maxAllocationPercent !== undefined) {
                const currentAmount = result.calculated?.currentAmount || zero;
                const afterBuyAmount = currentAmount.plus(result.finalBuyAmount);
                const afterBuyRatio = totalInvestment.isZero()
                    ? zero
                    : afterBuyAmount.div(totalInvestment).times(DECIMAL_HUNDRED);
                const maxRatio = new Decimal(limit.maxAllocationPercent);

                if (afterBuyRatio.greaterThan(maxRatio)) {
                    // 상한선을 초과하지 않도록 매수 금액 조정
                    const maxAmount = totalInvestment.times(maxRatio.div(DECIMAL_HUNDRED));
                    result.finalBuyAmount = Decimal.max(zero, maxAmount.minus(currentAmount));
                }
            }

            // 최소 거래 금액 적용 (종목별)
            if (limit.minTradeAmount !== undefined) {
                const minTradeDec = new Decimal(limit.minTradeAmount);
                if (result.finalBuyAmount.lessThan(minTradeDec)) {
                    result.finalBuyAmount = zero;
                }
            }
        }
    }

    // 4. 섹터별 상한선 적용
    if (rules.sectorLimits && rules.sectorLimits.length > 0) {
        for (const limit of rules.sectorLimits) {
            const sectorResults = results.filter((r) => r.sector === limit.sector);
            if (sectorResults.length === 0) continue;

            const sectorCurrentTotal = sectorResults.reduce(
                (sum, r) => sum.plus(r.calculated?.currentAmount || zero),
                zero
            );
            const sectorAfterBuyTotal = sectorResults.reduce(
                (sum, r) =>
                    sum.plus(r.calculated?.currentAmount || zero).plus(r.finalBuyAmount || zero),
                zero
            );
            const sectorAfterBuyRatio = totalInvestment.isZero()
                ? zero
                : sectorAfterBuyTotal.div(totalInvestment).times(DECIMAL_HUNDRED);
            const maxRatio = new Decimal(limit.maxAllocationPercent);

            if (sectorAfterBuyRatio.greaterThan(maxRatio)) {
                // 섹터 전체가 상한선을 초과하면 비율에 따라 매수 금액 조정
                const maxSectorAmount = totalInvestment.times(maxRatio.div(DECIMAL_HUNDRED));
                const excessAmount = sectorAfterBuyTotal.minus(maxSectorAmount);

                // 각 종목의 매수 금액을 비율에 따라 감소
                const totalBuyInSector = sectorResults.reduce(
                    (sum, r) => sum.plus(r.finalBuyAmount || zero),
                    zero
                );

                if (totalBuyInSector.greaterThan(zero)) {
                    for (const result of sectorResults) {
                        const ratio = result.finalBuyAmount.div(totalBuyInSector);
                        const reduction = excessAmount.times(ratio);
                        result.finalBuyAmount = Decimal.max(
                            zero,
                            result.finalBuyAmount.minus(reduction)
                        );
                    }
                }
            }
        }
    }
}

// ==================== 전략 인터페이스 ====================

// Rebalancing result type (strategy-specific properties can extend this)
export type RebalancingResult = CalculatedStock & Record<string, unknown>;

/**
 * @description 모든 리밸런싱 전략이 따라야 하는 인터페이스
 */
export interface IRebalanceStrategy {
    calculate(): { results: RebalancingResult[] };
}

/**
 * @description '추가 매수' 모드 계산 전략
 */
export class AddRebalanceStrategy implements IRebalanceStrategy {
    #portfolioData: CalculatedStock[];
    #additionalInvestment: Decimal;
    #rebalancingRules?: RebalancingRules;

    constructor(
        portfolioData: CalculatedStock[],
        additionalInvestment: Decimal,
        rebalancingRules?: RebalancingRules
    ) {
        this.#portfolioData = portfolioData;
        this.#additionalInvestment = additionalInvestment;
        this.#rebalancingRules = rebalancingRules;
    }

    calculate(): { results: RebalancingResult[] } {
        let startTime: number | undefined;
        if (import.meta.env.DEV) {
            startTime = performance.now();
        }
        const zero = DECIMAL_ZERO;

        // 현재 총 자산 + 추가 투자금 = 총 투자금
        const currentTotal = this.#portfolioData.reduce(
            (sum, s) => sum.plus(s.calculated?.currentAmount || zero),
            zero
        );
        const totalInvestment = currentTotal.plus(this.#additionalInvestment);

        // 공통 유틸리티 사용: 목표 비율 계산
        const totalRatio = calculateTotalRatio(this.#portfolioData);
        const ratioMultiplier = calculateRatioMultiplier(totalRatio);

        // 초기 결과 배열 생성 (currentRatio, finalBuyAmount 초기화)
        const results = this.#portfolioData.map((s) => {
            const currentAmount = s.calculated?.currentAmount || zero;
            const currentRatio = totalInvestment.isZero()
                ? zero
                : currentAmount.div(totalInvestment).times(DECIMAL_HUNDRED);
            return {
                ...s,
                currentRatio: currentRatio,
                finalBuyAmount: zero,
                buyRatio: zero,
            };
        });

        // 공통 유틸리티 사용: 고정 매수 금액 먼저 할당
        const remainingInvestment = allocateFixedBuyAmounts(
            this.#portfolioData,
            this.#additionalInvestment,
            results
        );

        // 공통 유틸리티 사용: 남은 투자금을 목표 비율에 따라 배분
        distributeRemainingInvestment(
            results,
            totalInvestment,
            remainingInvestment,
            ratioMultiplier
        );

        // 맞춤형 리밸런싱 규칙 적용
        applyRebalancingRules(results, totalInvestment, this.#rebalancingRules);

        // buyRatio 계산
        const totalBuyAmount = results.reduce((sum, s) => sum.plus(s.finalBuyAmount), zero);
        const finalResults = results.map((s) => ({
            ...s,
            buyRatio: totalBuyAmount.isZero()
                ? zero
                : s.finalBuyAmount.div(totalBuyAmount).times(100),
        }));

        if (import.meta.env.DEV && startTime !== undefined) {
            const endTime = performance.now();
            logger.debug(
                `AddRebalanceStrategy for ${this.#portfolioData.length} stocks took ${(endTime - startTime).toFixed(2)} ms`,
                'AddRebalanceStrategy'
            );
        }

        return { results: finalResults };
    }
}

/**
 * @description '간단 계산' 모드 전략 - 목표 비율에 맞춰 추가 투자금 배분 (거래 내역 없이 금액만 입력)
 */
export class SimpleRatioStrategy implements IRebalanceStrategy {
    #portfolioData: CalculatedStock[];
    #additionalInvestment: Decimal;
    #rebalancingRules?: RebalancingRules;

    constructor(
        portfolioData: CalculatedStock[],
        additionalInvestment: Decimal,
        rebalancingRules?: RebalancingRules
    ) {
        this.#portfolioData = portfolioData;
        this.#additionalInvestment = additionalInvestment;
        this.#rebalancingRules = rebalancingRules;
    }

    calculate(): { results: RebalancingResult[] } {
        let startTime: number | undefined;
        if (import.meta.env.DEV) {
            startTime = performance.now();
        }
        const zero = DECIMAL_ZERO;

        // 간단 모드에서는 manualAmount를 사용 (거래 내역 대신 직접 입력한 금액)
        const currentTotal = this.#portfolioData.reduce((sum, s) => {
            const amount =
                s.manualAmount != null
                    ? new Decimal(s.manualAmount)
                    : s.calculated?.currentAmount || zero;
            return sum.plus(amount);
        }, zero);

        const totalInvestment = currentTotal.plus(this.#additionalInvestment);

        // 포트폴리오가 비어있으면 계산 불가
        if (totalInvestment.isZero()) {
            if (import.meta.env.DEV && startTime !== undefined) {
                const endTime = performance.now();
                logger.debug(
                    `SimpleRatioStrategy (Aborted: Zero total) took ${(endTime - startTime).toFixed(2)} ms`,
                    'SimpleRatioStrategy'
                );
            }
            return { results: [] };
        }

        // 공통 유틸리티 사용: 목표 비율 계산
        const totalRatio = calculateTotalRatio(this.#portfolioData);
        const ratioMultiplier = calculateRatioMultiplier(totalRatio);

        // 초기 결과 배열 생성 (간단 모드는 manualAmount 사용)
        const results = this.#portfolioData.map((s) => {
            const currentAmount =
                s.manualAmount != null
                    ? new Decimal(s.manualAmount)
                    : s.calculated?.currentAmount || zero;
            const currentRatio = currentTotal.isZero()
                ? zero
                : currentAmount.div(currentTotal).times(DECIMAL_HUNDRED);

            return {
                ...s,
                currentRatio: currentRatio,
                finalBuyAmount: zero,
                buyRatio: zero,
                calculated: {
                    ...s.calculated,
                    currentAmount: currentAmount,
                },
            };
        });

        // 공통 유틸리티 사용: 고정 매수 금액 먼저 할당
        const remainingInvestment = allocateFixedBuyAmounts(
            this.#portfolioData,
            this.#additionalInvestment,
            results
        );

        // 공통 유틸리티 사용: 남은 투자금을 목표 비율에 따라 배분
        distributeRemainingInvestment(
            results,
            totalInvestment,
            remainingInvestment,
            ratioMultiplier
        );

        // 맞춤형 리밸런싱 규칙 적용
        applyRebalancingRules(results, totalInvestment, this.#rebalancingRules);

        // buyRatio 계산
        const totalBuyAmount = results.reduce((sum, s) => sum.plus(s.finalBuyAmount), zero);
        const finalResults = results.map((s) => ({
            ...s,
            buyRatio: totalBuyAmount.isZero()
                ? zero
                : s.finalBuyAmount.div(totalBuyAmount).times(DECIMAL_HUNDRED),
        }));

        if (import.meta.env.DEV && startTime !== undefined) {
            const endTime = performance.now();
            logger.debug(
                `SimpleRatioStrategy for ${this.#portfolioData.length} stocks took ${(endTime - startTime).toFixed(2)} ms`,
                'SimpleRatioStrategy'
            );
        }

        return { results: finalResults };
    }
}

/**
 * @description '매도 리밸런싱' 모드 계산 전략
 */
export class SellRebalanceStrategy implements IRebalanceStrategy {
    #portfolioData: CalculatedStock[];

    constructor(portfolioData: CalculatedStock[]) {
        this.#portfolioData = portfolioData;
    }

    calculate(): { results: RebalancingResult[] } {
        const startTime = performance.now();
        const zero = DECIMAL_ZERO;

        const currentTotal = this.#portfolioData.reduce(
            (sum, s) => sum.plus(s.calculated?.currentAmount || zero),
            zero
        );

        // 공통 유틸리티 사용: 목표 비율 계산
        const totalRatio = calculateTotalRatio(this.#portfolioData);

        if (currentTotal.isZero() || totalRatio.isZero()) {
            if (import.meta.env.DEV) {
                const endTime = performance.now();
                logger.debug(
                    `SellRebalanceStrategy (Aborted: Zero total) took ${(endTime - startTime).toFixed(2)} ms`,
                    'SellRebalanceStrategy'
                );
            }
            return { results: [] };
        }

        // 공통 유틸리티 사용: 비율 정규화 계수
        const ratioMultiplier = calculateRatioMultiplier(totalRatio);

        const results = this.#portfolioData.map((s) => {
            const currentAmount = s.calculated?.currentAmount || zero;
            const currentRatioDec = currentAmount.div(currentTotal).times(DECIMAL_HUNDRED);
            const currentRatio = currentRatioDec.toNumber();

            const targetRatioNormalized = new Decimal(s.targetRatio || 0).times(ratioMultiplier);
            const targetAmount = currentTotal.times(targetRatioNormalized.div(DECIMAL_HUNDRED));
            const adjustment = currentAmount.minus(targetAmount);

            return {
                ...s,
                currentRatio: currentRatio,
                targetRatioNum: targetRatioNormalized.toNumber(),
                adjustment: adjustment,
            };
        });

        if (import.meta.env.DEV) {
            const endTime = performance.now();
            logger.debug(
                `SellRebalanceStrategy for ${this.#portfolioData.length} stocks took ${(endTime - startTime).toFixed(2)} ms`,
                'SellRebalanceStrategy'
            );
        }

        return { results };
    }
}
