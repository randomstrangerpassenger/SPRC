// src/calculationStrategies.test.ts
import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import {
    AddRebalanceStrategy,
    SellRebalanceStrategy,
    SimpleRatioStrategy,
} from './calculationStrategies';
import type { CalculatedStock } from './types';

describe('AddRebalanceStrategy', () => {
    it('should allocate additional investment proportionally', () => {
        const portfolioData: CalculatedStock[] = [
            {
                id: 's1',
                name: 'Stock A',
                ticker: 'A',
                targetRatio: new Decimal(50),
                currentPrice: new Decimal(100),
                quantity: new Decimal(5),
                currentAmount: new Decimal(500),
                totalValue: new Decimal(1000),
                currentRatio: new Decimal(50),
                targetAmount: new Decimal(500),
                diffAmount: new Decimal(0),
                diffRatio: new Decimal(0),
                finalAmount: new Decimal(500),
                finalRatio: new Decimal(50),
                finalBuyAmount: new Decimal(0),
                finalBuyQuantity: new Decimal(0),
                fixedBuyAmount: new Decimal(0),
            },
            {
                id: 's2',
                name: 'Stock B',
                ticker: 'B',
                targetRatio: new Decimal(50),
                currentPrice: new Decimal(50),
                quantity: new Decimal(10),
                currentAmount: new Decimal(500),
                totalValue: new Decimal(1000),
                currentRatio: new Decimal(50),
                targetAmount: new Decimal(500),
                diffAmount: new Decimal(0),
                diffRatio: new Decimal(0),
                finalAmount: new Decimal(500),
                finalRatio: new Decimal(50),
                finalBuyAmount: new Decimal(0),
                finalBuyQuantity: new Decimal(0),
                fixedBuyAmount: new Decimal(0),
            },
        ];

        const additionalInvestment = new Decimal(1000);
        const strategy = new AddRebalanceStrategy(portfolioData, additionalInvestment);
        const { results } = strategy.calculate();

        expect(results).toHaveLength(2);

        // Each stock should get 50% of additional investment
        const stockA = results.find((s) => s.id === 's1');
        const stockB = results.find((s) => s.id === 's2');

        expect(stockA).toBeDefined();
        expect(stockB).toBeDefined();

        // Stock A gets 500 (50% of 1000)
        expect(stockA!.finalBuyAmount.toString()).toBe('500');
        // Stock B gets 500 (50% of 1000)
        expect(stockB!.finalBuyAmount.toString()).toBe('500');
    });

    it('should handle zero additional investment', () => {
        const portfolioData: CalculatedStock[] = [
            {
                id: 's1',
                name: 'Stock A',
                ticker: 'A',
                targetRatio: new Decimal(100),
                currentPrice: new Decimal(100),
                quantity: new Decimal(10),
                currentAmount: new Decimal(1000),
                totalValue: new Decimal(1000),
                currentRatio: new Decimal(100),
                targetAmount: new Decimal(1000),
                diffAmount: new Decimal(0),
                diffRatio: new Decimal(0),
                finalAmount: new Decimal(1000),
                finalRatio: new Decimal(100),
                finalBuyAmount: new Decimal(0),
                finalBuyQuantity: new Decimal(0),
                fixedBuyAmount: new Decimal(0),
            },
        ];

        const additionalInvestment = new Decimal(0);
        const strategy = new AddRebalanceStrategy(portfolioData, additionalInvestment);
        const { results } = strategy.calculate();

        expect(results[0].finalBuyAmount.toString()).toBe('0');
    });

    it('should prioritize underweight stocks', () => {
        const portfolioData: CalculatedStock[] = [
            {
                id: 's1',
                name: 'Underweight Stock',
                ticker: 'A',
                targetRatio: new Decimal(60),
                currentPrice: new Decimal(100),
                quantity: new Decimal(3), // 300 current amount
                currentAmount: new Decimal(300),
                totalValue: new Decimal(1000),
                currentRatio: new Decimal(30), // Under target
                targetAmount: new Decimal(600),
                diffAmount: new Decimal(-300),
                diffRatio: new Decimal(-30),
                finalAmount: new Decimal(300),
                finalRatio: new Decimal(30),
                finalBuyAmount: new Decimal(0),
                finalBuyQuantity: new Decimal(0),
                fixedBuyAmount: new Decimal(0),
            },
            {
                id: 's2',
                name: 'Overweight Stock',
                ticker: 'B',
                targetRatio: new Decimal(40),
                currentPrice: new Decimal(100),
                quantity: new Decimal(7), // 700 current amount
                currentAmount: new Decimal(700),
                totalValue: new Decimal(1000),
                currentRatio: new Decimal(70), // Over target
                targetAmount: new Decimal(400),
                diffAmount: new Decimal(300),
                diffRatio: new Decimal(30),
                finalAmount: new Decimal(700),
                finalRatio: new Decimal(70),
                finalBuyAmount: new Decimal(0),
                finalBuyQuantity: new Decimal(0),
                fixedBuyAmount: new Decimal(0),
            },
        ];

        const additionalInvestment = new Decimal(1000);
        const strategy = new AddRebalanceStrategy(portfolioData, additionalInvestment);
        const { results } = strategy.calculate();

        const underweight = results.find((s) => s.id === 's1');
        const overweight = results.find((s) => s.id === 's2');

        // Underweight stock should get more than overweight stock
        expect(underweight!.finalBuyAmount.gt(overweight!.finalBuyAmount)).toBe(true);
    });
});

