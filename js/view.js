// js/view.js
// @ts-check
import { CONFIG } from './constants.js';
import { formatCurrency, escapeHTML } from './utils.js';
import { t } from './i18n.js';
import Decimal from 'decimal.js'; // Decimal 임포트 유지

/** @typedef {import('./types.js').Stock} Stock */
/** @typedef {import('./types.js').CalculatedStock} CalculatedStock */

export const PortfolioView = {
    /** @type {Record<string, HTMLElement | NodeListOf<HTMLElement> | null>} */
    dom: {}, // dom 객체를 빈 객체 또는 Record로 초기화
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
            portfolioBody: D.getElementById('portfolioBody'),
            resultsSection: D.getElementById('resultsSection'),
            sectorAnalysisSection: D.getElementById('sectorAnalysisSection'),
            chartSection: D.getElementById('chartSection'),
            portfolioChart: D.getElementById('portfolioChart'), // 캔버스 ID 유지
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

        // --- TypeScript 문법 제거 및 JSDoc 사용 ---
        /** @type {HTMLButtonElement | null} */
        const cancelBtn = this.dom.customModalCancel;
        /** @type {HTMLButtonElement | null} */
        const confirmBtn = this.dom.customModalConfirm;
        /** @type {HTMLElement | null} */
        const customModalEl = this.dom.customModal;
        /** @type {HTMLInputElement | null} */
        const customModalInputEl = this.dom.customModalInput;
        /** @type {HTMLElement | null} */
        const customModalTitleEl = this.dom.customModalTitle;
        /** @type {HTMLElement | null} */
        const customModalMessageEl = this.dom.customModalMessage;
        // --- TypeScript 문법 제거 완료 ---

        // 이벤트 리스너 추가 (null 체크 포함)
        cancelBtn?.addEventListener('click', () => this._handleCustomModal(false));
        confirmBtn?.addEventListener('click', () => this._handleCustomModal(true));
        customModalEl?.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this._handleCustomModal(false);
        });
    },

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

            // --- TypeScript 문법 제거 및 JSDoc 사용 ---
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
             // --- TypeScript 문법 제거 완료 ---

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
                this._trapFocus(modalEl); // Non-null assertion removed
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
        // null 체크 추가
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
            option.textContent = portfolio.name; // Portfolio 객체에서 name 사용
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
                 input.style.textAlign = 'center'; // Center text inputs like name, ticker, sector
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

        appendCellWithContent(trInputs, createInput('text', 'name', stock.name, '종목명'));
        appendCellWithContent(trInputs, createInput('text', 'ticker', stock.ticker, '티커', false, t('aria.tickerInput', { name: stock.name })));
        appendCellWithContent(trInputs, createInput('text', 'sector', stock.sector || '', '섹터', false, t('aria.sectorInput', { name: stock.name }))); // 섹터 추가
        appendCellWithContent(trInputs, createInput('number', 'targetRatio', stock.targetRatio.toFixed(2), '0.00', false, t('aria.targetRatioInput', { name: stock.name })));
        appendCellWithContent(trInputs, createInput('number', 'currentPrice', stock.currentPrice.toFixed(2), '0.00', false, t('aria.currentPriceInput', { name: stock.name })));

        if (mainMode === 'add') {
            const fixedBuyCell = trInputs.insertCell();
            fixedBuyCell.style.textAlign = 'center';
            const checkbox = createCheckbox('isFixedBuyEnabled', stock.isFixedBuyEnabled, t('aria.fixedBuyToggle'));
            const amountInput = createInput('number', 'fixedBuyAmount', stock.fixedBuyAmount.toFixed(0), '0', !stock.isFixedBuyEnabled, t('aria.fixedBuyAmount'));
            fixedBuyCell.append(checkbox, ' ', amountInput);
        }

        const actionCell = trInputs.insertCell();
        actionCell.style.textAlign = 'center';
        actionCell.append(
            createButton('manage', '거래', t('aria.manageTransactions', { name: stock.name }), 'blue'),
            ' ',
            createButton('delete', '삭제', t('aria.deleteStock', { name: stock.name }), 'delete')
        );

        // --- 출력 행 (trOutputs) 생성 ---
        const trOutputs = document.createElement('tr');
        trOutputs.className = 'stock-outputs';
        trOutputs.dataset.id = stock.id;

        // stock.calculated가 없을 경우 기본값 사용
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

        const outputColspan = mainMode === 'add' ? 7 : 6; // 입력 행 컬럼 수에 맞춤

        appendCellWithContent(trOutputs, ''); // 첫 번째 빈 셀 (이름 열 아래)
        trOutputs.cells[0].colSpan = 2; // 이름+티커 열 병합
        appendCellWithContent(trOutputs, createOutputCell('수량', quantity.toFixed(0)));
        appendCellWithContent(trOutputs, createOutputCell('평단가', formatCurrency(avgBuyPrice, currency)));
        appendCellWithContent(trOutputs, createOutputCell('현재 평가액', formatCurrency(currentAmount, currency)));
        appendCellWithContent(trOutputs, createOutputCell('평가 손익', `${profitSign}${formatCurrency(profitLoss, currency)}`, profitClass));
        appendCellWithContent(trOutputs, createOutputCell('수익률', `${profitSign}${profitLossRate.toFixed(2)}%`, profitClass));

        // colspan 조정
        if(trOutputs.cells.length > 0) {
            trOutputs.cells[0].colSpan = outputColspan - (trOutputs.cells.length -1) > 0 ? outputColspan - (trOutputs.cells.length -1) : 1;
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
                 oldOutputRow.replaceWith(newOutputRow); // 기존 행을 새 행으로 교체
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
        portfolioBody.innerHTML = ''; // 기존 내용 비우기

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
        const currencySymbol = currency.toLowerCase() === 'usd' ? '$' : '원';
        // 섹터 헤더 추가
        const fixedBuyHeader = mainMode === 'add' ? `<th scope="col">고정 매수(${currencySymbol})</th>` : '';
        /** @type {HTMLElement | null} */
        const tableHead = this.dom.portfolioTableHead;
        if (!tableHead) return;
        tableHead.innerHTML = `
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

     /**
     * @description 고정 매수 금액 열의 표시 여부를 토글합니다.
     * @param {boolean} show - 열을 표시할지 여부
     */
    toggleFixedBuyColumn(show) {
        /** @type {HTMLElement | null} */
        const tableHead = this.dom.portfolioTableHead;
        const portfolioBody = this.dom.portfolioBody;

        // 헤더 업데이트
        const currency = document.querySelector('input[name="currencyMode"]:checked')?.value || 'krw';
        this.updateTableHeader(currency, show ? 'add' : 'sell'); // 헤더 재생성

        // 바디 업데이트 (각 행의 고정 매수 셀 토글)
        portfolioBody?.querySelectorAll('.stock-inputs').forEach(row => {
            // 고정 매수 셀은 항상 6번째 셀 (0-based index 5)이라고 가정
             /** @type {HTMLTableCellElement | undefined} */
            const fixedBuyCell = row.cells[5]; // 고정 매수 컬럼 셀
            if(fixedBuyCell) {
                 fixedBuyCell.style.display = show ? '' : 'none';
            }
             // 작업 셀도 위치 조정 필요할 수 있으나, CSS로 처리하는 것이 나을 수 있음
        });
         portfolioBody?.querySelectorAll('.stock-outputs').forEach(row => {
             // 출력 행의 colspan 조정
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
        } else if (totalRatio > 0) { // 0% 초과 시에만 invalid 표시
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
        this.hideResults(); // 모드 변경 시 이전 결과 숨김
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
     * @returns {void}
     */
    openTransactionModal(stock, currency) {
        this.lastFocusedElement = /** @type {HTMLElement} */ (document.activeElement);
        /** @type {HTMLElement | null} */
        const modal = this.dom.transactionModal;
        /** @type {HTMLElement | null} */
        const modalTitle = this.dom.modalStockName;
        /** @type {HTMLInputElement | null} */
        const dateInput = this.dom.txDate;

        if (!modal) return;

        modal.dataset.stockId = stock.id;
        if(modalTitle) modalTitle.textContent = `${escapeHTML(stock.name)} (${escapeHTML(stock.ticker)}) 거래 내역`;
        this.renderTransactionList(stock.transactions || [], currency); // Ensure transactions array exists
        if(dateInput) dateInput.valueAsDate = new Date();
        modal.classList.remove('hidden');
        this._trapFocus(modal);
        /** @type {HTMLButtonElement | null} */
        const closeBtn = this.dom.closeModalBtn;
        closeBtn?.focus();
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
        listBody.innerHTML = ''; // 기존 내용 지우기

        /** @type {HTMLTableElement | null} */
        const table = listBody.closest('table'); // 테이블 요소 찾기

        if (transactions.length === 0) {
            if (table) { // 테이블이 있을 때만 행 추가
                const tr = table.insertRow();
                const td = tr.insertCell();
                td.colSpan = 6;
                td.style.textAlign = 'center';
                td.textContent = t('view.noTransactions');
            }
            return;
        }

        // 최신 날짜가 위로 오도록 정렬 (내림차순)
        const sorted = [...transactions].sort((a, b) => {
             const dateCompare = b.date.localeCompare(a.date);
             if (dateCompare !== 0) return dateCompare;
             return b.id.localeCompare(a.id); // 날짜 같으면 ID 역순 (최신 추가된 것 위로)
        });


        sorted.forEach(tx => {
            if (table) { // 테이블이 있을 때만 행 추가
                const tr = table.insertRow();
                tr.dataset.txId = tx.id;
                // quantity와 price가 Decimal 객체일 수 있음
                const quantityDec = tx.quantity instanceof Decimal ? tx.quantity : new Decimal(tx.quantity || 0);
                const priceDec = tx.price instanceof Decimal ? tx.price : new Decimal(tx.price || 0);
                const total = quantityDec.times(priceDec);

                tr.insertCell().textContent = escapeHTML(tx.date); // 날짜
                // 종류
                const typeTd = tr.insertCell();
                const typeSpan = document.createElement('span');
                typeSpan.className = tx.type === 'buy' ? 'text-buy' : 'text-sell';
                typeSpan.textContent = tx.type === 'buy' ? '매수' : '매도';
                typeTd.appendChild(typeSpan);
                // 수량
                const qtyTd = tr.insertCell();
                qtyTd.textContent = quantityDec.toNumber().toLocaleString(); // Decimal -> number 변환
                qtyTd.style.textAlign = 'right';
                // 단가
                const priceTd = tr.insertCell();
                priceTd.textContent = formatCurrency(priceDec, currency); // formatCurrency는 Decimal 처리 가능
                priceTd.style.textAlign = 'right';
                // 총액
                const totalTd = tr.insertCell();
                totalTd.textContent = formatCurrency(total, currency);
                totalTd.style.textAlign = 'right';
                // 작업 버튼
                const actionTd = tr.insertCell();
                actionTd.style.textAlign = 'center';
                const btnDelete = document.createElement('button');
                btnDelete.className = 'btn btn--small';
                btnDelete.dataset.variant = 'delete';
                btnDelete.dataset.action = 'delete-tx';
                btnDelete.textContent = '삭제';
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
        this.cleanupObserver(); // 결과 숨길 때 옵저버도 정리
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

            const rows = resultsEl.querySelectorAll('.result-row-highlight');
            if (rows.length === 0) return;

            this.cleanupObserver(); // 새 결과를 표시하기 전에 이전 옵저버 정리

            this.currentObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = /** @type {HTMLElement} */ (entry.target);
                        target.style.transitionDelay = target.dataset.delay || '0s';
                        target.classList.add('in-view');
                        this.currentObserver?.unobserve(target); // 관찰 해제
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
        const canvas = this.dom.portfolioChart; // dom 객체에서 가져오기
        if (!chartEl || !canvas) return;

        chartEl.classList.remove('hidden');

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false, // 크기 조절 용이하게
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: title, font: { size: 16 } }
            }
        };

        const chartData = {
            labels: labels,
            datasets: [{
                label: t('template.ratio'), // i18n
                data: data,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#77DD77', '#FDFD96', '#836FFF', '#FFB347', '#FFD1DC'],
                borderColor: document.body.classList.contains('dark-mode') ? '#2d2d2d' : '#ffffff',
                borderWidth: 2
            }]
        };

        // 기존 차트 인스턴스가 있으면 업데이트, 없으면 새로 생성
        if (this.chartInstance) {
            this.chartInstance.data = chartData;
            // Chart.js options assignment (library handles type internally)
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

    /**
     * @description 입력 필드의 유효성 검사 결과에 따라 스타일(테두리 색상 등)을 토글합니다.
     * @param {HTMLElement | HTMLInputElement | null} inputElement - 대상 input 요소 (null 가능성 처리)
     * @param {boolean} isValid - 유효성 여부
     * @param {string} [errorMessage=''] - (선택) 오류 메시지 (현재는 사용 안 함)
     * @returns {void}
     */
    toggleInputValidation(inputElement, isValid, errorMessage = '') {
        // null 체크 추가
        if (!inputElement) return;
        inputElement.classList.toggle('input-invalid', !isValid);
        // TODO: Optionally display errorMessage somewhere near the input, maybe using aria-describedby
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
        toast.setAttribute('aria-live', 'assertive');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = message.replace(/\n/g, '<br>'); // 개행 문자 처리
        document.body.appendChild(toast);

        // 3초 후 자동으로 사라짐
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
        btn.textContent = loading ? '가져오는 중...' : '현재가 일괄 업데이트';

        if (loading) {
            btn.setAttribute('aria-busy', 'true');
        } else {
            btn.removeAttribute('aria-busy');
        }
    }
}; // End of PortfolioView object