// src/view/VirtualScrollManager.ts
// Module separation
import { formatCurrency, escapeHTML, isInputElement } from '../utils';
import { toNumber } from '../utils/converterUtil';
import { t } from '../i18n';
import Decimal from 'decimal.js';
import { UI, BREAKPOINTS } from '../constants';
import type { CalculatedStock, DOMElements } from '../types';
import { getGridTemplate } from './DOMHelpers';
import { createStockRowFragment } from './RowRenderer';
import { LRUCache } from '../cache/LRUCache';

// Virtual scroll constants (imported from constants.ts)
const ROW_INPUT_HEIGHT = UI.ROW_INPUT_HEIGHT;
const ROW_OUTPUT_HEIGHT = UI.ROW_OUTPUT_HEIGHT;
const ROW_PAIR_HEIGHT = ROW_INPUT_HEIGHT + ROW_OUTPUT_HEIGHT;
const VISIBLE_ROWS_BUFFER = UI.VISIBLE_ROWS_BUFFER;

/**
 * @class VirtualScrollManager
 * @description Manages virtual scrolling - efficiently renders large datasets
 */
export class VirtualScrollManager {
    #dom: DOMElements;
    #virtualData: CalculatedStock[] = [];
    #scrollWrapper: HTMLElement | null = null;
    #scrollSpacer: HTMLElement | null = null;
    #scrollContent: HTMLElement | null = null;
    #viewportHeight: number = 0;
    #renderedStartIndex: number = -1;
    #renderedEndIndex: number = -1;
    #scrollHandler: (() => void) | null = null;
    #currentMainMode: 'add' | 'sell' | 'simple' = 'add';
    #currentCurrency: 'krw' | 'usd' = 'krw';

    // DOM reference caching (using LRU cache)
    #rowCache: LRUCache<string, { inputRow: HTMLElement | null; outputRow: HTMLElement | null }> =
        new LRUCache(UI.ROW_CACHE_SIZE);

    constructor(dom: DOMElements) {
        this.#dom = dom;
        this.initializeScrollElements();
    }

    /**
     * @description Update DOM reference (prevent recreation)
     * @param dom - New DOM reference
     */
    setDom(dom: DOMElements): void {
        this.#dom = dom;
        this.initializeScrollElements();
        // Cache is retained (preserve scroll position and state)
    }

    /**
     * @description Initialize scroll elements
     */
    private initializeScrollElements(): void {
        this.#scrollWrapper = this.#dom.virtualScrollWrapper;
        this.#scrollSpacer = this.#dom.virtualScrollSpacer;
        this.#scrollContent = this.#dom.virtualScrollContent;
        this.#viewportHeight = this.#scrollWrapper
            ? this.#scrollWrapper.clientHeight
            : UI.DEFAULT_VIEWPORT_HEIGHT;
    }

