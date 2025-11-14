// src/view/ModalManager.ts
import { formatCurrency, escapeHTML, isInputElement } from '../utils';
import { t } from '../i18n';
import { createFocusTrap, FocusManager } from '../a11yHelpers';
import Decimal from 'decimal.js';
import type { Stock, Transaction, DOMElements } from '../types';
import { logger } from '../services/Logger';
import { CSS_CLASSES } from '../constants';

// UI 렌더링용 헬퍼 함수
/**
 * @description Decimal 또는 number를 네이티브 number로 변환 (UI 렌더링용)
 */
function toNumber(value: Decimal | number | null | undefined): number {
    if (value == null) return 0;
    if (value instanceof Decimal) return value.toNumber();
    return Number(value);
}

/**
 * @class ModalManager
 * @description 모달 창 관리 (custom modal, transaction modal) with accessibility enhancements
 */
export class ModalManager {
    private dom: DOMElements;
    private activeModalResolver: ((value: boolean | string | null) => void) | null = null;
    private focusManager: FocusManager;
    private focusTrapCleanup: (() => void) | null = null;

    constructor(dom: DOMElements) {
        this.dom = dom;
        this.focusManager = new FocusManager();
    }

    /**
     * @description DOM 참조 업데이트 (재생성 방지)
     * @param dom - 새로운 DOM 참조
     */
    setDom(dom: DOMElements): void {
        this.dom = dom;
    }

    /**
     * @description 현재 포커스 요소를 저장합니다.
     */
    private saveFocusContext(): void {
        this.focusManager.saveFocus();
    }

    /**
     * @description 저장된 포커스 요소로 복원합니다.
     */
    private restoreFocus(): void {
        this.focusManager.restoreFocus();
        // Cleanup focus trap
        if (this.focusTrapCleanup) {
            this.focusTrapCleanup();
            this.focusTrapCleanup = null;
        }
    }

    /**
     * @description 확인 대화상자를 표시합니다.
     * @param title - 모달 제목
     * @param message - 모달 메시지
     * @returns 사용자의 선택 (true/false)
     */
    async showConfirm(title: string, message: string): Promise<boolean> {
        return this.#showModal({ title, message, type: 'confirm' }) as Promise<boolean>;
    }

    /**
     * @description 입력 프롬프트를 표시합니다.
     * @param title - 모달 제목
     * @param message - 모달 메시지
     * @param defaultValue - 기본값
     * @returns 사용자 입력 문자열 또는 null
     */
    async showPrompt(
        title: string,
        message: string,
        defaultValue: string = ''
    ): Promise<string | null> {
        return this.#showModal({ title, message, defaultValue, type: 'prompt' }) as Promise<
            string | null
        >;
    }

