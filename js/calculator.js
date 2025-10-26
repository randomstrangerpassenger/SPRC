// @ts-check
import Decimal from 'decimal.js'; // 동기 임포트로 복구
import { CONFIG } from './constants.js';
import { ErrorService } from './errorService.js';

/** @typedef {import('./types.js').Stock} Stock */
/** @typedef {import('./types.js').Transaction} Transaction */
/** @typedef {import('./types.js').CalculatedStock} CalculatedStock */

/**
 * @description 주식 ID와 현재 가격의 조합을 기반으로 캐시 키를 생성합니다.
 * 이 키는 calculateStockMetrics의 입력이 변경되지 않았는지 확인하는 데 사용됩니다.
 * @param {Stock} stock - 주식 객체
 * @returns {string} 캐시 키
 */
function _generateStockKey(stock) {
    // transactions는 state.js에서 정렬되어 관리되므로, 단순히 배열의 길이와 마지막 거래 정보를 포함
    const lastTx = stock.transactions[stock.transactions.length - 1];
    const txSignature = lastTx ? `${lastTx.type}-${lastTx.quantity.toString()}-${lastTx.price.toString()}` : 'none';
    
    // 섹터 정보도 계산에 영향을 주지 않으므로 제외
    return `${stock.id}:${stock.currentPrice}:${stock.transactions.length}:${txSignature}`;
}

/**
 * @description 포트폴리오 전체를 위한 캐시 키를 생성합니다.
 * @param {Stock[]} portfolioData - 포트폴리오 데이터
 * @returns {string} 캐시 키
 */
function _generatePortfolioKey(portfolioData) {
    return portfolioData.map(_generateStockKey).join('|');
}

/**
 * @typedef {object} PortfolioCalculationResult
 * @property {CalculatedStock[]} portfolioData - 계산된 주식 데이터 배열
 * @property {Decimal} currentTotal - 현재 총 자산 가치
 * @property {string} cacheKey - 사용된 캐시 키
 */

/**
 * @typedef {object} CalculatorCache
 * @property {string} key - 캐시 키
 * @property {PortfolioCalculationResult} result - 계산 결과
 */

