// js/view.js (Updated)
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

    /**
     * @description 필요한 DOM 요소들을 찾아 `this.dom` 객체에 캐시합니다.
     * @returns {void}
     */
    cacheDomElements() {
        const D = document;
        this.dom = {
            // --- ⬇️ [A11Y] 스크린 리더 공지 요소 추가 ⬇️ ---
            ariaAnnouncer: D.getElementById('aria-announcer'),
            // --- ⬆️ [A11Y] ⬆️ ---

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

            // --- ⬇️ [A11Y] 데이터 드롭다운 요소 추가 ⬇️ ---
            dataManagementBtn: D.getElementById('dataManagementBtn'),
            dataDropdownContent: D.getElementById('dataDropdownContent'),
            exportDataBtn: D.getElementById('exportDataBtn'),
            importDataBtn: D.getElementById('importDataBtn'),
            importFileInput: D.getElementById('importFileInput'), // Input already existed
            // --- ⬆️ [A11Y] ⬆️ ---

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

        // Custom Modal 리스너
        /** @type {HTMLButtonElement | null} */
        const cancelBtn = this.dom.customModalCancel;
        /** @type {HTMLButtonElement | null} */
        const confirmBtn = this.dom.customModalConfirm;
        /** @type {HTMLElement | null} */
        const customModalEl = this.dom.customModal;

        cancelBtn?.addEventListener('click', () => this._handleCustomModal(false));
        confirmBtn?.addEventListener('click', () => this._handleCustomModal(true));
        customModalEl?.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this._handleCustomModal(false);
        });
    },

    // --- ⬇️ [A11Y] 스크린 리더 공지 함수 추가 ⬇️ ---
    /**
     * @description 스크린 리더가 읽을 메시지를 설정합니다.
     * @param {string} message - 공지할 메시지
     * @param {'polite' | 'assertive'} [politeness='polite'] - 공지 수준
     */
    announce(message, politeness = 'polite') {
        const announcer = this.dom.ariaAnnouncer;
        if (announcer) {
            announcer.textContent = ''; // Clear previous message
            announcer.setAttribute('aria-live', politeness);
            // Timeout needed for some screen readers to register the change
            setTimeout(() => {
                announcer.textContent = message;
            }, 100);
        }
    },
    // --- ⬆️ [A11Y] ⬆️ ---


    /**
     * @description 확인/취소 형태의 모달을 표시합니다.
     * @param {string} title - 모달 제목
     * @param {string} message - 모달 메시지
     * @returns {Promise<boolean>} 사용자가 '확인'을 누르면 true, '취소'나 닫기를 누르면 false 반환
     */
    async showConfirm(title, message) {
        return this._showModal({ title, message, type: 'confirm' });
    },

    /**
     * @description 텍스트 입력을 받는 형태의 모달을 표시합니다.
     * @param {string} title - 모달 제목
     * @param {string} message - 모달 메시지
     * @param {string} [defaultValue=''] - 입력 필드의 기본값
     * @returns {Promise<string | null>} 사용자가 '확인'을 누르면 입력된 문자열, '취소'나 닫기를 누르면 null 반환
     */
    async showPrompt(title, message, defaultValue = '') {
        return this._showModal({ title, message, defaultValue, type: 'prompt' });
    },

    /**
     * @description 내부 모달 제어 함수. Promise를 사용하여 사용자 응답을 비동기적으로 처리합니다.
     * @param {{ title: string; message: string; defaultValue?: string; type: 'confirm' | 'prompt'; }} options - 모달 옵션
     * @returns {Promise<boolean | string | null>} 사용자 응답 (confirm: boolean, prompt: string | null)
     */
    _showModal(options) {
        return new Promise((resolve) => {
            this.lastFocusedElement = /** @type {HTMLElement} */ (document.activeElement);
            this.activeModalResolver = resolve;

            const { title, message, defaultValue, type } = options;

            /** @type {HTMLElement | null} */
            const titleEl = this.dom.customModalTitle;
            /** @type {HTMLElement | null} */
            const messageEl = this.dom.customModalMessage;
            /** @type {HTMLInputElement | null} */
            const inputEl = this.dom.customModalInput;
            /** @type {HTMLElement | null} */
            const modalEl = this.dom.customModal;
            /** @type {HTMLButtonElement | null} */
            const confirmBtnEl = this.dom.customModalConfirm;

            if (titleEl) titleEl.textContent = title;
            if (messageEl) messageEl.textContent = message;

            if (type === 'prompt' && inputEl) {
                inputEl.value = defaultValue ?? '';
                inputEl.classList.remove('hidden');
            } else if (inputEl) {
                inputEl.classList.add('hidden');
            }

            if (modalEl) {
                modalEl.classList.remove('hidden');
                this._trapFocus(modalEl);
            }

            // 프롬프트면 input에, 아니면 확인 버튼에 포커스
            if (type === 'prompt' && inputEl) {
                inputEl.focus();
            } else if (confirmBtnEl){
                confirmBtnEl.focus();
            }
        });
    },

    /**
     * @description 커스텀 모달의 확인/취소 버튼 클릭 및 Esc 키 입력을 처리합니다.
     * @param {boolean} confirmed - 확인 버튼 클릭 여부
     * @returns {void}
     */
    _handleCustomModal(confirmed) {
        if (!this.activeModalResolver) return;

        /** @type {HTMLInputElement | null} */
        const inputEl = this.dom.customModalInput;
        /** @type {HTMLElement | null} */
        const modalEl = this.dom.customModal;

        const isPrompt = inputEl && !inputEl.classList.contains('hidden');
        const value = isPrompt ? (confirmed ? inputEl?.value : null) : confirmed;

        this.activeModalResolver(value);

        modalEl?.classList.add('hidden');
        if (this.lastFocusedElement) this.lastFocusedElement.focus();

        this.activeModalResolver = null;
        this.lastFocusedElement = null;
    },

    /**
     * @description 모달 내에서 Tab 키 이동이 밖으로 벗어나지 않도록 포커스를 가둡니다(Trap focus).
     * @param {HTMLElement} element - 포커스를 가둘 대상 요소 (모달 컨텐츠)
     * @returns {void}
     */
    _trapFocus(element) {
        if (!element) return;
        const focusableEls = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableEls.length === 0) return;
        const firstFocusableEl = /** @type {HTMLElement} */ (focusableEls[0]);
        const lastFocusableEl = /** @type {HTMLElement} */ (focusableEls[focusableEls.length - 1]);

        element.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstFocusableEl) {
                    lastFocusableEl.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastFocusableEl) {
                    firstFocusableEl.focus();
                    e.preventDefault();
                }
            }
        });
    },

    /**
     * @description 포트폴리오 목록 드롭다운(<select>) UI를 렌더링합니다.
     * @param {Record<string, import('./types.js').Portfolio>} portfolios - 모든 포트폴리오 데이터 객체
     * @param {string | null} activeId - 현재 활성화된 포트폴리오 ID
     * @returns {void}
     */
    renderPortfolioSelector(portfolios, activeId) {
        /** @type {HTMLSelectElement | null} */
        const selector = this.dom.portfolioSelector;
        if (!selector) return;
        selector.innerHTML = '';
        Object.entries(portfolios).forEach(([id, portfolio]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = portfolio.name;
            option.selected = (id === activeId);
            selector.appendChild(option);
        });
    },

    /**
     * @description 표준 DOM API를 사용하여 주식 테이블의 입력 행(tr)과 출력 행(tr)을 생성합니다.
     * @param {CalculatedStock} stock - 주식 데이터 (계산된 지표 포함)
     * @param {string} currency - 현재 통화
     * @param {string} mainMode - 현재 계산 모드
     * @returns {DocumentFragment} 생성된 두 개의 <tr> 요소를 포함하는 DocumentFragment
     */
    createStockRowFragment(stock, currency, mainMode) {
        const fragment = document.createDocumentFragment();

        // --- 입력 행 (trInputs) 생성 ---
        const trInputs = document.createElement('tr');
        trInputs.className = 'stock-inputs';
        trInputs.dataset.id = stock.id;

        const createInput = (type, field, value, placeholder = '', disabled = false, ariaLabel = '') => {
            const input = document.createElement('input');
            input.type = type;
            input.dataset.field = field;
            input.value = String(value);
            if (placeholder) input.placeholder = placeholder;
            input.disabled = disabled;
            if (ariaLabel) input.setAttribute('aria-label', ariaLabel);
            if (type === 'number') {
                input.min = '0';
                if (field === 'currentPrice' || field === 'fixedBuyAmount') input.step = 'any';
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
            if (typeof content === 'string') td.textContent = content;
            else if (content instanceof Node) td.appendChild(content);
            return td;
        };

        // --- ARIA Labels 사용 (i18n.js에 정의된 키 사용) ---
        appendCellWithContent(trInputs, createInput('text', 'name', stock.name, t('ui.stockName'))); // 이미 플레이스홀더로 레이블 역할
        appendCellWithContent(trInputs, createInput('text', 'ticker', stock.ticker, t('ui.ticker'), false, t('aria.tickerInput', { name: stock.name })));
        appendCellWithContent(trInputs, createInput('text', 'sector', stock.sector || '', t('ui.sector'), false, t('aria.sectorInput', { name: stock.name })));
        appendCellWithContent(trInputs, createInput('number', 'targetRatio', stock.targetRatio.toFixed(2), '0.00', false, t('aria.targetRatioInput', { name: stock.name })));
        appendCellWithContent(trInputs, createInput('number', 'currentPrice', stock.currentPrice.toFixed(2), '0.00', false, t('aria.currentPriceInput', { name: stock.name })));

        if (mainMode === 'add') {
            const fixedBuyCell = trInputs.insertCell();
            fixedBuyCell.style.textAlign = 'center';
            const checkbox = createCheckbox('isFixedBuyEnabled', stock.isFixedBuyEnabled, t('aria.fixedBuyToggle', { name: stock.name })); // name 추가
            const amountInput = createInput('number', 'fixedBuyAmount', stock.fixedBuyAmount.toFixed(0), '0', !stock.isFixedBuyEnabled, t('aria.fixedBuyAmount', { name: stock.name })); // name 추가
            fixedBuyCell.append(checkbox, ' ', amountInput);
        }

        const actionCell = trInputs.insertCell();
        actionCell.style.textAlign = 'center';
        actionCell.append(
            createButton('manage', t('ui.manage'), t('aria.manageTransactions', { name: stock.name }), 'blue'),
            ' ',
            createButton('delete', t('ui.delete'), t('aria.deleteStock', { name: stock.name }), 'delete')
        );

        // --- 출력 행 (trOutputs) 생성 ---
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
        const { quantity, avgBuyPrice, currentAmount, profitLoss, profitLossRate } = metrics;
        const profitClass = profitLoss.isNegative() ? 'text-sell' : 'text-buy';
        const profitSign = profitLoss.isPositive() ? '+' : '';

        const createOutputCell = (label, value, valueClass = '') => {
            const td = document.createElement('td');
            td.className = 'output-cell';
            td.style.textAlign = 'right';
            td.innerHTML = `<span class="label">${escapeHTML(label)}</span><span class="value ${escapeHTML(valueClass)}">${escapeHTML(value)}</span>`;
            return td;
        };

        const outputColspan = mainMode === 'add' ? 7 : 6;

        appendCellWithContent(trOutputs, '');
        trOutputs.cells[0].colSpan = 2;
        appendCellWithContent(trOutputs, createOutputCell(t('ui.quantity'), quantity.toFixed(0)));
        appendCellWithContent(trOutputs, createOutputCell(t('ui.avgBuyPrice'), formatCurrency(avgBuyPrice, currency)));
        appendCellWithContent(trOutputs, createOutputCell(t('ui.currentValue'), formatCurrency(currentAmount, currency)));
        appendCellWithContent(trOutputs, createOutputCell(t('ui.profitLoss'), `${profitSign}${formatCurrency(profitLoss, currency)}`, profitClass));
        appendCellWithContent(trOutputs, createOutputCell(t('ui.profitLossRate'), `${profitSign}${profitLossRate.toFixed(2)}%`, profitClass));

        if(trOutputs.cells.length > 0) {
            const neededColspan = outputColspan - (trOutputs.cells.length - 1);
            trOutputs.cells[0].colSpan = neededColspan > 0 ? neededColspan : 1;
        }


        fragment.append(trInputs, trOutputs);
        return fragment;
    },

    /**
     * @description 특정 주식의 테이블 출력 행(결과 행) 내용을 업데이트합니다.
     * @param {string} id - 업데이트할 주식의 ID
     * @param {CalculatedStock} stock - 새 주식 데이터 (계산된 지표 포함)
     * @param {string} currency - 현재 통화
     * @param {string} mainMode - 현재 계산 모드
     * @returns {void}
     */
    updateStockRowOutputs(id, stock, currency, mainMode) {
        /** @type {HTMLElement | null} */
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

    /**
     * @description 모든 주식의 목표 비율 입력 필드 값을 업데이트합니다.
     * @param {Stock[]} portfolioData - 주식 데이터 배열
     * @returns {void}
     */
    updateAllTargetRatioInputs(portfolioData) {
        /** @type {HTMLElement | null} */
        const portfolioBody = this.dom.portfolioBody;
        portfolioData.forEach(stock => {
            const inputRow = portfolioBody?.querySelector(`.stock-inputs[data-id="${stock.id}"]`);
            if (!inputRow) return;

            /** @type {HTMLInputElement | null} */
            const targetRatioInput = inputRow.querySelector('input[data-field="targetRatio"]');
            if (!targetRatioInput) return;

            targetRatioInput.value = stock.targetRatio.toFixed(2);
        });
    },

    /**
     * @description 특정 주식의 '현재가' 입력 필드 값을 업데이트합니다.
     * @param {string} id - 업데이트할 주식의 ID
     * @param {string} price - 새 현재가
     * @returns {void}
     */
    updateCurrentPriceInput(id, price) {
        /** @type {HTMLElement | null} */
        const portfolioBody = this.dom.portfolioBody;
        const inputRow = portfolioBody?.querySelector(`.stock-inputs[data-id="${id}"]`);
        if (!inputRow) {
            console.warn(`[View] Input row not found for stock ID: ${id}`);
            return;
        }

        /** @type {HTMLInputElement | null} */
        const currentPriceInput = inputRow.querySelector('input[data-field="currentPrice"]');
        if (!currentPriceInput) {
            console.warn(`[View] Current price input not found for stock ID: ${id}`);
            return;
        }

        currentPriceInput.value = price;
    },

    /**
     * @description 전체 포트폴리오 테이블을 다시 렌더링합니다.
     * @param {CalculatedStock[]} calculatedPortfolioData - 계산된 주식 데이터 배열
     * @param {string} currency - 현재 통화
     * @param {string} mainMode - 현재 계산 모드
     * @returns {void}
     */
    renderTable(calculatedPortfolioData, currency, mainMode) {
        this.updateTableHeader(currency, mainMode);
        /** @type {HTMLElement | null} */
        const portfolioBody = this.dom.portfolioBody;
        if (!portfolioBody) return;
        portfolioBody.innerHTML = '';

        const fragment = document.createDocumentFragment();
        calculatedPortfolioData.forEach(stock => {
            fragment.appendChild(this.createStockRowFragment(stock, currency, mainMode));
        });
        portfolioBody.appendChild(fragment);
    },

    /**
     * @description 포트폴리오 테이블 헤더(thead) 내용을 현재 설정에 맞게 업데이트합니다.
     * @param {string} currency - 현재 통화
     * @param {string} mainMode - 현재 계산 모드
     * @returns {void}
     */
    updateTableHeader(currency, mainMode) {
        const currencySymbol = currency.toLowerCase() === 'usd' ? t('ui.usd') : t('ui.krw');
        const fixedBuyHeader = mainMode === 'add' ? `<th scope="col">${t('ui.fixedBuy')}(${currencySymbol})</th>` : '';
        /** @type {HTMLElement | null} */
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
            </tr>`; // "작업" -> ui.action 키 사용 고려 (없으면 추가 필요)
            // Note: 'ui.action' 키가 i18n.js에 없으면 추가해야 함.
    },

     /**
     * @description 고정 매수 금액 열의 표시 여부를 토글합니다. (UI 로직만 담당)
     * @param {boolean} show - 열을 표시할지 여부
     */
    toggleFixedBuyColumn(show) {
        const currency = document.querySelector('input[name="currencyMode"]:checked')?.value || 'krw';
        this.updateTableHeader(currency, show ? 'add' : 'sell'); // 헤더 재생성 (가장 간단한 방법)

        /** @type {HTMLElement | null} */
        const portfolioBody = this.dom.portfolioBody;
        portfolioBody?.querySelectorAll('.stock-inputs').forEach(row => {
            // 고정 매수 관련 셀 (체크박스+입력)이 있는지 확인하고 토글
            const fixedBuyCell = row.querySelector('td:nth-child(6)'); // 6번째 셀 (0-based 5) 가정
            if (fixedBuyCell && fixedBuyCell.querySelector('input[data-field="isFixedBuyEnabled"]')) {
                 fixedBuyCell.style.display = show ? '' : 'none';
            }
        });

        // 출력 행 colspan 업데이트 (createStockRowFragment 로직과 일치시킴)
        portfolioBody?.querySelectorAll('.stock-outputs').forEach(row => {
             const firstCell = row.cells[0];
             if (firstCell) {
                 const currentOutputCols = row.cells.length;
                 const expectedInputCols = show ? 7 : 6;
                 const neededColspan = expectedInputCols - (currentOutputCols - 1);
                 firstCell.colSpan = neededColspan > 0 ? neededColspan : 1;
             }
         });
    },

    /**
     * @description 테이블 하단의 목표 비율 합계 표시 UI를 업데이트합니다.
     * @param {number} totalRatio - 목표 비율 합계 (0~100+)
     * @returns {void}
     */
    updateRatioSum(totalRatio) {
        /** @type {HTMLElement | null} */
        const ratioSumEl = this.dom.ratioSum;
        /** @type {HTMLElement | null} */
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

    /**
     * @description 계산 모드 변경에 따라 UI(추가 투자금 카드 표시 여부 등)를 업데이트합니다.
     * @param {string} mainMode - 선택된 모드 ('add' 또는 'sell')
     * @returns {void}
     */
    updateMainModeUI(mainMode) {
        /** @type {HTMLElement | null} */
        const addCard = this.dom.addInvestmentCard;
        /** @type {NodeListOf<HTMLInputElement>} */
        const modeRadios = this.dom.mainModeSelector;

        addCard?.classList.toggle('hidden', mainMode !== 'add');
        modeRadios?.forEach(radio => {
            radio.checked = radio.value === mainMode;
        });
        this.hideResults();
    },

    /**
     * @description 통화 기준 변경에 따라 UI(환율 입력 필드 표시 여부 등)를 업데이트합니다.
     * @param {string} currencyMode - 선택된 통화 ('krw' 또는 'usd')
     * @returns {void}
     */
    updateCurrencyModeUI(currencyMode) {
        const isUsdMode = currencyMode === 'usd';
        /** @type {HTMLElement | null} */
        const rateGroup = this.dom.exchangeRateGroup;
        /** @type {HTMLElement | null} */
        const usdGroup = this.dom.usdInputGroup;
        /** @type {NodeListOf<HTMLInputElement>} */
        const currencyRadios = this.dom.currencyModeSelector;
        /** @type {HTMLInputElement | null} */
        const usdInput = this.dom.additionalAmountUSDInput;


        rateGroup?.classList.toggle('hidden', !isUsdMode);
        usdGroup?.classList.toggle('hidden', !isUsdMode);
        currencyRadios?.forEach(radio => {
            radio.checked = radio.value === currencyMode;
        });
        if (!isUsdMode && usdInput) usdInput.value = '';
    },

    /**
     * @description 거래 내역 관리 모달을 엽니다.
     * @param {Stock} stock - 거래 내역을 관리할 주식 객체
     * @param {string} currency - 현재 통화
     * @param {import('./types.js').Transaction[]} transactions - 거래 내역 배열 (Controller에서 전달)
     * @returns {void}
     */
    openTransactionModal(stock, currency, transactions) { // transactions 파라미터 추가
        this.lastFocusedElement = /** @type {HTMLElement} */ (document.activeElement);
        /** @type {HTMLElement | null} */
        const modal = this.dom.transactionModal;
        /** @type {HTMLElement | null} */
        const modalTitle = this.dom.modalStockName;
        /** @type {HTMLInputElement | null} */
        const dateInput = this.dom.txDate;

        if (!modal) return;

        modal.dataset.stockId = stock.id;
        if(modalTitle) modalTitle.textContent = `${escapeHTML(stock.name)} (${escapeHTML(stock.ticker)}) ${t('modal.transactionTitle')}`; // i18n 사용
        this.renderTransactionList(transactions || [], currency); // 전달받은 transactions 사용
        if(dateInput) dateInput.valueAsDate = new Date();
        modal.classList.remove('hidden');
        this._trapFocus(modal);
        /** @type {HTMLButtonElement | null} */
        const closeBtn = this.dom.closeModalBtn;
        closeBtn?.focus();

        // Note: 'modal.transactionTitle' 키가 i18n.js에 없으면 추가 필요 ("거래 내역 관리")
    },

    /**
     * @description 거래 내역 관리 모달을 닫습니다.
     * @returns {void}
     */
    closeTransactionModal() {
        /** @type {HTMLElement | null} */
        const modal = this.dom.transactionModal;
        /** @type {HTMLFormElement | null} */
        const form = this.dom.newTransactionForm;
        if (!modal) return;

        modal.classList.add('hidden');
        if(form) form.reset();
        modal.removeAttribute('data-stock-id');
        if (this.lastFocusedElement) this.lastFocusedElement.focus();
    },

    /**
     * @description 거래 내역 목록(tbody)을 표준 DOM API를 사용하여 렌더링합니다.
     * @param {import('./types.js').Transaction[]} transactions - 거래 내역 배열
     * @param {string} currency - 현재 통화
     * @returns {void}
     */
    renderTransactionList(transactions, currency) {
        /** @type {HTMLTableSectionElement | null} */
        const listBody = this.dom.transactionListBody;
        if (!listBody) return;
        listBody.innerHTML = '';

        /** @type {HTMLTableElement | null} */
        const table = listBody.closest('table');

        if (transactions.length === 0) {
            if (table) {
                const tr = table.insertRow();
                const td = tr.insertCell();
                td.colSpan = 6;
                td.style.textAlign = 'center';
                td.textContent = t('view.noTransactions');
            }
            return;
        }

        const sorted = [...transactions].sort((a, b) => {
             const dateCompare = b.date.localeCompare(a.date);
             if (dateCompare !== 0) return dateCompare;
             return b.id.localeCompare(a.id);
        });


        sorted.forEach(tx => {
            if (table) {
                const tr = table.insertRow();
                tr.dataset.txId = tx.id;
                const quantityDec = tx.quantity instanceof Decimal ? tx.quantity : new Decimal(tx.quantity || 0);
                const priceDec = tx.price instanceof Decimal ? tx.price : new Decimal(tx.price || 0);
                const total = quantityDec.times(priceDec);

                tr.insertCell().textContent = escapeHTML(tx.date);
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
    },

    /**
     * @description 계산 결과 영역에 스켈레톤 UI를 표시합니다.
     * @returns {void}
     */
    displaySkeleton() {
        const skeletonHTML = `...`; // Skeleton HTML (이전과 동일)
        /** @type {HTMLElement | null} */
        const resultsEl = this.dom.resultsSection;
        if (!resultsEl) return;
        resultsEl.innerHTML = skeletonHTML;
        resultsEl.classList.remove('hidden');
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    /**
     * @description 현재 IntersectionObserver 인스턴스를 정리합니다.
     * @returns {void}
     */
    cleanupObserver() {
        if (this.currentObserver) {
            this.currentObserver.disconnect();
            this.currentObserver = null;
        }
    },

    /**
     * @description 현재 Chart.js 인스턴스를 파괴합니다.
     * @returns {void}
     */
    destroyChart() {
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
    },

    /**
     * @description View에서 사용하는 자원(Observer, Chart)을 정리합니다.
     * @returns {void}
     */
    cleanup() {
        this.cleanupObserver();
        this.destroyChart();
    },

    /**
     * @description 계산 결과 영역(테이블, 섹터, 차트)을 숨깁니다.
     * @returns {void}
     */
    hideResults() {
        /** @type {HTMLElement | null} */
        const resultsEl = this.dom.resultsSection;
        /** @type {HTMLElement | null} */
        const sectorEl = this.dom.sectorAnalysisSection;
        /** @type {HTMLElement | null} */
        const chartEl = this.dom.chartSection;

        if (resultsEl) {
            resultsEl.innerHTML = '';
            resultsEl.classList.add('hidden');
        }
        if (sectorEl) {
            sectorEl.innerHTML = '';
            sectorEl.classList.add('hidden');
        }
        if (chartEl) {
            chartEl.classList.add('hidden');
        }
        this.cleanupObserver();
    },

    /**
     * @description 계산 결과 HTML을 화면에 표시하고 스크롤 애니메이션을 적용합니다.
     * @param {string} html - 표시할 HTML 문자열 (결과 테이블 등)
     * @returns {void}
     */
    displayResults(html) {
        requestAnimationFrame(() => {
            /** @type {HTMLElement | null} */
            const resultsEl = this.dom.resultsSection;
            if (!resultsEl) return;

            resultsEl.innerHTML = html;
            resultsEl.classList.remove('hidden');
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

             // --- ⬇️ [A11Y] 계산 완료 공지 ⬇️ ---
             this.announce(t('aria.resultsLoaded'));
             // --- ⬆️ [A11Y] ⬆️ ---


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

    /**
     * @description 섹터 분석 결과 HTML을 화면에 표시합니다.
     * @param {string} html - 표시할 HTML 문자열
     * @returns {void}
     */
    displaySectorAnalysis(html) {
         requestAnimationFrame(() => {
            /** @type {HTMLElement | null} */
            const sectorEl = this.dom.sectorAnalysisSection;
            if (!sectorEl) return;
            sectorEl.innerHTML = html;
            sectorEl.classList.remove('hidden');
        });
    },

    /**
     * @description Chart.js를 사용하여 도넛 차트를 그리거나 업데이트합니다.
     * @param {any} Chart - Chart.js 라이브러리 객체
     * @param {string[]} labels - 차트 라벨 배열
     * @param {number[]} data - 차트 데이터 배열
     * @param {string} title - 차트 제목
     * @returns {void}
     */
    displayChart(Chart, labels, data, title) {
        /** @type {HTMLElement | null} */
        const chartEl = this.dom.chartSection;
        /** @type {HTMLCanvasElement | null} */
        const canvas = this.dom.portfolioChart;
        if (!chartEl || !canvas) return;

        chartEl.classList.remove('hidden');

        const chartOptions = { /* ... 이전과 동일 ... */ };
        const chartData = { /* ... 이전과 동일 ... */ };

        if (this.chartInstance) {
             this.chartInstance.data = chartData;
             this.chartInstance.options = chartOptions;
            this.chartInstance.update();
        } else {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                this.chartInstance = new Chart(ctx, { /* ... 이전과 동일 ... */ });
            }
        }
    },

    /**
     * @description 입력 필드의 유효성 검사 결과에 따라 스타일과 ARIA 속성을 토글합니다.
     * @param {HTMLElement | HTMLInputElement | null} inputElement - 대상 input 요소
     * @param {boolean} isValid - 유효성 여부
     * @param {string} [errorMessage=''] - (선택) 오류 메시지
     * @returns {void}
     */
    toggleInputValidation(inputElement, isValid, errorMessage = '') {
        if (!inputElement) return;
        inputElement.classList.toggle('input-invalid', !isValid);
        // --- ⬇️ [A11Y] aria-invalid 속성 추가 ⬇️ ---
        inputElement.setAttribute('aria-invalid', String(!isValid));
        // TODO: Optionally display errorMessage, maybe using aria-describedby
        // --- ⬆️ [A11Y] ⬆️ ---
    },


    /**
     * @description 화면 상단에 짧은 알림 메시지(토스트)를 표시합니다.
     * @param {string} message - 표시할 메시지
     * @param {'info' | 'success' | 'error'} [type='info'] - 메시지 타입 (색상 결정)
     * @returns {void}
     */
    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.setAttribute('role', 'alert');
        // --- ⬇️ [A11Y] assertive 사용 (토스트는 즉시 알려야 함) ⬇️ ---
        toast.setAttribute('aria-live', 'assertive');
        // --- ⬆️ [A11Y] ⬆️ ---
        toast.className = `toast toast--${type}`;
        toast.innerHTML = message.replace(/\n/g, '<br>');
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    },

    /**
     * @description 새로 추가된 주식의 이름 입력 필드로 포커스를 이동하고 선택합니다.
     * @param {string} stockId - 포커스할 주식 ID
     * @returns {void}
     */
    focusOnNewStock(stockId) {
        /** @type {HTMLElement | null} */
        const portfolioBody = this.dom.portfolioBody;
        const inputRow = portfolioBody?.querySelector(`.stock-inputs[data-id="${stockId}"]`);
        if (!inputRow) return;

        /** @type {HTMLInputElement | null} */
        const nameInput = inputRow.querySelector('input[data-field="name"]');
        if (nameInput instanceof HTMLInputElement) {
            nameInput.focus();
            nameInput.select();
        }
    },

    /**
     * @description '현재가 일괄 업데이트' 버튼의 로딩 상태를 토글합니다.
     * @param {boolean} loading - 로딩 중 여부
     * @returns {void}
     */
    toggleFetchButton(loading) {
        /** @type {HTMLButtonElement | null} */
        const btn = this.dom.fetchAllPricesBtn;
        if (!(btn instanceof HTMLButtonElement)) return;

        btn.disabled = loading;
        btn.textContent = loading ? t('ui.fetchingPrices') : t('ui.updateAllPrices');

        if (loading) {
            btn.setAttribute('aria-busy', 'true');
            // --- ⬇️ [A11Y] 로딩 중 공지 ⬇️ ---
            this.announce(t('ui.fetchingPrices'), 'assertive');
            // --- ⬆️ [A11Y] ⬆️ ---
        } else {
            btn.removeAttribute('aria-busy');
            // 로딩 완료 공지는 handleFetchAllPrices 완료 시 토스트로 처리됨
        }
    }
};