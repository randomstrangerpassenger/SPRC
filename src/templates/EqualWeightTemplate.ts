// src/templates/EqualWeightTemplate.ts
/**
 * @description 동일 비중 포트폴리오 템플릿
 * (Phase 2-3: handleApplyTemplate 리팩토링 - Strategy Pattern)
 */

import type { Stock } from '../types';
import type { PortfolioTemplate } from './PortfolioTemplate';
import { setEqualRatios } from './PortfolioTemplate';

/**
 * @class EqualWeightTemplate
 * @description Equal Weight: 모든 종목에 동일 비중 할당
 */
export class EqualWeightTemplate implements PortfolioTemplate {
    readonly name = 'equal';
    readonly description = '모든 종목에 동일한 비중을 할당';

    /**
     * @description 템플릿 적용
     * @param stocks - 적용할 주식 목록
     */
    apply(stocks: Stock[]): void {
        if (stocks.length === 0) return;
        setEqualRatios(stocks, 100);
    }
}
