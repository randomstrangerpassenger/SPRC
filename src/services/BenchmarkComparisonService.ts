// src/services/BenchmarkComparisonService.ts
import Decimal from 'decimal.js';
import type {
    BenchmarkHistory,
    BenchmarkDataPoint,
    BenchmarkComparison,
    BenchmarkPerformance,
    PortfolioSnapshot,
} from '../types';
import { apiService } from '../apiService';
import { logger } from './Logger';

/**
 * @class BenchmarkComparisonService
 * @description 벤치마크(SPY) 대비 포트폴리오 성과 분석 서비스
 */
export class BenchmarkComparisonService {
    /**
     * @description 벤치마크 히스토리 데이터 가져오기 및 변환
     * @param symbol - 벤치마크 심볼 (예: SPY)
     * @param startDate - 시작 날짜 (YYYY-MM-DD)
     * @param endDate - 종료 날짜 (YYYY-MM-DD)
     * @returns Promise<BenchmarkHistory>
     */
    static async fetchBenchmarkHistory(
        symbol: string,
        startDate: string,
        endDate: string
    ): Promise<BenchmarkHistory> {
        // 날짜를 Unix timestamp로 변환
        const fromTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
        const toTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

        try {
            const { dates, closes } = await apiService.fetchBenchmarkHistory(
                symbol,
                fromTimestamp,
                toTimestamp
            );

            // BenchmarkDataPoint 배열로 변환
            const data: BenchmarkDataPoint[] = dates.map((date, index) => ({
                date,
                close: new Decimal(closes[index]),
            }));

            // 날짜순으로 정렬 (오래된 것부터)
            data.sort((a, b) => a.date.localeCompare(b.date));

            return {
                symbol,
                name: symbol === 'SPY' ? 'S&P 500' : symbol,
                data,
            };
        } catch (error) {
            logger.error(
                `Failed to fetch benchmark history for ${symbol}`,
                'BenchmarkComparisonService',
                error
            );
            throw error;
        }
    }

    /**
     * @description 포트폴리오 스냅샷과 벤치마크를 비교
     * @param snapshots - 포트폴리오 스냅샷 배열
     * @param benchmarkHistory - 벤치마크 히스토리 데이터
     * @returns BenchmarkComparison
     */
    static compareToBenchmark(
        snapshots: PortfolioSnapshot[],
        benchmarkHistory: BenchmarkHistory
    ): BenchmarkComparison {
        if (snapshots.length === 0) {
            throw new Error('No snapshots available for comparison');
        }

        if (benchmarkHistory.data.length === 0) {
            throw new Error('No benchmark data available');
        }

        // 날짜순으로 정렬 (오래된 것부터)
        const sortedSnapshots = [...snapshots].sort((a, b) =>
            a.timestamp.localeCompare(b.timestamp)
        );
        const sortedBenchmark = [...benchmarkHistory.data].sort((a, b) =>
            a.date.localeCompare(b.date)
        );

        // 시작 및 종료 날짜
        const startDate = sortedSnapshots[0].timestamp.split('T')[0];
        const endDate = sortedSnapshots[sortedSnapshots.length - 1].timestamp.split('T')[0];

        // 포트폴리오 성과 계산
        const portfolioStart = sortedSnapshots[0].totalValue;
        const portfolioEnd = sortedSnapshots[sortedSnapshots.length - 1].totalValue;
        const portfolioPerformance = this.calculatePerformance(
            startDate,
            endDate,
            portfolioStart,
            portfolioEnd
        );

        // 벤치마크 성과 계산 (가장 가까운 날짜 찾기)
        const benchmarkStart = this.findClosestBenchmarkValue(sortedBenchmark, startDate);
        const benchmarkEnd = this.findClosestBenchmarkValue(sortedBenchmark, endDate);

        if (!benchmarkStart || !benchmarkEnd) {
            throw new Error('Could not find matching benchmark data for the date range');
        }

        const benchmarkPerformance = this.calculatePerformance(
            startDate,
            endDate,
            benchmarkStart,
            benchmarkEnd
        );

        // 알파 계산 (포트폴리오 수익률 - 벤치마크 수익률)
        const alpha = portfolioPerformance.totalReturn.minus(benchmarkPerformance.totalReturn);

        // 정규화된 데이터 생성 (100 기준)
        const portfolioNormalized = this.normalizeToBase100(
            sortedSnapshots.map((s) => ({
                date: s.timestamp.split('T')[0],
                value: s.totalValue,
            }))
        );

        const benchmarkNormalized = this.normalizeToBase100(
            this.alignBenchmarkDates(
                sortedSnapshots.map((s) => s.timestamp.split('T')[0]),
                sortedBenchmark
            )
        );

        return {
            portfolioPerformance,
            benchmarkPerformance,
            alpha,
            outperformance: alpha.greaterThan(0),
            portfolioNormalized,
            benchmarkNormalized,
        };
    }

