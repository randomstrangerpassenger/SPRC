// js/controller.ts (async/await + DOMPurify 적용)
import { PortfolioState } from './state';
import { PortfolioView } from './view';
import { Calculator } from './calculator';
import { Validator } from './validator';
import { debounce, formatCurrency, getRatioSum } from './utils';
import { CONFIG } from './constants';
import { ErrorService, ValidationError } from './errorService';
import { t } from './i18n';
import { generateSectorAnalysisHTML, generateAddModeResultsHTML, generateSellModeResultsHTML, generateSimpleModeResultsHTML } from './templates';
import Decimal from 'decimal.js';
import { apiService } from './apiService';
import { AddRebalanceStrategy, SellRebalanceStrategy, SimpleRatioStrategy } from './calculationStrategies';
import DOMPurify from 'dompurify';
import type Chart from 'chart.js/auto';
import type { CalculatedStock, Portfolio, Stock, MainMode, Currency } from './types';

// ▼▼▼ [추가] eventBinder.js 임포트 ▼▼▼
import { bindEventListeners } from './eventBinder';
// ▲▲▲ [추가] ▲▲▲

export class PortfolioController {
    state: PortfolioState;
    view: PortfolioView;
    debouncedSave: () => void;
    #lastCalculationKey: string | null = null;
    #eventAbortController: AbortController | null = null;

    /**
     * @param state
     * @param view
     */
    constructor(state: PortfolioState, view: PortfolioView) {
        this.state = state;
        this.view = view;
        this.debouncedSave = debounce(() => this.state.saveActivePortfolio(), 500);
        this.initialize();
    }

    async initialize(): Promise<void> {
        await this.state.ensureInitialized();
        this.view.cacheDomElements();
        this.setupInitialUI();
        this.bindControllerEvents();

        // 이벤트 바인딩 및 AbortController 저장 (메모리 누수 방지)
        this.#eventAbortController = bindEventListeners(this.view);
    }

    /**
     * @description 이벤트 리스너 정리 (메모리 누수 방지)
     */
    cleanup(): void {
        if (this.#eventAbortController) {
            this.#eventAbortController.abort();
            this.#eventAbortController = null;
            console.log('[Controller] Event listeners cleaned up');
        }
    }