describe('SellRebalanceStrategy', () => {
    it('should calculate sell amounts for overweight stocks', () => {
        const portfolioData: CalculatedStock[] = [
            {
                id: 's1',
                name: 'Overweight Stock',
                ticker: 'A',
                targetRatio: new Decimal(50), // Target 50%
                currentPrice: new Decimal(100),
                quantity: new Decimal(8), // 800 out of 1000 = 80%
                currentAmount: new Decimal(800),
                totalValue: new Decimal(1000),
                currentRatio: new Decimal(80),
                targetAmount: new Decimal(500),
                diffAmount: new Decimal(300),
                diffRatio: new Decimal(30),
                finalAmount: new Decimal(800),
                finalRatio: new Decimal(80),
                finalBuyAmount: new Decimal(0),
                finalBuyQuantity: new Decimal(0),
                fixedBuyAmount: new Decimal(0),
                calculated: {
                    currentAmount: new Decimal(800),
                },
            },
            {
                id: 's2',
                name: 'Underweight Stock',
                ticker: 'B',
                targetRatio: new Decimal(50), // Target 50%
                currentPrice: new Decimal(100),
                quantity: new Decimal(2), // 200 out of 1000 = 20%
                currentAmount: new Decimal(200),
                totalValue: new Decimal(1000),
                currentRatio: new Decimal(20),
                targetAmount: new Decimal(500),
                diffAmount: new Decimal(-300),
                diffRatio: new Decimal(-30),
                finalAmount: new Decimal(200),
                finalRatio: new Decimal(20),
                finalBuyAmount: new Decimal(0),
                finalBuyQuantity: new Decimal(0),
                fixedBuyAmount: new Decimal(0),
                calculated: {
                    currentAmount: new Decimal(200),
                },
            },
        ];

        const strategy = new SellRebalanceStrategy(portfolioData);
        const { results } = strategy.calculate();

        expect(results).toHaveLength(2);

        const overweight = results.find((s) => s.id === 's1');
        const underweight = results.find((s) => s.id === 's2');

        // Overweight stock should have positive adjustment (currentAmount > targetAmount)
        expect(overweight!.adjustment.gt(0)).toBe(true);
        // Underweight stock should have negative adjustment (currentAmount < targetAmount)
        expect(underweight!.adjustment.lt(0)).toBe(true);
    });

    it('should not sell underweight stocks', () => {
        const portfolioData: CalculatedStock[] = [
            {
                id: 's1',
                name: 'Underweight Stock',
                ticker: 'A',
                targetRatio: new Decimal(60), // Target 60%, has 30%
                currentPrice: new Decimal(100),
                quantity: new Decimal(3),
                currentAmount: new Decimal(300),
                totalValue: new Decimal(1000),
                currentRatio: new Decimal(30),
                targetAmount: new Decimal(600),
                diffAmount: new Decimal(-300),
                diffRatio: new Decimal(-30),
                finalAmount: new Decimal(300),
                finalRatio: new Decimal(30),
                finalBuyAmount: new Decimal(0),
                finalBuyQuantity: new Decimal(0),
                fixedBuyAmount: new Decimal(0),
                calculated: {
                    currentAmount: new Decimal(300),
                },
            },
            {
                id: 's2',
                name: 'Overweight Stock',
                ticker: 'B',
                targetRatio: new Decimal(40), // Target 40%, has 70%
                currentPrice: new Decimal(100),
                quantity: new Decimal(7),
                currentAmount: new Decimal(700),
                totalValue: new Decimal(1000),
                currentRatio: new Decimal(70),
                targetAmount: new Decimal(400),
                diffAmount: new Decimal(300),
                diffRatio: new Decimal(30),
                finalAmount: new Decimal(700),
                finalRatio: new Decimal(70),
                finalBuyAmount: new Decimal(0),
                finalBuyQuantity: new Decimal(0),
                fixedBuyAmount: new Decimal(0),
                calculated: {
                    currentAmount: new Decimal(700),
                },
            },
        ];

        const strategy = new SellRebalanceStrategy(portfolioData);
        const { results } = strategy.calculate();

        expect(results).toHaveLength(2);

        const underweight = results.find((s) => s.id === 's1');
        const overweight = results.find((s) => s.id === 's2');

        // Underweight stock should have negative adjustment (need to buy)
        expect(underweight!.adjustment.lt(0)).toBe(true);
        // Overweight stock should have positive adjustment (need to sell)
        expect(overweight!.adjustment.gt(0)).toBe(true);
    });
});

