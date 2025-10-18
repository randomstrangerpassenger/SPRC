import { CONFIG, MESSAGES } from './constants.js';
import { formatCurrency, escapeHTML } from './utils.js';
import Decimal from 'decimal.js';

export const PortfolioView = {
    dom: {},
    chartInstance: null,
    currentObserver: null,
    activeModalResolver: null,
    lastFocusedElement: null,

    cacheDomElements() {
        const D = document;
        this.dom = {
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
            resetDataBtn: D.getElementById('resetDataBtn'),
            normalizeRatiosBtn: D.getElementById('normalizeRatiosBtn'),
            
            transactionModal: D.getElementById('transactionModal'),
            modalStockName: D.getElementById('modalStockName'),
            closeModalBtn: D.getElementById('closeModalBtn'),
            transactionListBody: D.getElementById('transactionListBody'),
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
        
        this.dom.customModalCancel.addEventListener('click', () => this._handleCustomModal(false));
        this.dom.customModalConfirm.addEventListener('click', () => this._handleCustomModal(true));
        this.dom.customModal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this._handleCustomModal(false);
        });
    },

    async showConfirm(title, message) {
        return this._showModal({ title, message, type: 'confirm' });
    },
    
    async showPrompt(title, message, defaultValue = '') {
        return this._showModal({ title, message, defaultValue, type: 'prompt' });
    },

    _showModal({ title, message, defaultValue, type }) {
        return new Promise((resolve) => {
            this.lastFocusedElement = document.activeElement;
            this.activeModalResolver = resolve;
            
            this.dom.customModalTitle.textContent = title;
            this.dom.customModalMessage.textContent = message;

            if (type === 'prompt') {
                this.dom.customModalInput.value = defaultValue;
                this.dom.customModalInput.classList.remove('hidden');
            } else {
                this.dom.customModalInput.classList.add('hidden');
            }
            
            this.dom.customModal.classList.remove('hidden');
            this._trapFocus(this.dom.customModal);
            
            type === 'prompt' ? this.dom.customModalInput.focus() : this.dom.customModalConfirm.focus();
        });
    },
    
    _handleCustomModal(confirmed) {
        if (!this.activeModalResolver) return;

        const value = this.dom.customModalInput.classList.contains('hidden') 
            ? confirmed
            : (confirmed ? this.dom.customModalInput.value : null);

        this.activeModalResolver(value);

        this.dom.customModal.classList.add('hidden');
        if (this.lastFocusedElement) this.lastFocusedElement.focus();
        
        this.activeModalResolver = null;
        this.lastFocusedElement = null;
    },

    _trapFocus(element) {
        const focusableEls = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusableEl = focusableEls[0];
        const lastFocusableEl = focusableEls[focusableEls.length - 1];
        
        element.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableEl) {
                    lastFocusableEl.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusableEl) {
                    firstFocusableEl.focus();
                    e.preventDefault();
                }
            }
        });
    },

    renderPortfolioSelector(portfolios, activeId) {
        this.dom.portfolioSelector.innerHTML = '';
        Object.entries(portfolios).forEach(([id, portfolio]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = portfolio.name;
            option.selected = (id === activeId);
            this.dom.portfolioSelector.appendChild(option);
        });
    },
    
    createStockRowFragment(stock, currency, mainMode) {
        const fragment = document.createDocumentFragment();
        const trInputs = document.createElement('tr');
        trInputs.className = 'stock-inputs';
        trInputs.dataset.id = stock.id;

        const trOutputs = document.createElement('tr');
        trOutputs.className = 'stock-outputs';
        trOutputs.dataset.id = stock.id;
        
        trInputs.innerHTML = this.getStockInputsHTML(stock, mainMode);
        trOutputs.innerHTML = this.getStockOutputsHTML(stock, currency, mainMode);
        
        fragment.append(trInputs, trOutputs);
        return fragment;
    },
    
    getStockInputsHTML(stock, mainMode) {
        const fixedBuyHTML = mainMode === 'add' ? `
            <td>
                <div style="display: flex; align-items: center; gap: 8px; justify-content: center;">
                    <input type="checkbox" data-field="isFixedBuyEnabled" aria-label="고정 매수 활성화" ${stock.isFixedBuyEnabled ? 'checked' : ''}>
                    <input type="number" class="amount-input" data-field="fixedBuyAmount" value="${stock.fixedBuyAmount}" aria-label="고정 매수 금액" ${!stock.isFixedBuyEnabled ? 'disabled' : ''}>
                </div>
            </td>` : '';

        return `
            <td><input type="text" data-field="name" value="${escapeHTML(stock.name)}" aria-label="${MESSAGES.TICKER_INPUT(stock.name)}"></td>
            <td><input type="text" data-field="ticker" value="${escapeHTML(stock.ticker)}" aria-label="${MESSAGES.TICKER_INPUT(stock.name)}"></td>
            <td><input type="text" data-field="sector" value="${escapeHTML(stock.sector)}" aria-label="${MESSAGES.SECTOR_INPUT(stock.name)}"></td>
            <td><input type="number" class="amount-input" data-field="targetRatio" value="${stock.targetRatio.toFixed(2)}" aria-label="${MESSAGES.TARGET_RATIO_INPUT(stock.name)}"></td>
            <td><input type="number" class="amount-input" data-field="currentPrice" value="${stock.currentPrice}" aria-label="${MESSAGES.CURRENT_PRICE_INPUT(stock.name)}"></td>
            ${fixedBuyHTML}
            <td>
                <div style="display: flex; gap: 5px; justify-content: center;">
                    <button class="btn btn--blue btn--small" data-action="manage" aria-label="${escapeHTML(stock.name)} 거래 관리">거래 관리</button>
                    <button class="btn btn--delete btn--small" data-action="delete" aria-label="${escapeHTML(stock.name)} 삭제">삭제</button>
                </div>
            </td>`;
    },

    getStockOutputsHTML(stock, currency, mainMode) {
        const { quantity, avgBuyPrice, currentAmount, profitLoss, profitLossRate } = stock.calculated;
        const profitClass = profitLoss.isNegative() ? 'text-sell' : 'text-buy';
        const profitSign = profitLoss.isPositive() ? '+' : '';
        const totalCols = mainMode === 'add' ? 7 : 6;
        const emptyCols = totalCols - 5 > 0 ? `<td colspan="${totalCols - 5}"></td>` : '';

        return `
            <td></td>
            <td class="output-cell"><span class="label">보유 수량</span><span class="value">${quantity.toNumber().toLocaleString()}</span></td>
            <td class="output-cell"><span class="label">평균 단가</span><span class="value">${formatCurrency(avgBuyPrice, currency)}</span></td>
            <td class="output-cell"><span class="label">평가 금액</span><span class="value">${formatCurrency(currentAmount, currency)}</span></td>
            <td class="output-cell"><span class="label">손익(수익률)</span><span class="value ${profitClass}">${profitSign}${formatCurrency(profitLoss, currency)} (${profitSign}${profitLossRate.toFixed(2)}%)</span></td>
            ${emptyCols}`;
    },

    updateStockRowOutputs(id, stock, currency, mainMode) {
        const row = this.dom.portfolioBody.querySelector(`.stock-outputs[data-id="${id}"]`);
        if (row) {
            row.innerHTML = this.getStockOutputsHTML(stock, currency, mainMode);
        }
    },

    renderTable(calculatedPortfolioData, currency, mainMode) {
        this.updateTableHeader(currency, mainMode);
        this.dom.portfolioBody.innerHTML = ''; 
        
        const fragment = document.createDocumentFragment();
        calculatedPortfolioData.forEach(stock => {
            fragment.appendChild(this.createStockRowFragment(stock, currency, mainMode));
        });
        this.dom.portfolioBody.appendChild(fragment);
    },

    updateTableHeader(currency, mainMode) {
        const currencySymbol = currency.toLowerCase() === 'usd' ? '$' : '원';
        const fixedBuyHeader = mainMode === 'add' ? `<th scope="col">고정 매수(${currencySymbol})</th>` : '';
        this.dom.portfolioTableHead.innerHTML = `
            <tr role="row">
                <th scope="col" role="columnheader">종목명</th>
                <th scope="col" role="columnheader">티커</th>
                <th scope="col" role="columnheader">섹터</th>
                <th scope="col" role="columnheader">목표 비율(%)</th>
                <th scope="col" role="columnheader">현재가(${currencySymbol})</th>
                ${fixedBuyHeader}
                <th scope="col" role="columnheader">작업</th>
            </tr>`;
    },

    updateRatioSum(totalRatio) {
        this.dom.ratioSum.textContent = `${totalRatio.toFixed(1)}%`;
        this.dom.ratioValidator.classList.remove('valid', 'invalid');
        if (Math.abs(totalRatio - 100) < CONFIG.RATIO_TOLERANCE) {
            this.dom.ratioValidator.classList.add('valid');
        } else if (totalRatio > 0) {
            this.dom.ratioValidator.classList.add('invalid');
        }
    },

    updateMainModeUI(mainMode) {
        this.dom.addInvestmentCard.classList.toggle('hidden', mainMode !== 'add');
        this.dom.mainModeSelector.forEach(radio => {
            radio.checked = radio.value === mainMode;
        });
        this.hideResults();
    },

    updateCurrencyModeUI(currencyMode) {
        const isUsdMode = currencyMode === 'usd';
        this.dom.exchangeRateGroup.classList.toggle('hidden', !isUsdMode);
        this.dom.usdInputGroup.classList.toggle('hidden', !isUsdMode);
        this.dom.currencyModeSelector.forEach(radio => {
            radio.checked = radio.value === currencyMode;
        });
        if (!isUsdMode) this.dom.additionalAmountUSDInput.value = '';
    },
    
    openTransactionModal(stock, currency) {
        this.lastFocusedElement = document.activeElement;
        this.dom.transactionModal.dataset.stockId = stock.id;
        this.dom.modalStockName.textContent = `${escapeHTML(stock.name)} (${escapeHTML(stock.ticker)}) 거래 내역`;
        this.renderTransactionList(stock.transactions, currency);
        this.dom.txDate.valueAsDate = new Date();
        this.dom.transactionModal.classList.remove('hidden');
        this._trapFocus(this.dom.transactionModal);
        this.dom.closeModalBtn.focus();
    },

    closeTransactionModal() {
        this.dom.transactionModal.classList.add('hidden');
        this.dom.newTransactionForm.reset();
        this.dom.transactionModal.removeAttribute('data-stock-id');
        if (this.lastFocusedElement) this.lastFocusedElement.focus();
    },

    renderTransactionList(transactions, currency) {
        this.dom.transactionListBody.innerHTML = '';
        if (transactions.length === 0) {
            this.dom.transactionListBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">거래 내역이 없습니다.</td></tr>';
            return;
        }
        
        const sorted = [...transactions].sort((a,b) => new Date(b.date) - new Date(a.date));

        sorted.forEach(tx => {
            const tr = document.createElement('tr');
            tr.dataset.txId = tx.id;
            const total = new Decimal(tx.quantity || 0).times(new Decimal(tx.price || 0));
            tr.innerHTML = `
                <td>${escapeHTML(tx.date)}</td>
                <td><span class="${tx.type === 'buy' ? 'text-buy' : 'text-sell'}">${tx.type === 'buy' ? '매수' : '매도'}</span></td>
                <td style="text-align:right;">${Number(tx.quantity).toLocaleString()}</td>
                <td style="text-align:right;">${formatCurrency(tx.price, currency)}</td>
                <td style="text-align:right;">${formatCurrency(total, currency)}</td>
                <td style="text-align:center;"><button class="btn btn--delete btn--small" data-action="delete-tx" aria-label="${tx.date} 거래 삭제">삭제</button></td>
            `;
            this.dom.transactionListBody.appendChild(tr);
        });
    },
    
    displaySkeleton() {
        const skeletonHTML = `
            <div class="skeleton-wrapper">
                <div class="skeleton-summary">
                    <div class="skeleton skeleton-summary-item"></div>
                    <div class="skeleton skeleton-summary-item"></div>
                    <div class="skeleton skeleton-summary-item"></div>
                </div>
                <div class="skeleton-table">
                    <div class="skeleton skeleton-table-row"><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text--short"></div></div>
                    <div class="skeleton skeleton-table-row"><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text--short"></div></div>
                    <div class="skeleton skeleton-table-row"><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text--short"></div></div>
                </div>
            </div>
        `;
        this.dom.resultsSection.innerHTML = skeletonHTML;
        this.dom.resultsSection.classList.remove('hidden');
        this.dom.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    cleanupObserver() {
        if (this.currentObserver) {
            this.currentObserver.disconnect();
            this.currentObserver = null;
        }
    },

    hideResults() {
        this.dom.resultsSection.innerHTML = '';
        this.dom.resultsSection.classList.add('hidden');
        this.dom.sectorAnalysisSection.innerHTML = '';
        this.dom.sectorAnalysisSection.classList.add('hidden');
        this.dom.chartSection.classList.add('hidden');
        this.cleanupObserver();
    },

    displayResults(html) {
        requestAnimationFrame(() => {
            this.dom.resultsSection.innerHTML = html;
            this.dom.resultsSection.classList.remove('hidden');
            this.dom.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

            const rows = this.dom.resultsSection.querySelectorAll('.result-row-highlight');
            
            this.currentObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.transitionDelay = entry.target.dataset.delay;
                        entry.target.classList.add('in-view');
                        this.currentObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            rows.forEach((row) => this.currentObserver.observe(row));
        });
    },

    displaySectorAnalysis(html) {
         requestAnimationFrame(() => {
            this.dom.sectorAnalysisSection.innerHTML = html;
            this.dom.sectorAnalysisSection.classList.remove('hidden');
        });
    },
    
    displayChart(Chart, labels, data, title) {
        this.dom.chartSection.classList.remove('hidden');

        const chartOptions = {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: title, font: { size: 16 } }
            }
        };

        const chartData = {
            labels: labels,
            datasets: [{
                label: '비중',
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
            const ctx = this.dom.portfolioChart.getContext('2d');
            this.chartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: chartData,
                options: chartOptions
            });
        }
    },

    toggleInputValidation(inputElement, isValid, errorMessage = '') {
        inputElement.classList.toggle('input-invalid', !isValid);
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
    }
};