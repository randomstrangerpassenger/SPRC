// src/view.ts
import { CONFIG } from './constants';
import { getRatioSum, escapeHTML, isInputElement } from './utils';
import { t } from './i18n';
import type {
    Stock,
    CalculatedStock,
    Transaction,
    PortfolioSnapshot,
    DOMElements,
    CalculatedStockMetrics,
} from './types';
import type { PortfolioListViewModel, TransactionListViewModel } from './viewModels';
import Decimal from 'decimal.js';
import type { Chart } from 'chart.js';

// 분리된 모듈들
import { EventEmitter, type EventCallback } from './view/EventEmitter';
import { ModalManager } from './view/ModalManager';
import { VirtualScrollManager } from './view/VirtualScrollManager';
import { ResultsRenderer } from './view/ResultsRenderer';
import { ToastManager } from './view/ToastManager';
import { AccessibilityAnnouncer } from './view/AccessibilityAnnouncer';
import { DOMCache } from './view/DOMCache';
import { AssetAllocationRenderer } from './view/AssetAllocationRenderer';

/**
 * @class PortfolioView
 * @description View class responsible for portfolio UI
 */
export class PortfolioView {
    dom: DOMElements = {} as DOMElements;

    // 분리된 모듈들
    #eventEmitter: EventEmitter;
    #modalManager: ModalManager;
    #virtualScrollManager: VirtualScrollManager;
    #resultsRenderer: ResultsRenderer;
    #toastManager: ToastManager;
    #accessibilityAnnouncer: AccessibilityAnnouncer;
    #domCache: DOMCache;
    #assetAllocationRenderer: AssetAllocationRenderer;

    /**
     * @constructor
     * @description Initialize View
     */
    constructor() {
        // 모듈 인스턴스 생성 (DOM 캐싱 후 초기화됨)
        this.#eventEmitter = new EventEmitter();
        this.#modalManager = new ModalManager(this.dom);
        this.#virtualScrollManager = new VirtualScrollManager(this.dom);
        this.#resultsRenderer = new ResultsRenderer(this.dom);
        this.#toastManager = new ToastManager();
        this.#accessibilityAnnouncer = new AccessibilityAnnouncer();
        this.#domCache = new DOMCache();
        this.#assetAllocationRenderer = new AssetAllocationRenderer(this.dom);
    }

    /**
     * @description Delegate EventEmitter methods
     */
    on(event: string, callback: EventCallback): void {
        this.#eventEmitter.on(event, callback);
    }

    emit(event: string, data?: unknown): void {
        this.#eventEmitter.emit(event, data);
    }

    /**
     * @description Cache DOM elements (using DOMCache helper)
     */
    cacheDomElements(): void {
        // DOMCache를 사용하여 모든 DOM 요소 캐싱
        this.dom = this.#domCache.cacheAll();

        // AccessibilityAnnouncer 엘리먼트 설정
        if (this.dom.ariaAnnouncer) {
            this.#accessibilityAnnouncer.setElement(this.dom.ariaAnnouncer);
        }

        this.#eventEmitter.clear();

        // DOM 참조 업데이트 (재생성하지 않고 상태 유지)
        this.#modalManager.setDom(this.dom);
        this.#virtualScrollManager.setDom(this.dom);
        this.#resultsRenderer.setDom(this.dom);
        this.#assetAllocationRenderer.setDom(this.dom);

        // 모달 이벤트 바인딩
        this.#modalManager.bindModalEvents();
    }

    /**
     * @description Query element by data-attribute (dynamic)
     * @param selector - data-attribute selector
     * @param context - Search context
     */
    queryByData(selector: string, context?: Document | Element): HTMLElement | null {
        return this.#domCache.queryByData(selector, context);
    }

    /**
     * @description Query all elements by data-attribute (dynamic)
     * @param selector - data-attribute selector
     * @param context - Search context
     */
    queryAllByData(selector: string, context?: Document | Element): NodeListOf<HTMLElement> {
        return this.#domCache.queryAllByData(selector, context);
    }

    /**
     * @description Find closest parent element with data-attribute
     * @param element - Starting element
     * @param dataAttr - data attribute name
     */
    closestWithData(element: HTMLElement, dataAttr: string): HTMLElement | null {
        return this.#domCache.closest(element, dataAttr);
    }

    // ===== Module Getters =====

    /**
     * @description Get results renderer instance
     */
    get resultsRenderer(): ResultsRenderer {
        return this.#resultsRenderer;
    }

    /**
     * @description Get asset allocation renderer instance
     */
    get assetAllocationRenderer(): AssetAllocationRenderer {
        return this.#assetAllocationRenderer;
    }

