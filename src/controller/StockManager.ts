// src/controller/StockManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { Calculator } from '../calculator';
import { Validator } from '../validator';
import { getRatioSum } from '../utils';
import { t } from '../i18n';
import { generateSectorAnalysisHTML } from '../templates';
import Decimal from 'decimal.js';
import DOMPurify from 'dompurify';

/**
 * @class StockManager
 * @description 주식 추가, 삭제, 수정 관리
 */
export class StockManager {
    constructor(
        private state: PortfolioState,
        private view: PortfolioView,
        private debouncedSave: () => void
    ) {}

    /**
     * @description 새 주식 추가
     */
    async handleAddNewStock(): Promise<{ needsFullRender: boolean; stockId?: string }> {
        const newStock = await this.state.addNewStock();
        return { needsFullRender: true, stockId: newStock?.id };
    }

    /**
     * @description 주식 삭제
     * @param stockId - 주식 ID
     */
    async handleDeleteStock(stockId: string): Promise<{ needsFullRender: boolean }> {
        const stockName = this.state.getStockById(stockId)?.name || t('defaults.unknownStock');
        const confirmDelete = await this.view.showConfirm(
            t('modal.confirmDeleteStockTitle'),
            t('modal.confirmDeleteStockMsg', { name: stockName })
        );

        if (confirmDelete) {
            if (await this.state.deleteStock(stockId)) {
                Calculator.clearPortfolioStateCache();
                this.view.showToast(t('toast.transactionDeleted'), 'success');
                return { needsFullRender: true };
            } else {
                this.view.showToast(t('toast.lastStockDeleteError'), 'error');
            }
        }
        return { needsFullRender: false };
    }

