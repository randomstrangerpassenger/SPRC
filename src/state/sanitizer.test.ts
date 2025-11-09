// src/state/sanitizer.test.ts
import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import {
    sanitizeString,
    sanitizePortfolioName,
    sanitizeStockName,
    sanitizeStockTicker,
    sanitizeStockSector,
    sanitizePortfolio,
} from './sanitizer';
import type { Portfolio, Stock } from '../types';

describe('sanitizer', () => {
    describe('sanitizeString', () => {
        it('should return clean string as-is', () => {
            const result = sanitizeString('Hello World');
            expect(result).toBe('Hello World');
        });

        it('should remove HTML tags', () => {
            const result = sanitizeString('<script>alert("XSS")</script>Hello');
            expect(result).not.toContain('<script>');
            expect(result).not.toContain('</script>');
        });

        it('should remove malicious attributes', () => {
            const result = sanitizeString('<img src=x onerror="alert(1)">');
            expect(result).not.toContain('onerror');
        });

        it('should trim whitespace', () => {
            const result = sanitizeString('  Hello  ');
            expect(result).toBe('Hello');
        });

        it('should return fallback for empty string', () => {
            const result = sanitizeString('', 'default');
            expect(result).toBe('default');
        });

        it('should return fallback for null', () => {
            const result = sanitizeString(null, 'default');
            expect(result).toBe('default');
        });

        it('should return fallback for undefined', () => {
            const result = sanitizeString(undefined, 'default');
            expect(result).toBe('default');
        });

        it('should convert non-string values to string', () => {
            const result = sanitizeString(123 as any);
            expect(result).toBe('123');
        });
    });

    describe('sanitizePortfolioName', () => {
        it('should return sanitized portfolio name', () => {
            const portfolio = {
                id: 'p-1',
                name: 'My Portfolio',
                settings: { mainMode: 'simple' as const, currentCurrency: 'krw' as const, exchangeRate: 1300 },
                portfolioData: [],
            };

            const result = sanitizePortfolioName(portfolio);
            expect(result).toBe('My Portfolio');
        });

        it('should remove XSS from portfolio name', () => {
            const portfolio = {
                id: 'p-1',
                name: '<script>alert(1)</script>Portfolio',
                settings: { mainMode: 'simple' as const, currentCurrency: 'krw' as const, exchangeRate: 1300 },
                portfolioData: [],
            };

            const result = sanitizePortfolioName(portfolio);
            expect(result).not.toContain('<script>');
        });

        it('should return fallback for empty name', () => {
            const portfolio = {
                id: 'p-1',
                name: '',
                settings: { mainMode: 'simple' as const, currentCurrency: 'krw' as const, exchangeRate: 1300 },
                portfolioData: [],
            };

            const result = sanitizePortfolioName(portfolio);
            expect(result).toBeTruthy(); // Should return default from i18n
        });
    });

    describe('sanitizeStockName', () => {
        it('should return sanitized stock name', () => {
            const stock = {
                id: 's-1',
                name: 'Apple Inc.',
                ticker: 'AAPL',
                sector: 'Technology',
                targetRatio: new Decimal(10),
                currentPrice: new Decimal(150),
                isFixedBuyEnabled: false,
                fixedBuyAmount: new Decimal(0),
                transactions: [],
            };

            const result = sanitizeStockName(stock);
            expect(result).toBe('Apple Inc.');
        });

        it('should remove XSS from stock name', () => {
            const stock = {
                id: 's-1',
                name: '<img src=x onerror="alert(1)">Stock',
                ticker: 'TEST',
                sector: 'Tech',
                targetRatio: new Decimal(10),
                currentPrice: new Decimal(100),
                isFixedBuyEnabled: false,
                fixedBuyAmount: new Decimal(0),
                transactions: [],
            };

            const result = sanitizeStockName(stock);
            expect(result).not.toContain('onerror');
        });

        it('should use index-based fallback for empty name', () => {
            const stock = {
                id: 's-1',
                name: '',
                ticker: 'TEST',
                sector: 'Tech',
                targetRatio: new Decimal(10),
                currentPrice: new Decimal(100),
                isFixedBuyEnabled: false,
                fixedBuyAmount: new Decimal(0),
                transactions: [],
            };

            const result = sanitizeStockName(stock, 5);
            expect(result).toContain('6'); // index + 1
        });
    });

    describe('sanitizeStockTicker', () => {
        it('should return uppercase ticker', () => {
            const result = sanitizeStockTicker('aapl');
            expect(result).toBe('AAPL');
        });

        it('should remove XSS from ticker', () => {
            const result = sanitizeStockTicker('<script>XSS</script>');
            expect(result).not.toContain('<script>');
        });

        it('should return empty string for invalid input', () => {
            const result = sanitizeStockTicker(null);
            expect(result).toBe('');
        });
    });

    describe('sanitizeStockSector', () => {
        it('should return sanitized sector', () => {
            const result = sanitizeStockSector('Technology');
            expect(result).toBe('Technology');
        });

        it('should remove XSS from sector', () => {
            const result = sanitizeStockSector('<b>Tech</b>');
            expect(result).not.toContain('<b>');
        });

        it('should return empty string for invalid input', () => {
            const result = sanitizeStockSector(undefined);
            expect(result).toBe('');
        });
    });

    describe('sanitizePortfolio', () => {
        it('should sanitize entire portfolio', () => {
            const portfolio: Portfolio = {
                id: 'p-1',
                name: '<script>XSS</script>Portfolio',
                settings: {
                    mainMode: 'simple',
                    currentCurrency: 'krw',
                    exchangeRate: 1300,
                    rebalancingTolerance: 5,
                    tradingFeeRate: 0.3,
                    taxRate: 15,
                },
                portfolioData: [
                    {
                        id: 's-1',
                        name: '<img src=x onerror="alert(1)">Stock',
                        ticker: 'test',
                        sector: '<b>Tech</b>',
                        targetRatio: new Decimal(10),
                        currentPrice: new Decimal(100),
                        isFixedBuyEnabled: false,
                        fixedBuyAmount: new Decimal(0),
                        transactions: [],
                    },
                ],
            };

            const result = sanitizePortfolio(portfolio);

            expect(result.name).not.toContain('<script>');
            expect(result.portfolioData[0].name).not.toContain('onerror');
            expect(result.portfolioData[0].ticker).toBe('TEST');
            expect(result.portfolioData[0].sector).not.toContain('<b>');
        });

        it('should preserve portfolio structure', () => {
            const portfolio: Portfolio = {
                id: 'p-1',
                name: 'Clean Portfolio',
                settings: {
                    mainMode: 'simple',
                    currentCurrency: 'usd',
                    exchangeRate: 1,
                    rebalancingTolerance: 3,
                    tradingFeeRate: 0.5,
                    taxRate: 20,
                },
                portfolioData: [],
            };

            const result = sanitizePortfolio(portfolio);

            expect(result.id).toBe('p-1');
            expect(result.settings.mainMode).toBe('simple');
            expect(result.settings.currentCurrency).toBe('usd');
            expect(result.settings.exchangeRate).toBe(1);
            expect(result.settings.rebalancingTolerance).toBe(3);
            expect(result.portfolioData).toEqual([]);
        });
    });
});