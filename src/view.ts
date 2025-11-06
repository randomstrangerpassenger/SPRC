// src/view.ts (리팩토링: 모듈화)
import { CONFIG } from './constants';
import { getRatioSum } from './utils';
import { t } from './i18n';
import Decimal from 'decimal.js';
import type { Stock, CalculatedStock, Transaction, PortfolioSnapshot } from './types';
import type { Chart } from 'chart.js';

// 분리된 모듈들
import { EventEmitter, type EventCallback } from './view/EventEmitter';
import { ModalManager } from './view/ModalManager';
import { VirtualScrollManager } from './view/VirtualScrollManager';
import { ResultsRenderer } from './view/ResultsRenderer';

// DOM 요소 타입 정의
interface DOMElements {
    ariaAnnouncer: HTMLElement | null;
    resultsSection: HTMLElement | null;
    sectorAnalysisSection: HTMLElement | null;
    chartSection: HTMLElement | null;
    portfolioChart: HTMLElement | null;
    additionalAmountInput: HTMLElement | null;
    additionalAmountUSDInput: HTMLElement | null;
    exchangeRateInput: HTMLElement | null;
    portfolioExchangeRateInput: HTMLElement | null;
    mainModeSelector: NodeListOf<HTMLElement> | null;
    currencyModeSelector: NodeListOf<HTMLElement> | null;
    exchangeRateGroup: HTMLElement | null;
    usdInputGroup: HTMLElement | null;
    addInvestmentCard: HTMLElement | null;
    calculateBtn: HTMLElement | null;
    darkModeToggle: HTMLElement | null;
    addNewStockBtn: HTMLElement | null;
    fetchAllPricesBtn: HTMLElement | null;
    resetDataBtn: HTMLElement | null;
    normalizeRatiosBtn: HTMLElement | null;
    dataManagementBtn: HTMLElement | null;
    dataDropdownContent: HTMLElement | null;
    exportDataBtn: HTMLElement | null;
    importDataBtn: HTMLElement | null;
    importFileInput: HTMLElement | null;
    transactionModal: HTMLElement | null;
    modalStockName: HTMLElement | null;
    closeModalBtn: HTMLElement | null;
    transactionListBody: HTMLElement | null;
    newTransactionForm: HTMLElement | null;
    txDate: HTMLElement | null;
    txQuantity: HTMLElement | null;
    txPrice: HTMLElement | null;
    portfolioSelector: HTMLElement | null;
    newPortfolioBtn: HTMLElement | null;
    renamePortfolioBtn: HTMLElement | null;
    deletePortfolioBtn: HTMLElement | null;
    virtualTableHeader: HTMLElement | null;
    virtualScrollWrapper: HTMLElement | null;
    virtualScrollSpacer: HTMLElement | null;
    virtualScrollContent: HTMLElement | null;
    ratioValidator: HTMLElement | null;
    ratioSum: HTMLElement | null;
    customModal: HTMLElement | null;
    customModalTitle: HTMLElement | null;
    customModalMessage: HTMLElement | null;
    customModalInput: HTMLElement | null;
    customModalConfirm: HTMLElement | null;
    customModalCancel: HTMLElement | null;
}

/**
 * @class PortfolioView
 * @description 포트폴리오 UI를 담당하는 View 클래스 (리팩토링: 모듈화)
 */
export class PortfolioView {
    dom: DOMElements = {} as DOMElements;

    // 분리된 모듈들
    private eventEmitter: EventEmitter;
    private modalManager: ModalManager;
    private virtualScrollManager: VirtualScrollManager;
    private resultsRenderer: ResultsRenderer;

    /**
     * @constructor
     * @description View 초기화
     */
    constructor() {
        // 모듈 인스턴스 생성 (DOM 캐싱 후 초기화됨)
        this.eventEmitter = new EventEmitter();
        this.modalManager = new ModalManager(this.dom);
        this.virtualScrollManager = new VirtualScrollManager(this.dom);
        this.resultsRenderer = new ResultsRenderer(this.dom);
    }

    /**
     * @description EventEmitter 메서드 위임
     */
    on(event: string, callback: EventCallback): void {
        this.eventEmitter.on(event, callback);
    }

    emit(event: string, data?: any): void {
        this.eventEmitter.emit(event, data);
    }

