// src/controller/AssetAllocationManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { Calculator } from '../calculator';
import { AssetAllocationService } from '../services/AssetAllocationService';
import { ChartLoaderService } from '../services/ChartLoaderService';
import { logger } from '../services/Logger';

/**
 * @class AssetAllocationManager
 * @description 자산 배분 분석 관리 (Phase 4.14)
 */
export class AssetAllocationManager {
    #state: PortfolioState;
    #view: PortfolioView;

    constructor(state: PortfolioState, view: PortfolioView) {
        this.#state = state;
        this.#view = view;
    }

    /**
     * @description 자산 유형별 배분 보기
     */
    async handleShowAssetTypeAllocation(): Promise<void> {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) {
            this.#view.showToast('포트폴리오를 선택해주세요.', 'warning');
            return;
        }

        try {
            // Calculate current portfolio
            const calculated = Calculator.calculateAll(
                activePortfolio.portfolioData,
                activePortfolio.settings.exchangeRate,
                activePortfolio.settings.mainMode
            );

            if (calculated.length === 0) {
                this.#view.showToast('포트폴리오에 종목이 없습니다.', 'info');
                return;
            }

            // Analyze asset allocation
            const analysis = AssetAllocationService.analyzeAssetAllocation(calculated);

            if (analysis.byAssetType.length === 0) {
                this.#view.showToast('자산 배분 데이터가 없습니다.', 'info');
                return;
            }

            // Load Chart.js and display
            const ChartClass = await ChartLoaderService.getChart();

            this.#view.assetAllocationRenderer.displayAssetTypeAllocation(
                ChartClass,
                analysis.byAssetType,
                activePortfolio.settings.currentCurrency
            );

            this.#view.showToast('자산 유형별 배분을 표시합니다.', 'success');
            logger.info('Asset type allocation displayed', 'AssetAllocationManager');
        } catch (error) {
            logger.error('Failed to display asset type allocation', 'AssetAllocationManager', error);
            this.#view.showToast('자산 유형별 배분을 표시하는데 실패했습니다.', 'error');
        }
    }

    /**
     * @description 국가별 배분 보기
     */
    async handleShowCountryAllocation(): Promise<void> {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) {
            this.#view.showToast('포트폴리오를 선택해주세요.', 'warning');
            return;
        }

        try {
            // Calculate current portfolio
            const calculated = Calculator.calculateAll(
                activePortfolio.portfolioData,
                activePortfolio.settings.exchangeRate,
                activePortfolio.settings.mainMode
            );

            if (calculated.length === 0) {
                this.#view.showToast('포트폴리오에 종목이 없습니다.', 'info');
                return;
            }

            // Analyze asset allocation
            const analysis = AssetAllocationService.analyzeAssetAllocation(calculated);

            if (analysis.byCountry.length === 0) {
                this.#view.showToast('국가별 배분 데이터가 없습니다.', 'info');
                return;
            }

            // Load Chart.js and display
            const ChartClass = await ChartLoaderService.getChart();

            this.#view.assetAllocationRenderer.displayCountryAllocation(
                ChartClass,
                analysis.byCountry,
                activePortfolio.settings.currentCurrency
            );

            this.#view.showToast('국가별 배분을 표시합니다.', 'success');
            logger.info('Country allocation displayed', 'AssetAllocationManager');
        } catch (error) {
            logger.error('Failed to display country allocation', 'AssetAllocationManager', error);
            this.#view.showToast('국가별 배분을 표시하는데 실패했습니다.', 'error');
        }
    }

    /**
     * @description 히트맵 보기 (국가 x 자산 유형)
     */
    async handleShowHeatmap(): Promise<void> {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) {
            this.#view.showToast('포트폴리오를 선택해주세요.', 'warning');
            return;
        }

        try {
            // Calculate current portfolio
            const calculated = Calculator.calculateAll(
                activePortfolio.portfolioData,
                activePortfolio.settings.exchangeRate,
                activePortfolio.settings.mainMode
            );

            if (calculated.length === 0) {
                this.#view.showToast('포트폴리오에 종목이 없습니다.', 'info');
                return;
            }

            // Generate heatmap
            const heatmapCells = AssetAllocationService.generateHeatmap(calculated);

            if (heatmapCells.length === 0) {
                this.#view.showToast('히트맵 데이터가 없습니다.', 'info');
                return;
            }

            // Load Chart.js and display
            const ChartClass = await ChartLoaderService.getChart();

            this.#view.assetAllocationRenderer.displayHeatmap(
                ChartClass,
                heatmapCells,
                activePortfolio.settings.currentCurrency
            );

            this.#view.showToast('자산 배분 히트맵을 표시합니다.', 'success');
            logger.info('Heatmap displayed', 'AssetAllocationManager');
        } catch (error) {
            logger.error('Failed to display heatmap', 'AssetAllocationManager', error);
            this.#view.showToast('히트맵을 표시하는데 실패했습니다.', 'error');
        }
    }
}