    /**
     * @description 포트폴리오 테이블 변경 핸들러
     * @param e - 이벤트
     */
    handlePortfolioBodyChange(e: Event): { needsFullRender: boolean; needsUIUpdate: boolean; needsSave: boolean } {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        const row = target.closest('div[data-id]');
        if (!row) return { needsFullRender: false, needsUIUpdate: false, needsSave: false };

        const stockId = (row as HTMLElement).dataset.id;
        const field = (target as HTMLInputElement).dataset.field;
        if (!stockId || !field) return { needsFullRender: false, needsUIUpdate: false, needsSave: false };

        let value: any = target.type === 'checkbox' && target instanceof HTMLInputElement ? target.checked : target.value;
        let isValid = true;

        switch (field) {
            case 'targetRatio':
            case 'currentPrice':
            case 'fixedBuyAmount':
            case 'manualAmount':
                const validationResult = Validator.validateNumericInput(value);
                isValid = validationResult.isValid;
                if (isValid) value = validationResult.value ?? 0;
                break;
            case 'isFixedBuyEnabled':
                value = Boolean(value);
                break;
            case 'ticker':
                const tickerResult = Validator.validateTicker(value);
                isValid = tickerResult.isValid;
                if (isValid) value = tickerResult.value ?? '';
                break;
            case 'name':
            case 'sector':
                const textResult = Validator.validateText(value, field === 'name' ? 50 : 30);
                isValid = textResult.isValid;
                if (isValid) value = DOMPurify.sanitize(textResult.value ?? '');
                break;
            default:
                value = DOMPurify.sanitize(String(value).trim());
                break;
        }

        this.view.toggleInputValidation(target as HTMLInputElement, isValid);

        if (isValid) {
            this.state.updateStockProperty(stockId, field, value);

            // manualAmount는 간단 모드 전용 필드
            if (field === 'manualAmount') {
                this.view.updateStockInVirtualData(stockId, field, value);
                this.debouncedSave();
                return { needsFullRender: false, needsUIUpdate: false, needsSave: false };
            }

            const activePortfolio = this.state.getActivePortfolio();
            if (!activePortfolio) return { needsFullRender: false, needsUIUpdate: false, needsSave: false };

            // ===== [Phase 1.1 최적화] 메타데이터 필드는 재계산 없이 DOM만 업데이트 =====
            if (field === 'name' || field === 'ticker') {
                // 이름과 티커 변경은 계산에 영향을 주지 않으므로 가상 스크롤 데이터만 업데이트
                this.view.updateStockInVirtualData(stockId, field, value);
                this.debouncedSave();
                return { needsFullRender: false, needsUIUpdate: false, needsSave: false };
            }

            if (field === 'sector') {
                // 섹터 변경은 섹터 분석만 재계산하고 가상 스크롤 데이터만 업데이트
                this.view.updateStockInVirtualData(stockId, field, value);

                // 섹터 분석만 재계산 (전체 계산 상태는 이미 캐시되어 있음)
                Calculator.clearPortfolioStateCache();
                const calculatedState = Calculator.calculatePortfolioState({
                    portfolioData: activePortfolio.portfolioData,
                    exchangeRate: activePortfolio.settings.exchangeRate,
                    currentCurrency: activePortfolio.settings.currentCurrency
                });
                const newSectorData = Calculator.calculateSectorAnalysis(
                    calculatedState.portfolioData,
                    activePortfolio.settings.currentCurrency
                );
                this.view.displaySectorAnalysis(
                    generateSectorAnalysisHTML(newSectorData, activePortfolio.settings.currentCurrency)
                );

                this.debouncedSave();
                return { needsFullRender: false, needsUIUpdate: false, needsSave: false };
            }
            // ===== [Phase 1.1 최적화 끝] =====

            // currentPrice 변경 시 부분 업데이트 (최적화)
            if (field === 'currentPrice') {
                const stock = activePortfolio.portfolioData.find((s) => s.id === stockId);
                if (stock) {
                    const calculatedMetrics = Calculator.calculateStockMetrics(stock);
                    const exchangeRateDec = new Decimal(activePortfolio.settings.exchangeRate);

                    if (activePortfolio.settings.currentCurrency === 'krw') {
                        calculatedMetrics.currentAmountKRW = calculatedMetrics.currentAmount;
                        calculatedMetrics.currentAmountUSD = calculatedMetrics.currentAmount.div(exchangeRateDec);
                    } else {
                        calculatedMetrics.currentAmountUSD = calculatedMetrics.currentAmount;
                        calculatedMetrics.currentAmountKRW = calculatedMetrics.currentAmount.times(exchangeRateDec);
                    }

                    this.view.updateSingleStockRow(stockId, calculatedMetrics);

                    // 섹터 분석 재계산
                    Calculator.clearPortfolioStateCache();
                    const calculatedState = Calculator.calculatePortfolioState({
                        portfolioData: activePortfolio.portfolioData,
                        exchangeRate: activePortfolio.settings.exchangeRate,
                        currentCurrency: activePortfolio.settings.currentCurrency
                    });
                    const newSectorData = Calculator.calculateSectorAnalysis(
                        calculatedState.portfolioData,
                        activePortfolio.settings.currentCurrency
                    );
                    this.view.displaySectorAnalysis(
                        generateSectorAnalysisHTML(newSectorData, activePortfolio.settings.currentCurrency)
                    );
                }

                this.debouncedSave();
                return { needsFullRender: false, needsUIUpdate: false, needsSave: false };
            }

            // 기타 필드 변경 시 전체 재계산
            Calculator.clearPortfolioStateCache();

            const calculatedState = Calculator.calculatePortfolioState({
                portfolioData: activePortfolio.portfolioData,
                exchangeRate: activePortfolio.settings.exchangeRate,
                currentCurrency: activePortfolio.settings.currentCurrency
            });
            activePortfolio.portfolioData = calculatedState.portfolioData;

            this.view.updateVirtualTableData(calculatedState.portfolioData);

            const newRatioSum = getRatioSum(activePortfolio.portfolioData);
            this.view.updateRatioSum(newRatioSum.toNumber());

            const newSectorData = Calculator.calculateSectorAnalysis(
                calculatedState.portfolioData,
                activePortfolio.settings.currentCurrency
            );
            this.view.displaySectorAnalysis(
                generateSectorAnalysisHTML(newSectorData, activePortfolio.settings.currentCurrency)
            );

            this.debouncedSave();

            if (field === 'isFixedBuyEnabled') {
                const amountInput = row.querySelector('input[data-field="fixedBuyAmount"]');
                if (amountInput instanceof HTMLInputElement) {
                    amountInput.disabled = !value;
                    if (!value) {
                        amountInput.value = '0';
                        this.state.updateStockProperty(stockId, 'fixedBuyAmount', 0);
                        this.debouncedSave();
                    }
                }
            }
        }

        return { needsFullRender: false, needsUIUpdate: false, needsSave: false };
    }

    /**
     * @description 포트폴리오 테이블 클릭 핸들러
     * @param e - 이벤트
     */
    handlePortfolioBodyClick(e: Event): { action: string | null; stockId: string | null } {
        const target = e.target as HTMLElement;
        const actionButton = target.closest('button[data-action]');
        if (!actionButton) return { action: null, stockId: null };

        const row = actionButton.closest('div[data-id]');
        if (!row?.dataset.id) return { action: null, stockId: null };

        const stockId = (row as HTMLElement).dataset.id;
        const action = (actionButton as HTMLElement).dataset.action || null;

        return { action, stockId };
    }
}