    /**
     * @description 커스텀 모달을 표시합니다 (내부 헬퍼).
     * @param options - 모달 옵션
     * @returns Promise<boolean | string | null>
     */
    #showModal(options: {
        title: string;
        message: string;
        defaultValue?: string;
        type: 'confirm' | 'prompt';
    }): Promise<boolean | string | null> {
        return new Promise((resolve) => {
            this.saveFocusContext();
            this.activeModalResolver = resolve;
            const { title, message, defaultValue, type } = options;
            const titleEl = this.dom.customModalTitle;
            const messageEl = this.dom.customModalMessage;
            const inputEl = this.dom.customModalInput;
            const modalEl = this.dom.customModal;
            const confirmBtnEl = this.dom.customModalConfirm;

            if (titleEl) titleEl.textContent = title;
            if (messageEl) messageEl.textContent = message;

            if (type === 'prompt' && isInputElement(inputEl)) {
                inputEl.value = defaultValue ?? '';
                inputEl.classList.remove(CSS_CLASSES.HIDDEN);
            } else if (inputEl) {
                inputEl.classList.add(CSS_CLASSES.HIDDEN);
            }

            if (modalEl) {
                modalEl.classList.remove(CSS_CLASSES.HIDDEN);
                modalEl.setAttribute('aria-modal', 'true');
                // Use enhanced focus trap from a11yHelpers
                this.focusTrapCleanup = createFocusTrap(modalEl);
            }

            if (type === 'prompt' && isInputElement(inputEl)) {
                inputEl.focus();
            } else if (confirmBtnEl instanceof HTMLButtonElement) {
                confirmBtnEl.focus();
            }
        });
    }

    /**
     * @description 커스텀 모달의 응답을 처리합니다.
     * @param confirmed - 확인 여부
     */
    handleCustomModal(confirmed: boolean): void {
        if (!this.activeModalResolver) return;

        const inputEl = this.dom.customModalInput;
        const modalEl = this.dom.customModal;
        const isPrompt = isInputElement(inputEl) && !inputEl.classList.contains(CSS_CLASSES.HIDDEN);
        const value = isPrompt ? (confirmed ? inputEl.value : null) : confirmed;

        this.activeModalResolver(value);
        modalEl?.classList.add(CSS_CLASSES.HIDDEN);
        modalEl?.removeAttribute('aria-modal');
        this.restoreFocus();
        this.activeModalResolver = null;
    }

    /**
     * @description 거래 내역 모달을 엽니다.
     * @param stock - 주식 정보
     * @param currency - 통화 모드
     * @param transactions - 거래 내역 배열
     */
    openTransactionModal(stock: Stock, currency: 'krw' | 'usd', transactions: Transaction[]): void {
        this.saveFocusContext();
        const modal = this.dom.transactionModal;
        const modalTitle = this.dom.modalStockName;
        const dateInput = this.dom.txDate;

        if (!modal) return;

        modal.dataset.stockId = stock.id;
        if (modalTitle) {
            modalTitle.textContent = `${stock.name} (${stock.ticker}) ${t('modal.transactionTitle')}`;
        }

        this.renderTransactionList(transactions || [], currency);

        if (isInputElement(dateInput)) {
            dateInput.valueAsDate = new Date();
        }

        modal.classList.remove(CSS_CLASSES.HIDDEN);
        modal.setAttribute('aria-modal', 'true');
        this.focusTrapCleanup = createFocusTrap(modal);

        const closeBtn = this.dom.closeModalBtn;
        if (closeBtn instanceof HTMLButtonElement) {
            closeBtn.focus();
        }
    }

    /**
     * @description 거래 내역 모달을 닫습니다.
     */
    closeTransactionModal(): void {
        const modal = this.dom.transactionModal;
        const form = this.dom.newTransactionForm;

        if (!modal) return;

        modal.classList.add(CSS_CLASSES.HIDDEN);
        modal.removeAttribute('aria-modal');
        if (form instanceof HTMLFormElement) form.reset();
        modal.removeAttribute('data-stock-id');
        this.restoreFocus();
    }

    /**
     * @description 거래 내역 목록을 렌더링합니다.
     * @param transactions - 거래 내역 배열
     * @param currency - 통화 모드
     */
    renderTransactionList(transactions: Transaction[], currency: 'krw' | 'usd'): void {
        const listBody = this.dom.transactionListBody;
        if (!listBody) {
            logger.error('renderTransactionList - listBody not found', 'ModalManager');
            return;
        }

        (listBody as HTMLTableSectionElement).innerHTML = '';

        if (transactions.length === 0) {
            const tr = (listBody as HTMLTableSectionElement).insertRow();
            const td = tr.insertCell();
            td.colSpan = 6;
            td.style.textAlign = 'center';
            td.textContent = t('view.noTransactions');
            return;
        }

        const sorted = [...transactions].sort((a, b) => {
            const dateCompare = b.date.localeCompare(a.date);
            if (dateCompare !== 0) return dateCompare;
            const idA = a.id || '';
            const idB = b.id || '';
            return idB.localeCompare(idA);
        });

        // DocumentFragment로 DOM 조작 최소화
        const fragment = document.createDocumentFragment();
        sorted.forEach((tx) => {
            const tr = document.createElement('tr');
            tr.dataset.txId = tx.id;

            // Decimal을 네이티브 number로 변환
            const quantity = toNumber(tx.quantity);
            const price = toNumber(tx.price);
            const total = quantity * price;

            // Date cell
            const dateTd = document.createElement('td');
            dateTd.textContent = tx.date;
            tr.appendChild(dateTd);

            // Type cell
            const typeTd = document.createElement('td');
            const typeSpan = document.createElement('span');
            if (tx.type === 'buy') {
                typeSpan.className = 'text-buy';
                typeSpan.textContent = t('ui.buy');
            } else if (tx.type === 'sell') {
                typeSpan.className = 'text-sell';
                typeSpan.textContent = t('ui.sell');
            } else if (tx.type === 'dividend') {
                typeSpan.className = 'text-buy';
                typeSpan.textContent = '배당';
            } else {
                typeSpan.textContent = tx.type;
            }
            typeTd.appendChild(typeSpan);
            tr.appendChild(typeTd);

            // Quantity cell
            const qtyTd = document.createElement('td');
            qtyTd.textContent = quantity.toLocaleString();
            qtyTd.style.textAlign = 'right';
            tr.appendChild(qtyTd);

            // Price cell
            const priceTd = document.createElement('td');
            priceTd.textContent = formatCurrency(price, currency);
            priceTd.style.textAlign = 'right';
            tr.appendChild(priceTd);

            // Total cell
            const totalTd = document.createElement('td');
            totalTd.textContent = formatCurrency(total, currency);
            totalTd.style.textAlign = 'right';
            tr.appendChild(totalTd);

            // Action cell
            const actionTd = document.createElement('td');
            actionTd.style.textAlign = 'center';
            const btnDelete = document.createElement('button');
            btnDelete.className = 'btn btn--small';
            btnDelete.dataset.variant = 'delete';
            btnDelete.dataset.action = 'delete-tx';
            btnDelete.textContent = t('ui.delete');
            btnDelete.setAttribute('aria-label', t('aria.deleteTransaction', { date: tx.date }));
            actionTd.appendChild(btnDelete);
            tr.appendChild(actionTd);

            fragment.appendChild(tr);
        });

        listBody.appendChild(fragment);
    }

    /**
     * @description 커스텀 모달 이벤트 리스너를 바인딩합니다.
     */
    bindModalEvents(): void {
        const cancelBtn = this.dom.customModalCancel;
        const confirmBtn = this.dom.customModalConfirm;
        const customModalEl = this.dom.customModal;

        cancelBtn?.addEventListener('click', () => this.handleCustomModal(false));
        confirmBtn?.addEventListener('click', () => this.handleCustomModal(true));
        customModalEl?.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Escape') this.handleCustomModal(false);
        });
    }
}
