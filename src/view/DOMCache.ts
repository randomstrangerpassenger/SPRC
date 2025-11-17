// src/view/DOMCache.ts
import type { DOMElements } from '../types';

/**
 * @class DOMCache
 * @description Helper class for DOM element caching and dynamic queries
 */
export class DOMCache {
    #cache: DOMElements = {} as DOMElements;

    /**
     * @description Cache all DOM elements
     */
    cacheAll(): DOMElements {
        const D = document;
        this.#cache = {
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
            allocationTemplateSelect: D.getElementById('allocationTemplate'),
            applyTemplateBtn: D.getElementById('applyTemplateBtn'),
            resetDataBtn: D.getElementById('resetDataBtn'),
            normalizeRatiosBtn: D.getElementById('normalizeRatiosBtn'),
            dataManagementBtn: D.getElementById('dataManagementBtn'),
            dataDropdownContent: D.getElementById('dataDropdownContent'),
            exportDataBtn: D.getElementById('exportDataBtn'),
            importDataBtn: D.getElementById('importDataBtn'),
            exportTransactionsCSVBtn: D.getElementById('exportTransactionsCSVBtn'),
            importFileInput: D.getElementById('importFileInput'),
            importTransactionsBtn: D.getElementById('importTransactionsBtn'),
            importTransactionFileInput: D.getElementById('importTransactionFileInput'),
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
            showSnapshotListBtn: D.getElementById('showSnapshotListBtn'),
            performanceChartContainer: D.getElementById('performanceChartContainer'),
            performanceChart: D.getElementById('performanceChart'),
            snapshotListContainer: D.getElementById('snapshotListContainer'),
            snapshotList: D.getElementById('snapshotList'),
        };

        return this.#cache;
    }

    /**
     * @description Return cached DOM elements
     */
    getCache(): DOMElements {
        return this.#cache;
    }

    /**
     * @description Query element dynamically based on data-attribute
     * @param selector - data-attribute selector (e.g., '[data-action="submit"]')
     * @param context - Search context (default: document)
     */
    queryByData(selector: string, context: Document | Element = document): HTMLElement | null {
        return context.querySelector(selector);
    }

    /**
     * @description Query multiple elements based on data-attribute
     * @param selector - data-attribute selector
     * @param context - Search context (default: document)
     */
    queryAllByData(
        selector: string,
        context: Document | Element = document
    ): NodeListOf<HTMLElement> {
        return context.querySelectorAll(selector);
    }

    /**
     * @description Find the closest parent element with data-attribute
     * @param element - Starting element
     * @param dataAttr - data attribute name (e.g., 'data-id')
     */
    closest(element: HTMLElement, dataAttr: string): HTMLElement | null {
        return element.closest(`[${dataAttr}]`);
    }

    /**
     * @description Query element by ID (cache first, fallback to dynamic query)
     * @param id - Element ID
     */
    getById(id: string): HTMLElement | null {
        // Query using document.getElementById first (fastest)
        return document.getElementById(id);
    }

    /**
     * @description Invalidate cache
     */
    clearCache(): void {
        this.#cache = {} as DOMElements;
    }
}
