import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

let lastPortfolioDataJSON = '';
let lastPortfolioStateResult = null;

export const Calculator = {
    /**
     * 개별 주식의 현재 상태(수량, 평단가, 평가금액 등)를 계산합니다.
     * @param {object} stock - 계산할 주식 객체
     * @returns {object} 계산된 지표(quantity, avgBuyPrice 등)를 포함하는 객체
     */
    calculateStockMetrics(stock) {
        const sortedTransactions = Array.isArray(stock.transactions)
            ? [...stock.transactions].sort((a, b) => new Date(a.date) - new Date(b.date))
            : [];

        let totalQuantity = new Decimal(0);
        let totalBuyCost = new Decimal(0);
        let totalBuyQuantity = new Decimal(0);

        for (const tx of sortedTransactions) {
            const txQuantity = new Decimal(tx.quantity || 0);
            const txPrice = new Decimal(tx.price || 0);

            if (tx.type === 'buy') {
                totalQuantity = totalQuantity.plus(txQuantity);
                totalBuyCost = totalBuyCost.plus(txQuantity.times(txPrice));
                totalBuyQuantity = totalBuyQuantity.plus(txQuantity);
            } else { // sell
                if (totalQuantity.isZero()) continue;

                const sellRatio = txQuantity.div(totalQuantity);
                totalBuyCost = totalBuyCost.minus(totalBuyCost.times(sellRatio));
                totalBuyQuantity = totalBuyQuantity.minus(totalBuyQuantity.times(sellRatio));
                totalQuantity = totalQuantity.minus(txQuantity);
            }
        }
        
        if (totalQuantity.isNegative()) totalQuantity = new Decimal(0);
        if (totalBuyCost.isNegative()) totalBuyCost = new Decimal(0);
        if (totalBuyQuantity.isNegative()) totalBuyQuantity = new Decimal(0);

        const currentPriceDec = new Decimal(stock.currentPrice || 0);
        const currentAmount = totalQuantity.times(currentPriceDec);
        const avgBuyPrice = totalBuyQuantity.isZero() ? new Decimal(0) : totalBuyCost.div(totalBuyQuantity);
        const profitLoss = currentAmount.minus(totalBuyCost);
        const profitLossRate = totalBuyCost.isZero() ? new Decimal(0) : profitLoss.div(totalBuyCost).times(100);

        return {
            quantity: totalQuantity,
            avgBuyPrice,
            currentAmount,
            profitLoss,
            profitLossRate
        };
    },

    /**
     * 전체 포트폴리오의 각 주식에 대해 계산된 상태를 추가합니다. (메모이제이션 적용)
     * @param {object} param - { portfolioData: Array<object> }
     * @returns {Array<object>} 각 주식에 'calculated' 속성이 추가된 배열
     */
    calculatePortfolioState({ portfolioData }) {
        const currentPortfolioDataJSON = JSON.stringify(portfolioData);
        if (currentPortfolioDataJSON === lastPortfolioDataJSON) {
            return lastPortfolioStateResult;
        }

        const result = portfolioData.map(stock => ({
            ...stock,
            calculated: this.calculateStockMetrics(stock)
        }));

        lastPortfolioDataJSON = currentPortfolioDataJSON;
        lastPortfolioStateResult = result;

        return result;
    },
    
    /**
     * '매도 리밸런싱' 모드의 결과를 계산합니다.
     * @param {object} param - { portfolioData: Array<object> }
     * @returns {object} { results: Array<object> }
     */
    calculateSellRebalancing({ portfolioData }) {
        const currentTotal = portfolioData.reduce((sum, s) => sum.plus(s.calculated.currentAmount), new Decimal(0));

        if (currentTotal.isZero()) {
            return {
                results: portfolioData.map(s => ({ ...s, currentRatio: 0, adjustment: new Decimal(0) }))
            };
        }

        const results = portfolioData.map(stock => {
            const currentRatio = stock.calculated.currentAmount.div(currentTotal).times(100);
            const targetAmount = currentTotal.times(new Decimal(stock.targetRatio || 0)).div(100);
            const adjustment = stock.calculated.currentAmount.minus(targetAmount);

            return {
                ...stock,
                currentRatio: currentRatio.toNumber(),
                targetRatio: new Decimal(stock.targetRatio || 0).toNumber(),
                adjustment
            };
        });

        return { results };
    },

    /**
     * '추가 매수' 모드의 결과를 계산합니다.
     * @param {object} param - { portfolioData: Array<object>, additionalInvestment: Decimal }
     * @returns {object} { results: Array<object>, summary: object }
     */
    calculateAddRebalancing({ portfolioData, additionalInvestment }) {
        let remainingInvestment = new Decimal(additionalInvestment);
        const fixedBuyStocks = portfolioData.filter(s => s.isFixedBuyEnabled && new Decimal(s.fixedBuyAmount || 0).gt(0));
        
        fixedBuyStocks.forEach(stock => {
            const fixedAmount = new Decimal(stock.fixedBuyAmount);
            stock.finalBuyAmount = fixedAmount;
            remainingInvestment = remainingInvestment.minus(fixedAmount);
        });

        const nonFixedPortfolio = portfolioData.filter(s => !s.isFixedBuyEnabled);
        
        const currentTotal = portfolioData.reduce((sum, s) => sum.plus(s.calculated.currentAmount), new Decimal(0));
        const finalTotal = currentTotal.plus(additionalInvestment);

        nonFixedPortfolio.forEach(stock => {
            const currentAmount = stock.calculated.currentAmount;
            const targetAmount = finalTotal.times(new Decimal(stock.targetRatio || 0)).div(100);
            stock.shortfall = Decimal.max(0, targetAmount.minus(currentAmount));
        });
        
        const totalShortfall = nonFixedPortfolio.reduce((sum, s) => sum.plus(s.shortfall), new Decimal(0));

        if (totalShortfall.gt(0)) {
            nonFixedPortfolio.forEach(stock => {
                const allocationRatio = stock.shortfall.div(totalShortfall);
                stock.finalBuyAmount = allocationRatio.times(remainingInvestment).round();
            });
        } else {
            const totalTargetRatio = nonFixedPortfolio.reduce((sum, s) => sum.plus(new Decimal(s.targetRatio || 0)), new Decimal(0));
            if (totalTargetRatio.gt(0)) {
                nonFixedPortfolio.forEach(stock => {
                    const allocationRatio = new Decimal(stock.targetRatio || 0).div(totalTargetRatio);
                    stock.finalBuyAmount = allocationRatio.times(remainingInvestment).round();
                });
            }
        }

        const results = portfolioData.map(s => {
            s.finalBuyAmount = s.finalBuyAmount || new Decimal(0);
            s.currentRatio = currentTotal.isZero() ? new Decimal(0) : s.calculated.currentAmount.div(currentTotal).times(100);
            s.buyRatio = additionalInvestment.isZero() ? new Decimal(0) : s.finalBuyAmount.div(additionalInvestment).times(100);
            return {
                ...s,
                targetRatio: new Decimal(s.targetRatio || 0),
                currentRatio: s.currentRatio,
                finalBuyAmount: s.finalBuyAmount,
                buyRatio: s.buyRatio,
            };
        });

        const summary = { currentTotal, additionalInvestment, finalTotal };

        return { results, summary };
    },

    /**
     * 포트폴리오의 섹터별 비중을 분석합니다.
     * @param {object} param - { portfolioData: Array<object> }
     * @returns {Array<object>} 섹터별 금액과 비중을 담은 배열
     */
    analyzeSectors({ portfolioData }) {
        const sectorMap = new Map();
        const totalAmount = portfolioData.reduce((sum, stock) => sum.plus(stock.calculated.currentAmount), new Decimal(0));

        if (totalAmount.isZero()) return [];

        portfolioData.forEach(stock => {
            const sector = stock.sector.trim() || '미분류';
            const currentSectorAmount = sectorMap.get(sector) || new Decimal(0);
            sectorMap.set(sector, currentSectorAmount.plus(stock.calculated.currentAmount));
        });
        
        return Array.from(sectorMap.entries())
            .map(([sector, amount]) => ({
                sector,
                amount,
                percentage: amount.div(totalAmount).times(100)
            }))
            .sort((a, b) => b.amount.comparedTo(a.amount));
    }
};