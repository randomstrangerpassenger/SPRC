// js/view.js (가상 스크롤 적용)
// @ts-check
import { CONFIG } from './constants.js';
import { formatCurrency, escapeHTML } from './utils.js';
import { t } from './i18n.js';
import Decimal from 'decimal.js';

/** @typedef {import('./types.js').Stock} Stock */
/** @typedef {import('./types.js').CalculatedStock} CalculatedStock */

// ▼▼▼▼▼ [추가] 가상 스크롤 상수 ▼▼▼▼▼
const ROW_INPUT_HEIGHT = 60; // .virtual-row-inputs의 height
const ROW_OUTPUT_HEIGHT = 50; // .virtual-row-outputs의 height
const ROW_PAIR_HEIGHT = ROW_INPUT_HEIGHT + ROW_OUTPUT_HEIGHT; // 한 종목(2줄)의 총 높이
const VISIBLE_ROWS_BUFFER = 5; // 화면 밖 위/아래로 미리 렌더링할 행 수
// ▲▲▲▲▲ [추가] ▲▲▲▲▲

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
    /** @type {Object<string, Function[]>} */
    _events: {}, // 1. 이벤트 리스너 저장소 추가

    // ▼▼▼▼▼ [추가] 가상 스크롤 상태 변수 ▼▼▼▼▼
    /** @type {CalculatedStock[]} */
    _virtualData: [],
    /** @type {HTMLElement | null} */
    _scrollWrapper: null,
    /** @type {HTMLElement | null} */
    _scrollSpacer: null,
    /** @type {HTMLElement | null} */
    _scrollContent: null,
    /** @type {number} */
    _viewportHeight: 0,
    /** @type {number} */
    _renderedStartIndex: -1,
    /** @type {number} */
    _renderedEndIndex: -1,
    /** @type {Function | null} */
    _scrollHandler: null,
    /** @type {string} */
    _currentMainMode: 'add',
    /** @type {string} */
    _currentCurrency: 'krw',
    // ▲▲▲▲▲ [추가] ▲▲▲▲▲

    // ▼▼▼▼▼ [수정] Pub/Sub 메서드 ▼▼▼▼▼
    /**
     * @description 추상 이벤트를 구독합니다.
     * @param {string} event - 이벤트 이름 (예: 'calculateClicked')
     * @param {Function} callback - 실행할 콜백 함수
     */
    on(event, callback) {
        if (!this._events[event]) {
            this._events[event] = [];
        }
        this._events[event].push(callback);
    },

    /**
     * @description 추상 이벤트를 발행합니다.
     * @param {string} event - 이벤트 이름
     * @param {any} [data] - 전달할 데이터
     */
    emit(event, data) {
        if (this._events[event]) {
            this._events[event].forEach(callback => callback(data));
        }
    },
    // ▲▲▲▲▲ [수정] ▲▲▲▲▲

    cacheDomElements() {
        const D = document;
        this.dom = {
            ariaAnnouncer: D.getElementById('aria-announcer'),
            // portfolioBody: D.getElementById('portfolioBody'), // 삭제
            resultsSection: D.getElementById('resultsSection'),
            sectorAnalysisSection: D.getElementById('sectorAnalysisSection'),
            chartSection: D.getElementById('chartSection'),
            portfolioChart: D.getElementById('portfolioChart'),
            additionalAmountInput: D.getElementById('additionalAmount'),
            additionalAmountUSDInput: D.getElementById('additionalAmountUSD'),
            exchangeRateInput: D.getElementById('exchangeRate'),
            portfolioExchangeRateInput: D.getElementById('portfolioExchangeRate'),
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
            transactionListBody: D.getElementById('transactionListBody'), 
            newTransactionForm: D.getElementById('newTransactionForm'),
            txDate: D.getElementById('txDate'),
            txQuantity: D.getElementById('txQuantity'),
            txPrice: D.getElementById('txPrice'),
            portfolioSelector: D.getElementById('portfolioSelector'),
            newPortfolioBtn: D.getElementById('newPortfolioBtn'),
            renamePortfolioBtn: D.getElementById('renamePortfolioBtn'),
            deletePortfolioBtn: D.getElementById('deletePortfolioBtn'),
            // portfolioTableHead: D.getElementById('portfolioTableHead'), // 삭제
            virtualTableHeader: D.getElementById('virtual-table-header'),
            virtualScrollWrapper: D.getElementById('virtual-scroll-wrapper'),
            virtualScrollSpacer: D.getElementById('virtual-scroll-spacer'),
            virtualScrollContent: D.getElementById('virtual-scroll-content'),
            ratioValidator: D.getElementById('ratioValidator'),
            ratioSum: D.getElementById('ratioSum'),
            customModal: D.getElementById('customModal'),
            customModalTitle: D.getElementById('customModalTitle'),
            customModalMessage: D.getElementById('customModalMessage'),
            customModalInput: D.getElementById('customModalInput'),
            customModalConfirm: D.getElementById('customModalConfirm'),
            customModalCancel: D.getElementById('customModalCancel'),
        };
        
        this._events = {}; // 캐시 초기화 시 이벤트 리스너도 초기화
        
        // ▼▼▼▼▼ [추가] 가상 스크롤 래퍼 캐시 ▼▼▼▼▼
        this._scrollWrapper = this.dom.virtualScrollWrapper;
        this._scrollSpacer = this.dom.virtualScrollSpacer;
        this._scrollContent = this.dom.virtualScrollContent;
        this._viewportHeight = this._scrollWrapper ? this._scrollWrapper.clientHeight : 600;
        // ▲▲▲▲▲ [추가] ▲▲▲▲▲


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

    // ▼▼▼▼▼ [대대적 수정] createStockRowFragment (div 기반으로 변경) ▼▼▼▼▼
    createStockRowFragment(stock, currency, mainMode) {
        const fragment = document.createDocumentFragment();

        // --- 헬퍼 함수 ---
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

        const createCell = (className = '', align = 'left') => {
            const cell = document.createElement('div');
            cell.className = `virtual-cell ${className} align-${align}`;
            return cell;
        };

        // --- 1. 입력 행 (Inputs Row) ---
        const divInputs = document.createElement('div');
        divInputs.className = 'virtual-row-inputs';
        divInputs.dataset.id = stock.id;
        divInputs.setAttribute('role', 'row');
        // 그리드 템플릿 설정 (CSS 대신 JS에서)
        divInputs.style.gridTemplateColumns = this.getGridTemplate(mainMode);

        const isMobile = window.innerWidth <= 768;

        // 컬럼 구성
        divInputs.appendChild(createCell()).appendChild(createInput('text', 'name', stock.name, t('ui.stockName')));
        divInputs.appendChild(createCell()).appendChild(createInput('text', 'ticker', stock.ticker, t('ui.ticker'), false, t('aria.tickerInput', { name: stock.name })));

        // 간단 계산 모드에서는 섹터, 고정 매수 필드만 숨김 (목표비중은 유지)
        if (mainMode !== 'simple' && !isMobile) {
            // 섹터는 간단 모드가 아닐 때만 표시
            divInputs.appendChild(createCell()).appendChild(createInput('text', 'sector', stock.sector || '', t('ui.sector'), false, t('aria.sectorInput', { name: stock.name })));
        }

        // 목표 비율은 모든 모드에서 표시
        divInputs.appendChild(createCell('align-right')).appendChild(createInput('number', 'targetRatio', stock.targetRatio, '0.00', false, t('aria.targetRatioInput', { name: stock.name })));

        if (!isMobile && mainMode !== 'simple') {
            // 현재가는 간단 모드가 아닐 때만 표시
            divInputs.appendChild(createCell('align-right')).appendChild(createInput('number', 'currentPrice', stock.currentPrice, '0.00', false, t('aria.currentPriceInput', { name: stock.name })));
        }

        if (mainMode === 'simple') {
            // 간단 모드: 보유 금액 입력칸 + 고정 매수 필드 + 삭제 버튼
            const amountCell = createCell('align-right');
            const manualAmountInput = createInput('number', 'manualAmount', stock.manualAmount || 0, '현재 보유 금액 입력', false, `${stock.name} 보유 금액`);
            manualAmountInput.style.width = '100%';
            manualAmountInput.style.textAlign = 'right';
            amountCell.appendChild(manualAmountInput);
            divInputs.appendChild(amountCell);

            // 고정 매수 필드 추가 (간단 모드)
            if (!isMobile) {
                const fixedBuyCell = createCell('align-center');
                const checkbox = createCheckbox('isFixedBuyEnabled', stock.isFixedBuyEnabled, t('aria.fixedBuyToggle', { name: stock.name }));
                const amountInput = createInput('number', 'fixedBuyAmount', stock.fixedBuyAmount, '0', !stock.isFixedBuyEnabled, t('aria.fixedBuyAmount', { name: stock.name }));
                amountInput.style.width = '80px';
                fixedBuyCell.append(checkbox, ' ', amountInput);
                divInputs.appendChild(fixedBuyCell);
            }

            const deleteCell = createCell('align-center');
            deleteCell.appendChild(
                createButton('delete', t('ui.delete'), t('aria.deleteStock', { name: stock.name }), 'delete')
            );
            divInputs.appendChild(deleteCell);
        } else {
            // 추가 매수 모드: 고정 매수 필드 표시
            if (mainMode === 'add' && !isMobile) {
                const fixedBuyCell = createCell('align-center');
                const checkbox = createCheckbox('isFixedBuyEnabled', stock.isFixedBuyEnabled, t('aria.fixedBuyToggle', { name: stock.name }));
                const amountInput = createInput('number', 'fixedBuyAmount', stock.fixedBuyAmount, '0', !stock.isFixedBuyEnabled, t('aria.fixedBuyAmount', { name: stock.name }));
                amountInput.style.width = '80px';
                fixedBuyCell.append(checkbox, ' ', amountInput);
                divInputs.appendChild(fixedBuyCell);
            }

            // 일반 모드: 거래 내역 관리 및 삭제 버튼
            const actionCell = createCell('align-center');
            actionCell.append(
                createButton('manage', t('ui.manage'), t('aria.manageTransactions', { name: stock.name }), 'blue'),
                ' ',
                createButton('delete', t('ui.delete'), t('aria.deleteStock', { name: stock.name }), 'delete')
            );
            divInputs.appendChild(actionCell);
        }

        // --- 2. 출력 행 (Outputs Row) ---
        const divOutputs = document.createElement('div');
        divOutputs.className = 'virtual-row-outputs';
        divOutputs.dataset.id = stock.id;
        divOutputs.setAttribute('role', 'row');
        divOutputs.style.gridTemplateColumns = this.getGridTemplate(mainMode); // 동일한 그리드 사용

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
            const cell = createCell('output-cell align-right');
            cell.innerHTML = `<span class="label">${escapeHTML(label)}</span><span class="value ${escapeHTML(valueClass)}">${escapeHTML(value)}</span>`;
            return cell;
        };

        const firstCell = createCell(); // 첫 번째 빈 셀 (스페이서)
        firstCell.style.gridColumn = 'span 1'; // 첫 번째 컬럼 차지
        divOutputs.appendChild(firstCell);

        // 출력 행 컬럼 구성
        if (mainMode === 'simple') {
            // 간단 모드에서는 출력 행을 완전히 숨김 (보유 금액을 입력칸에서 바로 입력하므로)
            divOutputs.style.display = 'none';
        } else {
            // 일반 모드
            divOutputs.appendChild(createOutputCell(t('ui.quantity'), quantity.toFixed(0)));
            if (!isMobile) { // 모바일 아닐 때
                divOutputs.appendChild(createOutputCell(t('ui.avgBuyPrice'), formatCurrency(avgBuyPrice, currency)));
            }
            divOutputs.appendChild(createOutputCell(t('ui.currentValue'), formatCurrency(currentAmount, currency)));
            if (!isMobile) { // 모바일 아닐 때
                divOutputs.appendChild(createOutputCell(t('ui.profitLoss'), `${profitSign}${formatCurrency(profitLoss, currency)}`, profitClass));
            }
            divOutputs.appendChild(createOutputCell(t('ui.profitLossRate'), `${profitSign}${profitLossRate.toFixed(2)}%`, profitClass));
        }

        // 액션 컬럼 스페이서
        const lastCell = createCell();
        divOutputs.appendChild(lastCell);

        fragment.append(divInputs, divOutputs);
        return fragment;
    },
    // ▲▲▲▲▲ [대대적 수정] ▲▲▲▲▲

    // ▼▼▼▼▼ [수정] updateStockRowOutputs (더 이상 사용 안 함) ▼▼▼▼▼
    updateStockRowOutputs(id, stock, currency, mainMode) {
        // 이 함수는 가상 스크롤에서 전체 재조정 로직(_onScroll)으로 대체됨
        // console.warn("updateStockRowOutputs is deprecated with Virtual Scroll");
    },
    // ▲▲▲▲▲ [수정] ▲▲▲▲▲

    updateAllTargetRatioInputs(portfolioData) {
        // 가상 스크롤에서는 보이는 부분만 업데이트해야 함
        portfolioData.forEach(stock => {
            const inputRow = this._scrollContent?.querySelector(`.virtual-row-inputs[data-id="${stock.id}"]`);
            if (!inputRow) return; // 화면에 안보이면 스킵
            const targetRatioInput = inputRow.querySelector('input[data-field="targetRatio"]');
            if (targetRatioInput instanceof HTMLInputElement) {
                const ratio = stock.targetRatio instanceof Decimal ? stock.targetRatio : new Decimal(stock.targetRatio ?? 0);
                targetRatioInput.value = ratio.toFixed(2);
            }
        });
    },

    updateCurrentPriceInput(id, price) {
        const inputRow = this._scrollContent?.querySelector(`.virtual-row-inputs[data-id="${id}"]`);
        if (!inputRow) return; // 화면에 안보이면 스킵
        const currentPriceInput = inputRow.querySelector('input[data-field="currentPrice"]');
        if (currentPriceInput instanceof HTMLInputElement) {
            currentPriceInput.value = price;
        }
    },
    
    // ▼▼▼▼▼ [추가] 가상 스크롤 헬퍼 ▼▼▼▼▼
    getGridTemplate(mainMode) {
        // 반응형 그리드 템플릿 반환
        const isMobile = window.innerWidth <= 768;

        // 입력 행과 출력 행의 그리드 컬럼 수를 다르게 설정
        if (isMobile) {
            if (mainMode === 'simple') {
                // 모바일 간단 모드: 이름 | 티커 | 목표% | 보유 금액 | 삭제 (5컬럼)
                return '1.5fr 1fr 1fr 1fr 0.8fr';
            }
            // 모바일: 이름 | 티커 | 목표% | 액션 (입력)
            // 모바일: (스페이서) | 수량 | 평가액 | 수익률 | (스페이서) (출력)
            // -> 컬럼 수는 4개로 동일하게 맞추되, 내용만 다르게
            return '1.5fr 1fr 1fr 1.2fr';
        } else {
            // 데스크탑
            if (mainMode === 'add') {
                // 이름 | 티커 | 섹터 | 목표% | 현재가 | 고정 | 액션 (7컬럼)
                // (스페이서) | 수량 | 평단가 | 목표% | 평가액 | 수익률 | (스페이서) (7컬럼)
                return '1.5fr 1fr 1fr 1fr 1fr 1.2fr 1.2fr';
            } else if (mainMode === 'simple') {
                // 간단 모드: 이름 | 티커 | 목표% | 보유 금액 | 고정 매수 | 삭제 (6컬럼)
                return '2fr 1fr 1fr 1.5fr 1.2fr 0.8fr';
            } else {
                // 매도 리밸런싱: 이름 | 티커 | 섹터 | 목표% | 현재가 | 액션 (6컬럼)
                // (스페이서) | 수량 | 평단가 | 목표% | 평가액 | 수익률 | (스페이서) (6컬럼)
                return '2fr 1fr 1fr 1fr 1fr 1.2fr';
            }
        }
    },
    
    // updateTableHeader를 새 div 헤더에 맞게 수정
    updateTableHeader(currency, mainMode) {
        this._currentMainMode = mainMode; // 현재 모드 저장
        this._currentCurrency = currency; // 현재 통화 저장
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
                // 간단 모드: 이름 | 티커 | 목표% | 보유 금액 | 고정 매수 | 삭제
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
    },

    // ▼▼▼▼▼ [대대적 수정] renderTable (가상 스크롤 초기화 로직) ▼▼▼▼▼
    renderTable(calculatedPortfolioData, currency, mainMode) {
        if (!this._scrollWrapper || !this._scrollSpacer || !this._scrollContent) return;

        // 1. 헤더 업데이트 (모드, 통화 저장)
        this.updateTableHeader(currency, mainMode);
        
        // 2. 데이터 저장
        this._virtualData = calculatedPortfolioData;
        if(this.dom.virtualScrollWrapper) {
            this.dom.virtualScrollWrapper.setAttribute('aria-rowcount', String(this._virtualData.length));
        }

        // 3. 전체 높이 설정
        const totalHeight = this._virtualData.length * ROW_PAIR_HEIGHT;
        this._scrollSpacer.style.height = `${totalHeight}px`;
        
        // 4. 뷰포트 높이 갱신
        this._viewportHeight = this._scrollWrapper.clientHeight;

        // 5. 기존 스크롤 이벤트 리스너 제거
        if (this._scrollHandler) {
            this._scrollWrapper.removeEventListener('scroll', this._scrollHandler);
        }

        // 6. 스크롤 이벤트 핸들러 생성 및 바인딩
        // _onScroll 내부에서 this가 view를 가리키도록 .bind(this) 사용
        this._scrollHandler = this._onScroll.bind(this);
        this._scrollWrapper.addEventListener('scroll', this._scrollHandler);

        // 7. 초기 렌더링 실행
        this._onScroll(true); // forceRedraw = true
    },
    
    /**
     * @description [NEW] 컨트롤러가 데이터를 업데이트할 때 호출
     */
    updateVirtualTableData(calculatedPortfolioData) {
        this._virtualData = calculatedPortfolioData; // 데이터 교체
        const totalHeight = this._virtualData.length * ROW_PAIR_HEIGHT;
        if(this._scrollSpacer) this._scrollSpacer.style.height = `${totalHeight}px`;
        if(this.dom.virtualScrollWrapper) {
            this.dom.virtualScrollWrapper.setAttribute('aria-rowcount', String(this._virtualData.length));
        }

        // 현재 스크롤 위치에서 강제로 다시 렌더링
        this._onScroll(true); // forceRedraw = true
    },

    /**
     * @description [NEW] 특정 종목의 속성을 _virtualData에서 업데이트 (재렌더링 없이)
     * @param {string} stockId - 종목 ID
     * @param {string} field - 업데이트할 필드명
     * @param {any} value - 새 값
     */
    updateStockInVirtualData(stockId, field, value) {
        const stockIndex = this._virtualData.findIndex(s => s.id === stockId);
        if (stockIndex !== -1) {
            this._virtualData[stockIndex][field] = value;
        }
    },

    /**
     * @description [NEW] 실제 가상 스크롤 렌더링 로직
     * @param {boolean} [forceRedraw=false] - 강제 렌더링 여부
     */
    _onScroll(forceRedraw = false) {
        if (!this._scrollWrapper || !this._scrollContent) return;

        // 클래스 멤버 변수에서 현재 모드와 통화 읽기
        const currency = this._currentCurrency;
        const mainMode = this._currentMainMode;

        const scrollTop = this._scrollWrapper.scrollTop;

        // 1. 렌더링할 인덱스 계산
        const startIndex = Math.max(0, Math.floor(scrollTop / ROW_PAIR_HEIGHT) - VISIBLE_ROWS_BUFFER);
        const endIndex = Math.min(
            this._virtualData.length, // 배열 최대 길이 넘지 않도록 수정
            Math.ceil((scrollTop + this._viewportHeight) / ROW_PAIR_HEIGHT) + VISIBLE_ROWS_BUFFER
        );

        // 2. 이미 렌더링된 범위면 실행 취소 (강제 재조정 제외)
        if (!forceRedraw && startIndex === this._renderedStartIndex && endIndex === this._renderedEndIndex) {
            return;
        }

        // ▼▼▼▼▼ [추가] 재렌더링 전에 현재 DOM의 입력 값을 _virtualData에 저장 ▼▼▼▼▼
        // 스크롤로 인해 DOM이 사라지기 전에 사용자가 입력 중인 값을 보존
        const currentInputRows = this._scrollContent.querySelectorAll('.virtual-row-inputs[data-id]');
        currentInputRows.forEach(row => {
            const stockId = row.dataset.id;
            if (!stockId) return;

            const stockIndex = this._virtualData.findIndex(s => s.id === stockId);
            if (stockIndex === -1) return;

            // 모든 입력 필드의 현재 값을 읽어서 _virtualData에 반영
            const inputs = row.querySelectorAll('input[data-field]');
            inputs.forEach(input => {
                if (!(input instanceof HTMLInputElement)) return;
                const field = input.dataset.field;
                if (!field) return;

                let value;
                if (input.type === 'checkbox') {
                    value = input.checked;
                } else if (input.type === 'number') {
                    // 숫자 필드는 parseFloat으로 변환
                    value = parseFloat(input.value) || 0;
                } else {
                    value = input.value;
                }

                // _virtualData 업데이트
                this._virtualData[stockIndex][field] = value;
            });
        });
        // ▲▲▲▲▲ [추가] ▲▲▲▲▲

        // 3. 새 범위 저장
        this._renderedStartIndex = startIndex;
        this._renderedEndIndex = endIndex;

        // 4. DOM 조각 생성
        const fragment = document.createDocumentFragment();
        for (let i = startIndex; i < endIndex; i++) {
            const stock = this._virtualData[i];
            fragment.appendChild(this.createStockRowFragment(stock, currency, mainMode));
        }

        // 5. 실제 DOM에 적용 및 Y축 위치 이동
        this._scrollContent.innerHTML = ''; // 기존 행 삭제
        this._scrollContent.appendChild(fragment);
        this._scrollContent.style.transform = `translateY(${startIndex * ROW_PAIR_HEIGHT}px)`;
    },
    // ▲▲▲▲▲ [대대적 수정] ▲▲▲▲▲

    // toggleFixedBuyColumn은 더 이상 사용되지 않음

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

        // Show investment card for both 'add' and 'simple' modes
        addCard?.classList.toggle('hidden', mainMode !== 'add' && mainMode !== 'simple');

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

    renderTransactionList(transactions, currency) {
        const listBody = this.dom.transactionListBody;
        if (!listBody) {
            console.error("View: renderTransactionList - listBody not found!");
            return;
        }
        
        listBody.innerHTML = ''; // 1. 기존 내용 지우기

        if (transactions.length === 0) {
            const tr = listBody.insertRow(); 
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

        sorted.forEach(tx => {
            const tr = listBody.insertRow();
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
        });
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

    displayChart(labels, data, title) {
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
        // ▼▼▼▼▼ [수정] 가상 스크롤에 맞게 수정 ▼▼▼▼▼
        // 1. 데이터에 종목이 추가되었는지 확인
        const stockIndex = this._virtualData.findIndex(s => s.id === stockId);
        if (stockIndex === -1 || !this._scrollWrapper) return;

        // 2. 해당 종목 위치로 스크롤 이동
        const scrollTop = stockIndex * ROW_PAIR_HEIGHT;
        this._scrollWrapper.scrollTo({ top: scrollTop, behavior: 'smooth' });

        // 3. 스크롤 애니메이션 후 포커스
        setTimeout(() => {
            const inputRow = this._scrollContent?.querySelector(`.virtual-row-inputs[data-id="${stockId}"]`);
            if (!inputRow) return;
            const nameInput = inputRow.querySelector('input[data-field="name"]');
            if (nameInput instanceof HTMLInputElement) {
                nameInput.focus();
                nameInput.select();
            }
        }, 300); // 스크롤 시간 고려
        // ▲▲▲▲▲ [수정] ▲▲▲▲▲
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