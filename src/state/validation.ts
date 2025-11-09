// src/state/validation.ts
/**
 * @description Portfolio 데이터 검증 및 업그레이드 로직
 */

import Decimal from 'decimal.js';
import { CONFIG } from '../constants';
import { generateId } from '../utils';
import { sanitizePortfolioName, sanitizeStockName, sanitizeStockTicker, sanitizeStockSector } from './sanitizer';
import { validateDecimalValue } from './helpers';
import type { Portfolio, Stock, Transaction, MetaState, PortfolioSettings, TransactionType } from '../types';

/**
 * @description 포트폴리오 설정 검증
 * @param settings - PortfolioSettings 객체
 * @returns 검증된 PortfolioSettings
 */
export function validateSettings(settings: any): PortfolioSettings {
    return {
        mainMode: ['add', 'sell', 'simple'].includes(settings?.mainMode)
            ? settings.mainMode
            : 'simple',
        currentCurrency: ['krw', 'usd'].includes(settings?.currentCurrency)
            ? settings.currentCurrency
            : 'krw',
        exchangeRate:
            typeof settings?.exchangeRate === 'number' && settings.exchangeRate > 0
                ? settings.exchangeRate
                : CONFIG.DEFAULT_EXCHANGE_RATE,
        rebalancingTolerance: settings?.rebalancingTolerance,
        tradingFeeRate: settings?.tradingFeeRate,
        taxRate: settings?.taxRate,
    };
}

/**
 * @description 거래 내역 검증
 * @param tx - Transaction 객체 (any 타입으로 받음)
 * @returns 검증된 Transaction 또는 null (invalid시)
 */
export function validateTransaction(tx: any): Transaction | null {
    try {
        const quantity = new Decimal(tx.quantity ?? 0);
        const price = new Decimal(tx.price ?? 0);

        // 수량과 가격이 모두 0보다 커야 유효한 거래
        if (quantity.isNaN() || price.isNaN() || !quantity.greaterThan(0) || !price.greaterThan(0)) {
            return null;
        }

        // type 검증 (buy, sell, dividend 중 하나)
        let type: TransactionType = 'buy';
        if (tx.type === 'sell') type = 'sell';
        else if (tx.type === 'dividend') type = 'dividend';

        return {
            id: tx.id || `tx-${generateId()}`,
            type,
            date: typeof tx.date === 'string' ? tx.date : new Date().toISOString().slice(0, 10),
            quantity,
            price,
        };
    } catch (error) {
        return null;
    }
}

/**
 * @description 거래 내역 배열 검증 및 정렬
 * @param transactions - Transaction 배열 (any[] 타입으로 받음)
 * @returns 검증된 Transaction 배열
 */
export function validateTransactions(transactions: any): Transaction[] {
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
 * @param stock - Stock 객체 (any 타입으로 받음)
 * @param index - 주식 인덱스 (fallback용)
 * @returns 검증된 Stock
 */
export function validateStock(stock: any, index: number): Stock {
    const targetRatio = validateDecimalValue(stock.targetRatio);
    const currentPrice = validateDecimalValue(stock.currentPrice);
    const fixedBuyAmount = validateDecimalValue(stock.fixedBuyAmount);
    const manualAmount = stock.manualAmount !== undefined ? Number(stock.manualAmount) || 0 : undefined;

    return {
        id: stock.id || `s-${generateId()}`,
        name: sanitizeStockName(stock, index),
        ticker: sanitizeStockTicker(stock.ticker),
        sector: sanitizeStockSector(stock.sector),
        targetRatio,
        currentPrice,
        isFixedBuyEnabled: typeof stock.isFixedBuyEnabled === 'boolean' ? stock.isFixedBuyEnabled : false,
        fixedBuyAmount,
        manualAmount,
        transactions: validateTransactions(stock.transactions),
    };
}

/**
 * @description 주식 배열 검증
 * @param portfolioData - Stock 배열 (any[] 타입으로 받음)
 * @returns 검증된 Stock 배열
 */
export function validateStocks(portfolioData: any): Stock[] {
    if (!Array.isArray(portfolioData)) {
        return [];
    }

    return portfolioData.map((stock, index) => validateStock(stock, index));
}

/**
 * @description 포트폴리오 검증
 * @param portfolio - Portfolio 객체 (any 타입으로 받음)
 * @param portId - 포트폴리오 ID
 * @returns 검증된 Portfolio 또는 null (invalid시)
 */
export function validatePortfolio(portfolio: any, portId: string): Portfolio | null {
    // 기본 구조 검증
    if (!portfolio || typeof portfolio !== 'object' || portfolio.id !== portId || !portfolio.name) {
        console.warn(`Invalid portfolio structure skipped for ID: ${portId}`);
        return null;
    }

    return {
        id: portId,
        name: sanitizePortfolioName(portfolio),
        settings: validateSettings(portfolio.settings),
        portfolioData: validateStocks(portfolio.portfolioData),
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
        console.warn(
            `Active portfolio ID '${validatedActiveId}' not found. Setting active ID to '${firstValidId}'.`
        );
        return firstValidId;
    }

    console.warn(`No valid portfolios loaded. Active ID set to null.`);
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
        console.warn(
            `Data version mismatch. Loaded: ${loadedVersion}, Current: ${currentVersion}. Attempting migration/reset.`
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
        activePortfolioId: validatedActiveId,
        version: currentVersion,
    };

    return { meta: validatedMeta, portfolios: validatedPortfolios };
}