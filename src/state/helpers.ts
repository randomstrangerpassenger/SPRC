// src/state/helpers.ts
/**
 * @description Portfolio 및 Stock 생성을 위한 헬퍼 함수
 * (Phase 2-2: state.ts 모듈 분리 - helpers 추출)
 */

import Decimal from 'decimal.js';
import { CONFIG } from '../constants';
import { t } from '../i18n';
import { generateId } from '../utils';
import type { Portfolio, Stock } from '../types';

/**
 * @description 기본 포트폴리오 생성
 * @param id - 포트폴리오 ID
 * @param name - 포트폴리오 이름 (기본값: i18n)
 * @returns Portfolio 객체
 */
export function createDefaultPortfolio(
    id: string,
    name: string = t('defaults.defaultPortfolioName')
): Portfolio {
    return {
        id: id,
        name: name,
        settings: {
            mainMode: 'simple',
            currentCurrency: 'krw',
            exchangeRate: CONFIG.DEFAULT_EXCHANGE_RATE,
            rebalancingTolerance: 5, // 기본 5% 허용 오차
            tradingFeeRate: 0.3, // 기본 0.3% 수수료
            taxRate: 15, // 기본 15% 세율
        },
        portfolioData: [createDefaultStock()],
    };
}

/**
 * @description 기본 주식 생성
 * @returns Stock 객체
 */
export function createDefaultStock(): Stock {
    return {
        id: `s-${generateId()}`,
        name: t('defaults.newStock'),
        ticker: '',
        sector: '',
        targetRatio: new Decimal(0),
        currentPrice: new Decimal(0),
        isFixedBuyEnabled: false,
        fixedBuyAmount: new Decimal(0),
        transactions: [],
        manualAmount: 0, // 간단 모드용 수동 입력 금액
    };
}

/**
 * @description Decimal 값 검증 및 변환
 * @param value - 변환할 값
 * @param defaultValue - 기본값 (NaN 시)
 * @returns Decimal 객체
 */
export function validateDecimalValue(value: any, defaultValue: Decimal = new Decimal(0)): Decimal {
    try {
        const decimalValue = new Decimal(value ?? 0);
        return decimalValue.isNaN() ? defaultValue : decimalValue;
    } catch (error) {
        return defaultValue;
    }
}

/**
 * @description 안전한 Decimal 변환
 * @param value - 변환할 값
 * @returns Decimal 객체
 */
export function convertToDecimal(value: any): Decimal {
    try {
        const decimalValue = new Decimal(value ?? 0);
        if (decimalValue.isNaN()) {
            throw new Error('Invalid number for Decimal');
        }
        return decimalValue;
    } catch (error) {
        return new Decimal(0);
    }
}
