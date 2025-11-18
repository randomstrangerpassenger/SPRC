// src/workers/rebalance.worker.ts
/**
 * @description Web Worker for rebalancing calculations
 * - Offloads CPU-intensive rebalancing calculations from main thread
 * - Supports Add, Simple, and Sell rebalancing strategies
 * - Improves UI responsiveness during rebalancing computation
 */

import Decimal from 'decimal.js';
import { DECIMAL_ZERO, DECIMAL_HUNDRED } from '../constants';
import type { CalculatedStock, RebalancingRules } from '../types';

// ==================== Serialized Types ====================

interface SerializedRebalancingResult {
    [key: string]: string | number | boolean | SerializedMetrics | undefined;
    id: string;
    name: string;
    ticker: string;
    sector: string;
    targetRatio: string;
    currentPrice: string;
    currentRatio?: string;
    finalBuyAmount?: string;
    buyRatio?: string;
    adjustment?: string;
    targetRatioNum?: number;
    calculated?: SerializedMetrics;
}

interface SerializedMetrics {
    [key: string]: string | number | boolean;
}

// ==================== Worker Message Types ====================

interface AddRebalanceMessage {
    type: 'calculateAddRebalance';
    data: {
        portfolioData: CalculatedStock[];
        additionalInvestment: string; // Decimal as string
        rebalancingRules?: RebalancingRules;
    };
}

interface SimpleRebalanceMessage {
    type: 'calculateSimpleRebalance';
    data: {
        portfolioData: CalculatedStock[];
        additionalInvestment: string; // Decimal as string
        rebalancingRules?: RebalancingRules;
    };
}

interface SellRebalanceMessage {
    type: 'calculateSellRebalance';
    data: {
        portfolioData: CalculatedStock[];
    };
}

type WorkerMessage = AddRebalanceMessage | SimpleRebalanceMessage | SellRebalanceMessage;

// ==================== Utility Functions ====================

/**
 * @description Calculate total target ratio
 */
function calculateTotalRatio(portfolioData: CalculatedStock[]): Decimal {
    return portfolioData.reduce((sum, s) => sum.plus(s.targetRatio || 0), DECIMAL_ZERO);
}

/**
 * @description Calculate ratio multiplier for normalization
 */
function calculateRatioMultiplier(totalRatio: Decimal): Decimal {
    return totalRatio.isZero() ? DECIMAL_ZERO : DECIMAL_HUNDRED.div(totalRatio);
}

/**
 * @description Allocate fixed buy amounts first
 */
function allocateFixedBuyAmounts(
    portfolioData: CalculatedStock[],
    additionalInvestment: Decimal,
    results: Array<{ id: string; finalBuyAmount: Decimal }>
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
        const resultItem = results.find((r) => r.id === s.id);
        if (resultItem) {
            resultItem.finalBuyAmount = buyAmount;
        }
    }

    return remainingInvestment;
}

/**
 * @description Distribute remaining investment by target ratios
 */
