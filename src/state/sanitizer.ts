// src/state/sanitizer.ts
/**
 * @description DOMPurify를 사용한 데이터 소독 (XSS 방어)
 */

import DOMPurify from 'dompurify';
import { t } from '../i18n';
import type { Portfolio, Stock } from '../types';

/**
 * @description 문자열 소독 (XSS 방어)
 * @param value - 소독할 문자열
 * @param fallback - 빈 문자열일 경우 대체값
 * @returns 소독된 문자열
 */
export function sanitizeString(value: unknown, fallback: string = ''): string {
    const str = String(value ?? fallback);
    return DOMPurify.sanitize(str, { ALLOWED_TAGS: [] }).trim() || fallback;
}

/**
 * @description 포트폴리오 이름 소독
 * @param portfolio - Portfolio 객체
 * @returns 소독된 이름
 */
export function sanitizePortfolioName(portfolio: Portfolio): string {
    return sanitizeString(portfolio.name, t('defaults.defaultPortfolioName'));
}

/**
 * @description 주식 이름 소독
 * @param stock - Stock 객체
 * @param index - 주식 인덱스 (fallback용)
 * @returns 소독된 이름
 */
export function sanitizeStockName(stock: Stock, index?: number): string {
    const fallback = index !== undefined ? t('defaults.stock', { n: index + 1 }) : t('defaults.newStock');
    return sanitizeString(stock.name, fallback);
}

/**
 * @description 주식 티커 소독
 * @param ticker - 티커 심볼
 * @returns 소독된 티커
 */
export function sanitizeStockTicker(ticker: unknown): string {
    return sanitizeString(ticker, '');
}

/**
 * @description 주식 섹터 소독
 * @param sector - 섹터 이름
 * @returns 소독된 섹터
 */
export function sanitizeStockSector(sector: unknown): string {
    return sanitizeString(sector, '');
}

/**
 * @description 포트폴리오 전체 소독
 * @param portfolio - Portfolio 객체
 * @returns 소독된 Portfolio 객체 (mutate)
 */
export function sanitizePortfolio(portfolio: Portfolio): Portfolio {
    portfolio.name = sanitizePortfolioName(portfolio);

    if (Array.isArray(portfolio.portfolioData)) {
        portfolio.portfolioData.forEach((stock, index) => {
            stock.name = sanitizeStockName(stock, index);
            stock.ticker = sanitizeStockTicker(stock.ticker);
            stock.sector = sanitizeStockSector(stock.sector);
        });
    }

    return portfolio;
}