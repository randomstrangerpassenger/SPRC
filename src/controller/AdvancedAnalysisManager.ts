// src/controller/AdvancedAnalysisManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { TaxLotService } from '../services/TaxLotService';
import { TransactionAnalysisService } from '../services/TransactionAnalysisService';
import { logger } from '../services/Logger';
import Decimal from 'decimal.js';

/**
 * @class AdvancedAnalysisManager
 * @description Tax-Lot Accounting 및 거래 내역 분석 관리 (Phase 4.15 & 4.16)
 */
export class AdvancedAnalysisManager {
    #state: PortfolioState;
    #view: PortfolioView;

    constructor(state: PortfolioState, view: PortfolioView) {
        this.#state = state;
        this.#view = view;
    }

    /**
     * @description Tax Lot 분석 보기
     */
    async handleShowTaxLotAnalysis(): Promise<void> {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) {
            this.#view.showToast('포트폴리오를 선택해주세요.', 'warning');
            return;
        }

        try {
            const analyses = activePortfolio.portfolioData
                .filter((stock) => stock.transactions.length > 0)
                .map((stock) => TaxLotService.analyzeTaxLots(stock, 'FIFO'));

            if (analyses.length === 0) {
                this.#view.showToast('거래 내역이 없습니다.', 'info');
                return;
            }

            this.#view.advancedAnalysisRenderer.showTaxLotSection();
            this.#view.advancedAnalysisRenderer.displayTaxLotAnalysis(
                analyses,
                activePortfolio.settings.currentCurrency
            );

            this.#view.showToast('Tax Lot 분석을 표시합니다.', 'success');
            logger.info('Tax lot analysis displayed', 'AdvancedAnalysisManager');
        } catch (error) {
            logger.error('Failed to display tax lot analysis', 'AdvancedAnalysisManager', error);
            this.#view.showToast('Tax Lot 분석을 표시하는데 실패했습니다.', 'error');
        }
    }

    /**
     * @description 세금 최적화 매도 전략 계산
     */
    async handleCalculateTaxOptimizedSale(): Promise<void> {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) {
            this.#view.showToast('포트폴리오를 선택해주세요.', 'warning');
            return;
        }

        try {
            // Get user input for stock and quantity to sell
            const stockId = await this.#view.showPrompt(
                '세금 최적화 매도',
                '매도할 종목의 ID를 입력하세요:'
            );

            if (!stockId) return;

            const stock = activePortfolio.portfolioData.find((s) => s.id === stockId);
            if (!stock) {
                this.#view.showToast('종목을 찾을 수 없습니다.', 'error');
                return;
            }

            const quantityStr = await this.#view.showPrompt(
                '세금 최적화 매도',
                `${stock.ticker} - 매도할 수량을 입력하세요:`
            );

            if (!quantityStr) return;

            const quantityToSell = new Decimal(quantityStr);
            if (quantityToSell.isZero() || quantityToSell.isNegative()) {
                this.#view.showToast('유효한 수량을 입력하세요.', 'error');
                return;
            }

            const currentPrice = stock.currentPrice instanceof Decimal
                ? stock.currentPrice
                : new Decimal(stock.currentPrice || 0);

            const taxSettings = TaxLotService.getDefaultTaxSettings();

            const optimizedSale = TaxLotService.calculateOptimizedSale(
                stock,
                quantityToSell,
                currentPrice,
                taxSettings
            );

            this.#view.advancedAnalysisRenderer.showTaxLotSection();
            this.#view.advancedAnalysisRenderer.displayTaxOptimizedSale(
                optimizedSale,
                activePortfolio.settings.currentCurrency
            );

            this.#view.showToast('세금 최적화 매도 전략을 계산했습니다.', 'success');
            logger.info('Tax optimized sale calculated', 'AdvancedAnalysisManager');
        } catch (error) {
            logger.error('Failed to calculate tax optimized sale', 'AdvancedAnalysisManager', error);
            this.#view.showToast('세금 최적화 계산에 실패했습니다.', 'error');
        }
    }

    /**
     * @description 거래 내역 분석 보기
     */
    async handleShowTransactionAnalysis(): Promise<void> {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) {
            this.#view.showToast('포트폴리오를 선택해주세요.', 'warning');
            return;
        }

        try {
            const feeRate = activePortfolio.settings.tradingFeeRate || 0;
            const taxRate = activePortfolio.settings.taxRate || 0;

            const summary = TransactionAnalysisService.analyzePortfolio(
                activePortfolio.portfolioData,
                feeRate,
                taxRate
            );

            if (summary.totalTransactions === 0) {
                this.#view.showToast('거래 내역이 없습니다.', 'info');
                return;
            }

            this.#view.advancedAnalysisRenderer.showTransactionAnalysisSection();
            this.#view.advancedAnalysisRenderer.displayTransactionSummary(
                summary,
                activePortfolio.settings.currentCurrency
            );

            this.#view.showToast('거래 내역 분석을 표시합니다.', 'success');
            logger.info('Transaction analysis displayed', 'AdvancedAnalysisManager');
        } catch (error) {
            logger.error('Failed to display transaction analysis', 'AdvancedAnalysisManager', error);
            this.#view.showToast('거래 내역 분석을 표시하는데 실패했습니다.', 'error');
        }
    }
}