function distributeRemainingInvestment(
    results: Array<{ id: string; targetRatio: Decimal; calculated?: { currentAmount: Decimal }; finalBuyAmount: Decimal }>,
    totalInvestment: Decimal,
    remainingInvestment: Decimal,
    ratioMultiplier: Decimal
): void {
    const zero = DECIMAL_ZERO;

    const targetAmounts = results.map((s) => {
        const targetRatioNormalized = s.targetRatio.times(ratioMultiplier);
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
 * @description Apply custom rebalancing rules
 */
function applyRebalancingRules(
    results: Array<any>,
    totalInvestment: Decimal,
    rules?: RebalancingRules
): void {
    if (!rules || !rules.enabled) {
        return;
    }

    const zero = DECIMAL_ZERO;

    // 1. Band rule
    if (rules.bandPercentage !== undefined && rules.bandPercentage > 0) {
        const bandDec = new Decimal(rules.bandPercentage);
        for (const result of results) {
            const currentAmount = result.calculated?.currentAmount || zero;
            const currentRatio = totalInvestment.isZero()
                ? zero
                : currentAmount.div(totalInvestment).times(DECIMAL_HUNDRED);
            const targetRatio = new Decimal(result.targetRatio || 0);
            const diff = currentRatio.minus(targetRatio).abs();

            if (diff.lessThanOrEqualTo(bandDec)) {
                result.finalBuyAmount = zero;
            }
        }
    }

    // 2. Minimum trade amount rule
    if (rules.minTradeAmount !== undefined && rules.minTradeAmount > 0) {
        const minTradeDec = new Decimal(rules.minTradeAmount);
        for (const result of results) {
            if (result.finalBuyAmount && result.finalBuyAmount.lessThan(minTradeDec)) {
                result.finalBuyAmount = zero;
            }
        }
    }

    // 3. Stock limits
    if (rules.stockLimits && rules.stockLimits.length > 0) {
        for (const limit of rules.stockLimits) {
            const result = results.find((r) => r.id === limit.stockId);
            if (!result) continue;

            if (limit.maxAllocationPercent !== undefined) {
                const currentAmount = result.calculated?.currentAmount || zero;
                const afterBuyAmount = currentAmount.plus(result.finalBuyAmount || zero);
                const afterBuyRatio = totalInvestment.isZero()
                    ? zero
                    : afterBuyAmount.div(totalInvestment).times(DECIMAL_HUNDRED);
                const maxRatio = new Decimal(limit.maxAllocationPercent);

                if (afterBuyRatio.greaterThan(maxRatio)) {
                    const maxAmount = totalInvestment.times(maxRatio.div(DECIMAL_HUNDRED));
                    result.finalBuyAmount = Decimal.max(zero, maxAmount.minus(currentAmount));
                }
            }

            if (limit.minTradeAmount !== undefined) {
                const minTradeDec = new Decimal(limit.minTradeAmount);
                if (result.finalBuyAmount && result.finalBuyAmount.lessThan(minTradeDec)) {
                    result.finalBuyAmount = zero;
                }
            }
        }
    }

    // 4. Sector limits
    if (rules.sectorLimits && rules.sectorLimits.length > 0) {
        for (const limit of rules.sectorLimits) {
            const sectorResults = results.filter((r) => r.sector === limit.sector);
            if (sectorResults.length === 0) continue;

            const sectorAfterBuyTotal = sectorResults.reduce(
                (sum, r) =>
                    sum
                        .plus(r.calculated?.currentAmount || zero)
                        .plus(r.finalBuyAmount || zero),
                zero
            );
            const sectorAfterBuyRatio = totalInvestment.isZero()
                ? zero
                : sectorAfterBuyTotal.div(totalInvestment).times(DECIMAL_HUNDRED);
            const maxRatio = new Decimal(limit.maxAllocationPercent);

            if (sectorAfterBuyRatio.greaterThan(maxRatio)) {
                const maxSectorAmount = totalInvestment.times(maxRatio.div(DECIMAL_HUNDRED));
                const excessAmount = sectorAfterBuyTotal.minus(maxSectorAmount);
                const totalBuyInSector = sectorResults.reduce(
                    (sum, r) => sum.plus(r.finalBuyAmount || zero),
                    zero
                );

                if (totalBuyInSector.greaterThan(zero)) {
                    for (const result of sectorResults) {
                        const ratio = (result.finalBuyAmount || zero).div(totalBuyInSector);
                        const reduction = excessAmount.times(ratio);
                        result.finalBuyAmount = Decimal.max(
                            zero,
                            (result.finalBuyAmount || zero).minus(reduction)
                        );
                    }
                }
            }
        }
    }
}

/**
 * @description Serialize result for postMessage
 */
function serializeResult(result: Record<string, any>): SerializedRebalancingResult {
    const serialized: Record<string, any> = {};
    for (const key in result) {
        const value = result[key];
        if (value instanceof Decimal) {
            serialized[key] = value.toString();
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Nested object (like calculated)
            serialized[key] = serializeMetrics(value);
        } else {
            serialized[key] = value;
        }
    }
    return serialized as SerializedRebalancingResult;
}

function serializeMetrics(metrics: Record<string, any>): SerializedMetrics {
    const serialized: Record<string, any> = {};
    for (const key in metrics) {
        const value = metrics[key];
        serialized[key] = value instanceof Decimal ? value.toString() : value;
    }
    return serialized;
}

// ==================== Strategy Implementations ====================

/**
 * @description Add Rebalance Strategy (추가 매수 모드)
 */
function calculateAddRebalance(
    portfolioData: CalculatedStock[],
    additionalInvestment: Decimal,
    rebalancingRules?: RebalancingRules
): SerializedRebalancingResult[] {
    const zero = DECIMAL_ZERO;

    const currentTotal = portfolioData.reduce(
        (sum, s) => sum.plus(s.calculated?.currentAmount || zero),
        zero
    );
    const totalInvestment = currentTotal.plus(additionalInvestment);

    const totalRatio = calculateTotalRatio(portfolioData);
    const ratioMultiplier = calculateRatioMultiplier(totalRatio);

    const results = portfolioData.map((s) => {
        const currentAmount = s.calculated?.currentAmount || zero;
        const currentRatio = totalInvestment.isZero()
            ? zero
            : currentAmount.div(totalInvestment).times(DECIMAL_HUNDRED);
        return {
            ...s,
            targetRatio: new Decimal(s.targetRatio || 0),
            currentRatio: currentRatio,
            finalBuyAmount: zero,
            buyRatio: zero,
            calculated: s.calculated ? { ...s.calculated, currentAmount: s.calculated.currentAmount } : undefined,
        };
    });

    const remainingInvestment = allocateFixedBuyAmounts(
        portfolioData,
        additionalInvestment,
        results
    );

    distributeRemainingInvestment(
        results,
        totalInvestment,
        remainingInvestment,
        ratioMultiplier
    );

    // Apply rebalancing rules
    applyRebalancingRules(results, totalInvestment, rebalancingRules);

    const totalBuyAmount = results.reduce((sum, s) => sum.plus(s.finalBuyAmount), zero);
    const finalResults = results.map((s) => ({
        ...s,
        buyRatio: totalBuyAmount.isZero()
            ? zero
            : s.finalBuyAmount.div(totalBuyAmount).times(100),
    }));

    return finalResults.map(serializeResult);
}

/**
 * @description Simple Rebalance Strategy (간단 계산 모드)
 */
function calculateSimpleRebalance(
    portfolioData: CalculatedStock[],
    additionalInvestment: Decimal,
    rebalancingRules?: RebalancingRules
): SerializedRebalancingResult[] {
    const zero = DECIMAL_ZERO;

    const currentTotal = portfolioData.reduce((sum, s) => {
        const amount =
            s.manualAmount != null
                ? new Decimal(s.manualAmount)
                : s.calculated?.currentAmount || zero;
        return sum.plus(amount);
    }, zero);

    const totalInvestment = currentTotal.plus(additionalInvestment);

    if (totalInvestment.isZero()) {
        return [];
    }

    const totalRatio = calculateTotalRatio(portfolioData);
    const ratioMultiplier = calculateRatioMultiplier(totalRatio);

    const results = portfolioData.map((s) => {
        const currentAmount =
            s.manualAmount != null
                ? new Decimal(s.manualAmount)
                : s.calculated?.currentAmount || zero;
        const currentRatio = currentTotal.isZero()
            ? zero
            : currentAmount.div(currentTotal).times(DECIMAL_HUNDRED);

        return {
            ...s,
            targetRatio: new Decimal(s.targetRatio || 0),
            currentRatio: currentRatio,
            finalBuyAmount: zero,
            buyRatio: zero,
            calculated: {
                ...(s.calculated || {}),
                currentAmount: currentAmount,
            },
        };
    });

    const remainingInvestment = allocateFixedBuyAmounts(
        portfolioData,
        additionalInvestment,
        results
    );

    distributeRemainingInvestment(
        results,
        totalInvestment,
        remainingInvestment,
        ratioMultiplier
    );

    // Apply rebalancing rules
    applyRebalancingRules(results, totalInvestment, rebalancingRules);

    const totalBuyAmount = results.reduce((sum, s) => sum.plus(s.finalBuyAmount), zero);
    const finalResults = results.map((s) => ({
        ...s,
        buyRatio: totalBuyAmount.isZero()
            ? zero
            : s.finalBuyAmount.div(totalBuyAmount).times(DECIMAL_HUNDRED),
    }));

    return finalResults.map(serializeResult);
}

/**
 * @description Sell Rebalance Strategy (매도 리밸런싱 모드)
 */
function calculateSellRebalance(
    portfolioData: CalculatedStock[]
): SerializedRebalancingResult[] {
    const zero = DECIMAL_ZERO;

    const currentTotal = portfolioData.reduce(
        (sum, s) => sum.plus(s.calculated?.currentAmount || zero),
        zero
    );

    const totalRatio = calculateTotalRatio(portfolioData);

    if (currentTotal.isZero() || totalRatio.isZero()) {
        return [];
    }

    const ratioMultiplier = calculateRatioMultiplier(totalRatio);

    const results = portfolioData.map((s) => {
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

    return results.map(serializeResult);
}

// ==================== Worker Message Handler ====================

self.onmessage = (event: MessageEvent<WorkerMessage & { requestId?: string }>) => {
    const { type, data, requestId } = event.data;

    try {
        let result: SerializedRebalancingResult[];

        switch (type) {
            case 'calculateAddRebalance':
                result = calculateAddRebalance(
                    data.portfolioData,
                    new Decimal(data.additionalInvestment),
                    data.rebalancingRules
                );
                self.postMessage({ type, result, requestId });
                break;

            case 'calculateSimpleRebalance':
                result = calculateSimpleRebalance(
                    data.portfolioData,
                    new Decimal(data.additionalInvestment),
                    data.rebalancingRules
                );
                self.postMessage({ type, result, requestId });
                break;

            case 'calculateSellRebalance':
                result = calculateSellRebalance(data.portfolioData);
                self.postMessage({ type, result, requestId });
                break;

            default:
                console.warn('Worker: Unknown message type', type);
        }
    } catch (error) {
        self.postMessage({
            type: 'error',
            error: error instanceof Error ? error.message : String(error),
            requestId,
        });
    }
};

// Export for TypeScript
export {};
