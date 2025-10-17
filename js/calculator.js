import Decimal from 'decimal.js';
import { getRatioSum } from './utils.js';

export const Calculator = {
    calculatePortfolioState({ portfolioData }) {
        return portfolioData.map(stock => {
            let totalQuantity = new Decimal(0);
            let totalBuyCost = new Decimal(0);
            let totalBuyQuantity = new Decimal(0);
            const ZERO = new Decimal(0);

            const sortedTransactions = [...stock.transactions]
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            for (const tx of sortedTransactions) {
                const txQuantity = new Decimal(tx.quantity || 0);
                const txPrice = new Decimal(tx.price || 0);

                if (tx.type === 'buy') {
                    totalQuantity = totalQuantity.plus(txQuantity);
                    totalBuyCost = totalBuyCost.plus(txQuantity.times(txPrice));
                    totalBuyQuantity = totalBuyQuantity.plus(txQuantity);
                } else { // 'sell'
                    if (!totalBuyQuantity.isZero()) {
                        const avgBuyPrice = totalBuyCost.div(totalBuyQuantity);
                        totalBuyCost = totalBuyCost.minus(txQuantity.times(avgBuyPrice));
                        totalBuyQuantity = totalBuyQuantity.minus(txQuantity);
                    }
                    totalQuantity = totalQuantity.minus(txQuantity);
                }
            }
            
            totalQuantity = Decimal.max(ZERO, totalQuantity);
            totalBuyCost = Decimal.max(ZERO, totalBuyCost);

            const averageBuyPrice = totalBuyQuantity.isZero() ? ZERO : totalBuyCost.div(totalBuyQuantity);
            const currentAmount = totalQuantity.times(new Decimal(stock.currentPrice || 0));

            const profitLoss = currentAmount.minus(totalBuyCost);
            const profitLossRate = totalBuyCost.isZero() ? ZERO : profitLoss.div(totalBuyCost).times(100);

            return {
                ...stock,
                calculated: {
                    quantity: totalQuantity,
                    avgBuyPrice: averageBuyPrice,
                    currentAmount: currentAmount,
                    profitLoss: profitLoss,
                    profitLossRate: profitLossRate,
                }
            };
        });
    },

    calculateAddRebalancing({ portfolioData, additionalInvestment }) {
        if (!Array.isArray(portfolioData)) throw new TypeError('유효하지 않은 포트폴리오 데이터입니다.');
        if (!(additionalInvestment instanceof Decimal)) throw new TypeError('투자 금액은 Decimal 타입이어야 합니다.');
        
        const ZERO = new Decimal(0);

        const totalFixedBuy = portfolioData.reduce((sum, s) => {
            return s.isFixedBuyEnabled ? sum.plus(new Decimal(s.fixedBuyAmount || 0)) : sum;
        }, ZERO);
        
        const remainingInvestment = Decimal.max(ZERO, additionalInvestment.minus(totalFixedBuy));
        
        const rebalancingStocks = portfolioData.filter(s => !s.isFixedBuyEnabled);
        const totalRatio = getRatioSum(rebalancingStocks);
        
        const currentTotal = portfolioData.reduce((sum, s) => sum.plus(s.calculated.currentAmount), ZERO);
        const finalTotal = currentTotal.plus(additionalInvestment);

        let results = portfolioData.map(stock => ({
            ...stock,
            finalBuyAmount: stock.isFixedBuyEnabled ? new Decimal(stock.fixedBuyAmount || 0) : ZERO,
            currentRatio: currentTotal.isZero() ? 0 : stock.calculated.currentAmount.div(currentTotal).times(100).toNumber()
        }));
        
        if (remainingInvestment.greaterThan(0) && rebalancingStocks.length > 0) {
            const currentRebalancingTotal = rebalancingStocks.reduce((sum, s) => sum.plus(s.calculated.currentAmount), ZERO);
            const finalRebalancingTotal = currentRebalancingTotal.plus(remainingInvestment);

            const neededForRebalancing = rebalancingStocks.map(s => {
                const targetRatio = new Decimal(totalRatio > 0 ? (s.targetRatio || 0) / totalRatio : 1 / rebalancingStocks.length);
                const targetValue = finalRebalancingTotal.times(targetRatio);
                const needed = Decimal.max(ZERO, targetValue.minus(s.calculated.currentAmount));
                return { id: s.id, needed };
            });

            const totalNeeded = neededForRebalancing.reduce((sum, s) => sum.plus(s.needed), ZERO);
            
            let distributedAmount = ZERO;
            neededForRebalancing.forEach((stock, index) => {
                const resultStock = results.find(r => r.id === stock.id);
                if (index === neededForRebalancing.length - 1) {
                    const remaining = remainingInvestment.minus(distributedAmount);
                    resultStock.finalBuyAmount = resultStock.finalBuyAmount.plus(Decimal.max(ZERO, remaining));
                } else {
                    const proportion = totalNeeded.isZero() ? new Decimal(1).div(rebalancingStocks.length) : stock.needed.div(totalNeeded);
                    const allocated = proportion.times(remainingInvestment).round();
                    resultStock.finalBuyAmount = resultStock.finalBuyAmount.plus(allocated);
                    distributedAmount = distributedAmount.plus(allocated);
                }
            });
        }
        
        results.forEach(r => {
            r.buyRatio = additionalInvestment.isZero() || r.finalBuyAmount.isZero() ? 0 : r.finalBuyAmount.div(additionalInvestment).times(100).toNumber();
        });

        const summary = { currentTotal, additionalInvestment, finalTotal };
        return { results, summary };
    },

    calculateSellRebalancing({ portfolioData }) {
        if (!Array.isArray(portfolioData)) throw new TypeError('유효하지 않은 포트폴리오 데이터입니다.');
        
        const ZERO = new Decimal(0);
        const currentTotal = portfolioData.reduce((sum, s) => sum.plus(s.calculated.currentAmount), ZERO);

        if (currentTotal.isZero()) {
            return { results: portfolioData.map(s => ({ ...s, currentRatio: 0, adjustment: ZERO })) };
        }

        const results = portfolioData.map(stock => {
            const targetAmountDec = currentTotal.times(new Decimal(stock.targetRatio || 0)).div(100);
            return {
                ...stock,
                currentRatio: stock.calculated.currentAmount.div(currentTotal).times(100).toNumber(),
                adjustment: stock.calculated.currentAmount.minus(targetAmountDec)
            };
        });
        
        return { results };
    },

    analyzeSectors({ portfolioData }) {
        const totalAmount = portfolioData.reduce((sum, stock) => sum.plus(stock.calculated.currentAmount), new Decimal(0));
        if (totalAmount.isZero()) return [];

        const sectorMap = new Map();
        portfolioData.forEach(stock => {
            const sector = stock.sector || '미분류';
            const sectorTotal = sectorMap.get(sector) || new Decimal(0);
            sectorMap.set(sector, sectorTotal.plus(stock.calculated.currentAmount));
        });

        return Array.from(sectorMap.entries())
            .map(([sector, amount]) => ({
                sector,
                amount,
                percentage: amount.div(totalAmount).times(100).toNumber()
            }))
            .sort((a, b) => b.amount.comparedTo(a.amount));
    }
};