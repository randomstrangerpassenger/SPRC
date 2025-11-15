// src/view/ModalManager.ts
import { formatCurrency, escapeHTML, isInputElement } from '../utils';
import { toNumber } from '../utils/converterUtil';
import { t } from '../i18n';
import { createFocusTrap, FocusManager } from '../a11yHelpers';
import Decimal from 'decimal.js';
import type { Stock, Transaction, DOMElements } from '../types';
import type { TransactionListViewModel } from '../viewModels';
import { logger } from '../services/Logger';
import { CSS_CLASSES } from '../constants';

/**
 * @class ModalManager
 * @description Manages modal windows (custom modal, transaction modal) with accessibility enhancements
 */
export class ModalManager {
    #dom: DOMElements;
    #activeModalResolver: ((value: boolean | string | null) => void) | null = null;
    #focusManager: FocusManager;
    #focusTrapCleanup: (() => void) | null = null;

    constructor(dom: DOMElements) {
        this.#dom = dom;
        this.#focusManager = new FocusManager();
    }

    /**
     * @description Update DOM reference (prevent recreation)
     * @param dom - New DOM reference
     */
    setDom(dom: DOMElements): void {
        this.#dom = dom;
    }

    /**
     * @description Save the currently focused element
     */
    private saveFocusContext(): void {
        this.#focusManager.saveFocus();
    }

    /**
     * @description Restore the saved focused element
     */
    private restoreFocus(): void {
        this.#focusManager.restoreFocus();
        // Cleanup focus trap
        if (this.#focusTrapCleanup) {
            this.#focusTrapCleanup();
            this.#focusTrapCleanup = null;
        }
    }

    /**
     * @description Show confirmation dialog
     * @param title - Modal title
     * @param message - Modal message
     * @returns User's choice (true/false)
     */
    async showConfirm(title: string, message: string): Promise<boolean> {
        return this.#showModal({ title, message, type: 'confirm' }) as Promise<boolean>;
    }

