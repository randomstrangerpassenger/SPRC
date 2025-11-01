// js/calculationStrategies.js (버그 수정)
// @ts-check
import Decimal from 'decimal.js';

/**
 * @typedef {import('./types.js').CalculatedStock} CalculatedStock
 * @typedef {import('decimal.js').Decimal} Decimal
 */

/**
 * @description 모든 리밸런싱 전략이 따라야 하는 인터페이스(개념)
 * @interface
 */
class IRebalanceStrategy {
    /**
     * @returns {{results: any[]}} 계산 결과
     */
    calculate() {
        throw new Error("calculate() must be implemented by subclass.");
    }
}

/**
 * @description '추가 매수' 모드 계산 전략
 * @implements {IRebalanceStrategy}
 */
export class AddRebalanceStrategy extends IRebalanceStrategy {
    /** @type {CalculatedStock[]} */
    #portfolioData;
    /** @type {Decimal} */
    #additionalInvestment;

    /**
     * @param {CalculatedStock[]} portfolioData
     * @param {Decimal} additionalInvestment
     */
    constructor(portfolioData, additionalInvestment) {
        super();
        this.#portfolioData = portfolioData;
        this.#additionalInvestment = additionalInvestment;
    }

    calculate() {
        const startTime = performance.now();
        
        const totalInvestment = this.#portfolioData.reduce((sum, s) => sum.plus(s.calculated?.currentAmount || new Decimal(0)), new Decimal(0)).plus(this.#additionalInvestment);
        const results = [];
        
        // ▼▼▼ [수정] totalRatio 계산 시 .plus 및 new Decimal(0) 사용 ▼▼▼
        let totalRatio = this.#portfolioData.reduce(
            (sum, s) => sum.plus(s.targetRatio || 0), 
            new Decimal(0)
        );
        // ▲▲▲ [수정] ▲▲▲
        
        let totalFixedBuy = new Decimal(0);
        for (const s of this.#portfolioData) {
            // (참고: s.targetRatio는 이미 Decimal 객체)
            if (s.isFixedBuyEnabled) {
                totalFixedBuy = totalFixedBuy.plus(s.fixedBuyAmount || 0);
            }
        }
        
        let remainingInvestment = this.#additionalInvestment;
        const zero = new Decimal(0);
        
        for (const s of this.#portfolioData) {
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
            const currentAmount = s.calculated?.currentAmount || zero;
            const currentRatio = totalInvestment.isZero() ? zero : currentAmount.div(totalInvestment).times(100);
            results.push({ ...s, currentRatio: currentRatio, finalBuyAmount: buyAmount, buyRatio: zero });
        }
        
        const ratioMultiplier = totalRatio.isZero() ? zero : new Decimal(100).div(totalRatio);
        const targetAmounts = results.map(s => {
            // ▼▼▼ [수정] s.targetRatio가 이미 Decimal이므로 new Decimal() 제거 ▼▼▼
            const targetRatioNormalized = (s.targetRatio || new Decimal(0)).times(ratioMultiplier);
            // ▲▲▲ [수정] ▲▲▲
            return {
                id: s.id,
                targetAmount: totalInvestment.times(targetRatioNormalized.div(100)),
                currentAmount: s.calculated?.currentAmount || zero,
                adjustmentAmount: zero
            };
        });
        
        const adjustmentTargets = targetAmounts.map(t => {
            const currentTotalBeforeRatioAlloc = t.currentAmount.plus(results.find(s => s.id === t.id)?.finalBuyAmount || zero);
            const deficit = t.targetAmount.minus(currentTotalBeforeRatioAlloc);
            return { ...t, deficit: deficit.greaterThan(zero) ? deficit : zero };
        }).filter(t => t.deficit.greaterThan(zero));

        const totalDeficit = adjustmentTargets.reduce((sum, t) => sum.plus(t.deficit), zero);
        
        if (remainingInvestment.greaterThan(zero) && totalDeficit.greaterThan(zero)) {
            for (const target of adjustmentTargets) {
                const ratio = target.deficit.div(totalDeficit);
                const allocatedAmount = remainingInvestment.times(ratio);
                const resultItem = results.find(r => r.id === target.id);
                if (resultItem) {
                    resultItem.finalBuyAmount = resultItem.finalBuyAmount.plus(allocatedAmount);
                }
            }
        }

        const totalBuyAmount = results.reduce((sum, s) => sum.plus(s.finalBuyAmount), zero);
        const finalResults = results.map(s => ({
            ...s,
            buyRatio: totalBuyAmount.isZero() ? zero : s.finalBuyAmount.div(totalBuyAmount).times(100),
        }));
        
        const endTime = performance.now();
        console.log(`[Perf] AddRebalanceStrategy for ${this.#portfolioData.length} stocks took ${(endTime - startTime).toFixed(2)} ms`);

