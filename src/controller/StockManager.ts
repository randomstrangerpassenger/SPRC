// src/controller/StockManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { Calculator } from '../calculator';
import { Validator } from '../validator';
import { getRatioSum, isInputElement } from '../utils';
import { t } from '../i18n';
import { generateSectorAnalysisHTML } from '../templates';
import type { Portfolio, Stock } from '../types';
import Decimal from 'decimal.js';
import DOMPurify from 'dompurify';

/**
 * @description Field change handler return type
 */
interface FieldChangeResult {
    needsFullRender: boolean;
    needsUIUpdate: boolean;
    needsSave: boolean;
}

/**
 * @description Context for field handlers
 */
interface FieldHandlerContext {
    row: Element;
    activePortfolio: Portfolio;
    field: string;
}

/**
 * @description Field handler function type
 */
type FieldHandler = (
    stockId: string,
    value: string | number | boolean | Decimal,
    context: FieldHandlerContext
) => FieldChangeResult;

/**
 * @class StockManager
 * @description 주식 추가, 삭제, 수정 관리
 */
export class StockManager {
    #fieldHandlers: Map<string, FieldHandler>;

    constructor(
        private state: PortfolioState,
        private view: PortfolioView,
        private debouncedSave: () => void
    ) {
        // Initialize field-specific handlers using Strategy Pattern
        this.#fieldHandlers = new Map<string, FieldHandler>([
            ['manualAmount', this.handleManualAmountChangeStrategy.bind(this)],
            ['name', this.handleMetadataFieldChangeStrategy.bind(this)],
            ['ticker', this.handleMetadataFieldChangeStrategy.bind(this)],
            ['sector', this.handleSectorChangeStrategy.bind(this)],
            ['currentPrice', this.handleCurrentPriceChangeStrategy.bind(this)],
        ]);
    }

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
     * @description 포트폴리오 테이블 변경 핸들러 (Strategy Pattern 적용)
     * @param e - 이벤트
     */
    handlePortfolioBodyChange(e: Event): FieldChangeResult {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        const row = target.closest('div[data-id]');
        if (!row) return { needsFullRender: false, needsUIUpdate: false, needsSave: false };

        const stockId = (row as HTMLElement).dataset.id;
        const field = (target as HTMLInputElement).dataset.field;
        if (!stockId || !field)
            return { needsFullRender: false, needsUIUpdate: false, needsSave: false };

        const rawValue =
            target.type === 'checkbox' && isInputElement(target) ? target.checked : target.value;

        const { isValid, value } = this.validateFieldValue(field, rawValue);
        this.view.toggleInputValidation(target as HTMLInputElement, isValid);

        if (!isValid) {
            return { needsFullRender: false, needsUIUpdate: false, needsSave: false };
        }

        this.state.updateStockProperty(stockId, field as keyof Stock, value);

        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) {
            if (field === 'manualAmount') {
                this.view.updateStockInVirtualData(stockId, 'manualAmount', value);
                this.debouncedSave();
            }
            return { needsFullRender: false, needsUIUpdate: false, needsSave: false };
        }

        const context: FieldHandlerContext = {
            row,
            activePortfolio,
            field,
        };

        // Strategy Pattern: 필드별 핸들러를 맵에서 조회하여 실행
        const handler = this.#fieldHandlers.get(field);
        if (handler) {
            return handler(stockId, value, context);
        }

        // 기본 핸들러: 전체 재계산이 필요한 필드들
        return this.handleOtherFieldChange(stockId, field, value, row, activePortfolio);
    }

    /**
     * @description 필드 값 유효성 검사 (Validator 모듈로 위임)
     */
    private validateFieldValue(
        field: string,
        value: string | number | boolean | Decimal
    ): { isValid: boolean; value: string | number | boolean | Decimal } {
        // 1. Validation (Validator 모듈로 완전히 위임)
        const validationResult = Validator.validateField(field, value);

        if (!validationResult.isValid) {
            return validationResult;
        }

        // 2. Sanitization (텍스트 필드만)
        let sanitizedValue = validationResult.value ?? value;
        if (field === 'name' || field === 'sector') {
            sanitizedValue = DOMPurify.sanitize(String(sanitizedValue));
        }

        return { isValid: true, value: sanitizedValue };
    }

    /**
     * @description manualAmount 변경 처리 (Strategy Pattern)
     */
    private handleManualAmountChangeStrategy(
        stockId: string,
        value: string | number | boolean | Decimal,
        _context: FieldHandlerContext
    ): FieldChangeResult {
        this.view.updateStockInVirtualData(stockId, 'manualAmount', value);
        this.debouncedSave();
        return { needsFullRender: false, needsUIUpdate: false, needsSave: false };
    }

    /**
     * @description 메타데이터 필드 변경 처리 (name, ticker) (Strategy Pattern)
     */
    private handleMetadataFieldChangeStrategy(
        stockId: string,
        value: string | number | boolean | Decimal,
        context: FieldHandlerContext
    ): FieldChangeResult {
        this.view.updateStockInVirtualData(stockId, context.field, value);
        this.debouncedSave();
        return { needsFullRender: false, needsUIUpdate: false, needsSave: false };
    }

    /**
     * @description 섹터 변경 처리 (Strategy Pattern)
     */
    private handleSectorChangeStrategy(
        stockId: string,
        value: string | number | boolean | Decimal,
        context: FieldHandlerContext
    ): FieldChangeResult {
        this.view.updateStockInVirtualData(stockId, 'sector', value);
        // 섹터는 메타데이터이므로 기존 계산된 메트릭을 재사용하고 섹터 분석만 재집계
        this.updateSectorAnalysis(context.activePortfolio, true);
        this.debouncedSave();
        return { needsFullRender: false, needsUIUpdate: false, needsSave: false };
    }

    /**
     * @description 현재가 변경 처리 (Strategy Pattern)
     */
    private handleCurrentPriceChangeStrategy(
        stockId: string,
        _value: string | number | boolean | Decimal,
        context: FieldHandlerContext
    ): FieldChangeResult {
        const stock = context.activePortfolio.portfolioData.find((s: Stock) => s.id === stockId);
        if (stock) {
            // 개별 주식만 재계산
            const calculatedMetrics = Calculator.calculateStockMetrics(stock);
            const exchangeRateDec = new Decimal(context.activePortfolio.settings.exchangeRate);

            if (context.activePortfolio.settings.currentCurrency === 'krw') {
                calculatedMetrics.currentAmountKRW = calculatedMetrics.currentAmount;
                calculatedMetrics.currentAmountUSD =
                    calculatedMetrics.currentAmount.div(exchangeRateDec);
            } else {
                calculatedMetrics.currentAmountUSD = calculatedMetrics.currentAmount;
                calculatedMetrics.currentAmountKRW =
                    calculatedMetrics.currentAmount.times(exchangeRateDec);
            }

            // Update calculated metrics (portfolioData is actually CalculatedStock[] at runtime)
            // Type assertion is safe here as Calculator ensures all stocks have calculated field
            const calculatedStock = stock as CalculatedStock;
            calculatedStock.calculated = calculatedMetrics;

            // 뷰 업데이트
            this.view.updateSingleStockRow(stockId, calculatedMetrics);

            // 기존 계산된 메트릭을 사용하여 섹터 분석만 재집계
            this.updateSectorAnalysis(context.activePortfolio, true);
        }

        this.debouncedSave();
        return { needsFullRender: false, needsUIUpdate: false, needsSave: false };
    }

    /**
     * @description 기타 필드 변경 처리 (전체 재계산 필요)
     */
    private handleOtherFieldChange(
        stockId: string,
        field: string,
        value: string | number | boolean | Decimal,
        row: Element,
        activePortfolio: Portfolio
    ) {
        Calculator.clearPortfolioStateCache();

        const calculatedState = Calculator.calculatePortfolioState({
            portfolioData: activePortfolio.portfolioData,
            exchangeRate: activePortfolio.settings.exchangeRate,
            currentCurrency: activePortfolio.settings.currentCurrency,
        });
        activePortfolio.portfolioData = calculatedState.portfolioData as Stock[];

        this.view.updateVirtualTableData(calculatedState.portfolioData);

        const newRatioSum = getRatioSum(activePortfolio.portfolioData);
        this.view.updateRatioSum(newRatioSum.toNumber());

        this.updateSectorAnalysis(activePortfolio, true);

        this.debouncedSave();

        // isFixedBuyEnabled 특수 처리
        if (field === 'isFixedBuyEnabled') {
            const amountInput = row.querySelector('input[data-field="fixedBuyAmount"]');
            if (isInputElement(amountInput)) {
                amountInput.disabled = !value;
                if (!value) {
                    amountInput.value = '0';
                    this.state.updateStockProperty(stockId, 'fixedBuyAmount', 0);
                    this.debouncedSave();
                }
            }
        }

        return { needsFullRender: false, needsUIUpdate: false, needsSave: false };
    }

    /**
     * @description 섹터 분석 업데이트
     * @param activePortfolio - 활성 포트폴리오
     * @param useExistingState - 기존 계산 상태 재사용 여부
     */
    private updateSectorAnalysis(activePortfolio: Portfolio, useExistingState: boolean) {
        let portfolioData = activePortfolio.portfolioData;

        if (!useExistingState) {
            const calculatedState = Calculator.calculatePortfolioState({
                portfolioData: activePortfolio.portfolioData,
                exchangeRate: activePortfolio.settings.exchangeRate,
                currentCurrency: activePortfolio.settings.currentCurrency,
            });
            portfolioData = calculatedState.portfolioData;
        }

        const newSectorData = Calculator.calculateSectorAnalysis(
            portfolioData,
            activePortfolio.settings.currentCurrency
        );
        this.view.displaySectorAnalysis(
            generateSectorAnalysisHTML(newSectorData, activePortfolio.settings.currentCurrency)
        );
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
        if (!row || !(row instanceof HTMLElement) || !row.dataset.id)
            return { action: null, stockId: null };

        const stockId = row.dataset.id || null;
        const action = (actionButton as HTMLElement).dataset.action || null;

        return { action, stockId };
    }
}