    /**
     * @description Show input prompt
     * @param title - Modal title
     * @param message - Modal message
     * @param defaultValue - Default value
     * @returns User input string or null
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
     * @description Show custom modal (internal helper)
     * @param options - Modal options
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
            this.#activeModalResolver = resolve;
            const { title, message, defaultValue, type } = options;
            const titleEl = this.#dom.customModalTitle;
            const messageEl = this.#dom.customModalMessage;
            const inputEl = this.#dom.customModalInput;
            const modalEl = this.#dom.customModal;
            const confirmBtnEl = this.#dom.customModalConfirm;

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
                this.#focusTrapCleanup = createFocusTrap(modalEl);
            }

            if (type === 'prompt' && isInputElement(inputEl)) {
                inputEl.focus();
            } else if (confirmBtnEl instanceof HTMLButtonElement) {
                confirmBtnEl.focus();
            }
        });
    }

    /**
     * @description Handle custom modal response
     * @param confirmed - Whether confirmed
     */
    handleCustomModal(confirmed: boolean): void {
        if (!this.#activeModalResolver) return;

        const inputEl = this.#dom.customModalInput;
        const modalEl = this.#dom.customModal;
        const isPrompt = isInputElement(inputEl) && !inputEl.classList.contains(CSS_CLASSES.HIDDEN);
        const value = isPrompt ? (confirmed ? inputEl.value : null) : confirmed;

        this.#activeModalResolver(value);
        modalEl?.classList.add(CSS_CLASSES.HIDDEN);
        modalEl?.removeAttribute('aria-modal');
        this.restoreFocus();
        this.#activeModalResolver = null;
    }

    /**
     * @description Open transaction modal
     * @param stock - Stock information
     * @param currency - Currency mode
     * @param transactions - Array of transactions
     */
    openTransactionModal(stock: Stock, currency: 'krw' | 'usd', transactions: Transaction[]): void {
        this.saveFocusContext();
        const modal = this.#dom.transactionModal;
        const modalTitle = this.#dom.modalStockName;
        const dateInput = this.#dom.txDate;

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
        this.#focusTrapCleanup = createFocusTrap(modal);

        const closeBtn = this.#dom.closeModalBtn;
        if (closeBtn instanceof HTMLButtonElement) {
            closeBtn.focus();
        }
    }

    /**
     * @description Close transaction modal
     */
    closeTransactionModal(): void {
        const modal = this.#dom.transactionModal;
        const form = this.#dom.newTransactionForm;

        if (!modal) return;

        modal.classList.add(CSS_CLASSES.HIDDEN);
        modal.removeAttribute('aria-modal');
        if (form instanceof HTMLFormElement) form.reset();
        modal.removeAttribute('data-stock-id');
        this.restoreFocus();
    }

    /**
     * @description Render transaction list with ViewModel
     * @param viewModel - TransactionListViewModel
     */
    renderTransactionListViewModel(viewModel: TransactionListViewModel): void {
        const listBody = this.#dom.transactionListBody;
        if (!listBody) {
            logger.error('renderTransactionListViewModel - listBody not found', 'ModalManager');
            return;
        }

        (listBody as HTMLTableSectionElement).innerHTML = '';

        if (viewModel.transactions.length === 0) {
            const tr = (listBody as HTMLTableSectionElement).insertRow();
            const td = tr.insertCell();
            td.colSpan = 6;
            td.style.textAlign = 'center';
            td.textContent = t('view.noTransactions');
            return;
        }

        // Minimize DOM manipulation using DocumentFragment
        const fragment = document.createDocumentFragment();
        viewModel.transactions.forEach((tx) => {
            const tr = document.createElement('tr');
            tr.dataset.txId = tx.id;

            // Date cell
            const dateTd = document.createElement('td');
            dateTd.textContent = tx.dateFormatted;
            tr.appendChild(dateTd);

            // Type cell
            const typeTd = document.createElement('td');
            const typeSpan = document.createElement('span');
            if (tx.type === 'buy') {
                typeSpan.className = 'text-buy';
            } else if (tx.type === 'sell') {
                typeSpan.className = 'text-sell';
            } else if (tx.type === 'dividend') {
                typeSpan.className = 'text-buy';
            }
            typeSpan.textContent = tx.typeLabel;
            typeTd.appendChild(typeSpan);
            tr.appendChild(typeTd);

            // Quantity cell
            const qtyTd = document.createElement('td');
            qtyTd.textContent = tx.quantity;
            qtyTd.style.textAlign = 'right';
            tr.appendChild(qtyTd);

            // Price cell
            const priceTd = document.createElement('td');
            priceTd.textContent = tx.price;
            priceTd.style.textAlign = 'right';
            tr.appendChild(priceTd);

            // Total cell
            const totalTd = document.createElement('td');
            totalTd.textContent = tx.totalAmount;
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
            btnDelete.setAttribute('aria-label', t('aria.deleteTransaction', { date: tx.dateFormatted }));
            actionTd.appendChild(btnDelete);
            tr.appendChild(actionTd);

            fragment.appendChild(tr);
        });

        listBody.appendChild(fragment);
    }

    /**
     * @description Render transaction list (legacy - delegates to domain model conversion)
     * @param transactions - Array of transactions
     * @param currency - Currency mode
     * @deprecated Use renderTransactionListViewModel instead
     */
    renderTransactionList(transactions: Transaction[], currency: 'krw' | 'usd'): void {
        const listBody = this.#dom.transactionListBody;
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

        // Minimize DOM manipulation using DocumentFragment
        const fragment = document.createDocumentFragment();
        sorted.forEach((tx) => {
            const tr = document.createElement('tr');
            tr.dataset.txId = tx.id;

            // Convert Decimal to native number
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
     * @description Bind custom modal event listeners
     */
    bindModalEvents(): void {
        const cancelBtn = this.#dom.customModalCancel;
        const confirmBtn = this.#dom.customModalConfirm;
        const customModalEl = this.#dom.customModal;

        cancelBtn?.addEventListener('click', () => this.handleCustomModal(false));
        confirmBtn?.addEventListener('click', () => this.handleCustomModal(true));
        customModalEl?.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Escape') this.handleCustomModal(false);
        });
    }
}
