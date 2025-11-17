// src/services/DividendAnalysisService.ts
import Decimal from 'decimal.js';
import { DECIMAL_ZERO, DECIMAL_HUNDRED } from '../constants';
import type {
    CalculatedStock,
    MonthlyDividend,
    YearlyDividend,
    DividendGrowth,
    DividendAnalysisResult,
} from '../types';
import { logger } from './Logger';

/**
 * @class DividendAnalysisService
 * @description 배당금 분석 서비스
 */
export class DividendAnalysisService {
    /**
     * @description Analyze dividend data from portfolio
     */
    static analyzeDividends(
        portfolioData: CalculatedStock[],
        currentTotalValue: Decimal
    ): DividendAnalysisResult {
        const startTime = performance.now();

        try {
            // 모든 배당 거래 수집
            const dividendTransactions: Array<{
                date: string;
                amount: Decimal;
                stockId: string;
            }> = [];

            for (const stock of portfolioData) {
                for (const tx of stock.transactions) {
                    if (tx.type === 'dividend') {
                        const amount = new Decimal(tx.quantity || 0).times(tx.price || 0);
                        dividendTransactions.push({
                            date: tx.date,
                            amount,
                            stockId: stock.id,
                        });
                    }
                }
            }

            // 총 배당금 계산
            const totalDividends = dividendTransactions.reduce(
                (sum, tx) => sum.plus(tx.amount),
                DECIMAL_ZERO
            );

            // 연도별 배당 집계
            const yearlyDividends = this.calculateYearlyDividends(
                dividendTransactions,
                portfolioData
            );

            // 월별 배당 집계 (최근 12개월)
            const monthlyDividends = this.calculateRecentMonthlyDividends(
                dividendTransactions,
                12
            );

            // 배당 성장률 계산
            const dividendGrowth = this.calculateDividendGrowth(yearlyDividends);

            // 예상 연간 배당 (최근 12개월 기준)
            const estimatedAnnualDividend = monthlyDividends.reduce(
                (sum, m) => sum.plus(m.amount),
                DECIMAL_ZERO
            );

            // 배당 수익률 계산 (예상 연간 배당 / 현재 포트폴리오 가치 * 100)
            const dividendYield = currentTotalValue.isZero()
                ? DECIMAL_ZERO
                : estimatedAnnualDividend.div(currentTotalValue).times(DECIMAL_HUNDRED);

            const result: DividendAnalysisResult = {
                totalDividends,
                yearlyDividends,
                monthlyDividends,
                dividendGrowth,
                estimatedAnnualDividend,
                dividendYield,
            };

            const endTime = performance.now();
            if (import.meta.env.DEV) {
                logger.debug(
                    `Dividend analysis completed in ${(endTime - startTime).toFixed(2)} ms`,
                    'DividendAnalysisService'
                );
            }

            return result;
        } catch (error) {
            logger.error('Failed to analyze dividends', 'DividendAnalysisService', error);
            throw error;
        }
    }

    /**
     * @description Calculate yearly dividends with monthly breakdown
     */
    private static calculateYearlyDividends(
        transactions: Array<{ date: string; amount: Decimal; stockId: string }>,
        portfolioData: CalculatedStock[]
    ): YearlyDividend[] {
        const yearlyMap = new Map<number, Map<number, MonthlyDividend>>();
        const stockCountMap = new Map<number, Set<string>>();

        for (const tx of transactions) {
            const date = new Date(tx.date);
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // 1-12

            if (!yearlyMap.has(year)) {
                yearlyMap.set(year, new Map());
                stockCountMap.set(year, new Set());
            }

            const monthlyMap = yearlyMap.get(year)!;
            if (!monthlyMap.has(month)) {
                monthlyMap.set(month, {
                    year,
                    month,
                    amount: DECIMAL_ZERO,
                    count: 0,
                });
            }

            const monthlyData = monthlyMap.get(month)!;
            monthlyData.amount = monthlyData.amount.plus(tx.amount);
            monthlyData.count += 1;

            stockCountMap.get(year)!.add(tx.stockId);
        }

        const yearlyDividends: YearlyDividend[] = [];
        for (const [year, monthlyMap] of yearlyMap.entries()) {
            const monthlyBreakdown = Array.from(monthlyMap.values()).sort(
                (a, b) => a.month - b.month
            );
            const totalAmount = monthlyBreakdown.reduce(
                (sum, m) => sum.plus(m.amount),
                DECIMAL_ZERO
            );
            const averageMonthly = new Decimal(monthlyBreakdown.length).greaterThan(0)
                ? totalAmount.div(monthlyBreakdown.length)
                : DECIMAL_ZERO;

            yearlyDividends.push({
                year,
                totalAmount,
                monthlyBreakdown,
                averageMonthly,
                stockCount: stockCountMap.get(year)!.size,
            });
        }

        return yearlyDividends.sort((a, b) => b.year - a.year); // 최신 연도부터
    }

    /**
     * @description Calculate recent monthly dividends (last N months)
     */
    private static calculateRecentMonthlyDividends(
        transactions: Array<{ date: string; amount: Decimal; stockId: string }>,
        months: number
    ): MonthlyDividend[] {
        const now = new Date();
        const cutoffDate = new Date(now);
        cutoffDate.setMonth(cutoffDate.getMonth() - months);

        const monthlyMap = new Map<string, MonthlyDividend>();

        for (const tx of transactions) {
            const date = new Date(tx.date);
            if (date < cutoffDate) continue;

            const year = date.getFullYear();
            const month = date.getMonth() + 1; // 1-12
            const key = `${year}-${month}`;

            if (!monthlyMap.has(key)) {
                monthlyMap.set(key, {
                    year,
                    month,
                    amount: DECIMAL_ZERO,
                    count: 0,
                });
            }

            const monthlyData = monthlyMap.get(key)!;
            monthlyData.amount = monthlyData.amount.plus(tx.amount);
            monthlyData.count += 1;
        }

        return Array.from(monthlyMap.values()).sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });
    }

    /**
     * @description Calculate dividend growth rate year-over-year
     */
    private static calculateDividendGrowth(yearlyDividends: YearlyDividend[]): DividendGrowth[] {
        const sortedByYear = [...yearlyDividends].sort((a, b) => a.year - b.year);
        const growth: DividendGrowth[] = [];

        for (let i = 0; i < sortedByYear.length; i++) {
            const current = sortedByYear[i];
            const growthRate =
                i === 0
                    ? DECIMAL_ZERO // 첫 해는 성장률 0
                    : current.totalAmount.isZero()
                      ? DECIMAL_ZERO
                      : current.totalAmount
                            .minus(sortedByYear[i - 1].totalAmount)
                            .div(sortedByYear[i - 1].totalAmount)
                            .times(DECIMAL_HUNDRED);

            growth.push({
                year: current.year,
                totalDividend: current.totalAmount,
                growthRate,
            });
        }

        return growth.sort((a, b) => b.year - a.year); // 최신 연도부터
    }
}