    /**
     * @description Update table header
     * @param currency - Currency mode
     * @param mainMode - Main mode
     */
    updateTableHeader(currency: 'krw' | 'usd', mainMode: 'add' | 'sell' | 'simple'): void {
        this.#currentMainMode = mainMode;
        this.#currentCurrency = currency;
        const header = this.#dom.virtualTableHeader;
        if (!header) return;

        header.style.gridTemplateColumns = getGridTemplate(mainMode);

        const currencySymbol = currency.toLowerCase() === 'usd' ? t('ui.usd') : t('ui.krw');
        let headersHTML = '';

        const isMobile = window.innerWidth <= BREAKPOINTS.MOBILE;

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

    /**
     * @description Render virtual table (initialization)
     * @param calculatedPortfolioData - Calculated portfolio data
     * @param currency - Currency mode
     * @param mainMode - Main mode
     */
    renderTable(
        calculatedPortfolioData: CalculatedStock[],
        currency: 'krw' | 'usd',
        mainMode: 'add' | 'sell' | 'simple'
    ): void {
        if (!this.#scrollWrapper || !this.#scrollSpacer || !this.#scrollContent) return;

        this.updateTableHeader(currency, mainMode);

        this.#virtualData = calculatedPortfolioData;
        if (this.#dom.virtualScrollWrapper) {
            this.#dom.virtualScrollWrapper.setAttribute(
                'aria-rowcount',
                String(this.#virtualData.length)
            );
        }

        const totalHeight = this.#virtualData.length * ROW_PAIR_HEIGHT;
        this.#scrollSpacer.style.height = `${totalHeight}px`;

        this.#viewportHeight = this.#scrollWrapper.clientHeight;

        if (this.#scrollHandler) {
            this.#scrollWrapper.removeEventListener('scroll', this.#scrollHandler);
        }

        this.#scrollHandler = this.#onScroll.bind(this);
        this.#scrollWrapper.addEventListener('scroll', this.#scrollHandler);

        this.#onScroll(true);
    }

    /**
     * @description Update virtual table data
     * @param calculatedPortfolioData - Calculated portfolio data
     */
    updateVirtualTableData(calculatedPortfolioData: CalculatedStock[]): void {
        this.#virtualData = calculatedPortfolioData;
        const totalHeight = this.#virtualData.length * ROW_PAIR_HEIGHT;
        if (this.#scrollSpacer) this.#scrollSpacer.style.height = `${totalHeight}px`;
        if (this.#dom.virtualScrollWrapper) {
            this.#dom.virtualScrollWrapper.setAttribute(
                'aria-rowcount',
                String(this.#virtualData.length)
            );
        }

        this.#onScroll(true);
    }

    /**
     * @description Update virtual data for a specific stock
     * @param stockId - Stock ID
     * @param field - Field name
     * @param value - Value
     */
    updateStockInVirtualData(
        stockId: string,
        field: keyof CalculatedStock,
        value: string | number | boolean | Decimal
    ): void {
        const stockIndex = this.#virtualData.findIndex((s) => s.id === stockId);
        if (stockIndex !== -1) {
            // Type-safe update
            (this.#virtualData[stockIndex][field] as typeof value) = value;
        }
    }

    /**
     * @description Update only the output portion of a specific stock row
     * @param stockId - Stock ID
     * @param calculatedData - Recalculated data
     */
    updateSingleStockRow(stockId: string, calculatedData: CalculatedStock['calculated']): void {
        const stockIndex = this.#virtualData.findIndex((s) => s.id === stockId);
        if (stockIndex === -1) return;

        this.#virtualData[stockIndex] = {
            ...this.#virtualData[stockIndex],
            calculated: calculatedData,
        };

        if (stockIndex < this.#renderedStartIndex || stockIndex >= this.#renderedEndIndex) {
            return;
        }

        // Use cached DOM reference
        let outputRow = this.#rowCache.get(stockId)?.outputRow;
        if (!outputRow) {
            // Cache miss: use querySelector and store in cache
            outputRow = this.#scrollContent?.querySelector(
                `.virtual-row-outputs[data-id="${stockId}"]`
            ) as HTMLElement | null;
            if (outputRow) {
                const inputRow = this.#scrollContent?.querySelector(
                    `.virtual-row-inputs[data-id="${stockId}"]`
                ) as HTMLElement | null;
                this.#rowCache.set(stockId, { inputRow, outputRow });
            }
        }
        if (!outputRow || this.#currentMainMode === 'simple') return;

        const currency = this.#currentCurrency;
        // Use number instead of Decimal for UI rendering
        const metrics = calculatedData ?? {
            quantity: 0,
            avgBuyPrice: 0,
            currentAmount: 0,
            profitLoss: 0,
            profitLossRate: 0,
        };

        // Convert Decimal to native number (for UI rendering)
        const quantity = toNumber(metrics.quantity);
        const avgBuyPrice = toNumber(metrics.avgBuyPrice);
        const currentAmount = toNumber(metrics.currentAmount);
        const profitLoss = toNumber(metrics.profitLoss);
        const profitLossRate = toNumber(metrics.profitLossRate);

        const profitClass = profitLoss < 0 ? 'text-sell' : 'text-buy';
        const profitSign = profitLoss > 0 ? '+' : '';

        const isMobile = window.innerWidth <= BREAKPOINTS.MOBILE;

        const cells = outputRow.querySelectorAll('.output-cell');
        let cellIndex = 0;

        if (cells[cellIndex]) cellIndex++;

        if (cells[cellIndex]) {
            cells[cellIndex].innerHTML =
                `<span class="label">${escapeHTML(t('ui.quantity'))}</span><span class="value">${escapeHTML(quantity.toFixed(0))}</span>`;
            cellIndex++;
        }

        if (!isMobile && cells[cellIndex]) {
            cells[cellIndex].innerHTML =
                `<span class="label">${escapeHTML(t('ui.avgBuyPrice'))}</span><span class="value">${escapeHTML(formatCurrency(avgBuyPrice, currency))}</span>`;
            cellIndex++;
        }

        if (cells[cellIndex]) {
            cells[cellIndex].innerHTML =
                `<span class="label">${escapeHTML(t('ui.currentValue'))}</span><span class="value">${escapeHTML(formatCurrency(currentAmount, currency))}</span>`;
            cellIndex++;
        }

        if (!isMobile && cells[cellIndex]) {
            cells[cellIndex].innerHTML =
                `<span class="label">${escapeHTML(t('ui.profitLoss'))}</span><span class="value ${profitClass}">${escapeHTML(profitSign + formatCurrency(profitLoss, currency))}</span>`;
            cellIndex++;
        }

        if (cells[cellIndex]) {
            cells[cellIndex].innerHTML =
                `<span class="label">${escapeHTML(t('ui.profitLossRate'))}</span><span class="value ${profitClass}">${escapeHTML(profitSign + profitLossRate.toFixed(2) + '%')}</span>`;
        }
    }

    /**
     * @description Scroll event handler (actual virtual scroll logic)
     * @param forceRedraw - Whether to force redraw
     */
    #onScroll(forceRedraw: boolean = false): void {
        if (!this.#scrollWrapper || !this.#scrollContent) return;

        const currency = this.#currentCurrency;
        const mainMode = this.#currentMainMode;

        const scrollTop = this.#scrollWrapper.scrollTop;

        const startIndex = Math.max(
            0,
            Math.floor(scrollTop / ROW_PAIR_HEIGHT) - VISIBLE_ROWS_BUFFER
        );
        const endIndex = Math.min(
            this.#virtualData.length,
            Math.ceil((scrollTop + this.#viewportHeight) / ROW_PAIR_HEIGHT) + VISIBLE_ROWS_BUFFER
        );

        if (
            !forceRedraw &&
            startIndex === this.#renderedStartIndex &&
            endIndex === this.#renderedEndIndex
        ) {
            return;
        }

        // Save input values before re-rendering (IME safe)
        const currentInputRows = this.#scrollContent.querySelectorAll(
            '.virtual-row-inputs[data-id]'
        );
        const activeElement = document.activeElement;

        currentInputRows.forEach((row) => {
            const stockId = (row as HTMLElement).dataset.id;
            if (!stockId) return;

            const stockIndex = this.#virtualData.findIndex((s) => s.id === stockId);
            if (stockIndex === -1) return;

            const inputs = row.querySelectorAll('input[data-field]');
            inputs.forEach((input) => {
                if (!isInputElement(input)) return;

                // Phase 2-5: Check IME composition
                const isComposing =
                    'isComposing' in input &&
                    (input as HTMLInputElement & { isComposing?: boolean }).isComposing;
                if (input === activeElement || isComposing) {
                    return;
                }

                const field = input.dataset.field;
                if (!field) return;

                // Update stock data with proper type handling
                const stock = this.#virtualData[stockIndex];
                if (input.type === 'checkbox') {
                    (stock as Record<string, boolean>)[field] = input.checked;
                } else if (input.type === 'number') {
                    (stock as Record<string, number>)[field] = parseFloat(input.value) || 0;
                } else {
                    (stock as Record<string, string>)[field] = input.value;
                }
            });
        });

        this.#renderedStartIndex = startIndex;
        this.#renderedEndIndex = endIndex;

        // Clear cache and rebuild
        this.#rowCache.clear();

        const fragment = document.createDocumentFragment();
        for (let i = startIndex; i < endIndex; i++) {
            const stock = this.#virtualData[i];
            fragment.appendChild(createStockRowFragment(stock, currency, mainMode));
        }

        this.#scrollContent.replaceChildren(fragment);
        this.#scrollContent.style.transform = `translateY(${startIndex * ROW_PAIR_HEIGHT}px)`;

        // Fill cache after rendering
        for (let i = startIndex; i < endIndex; i++) {
            const stock = this.#virtualData[i];
            const inputRow = this.#scrollContent.querySelector(
                `.virtual-row-inputs[data-id="${stock.id}"]`
            );
            const outputRow = this.#scrollContent.querySelector(
                `.virtual-row-outputs[data-id="${stock.id}"]`
            );
            if (inputRow || outputRow) {
                this.#rowCache.set(stock.id, { inputRow, outputRow });
            }
        }
    }

    /**
     * @description Update all target ratio input fields
     * @param portfolioData - Portfolio data
     */
    updateAllTargetRatioInputs(portfolioData: CalculatedStock[]): void {
        portfolioData.forEach((stock) => {
            // Use cached DOM reference
            let inputRow = this.#rowCache.get(stock.id)?.inputRow;
            if (!inputRow) {
                inputRow = this.#scrollContent?.querySelector(
                    `.virtual-row-inputs[data-id="${stock.id}"]`
                ) as HTMLElement | null;
                if (inputRow) {
                    const outputRow = this.#scrollContent?.querySelector(
                        `.virtual-row-outputs[data-id="${stock.id}"]`
                    ) as HTMLElement | null;
                    this.#rowCache.set(stock.id, { inputRow, outputRow });
                }
            }
            if (!inputRow) return;

            const targetRatioInput = inputRow.querySelector('input[data-field="targetRatio"]');
            if (isInputElement(targetRatioInput)) {
                // Use number instead of Decimal
                const ratio = toNumber(stock.targetRatio);
                targetRatioInput.value = ratio.toFixed(2);
            }
        });
    }

    /**
     * @description Update current price input field for a specific stock
     * @param id - Stock ID
     * @param price - Price
     */
    updateCurrentPriceInput(id: string, price: string): void {
        // Use cached DOM reference
        let inputRow = this.#rowCache.get(id)?.inputRow;
        if (!inputRow) {
            inputRow = this.#scrollContent?.querySelector(
                `.virtual-row-inputs[data-id="${id}"]`
            ) as HTMLElement | null;
            if (inputRow) {
                const outputRow = this.#scrollContent?.querySelector(
                    `.virtual-row-outputs[data-id="${id}"]`
                ) as HTMLElement | null;
                this.#rowCache.set(id, { inputRow, outputRow });
            }
        }
        if (!inputRow) return;

        const currentPriceInput = inputRow.querySelector('input[data-field="currentPrice"]');
        if (isInputElement(currentPriceInput)) {
            currentPriceInput.value = price;
        }
    }

    /**
     * @description Focus on newly added stock
     * @param stockId - Stock ID
     */
    focusOnNewStock(stockId: string): void {
        const stockIndex = this.#virtualData.findIndex((s) => s.id === stockId);
        if (stockIndex === -1 || !this.#scrollWrapper) return;

        const scrollTop = stockIndex * ROW_PAIR_HEIGHT;
        this.#scrollWrapper.scrollTo({ top: scrollTop, behavior: 'smooth' });

        setTimeout(() => {
            const inputRow = this.#scrollContent?.querySelector(
                `.virtual-row-inputs[data-id="${stockId}"]`
            );
            if (!inputRow) return;

            const nameInput = inputRow.querySelector('input[data-field="name"]');
            if (isInputElement(nameInput)) {
                nameInput.focus();
                nameInput.select();
            }
        }, 300);
    }
}
