// src/calculator.test.ts (전략 패턴 적용)

import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { Calculator } from './calculator';
import { AddRebalanceStrategy, SellRebalanceStrategy } from './calculationStrategies';
import { createMockCalculatedStock } from './testUtils';
import type { Stock } from './types';

describe('Calculator.calculateStockMetrics (동기)', () => {
    it('매수 거래만 있을 때 정확한 평단가와 수량을 계산해야 한다', () => {
        const stock: Stock = {
            id: 's1', name: 'Test', ticker: 'TEST', sector: 'Tech', targetRatio: 100, currentPrice: 150,
            transactions: [
                { id:'t1', type: 'buy', date: '2023-01-01', quantity: 10, price: 100 },
                { id:'t2', type: 'buy', date: '2023-01-02', quantity: 10, price: 120 },
            ], isFixedBuyEnabled: false, fixedBuyAmount: 0
        };
        const result = Calculator.calculateStockMetrics(stock);
        expect(result.quantity.toString()).toBe('20');
        expect(result.avgBuyPrice.toString()).toBe('110');
        expect(result.currentAmount.toString()).toBe('3000');
        expect(result.profitLoss.toString()).toBe('800');
    });

    it('매수와 매도 거래가 섞여 있을 때 정확한 상태를 계산해야 한다', () => {
        const stock: Stock = {
            id: 's1', name: 'Test', ticker: 'TEST', sector: 'Tech', targetRatio: 100, currentPrice: 200,
            transactions: [
                { id:'t1', type: 'buy', date: '2023-01-01', quantity: 10, price: 100 },
                { id:'t2', type: 'sell', date: '2023-01-02', quantity: 5, price: 150 },
            ], isFixedBuyEnabled: false, fixedBuyAmount: 0
        };
        const result = Calculator.calculateStockMetrics(stock);
        expect(result.quantity.toString()).toBe('5');
        expect(result.avgBuyPrice.toString()).toBe('100');
        expect(result.currentAmount.toString()).toBe('1000');
        expect(result.profitLoss.toString()).toBe('500');
    });
});

describe('Calculator.calculateRebalancing (SellRebalanceStrategy)', () => {
  it('목표 비율에 맞게 매도 및 매수해야 할 금액을 정확히 계산해야 한다', () => {
    const portfolioData = [
      createMockCalculatedStock({ id: 's1', name: 'Stock 1', ticker: 'S1', targetRatio: 25, currentPrice: 1, quantity: 5000, avgBuyPrice: 1 }), // 5000원
      createMockCalculatedStock({ id: 's2', name: 'Stock 2', ticker: 'S2', targetRatio: 75, currentPrice: 1, quantity: 5000, avgBuyPrice: 1 })  // 5000원
    ];

    const strategy = new SellRebalanceStrategy(portfolioData);
    const { results } = Calculator.calculateRebalancing(strategy);

    const overweightStock = results.find(s => s.id === 's1');
    const underweightStock = results.find(s => s.id === 's2');

    // 총액 10000원. 목표: 2500원(s1), 7500원(s2)
    expect(overweightStock?.adjustment.toString()).toBe('2500'); // Sell 2500
    expect(underweightStock?.adjustment.toString()).toBe('-2500'); // Buy 2500
  });
});

describe('Calculator.calculateRebalancing (AddRebalanceStrategy)', () => {
  it('추가 투자금을 목표 비율에 미달하는 주식에 정확히 배분해야 한다', () => {
    const portfolioData = [
      createMockCalculatedStock({ id: 's1', name: 'S1', ticker: 'S1', targetRatio: 50, currentPrice: 1, quantity: 1000, avgBuyPrice: 1 }), // 저체중
      createMockCalculatedStock({ id: 's2', name: 'S2', ticker: 'S2', targetRatio: 50, currentPrice: 1, quantity: 3000, avgBuyPrice: 1 })  // 과체중
    ];
    const additionalInvestment = new Decimal(1000);

    const strategy = new AddRebalanceStrategy(portfolioData, additionalInvestment);
    const { results } = Calculator.calculateRebalancing(strategy);

    const underweightStock = results.find(s => s.id === 's1');
    const overweightStock = results.find(s => s.id === 's2');

    expect(underweightStock?.finalBuyAmount.toString()).toBe('1000');
    expect(overweightStock?.finalBuyAmount.toString()).toBe('0');
  });
});