    /**
     * @description 성과 지표 계산
     * @param startDate - 시작 날짜
     * @param endDate - 종료 날짜
     * @param startValue - 시작 가치
     * @param endValue - 종료 가치
     * @returns BenchmarkPerformance
     */
    private static calculatePerformance(
        startDate: string,
        endDate: string,
        startValue: Decimal,
        endValue: Decimal
    ): BenchmarkPerformance {
        // 총 수익률 (%) = ((종료 - 시작) / 시작) * 100
        const totalReturn = endValue
            .minus(startValue)
            .div(startValue)
            .times(100);

        // 기간 계산 (년 단위)
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        const years = daysDiff / 365.25;

        // 연환산 수익률 (%) = ((1 + 총수익률/100)^(1/years) - 1) * 100
        let annualizedReturn: Decimal;
        if (years > 0 && years < 100) {
            // (1 + totalReturn/100)^(1/years) - 1
            const onePlusReturn = new Decimal(1).plus(totalReturn.div(100));
            const exponent = 1 / years;
            const annualized = onePlusReturn.pow(exponent).minus(1).times(100);
            annualizedReturn = annualized;
        } else {
            // 기간이 너무 짧거나 길면 총 수익률 사용
            annualizedReturn = totalReturn;
        }

        return {
            startDate,
            endDate,
            startValue,
            endValue,
            totalReturn,
            annualizedReturn,
        };
    }

    /**
     * @description 가장 가까운 날짜의 벤치마크 값 찾기
     * @param benchmarkData - 벤치마크 데이터
     * @param targetDate - 목표 날짜 (YYYY-MM-DD)
     * @returns Decimal | null
     */
    private static findClosestBenchmarkValue(
        benchmarkData: BenchmarkDataPoint[],
        targetDate: string
    ): Decimal | null {
        if (benchmarkData.length === 0) return null;

        const target = new Date(targetDate).getTime();

        // 가장 가까운 날짜 찾기
        let closest = benchmarkData[0];
        let minDiff = Math.abs(new Date(benchmarkData[0].date).getTime() - target);

        for (const point of benchmarkData) {
            const diff = Math.abs(new Date(point.date).getTime() - target);
            if (diff < minDiff) {
                minDiff = diff;
                closest = point;
            }
        }

        return closest.close;
    }

    /**
     * @description 포트폴리오 날짜에 맞춰 벤치마크 데이터 정렬
     * @param portfolioDates - 포트폴리오 날짜 배열
     * @param benchmarkData - 벤치마크 데이터
     * @returns Array<{ date: string; value: Decimal }>
     */
    private static alignBenchmarkDates(
        portfolioDates: string[],
        benchmarkData: BenchmarkDataPoint[]
    ): Array<{ date: string; value: Decimal }> {
        return portfolioDates.map((date) => {
            const value = this.findClosestBenchmarkValue(benchmarkData, date);
            return {
                date,
                value: value || new Decimal(0),
            };
        });
    }

    /**
     * @description 데이터를 100 기준으로 정규화
     * @param data - { date, value } 배열
     * @returns Array<{ date: string; value: Decimal }>
     */
    private static normalizeToBase100(
        data: Array<{ date: string; value: Decimal }>
    ): Array<{ date: string; value: Decimal }> {
        if (data.length === 0) return [];

        const baseValue = data[0].value;
        if (baseValue.isZero()) return data.map((d) => ({ ...d, value: new Decimal(100) }));

        return data.map((d) => ({
            date: d.date,
            value: d.value.div(baseValue).times(100),
        }));
    }
}
