// js/testUtils.js
// @ts-check
import Decimal from 'decimal.js';

/**
 * @description 테스트용으로 완벽하게 계산된 CalculatedStock 객체를 생성합니다.
 * @param {string} id
 * @param {string} name
 * @param {string} ticker
 * @param {number} targetRatio - 목표 비율 (%)
 * @param {number} currentPrice - 현재가
 * @param {number} quantity - 보유 수량
 * @param {number} avgBuyPrice - 평단가
 * @returns {import('./types.js').CalculatedStock}
 */
export function createMockCalculatedStock({
    id, name, ticker, targetRatio, currentPrice, quantity, avgBuyPrice
}) {
    const currentAmount = new Decimal(currentPrice).times(quantity);
    const totalBuyAmount = new Decimal(avgBuyPrice).times(quantity);
    const profitLoss = currentAmount.minus(totalBuyAmount);
    const profitLossRate = totalBuyAmount.isZero() ? new Decimal(0) : profitLoss.div(totalBuyAmount).times(100);

    return {
        id: id,
        name: name,
        ticker: ticker,
        sector: 'Test Sector',
        targetRatio: new Decimal(targetRatio),
        currentPrice: new Decimal(currentPrice),
        isFixedBuyEnabled: false,
        fixedBuyAmount: new Decimal(0),
        transactions: [], // 테스트 편의를 위해 transactions는 비워둠
        calculated: {
            quantity: new Decimal(quantity),
            avgBuyPrice: new Decimal(avgBuyPrice),
            currentAmount: currentAmount,
            profitLoss: profitLoss,
            profitLossRate: profitLossRate,
            totalBuyQuantity: new Decimal(quantity),
            totalSellQuantity: new Decimal(0),
            netQuantity: new Decimal(quantity),
            totalBuyAmount: totalBuyAmount,
            currentAmountUSD: new Decimal(0),
            currentAmountKRW: new Decimal(0),
        },
    };
}

// --- 공통 모의 데이터 ---

export const MOCK_STOCK_1 = createMockCalculatedStock({
    id: 's1',
    name: 'Stock A',
    ticker: 'AAA',
    targetRatio: 50,
    currentPrice: 150,
    quantity: 10,
    avgBuyPrice: 100
}); // 현재가: 1500

export const MOCK_STOCK_2 = createMockCalculatedStock({
    id: 's2',
    name: 'Stock B',
    ticker: 'BBB',
    targetRatio: 50,
    currentPrice: 200,
    quantity: 20,
    avgBuyPrice: 250
}); // 현재가: 4000

export const MOCK_PORTFOLIO_1 = {
    id: 'p-default',
    name: '기본 포트폴리오',
    settings: {
        mainMode: 'add',
        currentCurrency: 'krw',
        exchangeRate: 1300,
    },
    portfolioData: [MOCK_STOCK_1, MOCK_STOCK_2] // 2개의 주식 포함
};