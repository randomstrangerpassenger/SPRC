// src/services/RiskAnalyzerService.ts
import Decimal from 'decimal.js';
import { THRESHOLDS } from '../constants';
import type { CalculatedStock, SectorData } from '../types';

/**
 * @interface RiskAnalysisResult
 * @description Risk analysis result
 */
export interface RiskAnalysisResult {
    warnings: string[];
    hasWarnings: boolean;
}

/**
 * @interface RebalancingAnalysisResult
 * @description Rebalancing analysis result
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
 * @description Portfolio risk and rebalancing analysis service
 * Handles risk analysis logic separated from Controller
 */
export class RiskAnalyzerService {
    /**
     * @description Analyze rebalancing needs
     * @param portfolioData - Calculated portfolio data
     * @param currentTotal - Current total assets
     * @param rebalancingTolerance - Rebalancing tolerance (default: 5%)
     * @returns Rebalancing analysis result
     */
    static analyzeRebalancingNeeds(
        portfolioData: CalculatedStock[],
        currentTotal: Decimal,
        rebalancingTolerance: number = 5
    ): RebalancingAnalysisResult {
        const tolerance = rebalancingTolerance;

        // Skip check if tolerance is 0
        if (tolerance <= 0) {
            return {
                stocksNeedingRebalancing: [],
                hasRebalancingNeeds: false,
                message: null,
            };
        }

        const currentTotalDec = new Decimal(currentTotal);

        // Skip check if total assets is 0
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
            ? `🔔 Stocks requiring rebalancing: ${stocksNeedingRebalancing
                  .map(
                      (s) =>
                          `${s.name}: Current ${s.currentRatio.toFixed(1)}% (Target ${s.targetRatio.toFixed(1)}%)`
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
     * @description Analyze risk warnings
     * @param portfolioData - Calculated portfolio data
     * @param currentTotal - Current total assets
     * @param sectorData - Sector data
     * @returns Risk analysis result
     */
    static analyzeRiskWarnings(
        portfolioData: CalculatedStock[],
        currentTotal: Decimal,
        sectorData: SectorData[]
    ): RiskAnalysisResult {
        const warnings: string[] = [];
        const currentTotalDec = new Decimal(currentTotal);

        // Skip check if total assets is 0
        if (currentTotalDec.isZero()) {
            return {
                warnings: [],
                hasWarnings: false,
            };
        }

        // Single stock concentration warning
        for (const stock of portfolioData) {
            const currentAmount = new Decimal(stock.calculated?.currentAmount || 0);
            const ratio = currentAmount.div(currentTotalDec).times(100);

            if (ratio.greaterThan(THRESHOLDS.SINGLE_STOCK_WARNING)) {
                warnings.push(`⚠️ ${stock.name}: ${ratio.toFixed(1)}% (high single stock concentration)`);
            }
        }

        // Sector concentration warning
        for (const sector of sectorData) {
            const percentage = new Decimal(sector.percentage || 0);

            if (percentage.greaterThan(THRESHOLDS.SECTOR_CONCENTRATION_WARNING)) {
                warnings.push(
                    `⚠️ ${sector.sector} sector: ${percentage.toFixed(1)}% (high sector concentration)`
                );
            }
        }

        return {
            warnings,
            hasWarnings: warnings.length > 0,
        };
    }

    /**
     * @description Generate risk warning message
     * @param analysisResult - Risk analysis result
     * @returns Warning message
     */
    static formatRiskWarnings(analysisResult: RiskAnalysisResult): string | null {
        if (!analysisResult.hasWarnings) {
            return null;
        }

        return `🔍 Risk warning: ${analysisResult.warnings.join(', ')}`;
    }

    /**
     * @description Check single stock concentration
     * @param stock - Stock data
     * @param currentTotal - Current total assets
     * @returns Returns true if concentration is high
     */
    static isStockConcentrated(stock: CalculatedStock, currentTotal: Decimal): boolean {
        const currentTotalDec = new Decimal(currentTotal);
        if (currentTotalDec.isZero()) return false;

        const currentAmount = new Decimal(stock.calculated?.currentAmount || 0);
        const ratio = currentAmount.div(currentTotalDec).times(100);

        return ratio.greaterThan(THRESHOLDS.SINGLE_STOCK_WARNING);
    }

    /**
     * @description Check sector concentration
     * @param sector - Sector data
     * @returns Returns true if concentration is high
     */
    static isSectorConcentrated(sector: SectorData): boolean {
        const percentage = new Decimal(sector.percentage || 0);
        return percentage.greaterThan(THRESHOLDS.SECTOR_CONCENTRATION_WARNING);
    }
}
