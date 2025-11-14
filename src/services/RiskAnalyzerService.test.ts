// src/services/RiskAnalyzerService.test.ts
import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { RiskAnalyzerService } from './RiskAnalyzerService';
import type { CalculatedStock, SectorData } from '../types';

describe('RiskAnalyzerService', () => {
    describe('analyzeRebalancingNeeds', () => {
        it('should identify stocks needing rebalancing', () => {
            const portfolioData: CalculatedStock[] = [
                {
                    id: 'stock-1',
                    name: 'Stock A',
                    ticker: 'A',
                    sector: 'Tech',
                    targetRatio: new Decimal(30),
                    currentPrice: new Decimal(100),
                    fixedBuyAmount: new Decimal(0),
                    isFixedBuyEnabled: false,
                    manualAmount: new Decimal(0),
                    transactions: [],
                    calculated: {
                        currentAmount: 5000, // 50% of 10000
                        currentRatio: 50,
                        currentQuantity: 50,
                        currentValue: 5000,
                        deviation: 20,
                        targetAmount: 3000,
                        targetQuantity: 30,
                        buyAmount: 0,
                        buyQuantity: 0,
                        sellAmount: 2000,
                        sellQuantity: 20,
                    },
                },
                {
                    id: 'stock-2',
                    name: 'Stock B',
                    ticker: 'B',
                    sector: 'Finance',
                    targetRatio: new Decimal(70),
                    currentPrice: new Decimal(100),
                    fixedBuyAmount: new Decimal(0),
                    isFixedBuyEnabled: false,
                    manualAmount: new Decimal(0),
                    transactions: [],
                    calculated: {
                        currentAmount: 5000, // 50% of 10000
                        currentRatio: 50,
                        currentQuantity: 50,
                        currentValue: 5000,
                        deviation: -20,
                        targetAmount: 7000,
                        targetQuantity: 70,
                        buyAmount: 2000,
                        buyQuantity: 20,
                        sellAmount: 0,
                        sellQuantity: 0,
                    },
                },
            ];

            const result = RiskAnalyzerService.analyzeRebalancingNeeds(
                portfolioData,
                new Decimal(10000),
                10
            );

            expect(result.hasRebalancingNeeds).toBe(true);
            expect(result.stocksNeedingRebalancing).toHaveLength(2);
            expect(result.message).toContain('Stock A');
            expect(result.message).toContain('Stock B');
        });

        it('should return no rebalancing needs when within tolerance', () => {
            const portfolioData: CalculatedStock[] = [
                {
                    id: 'stock-1',
                    name: 'Stock A',
                    ticker: 'A',
                    sector: 'Tech',
                    targetRatio: new Decimal(50),
                    currentPrice: new Decimal(100),
                    fixedBuyAmount: new Decimal(0),
                    isFixedBuyEnabled: false,
                    manualAmount: new Decimal(0),
                    transactions: [],
                    calculated: {
                        currentAmount: 5100, // 51% of 10000 (within 5% tolerance)
                        currentRatio: 51,
                        currentQuantity: 51,
                        currentValue: 5100,
                        deviation: 1,
                        targetAmount: 5000,
                        targetQuantity: 50,
                        buyAmount: 0,
                        buyQuantity: 0,
                        sellAmount: 100,
                        sellQuantity: 1,
                    },
                },
            ];

            const result = RiskAnalyzerService.analyzeRebalancingNeeds(
                portfolioData,
                new Decimal(10000),
                5
            );

            expect(result.hasRebalancingNeeds).toBe(false);
            expect(result.stocksNeedingRebalancing).toHaveLength(0);
            expect(result.message).toBeNull();
        });

        it('should return no rebalancing needs when tolerance is 0', () => {
            const portfolioData: CalculatedStock[] = [
                {
                    id: 'stock-1',
                    name: 'Stock A',
                    ticker: 'A',
                    sector: 'Tech',
                    targetRatio: new Decimal(50),
                    currentPrice: new Decimal(100),
                    fixedBuyAmount: new Decimal(0),
                    isFixedBuyEnabled: false,
                    manualAmount: new Decimal(0),
                    transactions: [],
                    calculated: {
                        currentAmount: 6000,
                        currentRatio: 60,
                        currentQuantity: 60,
                        currentValue: 6000,
                        deviation: 10,
                        targetAmount: 5000,
                        targetQuantity: 50,
                        buyAmount: 0,
                        buyQuantity: 0,
                        sellAmount: 1000,
                        sellQuantity: 10,
                    },
                },
            ];

            const result = RiskAnalyzerService.analyzeRebalancingNeeds(
                portfolioData,
                new Decimal(10000),
                0
            );

            expect(result.hasRebalancingNeeds).toBe(false);
            expect(result.stocksNeedingRebalancing).toHaveLength(0);
        });

        it('should return no rebalancing needs when total is zero', () => {
            const portfolioData: CalculatedStock[] = [];

            const result = RiskAnalyzerService.analyzeRebalancingNeeds(
                portfolioData,
                new Decimal(0),
                5
            );

            expect(result.hasRebalancingNeeds).toBe(false);
            expect(result.stocksNeedingRebalancing).toHaveLength(0);
        });
    });

    describe('analyzeRiskWarnings', () => {
        it('should identify single stock concentration risk', () => {
            const portfolioData: CalculatedStock[] = [
                {
                    id: 'stock-1',
                    name: 'Stock A',
                    ticker: 'A',
                    sector: 'Tech',
                    targetRatio: new Decimal(40),
                    currentPrice: new Decimal(100),
                    fixedBuyAmount: new Decimal(0),
                    isFixedBuyEnabled: false,
                    manualAmount: new Decimal(0),
                    transactions: [],
                    calculated: {
                        currentAmount: 4000, // 40% of 10000 (exceeds 30% threshold)
                        currentRatio: 40,
                        currentQuantity: 40,
                        currentValue: 4000,
                        deviation: 0,
                        targetAmount: 4000,
                        targetQuantity: 40,
                        buyAmount: 0,
                        buyQuantity: 0,
                        sellAmount: 0,
                        sellQuantity: 0,
                    },
                },
            ];

            const sectorData: SectorData[] = [];

            const result = RiskAnalyzerService.analyzeRiskWarnings(
                portfolioData,
                new Decimal(10000),
                sectorData
            );

            expect(result.hasWarnings).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]).toContain('Stock A');
            expect(result.warnings[0]).toContain('단일 종목 비중 높음');
        });

        it('should identify sector concentration risk', () => {
            const portfolioData: CalculatedStock[] = [];

            const sectorData: SectorData[] = [
                {
                    sector: 'Tech',
                    totalValue: 4500,
                    percentage: 45, // Exceeds 40% threshold
                    stocks: [],
                },
            ];

            const result = RiskAnalyzerService.analyzeRiskWarnings(
                portfolioData,
                new Decimal(10000),
                sectorData
            );

            expect(result.hasWarnings).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]).toContain('Tech 섹터');
            expect(result.warnings[0]).toContain('섹터 집중도 높음');
        });

        it('should return no warnings when risks are within thresholds', () => {
            const portfolioData: CalculatedStock[] = [
                {
                    id: 'stock-1',
                    name: 'Stock A',
                    ticker: 'A',
                    sector: 'Tech',
                    targetRatio: new Decimal(25),
                    currentPrice: new Decimal(100),
                    fixedBuyAmount: new Decimal(0),
                    isFixedBuyEnabled: false,
                    manualAmount: new Decimal(0),
                    transactions: [],
                    calculated: {
                        currentAmount: 2500, // 25% (below 30% threshold)
                        currentRatio: 25,
                        currentQuantity: 25,
                        currentValue: 2500,
                        deviation: 0,
                        targetAmount: 2500,
                        targetQuantity: 25,
                        buyAmount: 0,
                        buyQuantity: 0,
                        sellAmount: 0,
                        sellQuantity: 0,
                    },
                },
            ];

            const sectorData: SectorData[] = [
                {
                    sector: 'Tech',
                    totalValue: 3500,
                    percentage: 35, // Below 40% threshold
                    stocks: [],
                },
            ];

            const result = RiskAnalyzerService.analyzeRiskWarnings(
                portfolioData,
                new Decimal(10000),
                sectorData
            );

            expect(result.hasWarnings).toBe(false);
            expect(result.warnings).toHaveLength(0);
        });

        it('should return no warnings when total is zero', () => {
            const portfolioData: CalculatedStock[] = [];
            const sectorData: SectorData[] = [];

            const result = RiskAnalyzerService.analyzeRiskWarnings(
                portfolioData,
                new Decimal(0),
                sectorData
            );

            expect(result.hasWarnings).toBe(false);
            expect(result.warnings).toHaveLength(0);
        });
    });

    describe('formatRiskWarnings', () => {
        it('should format risk warnings with message', () => {
            const analysisResult = {
                warnings: ['⚠️ Warning 1', '⚠️ Warning 2'],
                hasWarnings: true,
            };

            const message = RiskAnalyzerService.formatRiskWarnings(analysisResult);

            expect(message).toBe('🔍 리스크 경고: ⚠️ Warning 1, ⚠️ Warning 2');
        });

        it('should return null when no warnings', () => {
            const analysisResult = {
                warnings: [],
                hasWarnings: false,
            };

            const message = RiskAnalyzerService.formatRiskWarnings(analysisResult);

            expect(message).toBeNull();
        });
    });

    describe('isStockConcentrated', () => {
        it('should return true when stock exceeds threshold', () => {
            const stock: CalculatedStock = {
                id: 'stock-1',
                name: 'Stock A',
                ticker: 'A',
                sector: 'Tech',
                targetRatio: new Decimal(40),
                currentPrice: new Decimal(100),
                fixedBuyAmount: new Decimal(0),
                isFixedBuyEnabled: false,
                manualAmount: new Decimal(0),
                transactions: [],
                calculated: {
                    currentAmount: 4000, // 40%
                    currentRatio: 40,
                    currentQuantity: 40,
                    currentValue: 4000,
                    deviation: 0,
                    targetAmount: 4000,
                    targetQuantity: 40,
                    buyAmount: 0,
                    buyQuantity: 0,
                    sellAmount: 0,
                    sellQuantity: 0,
                },
            };

            const result = RiskAnalyzerService.isStockConcentrated(stock, new Decimal(10000));

            expect(result).toBe(true);
        });

        it('should return false when stock is below threshold', () => {
            const stock: CalculatedStock = {
                id: 'stock-1',
                name: 'Stock A',
                ticker: 'A',
                sector: 'Tech',
                targetRatio: new Decimal(25),
                currentPrice: new Decimal(100),
                fixedBuyAmount: new Decimal(0),
                isFixedBuyEnabled: false,
                manualAmount: new Decimal(0),
                transactions: [],
                calculated: {
                    currentAmount: 2500, // 25%
                    currentRatio: 25,
                    currentQuantity: 25,
                    currentValue: 2500,
                    deviation: 0,
                    targetAmount: 2500,
                    targetQuantity: 25,
                    buyAmount: 0,
                    buyQuantity: 0,
                    sellAmount: 0,
                    sellQuantity: 0,
                },
            };

            const result = RiskAnalyzerService.isStockConcentrated(stock, new Decimal(10000));

            expect(result).toBe(false);
        });
    });

    describe('isSectorConcentrated', () => {
        it('should return true when sector exceeds threshold', () => {
            const sector: SectorData = {
                sector: 'Tech',
                totalValue: 4500,
                percentage: 45,
                stocks: [],
            };

            const result = RiskAnalyzerService.isSectorConcentrated(sector);

            expect(result).toBe(true);
        });

        it('should return false when sector is below threshold', () => {
            const sector: SectorData = {
                sector: 'Tech',
                totalValue: 3500,
                percentage: 35,
                stocks: [],
            };

            const result = RiskAnalyzerService.isSectorConcentrated(sector);

            expect(result).toBe(false);
        });
    });
});
