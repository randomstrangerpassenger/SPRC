// src/view/VirtualScrollManager.ts
// ===== [Phase 4.1 리팩토링] 모듈 분리 =====
import { formatCurrency, escapeHTML } from '../utils';
import { t } from '../i18n';
import Decimal from 'decimal.js';
import { DECIMAL_ZERO } from '../constants';
import type { CalculatedStock } from '../types';
import { getGridTemplate } from './DOMHelpers';
import { createStockRowFragment } from './RowRenderer';
// ===== [Phase 4.1 리팩토링 끝] =====

// 가상 스크롤 상수
const ROW_INPUT_HEIGHT = 60;
const ROW_OUTPUT_HEIGHT = 50;
const ROW_PAIR_HEIGHT = ROW_INPUT_HEIGHT + ROW_OUTPUT_HEIGHT;
const VISIBLE_ROWS_BUFFER = 5;

/**
 * @class VirtualScrollManager
 * @description 가상 스크롤 관리 - 대량 데이터를 효율적으로 렌더링
 */
export class VirtualScrollManager {
    private dom: any;
    private _virtualData: CalculatedStock[] = [];
    private _scrollWrapper: HTMLElement | null = null;
    private _scrollSpacer: HTMLElement | null = null;
    private _scrollContent: HTMLElement | null = null;
    private _viewportHeight: number = 0;
    private _renderedStartIndex: number = -1;
    private _renderedEndIndex: number = -1;
    private _scrollHandler: (() => void) | null = null;
    private _currentMainMode: 'add' | 'sell' | 'simple' = 'add';
    private _currentCurrency: 'krw' | 'usd' = 'krw';

    // ===== [Phase 2.1 최적화] DOM 참조 캐싱 =====
    private _rowCache: Map<string, { inputRow: HTMLElement | null; outputRow: HTMLElement | null }> = new Map();
    // ===== [Phase 2.1 최적화 끝] =====

    constructor(dom: any) {
        this.dom = dom;
        this.initializeScrollElements();
    }

    /**
     * @description 스크롤 요소들을 초기화합니다.
     */
    private initializeScrollElements(): void {
        this._scrollWrapper = this.dom.virtualScrollWrapper;
        this._scrollSpacer = this.dom.virtualScrollSpacer;
        this._scrollContent = this.dom.virtualScrollContent;
        this._viewportHeight = this._scrollWrapper ? this._scrollWrapper.clientHeight : 600;
    }

