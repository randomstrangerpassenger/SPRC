// src/state/validation.ts
/**
 * @description Portfolio 데이터 검증 및 업그레이드 로직
 */

import Decimal from 'decimal.js';
import { CONFIG } from '../constants';
import { generateId } from '../utils';
import {
    sanitizePortfolioName,
    sanitizeStockName,
    sanitizeStockTicker,
    sanitizeStockSector,
} from './sanitizer';
import { validateDecimalValue } from './helpers';
import type {
    Portfolio,
    Stock,
    Transaction,
    MetaState,
    PortfolioSettings,
    TransactionType,
} from '../types';
import { logger } from '../services/Logger';

/**
 * @description 포트폴리오 설정 검증
 * @param settings - PortfolioSettings 객체
 * @returns 검증된 PortfolioSettings
 */
export function validateSettings(settings: unknown): PortfolioSettings {
    const s = settings as Record<string, unknown>;
    return {
        mainMode: ['add', 'sell', 'simple'].includes(s?.mainMode as string)
            ? (s.mainMode as 'add' | 'sell' | 'simple')
            : 'simple',
        currentCurrency: ['krw', 'usd'].includes(s?.currentCurrency as string)
            ? (s.currentCurrency as 'krw' | 'usd')
            : 'krw',
        exchangeRate:
            typeof s?.exchangeRate === 'number' && s.exchangeRate > 0
                ? s.exchangeRate
                : CONFIG.DEFAULT_EXCHANGE_RATE,
        rebalancingTolerance:
            typeof s?.rebalancingTolerance === 'number' ? s.rebalancingTolerance : undefined,
        tradingFeeRate: typeof s?.tradingFeeRate === 'number' ? s.tradingFeeRate : undefined,
        taxRate: typeof s?.taxRate === 'number' ? s.taxRate : undefined,
    };
}

/**
 * @description 거래 내역 검증
 * @param tx - Transaction 객체 (unknown 타입으로 받음)
 * @returns 검증된 Transaction 또는 null (invalid시)
 */
export function validateTransaction(tx: unknown): Transaction | null {
    try {
        const t = tx as Record<string, unknown>;
        const quantity = new Decimal(t.quantity ?? 0);
        const price = new Decimal(t.price ?? 0);

        // 수량과 가격이 모두 0보다 커야 유효한 거래
        if (
            quantity.isNaN() ||
            price.isNaN() ||
            !quantity.greaterThan(0) ||
            !price.greaterThan(0)
        ) {
            return null;
        }

        // type 검증 (buy, sell, dividend 중 하나)
        let type: TransactionType = 'buy';
        if (t.type === 'sell') type = 'sell';
        else if (t.type === 'dividend') type = 'dividend';

        return {
            id: (typeof t.id === 'string' ? t.id : null) || `tx-${generateId()}`,
            type,
            date: typeof t.date === 'string' ? t.date : new Date().toISOString().slice(0, 10),
            quantity,
            price,
        };
    } catch (error) {
        return null;
    }
}

/**
 * @description 거래 내역 배열 검증 및 정렬
 * @param transactions - Transaction 배열 (unknown 타입으로 받음)
 * @returns 검증된 Transaction 배열
 */
