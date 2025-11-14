// src/services/RiskAnalyzerService.ts
import Decimal from 'decimal.js';
import { THRESHOLDS } from '../constants';
import type { CalculatedStock, SectorData } from '../types';

/**
 * @interface RiskAnalysisResult
 * @description 리스크 분석 결과
 */
export interface RiskAnalysisResult {
    warnings: string[];
    hasWarnings: boolean;
}

/**
 * @interface RebalancingAnalysisResult
 * @description 리밸런싱 분석 결과
 */
export interface RebalancingAnalysisResult {
    stocksNeedingRebalancing: Array<{
        name: string;
        currentRatio: number;
        targetRatio: number;
        diff: number;
    }>;
    hasRebalancingNeeds: boolean;
    message: string | null;
}

/**
 * @class RiskAnalyzerService
 * @description 포트폴리오 리스크 및 리밸런싱 분석 서비스
 * Controller에서 분리된 리스크 분석 로직을 담당
 */
export class RiskAnalyzerService {
    /**
     * @description 리밸런싱 필요 여부 분석
     * @param portfolioData - 계산된 포트폴리오 데이터
     * @param currentTotal - 현재 총 자산
     * @param rebalancingTolerance - 리밸런싱 허용 오차 (기본값: 5%)
     * @returns 리밸런싱 분석 결과
     */
    static analyzeRebalancingNeeds(
        portfolioData: CalculatedStock[],
        currentTotal: Decimal,
        rebalancingTolerance: number = 5
    ): RebalancingAnalysisResult {
        const tolerance = rebalancingTolerance;

        // 허용 오차가 0이면 체크 안 함
        if (tolerance <= 0) {
            return {
                stocksNeedingRebalancing: [],
                hasRebalancingNeeds: false,
                message: null,
            };
        }

        const currentTotalDec = new Decimal(currentTotal);

        // 총 자산이 0이면 체크 안 함
        if (currentTotalDec.isZero()) {
            return {
                stocksNeedingRebalancing: [],
                hasRebalancingNeeds: false,
                message: null,
            };
        }

        const stocksNeedingRebalancing: Array<{
            name: string;
            currentRatio: number;
            targetRatio: number;
            diff: number;
        }> = [];

        for (const stock of portfolioData) {
            const currentAmount = stock.calculated?.currentAmount;
            if (!currentAmount) continue;

            const currentAmountDec = new Decimal(currentAmount);
            const currentRatio = currentAmountDec.div(currentTotalDec).times(100);
            const targetRatio = new Decimal(stock.targetRatio ?? 0);
            const diff = currentRatio.minus(targetRatio).abs();

            if (diff.greaterThan(tolerance)) {
                stocksNeedingRebalancing.push({
                    name: stock.name,
                    currentRatio: currentRatio.toNumber(),
                    targetRatio: targetRatio.toNumber(),
                    diff: diff.toNumber(),
                });
            }
        }

        const hasRebalancingNeeds = stocksNeedingRebalancing.length > 0;
        const message = hasRebalancingNeeds
            ? `🔔 리밸런싱이 필요한 종목: ${stocksNeedingRebalancing
                  .map(
                      (s) =>
                          `${s.name}: 현재 ${s.currentRatio.toFixed(1)}% (목표 ${s.targetRatio.toFixed(1)}%)`
                  )
                  .join(', ')}`
            : null;

        return {
            stocksNeedingRebalancing,
            hasRebalancingNeeds,
            message,
        };
    }

    /**
     * @description 리스크 경고 분석
     * @param portfolioData - 계산된 포트폴리오 데이터
     * @param currentTotal - 현재 총 자산
     * @param sectorData - 섹터 데이터
     * @returns 리스크 분석 결과
     */
    static analyzeRiskWarnings(
        portfolioData: CalculatedStock[],
        currentTotal: Decimal,
        sectorData: SectorData[]
    ): RiskAnalysisResult {
        const warnings: string[] = [];
        const currentTotalDec = new Decimal(currentTotal);

        // 총 자산이 0이면 체크 안 함
        if (currentTotalDec.isZero()) {
            return {
                warnings: [],
                hasWarnings: false,
            };
        }

        // 단일 종목 비중 경고
        for (const stock of portfolioData) {
            const currentAmount = new Decimal(stock.calculated?.currentAmount || 0);
            const ratio = currentAmount.div(currentTotalDec).times(100);

            if (ratio.greaterThan(THRESHOLDS.SINGLE_STOCK_WARNING)) {
                warnings.push(`⚠️ ${stock.name}: ${ratio.toFixed(1)}% (단일 종목 비중 높음)`);
            }
        }

        // 섹터 집중도 경고
        for (const sector of sectorData) {
            const percentage = new Decimal(sector.percentage || 0);

            if (percentage.greaterThan(THRESHOLDS.SECTOR_CONCENTRATION_WARNING)) {
                warnings.push(
                    `⚠️ ${sector.sector} 섹터: ${percentage.toFixed(1)}% (섹터 집중도 높음)`
                );
            }
        }

        return {
            warnings,
            hasWarnings: warnings.length > 0,
        };
    }

    /**
     * @description 리스크 경고 메시지 생성
     * @param analysisResult - 리스크 분석 결과
     * @returns 경고 메시지
     */
    static formatRiskWarnings(analysisResult: RiskAnalysisResult): string | null {
        if (!analysisResult.hasWarnings) {
            return null;
        }

        return `🔍 리스크 경고: ${analysisResult.warnings.join(', ')}`;
    }

    /**
     * @description 단일 종목 집중도 확인
     * @param stock - 종목 데이터
     * @param currentTotal - 현재 총 자산
     * @returns 집중도가 높으면 true
     */
    static isStockConcentrated(stock: CalculatedStock, currentTotal: Decimal): boolean {
        const currentTotalDec = new Decimal(currentTotal);
        if (currentTotalDec.isZero()) return false;

        const currentAmount = new Decimal(stock.calculated?.currentAmount || 0);
        const ratio = currentAmount.div(currentTotalDec).times(100);

        return ratio.greaterThan(THRESHOLDS.SINGLE_STOCK_WARNING);
    }

    /**
     * @description 섹터 집중도 확인
     * @param sector - 섹터 데이터
     * @returns 집중도가 높으면 true
     */
    static isSectorConcentrated(sector: SectorData): boolean {
        const percentage = new Decimal(sector.percentage || 0);
        return percentage.greaterThan(THRESHOLDS.SECTOR_CONCENTRATION_WARNING);
    }
}
