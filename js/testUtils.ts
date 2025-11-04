// js/testUtils.ts
import Decimal from 'decimal.js';
import type { CalculatedStock, Portfolio } from './types';

/**
 * @description 테스트용으로 완벽하게 계산된 CalculatedStock 객체를 생성합니다.
 */
export function createMockCalculatedStock({
    id, name, ticker, targetRatio, currentPrice, quantity, avgBuyPrice
}: {
    id: string;
    name: string;
    ticker: string;
    targetRatio: number;
    currentPrice: number;
    quantity: number;
    avgBuyPrice: number;
}): CalculatedStock {
    const currentAmount = new Decimal(currentPrice).times(quantity);
    const totalBuyAmount = new Decimal(avgBuyPrice).times(quantity);
    const profitLoss = currentAmount.minus(totalBuyAmount);
    const profitLossRate = totalBuyAmount.isZero() ? new Decimal(0) : profitLoss.div(totalBuyAmount).times(100);

    return {
        id: id,
        name: name,
        ticker: ticker,
        sector: 'Test Sector',
        targetRatio: targetRatio,
        currentPrice: currentPrice,
        isFixedBuyEnabled: false,
        fixedBuyAmount: 0,
        transactions: [], // 테스트 편의를 위해 transactions는 비워둠
        calculated: {
            quantity: new Decimal(quantity),
            avgBuyPrice: new Decimal(avgBuyPrice),
            currentAmount: currentAmount,
            profitLoss: profitLoss,
            profitLossRate: profitLossRate,
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

export const MOCK_PORTFOLIO_1: Portfolio = {
    id: 'p-default',
    name: '기본 포트폴리오',
    settings: {
        mainMode: 'add',
        currentCurrency: 'krw',
        exchangeRate: 1300,
    },
    portfolioData: [MOCK_STOCK_1, MOCK_STOCK_2] // 2개의 주식 포함
};
