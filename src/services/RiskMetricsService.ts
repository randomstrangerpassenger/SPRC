// src/services/RiskMetricsService.ts
import Decimal from 'decimal.js';
import { logger } from './Logger';
import type { PortfolioSnapshot } from '../types';

/**
 * @interface RiskMetrics
 * @description 포트폴리오 리스크 지표
 */
export interface RiskMetrics {
    /** 총 수익률 (%) */
    totalReturn: number;
    /** 연환산 수익률 (CAGR, %) */
    cagr: number;
    /** 변동성 (연환산 표준편차, %) */
    volatility: number;
    /** 샤프 비율 (무위험 수익률 가정 2%) */
    sharpeRatio: number;
    /** 최대 낙폭 (MDD, %) */
    maxDrawdown: number;
    /** 최대 낙폭 기간 (일) */
    maxDrawdownDays: number;
    /** 소르티노 비율 (하방 리스크만 고려) */
    sortinoRatio: number;
    /** 칼마 비율 (CAGR / MDD) */
    calmarRatio: number;
    /** 승률 (%) - 수익이 난 날의 비율 */
    winRate: number;
    /** 평균 일일 수익률 (%) */
    avgDailyReturn: number;
    /** 최대 연속 상승일 */
    maxConsecutiveWins: number;
    /** 최대 연속 하락일 */
    maxConsecutiveLosses: number;
    /** 데이터 기간 (일) */
    periodDays: number;
}

/**
 * @class RiskMetricsService
 * @description 포트폴리오 리스크 지표 계산 서비스
 */
export class RiskMetricsService {
    private static RISK_FREE_RATE = 0.02; // 무위험 수익률 2% 가정
    private static TRADING_DAYS_PER_YEAR = 252; // 연간 거래일 수

