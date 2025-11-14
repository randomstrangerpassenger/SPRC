// src/utils/converterUtil.ts
import Decimal from 'decimal.js';

/**
 * @description Decimal 또는 number를 number로 변환하는 유틸리티
 * @param value - 변환할 값 (Decimal 또는 number)
 * @returns number로 변환된 값
 */
export function toNumber(value: Decimal | number): number {
    if (value instanceof Decimal) {
        return value.toNumber();
    }
    return Number(value);
}
