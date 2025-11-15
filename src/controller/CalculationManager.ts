// src/controller/CalculationManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { Calculator } from '../calculator';
import { Validator } from '../validator';
import { CONFIG } from '../constants';
import { ValidationError } from '../errorService';
import { getRatioSum, isInputElement } from '../utils';
import { t } from '../i18n';
import { ChartLoaderService } from '../services/ChartLoaderService';
import {
    generateAddModeResultsHTML,
    generateSellModeResultsHTML,
    generateSimpleModeResultsHTML,
} from '../templates';
import {
    AddRebalanceStrategy,
    SellRebalanceStrategy,
    SimpleRatioStrategy,
    type RebalancingResult,
} from '../calculationStrategies';
import { apiService, APIError, formatAPIError } from '../apiService';
import { SnapshotRepository } from '../state/SnapshotRepository';
import Decimal from 'decimal.js';
import type { MainMode, Currency, FetchStockResult } from '../types';
import { logger } from '../services/Logger';
import { getRebalanceWorkerService } from '../services/RebalanceWorkerService';
import { ProgressIndicatorService } from '../services/ProgressIndicatorService';

/**
 * @class CalculationManager
 * @description Manages calculations, API calls, and currency conversions
 */
export class CalculationManager {
    #state: PortfolioState;
    #view: PortfolioView;
    #debouncedSave: () => void;
    #getInvestmentAmountInKRW: () => Decimal;
    #snapshotRepo: SnapshotRepository;
    #rebalanceWorker: ReturnType<typeof getRebalanceWorkerService>;
    #progressIndicator: ProgressIndicatorService;

    constructor(
        state: PortfolioState,
        view: PortfolioView,
        debouncedSave: () => void,
        getInvestmentAmountInKRW: () => Decimal,
        snapshotRepo: SnapshotRepository
    ) {
        this.#state = state;
        this.#view = view;
        this.#debouncedSave = debouncedSave;
        this.#getInvestmentAmountInKRW = getInvestmentAmountInKRW;
        this.#snapshotRepo = snapshotRepo;
        this.#rebalanceWorker = getRebalanceWorkerService();
        this.#progressIndicator = new ProgressIndicatorService(view);
    }

    /**
     * @description Validate calculation inputs and ratio sum
     * @returns true if validation passes, false otherwise
     */
    private async validateCalculationInputs(
        portfolioData: Stock[],
        mainMode: 'add' | 'sell' | 'simple',
        additionalInvestment: Decimal
    ): Promise<boolean> {
        const inputs = { mainMode, portfolioData, additionalInvestment };
        const validationErrors = Validator.validateForCalculation(inputs);

        if (validationErrors.length > 0) {
            const errorMessages = validationErrors.map((err) => err.message).join('\n');
            logger.error(
                'Portfolio validation failed',
                'CalculationManager.handleCalculate',
                new ValidationError(errorMessages)
            );
            this.#view.hideResults();
            return false;
        }

        const totalRatio = getRatioSum(portfolioData);
        if (Math.abs(totalRatio.toNumber() - 100) > CONFIG.RATIO_TOLERANCE) {
            const proceed = await this.#view.showConfirm(
                t('modal.confirmRatioSumWarnTitle'),
                t('modal.confirmRatioSumWarnMsg', { totalRatio: totalRatio.toFixed(1) })
            );
            if (!proceed) {
                this.#view.hideResults();
                return false;
            }
        }