    /**
     * @description 테이블 헤더를 업데이트합니다.
     * @param currency - 통화 모드
     * @param mainMode - 메인 모드
     */
    updateTableHeader(currency: 'krw' | 'usd', mainMode: 'add' | 'sell' | 'simple'): void {
        this._currentMainMode = mainMode;
        this._currentCurrency = currency;
        const header = this.dom.virtualTableHeader;
        if (!header) return;

        header.style.gridTemplateColumns = getGridTemplate(mainMode);

        const currencySymbol = currency.toLowerCase() === 'usd' ? t('ui.usd') : t('ui.krw');
        let headersHTML = '';

        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            if (mainMode === 'simple') {
                headersHTML = `
                    <div class="virtual-cell">${t('ui.stockName')}</div>
                    <div class="virtual-cell">${t('ui.ticker')}</div>
                    <div class="virtual-cell align-right">${t('ui.targetRatio')}(%)</div>
                    <div class="virtual-cell align-right">보유 금액(${currencySymbol})</div>
                    <div class="virtual-cell align-center">${t('ui.action')}</div>
                `;
            } else {
                headersHTML = `
                    <div class="virtual-cell">${t('ui.stockName')}</div>
                    <div class="virtual-cell">${t('ui.ticker')}</div>
                    <div class="virtual-cell align-right">${t('ui.targetRatio')}(%)</div>
                    <div class="virtual-cell align-center">${t('ui.action')}</div>
                `;
            }
        } else {
            if (mainMode === 'simple') {
                headersHTML = `
                    <div class="virtual-cell">${t('ui.stockName')}</div>
                    <div class="virtual-cell">${t('ui.ticker')}</div>
                    <div class="virtual-cell align-right">${t('ui.targetRatio')}(%)</div>
                    <div class="virtual-cell align-right">보유 금액(${currencySymbol})</div>
                    <div class="virtual-cell align-center">${t('ui.fixedBuy')}(${currencySymbol})</div>
                    <div class="virtual-cell align-center">${t('ui.action')}</div>
                `;
            } else {
                headersHTML = `
                    <div class="virtual-cell">${t('ui.stockName')}</div>
                    <div class="virtual-cell">${t('ui.ticker')}</div>
                    <div class="virtual-cell">${t('ui.sector')}</div>
                    <div class="virtual-cell align-right">${t('ui.targetRatio')}(%)</div>
                    <div class="virtual-cell align-right">${t('ui.currentPrice')}(${currencySymbol})</div>
                    ${mainMode === 'add' ? `<div class="virtual-cell align-center">${t('ui.fixedBuy')}(${currencySymbol})</div>` : ''}
                    <div class="virtual-cell align-center">${t('ui.action')}</div>
                `;
            }
        }
        header.innerHTML = headersHTML;
    }

    // ===== [Phase 4.1 리팩토링] createStockRowFragment는 RowRenderer.ts로 이동 =====

    /**
     * @description 가상 테이블을 렌더링합니다 (초기화).
     * @param calculatedPortfolioData - 계산된 포트폴리오 데이터
     * @param currency - 통화 모드
     * @param mainMode - 메인 모드
     */
    renderTable(calculatedPortfolioData: CalculatedStock[], currency: 'krw' | 'usd', mainMode: 'add' | 'sell' | 'simple'): void {
        if (!this._scrollWrapper || !this._scrollSpacer || !this._scrollContent) return;

        this.updateTableHeader(currency, mainMode);

        this._virtualData = calculatedPortfolioData;
        if (this.dom.virtualScrollWrapper) {
            this.dom.virtualScrollWrapper.setAttribute('aria-rowcount', String(this._virtualData.length));
        }

        const totalHeight = this._virtualData.length * ROW_PAIR_HEIGHT;
        this._scrollSpacer.style.height = `${totalHeight}px`;

        this._viewportHeight = this._scrollWrapper.clientHeight;

        if (this._scrollHandler) {
            this._scrollWrapper.removeEventListener('scroll', this._scrollHandler);
        }

        this._scrollHandler = this._onScroll.bind(this);
        this._scrollWrapper.addEventListener('scroll', this._scrollHandler);

        this._onScroll(true);
    }

    /**
     * @description 가상 테이블 데이터를 업데이트합니다.
     * @param calculatedPortfolioData - 계산된 포트폴리오 데이터
     */
    updateVirtualTableData(calculatedPortfolioData: CalculatedStock[]): void {
        this._virtualData = calculatedPortfolioData;
        const totalHeight = this._virtualData.length * ROW_PAIR_HEIGHT;
        if (this._scrollSpacer) this._scrollSpacer.style.height = `${totalHeight}px`;
        if (this.dom.virtualScrollWrapper) {
            this.dom.virtualScrollWrapper.setAttribute('aria-rowcount', String(this._virtualData.length));
        }

        this._onScroll(true);
    }

    /**
     * @description 특정 주식의 virtual data를 업데이트합니다.
     * @param stockId - 주식 ID
     * @param field - 필드명
     * @param value - 값
     */
    updateStockInVirtualData(stockId: string, field: string, value: any): void {
        const stockIndex = this._virtualData.findIndex((s) => s.id === stockId);
        if (stockIndex !== -1) {
            (this._virtualData[stockIndex] as any)[field] = value;
        }
    }

    /**
     * @description 특정 주식 행의 출력 부분만 업데이트합니다.
     * @param stockId - 주식 ID
     * @param calculatedData - 재계산된 데이터
     */
    updateSingleStockRow(stockId: string, calculatedData: any): void {
        const stockIndex = this._virtualData.findIndex((s) => s.id === stockId);
        if (stockIndex === -1) return;

        this._virtualData[stockIndex] = { ...this._virtualData[stockIndex], calculated: calculatedData };

        if (stockIndex < this._renderedStartIndex || stockIndex >= this._renderedEndIndex) {
            return;
        }

        // ===== [Phase 2.1 최적화] 캐시된 DOM 참조 사용 =====
        let outputRow = this._rowCache.get(stockId)?.outputRow;
        if (!outputRow) {
            // 캐시 미스 시 querySelector 사용하고 캐시에 저장
            outputRow = this._scrollContent?.querySelector(`.virtual-row-outputs[data-id="${stockId}"]`) as HTMLElement | null;
            if (outputRow) {
                const inputRow = this._scrollContent?.querySelector(`.virtual-row-inputs[data-id="${stockId}"]`) as HTMLElement | null;
                this._rowCache.set(stockId, { inputRow, outputRow });
            }
        }
        // ===== [Phase 2.1 최적화 끝] =====
        if (!outputRow || this._currentMainMode === 'simple') return;

        const currency = this._currentCurrency;
        const metrics = calculatedData ?? {
            quantity: new Decimal(0),
            avgBuyPrice: new Decimal(0),
            currentAmount: new Decimal(0),
            profitLoss: new Decimal(0),
            profitLossRate: new Decimal(0)
        };

        const quantity = metrics.quantity instanceof Decimal ? metrics.quantity : new Decimal(metrics.quantity ?? 0);
        const avgBuyPrice = metrics.avgBuyPrice instanceof Decimal ? metrics.avgBuyPrice : new Decimal(metrics.avgBuyPrice ?? 0);
        const currentAmount = metrics.currentAmount instanceof Decimal ? metrics.currentAmount : new Decimal(metrics.currentAmount ?? 0);
        const profitLoss = metrics.profitLoss instanceof Decimal ? metrics.profitLoss : new Decimal(metrics.profitLoss ?? 0);
        const profitLossRate = metrics.profitLossRate instanceof Decimal ? metrics.profitLossRate : new Decimal(metrics.profitLossRate ?? 0);

        const profitClass = profitLoss.isNegative() ? 'text-sell' : 'text-buy';
        const profitSign = profitLoss.isPositive() ? '+' : '';

        const isMobile = window.innerWidth <= 768;

        const cells = outputRow.querySelectorAll('.output-cell');
        let cellIndex = 0;

        if (cells[cellIndex]) cellIndex++;

        if (cells[cellIndex]) {
            cells[cellIndex].innerHTML = `<span class="label">${escapeHTML(t('ui.quantity'))}</span><span class="value">${escapeHTML(quantity.toFixed(0))}</span>`;
            cellIndex++;
        }

        if (!isMobile && cells[cellIndex]) {
            cells[cellIndex].innerHTML = `<span class="label">${escapeHTML(t('ui.avgBuyPrice'))}</span><span class="value">${escapeHTML(formatCurrency(avgBuyPrice, currency))}</span>`;
            cellIndex++;
        }

        if (cells[cellIndex]) {
            cells[cellIndex].innerHTML = `<span class="label">${escapeHTML(t('ui.currentValue'))}</span><span class="value">${escapeHTML(formatCurrency(currentAmount, currency))}</span>`;
            cellIndex++;
        }

        if (!isMobile && cells[cellIndex]) {
            cells[cellIndex].innerHTML = `<span class="label">${escapeHTML(t('ui.profitLoss'))}</span><span class="value ${profitClass}">${escapeHTML(profitSign + formatCurrency(profitLoss, currency))}</span>`;
            cellIndex++;
        }

        if (cells[cellIndex]) {
            cells[cellIndex].innerHTML = `<span class="label">${escapeHTML(t('ui.profitLossRate'))}</span><span class="value ${profitClass}">${escapeHTML(profitSign + profitLossRate.toFixed(2) + '%')}</span>`;
        }
    }

    /**
     * @description 스크롤 이벤트 핸들러 (실제 가상 스크롤 로직).
     * @param forceRedraw - 강제 재렌더링 여부
     */
    private _onScroll(forceRedraw: boolean = false): void {
        if (!this._scrollWrapper || !this._scrollContent) return;

        const currency = this._currentCurrency;
        const mainMode = this._currentMainMode;

        const scrollTop = this._scrollWrapper.scrollTop;

        const startIndex = Math.max(0, Math.floor(scrollTop / ROW_PAIR_HEIGHT) - VISIBLE_ROWS_BUFFER);
        const endIndex = Math.min(
            this._virtualData.length,
            Math.ceil((scrollTop + this._viewportHeight) / ROW_PAIR_HEIGHT) + VISIBLE_ROWS_BUFFER
        );

        if (!forceRedraw && startIndex === this._renderedStartIndex && endIndex === this._renderedEndIndex) {
            return;
        }

        // 재렌더링 전 입력값 저장 (IME 안전)
        const currentInputRows = this._scrollContent.querySelectorAll('.virtual-row-inputs[data-id]');
        const activeElement = document.activeElement;

        currentInputRows.forEach((row) => {
            const stockId = (row as HTMLElement).dataset.id;
            if (!stockId) return;

            const stockIndex = this._virtualData.findIndex((s) => s.id === stockId);
            if (stockIndex === -1) return;

            const inputs = row.querySelectorAll('input[data-field]');
            inputs.forEach((input) => {
                if (!(input instanceof HTMLInputElement)) return;

                if (input === activeElement || (input as any).isComposing) {
                    return;
                }

                const field = input.dataset.field;
                if (!field) return;

                let value: any;
                if (input.type === 'checkbox') {
                    value = input.checked;
                } else if (input.type === 'number') {
                    value = parseFloat(input.value) || 0;
                } else {
                    value = input.value;
                }

                (this._virtualData[stockIndex] as any)[field] = value;
            });
        });

        this._renderedStartIndex = startIndex;
        this._renderedEndIndex = endIndex;

        // ===== [Phase 2.1 최적화] 캐시 클리어 및 재구성 =====
        this._rowCache.clear();
        // ===== [Phase 2.1 최적화 끝] =====

        const fragment = document.createDocumentFragment();
        for (let i = startIndex; i < endIndex; i++) {
            const stock = this._virtualData[i];
            fragment.appendChild(createStockRowFragment(stock, currency, mainMode));
        }

        this._scrollContent.replaceChildren(fragment);
        this._scrollContent.style.transform = `translateY(${startIndex * ROW_PAIR_HEIGHT}px)`;

        // ===== [Phase 2.1 최적화] 렌더링 후 캐시 채우기 =====
        for (let i = startIndex; i < endIndex; i++) {
            const stock = this._virtualData[i];
            const inputRow = this._scrollContent.querySelector(`.virtual-row-inputs[data-id="${stock.id}"]`) as HTMLElement | null;
            const outputRow = this._scrollContent.querySelector(`.virtual-row-outputs[data-id="${stock.id}"]`) as HTMLElement | null;
            if (inputRow || outputRow) {
                this._rowCache.set(stock.id, { inputRow, outputRow });
            }
        }
        // ===== [Phase 2.1 최적화 끝] =====
    }

    /**
     * @description 모든 목표 비율 입력 필드를 업데이트합니다.
     * @param portfolioData - 포트폴리오 데이터
     */
    updateAllTargetRatioInputs(portfolioData: CalculatedStock[]): void {
        portfolioData.forEach((stock) => {
            // ===== [Phase 2.1 최적화] 캐시된 DOM 참조 사용 =====
            let inputRow = this._rowCache.get(stock.id)?.inputRow;
            if (!inputRow) {
                inputRow = this._scrollContent?.querySelector(`.virtual-row-inputs[data-id="${stock.id}"]`) as HTMLElement | null;
                if (inputRow) {
                    const outputRow = this._scrollContent?.querySelector(`.virtual-row-outputs[data-id="${stock.id}"]`) as HTMLElement | null;
                    this._rowCache.set(stock.id, { inputRow, outputRow });
                }
            }
            // ===== [Phase 2.1 최적화 끝] =====
            if (!inputRow) return;

            const targetRatioInput = inputRow.querySelector('input[data-field="targetRatio"]');
            if (targetRatioInput instanceof HTMLInputElement) {
                const ratio = stock.targetRatio instanceof Decimal ? stock.targetRatio : new Decimal(stock.targetRatio ?? 0);
                targetRatioInput.value = ratio.toFixed(2);
            }
        });
    }

    /**
     * @description 특정 주식의 현재가 입력 필드를 업데이트합니다.
     * @param id - 주식 ID
     * @param price - 가격
     */
    updateCurrentPriceInput(id: string, price: string): void {
        // ===== [Phase 2.1 최적화] 캐시된 DOM 참조 사용 =====
        let inputRow = this._rowCache.get(id)?.inputRow;
        if (!inputRow) {
            inputRow = this._scrollContent?.querySelector(`.virtual-row-inputs[data-id="${id}"]`) as HTMLElement | null;
            if (inputRow) {
                const outputRow = this._scrollContent?.querySelector(`.virtual-row-outputs[data-id="${id}"]`) as HTMLElement | null;
                this._rowCache.set(id, { inputRow, outputRow });
            }
        }
        // ===== [Phase 2.1 최적화 끝] =====
        if (!inputRow) return;

        const currentPriceInput = inputRow.querySelector('input[data-field="currentPrice"]');
        if (currentPriceInput instanceof HTMLInputElement) {
            currentPriceInput.value = price;
        }
    }

    /**
     * @description 새로 추가된 주식으로 포커스를 이동합니다.
     * @param stockId - 주식 ID
     */
    focusOnNewStock(stockId: string): void {
        const stockIndex = this._virtualData.findIndex((s) => s.id === stockId);
        if (stockIndex === -1 || !this._scrollWrapper) return;

        const scrollTop = stockIndex * ROW_PAIR_HEIGHT;
        this._scrollWrapper.scrollTo({ top: scrollTop, behavior: 'smooth' });

        setTimeout(() => {
            const inputRow = this._scrollContent?.querySelector(`.virtual-row-inputs[data-id="${stockId}"]`);
            if (!inputRow) return;

            const nameInput = inputRow.querySelector('input[data-field="name"]');
            if (nameInput instanceof HTMLInputElement) {
                nameInput.focus();
                nameInput.select();
            }
        }, 300);
    }
}