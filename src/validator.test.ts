// src/validator.test.ts
import { describe, it, expect, vi } from 'vitest';
import { Validator } from './validator';
import Decimal from 'decimal.js';
import { CONFIG } from './constants';
import type { Stock, CalculatedStock } from './types';

// --- ⬇️ Mock i18n BEFORE importing validator.js ⬇️ ---
vi.mock('./i18n', () => ({
    t: vi.fn((key: string, replacements?: Record<string, string>) => {
        // Provide Korean messages needed for the tests
        if (key === 'validation.negativeNumber') return '음수는 입력할 수 없습니다.';
        if (key === 'validation.invalidNumber') return '유효한 숫자가 아닙니다.';
        if (key === 'validation.futureDate') return '미래 날짜는 입력할 수 없습니다.';
        if (key === 'validation.quantityZero') return '수량은 0보다 커야 합니다.';
        if (key === 'validation.priceZero') return '단가는 0보다 커야 합니다.';
        if (key === 'validation.invalidDate') return '유효한 날짜를 입력해주세요.';
        // Add messages for validateForCalculation
        if (key === 'validation.investmentAmountZero')
            return '- 추가 투자 금액을 0보다 크게 입력해주세요.';
        if (key === 'validation.currentPriceZero')
            return `- '${replacements?.name}'의 현재가는 0보다 커야 합니다.`;
        // Add other messages used in validator.js if needed by tests
        return key; // Fallback
    }),
}));
// --- ⬆️ Mock i18n ⬆️ ---

describe('Validator.validateNumericInput', () => {
    it('유효한 숫자 문자열을 올바르게 처리해야 합니다.', () => {
        expect(Validator.validateNumericInput('123.45')).toEqual({ isValid: true, value: 123.45 });
        expect(Validator.validateNumericInput('0')).toEqual({ isValid: true, value: 0 });
    });

    it('음수를 유효하지 않다고 처리해야 합니다.', () => {
        expect(Validator.validateNumericInput(-10)).toEqual({
            isValid: false,
            message: '음수는 입력할 수 없습니다.',
        });
    });

    it('숫자가 아닌 문자열을 유효하지 않다고 처리해야 합니다.', () => {
        expect(Validator.validateNumericInput('abc')).toEqual({
            isValid: false,
            message: '유효한 숫자가 아닙니다.',
        });
        expect(Validator.validateNumericInput('')).toEqual({
            isValid: false,
            message: '유효한 숫자가 아닙니다.',
        });
        expect(Validator.validateNumericInput(null)).toEqual({
            isValid: false,
            message: '유효한 숫자가 아닙니다.',
        });
        expect(Validator.validateNumericInput(undefined)).toEqual({
            isValid: false,
            message: '유효한 숫자가 아닙니다.',
        });
    });
});

describe('Validator.validateTransaction', () => {
    const validTx = { type: 'buy' as const, date: '2023-10-26', quantity: 10, price: 50 };

    it('유효한 거래 데이터를 통과시켜야 합니다.', () => {
        expect(Validator.validateTransaction(validTx).isValid).toBe(true);
    });

    it('미래 날짜를 거부해야 합니다.', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
        const futureTx = { ...validTx, date: futureDate.toISOString().slice(0, 10) };
        expect(Validator.validateTransaction(futureTx).isValid).toBe(false);
        expect(Validator.validateTransaction(futureTx).message).toBe(
            '미래 날짜는 입력할 수 없습니다.'
        );
    });

    it('잘못된 날짜 형식을 거부해야 합니다.', () => {
        const invalidDateTx = { ...validTx, date: 'invalid-date' };
        expect(Validator.validateTransaction(invalidDateTx).isValid).toBe(false);
        expect(Validator.validateTransaction(invalidDateTx).message).toBe(
            '유효한 날짜를 입력해주세요.'
        );
    });

    it('수량이 0이거나 음수일 때 거부해야 합니다.', () => {
        const zeroQtyTx = { ...validTx, quantity: 0 };
        const negQtyTx = { ...validTx, quantity: -5 };
        expect(Validator.validateTransaction(zeroQtyTx).isValid).toBe(false);
        expect(Validator.validateTransaction(zeroQtyTx).message).toBe('수량은 0보다 커야 합니다.');
        expect(Validator.validateTransaction(negQtyTx).isValid).toBe(false);
        expect(Validator.validateTransaction(negQtyTx).message).toBe('음수는 입력할 수 없습니다.');
    });

    it('단가가 0이거나 음수일 때 거부해야 합니다.', () => {
        const zeroPriceTx = { ...validTx, price: 0 };
        const negPriceTx = { ...validTx, price: -50 };
        expect(Validator.validateTransaction(zeroPriceTx).isValid).toBe(false);
        expect(Validator.validateTransaction(zeroPriceTx).message).toBe(
            '단가는 0보다 커야 합니다.'
        );
        expect(Validator.validateTransaction(negPriceTx).isValid).toBe(false);
        expect(Validator.validateTransaction(negPriceTx).message).toBe(
            '음수는 입력할 수 없습니다.'
        );
    });
});

