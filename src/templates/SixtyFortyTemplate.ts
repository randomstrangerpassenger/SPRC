// src/templates/SixtyFortyTemplate.ts
/**
 * @description 60/40 포트폴리오 템플릿 (주식 60%, 채권 40%)
 */

import type { Stock } from '../types';
import type { PortfolioTemplate } from './PortfolioTemplate';
import { filterStocksBySector, setEqualRatios } from './PortfolioTemplate';

/**
 * @class SixtyFortyTemplate
 * @description 60/40 포트폴리오: 주식 60%, 채권 40%
 */
export class SixtyFortyTemplate implements PortfolioTemplate {
    readonly name = '60-40';
    readonly description = '주식 60%, 채권 40%의 전통적인 분산 포트폴리오';

    /**
     * @description 주식 섹터 키워드
     */
    private readonly EQUITY_SECTORS = [
        'stock',
        'stocks',
        'equity',
        'equities',
        'tech',
        'technology',
        'finance',
        'healthcare',
        'consumer',
    ];

    /**
     * @description 채권 섹터 키워드
     */
    private readonly BOND_SECTORS = ['bond', 'bonds', 'fixed income', 'treasury'];

    /**
     * @description 템플릿 적용
     * @param stocks - 적용할 주식 목록
     */
    apply(stocks: Stock[]): void {
        if (stocks.length === 0) return;

        const equityStocks = filterStocksBySector(stocks, this.EQUITY_SECTORS);
        const bondStocks = filterStocksBySector(stocks, this.BOND_SECTORS);
        const otherStocks = stocks.filter(
            (s) => !equityStocks.includes(s) && !bondStocks.includes(s)
        );

        // 주식 60%
        if (equityStocks.length > 0) {
            setEqualRatios(equityStocks, 60);
        }

        // 채권 40%
        if (bondStocks.length > 0) {
            setEqualRatios(bondStocks, 40);
        }

        // 섹터가 명확하지 않으면 동일 비중
        if (otherStocks.length > 0 && equityStocks.length === 0 && bondStocks.length === 0) {
            setEqualRatios(stocks, 100);
        }
    }
}
