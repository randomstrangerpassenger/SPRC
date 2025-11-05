// js/templates.ts
import { escapeHTML, formatCurrency } from './utils.ts';
import { CONFIG } from './constants.ts';
import { t } from './i18n.ts';
import Decimal from 'decimal.js';
import type { CalculatedStock, Currency } from './types.ts';

// Add mode result stock type
export interface AddModeResultStock extends CalculatedStock {
    currentRatio: Decimal;
    finalBuyAmount: Decimal;
    buyRatio: Decimal;
}

// Sell mode result stock type
export interface SellModeResultStock extends CalculatedStock {
    currentRatio: number;
    targetRatioNum: number;
    adjustment: Decimal;
}

// Summary type for add mode results
export interface AddModeSummary {
    currentTotal: Decimal;
    additionalInvestment: Decimal;
    finalTotal: Decimal;
}

// Sector analysis data type
export interface SectorData {
    sector: string;
    amount: Decimal;
    percentage: Decimal;
}

/**
 * @description '추가 매수' 모드의 계산 결과를 표시할 HTML 문자열을 생성합니다.
 * @param results - 계산 결과 배열
 * @param summary - 요약 정보 객체
 * @param currency - 현재 통화 ('krw' or 'usd')
 * @returns 생성된 HTML 문자열
 */
export function generateAddModeResultsHTML(
    results: AddModeResultStock[],
    summary: AddModeSummary,
    currency: Currency
): string {
    if (!results) return ''; // Null check for results

    const sortedResults = [...results].sort((a, b) => {
        // Ensure finalBuyAmount exists before comparing
        const amountA = a.finalBuyAmount ?? new Decimal(0);
        const amountB = b.finalBuyAmount ?? new Decimal(0);
        return amountB.comparedTo(amountA);
    });
    const resultsRows = sortedResults
        .map((stock, index) => {
            // Ensure calculated exists
            const metrics = stock.calculated ?? {
                profitLoss: new Decimal(0),
                profitLossRate: new Decimal(0),
            };
            const { profitLoss, profitLossRate } = metrics;
            const profitClass = profitLoss.isNegative() ? 'text-sell' : 'text-buy';
            const profitSign = profitLoss.isPositive() ? '+' : '';

            // Ensure ratios exist and handle potential NaN/Infinity from division
            const currentRatioVal = stock.currentRatio?.isFinite()
                ? stock.currentRatio.toFixed(1)
                : 'N/A';
            const targetRatioVal =
                typeof stock.targetRatio === 'number'
                    ? stock.targetRatio.toFixed(1)
                    : 'N/A';
            const profitLossRateVal = profitLossRate?.isFinite()
                ? profitLossRate.toFixed(2)
                : 'N/A';
            const finalBuyAmountVal = stock.finalBuyAmount ?? new Decimal(0);

            return `
            <tr class="result-row-highlight" data-delay="${index * 0.05}s">
                <td><strong>${escapeHTML(stock.name)}</strong><br><span class="ticker">${escapeHTML(stock.ticker)}</span></td>
                <td style="text-align: center;">${currentRatioVal}%</td>
                <td style="text-align: center;"><strong>${targetRatioVal}%</strong></td>
                <td style="text-align: right;">
                    <div class="${profitClass}">
                        ${profitSign}${profitLossRateVal}%
                    </div>
                </td>
                <td style="text-align: right;"><div class="text-buy">${formatCurrency(finalBuyAmountVal, currency)}</div></td>
            </tr>
        `;
        })
        .join('');

    // Filter buyable stocks using Decimal comparison method
    const buyableStocks = sortedResults.filter(
        (s) => s.finalBuyAmount && s.finalBuyAmount.greaterThan(CONFIG.MIN_BUYABLE_AMOUNT) // Use greaterThan()
    );
    const guideContent =
        buyableStocks.length > 0
            ? buyableStocks
                  .map((s, i) => {
                      const buyRatioVal = s.buyRatio?.isFinite()
                          ? s.buyRatio.toFixed(1)
                          : 'N/A';
                      return `
                <div class="guide-item">
                    <div><strong>${i + 1}. ${escapeHTML(s.ticker)}</strong> (${escapeHTML(s.name)}): ${formatCurrency(s.finalBuyAmount, currency)}</div>
                    <span style="font-weight: bold;">(${buyRatioVal}%)</span>
                </div>`;
                  })
                  .join('')
            : `<p style="text-align: center;">${t('template.noItemsToBuy')}</p>`;

    return `
        <div class="summary-grid">
            <div class="summary-item summary-item--current"><h3>${t('template.currentTotalAsset')}</h3><div class="amount">${formatCurrency(summary?.currentTotal, currency)}</div></div>
            <div class="summary-item summary-item--additional"><h3>${t('template.additionalInvestment')}</h3><div class="amount">${formatCurrency(summary?.additionalInvestment, currency)}</div></div>
            <div class="summary-item summary-item--final"><h3>${t('template.finalTotalAsset')}</h3><div class="amount">${formatCurrency(summary?.finalTotal, currency)}</div></div>
        </div>
        <div class="card">
            <h2>${t('template.addModeGuideTitle')}</h2>
            <div class="table-responsive">
                <table>
                    <thead><tr>
                        <th>${t('template.stock')}</th>
                        <th>${t('template.currentRatio')}</th>
                        <th>${t('template.targetRatio')}</th>
                        <th>${t('template.profitRate')}</th>
                        <th>${t('template.buyRecommendation')}</th>
                    </tr></thead>
                    <tbody>${resultsRows}</tbody>
                </table>
            </div>
            <div class="guide-box guide-box--buy"><h3>${t('template.buyGuideTitle')}</h3>${guideContent}</div>
        </div>`;
}