describe('SimpleRatioStrategy', () => {
    it('should calculate based on target ratios only', () => {
        const portfolioData: CalculatedStock[] = [
            {
                id: 's1',
                name: 'Stock A',
                ticker: 'A',
                targetRatio: new Decimal(30),
                currentPrice: new Decimal(100),
                quantity: new Decimal(0),
                currentAmount: new Decimal(0),
                totalValue: new Decimal(0),
                currentRatio: new Decimal(0),
                targetAmount: new Decimal(0),
                diffAmount: new Decimal(0),
                diffRatio: new Decimal(0),
                finalAmount: new Decimal(0),
                finalRatio: new Decimal(0),
                finalBuyAmount: new Decimal(0),
                finalBuyQuantity: new Decimal(0),
                fixedBuyAmount: new Decimal(0),
            },
            {
                id: 's2',
                name: 'Stock B',
                ticker: 'B',
                targetRatio: new Decimal(70),
                currentPrice: new Decimal(50),
                quantity: new Decimal(0),
                currentAmount: new Decimal(0),
                totalValue: new Decimal(0),
                currentRatio: new Decimal(0),
                targetAmount: new Decimal(0),
                diffAmount: new Decimal(0),
                diffRatio: new Decimal(0),
                finalAmount: new Decimal(0),
                finalRatio: new Decimal(0),
                finalBuyAmount: new Decimal(0),
                finalBuyQuantity: new Decimal(0),
                fixedBuyAmount: new Decimal(0),
            },
        ];

        const additionalInvestment = new Decimal(1000);
        const strategy = new SimpleRatioStrategy(portfolioData, additionalInvestment);
        const { results } = strategy.calculate();

        expect(results).toHaveLength(2);

        const stockA = results.find((s) => s.id === 's1');
        const stockB = results.find((s) => s.id === 's2');

        // Should maintain target ratios
        expect(stockA!.targetRatio.toString()).toBe('30');
        expect(stockB!.targetRatio.toString()).toBe('70');
    });

    it('should handle ratios not summing to 100%', () => {
        const portfolioData: CalculatedStock[] = [
            {
                id: 's1',
                name: 'Stock A',
                ticker: 'A',
                targetRatio: new Decimal(60), // Total = 150
                currentPrice: new Decimal(100),
                quantity: new Decimal(0),
                currentAmount: new Decimal(0),
                totalValue: new Decimal(0),
                currentRatio: new Decimal(0),
                targetAmount: new Decimal(0),
                diffAmount: new Decimal(0),
                diffRatio: new Decimal(0),
                finalAmount: new Decimal(0),
                finalRatio: new Decimal(0),
                finalBuyAmount: new Decimal(0),
                finalBuyQuantity: new Decimal(0),
                fixedBuyAmount: new Decimal(0),
            },
            {
                id: 's2',
                name: 'Stock B',
                ticker: 'B',
                targetRatio: new Decimal(90), // Total = 150
                currentPrice: new Decimal(50),
                quantity: new Decimal(0),
                currentAmount: new Decimal(0),
                totalValue: new Decimal(0),
                currentRatio: new Decimal(0),
                targetAmount: new Decimal(0),
                diffAmount: new Decimal(0),
                diffRatio: new Decimal(0),
                finalAmount: new Decimal(0),
                finalRatio: new Decimal(0),
                finalBuyAmount: new Decimal(0),
                finalBuyQuantity: new Decimal(0),
                fixedBuyAmount: new Decimal(0),
            },
        ];

        const additionalInvestment = new Decimal(1000);
        const strategy = new SimpleRatioStrategy(portfolioData, additionalInvestment);
        const { results } = strategy.calculate();

        const stockA = results.find((s) => s.id === 's1');
        const stockB = results.find((s) => s.id === 's2');

        // Target ratios should be preserved (not normalized in output)
        expect(stockA!.targetRatio.toString()).toBe('60');
        expect(stockB!.targetRatio.toString()).toBe('90');

        // But buy amounts should be allocated proportionally
        // With 1000 total investment:
        // Stock A: 1000 * (60/150) = 400
        // Stock B: 1000 * (90/150) = 600
        expect(stockA!.finalBuyAmount.toNumber()).toBeCloseTo(400, 0);
        expect(stockB!.finalBuyAmount.toNumber()).toBeCloseTo(600, 0);
    });
});