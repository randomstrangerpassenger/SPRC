// src/state/helpers.test.ts
import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import {
    createDefaultPortfolio,
    createDefaultStock,
    validateDecimalValue,
} from './helpers';

describe('helpers', () => {
    describe('createDefaultPortfolio', () => {
        it('should create a portfolio with default name', () => {
            const portfolio = createDefaultPortfolio('p-1');

            expect(portfolio.id).toBe('p-1');
            expect(portfolio.name).toBeTruthy();
            expect(portfolio.settings).toBeDefined();
            expect(portfolio.settings.mainMode).toBe('simple');
            expect(portfolio.settings.currentCurrency).toBe('krw');
            expect(portfolio.settings.rebalancingTolerance).toBe(5);
            expect(portfolio.settings.tradingFeeRate).toBe(0.3);
            expect(portfolio.settings.taxRate).toBe(15);
            expect(portfolio.portfolioData).toHaveLength(1);
        });

        it('should create a portfolio with custom name', () => {
            const portfolio = createDefaultPortfolio('p-2', 'My Portfolio');

            expect(portfolio.id).toBe('p-2');
            expect(portfolio.name).toBe('My Portfolio');
        });

        it('should include one default stock', () => {
            const portfolio = createDefaultPortfolio('p-3');
            const stock = portfolio.portfolioData[0];

            expect(stock).toBeDefined();
            expect(stock.id).toMatch(/^s-/);
            expect(stock.transactions).toEqual([]);
        });
    });

    describe('createDefaultStock', () => {
        it('should create a stock with default values', () => {
            const stock = createDefaultStock();

            expect(stock.id).toMatch(/^s-/);
            expect(stock.name).toBeTruthy();
            expect(stock.ticker).toBe('');
            expect(stock.sector).toBe('');
            expect(stock.targetRatio).toBeInstanceOf(Decimal);
            expect(stock.targetRatio.toNumber()).toBe(0);
            expect(stock.currentPrice).toBeInstanceOf(Decimal);
            expect(stock.currentPrice.toNumber()).toBe(0);
            expect(stock.isFixedBuyEnabled).toBe(false);
            expect(stock.fixedBuyAmount).toBeInstanceOf(Decimal);
            expect(stock.fixedBuyAmount.toNumber()).toBe(0);
            expect(stock.transactions).toEqual([]);
            expect(stock.manualAmount).toBe(0);
        });

        it('should generate unique IDs', () => {
            const stock1 = createDefaultStock();
            const stock2 = createDefaultStock();

            expect(stock1.id).not.toBe(stock2.id);
        });
    });

    describe('validateDecimalValue', () => {
        it('should convert valid number to Decimal', () => {
            const result = validateDecimalValue(100);

            expect(result).toBeInstanceOf(Decimal);
            expect(result.toNumber()).toBe(100);
        });

        it('should convert valid string to Decimal', () => {
            const result = validateDecimalValue('250.5');

            expect(result).toBeInstanceOf(Decimal);
            expect(result.toNumber()).toBe(250.5);
        });

        it('should return default value for null', () => {
            const defaultValue = new Decimal(10);
            const result = validateDecimalValue(null, defaultValue);

            expect(result.toNumber()).toBe(10);
        });

        it('should return default value for undefined', () => {
            const defaultValue = new Decimal(20);
            const result = validateDecimalValue(undefined, defaultValue);

            expect(result.toNumber()).toBe(20);
        });

        it('should return default value for NaN', () => {
            const defaultValue = new Decimal(30);
            const result = validateDecimalValue(NaN, defaultValue);

            expect(result.toNumber()).toBe(30);
        });

        it('should return default value for invalid string', () => {
            const defaultValue = new Decimal(40);
            const result = validateDecimalValue('invalid', defaultValue);

            expect(result.toNumber()).toBe(40);
        });

        it('should use Decimal(0) as default when not specified', () => {
            const result = validateDecimalValue(NaN);

            expect(result.toNumber()).toBe(0);
        });
    });
});