export const Calculator = {
    /** @type {CalculatorCache | null} */
    #cache: null,

    /**
     * @description 단일 주식의 매입 단가, 현재 가치, 손익 등을 계산합니다.
     * @param {Stock} stock - 계산할 주식 객체
     * @returns {CalculatedStock['calculated']} 계산 결과 객체
     */
    calculateStockMetrics(stock) {
        try {
            const result = {
                totalBuyQuantity: new Decimal(0),
                totalSellQuantity: new Decimal(0),
                netQuantity: new Decimal(0),
                totalBuyAmount: new Decimal(0),
                currentAmount: new Decimal(0),
                currentAmountUSD: new Decimal(0),
                currentAmountKRW: new Decimal(0),
                avgBuyPrice: new Decimal(0),
                profitLoss: new Decimal(0),
                profitLossRate: new Decimal(0),
            };

            const currentPrice = new Decimal(stock.currentPrice || 0);

            // 1. 매수/매도 수량 및 금액 합산
            for (const tx of stock.transactions) {
                if (tx.type === 'buy') {
                    result.totalBuyQuantity = result.totalBuyQuantity.plus(tx.quantity);
                    result.totalBuyAmount = result.totalBuyAmount.plus(tx.quantity.times(tx.price));
                } else if (tx.type === 'sell') {
                    result.totalSellQuantity = result.totalSellQuantity.plus(tx.quantity);
                }
            }

            // 2. 순 보유 수량
            result.netQuantity = result.totalBuyQuantity.minus(result.totalSellQuantity);

            // 3. 평균 매입 단가 (totalBuyAmount / totalBuyQuantity)
            if (result.totalBuyQuantity.greaterThan(0)) {
                result.avgBuyPrice = result.totalBuyAmount.div(result.totalBuyQuantity);
            }

            // 4. 현재 가치 (netQuantity * currentPrice)
            result.currentAmount = result.netQuantity.times(currentPrice);

            // 5. 손익 계산 (currentAmount - (netQuantity * avgBuyPrice))
            const originalCostOfHolding = result.netQuantity.times(result.avgBuyPrice);
            result.profitLoss = result.currentAmount.minus(originalCostOfHolding);

            // 6. 손익률
            if (originalCostOfHolding.isZero()) {
                result.profitLossRate = new Decimal(0);
            } else {
                result.profitLossRate = result.profitLoss.div(originalCostOfHolding).times(100);
            }

            return result;

        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), 'calculateStockMetrics');
            // 에러 발생 시 기본값 반환
            return {
                totalBuyQuantity: new Decimal(0), totalSellQuantity: new Decimal(0), netQuantity: new Decimal(0),
                totalBuyAmount: new Decimal(0), currentAmount: new Decimal(0), currentAmountUSD: new Decimal(0), currentAmountKRW: new Decimal(0),
                avgBuyPrice: new Decimal(0), profitLoss: new Decimal(0), profitLossRate: new Decimal(0),
            };
        }
    },

    /**
     * @description 포트폴리오 상태를 계산하고 캐싱합니다.
     * @param {{ portfolioData: Stock[], exchangeRate: number, currentCurrency: 'KRW' | 'USD' }} options - 포트폴리오 데이터 및 환율/통화
     * @returns {PortfolioCalculationResult}
     */
    calculatePortfolioState({ portfolioData, exchangeRate = CONFIG.DEFAULT_EXCHANGE_RATE, currentCurrency = 'KRW' }) {
        const cacheKey = _generatePortfolioKey(portfolioData);

        if (this.#cache && this.#cache.key === cacheKey) {
            return this.#cache.result;
        }

        const exchangeRateDec = new Decimal(exchangeRate);
        let currentTotal = new Decimal(0);

        /** @type {CalculatedStock[]} */
        const calculatedPortfolioData = portfolioData.map(stock => {
            const calculatedMetrics = this.calculateStockMetrics(stock);
            
            // 현재가치를 KRW와 USD로 변환
            if (currentCurrency === 'KRW') {
                calculatedMetrics.currentAmountKRW = calculatedMetrics.currentAmount;
                calculatedMetrics.currentAmountUSD = calculatedMetrics.currentAmount.div(exchangeRateDec);
            } else { // USD
                calculatedMetrics.currentAmountUSD = calculatedMetrics.currentAmount;
                calculatedMetrics.currentAmountKRW = calculatedMetrics.currentAmount.times(exchangeRateDec);
            }

            // Calculate total based on the selected currency
            currentTotal = currentTotal.plus(calculatedMetrics.currentAmount);

            return { ...stock, calculated: calculatedMetrics };
        });

        /** @type {PortfolioCalculationResult} */
        const result = {
            portfolioData: calculatedPortfolioData,
            currentTotal: currentTotal,
            cacheKey: cacheKey
        };
        
        // 캐시 업데이트
        this.#cache = { key: cacheKey, result: result };

        return result;
    },

    /**
     * @description '추가 매수' 모드의 리밸런싱을 계산합니다.
     * @param {{ portfolioData: CalculatedStock[], additionalInvestment: Decimal }} options - 계산된 데이터, 추가 투자금 (현재 통화 기준)
     * @returns {{ results: (CalculatedStock & { currentRatio: Decimal, finalBuyAmount: Decimal, buyRatio: Decimal })[] }}
     */
    calculateAddRebalancing({ portfolioData, additionalInvestment }) {
        const totalInvestment = portfolioData.reduce((sum, s) => sum.plus(s.calculated?.currentAmount || new Decimal(0)), new Decimal(0)).plus(additionalInvestment);
        const results = [];

        // 1. 목표 비율 합계 및 고정 매수 금액 합계 계산
        let totalRatio = new Decimal(0);
        let totalFixedBuy = new Decimal(0);
        for (const s of portfolioData) {
            totalRatio = totalRatio.plus(s.targetRatio || 0);
            if (s.isFixedBuyEnabled) {
                totalFixedBuy = totalFixedBuy.plus(s.fixedBuyAmount || 0);
            }
        }
        
        let remainingInvestment = additionalInvestment;
        
        // 2. 고정 매수 금액 먼저 처리 (남은 금액 업데이트)
        /** @type {Decimal} */
        const zero = new Decimal(0);
        
        for (const s of portfolioData) {
            /** @type {Decimal} */
            let buyAmount = zero;

            if (s.isFixedBuyEnabled) {
                const fixedAmountDec = new Decimal(s.fixedBuyAmount || 0);
                // 추가 투자금이 충분할 때만 고정 매수 처리
                if (remainingInvestment.greaterThanOrEqualTo(fixedAmountDec)) {
                    buyAmount = fixedAmountDec;
                    remainingInvestment = remainingInvestment.minus(fixedAmountDec);
                } else {
                    // 고정 매수 처리 불가능 (Validator에서 이미 체크됨)
                    buyAmount = remainingInvestment;
                    remainingInvestment = zero;
                }
            }

            const currentAmount = s.calculated?.currentAmount || zero;
            const currentRatio = totalInvestment.isZero() ? zero : currentAmount.div(totalInvestment).times(100);

            // 초기 결과 객체 생성
            results.push({
                ...s,
                currentRatio: currentRatio,
                finalBuyAmount: buyAmount,
                buyRatio: zero // 임시
            });
        }
        
        // 3. 목표 비율 기반 추가 배분
        const ratioMultiplier = totalRatio.isZero() ? zero : new Decimal(100).div(totalRatio);

        // 목표 금액 계산
        const targetAmounts = results.map(s => {
            const targetRatioNormalized = new Decimal(s.targetRatio || 0).times(ratioMultiplier);
            return {
                id: s.id,
                targetAmount: totalInvestment.times(targetRatioNormalized.div(100)),
                currentAmount: s.calculated?.currentAmount || zero,
                adjustmentAmount: zero // 임시
            };
        });
        
        // 4. 리밸런싱 부족분 계산
        const adjustmentTargets = targetAmounts.map(t => {
            const currentTotalBeforeRatioAlloc = t.currentAmount.plus(results.find(s => s.id === t.id)?.finalBuyAmount || zero);
            const deficit = t.targetAmount.minus(currentTotalBeforeRatioAlloc);
            return {
                ...t,
                deficit: deficit.greaterThan(zero) ? deficit : zero,
            };
        }).filter(t => t.deficit.greaterThan(zero)); // 부족분 있는 종목만

        const totalDeficit = adjustmentTargets.reduce((sum, t) => sum.plus(t.deficit), zero);
        
        // 5. 남은 투자금 배분 (Deficit 비율에 따라)
        if (remainingInvestment.greaterThan(zero) && totalDeficit.greaterThan(zero)) {
            for (const target of adjustmentTargets) {
                const ratio = target.deficit.div(totalDeficit);
                const allocatedAmount = remainingInvestment.times(ratio);
                
                // 최종 매수 금액 업데이트
                const resultItem = results.find(r => r.id === target.id);
                if (resultItem) {
                    resultItem.finalBuyAmount = resultItem.finalBuyAmount.plus(allocatedAmount);
                }
            }
        }

        // 6. 최종 비율 계산 (buyRatio)
        const totalBuyAmount = results.reduce((sum, s) => sum.plus(s.finalBuyAmount), zero);

        const finalResults = results.map(s => {
            const buyRatio = totalBuyAmount.isZero() ? zero : s.finalBuyAmount.div(totalBuyAmount).times(100);
            return {
                ...s,
                buyRatio: buyRatio,
            };
        });

        return { results: finalResults };
    },

    /**
     * @description '매도 리밸런싱' 모드의 조정을 계산합니다. (현금 유입/유출은 없음)
     * @param {{ portfolioData: CalculatedStock[] }} options - 계산된 데이터
     * @returns {{ results: (CalculatedStock & { currentRatio: number, targetRatioNum: number, adjustment: Decimal })[] }}
     */
    calculateSellRebalancing({ portfolioData }) {
        const currentTotal = portfolioData.reduce((sum, s) => sum.plus(s.calculated?.currentAmount || new Decimal(0)), new Decimal(0));
        const totalRatio = portfolioData.reduce((sum, s) => sum + (s.targetRatio || 0), 0);
        const results = [];
        const zero = new Decimal(0);

        if (currentTotal.isZero() || totalRatio === 0) {
            return { results: [] };
        }
        
        // 정규화된 목표 비율 승수
        const ratioMultiplier = new Decimal(100).div(totalRatio);

        for (const s of portfolioData) {
            const currentAmount = s.calculated?.currentAmount || zero;
            
            // 현재 비율 계산
            const currentRatioDec = currentAmount.div(currentTotal).times(100);
            const currentRatio = currentRatioDec.toNumber();

            // 목표 비율 계산 (정규화된 목표 비율 사용)
            const targetRatioNum = s.targetRatio || 0;
            const targetRatioNormalized = new Decimal(targetRatioNum).times(ratioMultiplier);

            // 목표 금액 계산
            const targetAmount = currentTotal.times(targetRatioNormalized.div(100));

            // 조정 금액 (매도: 양수, 매수: 음수)
            // currentAmount - targetAmount
            const adjustment = currentAmount.minus(targetAmount);

            results.push({
                ...s,
                currentRatio: currentRatio,
                targetRatioNum: targetRatioNormalized.toNumber(), // 정규화된 비율
                adjustment: adjustment
            });
        }

        return { results };
    },

    /**
     * @description 포트폴리오의 섹터별 금액 및 비율을 계산합니다.
     * @param {CalculatedStock[]} portfolioData - 계산된 주식 데이터
     * @returns {{ sector: string, amount: Decimal, percentage: Decimal }[]} 섹터 분석 결과
     */
    calculateSectorAnalysis(portfolioData) {
        /** @type {Map<string, Decimal>} */
        const sectorMap = new Map();
        let currentTotal = new Decimal(0);

        for (const s of portfolioData) {
            const sector = s.sector || 'Unclassified';
            const amount = s.calculated?.currentAmount || new Decimal(0);
            currentTotal = currentTotal.plus(amount);

            const currentSectorAmount = sectorMap.get(sector) || new Decimal(0);
            sectorMap.set(sector, currentSectorAmount.plus(amount));
        }

        /** @type {{ sector: string, amount: Decimal, percentage: Decimal }[]} */
        const result = [];
        for (const [sector, amount] of sectorMap.entries()) {
            const percentage = currentTotal.isZero() ? new Decimal(0) : amount.div(currentTotal).times(100);
            result.push({ sector, amount, percentage });
        }

        // 금액 내림차순 정렬
        result.sort((a, b) => b.amount.comparedTo(a.amount));

        return result;
    },

    /**
     * @description 포트폴리오 계산 캐시를 초기화합니다.
     */
    clearPortfolioStateCache() {
        this.#cache = null;
    }
};