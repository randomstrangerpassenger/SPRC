import { CONFIG, MESSAGES } from './constants.js';
import { formatCurrency } from './utils.js';
import Decimal from 'decimal.js';
import Chart from 'chart.js/auto';

export const PortfolioView = {
    dom: {},
    chartInstance: null,
    currentObserver: null,

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
            saveDataBtn: D.getElementById('saveDataBtn'),
            loadDataBtn: D.getElementById('loadDataBtn'),
            exportDataBtn: D.getElementById('exportDataBtn'),
            importDataBtn: D.getElementById('importDataBtn'),
            importFileInput: D.getElementById('importFileInput'),
            portfolioTableHead: D.getElementById('portfolioTableHead'),
            ratioValidator: D.getElementById('ratioValidator'),
            ratioSum: D.getElementById('ratioSum'),
            portfolioSelector: D.getElementById('portfolioSelector'),
            newPortfolioBtn: D.getElementById('newPortfolioBtn'),
            renamePortfolioBtn: D.getElementById('renamePortfolioBtn'),
            deletePortfolioBtn: D.getElementById('deletePortfolioBtn'),
            
            transactionModal: D.getElementById('transactionModal'),
            modalStockName: D.getElementById('modalStockName'),
            closeModalBtn: D.getElementById('closeModalBtn'),
            transactionListBody: D.getElementById('transactionListBody'),
            newTransactionForm: D.getElementById('newTransactionForm'),
            txDate: D.getElementById('txDate'),
            txQuantity: D.getElementById('txQuantity'),
            txPrice: D.getElementById('txPrice'),
        };
    },

    renderPortfolioSelector(portfolios, activeId) {
        this.dom.portfolioSelector.innerHTML = '';
        for (const id in portfolios) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = portfolios[id].name;
            if (id.toString() === activeId.toString()) {
                option.selected = true;
            }
            this.dom.portfolioSelector.appendChild(option);
        }
    },
    
    createStockRowElement(stock, currency, mainMode) {
        const tbody = document.createElement('tbody');
        tbody.className = 'stock-entry';
        tbody.dataset.id = stock.id;

        const trInputs = document.createElement('tr');
        trInputs.className = 'stock-inputs';

        const trOutputs = document.createElement('tr');
        trOutputs.className = 'stock-outputs';

        const { quantity, avgBuyPrice, currentAmount, profitLoss, profitLossRate } = stock.calculated;

        const createCell = (content, className = '') => {
            const td = document.createElement('td');
            if (className) td.className = className;
            if (typeof content === 'string' || typeof content === 'number') {
                td.innerHTML = content;
            } else if (content instanceof Node) {
                td.appendChild(content);
            }
            return td;
        };
        
        const createInput = (type, field, value, ariaLabel, styles = {}) => {
            const input = document.createElement('input');
            input.type = type;
            input.dataset.field = field;
            input.setAttribute('aria-label', ariaLabel);
            input.value = (value === undefined || value === null) ? '' : value;
            if (styles.inline) Object.assign(input.style, styles.inline);
            if (styles.className) input.className = styles.className;
            return input;
        };

        const nameCell = createCell(createInput('text', 'name', stock.name, MESSAGES.TICKER_INPUT(stock.name)), 'cell-name');
        nameCell.rowSpan = 2;
        trInputs.appendChild(nameCell);
        
        trInputs.appendChild(createCell(createInput('text', 'ticker', stock.ticker, MESSAGES.TICKER_INPUT(stock.name), { inline: { textAlign: 'center' } }), 'cell-ticker'));
        trInputs.appendChild(createCell(createInput('text', 'sector', stock.sector, MESSAGES.SECTOR_INPUT(stock.name), { inline: { textAlign: 'center' } }), 'cell-sector'));
        trInputs.appendChild(createCell(createInput('number', 'targetRatio', stock.targetRatio.toFixed(2), MESSAGES.TARGET_RATIO_INPUT(stock.name), { className: 'amount-input', inline: { width: '80px', textAlign: 'center' } }), 'cell-targetRatio'));
        trInputs.appendChild(createCell(createInput('number', 'currentPrice', stock.currentPrice, MESSAGES.CURRENT_PRICE_INPUT(stock.name), { className: 'amount-input' }), 'cell-currentPrice'));
        
        if (mainMode === 'add') {
            const fixedBuyContainer = document.createElement('div');
            fixedBuyContainer.style.cssText = 'display: flex; align-items: center; gap: 8px; justify-content: center;';
            const checkbox = createInput('checkbox', 'isFixedBuyEnabled', stock.isFixedBuyEnabled, '고정 매수 활성화');
            checkbox.checked = stock.isFixedBuyEnabled;
            const amountInput = createInput('number', 'fixedBuyAmount', stock.fixedBuyAmount, '고정 매수 금액', { className: 'amount-input' });
            amountInput.disabled = !stock.isFixedBuyEnabled;
            fixedBuyContainer.append(checkbox, amountInput);
            trInputs.appendChild(createCell(fixedBuyContainer, 'cell-fixedBuy'));
        }
        
        const actionsContainer = document.createElement('div');
        actionsContainer.style.cssText = 'display: flex; gap: 5px; justify-content: center;';
        const manageBtn = document.createElement('button');
        manageBtn.className = 'btn btn--blue btn--small';
        manageBtn.dataset.action = 'manage';
        manageBtn.textContent = '거래 관리';
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn--delete btn--small';
        deleteBtn.dataset.action = 'delete';
        deleteBtn.textContent = '삭제';
        actionsContainer.append(manageBtn, deleteBtn);
        
        const actionsCell = createCell(actionsContainer, 'cell-actions');
        actionsCell.rowSpan = 2;
        trInputs.appendChild(actionsCell);

        const createOutputCell = (label, valueContent) => {
            return `<div class="output-cell">
                        <span class="label">${label}</span>
                        <span class="value">${valueContent}</span>
                    </div>`;
        };
        
        const profitClass = profitLoss.isNegative() ? 'text-sell' : 'text-buy';
        const profitSign = profitLoss.isPositive() ? '+' : '';

        const outputsHTML = `
            <div class="outputs-container">
                ${createOutputCell('보유 수량', quantity.toNumber().toLocaleString())}
                ${createOutputCell('평균 단가', formatCurrency(avgBuyPrice, currency))}
                ${createOutputCell('평가 금액', formatCurrency(currentAmount, currency))}
                ${createOutputCell('손익(수익률)', `<span class="${profitClass}">${profitSign}${formatCurrency(profitLoss, currency)} (${profitSign}${profitLossRate.toFixed(2)}%)</span>`)}
            </div>
        `;
        
        const outputContainerCell = document.createElement('td');
        outputContainerCell.colSpan = mainMode === 'add' ? 5 : 4;
        outputContainerCell.innerHTML = outputsHTML;
        trOutputs.appendChild(outputContainerCell);

        tbody.append(trInputs, trOutputs);
        return tbody;
    },

    updateStockRowElement(tbody, stock, currency, mainMode) {
        const { quantity, avgBuyPrice, currentAmount, profitLoss, profitLossRate } = stock.calculated;
        
        tbody.querySelector('[data-field="name"]').value = stock.name;
        tbody.querySelector('[data-field="ticker"]').value = stock.ticker;
        tbody.querySelector('[data-field="sector"]').value = stock.sector;
        tbody.querySelector('[data-field="targetRatio"]').value = stock.targetRatio.toFixed(2);
        tbody.querySelector('[data-field="currentPrice"]').value = stock.currentPrice;

        const outputContainer = tbody.querySelector('.outputs-container');
        if (outputContainer) {
            const profitClass = profitLoss.isNegative() ? 'text-sell' : 'text-buy';
            const profitSign = profitLoss.isPositive() ? '+' : '';

            outputContainer.children[0].querySelector('.value').textContent = quantity.toNumber().toLocaleString();
            outputContainer.children[1].querySelector('.value').textContent = formatCurrency(avgBuyPrice, currency);
            outputContainer.children[2].querySelector('.value').textContent = formatCurrency(currentAmount, currency);
            const profitValueEl = outputContainer.children[3].querySelector('.value span');
            profitValueEl.className = profitClass;
            profitValueEl.innerHTML = `${profitSign}${formatCurrency(profitLoss, currency)} (${profitSign}${profitLossRate.toFixed(2)}%)`;
        }
        
        if (mainMode === 'add') {
            const checkbox = tbody.querySelector('[data-field="isFixedBuyEnabled"]');
            const amountInput = tbody.querySelector('[data-field="fixedBuyAmount"]');
            if (checkbox) checkbox.checked = stock.isFixedBuyEnabled;
            if (amountInput) {
                amountInput.value = stock.fixedBuyAmount;
                amountInput.disabled = !stock.isFixedBuyEnabled;
            }
        }
    },

    renderTable(calculatedPortfolioData, currency, mainMode) {
        this.updateTableHeader(currency, mainMode);
        this.dom.portfolioBody.innerHTML = ''; 

        const fragment = document.createDocumentFragment();
        calculatedPortfolioData.forEach(stock => {
            fragment.appendChild(this.createStockRowElement(stock, currency, mainMode));
        });
        this.dom.portfolioBody.appendChild(fragment);
    },

    updateTableHeader(currency, mainMode) {
        const currencySymbol = currency.toLowerCase() === 'usd' ? '$' : '원';
        const fixedBuyHeader = mainMode === 'add' ? `<th scope="col">고정 매수(${currencySymbol})</th>` : '';
        this.dom.portfolioTableHead.innerHTML = `
            <tr>
                <th scope="col" rowspan="2">종목명</th>
                <th scope="col">티커</th>
                <th scope="col">섹터</th>
                <th scope="col">목표 비율(%)</th>
                <th scope="col">현재가(${currencySymbol})</th>
                ${fixedBuyHeader}
                <th scope="col" rowspan="2">작업</th>
            </tr>
        `;
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
        this.dom.transactionModal.dataset.stockId = stock.id;
        this.dom.modalStockName.textContent = `${stock.name} (${stock.ticker}) 거래 내역`;
        this.renderTransactionList(stock.transactions, currency);
        this.dom.txDate.valueAsDate = new Date();
        this.dom.transactionModal.classList.remove('hidden');
    },

    closeTransactionModal() {
        this.dom.transactionModal.classList.add('hidden');
        this.dom.newTransactionForm.reset();
        this.dom.transactionModal.removeAttribute('data-stock-id');
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
                <td>${tx.date}</td>
                <td><span class="${tx.type === 'buy' ? 'text-buy' : 'text-sell'}">${tx.type === 'buy' ? '매수' : '매도'}</span></td>
                <td style="text-align:right;">${Number(tx.quantity).toLocaleString()}</td>
                <td style="text-align:right;">${formatCurrency(tx.price, currency)}</td>
                <td style="text-align:right;">${formatCurrency(total, currency)}</td>
                <td style="text-align:center;"><button class="btn btn--delete btn--small" data-action="delete-tx">삭제</button></td>
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
                    <div class="skeleton skeleton-table-row">
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text--short"></div>
                    </div>
                    <div class="skeleton skeleton-table-row">
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text--short"></div>
                    </div>
                    <div class="skeleton skeleton-table-row">
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text--short"></div>
                    </div>
                     <div class="skeleton skeleton-table-row">
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text--short"></div>
                    </div>
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
        this.cleanupObserver();

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

            rows.forEach((row) => {
                this.currentObserver.observe(row);
            });
        });
    },

    displaySectorAnalysis(html) {
         requestAnimationFrame(() => {
            this.dom.sectorAnalysisSection.innerHTML = html;
            this.dom.sectorAnalysisSection.classList.remove('hidden');
        });
    },
    
    displayChart(labels, data, title) {
        this.dom.chartSection.classList.remove('hidden');

        if (this.chartInstance) {
            this.chartInstance.data.labels = labels;
            this.chartInstance.data.datasets[0].data = data;
            this.chartInstance.options.plugins.title.text = title;
            this.chartInstance.update();
        } else {
            const ctx = this.dom.portfolioChart.getContext('2d');
            this.chartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '비중',
                        data: data,
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                            '#C9CBCF', '#77DD77', '#FDFD96', '#836FFF', '#FFB347', '#FFD1DC'
                        ],
                        borderColor: document.body.classList.contains('dark-mode') ? '#2d2d2d' : '#ffffff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: title,
                            font: {
                                size: 16
                            }
                        }
                    }
                }
            });
        }
    },

    toggleInputValidation(inputElement, isValid, errorMessage = '') {
        inputElement.classList.toggle('input-invalid', !isValid);
        inputElement.setAttribute('aria-invalid', String(!isValid));
        
        const errorClass = 'error-message';
        const parent = inputElement.parentElement;
        let errorEl = parent.querySelector(`.${errorClass}`);

        if (!isValid && errorMessage) {
            if (!errorEl) {
                errorEl = document.createElement('span');
                errorEl.className = errorClass;
                errorEl.style.cssText = `
                    color: var(--invalid-text-color);
                    font-size: 0.8rem;
                    width: 100%;
                    display: block;
                    margin-top: 4px;
                `;
                parent.appendChild(errorEl);
            }
            errorEl.textContent = errorMessage;
        } else if (errorEl) {
            errorEl.remove();
        }
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