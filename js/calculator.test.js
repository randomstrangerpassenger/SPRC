// js/calculator.test.js
// @ts-check

import { describe, it, expect, vi } from 'vitest';
import Decimal from 'decimal.js';
import { Calculator } from './calculator.js';

// --- Helper for creating base stock data ---
/**
 * @param {string} id
 * @param {number} targetRatio
 * @param {number} currentAmount
 * @param {import('./types.js').Transaction[]} [transactions=[]]
 * @returns {import('./types.js').CalculatedStock}
 */
function createMockStock(id, targetRatio, currentAmount, transactions = []) {
    // 현재 테스트는 calculated 속성을 직접 설정하는 방식에 의존
    return {
        id: id, 
        name: `Stock ${id}`, 
        ticker: id.toUpperCase(), 
        sector: 'Test', 
        targetRatio: targetRatio, 
        currentPrice: 1, // 가격은 1로 고정하여 금액 = 수량으로 단순화
        isFixedBuyEnabled: false, 
        fixedBuyAmount: 0, 
        transactions: transactions,
        calculated: { 
            quantity: new Decimal(currentAmount), 
            avgBuyPrice: new Decimal(1), 
            currentAmount: new Decimal(currentAmount), 
            profitLoss: new Decimal(0), 
            profitLossRate: new Decimal(0),
        },
    };
}


describe('Calculator.calculateStockMetrics (동기)', () => {
    it('매수 거래만 있을 때 정확한 평단가와 수량을 계산해야 한다', () => {
        const stock = {
            id: 's1', name: 'Test', ticker: 'TEST', sector: 'Tech', targetRatio: 100, currentPrice: 150,
            transactions: [
                { id:'t1', type: 'buy', date: '2023-01-01', quantity: new Decimal(10), price: new Decimal(100) },
                { id:'t2', type: 'buy', date: '2023-01-02', quantity: new Decimal(10), price: new Decimal(120) },
            ], isFixedBuyEnabled: false, fixedBuyAmount: 0, _sortedTransactions: [] // Add cache property
        };
        stock._sortedTransactions = [...stock.transactions].sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime()); // Pre-sort
        const result = Calculator.calculateStockMetrics(stock); // 동기 호출
        expect(result.netQuantity.toString()).toBe('20');
        expect(result.avgBuyPrice.toString()).toBe('110');
        expect(result.currentAmount.toString()).toBe('3000'); // 20 * 150
        expect(result.profitLoss.toString()).toBe('800'); // 3000 - 2200
    });

    it('매수와 매도 거래가 섞여 있을 때 정확한 상태를 계산해야 한다', () => {
        const stock = {
            id: 's1', name: 'Test', ticker: 'TEST', sector: 'Tech', targetRatio: 100, currentPrice: 200,
            transactions: [
                { id:'t1', type: 'buy', date: '2023-01-01', quantity: new Decimal(10), price: new Decimal(100) },
                { id:'t2', type: 'sell', date: '2023-01-02', quantity: new Decimal(5), price: new Decimal(150) },
            ], isFixedBuyEnabled: false, fixedBuyAmount: 0, _sortedTransactions: []
        };
         stock._sortedTransactions = [...stock.transactions].sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime());
        const result = Calculator.calculateStockMetrics(stock); // 동기 호출
        expect(result.netQuantity.toString()).toBe('5');
        expect(result.avgBuyPrice.toString()).toBe('100');
        expect(result.currentAmount.toString()).toBe('1000'); // 5 * 200
        expect(result.profitLoss.toString()).toBe('500'); // 1000 - 500
    });
});

describe('Calculator.calculateSellRebalancing (동기)', () => {
  it('목표 비율에 맞게 매도 및 매수해야 할 금액을 정확히 계산해야 한다', () => {
    const portfolioData = [
      createMockStock('s1', 25, 5000), // 5000원
      createMockStock('s2', 75, 5000)  // 5000원
    ];
    // @ts-ignore
    const { results } = Calculator.calculateSellRebalancing({ portfolioData }); // 동기 호출
    const overweightStock = results.find(s => s.id === 's1');
    const underweightStock = results.find(s => s.id === 's2');
    
    // 총액 10000원. 목표: 2500원(s1), 7500원(s2)
    expect(overweightStock?.adjustment.toString()).toBe('2500'); // Sell 2500
    expect(underweightStock?.adjustment.toString()).toBe('-2500'); // Buy 2500
  });
});