/**
 * @description '간단 계산' 모드의 계산 결과를 표시할 HTML 문자열을 생성합니다.
 * @param results - 계산 결과 배열
 * @param summary - 요약 정보 객체
 * @param currency - 현재 통화 ('krw' or 'usd')
 * @returns 생성된 HTML 문자열
 */
export function generateSimpleModeResultsHTML(
    results: AddModeResultStock[],
    summary: AddModeSummary,
    currency: Currency
): string {
    if (!results) return '';

    const sortedResults = [...results].sort((a, b) => {
        const ratioA = a.currentRatio ?? new Decimal(0);
        const ratioB = b.currentRatio ?? new Decimal(0);
        return ratioB.comparedTo(ratioA);
    });

    const resultsRows = sortedResults
        .map((stock, index) => {
            const metrics = stock.calculated ?? { currentAmount: new Decimal(0) };
            const currentAmount =
                metrics.currentAmount instanceof Decimal
                    ? metrics.currentAmount
                    : new Decimal(metrics.currentAmount ?? 0);

            const currentRatioVal = stock.currentRatio?.isFinite()
                ? stock.currentRatio.toFixed(1)
                : '0.0';
            const targetRatioVal =
                typeof stock.targetRatio === 'number'
                    ? stock.targetRatio.toFixed(1)
                    : (stock.targetRatio?.toFixed(1) ?? '0.0');
            const finalBuyAmountVal = stock.finalBuyAmount ?? new Decimal(0);

            return `
            <tr class="result-row-highlight" data-delay="${index * 0.05}s">
                <td><strong>${escapeHTML(stock.name)}</strong><br><span class="ticker">${escapeHTML(stock.ticker)}</span></td>
                <td style="text-align: right;">${formatCurrency(currentAmount, currency)}</td>
                <td style="text-align: center;">${currentRatioVal}%</td>
                <td style="text-align: center;"><strong>${targetRatioVal}%</strong></td>
                <td style="text-align: right;"><div class="text-buy">${formatCurrency(finalBuyAmountVal, currency)}</div></td>
            </tr>
        `;
        })
        .join('');

    const buyableStocks = sortedResults.filter(
        (s) => s.finalBuyAmount && s.finalBuyAmount.greaterThan(CONFIG.MIN_BUYABLE_AMOUNT)
    );

    const guideContent =
        buyableStocks.length > 0
            ? buyableStocks
                  .map((s, i) => {
                      const currentRatioVal = s.currentRatio?.isFinite()
                          ? s.currentRatio.toFixed(1)
                          : '0.0';
                      return `
                <div class="guide-item">
                    <div><strong>${i + 1}. ${escapeHTML(s.ticker)}</strong> (${escapeHTML(s.name)}): ${formatCurrency(s.finalBuyAmount, currency)}</div>
                    <span style="font-weight: bold; color: #666;">(현재 비율: ${currentRatioVal}%)</span>
                </div>`;
                  })
                  .join('')
            : `<p style="text-align: center;">${t('template.noItemsToBuy')}</p>`;

    return `
        <div class="summary-grid">
            <div class="summary-item summary-item--current"><h3>${t('template.currentTotalAsset')}</h3><div class="amount">${formatCurrency(summary?.currentTotal, currency)}</div></div>
            <div class="summary-item summary-item--additional"><h3>${t('template.additionalInvestment')}</h3><div class="amount">${formatCurrency(summary?.additionalInvestment, currency)}</div></div>
            <div class="summary-item summary-item--final"><h3>${t('template.finalTotalAsset')}</h3><div class="amount">${formatCurrency(summary?.finalTotal, currency)}</div></div>
        </div>
        <div class="card">
            <h2>🎯 간단 계산 결과</h2>
            <p style="margin-bottom: 15px; color: #666; font-size: 1.05em;">
                <strong>목표 비율에 맞춰</strong> 추가 투자금을 배분합니다.<br>
                거래 내역 없이 간단하게 현재 보유 금액만 입력하여 리밸런싱할 수 있습니다.
            </p>
            <div class="table-responsive">
                <table>
                    <thead><tr>
                        <th>${t('template.stock')}</th>
                        <th>현재 평가액</th>
                        <th>현재 비율</th>
                        <th>목표 비율</th>
                        <th>추가 구매 금액</th>
                    </tr></thead>
                    <tbody>${resultsRows}</tbody>
                </table>
            </div>
            <div class="guide-box guide-box--buy">
                <h3>💰 추가 구매 가이드</h3>
                <p style="margin-bottom: 10px; color: #666;">목표 비율에 맞추기 위해 다음과 같이 구매하세요:</p>
                ${guideContent}
            </div>
        </div>`;
}

