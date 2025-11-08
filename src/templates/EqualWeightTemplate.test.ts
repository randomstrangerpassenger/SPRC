// src/templates/EqualWeightTemplate.test.ts
import { describe, it, expect } from 'vitest';
import { EqualWeightTemplate } from './EqualWeightTemplate';
import type { Stock } from '../types';
import Decimal from 'decimal.js';

describe('EqualWeightTemplate', () => {
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
            const template = new EqualWeightTemplate();
            expect(template.name).toBe('equal');
        });

        it('should have description', () => {
            const template = new EqualWeightTemplate();
            expect(template.description).toBeTruthy();
        });
    });

    describe('apply', () => {
        it('should distribute 100% equally among 2 stocks', () => {
            const template = new EqualWeightTemplate();
            const stocks = [
                createStock('s-1', 'Stock A', 'Tech'),
                createStock('s-2', 'Stock B', 'Finance'),
            ];

            template.apply(stocks);

            expect(stocks[0].targetRatio.toNumber()).toBe(50);
            expect(stocks[1].targetRatio.toNumber()).toBe(50);
        });

        it('should distribute 100% equally among 4 stocks', () => {
            const template = new EqualWeightTemplate();
            const stocks = [
                createStock('s-1', 'Stock A', 'Tech'),
                createStock('s-2', 'Stock B', 'Finance'),
                createStock('s-3', 'Stock C', 'Healthcare'),
                createStock('s-4', 'Stock D', 'Energy'),
            ];

            template.apply(stocks);

            stocks.forEach((stock) => {
                expect(stock.targetRatio.toNumber()).toBe(25);
            });
        });

        it('should handle odd number of stocks', () => {
            const template = new EqualWeightTemplate();
            const stocks = [
                createStock('s-1', 'Stock A', 'Tech'),
                createStock('s-2', 'Stock B', 'Finance'),
                createStock('s-3', 'Stock C', 'Healthcare'),
            ];

            template.apply(stocks);

            const total = stocks.reduce((sum, s) => sum + s.targetRatio.toNumber(), 0);
            expect(total).toBeCloseTo(100, 10); // Allow small floating point errors
        });

        it('should do nothing for empty array', () => {
            const template = new EqualWeightTemplate();
            const stocks: Stock[] = [];

            template.apply(stocks);

            expect(stocks).toEqual([]);
        });

        it('should handle single stock', () => {
            const template = new EqualWeightTemplate();
            const stocks = [createStock('s-1', 'Stock A', 'Tech')];

            template.apply(stocks);

            expect(stocks[0].targetRatio.toNumber()).toBe(100);
        });

        it('should ignore sector information', () => {
            const template = new EqualWeightTemplate();
            const stocks = [
                createStock('s-1', 'Tech Stock 1', 'Technology'),
                createStock('s-2', 'Tech Stock 2', 'Technology'),
                createStock('s-3', 'Bond', 'Bond'),
            ];

            template.apply(stocks);

            // All stocks should have equal weight regardless of sector
            stocks.forEach((stock) => {
                expect(stock.targetRatio.toNumber()).toBeCloseTo(33.333333, 5);
            });
        });
    });
});