    /**
     * @description DOM 요소 캐싱
     */
    cacheDomElements(): void {
        const D = document;
        this.dom = {
            ariaAnnouncer: D.getElementById('aria-announcer'),
            resultsSection: D.getElementById('resultsSection'),
            sectorAnalysisSection: D.getElementById('sectorAnalysisSection'),
            chartSection: D.getElementById('chartSection'),
            portfolioChart: D.getElementById('portfolioChart'),
            additionalAmountInput: D.getElementById('additionalAmount'),
            additionalAmountUSDInput: D.getElementById('additionalAmountUSD'),
            exchangeRateInput: D.getElementById('exchangeRate'),
            portfolioExchangeRateInput: D.getElementById('portfolioExchangeRate'),
            rebalancingToleranceInput: D.getElementById('rebalancingTolerance'),
            tradingFeeRateInput: D.getElementById('tradingFeeRate'),
            taxRateInput: D.getElementById('taxRate'),
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
            exportTransactionsCSVBtn: D.getElementById('exportTransactionsCSVBtn'),
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
            performanceHistorySection: D.getElementById('performanceHistorySection'),
            showPerformanceHistoryBtn: D.getElementById('showPerformanceHistoryBtn'),
            performanceChartContainer: D.getElementById('performanceChartContainer'),
            performanceChart: D.getElementById('performanceChart'),
        };

        this.eventEmitter.clear();

        // 모듈 재초기화 (DOM 참조 업데이트)
        this.modalManager = new ModalManager(this.dom);
        this.virtualScrollManager = new VirtualScrollManager(this.dom);
        this.resultsRenderer = new ResultsRenderer(this.dom);

        // 모달 이벤트 바인딩
        this.modalManager.bindModalEvents();
    }

    // ===== ARIA & Accessibility =====