/**
 * @description '매도 리밸런싱' 모드의 계산 결과를 표시할 HTML 문자열을 생성합니다.
 * @param results - 계산 결과 배열
 * @param currency - 현재 통화 ('krw' or 'usd')
 * @returns 생성된 HTML 문자열
 */
export function generateSellModeResultsHTML(
    results: SellModeResultStock[],
    currency: Currency
): string {
    if (!results) return ''; // Null check for results
    // Sort results safely checking for adjustment property
    const sortedResults = [...results].sort((a, b) => {
        const adjA = a.adjustment ?? new Decimal(0);
        const adjB = b.adjustment ?? new Decimal(0);
        return adjB.comparedTo(adjA);
    });

    const resultsRows = sortedResults
        .map((s, index) => {
            // Use default values if properties might be missing/NaN
            const currentRatioVal =
                typeof s.currentRatio === 'number' && isFinite(s.currentRatio)
                    ? s.currentRatio.toFixed(1)
                    : 'N/A';
            const targetRatioVal =
                typeof s.targetRatioNum === 'number' && isFinite(s.targetRatioNum)
                    ? s.targetRatioNum.toFixed(1)
                    : 'N/A';
            const adjustmentVal = s.adjustment ?? new Decimal(0);

            return `
            <tr class="result-row-highlight" data-delay="${index * 0.05}s">
                <td><strong>${escapeHTML(s.name)}</strong><br><span class="ticker">${escapeHTML(s.ticker)}</span></td>
                <td style="text-align: center;">${currentRatioVal}%</td>
                <td style="text-align: center;"><strong>${targetRatioVal}%</strong></td>
                <td style="text-align: right;">
                    <div class="${adjustmentVal.isPositive() ? 'text-sell' : 'text-buy'}">
                        ${adjustmentVal.isPositive() ? t('ui.sellWithIcon') : t('ui.buyWithIcon')}: ${formatCurrency(adjustmentVal.abs(), currency)}
                    </div>
                </td>
            </tr>`;
        })
        .join('');

    const totalSell = results.reduce((sum, s) => {
        return s.adjustment?.isPositive() ? sum.plus(s.adjustment) : sum;
    }, new Decimal(0));
    const stocksToSell = sortedResults.filter((s) => s.adjustment?.isPositive());
    const stocksToBuy = sortedResults.filter((s) => s.adjustment?.isNegative()); // isNegative includes zero implicitly, filter < 0 if needed

    const sellGuide =
        stocksToSell.length > 0
            ? stocksToSell
                  .map(
                      (s, i) =>
                          `<div class="guide-item"><strong>${i + 1}. ${escapeHTML(s.ticker)}</strong> (${escapeHTML(s.name)}): ${formatCurrency(s.adjustment, currency)} 매도</div>`
                  )
                  .join('')
            : `<p>${t('template.noItemsToSell')}</p>`;
    const buyGuide =
        stocksToBuy.length > 0
            ? stocksToBuy
                  .map(
                      (s, i) =>
                          `<div class="guide-item"><strong>${i + 1}. ${escapeHTML(s.ticker)}</strong> (${escapeHTML(s.name)}): ${formatCurrency(s.adjustment?.abs(), currency)} 매수</div>`
                  )
                  .join('')
            : `<p>${t('template.noItemsToBuy')}</p>`;

    return `
        <div class="summary-grid">
            <div class="summary-item summary-item--rebalance"><h3>${t('template.rebalancingTotal')}</h3><div class="amount">${formatCurrency(totalSell, currency)}</div></div>
        </div>
        <div class="card">
            <h2>${t('template.sellModeGuideTitle')}</h2>
            <div class="table-responsive">
                <table>
                    <thead><tr>
                        <th>${t('template.stock')}</th>
                        <th>${t('template.currentRatio')}</th>
                        <th>${t('template.targetRatio')}</th>
                        <th>${t('template.adjustmentAmount')}</th>
                    </tr></thead>
                    <tbody>${resultsRows}</tbody>
                </table>
            </div>
            <div class="guide-box guide-box--sell"><h3>${t('template.sellItemsTitle')}</h3>${sellGuide}</div>
            <div class="guide-box guide-box--buy"><h3>${t('template.buyItemsTitle')}</h3>${buyGuide}</div>
        </div>`;
}

/**
 * @description 섹터 분석 결과를 표시할 HTML 문자열을 생성합니다.
 * @param sectorData - 섹터 분석 결과 배열
 * @param currency - 현재 통화 ('krw' or 'usd')
 * @returns 생성된 HTML 문자열
 */
export function generateSectorAnalysisHTML(
    sectorData: SectorData[],
    currency: Currency
): string {
    if (!sectorData || sectorData.length === 0) {
        return '';
    }

    const rows = sectorData
        .map((data) => {
            // Ensure percentage is valid before formatting
            const percentageVal = data.percentage?.isFinite()
                ? data.percentage.toFixed(2)
                : 'N/A';
            return `
            <tr>
                <td>${escapeHTML(data.sector)}</td>
                <td style="text-align: right;">${formatCurrency(data.amount, currency)}</td>
                <td style="text-align: right;">${percentageVal}%</td>
            </tr>`;
        })
        .join('');

    return `
        <div class="card">
            <h2>${t('template.sectorAnalysisTitle')}</h2>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th scope="col">${t('template.sector')}</th>
                            <th scope="col">${t('template.amount')}</th>
                            <th scope="col">${t('template.ratio')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}