    /**
     * @description 스냅샷 데이터로부터 리스크 지표 계산
     * @param snapshots - 시간순으로 정렬된 스냅샷 배열
     * @returns RiskMetrics 객체 또는 null (데이터 부족 시)
     */
    static calculateRiskMetrics(snapshots: PortfolioSnapshot[]): RiskMetrics | null {
        try {
            if (snapshots.length < 2) {
                logger.warn('Insufficient snapshots for risk metrics calculation', 'RiskMetricsService');
                return null;
            }

            // 시간순 정렬 (오름차순)
            const sortedSnapshots = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);

            // 일일 수익률 계산
            const dailyReturns = this.#calculateDailyReturns(sortedSnapshots);

            if (dailyReturns.length === 0) {
                return null;
            }

            // 총 수익률 계산
            const firstValue = sortedSnapshots[0].totalValue;
            const lastValue = sortedSnapshots[sortedSnapshots.length - 1].totalValue;
            const totalReturn = ((lastValue - firstValue) / firstValue) * 100;

            // 기간 계산 (일)
            const periodMs = sortedSnapshots[sortedSnapshots.length - 1].timestamp - sortedSnapshots[0].timestamp;
            const periodDays = Math.max(1, Math.floor(periodMs / (1000 * 60 * 60 * 24)));
            const periodYears = periodDays / 365;

            // CAGR 계산 (Compound Annual Growth Rate)
            const cagr =
                periodYears > 0
                    ? (Math.pow(lastValue / firstValue, 1 / periodYears) - 1) * 100
                    : totalReturn;

            // 변동성 계산 (연환산 표준편차)
            const volatility = this.#calculateVolatility(dailyReturns);

            // 샤프 비율 계산
            const sharpeRatio = this.#calculateSharpeRatio(dailyReturns, volatility);

            // 최대 낙폭 (MDD) 계산
            const { maxDrawdown, maxDrawdownDays } = this.#calculateMaxDrawdown(sortedSnapshots);

            // 소르티노 비율 계산 (하방 리스크만 고려)
            const sortinoRatio = this.#calculateSortinoRatio(dailyReturns);

            // 칼마 비율 계산 (CAGR / |MDD|)
            const calmarRatio = maxDrawdown !== 0 ? cagr / Math.abs(maxDrawdown) : 0;

            // 승률 계산
            const winRate = this.#calculateWinRate(dailyReturns);

            // 평균 일일 수익률
            const avgDailyReturn =
                dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;

            // 최대 연속 상승/하락일
            const { maxConsecutiveWins, maxConsecutiveLosses } =
                this.#calculateConsecutiveStreaks(dailyReturns);

            return {
                totalReturn: this.#round(totalReturn, 2),
                cagr: this.#round(cagr, 2),
                volatility: this.#round(volatility, 2),
                sharpeRatio: this.#round(sharpeRatio, 2),
                maxDrawdown: this.#round(maxDrawdown, 2),
                maxDrawdownDays,
                sortinoRatio: this.#round(sortinoRatio, 2),
                calmarRatio: this.#round(calmarRatio, 2),
                winRate: this.#round(winRate, 2),
                avgDailyReturn: this.#round(avgDailyReturn, 4),
                maxConsecutiveWins,
                maxConsecutiveLosses,
                periodDays,
            };
        } catch (error) {
            logger.error('Failed to calculate risk metrics', 'RiskMetricsService', error);
            return null;
        }
    }

    /**
     * @description 일일 수익률 계산 (%)
     */
    static #calculateDailyReturns(snapshots: PortfolioSnapshot[]): number[] {
        const returns: number[] = [];

        for (let i = 1; i < snapshots.length; i++) {
            const prevValue = snapshots[i - 1].totalValue;
            const currentValue = snapshots[i].totalValue;

            if (prevValue > 0) {
                const dailyReturn = ((currentValue - prevValue) / prevValue) * 100;
                returns.push(dailyReturn);
            }
        }

        return returns;
    }

    /**
     * @description 변동성 계산 (연환산 표준편차, %)
     */
    static #calculateVolatility(dailyReturns: number[]): number {
        if (dailyReturns.length === 0) return 0;

        const mean = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;
        const variance =
            dailyReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / dailyReturns.length;
        const dailyStdDev = Math.sqrt(variance);

        // 연환산 변동성
        return dailyStdDev * Math.sqrt(this.TRADING_DAYS_PER_YEAR);
    }

    /**
     * @description 샤프 비율 계산
     */
    static #calculateSharpeRatio(dailyReturns: number[], volatility: number): number {
        if (volatility === 0 || dailyReturns.length === 0) return 0;

        const avgDailyReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;

        // 연환산 수익률
        const annualizedReturn =
            avgDailyReturn * this.TRADING_DAYS_PER_YEAR;

        // 샤프 비율 = (연환산 수익률 - 무위험 수익률) / 연환산 변동성
        return (annualizedReturn - this.RISK_FREE_RATE * 100) / volatility;
    }

    /**
     * @description 최대 낙폭 (MDD) 계산
     */
    static #calculateMaxDrawdown(
        snapshots: PortfolioSnapshot[]
    ): { maxDrawdown: number; maxDrawdownDays: number } {
        let maxDrawdown = 0;
        let maxDrawdownDays = 0;
        let peak = snapshots[0].totalValue;
        let peakIndex = 0;

        for (let i = 1; i < snapshots.length; i++) {
            const currentValue = snapshots[i].totalValue;

            if (currentValue > peak) {
                peak = currentValue;
                peakIndex = i;
            } else {
                const drawdown = ((currentValue - peak) / peak) * 100;
                if (drawdown < maxDrawdown) {
                    maxDrawdown = drawdown;
                    const periodMs = snapshots[i].timestamp - snapshots[peakIndex].timestamp;
                    maxDrawdownDays = Math.floor(periodMs / (1000 * 60 * 60 * 24));
                }
            }
        }

        return { maxDrawdown, maxDrawdownDays };
    }

    /**
     * @description 소르티노 비율 계산 (하방 리스크만 고려)
     */
    static #calculateSortinoRatio(dailyReturns: number[]): number {
        if (dailyReturns.length === 0) return 0;

        const avgDailyReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;

        // 하방 편차 계산 (음수 수익률만 고려)
        const negativeReturns = dailyReturns.filter((r) => r < 0);
        if (negativeReturns.length === 0) return Infinity;

        const downsideVariance =
            negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / dailyReturns.length;
        const downsideStdDev = Math.sqrt(downsideVariance);

        // 연환산
        const annualizedReturn = avgDailyReturn * this.TRADING_DAYS_PER_YEAR;
        const annualizedDownsideStdDev = downsideStdDev * Math.sqrt(this.TRADING_DAYS_PER_YEAR);

        if (annualizedDownsideStdDev === 0) return 0;

        return (annualizedReturn - this.RISK_FREE_RATE * 100) / annualizedDownsideStdDev;
    }

    /**
     * @description 승률 계산 (%)
     */
    static #calculateWinRate(dailyReturns: number[]): number {
        if (dailyReturns.length === 0) return 0;

        const wins = dailyReturns.filter((r) => r > 0).length;
        return (wins / dailyReturns.length) * 100;
    }

    /**
     * @description 최대 연속 상승/하락일 계산
     */
    static #calculateConsecutiveStreaks(dailyReturns: number[]): {
        maxConsecutiveWins: number;
        maxConsecutiveLosses: number;
    } {
        let maxConsecutiveWins = 0;
        let maxConsecutiveLosses = 0;
        let currentWinStreak = 0;
        let currentLossStreak = 0;

        for (const ret of dailyReturns) {
            if (ret > 0) {
                currentWinStreak++;
                currentLossStreak = 0;
                maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak);
            } else if (ret < 0) {
                currentLossStreak++;
                currentWinStreak = 0;
                maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
            } else {
                // ret === 0
                currentWinStreak = 0;
                currentLossStreak = 0;
            }
        }

        return { maxConsecutiveWins, maxConsecutiveLosses };
    }

    /**
     * @description 숫자 반올림
     */
    static #round(value: number, decimals: number): number {
        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }

    /**
     * @description 리스크 등급 평가 (샤프 비율 기반)
     * @returns 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor'
     */
    static evaluateRiskGrade(sharpeRatio: number): string {
        if (sharpeRatio >= 3) return 'excellent'; // 매우 우수
        if (sharpeRatio >= 2) return 'good'; // 우수
        if (sharpeRatio >= 1) return 'fair'; // 보통
        if (sharpeRatio >= 0) return 'poor'; // 나쁨
        return 'very-poor'; // 매우 나쁨
    }

    /**
     * @description 리스크 등급 설명 (한국어)
     */
    static getRiskGradeDescription(grade: string): string {
        const descriptions: Record<string, string> = {
            excellent: '매우 우수 (샤프 비율 ≥ 3)',
            good: '우수 (샤프 비율 ≥ 2)',
            fair: '보통 (샤프 비율 ≥ 1)',
            poor: '나쁨 (샤프 비율 ≥ 0)',
            'very-poor': '매우 나쁨 (샤프 비율 < 0)',
        };
        return descriptions[grade] || '알 수 없음';
    }
}