        return true;
    }

    /**
     * @description Save portfolio snapshot (non-critical operation)
     */
    private async savePortfolioSnapshot(
        portfolioId: string,
        portfolioData: CalculatedStock[],
        exchangeRate: number,
        currency: 'krw' | 'usd'
    ): Promise<void> {
        try {
            const snapshot = Calculator.createSnapshot(
                portfolioId,
                portfolioData,
                exchangeRate,
                currency
            );
            await this.#snapshotRepo.add(snapshot);
            logger.info(`Snapshot saved: ${snapshot.date}`, 'CalculationManager');
        } catch (error) {
            // Snapshot failure is non-critical, continue execution
            logger.error('Failed to save snapshot', 'CalculationManager.saveSnapshot', error);
        }
    }

    /**
     * @description Execute rebalancing strategy with Worker (async)
     */
    private async executeRebalancingStrategy(
        mainMode: 'add' | 'sell' | 'simple',
        portfolioData: CalculatedStock[],
        additionalInvestment: Decimal
    ): Promise<{ results: RebalancingResult[] }> {
        if (mainMode === 'add') {
            return await this.#rebalanceWorker.calculateAddRebalance(
                portfolioData,
                additionalInvestment
            );
        } else if (mainMode === 'simple') {
            return await this.#rebalanceWorker.calculateSimpleRebalance(
                portfolioData,
                additionalInvestment
            );
        } else {
            return await this.#rebalanceWorker.calculateSellRebalance(portfolioData);
        }
    }

    /**
     * @description Generate results HTML based on mode
     */
    private generateResultsHTML(
        mainMode: 'add' | 'sell' | 'simple',
        rebalancingResults: RebalancingResults,
        currentTotal: Decimal,
        additionalInvestment: Decimal,
        currency: 'krw' | 'usd',
        tradingFeeRate: number,
        taxRate: number
    ): string {
        const totals = {
            currentTotal,
            additionalInvestment,
            finalTotal: currentTotal.plus(additionalInvestment),
        };

        if (mainMode === 'add') {
            return generateAddModeResultsHTML(
                rebalancingResults.results,
                totals,
                currency,
                tradingFeeRate,
                taxRate
            );
        } else if (mainMode === 'simple') {
            return generateSimpleModeResultsHTML(rebalancingResults.results, totals, currency);
        } else {
            return generateSellModeResultsHTML(rebalancingResults.results, currency);
        }
    }

    /**
     * @description Prepare chart data and title
     */
    private prepareChartData(
        rebalancingResults: RebalancingResults,
        mainMode: 'add' | 'sell' | 'simple'
    ): { labels: string[]; data: number[]; title: string } {
        const labels = rebalancingResults.results.map((r) => r.stock.name);
        const data = rebalancingResults.results.map((r) => {
            const ratio =
                r.stock.targetRatio instanceof Decimal
                    ? r.stock.targetRatio
                    : new Decimal(r.stock.targetRatio ?? 0);
            return ratio.toNumber();
        });

        const titleMap = {
            simple: '포트폴리오 목표 비율 (간단 계산 모드)',
            add: '포트폴리오 목표 비율 (추가 매수 모드)',
            sell: '포트폴리오 목표 비율 (매도 리밸런싱 모드)',
        };

        return { labels, data, title: titleMap[mainMode] };
    }

    /**
     * @description Execute rebalancing calculation
     */
    async handleCalculate(): Promise<void> {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) return;

        const additionalInvestment = this.#getInvestmentAmountInKRW();

        // Validate inputs
        const isValid = await this.validateCalculationInputs(
            activePortfolio.portfolioData,
            activePortfolio.settings.mainMode,
            additionalInvestment
        );
        if (!isValid) return;

        // Calculate portfolio state
        const calculatedState = Calculator.calculatePortfolioState({
            portfolioData: activePortfolio.portfolioData,
            exchangeRate: activePortfolio.settings.exchangeRate,
            currentCurrency: activePortfolio.settings.currentCurrency,
        });
        activePortfolio.portfolioData = calculatedState.portfolioData;

        // 병렬 처리: Snapshot 저장(non-critical) + Chart 로드(critical)
        // Chart는 필수이므로 결과 확인, Snapshot 실패는 무시
        const [ChartClass] = await Promise.allSettled([
            ChartLoaderService.getChart(),
            this.savePortfolioSnapshot(
                activePortfolio.id,
                calculatedState.portfolioData,
                activePortfolio.settings.exchangeRate,
                activePortfolio.settings.currentCurrency
            ),
        ]).then((results) => {
            // Chart 로드 실패는 throw (필수 리소스)
            if (results[0].status === 'rejected') {
                throw results[0].reason;
            }
            // Snapshot 저장 실패는 무시 (non-critical)
            return [results[0].value];
        });

        // Execute rebalancing calculation with Worker (with progress indicator)
        const rebalancingResults = await this.#progressIndicator.withProgress(async () => {
            return await this.executeRebalancingStrategy(
                activePortfolio.settings.mainMode,
                calculatedState.portfolioData,
                additionalInvestment
            );
        });

        // Generate and display results
        const resultsHTML = this.generateResultsHTML(
            activePortfolio.settings.mainMode,
            rebalancingResults,
            calculatedState.currentTotal,
            additionalInvestment,
            activePortfolio.settings.currentCurrency,
            activePortfolio.settings.tradingFeeRate,
            activePortfolio.settings.taxRate
        );
        this.#view.displayResults(resultsHTML);

        // Prepare and display chart (Chart 이미 로드됨)
        const chartData = this.prepareChartData(
            rebalancingResults,
            activePortfolio.settings.mainMode
        );
        this.#view.displayChart(ChartClass, chartData.labels, chartData.data, chartData.title);

        this.#debouncedSave();
        this.#view.showToast(t('toast.calculateSuccess'), 'success');
    }

    /**
     * @description Fetch all stock prices
     */
    async handleFetchAllPrices(): Promise<{ needsUIUpdate: boolean }> {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio || activePortfolio.portfolioData.length === 0) {
            this.#view.showToast(t('api.noUpdates'), 'info');
            return { needsUIUpdate: false };
        }

        const tickersToFetch = activePortfolio.portfolioData
            .filter((s) => s.ticker && s.ticker.trim() !== '')
            .map((s) => ({ id: s.id, ticker: s.ticker.trim() }));

        if (tickersToFetch.length === 0) {
            this.#view.showToast(t('toast.noTickersToFetch'), 'info');
            return { needsUIUpdate: false };
        }

        this.#view.toggleFetchButton(true);

        try {
            let successCount = 0;
            let failureCount = 0;
            const failedTickers: string[] = [];

            const results = await apiService.fetchAllStockPrices(tickersToFetch);

            const exchangeRate =
                activePortfolio.settings.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;
            const currentCurrency = activePortfolio.settings.currentCurrency || 'krw';

            results.forEach((result: FetchStockResult) => {
                if (result.status === 'fulfilled' && result.value) {
                    let price = result.value;

                    if (currentCurrency === 'krw') {
                        const priceDec = new Decimal(price);
                        const exchangeRateDec = new Decimal(exchangeRate);
                        price = priceDec.times(exchangeRateDec).toNumber();
                    }

                    this.#state.updateStockProperty(result.id, 'currentPrice', price);
                    this.#view.updateCurrentPriceInput(result.id, price.toFixed(2));
                    successCount++;
                } else {
                    failureCount++;
                    failedTickers.push(result.ticker);
                    logger.error(
                        `Failed to fetch price for ${result.ticker}`,
                        'CalculationManager',
                        result.reason
                    );
                }
            });

            Calculator.clearPortfolioStateCache();

            if (successCount === tickersToFetch.length) {
                this.#view.showToast(t('api.fetchSuccessAll', { count: successCount }), 'success');
            } else if (successCount > 0) {
                this.#view.showToast(
                    t('api.fetchSuccessPartial', { count: successCount, failed: failureCount }),
                    'warning'
                );
            } else {
                this.#view.showToast(t('api.fetchFailedAll', { failed: failureCount }), 'error');
            }

            if (failedTickers.length > 0) {
                logger.warn(`Failed tickers: ${failedTickers.join(', ')}`, 'CalculationManager');
            }

            return { needsUIUpdate: true };
        } catch (error) {
            // Enhanced error handling with APIError
            if (error instanceof APIError) {
                const userMessage = formatAPIError(error);
                this.#view.showToast(userMessage, 'error');
                logger.error(`${error.type}: ${error.message}`, 'CalculationManager');
            } else {
                logger.error('Failed to fetch all prices', 'CalculationManager.handleFetchAllPrices', error);
                this.#view.showToast(
                    t('api.fetchErrorGlobal', { message: (error as Error).message }),
                    'error'
                );
            }
            return { needsUIUpdate: false };
        } finally {
            this.#view.toggleFetchButton(false);
        }
    }

    /**
     * @description Change main mode
     * @param newMode - New main mode
     */
    async handleMainModeChange(newMode: MainMode): Promise<{ needsFullRender: boolean }> {
        if (newMode !== 'add' && newMode !== 'sell' && newMode !== 'simple')
            return { needsFullRender: false };

        await this.#state.updatePortfolioSettings('mainMode', newMode);

        requestAnimationFrame(() => {
            const modeName =
                newMode === 'add'
                    ? t('ui.addMode')
                    : newMode === 'simple'
                      ? '간단 계산 모드'
                      : t('ui.sellMode');
            this.#view.showToast(t('toast.modeChanged', { mode: modeName }), 'info');
        });

        return { needsFullRender: true };
    }

    /**
     * @description Change currency mode
     * @param newCurrency - New currency mode
     */
    async handleCurrencyModeChange(newCurrency: Currency): Promise<{ needsFullRender: boolean }> {
        if (newCurrency !== 'krw' && newCurrency !== 'usd') return { needsFullRender: false };

        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) return { needsFullRender: false };

        await this.#state.updatePortfolioSettings('currentCurrency', newCurrency);
        Calculator.clearPortfolioStateCache();
        this.#view.showToast(
            t('toast.currencyChanged', { currency: newCurrency.toUpperCase() }),
            'info'
        );

        return { needsFullRender: true };
    }

    /**
     * @description Convert currency
     * @param source - Conversion source ('krw' or 'usd')
     */
    async handleCurrencyConversion(source: 'krw' | 'usd'): Promise<void> {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) return;

        const { additionalAmountInput, additionalAmountUSDInput, exchangeRateInput } =
            this.#view.dom;

        if (
            !isInputElement(additionalAmountInput) ||
            !isInputElement(additionalAmountUSDInput) ||
            !isInputElement(exchangeRateInput)
        )
            return;

        const exchangeRateNum = Number(exchangeRateInput.value) || CONFIG.DEFAULT_EXCHANGE_RATE;
        const isValidRate = exchangeRateNum > 0;
        let currentExchangeRate = CONFIG.DEFAULT_EXCHANGE_RATE;

        if (isValidRate) {
            await this.#state.updatePortfolioSettings('exchangeRate', exchangeRateNum);
            currentExchangeRate = exchangeRateNum;
        } else {
            await this.#state.updatePortfolioSettings('exchangeRate', CONFIG.DEFAULT_EXCHANGE_RATE);
            exchangeRateInput.value = CONFIG.DEFAULT_EXCHANGE_RATE.toString();
            this.#view.showToast(t('toast.invalidExchangeRate'), 'error');
        }

        const currentExchangeRateDec = new Decimal(currentExchangeRate);

        let krwAmountDec = new Decimal(0);
        let usdAmountDec = new Decimal(0);

        try {
            if (source === 'krw') {
                krwAmountDec = new Decimal(additionalAmountInput.value || 0);
                if (krwAmountDec.isNegative()) throw new Error('Negative KRW input');
                usdAmountDec = currentExchangeRateDec.isZero()
                    ? new Decimal(0)
                    : krwAmountDec.div(currentExchangeRateDec);
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

            this.#debouncedSave();
        } catch (error) {
            logger.error('Currency conversion failed', 'CalculationManager.convertCurrency', error);
            this.#view.showToast(t('toast.amountInputError'), 'error');
            if (source === 'krw') additionalAmountUSDInput.value = '';
            else additionalAmountInput.value = '';
        }
    }

    /**
     * @description Change portfolio exchange rate
     * @param rate - Exchange rate
     */
    async handlePortfolioExchangeRateChange(rate: number): Promise<void> {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) return;

        const exchangeRateNum = Number(rate);
        const isValidRate = !isNaN(exchangeRateNum) && exchangeRateNum > 0;

        if (isValidRate) {
            await this.#state.updatePortfolioSettings('exchangeRate', exchangeRateNum);
            this.#debouncedSave();
        } else {
            await this.#state.updatePortfolioSettings('exchangeRate', CONFIG.DEFAULT_EXCHANGE_RATE);
            this.#view.showToast(t('toast.invalidExchangeRate'), 'error');
        }
    }

    /**
     * @description Normalize ratios
     */
    handleNormalizeRatios(): void {
        try {
            const success = this.#state.normalizeRatios();
            if (!success) {
                this.#view.showToast(t('toast.noRatiosToNormalize'), 'info');
                return;
            }

            const activePortfolio = this.#state.getActivePortfolio();
            if (!activePortfolio) return;

            this.#view.updateAllTargetRatioInputs(activePortfolio.portfolioData);
            const sum = getRatioSum(activePortfolio.portfolioData);
            this.#view.updateRatioSum(sum.toNumber());
            this.#debouncedSave();
            this.#view.showToast(t('toast.ratiosNormalized'), 'success');
        } catch (error) {
            logger.error('Failed to normalize ratios', 'CalculationManager.handleNormalizeRatios', error);
            this.#view.showToast(t('toast.normalizeRatiosError'), 'error');
        }
    }
}