describe('Calculator.calculateAddRebalancing (동기)', () => {
  it('추가 투자금을 목표 비율에 미달하는 주식에 정확히 배분해야 한다', () => {
    const portfolioData = [
      createMockStock('s1', 50, 1000), // 저체중
      createMockStock('s2', 50, 3000)  // 과체중
    ];
    const additionalInvestment = new Decimal(1000);
    // @ts-ignore
    const { results } = Calculator.calculateAddRebalancing({ portfolioData, additionalInvestment }); // 동기 호출
    const underweightStock = results.find(s => s.id === 's1');
    const overweightStock = results.find(s => s.id === 's2');
    
    // 총액: 4000 (기존) + 1000 (추가) = 5000원. 목표: 2500원(s1), 2500원(s2)
    // s1 부족분: 2500 - 1000 = 1500원
    // s2 부족분: max(0, 2500 - 3000) = 0원
    // 총 부족분: 1500원. 추가 투자금 1000원은 s1에 모두 배분.
    expect(underweightStock?.finalBuyAmount.toString()).toBe('1000');
    expect(overweightStock?.finalBuyAmount.toString()).toBe('0');
  });
});

// ⬇️ [추가] 엣지 케이스 테스트 스위트
describe('Calculator Edge Cases (동기)', () => {

    describe('calculateStockMetrics', () => {
        it('매도 수량이 보유 수량을 초과하면 보유 수량만큼만 매도되어야 함', () => {
             const stock = {
                id: 's1', name: 'OverSell', ticker: 'OVER', sector: '', targetRatio: 100, currentPrice: 100,
                transactions: [
                    { id:'t1', type: 'buy', date: '2023-01-01', quantity: new Decimal(10), price: new Decimal(50) },
                    { id:'t2', type: 'sell', date: '2023-01-02', quantity: new Decimal(15), price: new Decimal(80) } // 보유량(10)보다 많이 매도 시도
                ], isFixedBuyEnabled: false, fixedBuyAmount: 0, _sortedTransactions: []
            };
            stock._sortedTransactions = [...stock.transactions].sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime());
            const result = Calculator.calculateStockMetrics(stock); // 동기 호출
            expect(result.netQuantity.toString()).toBe('0'); // 최종 수량은 0
            expect(result.avgBuyPrice.toString()).toBe('0');
        });
    });

    describe('calculateAddRebalancing', () => {
        it('추가 투자금이 0이면 매수 추천 금액은 모두 0이어야 함', () => {
             const portfolioData = [
                createMockStock('s1', 50, 1000),
                createMockStock('s2', 50, 1000)
            ];
            const additionalInvestment = new Decimal(0); // 추가 투자금 0
            // @ts-ignore
            const { results } = Calculator.calculateAddRebalancing({ portfolioData, additionalInvestment });
            expect(results[0].finalBuyAmount.toString()).toBe('0');
            expect(results[1].finalBuyAmount.toString()).toBe('0');
            expect(results[0].buyRatio.toString()).toBe('0');
            expect(results[1].buyRatio.toString()).toBe('0');
        });

        it('모든 종목의 목표 비율이 0이면 매수 추천 금액은 모두 0이어야 함', () => {
            const portfolioData = [
                createMockStock('s1', 0, 1000), // 목표 0%
                createMockStock('s2', 0, 1000)
            ];
            const additionalInvestment = new Decimal(1000);
            // @ts-ignore
            const { results } = Calculator.calculateAddRebalancing({ portfolioData, additionalInvestment });
            expect(results[0].finalBuyAmount.toString()).toBe('0');
            expect(results[1].finalBuyAmount.toString()).toBe('0');
        });

         it('고정 매수 금액이 추가 투자금을 초과하면, 고정 매수분만 할당되고 나머지는 0 (Validator가 막아야 함)', () => {
            const portfolioData = [
                { ...createMockStock('s1', 50, 1000), isFixedBuyEnabled: true, fixedBuyAmount: 1500 }, // 고정 1500
                createMockStock('s2', 50, 1000)
            ];
            const additionalInvestment = new Decimal(1000); // 총 투자금 1000
            // @ts-ignore
            const { results } = Calculator.calculateAddRebalancing({ portfolioData, additionalInvestment });
            
            // s1은 고정 매수가 그대로 반영됨 (1500)
            expect(results.find(r => r.id === 's1')?.finalBuyAmount.toString()).toBe('1500'); 
            // s2는 남은 투자금이 음수이므로 0이 할당되어야 함
            expect(results.find(r => r.id === 's2')?.finalBuyAmount.toString()).toBe('0'); 
            // 참고: Validator가 이 상황을 막는 것이 올바른 디자인 패턴임.
         });
    });
});