// src/templates/AllWeatherTemplate.ts
/**
 * @description All-Weather 포트폴리오 템플릿 (레이 달리오 전략)
 */

import type { Stock } from '../types';
import type { PortfolioTemplate } from './PortfolioTemplate';
import {
    filterStocksBySector,
    filterStocksBySectorOrName,
    setEqualRatios,
} from './PortfolioTemplate';

/**
 * @class AllWeatherTemplate
 * @description All-Weather: 주식 30%, 채권 55%, 원자재 15%
 */
export class AllWeatherTemplate implements PortfolioTemplate {
    readonly name = 'all-weather';
    readonly description = 'All-Weather: 주식 30%, 장기채 40%, 중기채 15%, 금 7.5%, 원자재 7.5%';

    /**
     * @description 주식 섹터 키워드
     */
    private readonly EQUITY_KEYWORDS = ['stock', 'equity', 'tech'];

    /**
     * @description 채권 섹터 키워드
     */
    private readonly BOND_KEYWORDS = ['bond', 'treasury', 'fixed'];

    /**
     * @description 원자재 키워드 (섹터 + 이름)
     */
    private readonly COMMODITY_KEYWORDS = ['gold', 'commodity', 'metal', '금'];

    /**
     * @description 템플릿 적용
     * @param stocks - 적용할 주식 목록
     */
    apply(stocks: Stock[]): void {
        if (stocks.length === 0) return;

        const equityStocks = filterStocksBySector(stocks, this.EQUITY_KEYWORDS);
        const bondStocks = filterStocksBySector(stocks, this.BOND_KEYWORDS);
        const commodityStocks = filterStocksBySectorOrName(stocks, this.COMMODITY_KEYWORDS);
        const otherStocks = stocks.filter(
            (s) =>
                !equityStocks.includes(s) && !bondStocks.includes(s) && !commodityStocks.includes(s)
        );

        // 주식 30%
        if (equityStocks.length > 0) {
            setEqualRatios(equityStocks, 30);
        }

        // 채권 55% (장기채 40% + 중기채 15% 통합)
        if (bondStocks.length > 0) {
            setEqualRatios(bondStocks, 55);
        }

        // 원자재 15% (금 7.5% + 원자재 7.5% 통합)
        if (commodityStocks.length > 0) {
            setEqualRatios(commodityStocks, 15);
        }

        // 섹터가 명확하지 않으면 동일 비중
        if (
            otherStocks.length > 0 &&
            equityStocks.length + bondStocks.length + commodityStocks.length === 0
        ) {
            setEqualRatios(stocks, 100);
        }
    }
}
