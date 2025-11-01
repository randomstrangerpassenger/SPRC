// js/view.js (Debug logs removed from renderTransactionList)
// @ts-check
import { CONFIG } from './constants.js';
import { formatCurrency, escapeHTML } from './utils.js';
import { t } from './i18n.js';
import Decimal from 'decimal.js';

/** @typedef {import('./types.js').Stock} Stock */
/** @typedef {import('./types.js').CalculatedStock} CalculatedStock */

export const PortfolioView = {
    /** @type {Record<string, HTMLElement | NodeListOf<HTMLElement> | null>} */
    dom: {},
    /** @type {import('chart.js').Chart | null} */
    chartInstance: null,
    /** @type {IntersectionObserver | null} */
    currentObserver: null,
    /** @type {((value: any) => void) | null} */
    activeModalResolver: null,
    /** @type {HTMLElement | null} */
    lastFocusedElement: null,

    cacheDomElements() {
        const D = document;
        this.dom = {
            ariaAnnouncer: D.getElementById('aria-announcer'),
            portfolioBody: D.getElementById('portfolioBody'),
            resultsSection: D.getElementById('resultsSection'),
            sectorAnalysisSection: D.getElementById('sectorAnalysisSection'),
            chartSection: D.getElementById('chartSection'),
            portfolioChart: D.getElementById('portfolioChart'),
            additionalAmountInput: D.getElementById('additionalAmount'),
            additionalAmountUSDInput: D.getElementById('additionalAmountUSD'),
            exchangeRateInput: D.getElementById('exchangeRate'),
            mainModeSelector: D.querySelectorAll('input[name="mainMode"]'),
            currencyModeSelector: D.querySelectorAll('input[name="currencyMode"]'),
            exchangeRateGroup: D.getElementById('exchangeRateGroup'),
            usdInputGroup: D.getElementById('usdInputGroup'),
            addInvestmentCard: D.getElementById('addInvestmentCard'),
            calculateBtn: D.getElementById('calculateBtn'),
            darkModeToggle: D.getElementById('darkModeToggle'),
            addNewStockBtn: D.getElementById('addNewStockBtn'),
            fetchAllPricesBtn: D.getElementById('fetchAllPricesBtn'),
            resetDataBtn: D.getElementById('resetDataBtn'),
            normalizeRatiosBtn: D.getElementById('normalizeRatiosBtn'),
            dataManagementBtn: D.getElementById('dataManagementBtn'),
            dataDropdownContent: D.getElementById('dataDropdownContent'),
            exportDataBtn: D.getElementById('exportDataBtn'),
            importDataBtn: D.getElementById('importDataBtn'),
            importFileInput: D.getElementById('importFileInput'),
            transactionModal: D.getElementById('transactionModal'),
            modalStockName: D.getElementById('modalStockName'),
            closeModalBtn: D.getElementById('closeModalBtn'),
            transactionListBody: D.getElementById('transactionListBody'), // 대상 요소
            newTransactionForm: D.getElementById('newTransactionForm'),
            txDate: D.getElementById('txDate'),
            txQuantity: D.getElementById('txQuantity'),
            txPrice: D.getElementById('txPrice'),
            portfolioSelector: D.getElementById('portfolioSelector'),
            newPortfolioBtn: D.getElementById('newPortfolioBtn'),
            renamePortfolioBtn: D.getElementById('renamePortfolioBtn'),
            deletePortfolioBtn: D.getElementById('deletePortfolioBtn'),
            portfolioTableHead: D.getElementById('portfolioTableHead'),
            ratioValidator: D.getElementById('ratioValidator'),
            ratioSum: D.getElementById('ratioSum'),
            customModal: D.getElementById('customModal'),
            customModalTitle: D.getElementById('customModalTitle'),
            customModalMessage: D.getElementById('customModalMessage'),
            customModalInput: D.getElementById('customModalInput'),
            customModalConfirm: D.getElementById('customModalConfirm'),
            customModalCancel: D.getElementById('customModalCancel'),
        };
        // console.log("DOM Caching: transactionListBody found?", this.dom.transactionListBody); // 로그 제거

        const cancelBtn = this.dom.customModalCancel;
        const confirmBtn = this.dom.customModalConfirm;
        const customModalEl = this.dom.customModal;
        cancelBtn?.addEventListener('click', () => this._handleCustomModal(false));
        confirmBtn?.addEventListener('click', () => this._handleCustomModal(true));
        customModalEl?.addEventListener('keydown', (e) => { if (e.key === 'Escape') this._handleCustomModal(false); });
    },

    announce(message, politeness = 'polite') {
        const announcer = this.dom.ariaAnnouncer;
        if (announcer) {
            announcer.textContent = '';
            announcer.setAttribute('aria-live', politeness);
            setTimeout(() => {
                announcer.textContent = message;
            }, 100);
        }
    },
    async showConfirm(title, message) {
        return this._showModal({ title, message, type: 'confirm' });
    },
    async showPrompt(title, message, defaultValue = '') {
        return this._showModal({ title, message, defaultValue, type: 'prompt' });
    },
    _showModal(options) {
        return new Promise((resolve) => {
            this.lastFocusedElement = /** @type {HTMLElement} */ (document.activeElement);
            this.activeModalResolver = resolve;
            const { title, message, defaultValue, type } = options;
            const titleEl = this.dom.customModalTitle;
            const messageEl = this.dom.customModalMessage;
            const inputEl = this.dom.customModalInput;
            const modalEl = this.dom.customModal;
            const confirmBtnEl = this.dom.customModalConfirm;

            if (titleEl) titleEl.textContent = title;
            if (messageEl) messageEl.textContent = message;

            if (type === 'prompt' && inputEl instanceof HTMLInputElement) {
                inputEl.value = defaultValue ?? '';
                inputEl.classList.remove('hidden');
            } else if (inputEl) {
                inputEl.classList.add('hidden');
            }
            if (modalEl) {
                modalEl.classList.remove('hidden');
                this._trapFocus(modalEl);
            }
            if (type === 'prompt' && inputEl instanceof HTMLInputElement) {
                inputEl.focus();
            } else if (confirmBtnEl instanceof HTMLButtonElement){
                confirmBtnEl.focus();
            }
        });
    },
    _handleCustomModal(confirmed) {
        if (!this.activeModalResolver) return;
        const inputEl = this.dom.customModalInput;
        const modalEl = this.dom.customModal;
        const isPrompt = inputEl instanceof HTMLInputElement && !inputEl.classList.contains('hidden');
        const value = isPrompt ? (confirmed ? inputEl.value : null) : confirmed;
        this.activeModalResolver(value);
        modalEl?.classList.add('hidden');
        if (this.lastFocusedElement) this.lastFocusedElement.focus();
        this.activeModalResolver = null;
        this.lastFocusedElement = null;
    },
    _trapFocus(element) {
        if (!element) return;
        const focusableEls = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableEls.length === 0) return;
        const firstFocusableEl = /** @type {HTMLElement} */ (focusableEls[0]);
        const lastFocusableEl = /** @type {HTMLElement} */ (focusableEls[focusableEls.length - 1]);
        element.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableEl) { lastFocusableEl.focus(); e.preventDefault(); }
            } else {
                if (document.activeElement === lastFocusableEl) { firstFocusableEl.focus(); e.preventDefault(); }
            }
        });
    },
    renderPortfolioSelector(portfolios, activeId) {
        const selector = this.dom.portfolioSelector;
        if (!(selector instanceof HTMLSelectElement)) return;
        selector.innerHTML = '';
        Object.entries(portfolios).forEach(([id, portfolio]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = portfolio.name;
            option.selected = (id === activeId);
            selector.appendChild(option);
        });
    },
    createStockRowFragment(stock, currency, mainMode) {
        const fragment = document.createDocumentFragment();
        const trInputs = document.createElement('tr');
        trInputs.className = 'stock-inputs';
        trInputs.dataset.id = stock.id;

        const createInput = (type, field, value, placeholder = '', disabled = false, ariaLabel = '') => {
            const input = document.createElement('input');
            input.type = type;
            input.dataset.field = field;
            let displayValue = '';
            if (value instanceof Decimal) {
                const decimalPlaces = (field === 'fixedBuyAmount' ? 0 : 2);
                displayValue = value.toFixed(decimalPlaces);
            } else {
                 const defaultValue = (field === 'fixedBuyAmount' ? '0' : (field === 'targetRatio' || field === 'currentPrice' ? '0.00' : ''));
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

        const createCheckbox = (field, checked, ariaLabel = '') => {
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.dataset.field = field;
            input.checked = checked;
            if (ariaLabel) input.setAttribute('aria-label', ariaLabel);
            return input;
        };

        const createButton = (action, text, ariaLabel = '', variant = 'grey') => {
            const button = document.createElement('button');
            button.className = 'btn btn--small';
            button.dataset.action = action;
            button.dataset.variant = variant;
            button.textContent = text;
            if (ariaLabel) button.setAttribute('aria-label', ariaLabel);
            return button;
        };

        const appendCellWithContent = (row, content) => {
            const td = row.insertCell();
            if (typeof content === 'string') {
                 td.textContent = content;
            } else if (content instanceof Node) {
                td.appendChild(content);
            }
            return td;
        };

        appendCellWithContent(trInputs, createInput('text', 'name', stock.name, t('ui.stockName')));
        appendCellWithContent(trInputs, createInput('text', 'ticker', stock.ticker, t('ui.ticker'), false, t('aria.tickerInput', { name: stock.name })));
        appendCellWithContent(trInputs, createInput('text', 'sector', stock.sector || '', t('ui.sector'), false, t('aria.sectorInput', { name: stock.name })));
        appendCellWithContent(trInputs, createInput('number', 'targetRatio', stock.targetRatio, '0.00', false, t('aria.targetRatioInput', { name: stock.name })));
        appendCellWithContent(trInputs, createInput('number', 'currentPrice', stock.currentPrice, '0.00', false, t('aria.currentPriceInput', { name: stock.name })));

        if (mainMode === 'add') {
            const fixedBuyCell = trInputs.insertCell();
            fixedBuyCell.style.textAlign = 'center';
            const checkbox = createCheckbox('isFixedBuyEnabled', stock.isFixedBuyEnabled, t('aria.fixedBuyToggle', { name: stock.name }));
            const amountInput = createInput('number', 'fixedBuyAmount', stock.fixedBuyAmount, '0', !stock.isFixedBuyEnabled, t('aria.fixedBuyAmount', { name: stock.name }));
            fixedBuyCell.append(checkbox, ' ', amountInput);
        }

        const actionCell = trInputs.insertCell();
        actionCell.style.textAlign = 'center';
        actionCell.append(
            createButton('manage', t('ui.manage'), t('aria.manageTransactions', { name: stock.name }), 'blue'),
            ' ',
            createButton('delete', t('ui.delete'), t('aria.deleteStock', { name: stock.name }), 'delete')
        );

        const trOutputs = document.createElement('tr');
        trOutputs.className = 'stock-outputs';
        trOutputs.dataset.id = stock.id;

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

        const createOutputCell = (label, value, valueClass = '') => {
            const td = document.createElement('td');
            td.className = 'output-cell';
            td.style.textAlign = 'right';
            td.innerHTML = `<span class="label">${escapeHTML(label)}</span><span class="value ${escapeHTML(valueClass)}">${escapeHTML(value)}</span>`;
            return td;
        };

        const outputColspanBase = 5;
        const actionColSpan = 1;
        const fixedBuyColSpan = mainMode === 'add' ? 1 : 0;
        const totalInputCols = 5 + fixedBuyColSpan + actionColSpan;
        const firstCellColspan = totalInputCols - outputColspanBase;

        appendCellWithContent(trOutputs, '');
        if (trOutputs.cells.length > 0) {
            trOutputs.cells[0].colSpan = firstCellColspan > 0 ? firstCellColspan : 1;
        }
        appendCellWithContent(trOutputs, createOutputCell(t('ui.quantity'), quantity.toFixed(0)));
        appendCellWithContent(trOutputs, createOutputCell(t('ui.avgBuyPrice'), formatCurrency(avgBuyPrice, currency)));
        appendCellWithContent(trOutputs, createOutputCell(t('ui.currentValue'), formatCurrency(currentAmount, currency)));
        appendCellWithContent(trOutputs, createOutputCell(t('ui.profitLoss'), `${profitSign}${formatCurrency(profitLoss, currency)}`, profitClass));
        appendCellWithContent(trOutputs, createOutputCell(t('ui.profitLossRate'), `${profitSign}${profitLossRate.toFixed(2)}%`, profitClass));

        fragment.append(trInputs, trOutputs);
        return fragment;
    },

    updateStockRowOutputs(id, stock, currency, mainMode) {
        const portfolioBody = this.dom.portfolioBody;
        const oldOutputRow = portfolioBody?.querySelector(`.stock-outputs[data-id="${id}"]`);
        if (oldOutputRow) {
             const fragment = this.createStockRowFragment(stock, currency, mainMode);
             const newOutputRow = fragment.querySelector('.stock-outputs');
             if(newOutputRow) {
                 oldOutputRow.replaceWith(newOutputRow);
             }
        }
    },

    updateAllTargetRatioInputs(portfolioData) {
        const portfolioBody = this.dom.portfolioBody;
        portfolioData.forEach(stock => {
            const inputRow = portfolioBody?.querySelector(`.stock-inputs[data-id="${stock.id}"]`);
            if (!inputRow) return;
            const targetRatioInput = inputRow.querySelector('input[data-field="targetRatio"]');
            if (targetRatioInput instanceof HTMLInputElement) {
                const ratio = stock.targetRatio instanceof Decimal ? stock.targetRatio : new Decimal(stock.targetRatio ?? 0);
                targetRatioInput.value = ratio.toFixed(2);
            }
        });
    },

    updateCurrentPriceInput(id, price) {
        const portfolioBody = this.dom.portfolioBody;
        const inputRow = portfolioBody?.querySelector(`.stock-inputs[data-id="${id}"]`);
        if (!inputRow) { return; }
        const currentPriceInput = inputRow.querySelector('input[data-field="currentPrice"]');
        if (currentPriceInput instanceof HTMLInputElement) {
            currentPriceInput.value = price;
        }
    },

    renderTable(calculatedPortfolioData, currency, mainMode) {
        this.updateTableHeader(currency, mainMode);
        const portfolioBody = this.dom.portfolioBody;
        if (!portfolioBody) return;
        portfolioBody.innerHTML = '';
        const fragment = document.createDocumentFragment();
        calculatedPortfolioData.forEach(stock => {
            fragment.appendChild(this.createStockRowFragment(stock, currency, mainMode));
        });
        portfolioBody.appendChild(fragment);
    },

    updateTableHeader(currency, mainMode) {
        const currencySymbol = currency.toLowerCase() === 'usd' ? t('ui.usd') : t('ui.krw');
        const fixedBuyHeader = mainMode === 'add' ? `<th scope="col">${t('ui.fixedBuy')}(${currencySymbol})</th>` : '';
        const tableHead = this.dom.portfolioTableHead;
        if (!tableHead) return;
        tableHead.innerHTML = `
            <tr role="row">
                <th scope="col" role="columnheader">${t('ui.stockName')}</th>
                <th scope="col" role="columnheader">${t('ui.ticker')}</th>
                <th scope="col" role="columnheader">${t('ui.sector')}</th>
                <th scope="col" role="columnheader">${t('ui.targetRatio')}(%)</th>
                <th scope="col" role="columnheader">${t('ui.currentPrice')}(${currencySymbol})</th>
                ${fixedBuyHeader}
                <th scope="col" role="columnheader">${t('ui.action')}</th>
            </tr>`;
    },

    toggleFixedBuyColumn(show) {
        const currencyInput = document.querySelector('input[name="currencyMode"]:checked');
        const currency = (currencyInput instanceof HTMLInputElement ? currencyInput.value : 'krw');
        this.updateTableHeader(currency, show ? 'add' : 'sell');
        const portfolioBody = this.dom.portfolioBody;
        portfolioBody?.querySelectorAll('.stock-inputs').forEach(row => {
            if (!(row instanceof HTMLTableRowElement)) return;
            const fixedBuyCell = row.cells[5];
            if (fixedBuyCell && fixedBuyCell.querySelector('input[data-field="isFixedBuyEnabled"]')) {
                 fixedBuyCell.style.display = show ? '' : 'none';
            }
        });
        portfolioBody?.querySelectorAll('.stock-outputs').forEach(row => {
             if (!(row instanceof HTMLTableRowElement)) return;
             const firstCell = row.cells[0];
             if (firstCell) {
                 const outputColspanBase = 5;
                 const actionColSpan = 1;
                 const fixedBuyColSpan = show ? 1 : 0;
                 const totalInputCols = 5 + fixedBuyColSpan + actionColSpan;
                 const firstCellColspan = totalInputCols - outputColspanBase;
                 firstCell.colSpan = firstCellColspan > 0 ? firstCellColspan : 1;
             }
         });
    },

    updateRatioSum(totalRatio) {
        const ratioSumEl = this.dom.ratioSum;
        const ratioValidatorEl = this.dom.ratioValidator;
        if (!ratioSumEl || !ratioValidatorEl) return;
        ratioSumEl.textContent = `${totalRatio.toFixed(1)}%`;
        ratioValidatorEl.classList.remove('valid', 'invalid');
        if (Math.abs(totalRatio - 100) < CONFIG.RATIO_TOLERANCE) {
            ratioValidatorEl.classList.add('valid');
        } else if (totalRatio > 0) {
            ratioValidatorEl.classList.add('invalid');
        }
    },

    updateMainModeUI(mainMode) {
        const addCard = this.dom.addInvestmentCard;
        const modeRadios = this.dom.mainModeSelector;
        addCard?.classList.toggle('hidden', mainMode !== 'add');
        modeRadios?.forEach(radio => {
            if (radio instanceof HTMLInputElement) radio.checked = radio.value === mainMode;
        });
        this.hideResults();
    },

    updateCurrencyModeUI(currencyMode) {
        const isUsdMode = currencyMode === 'usd';
        const rateGroup = this.dom.exchangeRateGroup;
        const usdGroup = this.dom.usdInputGroup;
        const currencyRadios = this.dom.currencyModeSelector;
        const usdInput = this.dom.additionalAmountUSDInput;
        rateGroup?.classList.toggle('hidden', !isUsdMode);
        usdGroup?.classList.toggle('hidden', !isUsdMode);
        currencyRadios?.forEach(radio => {
            if (radio instanceof HTMLInputElement) radio.checked = radio.value === currencyMode;
        });
        if (!isUsdMode && usdInput instanceof HTMLInputElement) usdInput.value = '';
    },

    openTransactionModal(stock, currency, transactions) {
        this.lastFocusedElement = /** @type {HTMLElement} */ (document.activeElement);
        const modal = this.dom.transactionModal;
        const modalTitle = this.dom.modalStockName;
        const dateInput = this.dom.txDate;
        if (!modal) return;
        modal.dataset.stockId = stock.id;
        if(modalTitle) {
            modalTitle.textContent = `${stock.name} (${stock.ticker}) ${t('modal.transactionTitle')}`;
        }
        this.renderTransactionList(transactions || [], currency);
        if(dateInput instanceof HTMLInputElement) dateInput.valueAsDate = new Date();
        modal.classList.remove('hidden');
        this._trapFocus(modal);
        const closeBtn = this.dom.closeModalBtn;
        if (closeBtn instanceof HTMLButtonElement) closeBtn.focus();
    },

    closeTransactionModal() {
        const modal = this.dom.transactionModal;
        const form = this.dom.newTransactionForm;
        if (!modal) return;
        modal.classList.add('hidden');
        if(form instanceof HTMLFormElement) form.reset();
        modal.removeAttribute('data-stock-id');
        if (this.lastFocusedElement) this.lastFocusedElement.focus();
    },

    /**
     * @description 거래 내역 목록(tbody)을 표준 DOM API를 사용하여 렌더링합니다. (디버깅 로그 제거됨)
     * @param {import('./types.js').Transaction[]} transactions - 거래 내역 배열
     * @param {string} currency - 현재 통화
     * @returns {void}
     */
    renderTransactionList(transactions, currency) {
        const listBody = this.dom.transactionListBody;
        if (!listBody) {
            console.error("View: renderTransactionList - listBody not found!");
            return;
        }
        // console.log("View: renderTransactionList called with transactions:", JSON.stringify(transactions)); // 로그 제거
        // console.log("View: Clearing listBody innerHTML. Current content:", listBody.innerHTML); // 로그 제거
        listBody.innerHTML = ''; // 기존 내용 지우기
        // console.log("View: listBody innerHTML after clearing:", listBody.innerHTML); // 로그 제거

        const table = listBody.closest('table');

        if (transactions.length === 0) {
            // console.log("View: transactions array is empty. Adding 'No transactions' message."); // 로그 제거
            if (table) {
                const tr = table.insertRow();
                const td = tr.insertCell();
                td.colSpan = 6;
                td.style.textAlign = 'center';
                td.textContent = t('view.noTransactions');
            }
            return;
        }

        // console.log("View: Processing transactions array to build rows..."); // 로그 제거

        const sorted = [...transactions].sort((a, b) => {
             const dateCompare = b.date.localeCompare(a.date);
             if (dateCompare !== 0) return dateCompare;
             const idA = a.id || '';
             const idB = b.id || '';
             return idB.localeCompare(idA);
        });

        sorted.forEach(tx => {
            if (table) {
                const tr = table.insertRow();
                tr.dataset.txId = tx.id;
                const quantityDec = tx.quantity instanceof Decimal ? tx.quantity : new Decimal(tx.quantity || 0);
                const priceDec = tx.price instanceof Decimal ? tx.price : new Decimal(tx.price || 0);
                const total = quantityDec.times(priceDec);

                tr.insertCell().textContent = tx.date;
                const typeTd = tr.insertCell();
                const typeSpan = document.createElement('span');
                typeSpan.className = tx.type === 'buy' ? 'text-buy' : 'text-sell';
                typeSpan.textContent = tx.type === 'buy' ? t('ui.buy') : t('ui.sell');
                typeTd.appendChild(typeSpan);

                const qtyTd = tr.insertCell();
                qtyTd.textContent = quantityDec.toNumber().toLocaleString();
                qtyTd.style.textAlign = 'right';

                const priceTd = tr.insertCell();
                priceTd.textContent = formatCurrency(priceDec, currency);
                priceTd.style.textAlign = 'right';

                const totalTd = tr.insertCell();
                totalTd.textContent = formatCurrency(total, currency);
                totalTd.style.textAlign = 'right';

                const actionTd = tr.insertCell();
                actionTd.style.textAlign = 'center';
                const btnDelete = document.createElement('button');
                btnDelete.className = 'btn btn--small';
                btnDelete.dataset.variant = 'delete';
                btnDelete.dataset.action = 'delete-tx';
                 btnDelete.textContent = t('ui.delete');
                btnDelete.setAttribute('aria-label', t('aria.deleteTransaction', { date: tx.date }));
                actionTd.appendChild(btnDelete);
            }
        });
         // console.log("View: Finished processing transactions."); // 로그 제거
    },

    displaySkeleton() {
        const skeletonHTML = `...`; // 생략
        const resultsEl = this.dom.resultsSection;
        if (!resultsEl) return;
        resultsEl.innerHTML = skeletonHTML;
        resultsEl.classList.remove('hidden');
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    cleanupObserver() {
        if (this.currentObserver) { this.currentObserver.disconnect(); this.currentObserver = null; }
    },

    destroyChart() {
        if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }
    },

    cleanup() {
        this.cleanupObserver();
        this.destroyChart();
    },

    hideResults() {
        const resultsEl = this.dom.resultsSection;
        const sectorEl = this.dom.sectorAnalysisSection;
        const chartEl = this.dom.chartSection;
        if (resultsEl) { resultsEl.innerHTML = ''; resultsEl.classList.add('hidden'); }
        if (sectorEl) { sectorEl.innerHTML = ''; sectorEl.classList.add('hidden'); }
        if (chartEl) { chartEl.classList.add('hidden'); }
        this.cleanupObserver();
    },

    displayResults(html) {
        requestAnimationFrame(() => {
            const resultsEl = this.dom.resultsSection;
            if (!resultsEl) return;
            resultsEl.innerHTML = html;
            resultsEl.classList.remove('hidden');
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
             this.announce(t('aria.resultsLoaded'), 'assertive');
            const rows = resultsEl.querySelectorAll('.result-row-highlight');
            if (rows.length === 0) return;
            this.cleanupObserver();
            this.currentObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = /** @type {HTMLElement} */ (entry.target);
                        target.style.transitionDelay = target.dataset.delay || '0s';
                        target.classList.add('in-view');
                        this.currentObserver?.unobserve(target);
                    }
                });
            }, { threshold: 0.1 });
            rows.forEach((row) => this.currentObserver?.observe(row));
        });
    },

    displaySectorAnalysis(html) {
         requestAnimationFrame(() => {
            const sectorEl = this.dom.sectorAnalysisSection;
            if (!sectorEl) return;
            sectorEl.innerHTML = html;
            sectorEl.classList.remove('hidden');
        });
    },

    displayChart(Chart, labels, data, title) {
        const chartEl = this.dom.chartSection;
        const canvas = this.dom.portfolioChart;
        if (!chartEl || !(canvas instanceof HTMLCanvasElement)) return;
        chartEl.classList.remove('hidden');
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: title, font: { size: 16 } }
            }
        };
        const chartData = {
            labels: labels,
            datasets: [{
                label: t('template.ratio'),
                data: data,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#77DD77', '#FDFD96', '#836FFF', '#FFB347', '#FFD1DC'],
                borderColor: document.body.classList.contains('dark-mode') ? '#2d2d2d' : '#ffffff',
                borderWidth: 2
            }]
        };
        if (this.chartInstance) {
            this.chartInstance.data = chartData;
            this.chartInstance.options = chartOptions;
            this.chartInstance.update();
        } else {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                this.chartInstance = new Chart(ctx, {
                    type: 'doughnut',
                    data: chartData,
                    options: chartOptions
                });
            }
        }
    },

    toggleInputValidation(inputElement, isValid, errorMessage = '') {
        if (!inputElement) return;
        inputElement.classList.toggle('input-invalid', !isValid);
        inputElement.setAttribute('aria-invalid', String(!isValid));
    },


    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();
        const toast = document.createElement('div');
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = message.replace(/\n/g, '<br>');
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    focusOnNewStock(stockId) {
        const portfolioBody = this.dom.portfolioBody;
        const inputRow = portfolioBody?.querySelector(`.stock-inputs[data-id="${stockId}"]`);
        if (!inputRow) return;
        const nameInput = inputRow.querySelector('input[data-field="name"]');
        if (nameInput instanceof HTMLInputElement) {
            nameInput.focus();
            nameInput.select();
        }
    },

    toggleFetchButton(loading) {
        const btn = this.dom.fetchAllPricesBtn;
        if (!(btn instanceof HTMLButtonElement)) return;
        btn.disabled = loading;
        btn.textContent = loading ? t('ui.fetchingPrices') : t('ui.updateAllPrices');
        if (loading) {
            btn.setAttribute('aria-busy', 'true');
            this.announce(t('ui.fetchingPrices'), 'assertive');
        } else {
            btn.removeAttribute('aria-busy');
        }
    }
}; // End of PortfolioView object