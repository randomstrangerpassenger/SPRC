// src/templates/PortfolioTemplate.ts
/**
 * @description 포트폴리오 템플릿 전략 인터페이스
 * (Phase 2-3: handleApplyTemplate 리팩토링 - Strategy Pattern)
 */

import type { Stock } from '../types';
import Decimal from 'decimal.js';

/**
 * @interface PortfolioTemplate
 * @description 모든 포트폴리오 템플릿이 구현해야 하는 인터페이스
 */
export interface PortfolioTemplate {
    /**
     * @description 템플릿 이름
     */
    readonly name: string;

    /**
     * @description 템플릿 설명
     */
    readonly description: string;

    /**
     * @description 템플릿을 주식 목록에 적용
     * @param stocks - 적용할 주식 목록
     * @returns void (stocks 배열을 직접 수정)
     */
    apply(stocks: Stock[]): void;
}

/**
 * @description 섹터별 종목 분류 헬퍼 함수
 * @param stocks - 종목 목록
 * @param sectorKeywords - 섹터를 식별할 키워드 목록
 * @returns 필터링된 종목 목록
 */
export function filterStocksBySector(stocks: Stock[], sectorKeywords: string[]): Stock[] {
    return stocks.filter((stock) => {
        const sector = (stock.sector || '').toLowerCase();
        return sectorKeywords.some((keyword) => sector.includes(keyword));
    });
}

/**
 * @description 종목 또는 이름으로 필터링 (섹터 + 이름 검색)
 * @param stocks - 종목 목록
 * @param keywords - 검색 키워드 목록
 * @returns 필터링된 종목 목록
 */
export function filterStocksBySectorOrName(stocks: Stock[], keywords: string[]): Stock[] {
    return stocks.filter((stock) => {
        const sector = (stock.sector || '').toLowerCase();
        const name = (stock.name || '').toLowerCase();
        return keywords.some((keyword) => sector.includes(keyword) || name.includes(keyword));
    });
}

/**
 * @description 목표 비율을 균등하게 설정
 * @param stocks - 종목 목록
 * @param totalRatio - 총 할당 비율 (%)
 */
export function setEqualRatios(stocks: Stock[], totalRatio: number): void {
    if (stocks.length === 0) return;
    const ratioPerStock = totalRatio / stocks.length;
    stocks.forEach((stock) => {
        stock.targetRatio = new Decimal(ratioPerStock);
    });
}
