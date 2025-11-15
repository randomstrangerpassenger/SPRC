import type { Stock } from '../types/Stock';
import type { CalculatedStock } from '../types/CalculatedStock';
import type { Currency } from '../types/Currency';
import { cacheManager } from './CacheManager';

/**
 * 도메인별 캐시 키 생성 헬퍼
 *
 * 각 도메인의 캐시 키 생성 로직을 중앙화하여
 * 일관된 키 전략을 유지하고 version/updatedAt 관리를 간소화
 */
export class CacheKeyGenerator {
    /**
     * 포트폴리오 계산 캐시 키 생성
     *
     * @param portfolioData - 포트폴리오 데이터
     * @param exchangeRate - 환율
     * @param currentCurrency - 현재 통화
     * @param version - 포트폴리오 버전 (선택사항)
     * @returns 캐시 키
     */
    static forPortfolioCalculation(
        portfolioData: Stock[],
        exchangeRate: number,
        currentCurrency: Currency,
        version?: number
    ): string {
        // 주식별 키 생성 (ID, 가격, 거래 ID 조합)
        const stockKeys = portfolioData
            .map((stock) => {
                const txIds = stock.transactions.map((tx) => tx.id).join(',');
                return `${stock.id}:${stock.currentPrice}:${txIds}`;
            })
            .sort() // 정렬하여 순서 무관하게
            .join('|');

        return cacheManager.generateKey({
            namespace: 'portfolio-calculation',
            version,
            components: [stockKeys, exchangeRate.toString(), currentCurrency],
        });
    }

    /**
     * 섹터 분석 캐시 키 생성
     *
     * @param portfolioData - 계산된 포트폴리오 데이터
     * @param currentCurrency - 현재 통화
     * @param version - 버전 (선택사항)
     * @returns 캐시 키
     */
    static forSectorAnalysis(
        portfolioData: CalculatedStock[],
        currentCurrency: Currency,
        version?: number
    ): string {
        // 주식별 섹터 및 금액 기반 키 생성
        const sectorKeys = portfolioData
            .map((stock) => {
                const amount =
                    currentCurrency === 'krw'
                        ? stock.calculated?.currentAmountKRW?.toString() || '0'
                        : stock.calculated?.currentAmountUSD?.toString() || '0';
                return `${stock.id}:${stock.sector}:${amount}`;
            })
            .sort()
            .join('|');

        return cacheManager.generateKey({
            namespace: 'sector-analysis',
            version,
            components: [sectorKeys, currentCurrency],
        });
    }

    /**
     * VirtualScroll 행 캐시 키 생성
     *
     * @param stockId - 주식 ID
     * @returns 캐시 키
     */
    static forVirtualScrollRow(stockId: string): string {
        return cacheManager.generateKey({
            namespace: 'virtual-scroll-rows',
            components: [stockId],
        });
    }

    /**
     * 리밸런싱 분석 캐시 키 생성
     *
     * @param portfolioData - 계산된 포트폴리오 데이터
     * @param currentTotal - 포트폴리오 총액
     * @param rebalancingTolerance - 리밸런싱 허용 오차
     * @param version - 버전 (선택사항)
     * @returns 캐시 키
     */
    static forRebalancingAnalysis(
        portfolioData: CalculatedStock[],
        currentTotal: string,
        rebalancingTolerance: number,
        version?: number
    ): string {
        // 주식별 현재 비율 및 목표 비율 기반 키
        const ratioKeys = portfolioData
            .map((stock) => {
                const currentRatio =
                    stock.calculated?.currentRatio?.toString() || '0';
                return `${stock.id}:${currentRatio}:${stock.targetRatio}`;
            })
            .sort()
            .join('|');

        return cacheManager.generateKey({
            namespace: 'rebalancing-analysis',
            version,
            components: [ratioKeys, currentTotal, rebalancingTolerance.toString()],
        });
    }

    /**
     * 개별 주식 키 생성 (내부 헬퍼)
     *
     * @param stock - 주식 데이터
     * @returns 주식 키
     */
    private static generateStockKey(stock: Stock): string {
        const txIds = stock.transactions.map((tx) => tx.id).join(',');
        return `${stock.id}:${stock.currentPrice}:${txIds}`;
    }
}
