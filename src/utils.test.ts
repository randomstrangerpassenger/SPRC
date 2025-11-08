// src/utils.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Decimal from 'decimal.js';
import {
    escapeHTML,
    getRatioSum,
    formatCurrency,
    debounce,
    generateId,
    toDecimal,
    ensureDecimal,
} from './utils';
import type { Stock } from './types';

describe('utils', () => {
    describe('escapeHTML', () => {
        it('should escape HTML special characters', () => {
            expect(escapeHTML('<script>alert("xss")</script>')).toBe(
                '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
            );
        });

        it('should escape ampersands', () => {
            expect(escapeHTML('A & B')).toBe('A &amp; B');
        });

        it('should escape quotes and apostrophes', () => {
            expect(escapeHTML(`"Hello" & 'World'`)).toBe(
                '&quot;Hello&quot; &amp; &#039;World&#039;'
            );
        });

        it('should handle null and undefined', () => {
            expect(escapeHTML(null)).toBe('');
            expect(escapeHTML(undefined)).toBe('');
        });

        it('should handle numbers', () => {
            expect(escapeHTML(123)).toBe('123');
            expect(escapeHTML(0)).toBe('0');
        });

        it('should handle empty string', () => {
            expect(escapeHTML('')).toBe('');
        });
    });

    describe('getRatioSum', () => {
        it('should calculate sum of target ratios', () => {
            const portfolio: Stock[] = [
                {
                    id: '1',
                    name: 'Stock A',
                    ticker: 'A',
                    targetRatio: 30,
                    currentPrice: 100,
                    quantity: 10,
                },
                {
                    id: '2',
                    name: 'Stock B',
                    ticker: 'B',
                    targetRatio: 70,
                    currentPrice: 50,
                    quantity: 20,
                },
            ];

            const sum = getRatioSum(portfolio);
            expect(sum.toString()).toBe('100');
        });

        it('should handle empty portfolio', () => {
            const sum = getRatioSum([]);
            expect(sum.toString()).toBe('0');
        });

        it('should handle stocks with zero ratios', () => {
            const portfolio: Stock[] = [
                {
                    id: '1',
                    name: 'Stock A',
                    ticker: 'A',
                    targetRatio: 0,
                    currentPrice: 100,
                    quantity: 10,
                },
            ];

            const sum = getRatioSum(portfolio);
            expect(sum.toString()).toBe('0');
        });

        it('should handle non-array input', () => {
            const sum = getRatioSum(null as any);
            expect(sum.toString()).toBe('0');
        });
    });

    describe('formatCurrency', () => {
        it('should format KRW currency', () => {
            const result = formatCurrency(1234567, 'krw');
            expect(result).toContain('1,234,567'); // Locale-dependent formatting
        });

        it('should format USD currency', () => {
            const result = formatCurrency(1234.56, 'usd');
            expect(result).toContain('1,234');
        });

        it('should handle Decimal input', () => {
            const result = formatCurrency(new Decimal(1000), 'krw');
            expect(result).toContain('1,000');
        });

        it('should handle string input', () => {
            const result = formatCurrency('5000', 'krw');
            expect(result).toContain('5,000');
        });

        it('should handle null and undefined', () => {
            expect(formatCurrency(null, 'krw')).toBe('₩0');
            expect(formatCurrency(undefined, 'usd')).toBe('$0.00');
        });
    });

    describe('debounce', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('should delay function execution', () => {
            const fn = vi.fn();
            const debouncedFn = debounce(fn, 300);

            debouncedFn();
            expect(fn).not.toHaveBeenCalled();

            vi.advanceTimersByTime(299);
            expect(fn).not.toHaveBeenCalled();

            vi.advanceTimersByTime(1);
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should cancel previous calls', () => {
            const fn = vi.fn();
            const debouncedFn = debounce(fn, 300);

            debouncedFn();
            vi.advanceTimersByTime(100);
            debouncedFn();
            vi.advanceTimersByTime(100);
            debouncedFn();

            vi.advanceTimersByTime(300);
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should execute immediately when immediate=true', () => {
            const fn = vi.fn();
            const debouncedFn = debounce(fn, 300, true);

            debouncedFn();
            expect(fn).toHaveBeenCalledTimes(1);

            debouncedFn();
            expect(fn).toHaveBeenCalledTimes(1); // Still 1 because timer hasn't completed

            vi.advanceTimersByTime(300);
            debouncedFn();
            expect(fn).toHaveBeenCalledTimes(2); // Now 2 because timer completed
        });

        it('should pass arguments correctly', () => {
            const fn = vi.fn();
            const debouncedFn = debounce(fn, 300);

            debouncedFn('arg1', 'arg2', 123);
            vi.advanceTimersByTime(300);

            expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 123);
        });

        it('should preserve this context', () => {
            const obj = {
                value: 42,
                method: vi.fn(function (this: { value: number }) {
                    return this.value;
                }),
            };

            const debouncedMethod = debounce(obj.method, 300);
            debouncedMethod.call(obj);

            vi.advanceTimersByTime(300);
            expect(obj.method).toHaveBeenCalled();
        });
    });

    describe('generateId', () => {
        it('should generate unique IDs', () => {
            const id1 = generateId();
            const id2 = generateId();

            expect(id1).not.toBe(id2);
            expect(typeof id1).toBe('string');
            expect(typeof id2).toBe('string');
        });

        it('should generate non-empty IDs', () => {
            const id = generateId();
            expect(id.length).toBeGreaterThan(0);
        });

        it('should generate multiple unique IDs', () => {
            const ids = new Set();
            for (let i = 0; i < 100; i++) {
                ids.add(generateId());
            }
            expect(ids.size).toBe(100);
        });
    });

    describe('toDecimal', () => {
        it('should convert number to Decimal', () => {
            const result = toDecimal(123.45);
            expect(result instanceof Decimal).toBe(true);
            expect(result.toString()).toBe('123.45');
        });

        it('should return Decimal as-is', () => {
            const decimal = new Decimal(100);
            const result = toDecimal(decimal);
            expect(result).toBe(decimal);
        });

        it('should convert string to Decimal', () => {
            const result = toDecimal('456.78');
            expect(result instanceof Decimal).toBe(true);
            expect(result.toString()).toBe('456.78');
        });

        it('should handle null and undefined', () => {
            const resultNull = toDecimal(null);
            expect(resultNull.toString()).toBe('0');

            const resultUndefined = toDecimal(undefined);
            expect(resultUndefined.toString()).toBe('0');
        });

        it('should handle zero', () => {
            const result = toDecimal(0);
            expect(result.toString()).toBe('0');
        });
    });

    describe('ensureDecimal', () => {
        it('should return Decimal if already Decimal', () => {
            const decimal = new Decimal(100);
            const result = ensureDecimal(decimal);
            expect(result).toBe(decimal);
        });

        it('should throw TypeError for non-Decimal', () => {
            expect(() => ensureDecimal(123)).toThrow(TypeError);
            expect(() => ensureDecimal(123)).toThrow('Expected Decimal, got number');
        });

        it('should throw TypeError for string', () => {
            expect(() => ensureDecimal('123')).toThrow(TypeError);
            expect(() => ensureDecimal('123')).toThrow('Expected Decimal, got string');
        });

        it('should throw TypeError for null', () => {
            expect(() => ensureDecimal(null)).toThrow(TypeError);
            expect(() => ensureDecimal(null)).toThrow('Expected Decimal, got object');
        });

        it('should throw TypeError for undefined', () => {
            expect(() => ensureDecimal(undefined)).toThrow(TypeError);
            expect(() => ensureDecimal(undefined)).toThrow('Expected Decimal, got undefined');
        });
    });
});