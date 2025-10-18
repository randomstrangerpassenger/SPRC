import { describe, it, expect, vi } from 'vitest';
import Decimal from 'decimal.js';
import { Calculator } from './calculator.js';
import { Validator } from './validator.js';

describe('Calculator.calculateStockMetrics', () => {
    it('매수 거래만 있을 때 정확한 평단가와 수량을 계산해야 한다', () => {
        const stock = {
            currentPrice: 150,
            transactions: [
                { type: 'buy', date: '2023-01-01', quantity: 10, price: 100 },
                { type: 'buy', date: '2023-01-02', quantity: 10, price: 120 },
            ]
        };
        const result = Calculator.calculateStockMetrics(stock);
        expect(result.quantity.toString()).toBe('20');
        expect(result.avgBuyPrice.toString()).toBe('110'); // (10*100 + 10*120) / 20
        expect(result.currentAmount.toString()).toBe('3000'); // 20 * 150
        expect(result.profitLoss.toString()).toBe('800'); // 3000 - 2200
    });

    it('매수와 매도 거래가 섞여 있을 때 정확한 상태를 계산해야 한다', () => {
        const stock = {
            currentPrice: 200,
            transactions: [
                { type: 'buy', date: '2023-01-01', quantity: 10, price: 100 },
                { type: 'sell', date: '2023-01-02', quantity: 5, price: 150 }, // 평단 100짜리 5개 매도
            ]
        };
        const result = Calculator.calculateStockMetrics(stock);
        expect(result.quantity.toString()).toBe('5');
        expect(result.avgBuyPrice.toString()).toBe('100');
        expect(result.currentAmount.toString()).toBe('1000'); // 5 * 200
        expect(result.profitLoss.toString()).toBe('500'); // 1000 - 500
    });
});

describe('Calculator.calculateSellRebalancing', () => {
  it('목표 비율에 맞게 매도 및 매수해야 할 금액을 정확히 계산해야 한다', () => {
    const portfolioData = [
      { id: 1, name: "과체중", targetRatio: 25, calculated: { currentAmount: new Decimal(5000) } },
      { id: 2, name: "저체중", targetRatio: 75, calculated: { currentAmount: new Decimal(5000) } }
    ];
    const { results } = Calculator.calculateSellRebalancing({ portfolioData });
    const overweightStock = results.find(s => s.id === 1);
    const underweightStock = results.find(s => s.id === 2);
    expect(overweightStock.adjustment.toFixed(0)).toBe('2500');
    expect(underweightStock.adjustment.toFixed(0)).toBe('-2500');
  });
});

describe('Calculator.calculateAddRebalancing', () => {
  it('추가 투자금을 목표 비율에 미달하는 주식에 정확히 배분해야 한다', () => {
    const portfolioData = [
      { id: 1, name: 'A (저체중)', targetRatio: 50, isFixedBuyEnabled: false, calculated: { currentAmount: new Decimal(1000) } },
      { id: 2, name: 'B (과체중)', targetRatio: 50, isFixedBuyEnabled: false, calculated: { currentAmount: new Decimal(3000) } }
    ];
    const additionalInvestment = new Decimal(1000);
    const { results } = Calculator.calculateAddRebalancing({ portfolioData, additionalInvestment });
    const underweightStock = results.find(s => s.id === 1);
    const overweightStock = results.find(s => s.id === 2);
    expect(underweightStock.finalBuyAmount.toString()).toBe('1000');
    expect(overweightStock.finalBuyAmount.toString()).toBe('0');
  });
});

// ADDED: Validator 테스트 케이스
describe('Validator.validateTransaction', () => {
    it('유효한 거래 데이터를 통과시켜야 한다', () => {
        const validTx = { date: '2023-01-01', quantity: 1, price: 100 };
        expect(Validator.validateTransaction(validTx).isValid).toBe(true);
    });
    it('미래 날짜를 거부해야 한다', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        const futureTx = { date: futureDate.toISOString().slice(0, 10), quantity: 1, price: 100 };
        expect(Validator.validateTransaction(futureTx).isValid).toBe(false);
    });
    it('잘못된 날짜 형식을 거부해야 한다', () => {
        const invalidTx = { date: 'not-a-date', quantity: 1, price: 100 };
        expect(Validator.validateTransaction(invalidTx).isValid).toBe(false);
    });
    it('0 또는 음수 수량을 거부해야 한다', () => {
        const invalidTx = { date: '2023-01-01', quantity: 0, price: 100 };
        expect(Validator.validateTransaction(invalidTx).isValid).toBe(false);
    });
});