describe('Calculator Edge Cases (동기)', () => {

    describe('calculateStockMetrics', () => {
        it('매도 수량이 보유 수량을 초과하면 보유 수량은 0이 되어야 함', () => {
             const stock: Stock = {
                id: 's1', name: 'OverSell', ticker: 'OVER', sector: '', targetRatio: 100, currentPrice: 100,
                transactions: [
                    { id:'t1', type: 'buy', date: '2023-01-01', quantity: 10, price: 100 },
                    { id:'t2', type: 'sell', date: '2023-01-02', quantity: 15, price: 80 }
                ], isFixedBuyEnabled: false, fixedBuyAmount: 0
            };
            const result = Calculator.calculateStockMetrics(stock);

            expect(result.quantity.toString()).toBe('0');
            expect(result.avgBuyPrice.toString()).toBe('100');
            expect(result.currentAmount.toString()).toBe('0');
            expect(result.profitLoss.toString()).toBe('0');
        });
    });

    describe('calculateRebalancing (AddRebalanceStrategy Edge Cases)', () => {
        it('추가 투자금이 0이면 매수 추천 금액은 모두 0이어야 함', () => {
             const portfolioData = [
                createMockCalculatedStock({ id: 's1', name: 'S1', ticker: 'S1', targetRatio: 50, currentPrice: 1, quantity: 1000, avgBuyPrice: 1 }),
                createMockCalculatedStock({ id: 's2', name: 'S2', ticker: 'S2', targetRatio: 50, currentPrice: 1, quantity: 1000, avgBuyPrice: 1 })
            ];
            const additionalInvestment = new Decimal(0);
            const strategy = new AddRebalanceStrategy(portfolioData, additionalInvestment);
            const { results } = Calculator.calculateRebalancing(strategy);

            expect(results[0].finalBuyAmount.toString()).toBe('0');
            expect(results[1].finalBuyAmount.toString()).toBe('0');
            expect(results[0].buyRatio.toString()).toBe('0');
            expect(results[1].buyRatio.toString()).toBe('0');
        });

        it('모든 종목의 목표 비율이 0이면 매수 추천 금액은 모두 0이어야 함', () => {
            const portfolioData = [
                createMockCalculatedStock({ id: 's1', name: 'S1', ticker: 'S1', targetRatio: 0, currentPrice: 1, quantity: 1000, avgBuyPrice: 1 }), // 목표 0%
                createMockCalculatedStock({ id: 's2', name: 'S2', ticker: 'S2', targetRatio: 0, currentPrice: 1, quantity: 1000, avgBuyPrice: 1 })
            ];
            const additionalInvestment = new Decimal(1000);
            const strategy = new AddRebalanceStrategy(portfolioData, additionalInvestment);
            const { results } = Calculator.calculateRebalancing(strategy);

            expect(results[0].finalBuyAmount.toString()).toBe('0');
            expect(results[1].finalBuyAmount.toString()).toBe('0');
        });

         it('고정 매수 금액이 추가 투자금을 초과하면, 추가 투자금까지만 할당됨', () => {
            const portfolioData = [
                { ...createMockCalculatedStock({ id: 's1', name: 'S1', ticker: 'S1', targetRatio: 50, currentPrice: 1, quantity: 1000, avgBuyPrice: 1 }), isFixedBuyEnabled: true, fixedBuyAmount: 1500 }, // 고정 1500
                createMockCalculatedStock({ id: 's2', name: 'S2', ticker: 'S2', targetRatio: 50, currentPrice: 1, quantity: 1000, avgBuyPrice: 1 })
            ];
            const additionalInvestment = new Decimal(1000); // 총 투자금 1000
            const strategy = new AddRebalanceStrategy(portfolioData, additionalInvestment);
            const { results } = Calculator.calculateRebalancing(strategy);

            expect(results.find(r => r.id === 's1')?.finalBuyAmount.toString()).toBe('1000');
            expect(results.find(r => r.id === 's2')?.finalBuyAmount.toString()).toBe('0');
         });
    });
});
