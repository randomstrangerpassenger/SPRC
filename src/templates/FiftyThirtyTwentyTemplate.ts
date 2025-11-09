// src/templates/FiftyThirtyTwentyTemplate.ts
/**
 * @description 50/30/20 포트폴리오 템플릿
 */

import type { Stock } from '../types';
import type { PortfolioTemplate } from './PortfolioTemplate';
import { filterStocksBySector, setEqualRatios } from './PortfolioTemplate';

/**
 * @class FiftyThirtyTwentyTemplate
 * @description 50/30/20: 주식 50%, 채권 30%, 기타 20%
 */
export class FiftyThirtyTwentyTemplate implements PortfolioTemplate {
    readonly name = '50-30-20';
    readonly description = '주식 50%, 채권 30%, 기타 20%의 균형 포트폴리오';

    /**
     * @description 주식 섹터 키워드
     */
    private readonly EQUITY_KEYWORDS = ['stock', 'equity', 'tech'];

    /**
     * @description 채권 섹터 키워드
     */
    private readonly BOND_KEYWORDS = ['bond', 'treasury'];

    /**
     * @description 템플릿 적용
     * @param stocks - 적용할 주식 목록
     */
    apply(stocks: Stock[]): void {
        if (stocks.length === 0) return;

        const equityStocks = filterStocksBySector(stocks, this.EQUITY_KEYWORDS);
        const bondStocks = filterStocksBySector(stocks, this.BOND_KEYWORDS);
        const otherStocks = stocks.filter(
            (s) => !equityStocks.includes(s) && !bondStocks.includes(s)
        );

        // 주식 50%
        if (equityStocks.length > 0) {
            setEqualRatios(equityStocks, 50);
        }

        // 채권 30%
        if (bondStocks.length > 0) {
            setEqualRatios(bondStocks, 30);
        }

        // 기타 20%
        if (otherStocks.length > 0) {
            setEqualRatios(otherStocks, 20);
        } else if (equityStocks.length === 0 && bondStocks.length === 0) {
            // 섹터가 명확하지 않으면 동일 비중
            setEqualRatios(stocks, 100);
        }
    }
}