    setupInitialUI(): void {
        // prefers-color-scheme 감지 (localStorage 설정이 없을 경우 시스템 테마 사용)
        const storedDarkMode = localStorage.getItem(CONFIG.DARK_MODE_KEY);
        if (storedDarkMode === 'true') {
            document.body.classList.add('dark-mode');
        } else if (storedDarkMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // localStorage에 설정이 없으면 시스템 테마 사용
            document.body.classList.add('dark-mode');
            localStorage.setItem(CONFIG.DARK_MODE_KEY, 'true');
        }

        // 시스템 테마 변경 감지 (실시간)
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // 사용자가 수동으로 설정하지 않은 경우에만 시스템 테마 따라가기
            const storedMode = localStorage.getItem(CONFIG.DARK_MODE_KEY);
            if (storedMode === null) {
                document.body.classList.toggle('dark-mode', e.matches);
            }
        });

        const activePortfolio = this.state.getActivePortfolio();
        if (activePortfolio) {
            this.view.renderPortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id);
            this.view.updateCurrencyModeUI(activePortfolio.settings.currentCurrency);
            this.view.updateMainModeUI(activePortfolio.settings.mainMode);

            const { exchangeRateInput, portfolioExchangeRateInput } = this.view.dom;
            if (exchangeRateInput instanceof HTMLInputElement) {
                exchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
            }
            if (portfolioExchangeRateInput instanceof HTMLInputElement) {
                portfolioExchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
            }

            this.fullRender();
        }
    }

    bindControllerEvents(): void {
        // Pub/Sub 패턴: View가 발행(emit)한 이벤트를 Controller가 구독(on)합니다.

        // 포트폴리오 관리
        this.view.on('newPortfolioClicked', () => this.handleNewPortfolio());
        this.view.on('renamePortfolioClicked', () => this.handleRenamePortfolio());
        this.view.on('deletePortfolioClicked', () => this.handleDeletePortfolio());
        this.view.on('portfolioSwitched', (data) => this.handleSwitchPortfolio(data.newId));

        // 포트폴리오 설정
        this.view.on('addNewStockClicked', () => this.handleAddNewStock());
        this.view.on('resetDataClicked', () => this.handleResetData());
        this.view.on('normalizeRatiosClicked', () => this.handleNormalizeRatios());
        this.view.on('fetchAllPricesClicked', () => this.handleFetchAllPrices());

        // 데이터 관리
        this.view.on('exportDataClicked', () => this.handleExportData());
        this.view.on('importDataClicked', () => this.handleImportData());
        this.view.on('fileSelected', (e) => this.handleFileSelected(e));

        // 테이블 상호작용
        this.view.on('portfolioBodyChanged', (e) => this.handlePortfolioBodyChange(e, null));
        this.view.on('portfolioBodyClicked', (e) => this.handlePortfolioBodyClick(e));
        this.view.on('manageStockClicked', (data) => this.openTransactionModalByStockId(data.stockId));
        this.view.on('deleteStockShortcut', (data) => this.handleDeleteStock(data.stockId));


        // 계산 및 통화
        this.view.on('calculateClicked', () => this.handleCalculate());
        this.view.on('mainModeChanged', (data) => this.handleMainModeChange(data.mode));
        this.view.on('currencyModeChanged', (data) => this.handleCurrencyModeChange(data.currency));
        this.view.on('currencyConversion', (data) => this.handleCurrencyConversion(data.source));
        this.view.on('portfolioExchangeRateChanged', (data) => this.handlePortfolioExchangeRateChange(data.rate));

        // 모달 상호작용
        this.view.on('closeTransactionModalClicked', () => this.view.closeTransactionModal());
        this.view.on('newTransactionSubmitted', (e) => this.handleAddNewTransaction(e));
        this.view.on('transactionDeleteClicked', (data) => this.handleTransactionListClick(data.stockId, data.txId));

        // 기타
        this.view.on('darkModeToggleClicked', () => this.handleToggleDarkMode());
        this.view.on('pageUnloading', () => this.handleSaveDataOnExit());
    }

    // --- UI 렌더링 ---

    fullRender(): void {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const calculatedState = Calculator.calculatePortfolioState({
            portfolioData: activePortfolio.portfolioData,
            exchangeRate: activePortfolio.settings.exchangeRate,
            currentCurrency: activePortfolio.settings.currentCurrency
        });

        this.view.renderTable(
            calculatedState.portfolioData,
            activePortfolio.settings.currentCurrency,
            activePortfolio.settings.mainMode
        );

        const ratioSum = getRatioSum(activePortfolio.portfolioData);
        this.view.updateRatioSum(ratioSum.toNumber());

        const sectorData = Calculator.calculateSectorAnalysis(calculatedState.portfolioData);
        this.view.displaySectorAnalysis(generateSectorAnalysisHTML(sectorData, activePortfolio.settings.currentCurrency));

        this.view.updateMainModeUI(activePortfolio.settings.mainMode);

        activePortfolio.portfolioData = calculatedState.portfolioData;
        this.debouncedSave();
    }

    updateUIState(): void {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const calculatedState = Calculator.calculatePortfolioState({
            portfolioData: activePortfolio.portfolioData,
            exchangeRate: activePortfolio.settings.exchangeRate,
            currentCurrency: activePortfolio.settings.currentCurrency
        });

        this.view.updateVirtualTableData(calculatedState.portfolioData);

        const ratioSum = getRatioSum(activePortfolio.portfolioData);
        this.view.updateRatioSum(ratioSum.toNumber());

        const sectorData = Calculator.calculateSectorAnalysis(calculatedState.portfolioData);
        this.view.displaySectorAnalysis(generateSectorAnalysisHTML(sectorData, activePortfolio.settings.currentCurrency));

        activePortfolio.portfolioData = calculatedState.portfolioData;
        this.debouncedSave();
    }

    // --- 포트폴리오 관리 핸들러 ---
    async handleNewPortfolio(): Promise<void> {
        let name = await this.view.showPrompt(t('modal.promptNewPortfolioNameTitle'), t('modal.promptNewPortfolioNameMsg'));
        if (name) {
            // ▼▼▼ [수정] 입력값 소독 ▼▼▼
            name = DOMPurify.sanitize(name);
            await this.state.createNewPortfolio(name);
            // ▲▲▲ [수정] ▲▲▲
            this.view.renderPortfolioSelector(this.state.getAllPortfolios(), this.state.getActivePortfolio()?.id || '');
            this.fullRender();
            this.view.showToast(t('toast.portfolioCreated', { name }), "success");
        }
     }

    async handleRenamePortfolio(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        let newName = await this.view.showPrompt(t('modal.promptRenamePortfolioTitle'), t('modal.promptRenamePortfolioMsg'), activePortfolio.name);
        if (newName && newName.trim()) {
            // ▼▼▼ [수정] 입력값 소독 ▼▼▼
            newName = DOMPurify.sanitize(newName.trim());
            await this.state.renamePortfolio(activePortfolio.id, newName);
            // ▲▲▲ [수정] ▲▲▲
            this.view.renderPortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id);
            this.view.showToast(t('toast.portfolioRenamed'), "success");
        }
     }

    async handleDeletePortfolio(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        if (Object.keys(this.state.getAllPortfolios()).length <= 1) {
            this.view.showToast(t('toast.lastPortfolioDeleteError'), "error");
            return;
        }

        const confirmDelete = await this.view.showConfirm(t('modal.confirmDeletePortfolioTitle'), t('modal.confirmDeletePortfolioMsg', { name: activePortfolio.name }));
        if (confirmDelete) {
            const deletedId = activePortfolio.id;
            if (await this.state.deletePortfolio(deletedId)) {
                const newActivePortfolio = this.state.getActivePortfolio();
                if (newActivePortfolio) {
                    this.view.renderPortfolioSelector(this.state.getAllPortfolios(), newActivePortfolio.id);
                    this.fullRender();
                    this.view.showToast(t('toast.portfolioDeleted'), "success");
                }
            }
        }
     }

    async handleSwitchPortfolio(newId: string): Promise<void> {
        // ▼▼▼ [수정] event.target 대신 newId를 받도록 수정 ▼▼▼
        const selector = this.view.dom.portfolioSelector;
        let targetId = newId;

        // newId가 없는 경우(eventBinder.js에서 직접 호출된 경우) event.target에서 값을 찾음
        if (!targetId && selector instanceof HTMLSelectElement) {
             targetId = selector.value;
        }

        if (targetId) {
            await this.state.setActivePortfolioId(targetId);
            const activePortfolio = this.state.getActivePortfolio();
            if (activePortfolio) {
                this.view.updateCurrencyModeUI(activePortfolio.settings.currentCurrency);
                this.view.updateMainModeUI(activePortfolio.settings.mainMode);
                const { exchangeRateInput, portfolioExchangeRateInput } = this.view.dom;
                if (exchangeRateInput instanceof HTMLInputElement) {
                    exchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
                }
                if (portfolioExchangeRateInput instanceof HTMLInputElement) {
                    portfolioExchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
                }
            }
            this.fullRender();
        }
        // ▲▲▲ [수정] ▲▲▲
     }


    // --- 주식/데이터 관리 핸들러 ---
    async handleAddNewStock(): Promise<void> {
        const newStock = await this.state.addNewStock();
        this.fullRender();
        if (newStock) {
             this.view.focusOnNewStock(newStock.id);
        }
     }

    async handleDeleteStock(stockId: string): Promise<void> {
        const stockName = this.state.getStockById(stockId)?.name || t('defaults.unknownStock');
        const confirmDelete = await this.view.showConfirm(
            t('modal.confirmDeleteStockTitle'),
            t('modal.confirmDeleteStockMsg', { name: stockName })
        );
        if (confirmDelete) {
            if(await this.state.deleteStock(stockId)){
                Calculator.clearPortfolioStateCache();
                this.fullRender();
                this.view.showToast(t('toast.transactionDeleted'), "success");
            } else {
                 this.view.showToast(t('toast.lastStockDeleteError'), "error");
            }
        }
     }

    async handleResetData(): Promise<void> {
        const confirmReset = await this.view.showConfirm(t('modal.confirmResetTitle'), t('modal.confirmResetMsg'));
        if (confirmReset) {
            await this.state.resetData();
            Calculator.clearPortfolioStateCache();
            const activePortfolio = this.state.getActivePortfolio();
             if (activePortfolio) {
                this.view.renderPortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id);
                this.view.updateCurrencyModeUI(activePortfolio.settings.currentCurrency);
                this.view.updateMainModeUI(activePortfolio.settings.mainMode);
                const { exchangeRateInput, portfolioExchangeRateInput } = this.view.dom;
                if (exchangeRateInput instanceof HTMLInputElement) {
                    exchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
                }
                if (portfolioExchangeRateInput instanceof HTMLInputElement) {
                    portfolioExchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
                }
             }
            this.fullRender();
            this.view.showToast(t('toast.dataReset'), "success");
        }
     }

    handleNormalizeRatios(): void {
        try {
            const success = this.state.normalizeRatios();
            if (!success) {
                this.view.showToast(t('toast.noRatiosToNormalize'), "info");
                return;
            }
            const activePortfolio = this.state.getActivePortfolio();
            if (!activePortfolio) return;
            this.view.updateAllTargetRatioInputs(activePortfolio.portfolioData);
            const sum = getRatioSum(activePortfolio.portfolioData);
            this.view.updateRatioSum(sum.toNumber());
            this.debouncedSave();
            this.view.showToast(t('toast.ratiosNormalized'), "success");
        } catch (error) {
             ErrorService.handle(error as Error, 'handleNormalizeRatios');
             this.view.showToast(t('toast.normalizeRatiosError'), "error");
        }
     }

    handlePortfolioBodyChange(e: Event, _debouncedUpdate: any): void {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        // ▼▼▼ [수정] 'tr' -> 'div[data-id]' ▼▼▼
        const row = target.closest('div[data-id]');
        // ▲▲▲ [수정] ▲▲▲
        if (!row) return;

        const stockId = (row as HTMLElement).dataset.id;
        const field = (target as HTMLInputElement).dataset.field;
        if (!stockId || !field) return;

        let value: any = (target.type === 'checkbox' && target instanceof HTMLInputElement) ? target.checked : target.value;
        let isValid = true;

        switch (field) {
            case 'targetRatio':
            case 'currentPrice':
            case 'fixedBuyAmount':
            case 'manualAmount':
                const validationResult = Validator.validateNumericInput(value);
                isValid = validationResult.isValid;
                if(isValid) value = validationResult.value ?? 0;
                break;
            case 'isFixedBuyEnabled':
                value = Boolean(value);
                break;
            case 'ticker':
                // 티커: 정규식 필터링 (대문자, 숫자, ., - 만 허용)
                const tickerResult = Validator.validateTicker(value);
                isValid = tickerResult.isValid;
                if(isValid) value = tickerResult.value ?? '';
                break;
            case 'name':
            case 'sector':
                // 자유 텍스트: 길이 제한 + DOMPurify
                const textResult = Validator.validateText(value, field === 'name' ? 50 : 30);
                isValid = textResult.isValid;
                if(isValid) value = DOMPurify.sanitize(textResult.value ?? '');
                break;
            default:
                value = DOMPurify.sanitize(String(value).trim());
                break;
        }

        this.view.toggleInputValidation(target as HTMLInputElement, isValid);

        if (isValid) {
            this.state.updateStockProperty(stockId, field, value);

            // manualAmount는 간단 모드 전용 필드로, 입력 시 테이블 재렌더링 불필요
            if (field === 'manualAmount') {
                // 하지만 _virtualData는 업데이트하여 스크롤 시 값이 유지되도록 함
                this.view.updateStockInVirtualData(stockId, field, value);
                this.debouncedSave();
                return; // 재렌더링 건너뛰기
            }

            const activePortfolio = this.state.getActivePortfolio();
            if (!activePortfolio) return;

            // ▼▼▼ [최적화] 현재가 변경 시 부분 업데이트 ▼▼▼
            if (field === 'currentPrice') {
                // 해당 주식만 재계산
                const stock = activePortfolio.portfolioData.find(s => s.id === stockId);
                if (stock) {
                    const calculatedMetrics = Calculator.calculateStockMetrics(stock);

                    // 환율 변환 적용
                    const exchangeRateDec = new Decimal(activePortfolio.settings.exchangeRate);
                    if (activePortfolio.settings.currentCurrency === 'krw') {
                        calculatedMetrics.currentAmountKRW = calculatedMetrics.currentAmount;
                        calculatedMetrics.currentAmountUSD = calculatedMetrics.currentAmount.div(exchangeRateDec);
                    } else {
                        calculatedMetrics.currentAmountUSD = calculatedMetrics.currentAmount;
                        calculatedMetrics.currentAmountKRW = calculatedMetrics.currentAmount.times(exchangeRateDec);
                    }

                    // 화면 업데이트 (해당 행만)
                    this.view.updateSingleStockRow(stockId, calculatedMetrics);

                    // 섹터 분석은 전체 재계산 필요
                    Calculator.clearPortfolioStateCache();
                    const calculatedState = Calculator.calculatePortfolioState({
                        portfolioData: activePortfolio.portfolioData,
                        exchangeRate: activePortfolio.settings.exchangeRate,
                        currentCurrency: activePortfolio.settings.currentCurrency
                    });
                    const newSectorData = Calculator.calculateSectorAnalysis(calculatedState.portfolioData);
                    this.view.displaySectorAnalysis(generateSectorAnalysisHTML(newSectorData, activePortfolio.settings.currentCurrency));
                }

                this.debouncedSave();
                return;
            }
            // ▲▲▲ [최적화] ▲▲▲

            // 기타 필드 변경 시 전체 재계산 (기존 방식)
            Calculator.clearPortfolioStateCache();

            const calculatedState = Calculator.calculatePortfolioState({
                portfolioData: activePortfolio.portfolioData,
                exchangeRate: activePortfolio.settings.exchangeRate,
                currentCurrency: activePortfolio.settings.currentCurrency
            });
            activePortfolio.portfolioData = calculatedState.portfolioData;

            this.view.updateVirtualTableData(calculatedState.portfolioData);

            const newRatioSum = getRatioSum(activePortfolio.portfolioData);
            this.view.updateRatioSum(newRatioSum.toNumber());

            const newSectorData = Calculator.calculateSectorAnalysis(calculatedState.portfolioData);
            this.view.displaySectorAnalysis(generateSectorAnalysisHTML(newSectorData, activePortfolio.settings.currentCurrency));

            this.debouncedSave();

            if (field === 'isFixedBuyEnabled') {
               const amountInput = row.querySelector('input[data-field="fixedBuyAmount"]');
               if (amountInput instanceof HTMLInputElement) {
                   amountInput.disabled = !value;
                   if (!value) {
                       amountInput.value = '0';
                       this.state.updateStockProperty(stockId, 'fixedBuyAmount', 0);
                       this.debouncedSave();
                   }
               }
           }
        }
     }


    handlePortfolioBodyClick(e: Event): void {
        const target = e.target as HTMLElement;
        const actionButton = target.closest('button[data-action]');
        if (!actionButton) return;

        // ▼▼▼ [수정] 'tr' -> 'div[data-id]' ▼▼▼
        const row = actionButton.closest('div[data-id]');
        // ▲▲▲ [수정] ▲▲▲
        if (!row?.dataset.id) return;

        const stockId = (row as HTMLElement).dataset.id;
        const action = (actionButton as HTMLElement).dataset.action;

        if (action === 'manage') {
            this.openTransactionModalByStockId(stockId);
        } else if (action === 'delete') {
            this.handleDeleteStock(stockId);
        }
     }

    openTransactionModalByStockId(stockId: string): void {
        const stock = this.state.getStockById(stockId);
        const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
        if (stock && currency) {
            this.view.openTransactionModal(stock, currency, this.state.getTransactions(stockId));
        }
    }


    // --- 계산 및 통화 핸들러 ---
    async handleCalculate(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const additionalInvestment = this.getInvestmentAmountInKRW();

        const inputs = {
            mainMode: activePortfolio.settings.mainMode,
            portfolioData: activePortfolio.portfolioData,
            additionalInvestment: additionalInvestment
        };

        const validationErrors = Validator.validateForCalculation(inputs);

        if (validationErrors.length > 0) {
            const errorMessages = validationErrors.map(err => err.message).join('\n');
            ErrorService.handle(new ValidationError(errorMessages), 'handleCalculate - Validation');
            this.view.hideResults();
            return;
        }

        // 목표 비율 검증 (모든 모드에서 수행)
        const totalRatio = getRatioSum(inputs.portfolioData);
        if (Math.abs(totalRatio.toNumber() - 100) > CONFIG.RATIO_TOLERANCE) {
            const proceed = await this.view.showConfirm(
                t('modal.confirmRatioSumWarnTitle'),
                t('modal.confirmRatioSumWarnMsg', { totalRatio: totalRatio.toFixed(1) })
            );
            if (!proceed) {
                this.view.hideResults();
                return;
            }
        }

        const calculatedState = Calculator.calculatePortfolioState({
            portfolioData: inputs.portfolioData,
            exchangeRate: activePortfolio.settings.exchangeRate,
            currentCurrency: activePortfolio.settings.currentCurrency
        });
        activePortfolio.portfolioData = calculatedState.portfolioData;

        // ▼▼▼ [수정] 전략 패턴 적용 ▼▼▼
        let strategy;
        if (activePortfolio.settings.mainMode === 'add') {
            strategy = new AddRebalanceStrategy(calculatedState.portfolioData, additionalInvestment);
        } else if (activePortfolio.settings.mainMode === 'simple') {
            strategy = new SimpleRatioStrategy(calculatedState.portfolioData, additionalInvestment);
        } else {
            strategy = new SellRebalanceStrategy(calculatedState.portfolioData);
        }
        const rebalancingResults = Calculator.calculateRebalancing(strategy);
        // ▲▲▲ [수정] ▲▲▲

        const resultsHTML = activePortfolio.settings.mainMode === 'add'
             ? generateAddModeResultsHTML(rebalancingResults.results, {
                   currentTotal: calculatedState.currentTotal,
                   additionalInvestment: additionalInvestment,
                   finalTotal: calculatedState.currentTotal.plus(additionalInvestment)
               }, activePortfolio.settings.currentCurrency)
             : activePortfolio.settings.mainMode === 'simple'
             ? generateSimpleModeResultsHTML(rebalancingResults.results, {
                   currentTotal: calculatedState.currentTotal,
                   additionalInvestment: additionalInvestment,
                   finalTotal: calculatedState.currentTotal.plus(additionalInvestment)
               }, activePortfolio.settings.currentCurrency)
             : generateSellModeResultsHTML(rebalancingResults.results, activePortfolio.settings.currentCurrency);

        this.view.displayResults(resultsHTML);

        // ▼▼▼ [추가] 차트 표시 ▼▼▼
        const chartLabels = rebalancingResults.results.map(r => r.stock.name);
        const chartData = rebalancingResults.results.map(r => {
            const ratio = r.stock.targetRatio instanceof Decimal ? r.stock.targetRatio : new Decimal(r.stock.targetRatio ?? 0);
            return ratio.toNumber();
        });
        const chartTitle = activePortfolio.settings.mainMode === 'simple'
            ? '포트폴리오 목표 비율 (간단 계산 모드)'
            : activePortfolio.settings.mainMode === 'add'
            ? '포트폴리오 목표 비율 (추가 매수 모드)'
            : '포트폴리오 목표 비율 (매도 리밸런싱 모드)';
        this.view.displayChart((await import('chart.js/auto')).default, chartLabels, chartData, chartTitle);
        // ▲▲▲ [추가] ▲▲▲

        this.debouncedSave();
        this.view.showToast(t('toast.calculateSuccess'), "success");
     }


    async handleFetchAllPrices(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio || activePortfolio.portfolioData.length === 0) {
            this.view.showToast(t('api.noUpdates'), "info");
            return;
        }

        const tickersToFetch = activePortfolio.portfolioData
            .filter(s => s.ticker && s.ticker.trim() !== '')
            .map(s => ({ id: s.id, ticker: s.ticker.trim() }));

        if (tickersToFetch.length === 0) {
            this.view.showToast(t('toast.noTickersToFetch'), "info");
            return;
        }

        this.view.toggleFetchButton(true);

        try {
            let successCount = 0;
            let failureCount = 0;
            const failedTickers: string[] = [];

            const results = await apiService.fetchAllStockPrices(tickersToFetch);

            // Get current currency and exchange rate for conversion
            const exchangeRate = activePortfolio.settings.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;
            const currentCurrency = activePortfolio.settings.currentCurrency || 'krw';

            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value) {
                    let price = result.value; // This is in USD from Finnhub API

                    // Convert USD price to KRW if current currency is KRW using Decimal.js
                    if (currentCurrency === 'krw') {
                        const priceDec = new Decimal(price);
                        const exchangeRateDec = new Decimal(exchangeRate);
                        price = priceDec.times(exchangeRateDec).toNumber();
                    }

                    this.state.updateStockProperty((result as any).id, 'currentPrice', price);
                    this.view.updateCurrentPriceInput((result as any).id, price.toFixed(2));
                    successCount++;
                } else {
                    failureCount++;
                    failedTickers.push((result as any).ticker);
                    console.error(`[API] Failed to fetch price for ${(result as any).ticker}:`, (result as any).reason);
                }
            });

            Calculator.clearPortfolioStateCache();
            this.updateUIState();

            if (successCount === tickersToFetch.length) {
                this.view.showToast(t('api.fetchSuccessAll', { count: successCount }), "success");
            } else if (successCount > 0) {
                this.view.showToast(t('api.fetchSuccessPartial', { count: successCount, failed: failureCount }), "warning");
            } else {
                this.view.showToast(t('api.fetchFailedAll', { failed: failureCount }), "error");
            }
            if (failedTickers.length > 0) {
                console.log("Failed tickers:", failedTickers.join(', '));
            }
        } catch (error) {
            ErrorService.handle(error as Error, 'handleFetchAllPrices');
            this.view.showToast(t('api.fetchErrorGlobal', { message: (error as Error).message }), 'error');
        } finally {
            this.view.toggleFetchButton(false);
        }
     }

    async handleMainModeChange(newMode: MainMode): Promise<void> {
        if (newMode !== 'add' && newMode !== 'sell' && newMode !== 'simple') return;
        await this.state.updatePortfolioSettings('mainMode', newMode);

        // requestAnimationFrame을 사용하여 상태 업데이트가 완전히 반영된 후 렌더링
        requestAnimationFrame(() => {
            this.fullRender();
            const modeName = newMode === 'add' ? t('ui.addMode') : newMode === 'simple' ? '간단 계산 모드' : t('ui.sellMode');
            this.view.showToast(t('toast.modeChanged', { mode: modeName }), "info");
        });
     }

    async handleCurrencyModeChange(newCurrency: Currency): Promise<void> {
        if (newCurrency !== 'krw' && newCurrency !== 'usd') return;

        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const oldCurrency = activePortfolio.settings.currentCurrency || 'krw';

        // If currency is actually changing, convert all existing currentPrice values
        if (oldCurrency !== newCurrency) {
            const exchangeRate = activePortfolio.settings.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;
            const exchangeRateDec = new Decimal(exchangeRate);

            activePortfolio.portfolioData.forEach(stock => {
                if (stock.currentPrice && stock.currentPrice > 0) {
                    const currentPriceDec = new Decimal(stock.currentPrice);
                    let newPrice;

                    // Convert from old currency to new currency using Decimal.js
                    if (oldCurrency === 'usd' && newCurrency === 'krw') {
                        // USD to KRW
                        newPrice = currentPriceDec.times(exchangeRateDec).toNumber();
                    } else if (oldCurrency === 'krw' && newCurrency === 'usd') {
                        // KRW to USD
                        newPrice = currentPriceDec.div(exchangeRateDec).toNumber();
                    } else {
                        newPrice = stock.currentPrice; // No conversion needed
                    }

                    this.state.updateStockProperty(stock.id, 'currentPrice', newPrice);
                }
            });
        }

        await this.state.updatePortfolioSettings('currentCurrency', newCurrency);
        this.fullRender();
        this.view.showToast(t('toast.currencyChanged', { currency: newCurrency.toUpperCase() }), "info");
    }

    async handleCurrencyConversion(source: 'krw' | 'usd'): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const { additionalAmountInput, additionalAmountUSDInput, exchangeRateInput } = this.view.dom;

         if (!(additionalAmountInput instanceof HTMLInputElement) || !(additionalAmountUSDInput instanceof HTMLInputElement) || !(exchangeRateInput instanceof HTMLInputElement)) return;

        const exchangeRateNum = Number(exchangeRateInput.value) || CONFIG.DEFAULT_EXCHANGE_RATE;
        const isValidRate = exchangeRateNum > 0;
        let currentExchangeRate = CONFIG.DEFAULT_EXCHANGE_RATE;

        if (isValidRate) {
            await this.state.updatePortfolioSettings('exchangeRate', exchangeRateNum);
            currentExchangeRate = exchangeRateNum;
        } else {
             await this.state.updatePortfolioSettings('exchangeRate', CONFIG.DEFAULT_EXCHANGE_RATE);
             exchangeRateInput.value = CONFIG.DEFAULT_EXCHANGE_RATE.toString();
             this.view.showToast(t('toast.invalidExchangeRate'), "error");
        }
        const currentExchangeRateDec = new Decimal(currentExchangeRate);

        let krwAmountDec = new Decimal(0);
        let usdAmountDec = new Decimal(0);

        try {
            if (source === 'krw') {
                krwAmountDec = new Decimal(additionalAmountInput.value || 0);
                 if (krwAmountDec.isNegative()) throw new Error('Negative KRW input');
                usdAmountDec = currentExchangeRateDec.isZero() ? new Decimal(0) : krwAmountDec.div(currentExchangeRateDec);
            } else {
                usdAmountDec = new Decimal(additionalAmountUSDInput.value || 0);
                if (usdAmountDec.isNegative()) throw new Error('Negative USD input');
                krwAmountDec = usdAmountDec.times(currentExchangeRateDec);
            }

            if (source === 'krw') {
                 additionalAmountUSDInput.value = usdAmountDec.toFixed(2);
            } else {
                additionalAmountInput.value = krwAmountDec.toFixed(0);
            }

            this.debouncedSave();

        } catch(e) {
             console.error("Error during currency conversion:", e);
             this.view.showToast(t('toast.amountInputError'), "error");
             if (source === 'krw') additionalAmountUSDInput.value = ''; else additionalAmountInput.value = '';
        }
     }

    async handlePortfolioExchangeRateChange(rate: number): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const exchangeRateNum = Number(rate);
        const isValidRate = !isNaN(exchangeRateNum) && exchangeRateNum > 0;

        if (isValidRate) {
            await this.state.updatePortfolioSettings('exchangeRate', exchangeRateNum);
            this.debouncedSave();
        } else {
            await this.state.updatePortfolioSettings('exchangeRate', CONFIG.DEFAULT_EXCHANGE_RATE);
            this.view.showToast(t('toast.invalidExchangeRate'), "error");
        }
    }


    // --- 거래 내역 모달 핸들러 ---

    async handleAddNewTransaction(e: Event): Promise<void> {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const modal = form.closest('#transactionModal') as HTMLElement | null;
        const stockId = modal?.dataset.stockId;
        if (!stockId) return;

        const typeInput = form.querySelector('input[name="txType"]:checked');
        const inputModeInput = form.querySelector('input[name="inputMode"]:checked');
        const dateInput = form.querySelector('#txDate') as HTMLInputElement;
        const quantityInput = form.querySelector('#txQuantity') as HTMLInputElement;
        const totalAmountInput = form.querySelector('#txTotalAmount') as HTMLInputElement;
        const priceInput = form.querySelector('#txPrice') as HTMLInputElement;

        if (!typeInput || !dateInput || !priceInput) return;

        const type = (typeInput instanceof HTMLInputElement && typeInput.value === 'sell') ? 'sell' : 'buy';
        const inputMode = (inputModeInput instanceof HTMLInputElement) ? inputModeInput.value : 'quantity';
        const date = dateInput.value;
        const priceStr = priceInput.value;

        let finalQuantity: number;

        if (inputMode === 'amount') {
            // 금액 입력 모드: 총 금액 / 단가 = 수량 (Decimal.js로 정밀 계산)
            if (!totalAmountInput || !totalAmountInput.value) {
                this.view.showToast(t('toast.invalidTransactionInfo'), "error");
                return;
            }

            const totalAmountStr = totalAmountInput.value;

            try {
                const totalAmountDec = new Decimal(totalAmountStr);
                const priceDec = new Decimal(priceStr);

                if (priceDec.isZero() || priceDec.isNegative()) {
                    this.view.showToast('단가는 0보다 커야 합니다.', "error");
                    return;
                }

                // 수량 = 총 금액 / 단가
                const quantityDec = totalAmountDec.div(priceDec);
                finalQuantity = quantityDec.toNumber();
            } catch (error) {
                this.view.showToast('금액 또는 단가 입력이 올바르지 않습니다.', "error");
                return;
            }
        } else {
            // 수량 입력 모드: 기존 방식
            if (!quantityInput || !quantityInput.value) {
                this.view.showToast(t('toast.invalidTransactionInfo'), "error");
                return;
            }

            const quantityStr = quantityInput.value;
            finalQuantity = Number(quantityStr);
        }

        const txData = { type, date, quantity: String(finalQuantity), price: priceStr };
        const validationResult = Validator.validateTransaction(txData);

        if (!validationResult.isValid) {
            this.view.showToast(validationResult.message || t('toast.invalidTransactionInfo'), "error");
            return;
        }

        const success = await this.state.addTransaction(stockId, {
             type,
             date,
             quantity: finalQuantity,
             price: Number(priceStr)
        });

        if (success) {
            const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
            if (currency) {
                 this.view.renderTransactionList(this.state.getTransactions(stockId), currency);
            }
            form.reset();
            dateInput.valueAsDate = new Date();

            // 입력 모드를 수량 입력으로 리셋
            const inputModeQuantity = form.querySelector('#inputModeQuantity');
            if (inputModeQuantity instanceof HTMLInputElement) {
                inputModeQuantity.checked = true;
                // UI 토글
                const quantityInputGroup = document.getElementById('quantityInputGroup');
                const totalAmountInputGroup = document.getElementById('totalAmountInputGroup');
                const calculatedQuantityDisplay = document.getElementById('calculatedQuantityDisplay');

                if (quantityInputGroup) quantityInputGroup.style.display = '';
                if (totalAmountInputGroup) totalAmountInputGroup.style.display = 'none';
                if (calculatedQuantityDisplay) calculatedQuantityDisplay.style.display = 'none';
                if (quantityInput) quantityInput.required = true;
                if (totalAmountInput) totalAmountInput.required = false;
            }

            this.view.showToast(t('toast.transactionAdded'), "success");

            Calculator.clearPortfolioStateCache();
            this.fullRender();
        } else {
             this.view.showToast(t('toast.transactionAddFailed'), "error");
        }
     }


    async handleTransactionListClick(stockId: string, txId: string): Promise<void> {
        if (stockId && txId) {
             const confirmDelete = await this.view.showConfirm(t('modal.confirmDeleteTransactionTitle'), t('modal.confirmDeleteTransactionMsg'));
             if(confirmDelete) {
                 const success = await this.state.deleteTransaction(stockId, txId);
                 if (success) {
                    const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
                    if (currency) {
                         const transactionsBeforeRender = this.state.getTransactions(stockId);
                         this.view.renderTransactionList(transactionsBeforeRender, currency);
                    }
                    this.view.showToast(t('toast.transactionDeleted'), "success");
                    Calculator.clearPortfolioStateCache();
                    this.updateUIState();
                 } else {
                     this.view.showToast(t('toast.transactionDeleteFailed'), "error");
                 }
            }
        } else {
             console.error("handleTransactionListClick received invalid IDs:", stockId, txId);
        }
     }


    // --- 기타 핸들러 ---
    handleToggleDarkMode(): void {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem(CONFIG.DARK_MODE_KEY, isDarkMode ? 'true' : 'false');
        this.view.destroyChart();
        this.fullRender();
     }

    handleSaveDataOnExit(): void {
        console.log("Page unloading. Relaying on debounced save.");
    }

    handleImportData(): void {
        const fileInput = this.view.dom.importFileInput;
        if (fileInput instanceof HTMLInputElement) fileInput.click();
     }

    handleFileSelected(e: Event): void {
        const fileInput = e.target as HTMLInputElement;
        const file = fileInput.files?.[0];

        if (file) {
            if (file.type !== 'application/json') {
                this.view.showToast(t('toast.invalidFileType'), "error");
                fileInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const jsonString = event.target?.result;
                    if (typeof jsonString === 'string') {
                        const loadedData = JSON.parse(jsonString);
                        await this.state.importData(loadedData);
                        Calculator.clearPortfolioStateCache();
                        this.setupInitialUI();
                        this.view.showToast(t('toast.importSuccess'), "success");
                    } else {
                         throw new Error("Failed to read file content.");
                    }
                } catch (error) {
                    ErrorService.handle(error as Error, 'handleFileSelected');
                    this.view.showToast(t('toast.importError'), "error");
                } finally {
                    fileInput.value = '';
                }
            };
             reader.onerror = () => {
                 ErrorService.handle(new Error("File reading error"), 'handleFileSelected - Reader Error');
                 this.view.showToast(t('toast.importError'), "error");
                 fileInput.value = '';
             };
            reader.readAsText(file);
        }
     }

    handleExportData(): void {
        try {
            const dataToExport = this.state.exportData();
            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const activePortfolio = this.state.getActivePortfolio();
            const filename = `portfolio_data_${activePortfolio?.name || 'export'}_${Date.now()}.json`;

            const a = document.createElement('a');
            a.href = url;
            a.download = filename.replace(/\s+/g, '_');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.view.showToast(t('toast.exportSuccess'), "success");
        } catch (error) {
            ErrorService.handle(error as Error, 'handleExportData');
            this.view.showToast(t('toast.exportError'), "error");
        }
     }

    getInvestmentAmountInKRW(): Decimal {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return new Decimal(0);

        const { currentCurrency } = activePortfolio.settings;
        const { additionalAmountInput, additionalAmountUSDInput, exchangeRateInput } = this.view.dom;

        if (!(additionalAmountInput instanceof HTMLInputElement) ||
            !(additionalAmountUSDInput instanceof HTMLInputElement) ||
            !(exchangeRateInput instanceof HTMLInputElement)) {
            return new Decimal(0);
        }

        const amountKRWStr = additionalAmountInput.value || '0';
        const amountUSDStr = additionalAmountUSDInput.value || '0';
        const exchangeRateStr = exchangeRateInput.value || String(CONFIG.DEFAULT_EXCHANGE_RATE);

        try {
            const amountKRW = new Decimal(amountKRWStr);
            const amountUSD = new Decimal(amountUSDStr);
            const exchangeRate = new Decimal(exchangeRateStr);

            if (currentCurrency === 'krw') {
                return amountKRW.isNegative() ? new Decimal(0) : amountKRW;
            } else {
                 if (exchangeRate.isZero() || exchangeRate.isNegative()) return new Decimal(0);
                const calculatedKRW = amountUSD.times(exchangeRate);
                return calculatedKRW.isNegative() ? new Decimal(0) : calculatedKRW;
            }
        } catch (e) {
             console.error("Error parsing investment amount:", e);
             return new Decimal(0);
        }
     }
}
