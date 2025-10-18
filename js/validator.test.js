import { describe, it, expect } from 'vitest';
import { Validator } from './validator.js';
import Decimal from 'decimal.js';

describe('Validator.validateNumericInput', () => {
  it('유효한 숫자를 올바르게 처리해야 합니다.', () => {
    expect(Validator.validateNumericInput(123)).toEqual({ isValid: true, value: 123 });
  });

  it('문자열 형태의 숫자를 올바르게 변환해야 합니다.', () => {
    expect(Validator.validateNumericInput('45.6')).toEqual({ isValid: true, value: 45.6 });
  });

  it('빈 문자열을 0으로 처리해야 합니다.', () => {
    expect(Validator.validateNumericInput('')).toEqual({ isValid: true, value: 0 });
  });

  it('음수를 유효하지 않다고 처리해야 합니다.', () => {
    expect(Validator.validateNumericInput(-10)).toEqual({ isValid: false, message: '음수는 입력할 수 없습니다.' });
  });

  it('숫자가 아닌 문자열을 유효하지 않다고 처리해야 합니다.', () => {
    expect(Validator.validateNumericInput('abc')).toEqual({ isValid: false, message: '유효한 숫자가 아닙니다.' });
  });
});

describe('Validator.validateTransaction', () => {
  const today = new Date().toISOString().slice(0, 10);

  it('유효한 거래 데이터를 통과시켜야 합니다.', () => {
    const validTx = { date: today, quantity: 10, price: 100 };
    expect(Validator.validateTransaction(validTx).isValid).toBe(true);
  });

  it('미래 날짜를 거부해야 합니다.', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureTx = { date: futureDate.toISOString().slice(0, 10), quantity: 1, price: 100 };
    expect(Validator.validateTransaction(futureTx).isValid).toBe(false);
    expect(Validator.validateTransaction(futureTx).message).toBe('미래 날짜는 입력할 수 없습니다.');
  });

  it('잘못된 날짜 형식을 거부해야 합니다.', () => {
    const invalidTx = { date: '2023-99-99', quantity: 1, price: 100 };
    expect(Validator.validateTransaction(invalidTx).isValid).toBe(false);
  });

  it('0 또는 음수 수량을 거부해야 합니다.', () => {
    const zeroQtyTx = { date: today, quantity: 0, price: 100 };
    const negativeQtyTx = { date: today, quantity: -5, price: 100 };
    expect(Validator.validateTransaction(zeroQtyTx).isValid).toBe(false);
    expect(Validator.validateTransaction(negativeQtyTx).isValid).toBe(false);
  });

  it('0 또는 음수 단가를 거부해야 합니다.', () => {
    const zeroPriceTx = { date: today, quantity: 10, price: 0 };
    const negativePriceTx = { date: today, quantity: 10, price: -50 };
    expect(Validator.validateTransaction(zeroPriceTx).isValid).toBe(false);
    expect(Validator.validateTransaction(negativePriceTx).isValid).toBe(false);
  });
});