export function validateTransactions(transactions: unknown): Transaction[] {
    if (!Array.isArray(transactions)) {
        return [];
    }

    return transactions
        .map(validateTransaction)
        .filter((tx): tx is Transaction => tx !== null)
        .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * @description 주식 검증
 * @param stock - Stock 객체 (unknown 타입으로 받음)
 * @param index - 주식 인덱스 (fallback용)
 * @returns 검증된 Stock
 */
export function validateStock(stock: unknown, index: number): Stock {
    const s = stock as Record<string, unknown>;
    const targetRatio = validateDecimalValue(s.targetRatio);
    const currentPrice = validateDecimalValue(s.currentPrice);
    const fixedBuyAmount = validateDecimalValue(s.fixedBuyAmount);
    const manualAmount = s.manualAmount !== undefined ? Number(s.manualAmount) || 0 : undefined;

    return {
        id: (typeof s.id === 'string' ? s.id : null) || `s-${generateId()}`,
        name: sanitizeStockName(stock, index),
        ticker: sanitizeStockTicker(s.ticker),
        sector: sanitizeStockSector(s.sector),
        targetRatio,
        currentPrice,
        isFixedBuyEnabled: typeof s.isFixedBuyEnabled === 'boolean' ? s.isFixedBuyEnabled : false,
        fixedBuyAmount,
        manualAmount,
        transactions: validateTransactions(s.transactions),
    };
}

/**
 * @description 주식 배열 검증
 * @param portfolioData - Stock 배열 (unknown 타입으로 받음)
 * @returns 검증된 Stock 배열
 */
export function validateStocks(portfolioData: unknown): Stock[] {
    if (!Array.isArray(portfolioData)) {
        return [];
    }

    return portfolioData.map((stock, index) => validateStock(stock, index));
}

/**
 * @description 포트폴리오 검증
 * @param portfolio - Portfolio 객체 (unknown 타입으로 받음)
 * @param portId - 포트폴리오 ID
 * @returns 검증된 Portfolio 또는 null (invalid시)
 */
export function validatePortfolio(portfolio: unknown, portId: string): Portfolio | null {
    // 기본 구조 검증
    const p = portfolio as Record<string, unknown>;
    if (!portfolio || typeof portfolio !== 'object' || p.id !== portId || !p.name) {
        logger.warn(`Invalid portfolio structure skipped for ID: ${portId}`, 'validation');
        return null;
    }

    return {
        id: portId,
        name: sanitizePortfolioName(portfolio),
        settings: validateSettings(p.settings),
        portfolioData: validateStocks(p.portfolioData),
    };
}

/**
 * @description 활성 포트폴리오 ID 검증
 * @param validatedActiveId - 검증할 ID
 * @param validatedPortfolios - 검증된 포트폴리오 목록
 * @returns 유효한 활성 포트폴리오 ID
 */
export function validateActivePortfolioId(
    validatedActiveId: string | null,
    validatedPortfolios: Record<string, Portfolio>
): string | null {
    // ID가 유효한지 확인
    if (validatedActiveId && validatedPortfolios[validatedActiveId]) {
        return validatedActiveId;
    }

    // 첫 번째 유효한 포트폴리오를 활성으로 설정
    const firstValidId = Object.keys(validatedPortfolios)[0];
    if (firstValidId) {
        logger.warn(
            `Active portfolio ID '${validatedActiveId}' not found. Setting active ID to '${firstValidId}'`,
            'validation'
        );
        return firstValidId;
    }

    logger.warn('No valid portfolios loaded. Active ID set to null', 'validation');
    return null;
}

/**
 * @description 포트폴리오 데이터 검증 및 업그레이드
 * (원래 _validateAndUpgradeData 메서드를 함수형으로 분해)
 * @param loadedMetaData - 로드된 메타 데이터
 * @param loadedPortfolios - 로드된 포트폴리오 목록
 * @returns 검증된 메타 데이터 및 포트폴리오
 */
export function validateAndUpgradeData(
    loadedMetaData: MetaState | null,
    loadedPortfolios: Record<string, Portfolio> | null
): { meta: MetaState; portfolios: Record<string, Portfolio> } {
    const currentVersion = CONFIG.DATA_VERSION;
    const loadedVersion = loadedMetaData?.version;

    // 버전 체크
    if (loadedVersion !== currentVersion) {
        logger.warn(
            `Data version mismatch. Loaded: ${loadedVersion}, Current: ${currentVersion}. Attempting migration/reset`,
            'validation'
        );
    }

    const validatedPortfolios: Record<string, Portfolio> = {};
    let validatedActiveId = loadedMetaData?.activePortfolioId ?? null;

    // 포트폴리오 목록 검증
    if (loadedPortfolios && typeof loadedPortfolios === 'object') {
        Object.keys(loadedPortfolios).forEach((portId) => {
            const portfolio = loadedPortfolios[portId];
            const validatedPortfolio = validatePortfolio(portfolio, portId);

            if (validatedPortfolio) {
                validatedPortfolios[portId] = validatedPortfolio;
            }
        });
    }

    // 활성 포트폴리오 ID 검증
    validatedActiveId = validateActivePortfolioId(validatedActiveId, validatedPortfolios);

    // 메타 데이터 생성
    const validatedMeta: MetaState = {
        activePortfolioId: validatedActiveId || '',
        version: currentVersion,
    };

    return { meta: validatedMeta, portfolios: validatedPortfolios };
}
