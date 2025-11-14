// src/controller/CalculationManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { Calculator } from '../calculator';
import { Validator } from '../validator';
import { CONFIG } from '../constants';
import { ErrorService, ValidationError } from '../errorService';
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
} from '../calculationStrategies';
import { apiService, APIError, formatAPIError } from '../apiService';
import { SnapshotRepository } from '../state/SnapshotRepository';
import Decimal from 'decimal.js';
import type { MainMode, Currency } from '../types';
import { logger } from '../services/Logger';

/**
 * @class CalculationManager
 * @description 계산, API, 통화 변환 관리
 */
export class CalculationManager {
    constructor(
        private state: PortfolioState,
        private view: PortfolioView,
        private debouncedSave: () => void,
        private getInvestmentAmountInKRW: () => Decimal,
        private snapshotRepo: SnapshotRepository
    ) {}

    /**
     * @description 리밸런싱 계산 실행
     */
    async handleCalculate(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const additionalInvestment = this.getInvestmentAmountInKRW();

        const inputs = {
            mainMode: activePortfolio.settings.mainMode,
            portfolioData: activePortfolio.portfolioData,
            additionalInvestment: additionalInvestment,
        };

        const validationErrors = Validator.validateForCalculation(inputs);

        if (validationErrors.length > 0) {
            const errorMessages = validationErrors.map((err) => err.message).join('\n');
            ErrorService.handle(new ValidationError(errorMessages), 'handleCalculate - Validation');
            this.view.hideResults();
            return;
        }

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
            currentCurrency: activePortfolio.settings.currentCurrency,
        });
        activePortfolio.portfolioData = calculatedState.portfolioData;

        // Save portfolio snapshot
        try {
            const snapshot = Calculator.createSnapshot(
                activePortfolio.id,
                calculatedState.portfolioData,
                activePortfolio.settings.exchangeRate,
                activePortfolio.settings.currentCurrency
            );
            await this.snapshotRepo.add(snapshot);
            logger.info(`Snapshot saved: ${snapshot.date}`, 'CalculationManager');
        } catch (error) {
            // 스냅샷 저장 실패는 치명적이지 않으므로 계속 진행
            ErrorService.handle(error as Error, 'CalculationManager.saveSnapshot');
            // 사용자에게 알림 (선택적)
            // this.view.showToast('스냅샷 저장 실패. 계산은 정상적으로 완료되었습니다.', 'warning');
        }

        let strategy;
        if (activePortfolio.settings.mainMode === 'add') {
            strategy = new AddRebalanceStrategy(
                calculatedState.portfolioData,
                additionalInvestment
            );
        } else if (activePortfolio.settings.mainMode === 'simple') {
            strategy = new SimpleRatioStrategy(calculatedState.portfolioData, additionalInvestment);
        } else {
            strategy = new SellRebalanceStrategy(calculatedState.portfolioData);
        }
        const rebalancingResults = Calculator.calculateRebalancing(strategy);

        const resultsHTML =
            activePortfolio.settings.mainMode === 'add'
                ? generateAddModeResultsHTML(
                      rebalancingResults.results,
                      {
                          currentTotal: calculatedState.currentTotal,
                          additionalInvestment: additionalInvestment,
                          finalTotal: calculatedState.currentTotal.plus(additionalInvestment),
                      },
                      activePortfolio.settings.currentCurrency,
                      activePortfolio.settings.tradingFeeRate,
                      activePortfolio.settings.taxRate
                  )
                : activePortfolio.settings.mainMode === 'simple'
                  ? generateSimpleModeResultsHTML(
                        rebalancingResults.results,
                        {
                            currentTotal: calculatedState.currentTotal,
                            additionalInvestment: additionalInvestment,
                            finalTotal: calculatedState.currentTotal.plus(additionalInvestment),
                        },
                        activePortfolio.settings.currentCurrency
                    )
                  : generateSellModeResultsHTML(
                        rebalancingResults.results,
                        activePortfolio.settings.currentCurrency
                    );

        this.view.displayResults(resultsHTML);

        const chartLabels = rebalancingResults.results.map((r) => r.stock.name);
        const chartData = rebalancingResults.results.map((r) => {
            const ratio =
                r.stock.targetRatio instanceof Decimal
                    ? r.stock.targetRatio
                    : new Decimal(r.stock.targetRatio ?? 0);
            return ratio.toNumber();
        });
        const chartTitle =
            activePortfolio.settings.mainMode === 'simple'
                ? '포트폴리오 목표 비율 (간단 계산 모드)'
                : activePortfolio.settings.mainMode === 'add'
                  ? '포트폴리오 목표 비율 (추가 매수 모드)'
                  : '포트폴리오 목표 비율 (매도 리밸런싱 모드)';

        this.view.displayChart(
            await ChartLoaderService.getChart(),
            chartLabels,
            chartData,
            chartTitle
        );

        this.debouncedSave();
        this.view.showToast(t('toast.calculateSuccess'), 'success');
    }

    /**
     * @description 모든 주식 가격 가져오기
     */
    async handleFetchAllPrices(): Promise<{ needsUIUpdate: boolean }> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio || activePortfolio.portfolioData.length === 0) {
            this.view.showToast(t('api.noUpdates'), 'info');
            return { needsUIUpdate: false };
        }

        const tickersToFetch = activePortfolio.portfolioData
            .filter((s) => s.ticker && s.ticker.trim() !== '')
            .map((s) => ({ id: s.id, ticker: s.ticker.trim() }));

        if (tickersToFetch.length === 0) {
            this.view.showToast(t('toast.noTickersToFetch'), 'info');
            return { needsUIUpdate: false };
        }

        this.view.toggleFetchButton(true);

        try {
            let successCount = 0;
            let failureCount = 0;
            const failedTickers: string[] = [];

            const results = await apiService.fetchAllStockPrices(tickersToFetch);

            const exchangeRate =
                activePortfolio.settings.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;
            const currentCurrency = activePortfolio.settings.currentCurrency || 'krw';

            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value) {
                    let price = result.value;

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
                    logger.error(
                        `Failed to fetch price for ${(result as any).ticker}`,
                        'CalculationManager',
                        (result as any).reason
                    );
                }
            });

            Calculator.clearPortfolioStateCache();

            if (successCount === tickersToFetch.length) {
                this.view.showToast(t('api.fetchSuccessAll', { count: successCount }), 'success');
            } else if (successCount > 0) {
                this.view.showToast(
                    t('api.fetchSuccessPartial', { count: successCount, failed: failureCount }),
                    'warning'
                );
            } else {
                this.view.showToast(t('api.fetchFailedAll', { failed: failureCount }), 'error');
            }

            if (failedTickers.length > 0) {
                logger.warn(`Failed tickers: ${failedTickers.join(', ')}`, 'CalculationManager');
            }

            return { needsUIUpdate: true };
        } catch (error) {
            // Enhanced error handling with APIError
            if (error instanceof APIError) {
                const userMessage = formatAPIError(error);
                this.view.showToast(userMessage, 'error');
                logger.error(`${error.type}: ${error.message}`, 'CalculationManager');
            } else {
                ErrorService.handle(error as Error, 'handleFetchAllPrices');
                this.view.showToast(
                    t('api.fetchErrorGlobal', { message: (error as Error).message }),
                    'error'
                );
            }
            return { needsUIUpdate: false };
        } finally {
            this.view.toggleFetchButton(false);
        }
    }

    /**
     * @description 메인 모드 변경
     * @param newMode - 새 메인 모드
     */
    async handleMainModeChange(newMode: MainMode): Promise<{ needsFullRender: boolean }> {
        if (newMode !== 'add' && newMode !== 'sell' && newMode !== 'simple')
            return { needsFullRender: false };

        await this.state.updatePortfolioSettings('mainMode', newMode);

        requestAnimationFrame(() => {
            const modeName =
                newMode === 'add'
                    ? t('ui.addMode')
                    : newMode === 'simple'
                      ? '간단 계산 모드'
                      : t('ui.sellMode');
            this.view.showToast(t('toast.modeChanged', { mode: modeName }), 'info');
        });

        return { needsFullRender: true };
    }

    /**
     * @description 통화 모드 변경
     * @param newCurrency - 새 통화 모드
     */
    async handleCurrencyModeChange(newCurrency: Currency): Promise<{ needsFullRender: boolean }> {
        if (newCurrency !== 'krw' && newCurrency !== 'usd') return { needsFullRender: false };

        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return { needsFullRender: false };

        await this.state.updatePortfolioSettings('currentCurrency', newCurrency);
        Calculator.clearPortfolioStateCache();
        this.view.showToast(
            t('toast.currencyChanged', { currency: newCurrency.toUpperCase() }),
            'info'
        );

        return { needsFullRender: true };
    }

    /**
     * @description 통화 변환
     * @param source - 변환 소스 ('krw' 또는 'usd')
     */
    async handleCurrencyConversion(source: 'krw' | 'usd'): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const { additionalAmountInput, additionalAmountUSDInput, exchangeRateInput } =
            this.view.dom;

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
            await this.state.updatePortfolioSettings('exchangeRate', exchangeRateNum);
            currentExchangeRate = exchangeRateNum;
        } else {
            await this.state.updatePortfolioSettings('exchangeRate', CONFIG.DEFAULT_EXCHANGE_RATE);
            exchangeRateInput.value = CONFIG.DEFAULT_EXCHANGE_RATE.toString();
            this.view.showToast(t('toast.invalidExchangeRate'), 'error');
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

            this.debouncedSave();
        } catch (e) {
            ErrorService.handle(e as Error, 'CalculationManager.convertCurrency');
            this.view.showToast(t('toast.amountInputError'), 'error');
            if (source === 'krw') additionalAmountUSDInput.value = '';
            else additionalAmountInput.value = '';
        }
    }

    /**
     * @description 포트폴리오 환율 변경
     * @param rate - 환율
     */
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
            this.view.showToast(t('toast.invalidExchangeRate'), 'error');
        }
    }

    /**
     * @description 비율 정규화
     */
    handleNormalizeRatios(): void {
        try {
            const success = this.state.normalizeRatios();
            if (!success) {
                this.view.showToast(t('toast.noRatiosToNormalize'), 'info');
                return;
            }

            const activePortfolio = this.state.getActivePortfolio();
            if (!activePortfolio) return;

            this.view.updateAllTargetRatioInputs(activePortfolio.portfolioData);
            const sum = getRatioSum(activePortfolio.portfolioData);
            this.view.updateRatioSum(sum.toNumber());
            this.debouncedSave();
            this.view.showToast(t('toast.ratiosNormalized'), 'success');
        } catch (error) {
            ErrorService.handle(error as Error, 'handleNormalizeRatios');
            this.view.showToast(t('toast.normalizeRatiosError'), 'error');
        }
    }
}
