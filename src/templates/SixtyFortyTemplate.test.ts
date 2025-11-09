// src/templates/SixtyFortyTemplate.test.ts
import { describe, it, expect } from 'vitest';
import { SixtyFortyTemplate } from './SixtyFortyTemplate';
import type { Stock } from '../types';
import Decimal from 'decimal.js';

describe('SixtyFortyTemplate', () => {
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
            const template = new SixtyFortyTemplate();
            expect(template.name).toBe('60-40');
        });

        it('should have description', () => {
            const template = new SixtyFortyTemplate();
            expect(template.description).toBeTruthy();
        });
    });

    describe('apply', () => {
        it('should allocate 60% to equities and 40% to bonds', () => {
            const template = new SixtyFortyTemplate();
            const stocks = [
                createStock('s-1', 'Tech Stock 1', 'Technology'),
                createStock('s-2', 'Tech Stock 2', 'Tech'),
                createStock('s-3', 'Bond Fund', 'Bond'),
            ];

            template.apply(stocks);

            // 2 equity stocks should split 60%
            expect(stocks[0].targetRatio.toNumber()).toBe(30);
            expect(stocks[1].targetRatio.toNumber()).toBe(30);
            // 1 bond stock gets 40%
            expect(stocks[2].targetRatio.toNumber()).toBe(40);
        });

        it('should split equity allocation equally among equity stocks', () => {
            const template = new SixtyFortyTemplate();
            const stocks = [
                createStock('s-1', 'Equity 1', 'Stocks'),
                createStock('s-2', 'Equity 2', 'Equity'),
                createStock('s-3', 'Equity 3', 'Finance'),
                createStock('s-4', 'Bond Fund', 'Bond'),
            ];

            template.apply(stocks);

            // 3 equity stocks should split 60%
            expect(stocks[0].targetRatio.toNumber()).toBe(20);
            expect(stocks[1].targetRatio.toNumber()).toBe(20);
            expect(stocks[2].targetRatio.toNumber()).toBe(20);
            // 1 bond stock gets 40%
            expect(stocks[3].targetRatio.toNumber()).toBe(40);
        });

        it('should split bond allocation equally among bond stocks', () => {
            const template = new SixtyFortyTemplate();
            const stocks = [
                createStock('s-1', 'Equity Fund', 'Stock'),
                createStock('s-2', 'Bond 1', 'Bond'),
                createStock('s-3', 'Bond 2', 'Treasury'),
                createStock('s-4', 'Bond 3', 'Fixed Income'),
            ];

            template.apply(stocks);

            // 1 equity stock gets 60%
            expect(stocks[0].targetRatio.toNumber()).toBe(60);
            // 3 bond stocks should split 40%
            expect(stocks[1].targetRatio.toNumber()).toBeCloseTo(13.333333, 5);
            expect(stocks[2].targetRatio.toNumber()).toBeCloseTo(13.333333, 5);
            expect(stocks[3].targetRatio.toNumber()).toBeCloseTo(13.333333, 5);
        });

        it('should handle only equity stocks', () => {
            const template = new SixtyFortyTemplate();
            const stocks = [
                createStock('s-1', 'Tech 1', 'Technology'),
                createStock('s-2', 'Tech 2', 'Tech'),
            ];

            template.apply(stocks);

            // All stocks get 60% split
            expect(stocks[0].targetRatio.toNumber()).toBe(30);
            expect(stocks[1].targetRatio.toNumber()).toBe(30);
        });

        it('should handle only bond stocks', () => {
            const template = new SixtyFortyTemplate();
            const stocks = [
                createStock('s-1', 'Bond 1', 'Bond'),
                createStock('s-2', 'Bond 2', 'Bonds'),
            ];

            template.apply(stocks);

            // All stocks get 40% split
            expect(stocks[0].targetRatio.toNumber()).toBe(20);
            expect(stocks[1].targetRatio.toNumber()).toBe(20);
        });

        it('should apply equal weight when no equity or bond sectors found', () => {
            const template = new SixtyFortyTemplate();
            const stocks = [
                createStock('s-1', 'Real Estate', 'REIT'),
                createStock('s-2', 'Commodity', 'Gold'),
            ];

            template.apply(stocks);

            // Should fall back to equal weight
            expect(stocks[0].targetRatio.toNumber()).toBe(50);
            expect(stocks[1].targetRatio.toNumber()).toBe(50);
        });

        it('should recognize various equity sector keywords', () => {
            const template = new SixtyFortyTemplate();
            const stocks = [
                createStock('s-1', 'Stock 1', 'Stocks'),
                createStock('s-2', 'Stock 2', 'Equities'),
                createStock('s-3', 'Stock 3', 'Healthcare'),
                createStock('s-4', 'Stock 4', 'Consumer'),
                createStock('s-5', 'Bond', 'Bond'),
            ];

            template.apply(stocks);

            // 4 equity stocks should split 60%
            stocks.slice(0, 4).forEach((stock) => {
                expect(stock.targetRatio.toNumber()).toBe(15);
            });
            // 1 bond stock gets 40%
            expect(stocks[4].targetRatio.toNumber()).toBe(40);
        });

        it('should handle empty array', () => {
            const template = new SixtyFortyTemplate();
            const stocks: Stock[] = [];

            template.apply(stocks);

            expect(stocks).toEqual([]);
        });

        it('should be case-insensitive for sector matching', () => {
            const template = new SixtyFortyTemplate();
            const stocks = [
                createStock('s-1', 'Stock', 'TECHNOLOGY'),
                createStock('s-2', 'Bond', 'BOND'),
            ];

            template.apply(stocks);

            expect(stocks[0].targetRatio.toNumber()).toBe(60);
            expect(stocks[1].targetRatio.toNumber()).toBe(40);
        });
    });
});