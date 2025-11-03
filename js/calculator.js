// js/calculator.js (Strategy Pattern Applied)
// @ts-check
import Decimal from 'decimal.js'; 
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

export class Calculator { 
    /** @type {CalculatorCache | null} */
    static #cache = null; 

    /**
     * @description 단일 주식의 매입 단가, 현재 가치, 손익 등을 계산합니다.
     * @param {Stock} stock - 계산할 주식 객체
     * @returns {CalculatedStock['calculated']} 계산 결과 객체
     */
    static calculateStockMetrics(stock) { 
        // --- ⬇️ Performance Monitoring ⬇️ ---
        const startTime = performance.now();
        // --- ⬆️ Performance Monitoring ⬆️ ---
        try {
            const result = {
                totalBuyQuantity: new Decimal(0),
                totalSellQuantity: new Decimal(0),
                quantity: new Decimal(0),
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
                // [수정] state.js에서 이미 Decimal 객체로 변환했을 수 있으나,
                // calculateStockMetrics는 순수 함수이므로 number도 처리
                const txQuantity = new Decimal(tx.quantity || 0);
                const txPrice = new Decimal(tx.price || 0);

                if (tx.type === 'buy') {
                    result.totalBuyQuantity = result.totalBuyQuantity.plus(txQuantity);
                    result.totalBuyAmount = result.totalBuyAmount.plus(txQuantity.times(txPrice));
                } else if (tx.type === 'sell') {
                    result.totalSellQuantity = result.totalSellQuantity.plus(txQuantity);
                }
            }

            // 2. 순 보유 수량
            result.quantity = Decimal.max(0, result.totalBuyQuantity.minus(result.totalSellQuantity)); 

            // 3. 평균 매입 단가 (totalBuyAmount / totalBuyQuantity)
            if (result.totalBuyQuantity.greaterThan(0)) {
                result.avgBuyPrice = result.totalBuyAmount.div(result.totalBuyQuantity);
            }

            // 4. 현재 가치 (quantity * currentPrice)
            result.currentAmount = result.quantity.times(currentPrice);

            // 5. 손익 계산 (currentAmount - (quantity * avgBuyPrice))
            const originalCostOfHolding = result.quantity.times(result.avgBuyPrice);
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
                totalBuyQuantity: new Decimal(0), totalSellQuantity: new Decimal(0), quantity: new Decimal(0),
                totalBuyAmount: new Decimal(0), currentAmount: new Decimal(0), currentAmountUSD: new Decimal(0), currentAmountKRW: new Decimal(0),
                avgBuyPrice: new Decimal(0), profitLoss: new Decimal(0), profitLossRate: new Decimal(0),
            };
        } finally {

        }
    }

    /**
     * @description 포트폴리오 상태를 계산하고 캐싱합니다.
     * @param {{ portfolioData: Stock[], exchangeRate: number, currentCurrency: 'krw' | 'usd' }} options - 포트폴리오 데이터 및 환율/통화
     * @returns {PortfolioCalculationResult}
     */
    static calculatePortfolioState({ portfolioData, exchangeRate = CONFIG.DEFAULT_EXCHANGE_RATE, currentCurrency = 'krw' }) {
        // --- ⬇️ Performance Monitoring ⬇️ ---
        const startTime = performance.now();
        // --- ⬆️ Performance Monitoring ⬆️ ---

        const cacheKey = _generatePortfolioKey(portfolioData);

        if (Calculator.#cache && Calculator.#cache.key === cacheKey) {

            return Calculator.#cache.result;
        }

        const exchangeRateDec = new Decimal(exchangeRate);
        let currentTotal = new Decimal(0);

        /** @type {CalculatedStock[]} */
        const calculatedPortfolioData = portfolioData.map(stock => {
            const calculatedMetrics = Calculator.calculateStockMetrics(stock); // This will log its own performance

            // 현재가치를 KRW와 USD로 변환
            if (currentCurrency === 'krw') {
                calculatedMetrics.currentAmountKRW = calculatedMetrics.currentAmount;
                calculatedMetrics.currentAmountUSD = calculatedMetrics.currentAmount.div(exchangeRateDec);
            } else { // usd
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
        Calculator.#cache = { key: cacheKey, result: result }; 



        return result;
    }
    
    // ▼▼▼▼▼ [신규] 전략 실행기 ▼▼▼▼▼
    /**
     * @description '전략' 객체를 받아 리밸런싱 계산을 실행합니다.
     * @param {import('./calculationStrategies.js').IRebalanceStrategy} strategy - 실행할 계산 전략 (Add or Sell)
     * @returns {{ results: any[] }} 계산 결과
     */
    static calculateRebalancing(strategy) {
        // Calculator는 더 이상 'add'인지 'sell'인지 알 필요가 없습니다.
        // 단순히 전략의 calculate 메서드를 호출합니다.
        return strategy.calculate();
    }
    // ▲▲▲▲▲ [신규] ▲▲▲▲▲
    

    // ▼▼▼▼▼ [삭제] calculateAddRebalancing ▼▼▼▼▼
    /*
    static calculateAddRebalancing({ portfolioData, additionalInvestment }) { 
        // ... (이 로직은 AddRebalanceStrategy로 이동했습니다) ...
    }
    */
    // ▲▲▲▲▲ [삭제] ▲▲▲▲▲


    // ▼▼▼▼▼ [삭제] calculateSellRebalancing ▼▼▼▼▼
    /*
    static calculateSellRebalancing({ portfolioData }) { 
        // ... (이 로직은 SellRebalanceStrategy로 이동했습니다) ...
    }
    */
    // ▲▲▲▲▲ [삭제] ▲▲▲▲▲


    /**
     * @description 포트폴리오의 섹터별 금액 및 비율을 계산합니다.
     * @param {CalculatedStock[]} portfolioData - 계산된 주식 데이터
     * @returns {{ sector: string, amount: Decimal, percentage: Decimal }[]} 섹터 분석 결과
     */
    static calculateSectorAnalysis(portfolioData) { 
        // --- ⬇️ Performance Monitoring ⬇️ ---
        const startTime = performance.now();
        // --- ⬆️ Performance Monitoring ⬆️ ---
        
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
        
        // --- ⬇️ Performance Monitoring ⬇️ ---
        const endTime = performance.now();
        console.log(`[Perf] calculateSectorAnalysis for ${portfolioData.length} stocks took ${(endTime - startTime).toFixed(2)} ms`);
        // --- ⬆️ Performance Monitoring ⬆️ ---
        
        return result;
    }

    /**
     * @description 포트폴리오 계산 캐시를 초기화합니다.
     */
    static clearPortfolioStateCache() { 
        Calculator.#cache = null; 
    }
}