describe('Validator.validateForCalculation', () => {
    const validPortfolioData: CalculatedStock[] = [
        {
            id: 's1',
            name: 'Stock A',
            ticker: 'AAA',
            sector: 'Tech',
            targetRatio: 50,
            currentPrice: 100,
            isFixedBuyEnabled: false,
            fixedBuyAmount: 0,
            transactions: [],
            calculated: {
                currentAmount: new Decimal(1000),
                quantity: new Decimal(10),
                avgBuyPrice: new Decimal(100),
                profitLoss: new Decimal(0),
                profitLossRate: new Decimal(0),
            },
        },
        {
            id: 's2',
            name: 'Stock B',
            ticker: 'BBB',
            sector: 'Finance',
            targetRatio: 50,
            currentPrice: 200,
            isFixedBuyEnabled: false,
            fixedBuyAmount: 0,
            transactions: [],
            calculated: {
                currentAmount: new Decimal(2000),
                quantity: new Decimal(10),
                avgBuyPrice: new Decimal(200),
                profitLoss: new Decimal(0),
                profitLossRate: new Decimal(0),
            },
        },
    ];

    it('유효한 추가 매수 입력값을 통과시켜야 합니다.', () => {
        const inputs = {
            mainMode: 'add' as const,
            portfolioData: validPortfolioData,
            additionalInvestment: new Decimal(500),
        };
        expect(Validator.validateForCalculation(inputs)).toEqual([]);
    });

    it('추가 매수 모드에서 추가 투자금이 0 이하일 때 오류를 반환해야 합니다.', () => {
        const inputs = {
            mainMode: 'add' as const,
            portfolioData: validPortfolioData,
            additionalInvestment: new Decimal(0),
        };
        const errors = Validator.validateForCalculation(inputs);
        expect(errors.length).toBeGreaterThan(0);
        expect(
            errors.some((e) => e.message === '- 추가 투자 금액을 0보다 크게 입력해주세요.')
        ).toBe(true);
    });

    it('현재가가 0 이하인 주식이 있을 때 오류를 반환해야 합니다.', () => {
        const portfolioWithZeroPrice: CalculatedStock[] = [
            { ...validPortfolioData[0] },
            {
                ...validPortfolioData[1],
                currentPrice: 0,
                calculated: {
                    currentAmount: new Decimal(0),
                    quantity: new Decimal(10),
                    avgBuyPrice: new Decimal(200),
                    profitLoss: new Decimal(-2000),
                    profitLossRate: new Decimal(-100),
                },
            },
        ];
        const inputs = {
            mainMode: 'add' as const,
            portfolioData: portfolioWithZeroPrice,
            additionalInvestment: new Decimal(500),
        };
        const errors = Validator.validateForCalculation(inputs);
        expect(errors.length).toBeGreaterThan(0);
        expect(
            errors.some(
                (e) => e.stockId === 's2' && e.message.includes('현재가는 0보다 커야 합니다.')
            )
        ).toBe(true);
    });
});

describe('Validator.isDataStructureValid', () => {
    it('유효한 데이터 구조를 통과시켜야 합니다.', () => {
        const validData = {
            meta: { activePortfolioId: 'p1', version: CONFIG.DATA_VERSION },
            portfolios: {
                p1: {
                    id: 'p1',
                    name: 'Valid',
                    settings: {
                        mainMode: 'add' as const,
                        currentCurrency: 'krw' as const,
                        exchangeRate: 1300,
                    },
                    portfolioData: [],
                },
            },
        };
        expect(Validator.isDataStructureValid(validData)).toBe(true);
    });

    it('meta가 없으면 실패해야 합니다.', () => {
        const invalidData = { portfolios: {} };
        expect(Validator.isDataStructureValid(invalidData)).toBe(false);
    });

    it('portfolios가 없으면 실패해야 합니다.', () => {
        const invalidData = { meta: {} };
        expect(Validator.isDataStructureValid(invalidData)).toBe(false);
    });

    it('portfolio 객체에 필수 속성이 없으면 실패해야 합니다.', () => {
        const invalidData = {
            meta: { activePortfolioId: 'p1', version: CONFIG.DATA_VERSION },
            portfolios: {
                p1: { id: 'p1' },
            },
        };
        expect(Validator.isDataStructureValid(invalidData)).toBe(false);
    });

    it('settings 객체 형식이 아니면 실패해야 합니다.', () => {
        const invalidData = {
            meta: { activePortfolioId: 'p1', version: CONFIG.DATA_VERSION },
            portfolios: {
                p1: { id: 'p1', name: 'Invalid Settings', settings: null, portfolioData: [] },
            },
        };
        expect(Validator.isDataStructureValid(invalidData)).toBe(false);
    });

    it('portfolioData가 배열이 아니면 실패해야 합니다.', () => {
        const invalidData = {
            meta: { activePortfolioId: 'p1', version: CONFIG.DATA_VERSION },
            portfolios: {
                p1: { id: 'p1', name: 'Invalid Array', settings: {}, portfolioData: {} },
            },
        };
        expect(Validator.isDataStructureValid(invalidData)).toBe(false);
    });
});
