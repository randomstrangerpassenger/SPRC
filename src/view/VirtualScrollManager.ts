// src/view/VirtualScrollManager.ts
import { formatCurrency, escapeHTML } from '../utils';
import { t } from '../i18n';
import Decimal from 'decimal.js';
import type { CalculatedStock } from '../types';

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
     * @description 그리드 템플릿을 반환합니다 (반응형).
     * @param mainMode - 메인 모드
     * @returns CSS grid-template-columns 문자열
     */
    private getGridTemplate(mainMode: 'add' | 'sell' | 'simple'): string {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            if (mainMode === 'simple') {
                return '1.5fr 1fr 1fr 1fr 0.8fr';
            }
            return '1.5fr 1fr 1fr 1.2fr';
        } else {
            if (mainMode === 'add') {
                return '1.5fr 1fr 1fr 1fr 1fr 1.2fr 1.2fr';
            } else if (mainMode === 'simple') {
                return '2fr 1fr 1fr 1.5fr 1.2fr 0.8fr';
            } else {
                return '2fr 1fr 1fr 1fr 1fr 1.2fr';
            }
        }
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

        header.style.gridTemplateColumns = this.getGridTemplate(mainMode);

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

    /**
     * @description 주식 행 Fragment를 생성합니다.
     * @param stock - 계산된 주식 데이터
     * @param currency - 통화 모드
     * @param mainMode - 메인 모드
     * @returns DocumentFragment
     */
    createStockRowFragment(stock: CalculatedStock, currency: 'krw' | 'usd', mainMode: 'add' | 'sell' | 'simple'): DocumentFragment {
        const fragment = document.createDocumentFragment();

        // 헬퍼 함수들
        const createInput = (
            type: string,
            field: string,
            value: any,
            placeholder: string = '',
            disabled: boolean = false,
            ariaLabel: string = ''
        ): HTMLInputElement => {
            const input = document.createElement('input');
            input.type = type;
            input.dataset.field = field;

            let displayValue = '';
            if (value instanceof Decimal) {
                const decimalPlaces = field === 'fixedBuyAmount' ? 0 : 2;
                displayValue = value.toFixed(decimalPlaces);
            } else {
                const defaultValue =
                    field === 'fixedBuyAmount' ? '0' : field === 'targetRatio' || field === 'currentPrice' ? '0.00' : '';
                displayValue = String(value ?? defaultValue);
            }

            input.value = displayValue;
            if (placeholder) input.placeholder = placeholder;
            input.disabled = disabled;
            if (ariaLabel) input.setAttribute('aria-label', ariaLabel);

            if (type === 'number') {
                input.min = '0';
                if (field === 'currentPrice' || field === 'fixedBuyAmount' || field === 'targetRatio') input.step = 'any';
            }
            if (type === 'text') {
                input.style.textAlign = 'center';
            }

            return input;
        };

        const createCheckbox = (field: string, checked: boolean, ariaLabel: string = ''): HTMLInputElement => {
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.dataset.field = field;
            input.checked = checked;
            if (ariaLabel) input.setAttribute('aria-label', ariaLabel);
            return input;
        };

        const createButton = (action: string, text: string, ariaLabel: string = '', variant: string = 'grey'): HTMLButtonElement => {
            const button = document.createElement('button');
            button.className = 'btn btn--small';
            button.dataset.action = action;
            button.dataset.variant = variant;
            button.textContent = text;
            if (ariaLabel) button.setAttribute('aria-label', ariaLabel);
            return button;
        };

        const createCell = (className: string = '', align: string = 'left'): HTMLDivElement => {
            const cell = document.createElement('div');
            cell.className = `virtual-cell ${className} align-${align}`;
            return cell;
        };

        // 1. 입력 행 (Inputs Row)
        const divInputs = document.createElement('div');
        divInputs.className = 'virtual-row-inputs';
        divInputs.dataset.id = stock.id;
        divInputs.setAttribute('role', 'row');
        divInputs.style.gridTemplateColumns = this.getGridTemplate(mainMode);

        const isMobile = window.innerWidth <= 768;

        // 컬럼 구성
        divInputs.appendChild(createCell()).appendChild(createInput('text', 'name', stock.name, t('ui.stockName')));
        divInputs.appendChild(createCell()).appendChild(createInput('text', 'ticker', stock.ticker, t('ui.ticker'), false, t('aria.tickerInput', { name: stock.name })));

        if (mainMode !== 'simple' && !isMobile) {
            divInputs.appendChild(createCell()).appendChild(createInput('text', 'sector', stock.sector || '', t('ui.sector'), false, t('aria.sectorInput', { name: stock.name })));
        }

        divInputs.appendChild(createCell('align-right')).appendChild(createInput('number', 'targetRatio', stock.targetRatio, '0.00', false, t('aria.targetRatioInput', { name: stock.name })));

        if (!isMobile && mainMode !== 'simple') {
            divInputs.appendChild(createCell('align-right')).appendChild(createInput('number', 'currentPrice', stock.currentPrice, '0.00', false, t('aria.currentPriceInput', { name: stock.name })));
        }

        if (mainMode === 'simple') {
            const amountCell = createCell('align-right');
            const manualAmountInput = createInput('number', 'manualAmount', stock.manualAmount || 0, '현재 보유 금액 입력', false, `${stock.name} 보유 금액`);
            manualAmountInput.style.width = '100%';
            manualAmountInput.style.textAlign = 'right';
            amountCell.appendChild(manualAmountInput);
            divInputs.appendChild(amountCell);

            if (!isMobile) {
                const fixedBuyCell = createCell('align-center');
                const checkbox = createCheckbox('isFixedBuyEnabled', stock.isFixedBuyEnabled, t('aria.fixedBuyToggle', { name: stock.name }));
                const amountInput = createInput('number', 'fixedBuyAmount', stock.fixedBuyAmount, '0', !stock.isFixedBuyEnabled, t('aria.fixedBuyAmount', { name: stock.name }));
                amountInput.style.width = '80px';
                fixedBuyCell.append(checkbox, ' ', amountInput);
                divInputs.appendChild(fixedBuyCell);
            }

            const deleteCell = createCell('align-center');
            deleteCell.appendChild(createButton('delete', t('ui.delete'), t('aria.deleteStock', { name: stock.name }), 'delete'));
            divInputs.appendChild(deleteCell);
        } else {
            if (mainMode === 'add' && !isMobile) {
                const fixedBuyCell = createCell('align-center');
                const checkbox = createCheckbox('isFixedBuyEnabled', stock.isFixedBuyEnabled, t('aria.fixedBuyToggle', { name: stock.name }));
                const amountInput = createInput('number', 'fixedBuyAmount', stock.fixedBuyAmount, '0', !stock.isFixedBuyEnabled, t('aria.fixedBuyAmount', { name: stock.name }));
                amountInput.style.width = '80px';
                fixedBuyCell.append(checkbox, ' ', amountInput);
                divInputs.appendChild(fixedBuyCell);
            }

            const actionCell = createCell('align-center');
            actionCell.append(
                createButton('manage', t('ui.manage'), t('aria.manageTransactions', { name: stock.name }), 'blue'),
                ' ',
                createButton('delete', t('ui.delete'), t('aria.deleteStock', { name: stock.name }), 'delete')
            );
            divInputs.appendChild(actionCell);
        }

        // 2. 출력 행 (Outputs Row)
        const divOutputs = document.createElement('div');
        divOutputs.className = 'virtual-row-outputs';
        divOutputs.dataset.id = stock.id;
        divOutputs.setAttribute('role', 'row');
        divOutputs.style.gridTemplateColumns = this.getGridTemplate(mainMode);

        const metrics = stock.calculated ?? {
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

        const createOutputCell = (label: string, value: string, valueClass: string = ''): HTMLDivElement => {
            const cell = createCell('output-cell align-right');
            cell.innerHTML = `<span class="label">${escapeHTML(label)}</span><span class="value ${escapeHTML(valueClass)}">${escapeHTML(value)}</span>`;
            return cell;
        };

        const firstCell = createCell();
        firstCell.style.gridColumn = 'span 1';
        divOutputs.appendChild(firstCell);

        if (mainMode === 'simple') {
            divOutputs.style.display = 'none';
        } else {
            divOutputs.appendChild(createOutputCell(t('ui.quantity'), quantity.toFixed(0)));
            if (!isMobile) {
                divOutputs.appendChild(createOutputCell(t('ui.avgBuyPrice'), formatCurrency(avgBuyPrice, currency)));
            }
            divOutputs.appendChild(createOutputCell(t('ui.currentValue'), formatCurrency(currentAmount, currency)));
            if (!isMobile) {
                divOutputs.appendChild(createOutputCell(t('ui.profitLoss'), `${profitSign}${formatCurrency(profitLoss, currency)}`, profitClass));
            }
            divOutputs.appendChild(createOutputCell(t('ui.profitLossRate'), `${profitSign}${profitLossRate.toFixed(2)}%`, profitClass));
        }

        const lastCell = createCell();
        divOutputs.appendChild(lastCell);

        fragment.append(divInputs, divOutputs);
        return fragment;
    }

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

        const outputRow = this._scrollContent?.querySelector(`.virtual-row-outputs[data-id="${stockId}"]`);
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

        const fragment = document.createDocumentFragment();
        for (let i = startIndex; i < endIndex; i++) {
            const stock = this._virtualData[i];
            fragment.appendChild(this.createStockRowFragment(stock, currency, mainMode));
        }

        this._scrollContent.replaceChildren(fragment);
        this._scrollContent.style.transform = `translateY(${startIndex * ROW_PAIR_HEIGHT}px)`;
    }

    /**
     * @description 모든 목표 비율 입력 필드를 업데이트합니다.
     * @param portfolioData - 포트폴리오 데이터
     */
    updateAllTargetRatioInputs(portfolioData: CalculatedStock[]): void {
        portfolioData.forEach((stock) => {
            const inputRow = this._scrollContent?.querySelector(`.virtual-row-inputs[data-id="${stock.id}"]`);
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
        const inputRow = this._scrollContent?.querySelector(`.virtual-row-inputs[data-id="${id}"]`);
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