    // ===== DOM Encapsulation =====

    /**
     * @description Trigger file import input click (DOM encapsulation)
     */
    triggerFileImport(): void {
        const fileInput = this.dom.importFileInput;
        if (isInputElement(fileInput)) {
            fileInput.click();
        }
    }

    /**
     * @description Get portfolio selector value (DOM encapsulation)
     * @returns Selected portfolio ID or null
     */
    getPortfolioSelectorValue(): string | null {
        const selector = this.dom.portfolioSelector;
        if (selector instanceof HTMLSelectElement) {
            return selector.value;
        }
        return null;
    }

    // ===== ARIA & Accessibility =====

    /**
     * @description Announce ARIA message (delegated to AccessibilityAnnouncer)
     * @param message - Announcement message
     * @param politeness - Politeness level
     */
    announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
        this.#accessibilityAnnouncer.announce(message, politeness);
    }

    /**
     * @description Show toast message (delegated to ToastManager)
     * @param message - Message content
     * @param type - Message type
     */
    showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
        this.#toastManager.show(message, type);
    }

    /**
     * @description Show calculation loading indicator
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
     * @description Hide calculation loading indicator
     */
    hideCalculationLoading(): void {
        const loader = document.querySelector('.calculation-loader');
        if (loader) loader.remove();
    }

    /**
     * @description Toggle input field validation visual feedback
     * @param inputElement - Input element
     * @param isValid - Validity status
     * @param errorMessage - Error message
     */
    toggleInputValidation(
        inputElement: HTMLInputElement,
        isValid: boolean,
        _errorMessage: string = ''
    ): void {
        if (!inputElement) return;
        inputElement.classList.toggle('input-invalid', !isValid);
        inputElement.setAttribute('aria-invalid', String(!isValid));
    }

    // ===== Modal 위임 =====

    async showConfirm(title: string, message: string): Promise<boolean> {
        return this.#modalManager.showConfirm(title, message);
    }

    async showPrompt(
        title: string,
        message: string,
        defaultValue: string = ''
    ): Promise<string | null> {
        return this.#modalManager.showPrompt(title, message, defaultValue);
    }

    openTransactionModal(stock: Stock, currency: 'krw' | 'usd', transactions: Transaction[]): void {
        this.#modalManager.openTransactionModal(stock, currency, transactions);
    }

    closeTransactionModal(): void {
        this.#modalManager.closeTransactionModal();
    }

    /**
     * @description Render transaction list with ViewModel
     * @param viewModel - TransactionListViewModel
     */
    renderTransactionListViewModel(viewModel: TransactionListViewModel): void {
        this.#modalManager.renderTransactionListViewModel(viewModel);
    }

    /**
     * @description Render transaction list (legacy - delegates to ViewModel version)
     * @deprecated Use renderTransactionListViewModel instead
     */
    renderTransactionList(transactions: Transaction[], currency: 'krw' | 'usd'): void {
        this.#modalManager.renderTransactionList(transactions, currency);
    }

    // ===== VirtualScroll 위임 =====

    renderTable(
        calculatedPortfolioData: CalculatedStock[],
        currency: 'krw' | 'usd',
        mainMode: 'add' | 'sell' | 'simple'
    ): void {
        this.#virtualScrollManager.renderTable(calculatedPortfolioData, currency, mainMode);
    }

    updateVirtualTableData(calculatedPortfolioData: CalculatedStock[]): void {
        this.#virtualScrollManager.updateVirtualTableData(calculatedPortfolioData);
    }

    updateStockInVirtualData(
        stockId: string,
        field: string,
        value: string | number | boolean | Decimal
    ): void {
        this.#virtualScrollManager.updateStockInVirtualData(stockId, field, value);
    }

    updateSingleStockRow(stockId: string, calculatedData: CalculatedStockMetrics): void {
        this.#virtualScrollManager.updateSingleStockRow(stockId, calculatedData);
    }

    updateAllTargetRatioInputs(portfolioData: CalculatedStock[]): void {
        this.#virtualScrollManager.updateAllTargetRatioInputs(portfolioData);
    }

    updateCurrentPriceInput(id: string, price: string): void {
        this.#virtualScrollManager.updateCurrentPriceInput(id, price);
    }

    focusOnNewStock(stockId: string): void {
        this.#virtualScrollManager.focusOnNewStock(stockId);
    }

    // ===== ResultsRenderer 위임 =====

    displaySkeleton(): void {
        this.#resultsRenderer.displaySkeleton();
    }

    displayResults(html: string): void {
        this.#resultsRenderer.displayResults(html);
        this.announce(t('aria.resultsLoaded'), 'assertive');
    }

    displaySectorAnalysis(html: string): void {
        this.#resultsRenderer.displaySectorAnalysis(html);
    }

    displayChart(ChartClass: typeof Chart, labels: string[], data: number[], title: string): void {
        this.#resultsRenderer.displayChart(ChartClass, labels, data, title);
    }

    async displayPerformanceHistory(
        ChartClass: typeof Chart,
        snapshots: PortfolioSnapshot[],
        currency: 'krw' | 'usd',
        benchmarkComparison?: {
            portfolioNormalized: Array<{ date: string; value: import('decimal.js').default }>;
            benchmarkNormalized: Array<{ date: string; value: import('decimal.js').default }>;
            benchmarkName?: string;
        }
    ): Promise<void> {
        await this.#resultsRenderer.displayPerformanceHistory(
            ChartClass,
            snapshots,
            currency,
            benchmarkComparison
        );
    }

    hideResults(): void {
        this.#resultsRenderer.hideResults();
    }

    cleanupObserver(): void {
        this.#resultsRenderer.cleanupObserver();
    }

    destroyChart(): void {
        this.#resultsRenderer.destroyChart();
    }

    cleanup(): void {
        this.#resultsRenderer.cleanup();
    }

    // ===== 포트폴리오 UI =====

    /**
     * @description Render portfolio selector
     * @param portfolios - Portfolio list
     * @param activeId - Active portfolio ID
     */
    /**
     * @description Render portfolio selector with ViewModel
     * @param viewModel - PortfolioListViewModel
     */
    renderPortfolioSelectorViewModel(viewModel: PortfolioListViewModel): void {
        const selector = this.dom.portfolioSelector;
        if (!(selector instanceof HTMLSelectElement)) return;

        // DocumentFragment로 DOM 조작 최소화
        const fragment = document.createDocumentFragment();
        viewModel.items.forEach((item) => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            option.selected = item.isActive;
            fragment.appendChild(option);
        });

        selector.innerHTML = '';
        selector.appendChild(fragment);
    }

    /**
     * @description Render portfolio selector (legacy - delegates to ViewModel version)
     * @deprecated Use renderPortfolioSelectorViewModel instead
     */
    renderPortfolioSelector(portfolios: Record<string, { name: string }>, activeId: string): void {
        // Convert to ViewModel format for backward compatibility
        const viewModel: PortfolioListViewModel = {
            items: Object.entries(portfolios).map(([id, portfolio]) => ({
                id,
                name: portfolio.name,
                isActive: id === activeId,
            })),
            activeId,
        };

        this.renderPortfolioSelectorViewModel(viewModel);
    }

    /**
     * @description Update target ratio sum
     * @param totalRatio - Total ratio
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
     * @description Update main mode UI
     * @param mainMode - Main mode
     */
    updateMainModeUI(mainMode: 'add' | 'sell' | 'simple'): void {
        const addCard = this.dom.addInvestmentCard;
        const modeRadios = this.dom.mainModeSelector;

        addCard?.classList.toggle('hidden', mainMode !== 'add' && mainMode !== 'simple');

        modeRadios?.forEach((radio) => {
            if (isInputElement(radio)) radio.checked = radio.value === mainMode;
        });
        this.hideResults();
    }

    /**
     * @description Update currency mode UI
     * @param currencyMode - Currency mode
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
            if (isInputElement(radio)) radio.checked = radio.value === currencyMode;
        });

        if (!isUsdMode && isInputElement(usdInput)) usdInput.value = '';
    }

    /**
     * @description Toggle fetch prices button state
     * @param loading - Loading state
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

        if (isInputElement(exchangeRateInput)) {
            exchangeRateInput.value = rate.toFixed(2);
        }

        if (isInputElement(portfolioExchangeRateInput)) {
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
        if (isInputElement(exchangeRateInput)) {
            exchangeRateInput.value = settings.exchangeRate.toString();
        }
        if (isInputElement(portfolioExchangeRateInput)) {
            portfolioExchangeRateInput.value = settings.exchangeRate.toString();
        }

        // Rebalancing tolerance
        if (
            isInputElement(rebalancingToleranceInput) &&
            settings.rebalancingTolerance !== undefined
        ) {
            rebalancingToleranceInput.value = settings.rebalancingTolerance.toString();
        }

        // Trading fee rate
        if (isInputElement(tradingFeeRateInput) && settings.tradingFeeRate !== undefined) {
            tradingFeeRateInput.value = settings.tradingFeeRate.toString();
        }

        // Tax rate
        if (isInputElement(taxRateInput) && settings.taxRate !== undefined) {
            taxRateInput.value = settings.taxRate.toString();
        }
    }
}
