// src/services/AssetAllocationService.ts
import Decimal from 'decimal.js';
import type {
    CalculatedStock,
    AssetAllocationAnalysis,
    AssetTypeAllocation,
    CountryAllocation,
    HeatmapCell,
    AssetType,
} from '../types';
import { logger } from './Logger';

/**
 * @class AssetAllocationService
 * @description 자산 배분 분석 서비스 (자산 유형별, 국가별 분산 분석)
 */
export class AssetAllocationService {
    /**
     * @description 포트폴리오의 자산 배분 분석
     * @param calculatedData - 계산된 포트폴리오 데이터
     * @returns AssetAllocationAnalysis
     */
    static analyzeAssetAllocation(calculatedData: CalculatedStock[]): AssetAllocationAnalysis {
        const totalValue = calculatedData.reduce(
            (sum, stock) => sum.plus(stock.calculated.currentAmount),
            new Decimal(0)
        );

        if (totalValue.isZero()) {
            return {
                totalValue: new Decimal(0),
                byAssetType: [],
                byCountry: [],
            };
        }

        const byAssetType = this.analyzeByAssetType(calculatedData, totalValue);
        const byCountry = this.analyzeByCountry(calculatedData, totalValue);
        const diversificationScore = this.calculateDiversificationScore(byAssetType, byCountry);

        return {
            totalValue,
            byAssetType,
            byCountry,
            diversificationScore,
        };
    }

    /**
     * @description 자산 유형별 배분 분석
     * @param calculatedData - 계산된 포트폴리오 데이터
     * @param totalValue - 전체 포트폴리오 가치
     * @returns AssetTypeAllocation[]
     */
    private static analyzeByAssetType(
        calculatedData: CalculatedStock[],
        totalValue: Decimal
    ): AssetTypeAllocation[] {
        // Group by asset type
        const groupedByType = new Map<AssetType | 'unclassified', CalculatedStock[]>();

        calculatedData.forEach((stock) => {
            const assetType = stock.assetType || 'unclassified';
            if (!groupedByType.has(assetType)) {
                groupedByType.set(assetType, []);
            }
            groupedByType.get(assetType)!.push(stock);
        });

        // Calculate allocations
        const allocations: AssetTypeAllocation[] = [];

        groupedByType.forEach((stocks, assetType) => {
            const typeValue = stocks.reduce(
                (sum, stock) => sum.plus(stock.calculated.currentAmount),
                new Decimal(0)
            );

            const percentage = totalValue.isZero()
                ? new Decimal(0)
                : typeValue.div(totalValue).times(100);

            const stockDetails = stocks.map((stock) => ({
                ticker: stock.ticker,
                name: stock.name,
                value: stock.calculated.currentAmount,
                percentage: totalValue.isZero()
                    ? new Decimal(0)
                    : stock.calculated.currentAmount.div(totalValue).times(100),
            }));

            allocations.push({
                assetType,
                totalValue: typeValue,
                percentage,
                stockCount: stocks.length,
                stocks: stockDetails,
            });
        });

        // Sort by percentage (descending)
        allocations.sort((a, b) => b.percentage.comparedTo(a.percentage));

        return allocations;
    }

    /**
     * @description 국가별 배분 분석
     * @param calculatedData - 계산된 포트폴리오 데이터
     * @param totalValue - 전체 포트폴리오 가치
     * @returns CountryAllocation[]
     */
    private static analyzeByCountry(
        calculatedData: CalculatedStock[],
        totalValue: Decimal
    ): CountryAllocation[] {
        // Group by country
        const groupedByCountry = new Map<string, CalculatedStock[]>();

        calculatedData.forEach((stock) => {
            const country = stock.country || 'unclassified';
            if (!groupedByCountry.has(country)) {
                groupedByCountry.set(country, []);
            }
            groupedByCountry.get(country)!.push(stock);
        });

        // Calculate allocations
        const allocations: CountryAllocation[] = [];

        groupedByCountry.forEach((stocks, country) => {
            const countryValue = stocks.reduce(
                (sum, stock) => sum.plus(stock.calculated.currentAmount),
                new Decimal(0)
            );

            const percentage = totalValue.isZero()
                ? new Decimal(0)
                : countryValue.div(totalValue).times(100);

            const stockDetails = stocks.map((stock) => ({
                ticker: stock.ticker,
                name: stock.name,
                value: stock.calculated.currentAmount,
                percentage: totalValue.isZero()
                    ? new Decimal(0)
                    : stock.calculated.currentAmount.div(totalValue).times(100),
            }));

            allocations.push({
                country,
                countryName: this.getCountryName(country),
                totalValue: countryValue,
                percentage,
                stockCount: stocks.length,
                stocks: stockDetails,
            });
        });

        // Sort by percentage (descending)
        allocations.sort((a, b) => b.percentage.comparedTo(a.percentage));

        return allocations;
    }