    /**
     * @description ARIA 알림 발표
     * @param message - 알림 메시지
     * @param politeness - 우선순위
     */
    announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
        const announcer = this.dom.ariaAnnouncer;
        if (announcer) {
            announcer.textContent = '';
            announcer.setAttribute('aria-live', politeness);
            setTimeout(() => {
                announcer.textContent = message;
            }, 100);
        }
    }

    /**
     * @description Toast 메시지 표시
     * @param message - 메시지
     * @param type - 메시지 타입
     */
    showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
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

    /**
     * @description 입력 필드 유효성 검사 시각적 표시
     * @param inputElement - 입력 요소
     * @param isValid - 유효 여부
     * @param errorMessage - 에러 메시지
     */
    toggleInputValidation(inputElement: HTMLInputElement, isValid: boolean, errorMessage: string = ''): void {
        if (!inputElement) return;
        inputElement.classList.toggle('input-invalid', !isValid);
        inputElement.setAttribute('aria-invalid', String(!isValid));
    }

    // ===== Modal 위임 =====

    async showConfirm(title: string, message: string): Promise<boolean> {
        return this.modalManager.showConfirm(title, message);
    }

    async showPrompt(title: string, message: string, defaultValue: string = ''): Promise<string | null> {
        return this.modalManager.showPrompt(title, message, defaultValue);
    }

    openTransactionModal(stock: Stock, currency: 'krw' | 'usd', transactions: Transaction[]): void {
        this.modalManager.openTransactionModal(stock, currency, transactions);
    }

    closeTransactionModal(): void {
        this.modalManager.closeTransactionModal();
    }

    renderTransactionList(transactions: Transaction[], currency: 'krw' | 'usd'): void {
        this.modalManager.renderTransactionList(transactions, currency);
    }

    // ===== VirtualScroll 위임 =====

    renderTable(calculatedPortfolioData: CalculatedStock[], currency: 'krw' | 'usd', mainMode: 'add' | 'sell' | 'simple'): void {
        this.virtualScrollManager.renderTable(calculatedPortfolioData, currency, mainMode);
    }

    updateVirtualTableData(calculatedPortfolioData: CalculatedStock[]): void {
        this.virtualScrollManager.updateVirtualTableData(calculatedPortfolioData);
    }

    updateStockInVirtualData(stockId: string, field: string, value: any): void {
        this.virtualScrollManager.updateStockInVirtualData(stockId, field, value);
    }

    updateSingleStockRow(stockId: string, calculatedData: any): void {
        this.virtualScrollManager.updateSingleStockRow(stockId, calculatedData);
    }

    updateAllTargetRatioInputs(portfolioData: CalculatedStock[]): void {
        this.virtualScrollManager.updateAllTargetRatioInputs(portfolioData);
    }

    updateCurrentPriceInput(id: string, price: string): void {
        this.virtualScrollManager.updateCurrentPriceInput(id, price);
    }

    focusOnNewStock(stockId: string): void {
        this.virtualScrollManager.focusOnNewStock(stockId);
    }

    // ===== ResultsRenderer 위임 =====

    displaySkeleton(): void {
        this.resultsRenderer.displaySkeleton();
    }

    displayResults(html: string): void {
        this.resultsRenderer.displayResults(html);
        this.announce(t('aria.resultsLoaded'), 'assertive');
    }

    displaySectorAnalysis(html: string): void {
        this.resultsRenderer.displaySectorAnalysis(html);
    }

    displayChart(ChartClass: typeof Chart, labels: string[], data: number[], title: string): void {
        this.resultsRenderer.displayChart(ChartClass, labels, data, title);
    }

    async displayPerformanceHistory(ChartClass: typeof Chart, snapshots: PortfolioSnapshot[], currency: 'krw' | 'usd'): Promise<void> {
        await this.resultsRenderer.displayPerformanceHistory(ChartClass, snapshots, currency);
    }

    hideResults(): void {
        this.resultsRenderer.hideResults();
    }

    cleanupObserver(): void {
        this.resultsRenderer.cleanupObserver();
    }

    destroyChart(): void {
        this.resultsRenderer.destroyChart();
    }

    cleanup(): void {
        this.resultsRenderer.cleanup();
    }

    // ===== 포트폴리오 UI =====

    /**
     * @description 포트폴리오 선택기 렌더링
     * @param portfolios - 포트폴리오 목록
     * @param activeId - 활성 포트폴리오 ID
     */
    renderPortfolioSelector(portfolios: Record<string, { name: string }>, activeId: string): void {
        const selector = this.dom.portfolioSelector;
        if (!(selector instanceof HTMLSelectElement)) return;

        selector.innerHTML = '';
        Object.entries(portfolios).forEach(([id, portfolio]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = portfolio.name;
            option.selected = id === activeId;
            selector.appendChild(option);
        });
    }

    /**
     * @description 목표 비율 합계 업데이트
     * @param totalRatio - 총 비율
     */
    updateRatioSum(totalRatio: number): void {
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
    }

    /**
     * @description 메인 모드 UI 업데이트
     * @param mainMode - 메인 모드
     */
    updateMainModeUI(mainMode: 'add' | 'sell' | 'simple'): void {
        const addCard = this.dom.addInvestmentCard;
        const modeRadios = this.dom.mainModeSelector;

        addCard?.classList.toggle('hidden', mainMode !== 'add' && mainMode !== 'simple');

        modeRadios?.forEach((radio) => {
            if (radio instanceof HTMLInputElement) radio.checked = radio.value === mainMode;
        });
        this.hideResults();
    }

    /**
     * @description 통화 모드 UI 업데이트
     * @param currencyMode - 통화 모드
     */
    updateCurrencyModeUI(currencyMode: 'krw' | 'usd'): void {
        const isUsdMode = currencyMode === 'usd';
        const rateGroup = this.dom.exchangeRateGroup;
        const usdGroup = this.dom.usdInputGroup;
        const currencyRadios = this.dom.currencyModeSelector;
        const usdInput = this.dom.additionalAmountUSDInput;

        rateGroup?.classList.toggle('hidden', !isUsdMode);
        usdGroup?.classList.toggle('hidden', !isUsdMode);

        currencyRadios?.forEach((radio) => {
            if (radio instanceof HTMLInputElement) radio.checked = radio.value === currencyMode;
        });

        if (!isUsdMode && usdInput instanceof HTMLInputElement) usdInput.value = '';
    }

    /**
     * @description 가격 가져오기 버튼 상태 토글
     * @param loading - 로딩 상태
     */
    toggleFetchButton(loading: boolean): void {
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
}