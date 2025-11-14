// src/services/PortfolioMetricsService.ts
import type { Stock } from '../types';
import { toNumber } from '../utils/converterUtil';

/**
 * @description 포트폴리오 메트릭 계산 결과 타입
 */
export interface StockMetrics {
    totalBuyQty: number;
    totalSellQty: number;
    netHoldings: number;
    avgBuyPrice: number;
    currentPrice: number;
    totalInvested: number;
    currentValue: number;
    unrealizedPL: number;
    unrealizedPLPercent: number;
}

/**
 * @class PortfolioMetricsService
 * @description 포트폴리오 및 종목 메트릭 계산 서비스
 * - PDF, Excel, Email 서비스에서 공통으로 사용하는 계산 로직 통합
 */
export class PortfolioMetricsService {
    /**
     * @description 종목별 메트릭 계산
     * @param stock - 종목 데이터
     * @returns 계산된 메트릭 (보유량, 평균단가, 수익률 등)
     */
    static calculateStockMetrics(stock: Stock): StockMetrics {
        let totalBuyQty = 0;
        let totalSellQty = 0;
        let totalBuyAmount = 0;

        stock.transactions.forEach((tx) => {
            const qty = toNumber(tx.quantity);
            const price = toNumber(tx.price);

            if (tx.type === 'buy') {
                totalBuyQty += qty;
                totalBuyAmount += qty * price;
            } else if (tx.type === 'sell') {
                totalSellQty += qty;
            }
        });

        const netHoldings = totalBuyQty - totalSellQty;
        const avgBuyPrice = totalBuyQty > 0 ? totalBuyAmount / totalBuyQty : 0;
        const currentPrice = toNumber(stock.currentPrice);
        const currentValue = netHoldings * currentPrice;
        const totalInvested = netHoldings * avgBuyPrice;
        const unrealizedPL = currentValue - totalInvested;
        const unrealizedPLPercent = totalInvested > 0 ? (unrealizedPL / totalInvested) * 100 : 0;

        return {
            totalBuyQty,
            totalSellQty,
            netHoldings,
            avgBuyPrice,
            currentPrice,
            totalInvested,
            currentValue,
            unrealizedPL,
            unrealizedPLPercent,
        };
    }
}
