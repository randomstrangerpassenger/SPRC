// src/view/DOMCache.ts
import type { DOMElements } from '../types';

/**
 * @class DOMCache
 * @description DOM 요소 캐싱 및 동적 조회를 위한 헬퍼 클래스
 */
export class DOMCache {
    private cache: DOMElements = {} as DOMElements;

    /**
     * @description 모든 DOM 요소를 캐싱
     */
    cacheAll(): DOMElements {
        const D = document;
        this.cache = {
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

        return this.cache;
    }

    /**
     * @description 캐시된 DOM 요소 반환
     */
    getCache(): DOMElements {
        return this.cache;
    }

    /**
     * @description data-attribute 기반 동적 요소 조회
     * @param selector - data-attribute 셀렉터 (예: '[data-action="submit"]')
     * @param context - 검색 컨텍스트 (기본값: document)
     */
    queryByData(selector: string, context: Document | Element = document): HTMLElement | null {
        return context.querySelector(selector);
    }

    /**
     * @description data-attribute 기반 다중 요소 조회
     * @param selector - data-attribute 셀렉터
     * @param context - 검색 컨텍스트 (기본값: document)
     */
    queryAllByData(
        selector: string,
        context: Document | Element = document
    ): NodeListOf<HTMLElement> {
        return context.querySelectorAll(selector);
    }

    /**
     * @description 가장 가까운 부모 요소 중 data-attribute를 가진 요소 찾기
     * @param element - 시작 요소
     * @param dataAttr - data 속성 이름 (예: 'data-id')
     */
    closest(element: HTMLElement, dataAttr: string): HTMLElement | null {
        return element.closest(`[${dataAttr}]`);
    }

    /**
     * @description 특정 ID의 요소 조회 (캐시 우선, 없으면 동적 조회)
     * @param id - 요소 ID
     */
    getById(id: string): HTMLElement | null {
        // 먼저 document.getElementById로 조회 (가장 빠름)
        return document.getElementById(id);
    }

    /**
     * @description 캐시 무효화
     */
    clearCache(): void {
        this.cache = {} as DOMElements;
    }
}
