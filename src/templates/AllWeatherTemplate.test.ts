// src/templates/AllWeatherTemplate.test.ts
import { describe, it, expect } from 'vitest';
import { AllWeatherTemplate } from './AllWeatherTemplate';
import type { Stock } from '../types';
import Decimal from 'decimal.js';

describe('AllWeatherTemplate', () => {
    const createStock = (id: string, name: string, sector: string): Stock => ({
        id,
        name,
        ticker: id.toUpperCase(),
        sector,
        targetRatio: new Decimal(0),
        currentPrice: new Decimal(100),
        isFixedBuyEnabled: false,
        fixedBuyAmount: new Decimal(0),
        transactions: [],
    });

    describe('metadata', () => {
        it('should have correct name', () => {
            const template = new AllWeatherTemplate();
            expect(template.name).toBe('all-weather');
        });

        it('should have description', () => {
            const template = new AllWeatherTemplate();
            expect(template.description).toBeTruthy();
        });
    });

    describe('apply', () => {
        it('should allocate 30% to equity, 55% to bonds, 15% to commodities', () => {
            const template = new AllWeatherTemplate();
            const stocks = [
                createStock('s-1', 'Equity Fund', 'Stock'),
                createStock('s-2', 'Bond Fund', 'Bond'),
                createStock('s-3', 'Gold Fund', 'Gold'),
            ];

            template.apply(stocks);

            expect(stocks[0].targetRatio.toNumber()).toBe(30);
            expect(stocks[1].targetRatio.toNumber()).toBe(55);
            expect(stocks[2].targetRatio.toNumber()).toBe(15);
        });

        it('should split equity allocation among multiple equity stocks', () => {
            const template = new AllWeatherTemplate();
            const stocks = [
                createStock('s-1', 'Stock 1', 'Stock'),
                createStock('s-2', 'Stock 2', 'Equity'),
                createStock('s-3', 'Stock 3', 'Tech'),
                createStock('s-4', 'Bond Fund', 'Bond'),
                createStock('s-5', 'Gold', 'Commodity'),
            ];

            template.apply(stocks);

            // 3 equity stocks split 30%
            expect(stocks[0].targetRatio.toNumber()).toBe(10);
            expect(stocks[1].targetRatio.toNumber()).toBe(10);
            expect(stocks[2].targetRatio.toNumber()).toBe(10);
            // 1 bond stock gets 55%
            expect(stocks[3].targetRatio.toNumber()).toBe(55);
            // 1 commodity stock gets 15%
            expect(stocks[4].targetRatio.toNumber()).toBe(15);
        });

        it('should recognize commodity keywords in name', () => {
            const template = new AllWeatherTemplate();
            const stocks = [
                createStock('s-1', 'Stock Fund', 'Stock'),
                createStock('s-2', 'Bond Fund', 'Bond'),
                createStock('s-3', 'Gold ETF', 'Other'), // Gold in name, not sector
                createStock('s-4', 'Metal Fund', 'Other'), // Metal in name
            ];

            template.apply(stocks);

            expect(stocks[0].targetRatio.toNumber()).toBe(30);
            expect(stocks[1].targetRatio.toNumber()).toBe(55);
            // 2 commodity stocks split 15%
            expect(stocks[2].targetRatio.toNumber()).toBe(7.5);
            expect(stocks[3].targetRatio.toNumber()).toBe(7.5);
        });

        it('should handle Korean keyword "금"', () => {
            const template = new AllWeatherTemplate();
            const stocks = [
                createStock('s-1', 'Stock Fund', 'Stock'),
                createStock('s-2', 'Bond Fund', 'Bond'),
                createStock('s-3', '금 ETF', 'Other'),
            ];

            template.apply(stocks);

            expect(stocks[2].targetRatio.toNumber()).toBe(15);
        });

        it('should apply equal weight when no sectors match', () => {
            const template = new AllWeatherTemplate();
            const stocks = [
                createStock('s-1', 'REIT', 'Real Estate'),
                createStock('s-2', 'Cash', 'Money Market'),
            ];

            template.apply(stocks);

            expect(stocks[0].targetRatio.toNumber()).toBe(50);
            expect(stocks[1].targetRatio.toNumber()).toBe(50);
        });

        it('should handle empty array', () => {
            const template = new AllWeatherTemplate();
            const stocks: Stock[] = [];

            template.apply(stocks);

            expect(stocks).toEqual([]);
        });

        it('should handle multiple bonds splitting 55%', () => {
            const template = new AllWeatherTemplate();
            const stocks = [
                createStock('s-1', 'Stock', 'Stock'),
                createStock('s-2', 'Bond 1', 'Bond'),
                createStock('s-3', 'Bond 2', 'Treasury'),
                createStock('s-4', 'Bond 3', 'Fixed'),
            ];

            template.apply(stocks);

            expect(stocks[0].targetRatio.toNumber()).toBe(30);
            // 3 bonds split 55%
            const bondRatio = 55 / 3;
            expect(stocks[1].targetRatio.toNumber()).toBeCloseTo(bondRatio, 5);
            expect(stocks[2].targetRatio.toNumber()).toBeCloseTo(bondRatio, 5);
            expect(stocks[3].targetRatio.toNumber()).toBeCloseTo(bondRatio, 5);
        });

        it('should be case-insensitive', () => {
            const template = new AllWeatherTemplate();
            const stocks = [
                createStock('s-1', 'Stock', 'STOCK'),
                createStock('s-2', 'Bond', 'BOND'),
                createStock('s-3', 'GOLD ETF', 'COMMODITY'),
            ];

            template.apply(stocks);

            expect(stocks[0].targetRatio.toNumber()).toBe(30);
            expect(stocks[1].targetRatio.toNumber()).toBe(55);
            expect(stocks[2].targetRatio.toNumber()).toBe(15);
        });
    });
});