    /**
     * @description 히트맵 데이터 생성 (국가 x 자산 유형)
     * @param calculatedData - 계산된 포트폴리오 데이터
     * @returns HeatmapCell[]
     */
    static generateHeatmap(calculatedData: CalculatedStock[]): HeatmapCell[] {
        const totalValue = calculatedData.reduce(
            (sum, stock) => sum.plus(stock.calculated.currentAmount),
            new Decimal(0)
        );

        if (totalValue.isZero()) {
            return [];
        }

        // Group by country and asset type
        const heatmapData = new Map<string, Decimal>(); // key: "country|assetType"

        calculatedData.forEach((stock) => {
            const country = stock.country || 'unclassified';
            const assetType = stock.assetType || 'unclassified';
            const key = `${country}|${assetType}`;

            const currentValue = heatmapData.get(key) || new Decimal(0);
            heatmapData.set(key, currentValue.plus(stock.calculated.currentAmount));
        });

        // Convert to HeatmapCell array
        const cells: HeatmapCell[] = [];

        heatmapData.forEach((value, key) => {
            const [country, assetType] = key.split('|');
            const percentage = value.div(totalValue).times(100);

            cells.push({
                row: this.getCountryName(country),
                col: this.getAssetTypeName(assetType as AssetType | 'unclassified'),
                value,
                percentage,
            });
        });

        return cells;
    }

    /**
     * @description 분산 점수 계산 (0-100, 높을수록 분산 잘 됨)
     * @param assetTypeAllocations - 자산 유형별 배분
     * @param countryAllocations - 국가별 배분
     * @returns Decimal
     */
    private static calculateDiversificationScore(
        assetTypeAllocations: AssetTypeAllocation[],
        countryAllocations: CountryAllocation[]
    ): Decimal {
        // Herfindahl-Hirschman Index (HHI) 기반 점수 계산
        // HHI는 집중도를 나타내므로, 1 - (HHI/10000) * 100 으로 분산 점수 계산

        // Asset type HHI
        const assetTypeHHI = assetTypeAllocations.reduce(
            (sum, allocation) => sum.plus(allocation.percentage.pow(2)),
            new Decimal(0)
        );

        // Country HHI
        const countryHHI = countryAllocations.reduce(
            (sum, allocation) => sum.plus(allocation.percentage.pow(2)),
            new Decimal(0)
        );

        // Average HHI
        const avgHHI = assetTypeHHI.plus(countryHHI).div(2);

        // Diversification score (0-100)
        // 완전 분산 (각 4개로 25%씩) = HHI 2500 → score 75
        // 완전 집중 (100% 한 곳) = HHI 10000 → score 0
        const score = new Decimal(100).minus(avgHHI.div(100));

        return Decimal.max(0, Decimal.min(100, score));
    }

    /**
     * @description 국가 코드를 국가명으로 변환
     * @param countryCode - 국가 코드 (ISO 3166-1 alpha-2)
     * @returns 국가명
     */
    private static getCountryName(countryCode: string): string {
        const countryNames: Record<string, string> = {
            US: '미국',
            KR: '한국',
            CN: '중국',
            JP: '일본',
            DE: '독일',
            GB: '영국',
            FR: '프랑스',
            CA: '캐나다',
            AU: '호주',
            IN: '인도',
            BR: '브라질',
            unclassified: '미분류',
        };

        return countryNames[countryCode] || countryCode;
    }

    /**
     * @description 자산 유형 코드를 한글명으로 변환
     * @param assetType - 자산 유형 코드
     * @returns 자산 유형 한글명
     */
    private static getAssetTypeName(assetType: AssetType | 'unclassified'): string {
        const assetTypeNames: Record<AssetType | 'unclassified', string> = {
            stock: '주식',
            bond: '채권',
            cash: '현금',
            etf: 'ETF',
            other: '기타',
            unclassified: '미분류',
        };

        return assetTypeNames[assetType];
    }
}
