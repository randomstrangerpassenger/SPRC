// src/view.ts
import { CONFIG } from './constants';
import { getRatioSum, escapeHTML } from './utils';
import { t } from './i18n';
// UI에서 불필요한 Decimal import 제거
// import Decimal from 'decimal.js'; // UI 렌더링에서는 사용하지 않음
import type { Stock, CalculatedStock, Transaction, PortfolioSnapshot, DOMElements } from './types';
import type { Chart } from 'chart.js';

// 분리된 모듈들
import { EventEmitter, type EventCallback } from './view/EventEmitter';
import { ModalManager } from './view/ModalManager';
import { VirtualScrollManager } from './view/VirtualScrollManager';
import { ResultsRenderer } from './view/ResultsRenderer';
import { ToastManager } from './view/ToastManager';
import { AccessibilityAnnouncer } from './view/AccessibilityAnnouncer';
import { DOMCache } from './view/DOMCache';

/**
 * @class PortfolioView
 * @description 포트폴리오 UI를 담당하는 View 클래스
 */
export class PortfolioView {
    dom: DOMElements = {} as DOMElements;

    // 분리된 모듈들
    private eventEmitter: EventEmitter;
    private modalManager: ModalManager;
    private virtualScrollManager: VirtualScrollManager;
    private resultsRenderer: ResultsRenderer;
    private toastManager: ToastManager;
    private accessibilityAnnouncer: AccessibilityAnnouncer;
    private domCache: DOMCache;

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
        this.toastManager = new ToastManager();
        this.accessibilityAnnouncer = new AccessibilityAnnouncer();
        this.domCache = new DOMCache();
    }

    /**
     * @description EventEmitter 메서드 위임
     */
    on(event: string, callback: EventCallback): void {
        this.eventEmitter.on(event, callback);
    }

    emit(event: string, data?: unknown): void {
        this.eventEmitter.emit(event, data);
    }

    /**
     * @description DOM 요소 캐싱 (DOMCache 헬퍼 사용)
     */
    cacheDomElements(): void {
        // DOMCache를 사용하여 모든 DOM 요소 캐싱
        this.dom = this.domCache.cacheAll();

        // AccessibilityAnnouncer 엘리먼트 설정
        if (this.dom.ariaAnnouncer) {
            this.accessibilityAnnouncer.setElement(this.dom.ariaAnnouncer as HTMLElement);
        }

        this.eventEmitter.clear();

        // 모듈 재초기화 (DOM 참조 업데이트)
        this.modalManager = new ModalManager(this.dom);
        this.virtualScrollManager = new VirtualScrollManager(this.dom);
        this.resultsRenderer = new ResultsRenderer(this.dom);

        // 모달 이벤트 바인딩
        this.modalManager.bindModalEvents();
    }

    /**
     * @description data-attribute 기반 요소 조회 (동적)
     * @param selector - data-attribute 셀렉터
     * @param context - 검색 컨텍스트
     */
    queryByData(selector: string, context?: Document | Element): HTMLElement | null {
        return this.domCache.queryByData(selector, context);
    }

    /**
     * @description data-attribute 기반 다중 요소 조회 (동적)
     * @param selector - data-attribute 셀렉터
     * @param context - 검색 컨텍스트
     */
    queryAllByData(selector: string, context?: Document | Element): NodeListOf<HTMLElement> {
        return this.domCache.queryAllByData(selector, context);
    }

    /**
     * @description 가장 가까운 부모 요소 중 data-attribute를 가진 요소 찾기
     * @param element - 시작 요소
     * @param dataAttr - data 속성 이름
     */
    closestWithData(element: HTMLElement, dataAttr: string): HTMLElement | null {
        return this.domCache.closest(element, dataAttr);
    }

    // ===== ARIA & Accessibility =====

    /**
     * @description ARIA 알림 발표 (AccessibilityAnnouncer로 위임)
     * @param message - 알림 메시지
     * @param politeness - 우선순위
     */
    announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
        this.accessibilityAnnouncer.announce(message, politeness);
    }

    /**
     * @description Toast 메시지 표시 (ToastManager로 위임)
     * @param message - 메시지
     * @param type - 메시지 타입
     */
    showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
        this.toastManager.show(message, type);
    }

    /**
     * @description 계산 로딩 표시
     */
    showCalculationLoading(): void {
        const existingLoader = document.querySelector('.calculation-loader');
        if (existingLoader) return;

        const loader = document.createElement('div');
        loader.className = 'calculation-loader';
        loader.setAttribute('role', 'status');
        loader.setAttribute('aria-live', 'polite');
        loader.innerHTML = `
            <div class="spinner"></div>
            <span class="sr-only">계산 중...</span>
        `;
        document.body.appendChild(loader);
    }

    /**
     * @description 계산 로딩 숨김
     */
    hideCalculationLoading(): void {
        const loader = document.querySelector('.calculation-loader');
        if (loader) loader.remove();
    }

    /**
     * @description 입력 필드 유효성 검사 시각적 표시
     * @param inputElement - 입력 요소
     * @param isValid - 유효 여부
     * @param errorMessage - 에러 메시지
     */
    toggleInputValidation(
        inputElement: HTMLInputElement,
        isValid: boolean,
        errorMessage: string = ''
    ): void {
        if (!inputElement) return;
        inputElement.classList.toggle('input-invalid', !isValid);
        inputElement.setAttribute('aria-invalid', String(!isValid));
    }

    // ===== Modal 위임 =====

    async showConfirm(title: string, message: string): Promise<boolean> {
        return this.modalManager.showConfirm(title, message);
    }

    async showPrompt(
        title: string,
        message: string,
        defaultValue: string = ''
    ): Promise<string | null> {
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

    renderTable(
        calculatedPortfolioData: CalculatedStock[],
        currency: 'krw' | 'usd',
        mainMode: 'add' | 'sell' | 'simple'
    ): void {
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

    async displayPerformanceHistory(
        ChartClass: typeof Chart,
        snapshots: PortfolioSnapshot[],
        currency: 'krw' | 'usd'
    ): Promise<void> {
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

        // DocumentFragment로 DOM 조작 최소화
        const fragment = document.createDocumentFragment();
        Object.entries(portfolios).forEach(([id, portfolio]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = portfolio.name;
            option.selected = id === activeId;
            fragment.appendChild(option);
        });

        selector.innerHTML = '';
        selector.appendChild(fragment);
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

    /**
     * @description Update exchange rate input fields
     */
    updateExchangeRateInputs(rate: number): void {
        const { exchangeRateInput, portfolioExchangeRateInput } = this.dom;

        if (exchangeRateInput instanceof HTMLInputElement) {
            exchangeRateInput.value = rate.toFixed(2);
        }

        if (portfolioExchangeRateInput instanceof HTMLInputElement) {
            portfolioExchangeRateInput.value = rate.toFixed(2);
        }
    }

    /**
     * @description Update portfolio settings input fields
     */
    updatePortfolioSettingsInputs(settings: {
        exchangeRate: number;
        rebalancingTolerance?: number;
        tradingFeeRate?: number;
        taxRate?: number;
    }): void {
        const {
            exchangeRateInput,
            portfolioExchangeRateInput,
            rebalancingToleranceInput,
            tradingFeeRateInput,
            taxRateInput,
        } = this.dom;

        // Exchange rate
        if (exchangeRateInput instanceof HTMLInputElement) {
            exchangeRateInput.value = settings.exchangeRate.toString();
        }
        if (portfolioExchangeRateInput instanceof HTMLInputElement) {
            portfolioExchangeRateInput.value = settings.exchangeRate.toString();
        }

        // Rebalancing tolerance
        if (
            rebalancingToleranceInput instanceof HTMLInputElement &&
            settings.rebalancingTolerance !== undefined
        ) {
            rebalancingToleranceInput.value = settings.rebalancingTolerance.toString();
        }

        // Trading fee rate
        if (tradingFeeRateInput instanceof HTMLInputElement && settings.tradingFeeRate !== undefined) {
            tradingFeeRateInput.value = settings.tradingFeeRate.toString();
        }

        // Tax rate
        if (taxRateInput instanceof HTMLInputElement && settings.taxRate !== undefined) {
            taxRateInput.value = settings.taxRate.toString();
        }
    }
}