        return { results: finalResults };
    }
}

/**
 * @description '간단 계산' 모드 전략 - 현재 비율을 유지하면서 추가 투자금 배분
 * @implements {IRebalanceStrategy}
 */
export class SimpleRatioStrategy extends IRebalanceStrategy {
    /** @type {CalculatedStock[]} */
    #portfolioData;
    /** @type {Decimal} */
    #additionalInvestment;

    /**
     * @param {CalculatedStock[]} portfolioData
     * @param {Decimal} additionalInvestment
     */
    constructor(portfolioData, additionalInvestment) {
        super();
        this.#portfolioData = portfolioData;
        this.#additionalInvestment = additionalInvestment;
    }

    calculate() {
        const startTime = performance.now();

        const zero = new Decimal(0);

        // 현재 포트폴리오 총액 계산
        const currentTotal = this.#portfolioData.reduce(
            (sum, s) => sum.plus(s.calculated?.currentAmount || zero),
            zero
        );

        // 포트폴리오가 비어있으면 계산 불가
        if (currentTotal.isZero()) {
            const endTime = performance.now();
            console.log(`[Perf] SimpleRatioStrategy (Aborted: Zero total) took ${(endTime - startTime).toFixed(2)} ms`);
            return { results: [] };
        }

        const results = [];

        // 각 종목의 현재 비율에 따라 추가 투자금 배분
        for (const s of this.#portfolioData) {
            const currentAmount = s.calculated?.currentAmount || zero;
            const currentRatio = currentAmount.div(currentTotal).times(100);

            // 현재 비율만큼 추가 투자금 배분
            const buyAmount = this.#additionalInvestment.times(currentAmount).div(currentTotal);

            results.push({
                ...s,
                currentRatio: currentRatio,
                finalBuyAmount: buyAmount,
                buyRatio: this.#additionalInvestment.isZero()
                    ? zero
                    : buyAmount.div(this.#additionalInvestment).times(100)
            });
        }

        const endTime = performance.now();
        console.log(`[Perf] SimpleRatioStrategy for ${this.#portfolioData.length} stocks took ${(endTime - startTime).toFixed(2)} ms`);

        return { results };
    }
}

/**
 * @description '매도 리밸런싱' 모드 계산 전략
 * @implements {IRebalanceStrategy}
 */
export class SellRebalanceStrategy extends IRebalanceStrategy {
    /** @type {CalculatedStock[]} */
    #portfolioData;

    /**
     * @param {CalculatedStock[]} portfolioData
     */
    constructor(portfolioData) {
        super();
        this.#portfolioData = portfolioData;
    }

    calculate() {
        const startTime = performance.now();

        const currentTotal = this.#portfolioData.reduce((sum, s) => sum.plus(s.calculated?.currentAmount || new Decimal(0)), new Decimal(0));

        // ▼▼▼ [수정] totalRatio가 Decimal을 .plus()로 합산하도록 변경 ▼▼▼
        const totalRatio = this.#portfolioData.reduce(
            (sum, s) => sum.plus(s.targetRatio || 0),
            new Decimal(0)
        );
        // ▲▲▲ [수정] ▲▲▲

        const results = [];
        const zero = new Decimal(0);

        if (currentTotal.isZero() || totalRatio.isZero()) { // .isZero() 사용
            const endTime = performance.now();
            console.log(`[Perf] SellRebalanceStrategy (Aborted: Zero total) took ${(endTime - startTime).toFixed(2)} ms`);
            return { results: [] };
        }

        // ▼▼▼ [수정] totalRatio가 이미 Decimal이므로 new Decimal() 제거 ▼▼▼
        const ratioMultiplier = new Decimal(100).div(totalRatio);
        // ▲▲▲ [수정] ▲▲▲

        for (const s of this.#portfolioData) {
            const currentAmount = s.calculated?.currentAmount || zero;
            const currentRatioDec = currentAmount.div(currentTotal).times(100);
            const currentRatio = currentRatioDec.toNumber();

            // ▼▼▼ [수정] s.targetRatio가 이미 Decimal이므로 new Decimal() 제거 ▼▼▼
            const targetRatioNormalized = (s.targetRatio || new Decimal(0)).times(ratioMultiplier);
            // ▲▲▲ [수정] ▲▲▲

            const targetAmount = currentTotal.times(targetRatioNormalized.div(100));
            const adjustment = currentAmount.minus(targetAmount);

            results.push({
                ...s,
                currentRatio: currentRatio,
                targetRatioNum: targetRatioNormalized.toNumber(),
                adjustment: adjustment
            });
        }

        const endTime = performance.now();
        console.log(`[Perf] SellRebalanceStrategy for ${this.#portfolioData.length} stocks took ${(endTime - startTime).toFixed(2)} ms`);

        return { results };
    }
}