// src/view/AdvancedAnalysisRenderer.ts
import type {
    TaxLotAnalysis,
    TaxOptimizedSale,
    PortfolioTransactionSummary,
    DOMElements,
} from '../types';
import { CSS_CLASSES } from '../constants';
import { escapeHTML, formatCurrency } from '../utils';

/**
 * @class AdvancedAnalysisRenderer
 * @description Tax-Lot Accounting 및 거래 내역 분석 렌더러 (Phase 4.15 & 4.16)
 */
export class AdvancedAnalysisRenderer {
    #dom: DOMElements;

    constructor(dom: DOMElements) {
        this.#dom = dom;
    }

    /**
     * @description Update DOM reference
     * @param dom - New DOM reference
     */
    setDom(dom: DOMElements): void {
        this.#dom = dom;
    }

    /**
     * @description Tax Lot 분석 표시
     * @param analyses - Tax Lot 분석 배열
     * @param currency - Currency mode
     */
    displayTaxLotAnalysis(analyses: TaxLotAnalysis[], currency: 'krw' | 'usd'): void {
        const container = this.#dom.taxLotAnalysisContainer;
        if (!container) return;

        const currencySymbol = currency === 'krw' ? '₩' : '$';

        let html = '<div class="tax-lot-analysis-wrapper">';

        analyses.forEach((analysis) => {
            const totalValue = analysis.currentPrice.times(analysis.totalQuantity);
            const unrealizedGain = analysis.unrealizedGain.toNumber();
            const gainClass = unrealizedGain >= 0 ? 'positive' : 'negative';

            html += `
                <div class="tax-lot-stock-card card mb-4">
                    <h3>${escapeHTML(analysis.ticker)} - ${escapeHTML(analysis.name)}</h3>
                    <div class="tax-lot-summary">
                        <div class="summary-item">
                            <span class="label">총 보유 수량:</span>
                            <span class="value">${analysis.totalQuantity.toFixed(2)}</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">평균 단가:</span>
                            <span class="value">${currencySymbol}${analysis.averageCostBasis.toFixed(2)}</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">현재가:</span>
                            <span class="value">${currencySymbol}${analysis.currentPrice.toFixed(2)}</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">미실현 손익:</span>
                            <span class="value ${gainClass}">${currencySymbol}${Math.abs(unrealizedGain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${analysis.unrealizedGainPercent.toFixed(2)}%)</span>
                        </div>
                    </div>
                    <h4>Tax Lots (${analysis.method})</h4>
                    <table class="tax-lot-table">
                        <thead>
                            <tr>
                                <th>매수 날짜</th>
                                <th>원래 수량</th>
                                <th>남은 수량</th>
                                <th>매수 단가</th>
                                <th>현재 가치</th>
                                <th>손익</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            analysis.lots.forEach((lot) => {
                const lotValue = analysis.currentPrice.times(lot.remainingQuantity);
                const lotCost = lot.price.times(lot.remainingQuantity);
                const lotGain = lotValue.minus(lotCost);
                const lotGainClass = lotGain.toNumber() >= 0 ? 'positive' : 'negative';

                html += `
                    <tr>
                        <td>${lot.date}</td>
                        <td>${lot.originalQuantity.toFixed(2)}</td>
                        <td>${lot.remainingQuantity.toFixed(2)}</td>
                        <td>${currencySymbol}${lot.price.toFixed(2)}</td>
                        <td>${currencySymbol}${lotValue.toFixed(2)}</td>
                        <td class="${lotGainClass}">${currencySymbol}${Math.abs(lotGain.toNumber()).toFixed(2)}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    /**
     * @description 세금 최적화 매도 전략 표시
     * @param optimizedSale - 최적화된 매도 전략
     * @param currency - Currency mode
     */
    displayTaxOptimizedSale(optimizedSale: TaxOptimizedSale, currency: 'krw' | 'usd'): void {
        const container = this.#dom.taxOptimizedSaleContainer;
        if (!container) return;

        const currencySymbol = currency === 'krw' ? '₩' : '$';

        let html = `
            <div class="tax-optimized-sale-wrapper card">
                <h3>💡 세금 최적화 매도 전략</h3>
                <div class="tax-summary">
                    <p><strong>종목:</strong> ${escapeHTML(optimizedSale.ticker)}</p>
                    <p><strong>매도 수량:</strong> ${optimizedSale.quantityToSell.toFixed(2)}</p>
                    <p><strong>추천 방법:</strong> <span class="badge">${optimizedSale.method}</span></p>
                    <p><strong>총 양도 차익:</strong> <span class="${optimizedSale.totalCapitalGain.toNumber() >= 0 ? 'positive' : 'negative'}">${currencySymbol}${Math.abs(optimizedSale.totalCapitalGain.toNumber()).toFixed(2)}</span></p>
                    <p><strong>예상 세금:</strong> <span class="text-danger">${currencySymbol}${optimizedSale.totalTax.toFixed(2)}</span></p>
                    <p><strong>실효 세율:</strong> ${optimizedSale.effectiveTaxRate.toFixed(2)}%</p>
                </div>

                <h4>차익 분류</h4>
                <div class="gain-breakdown">
                    <div class="gain-item">
                        <span class="label">단기 차익:</span>
                        <span class="value">${currencySymbol}${optimizedSale.shortTermGain.toFixed(2)}</span>
                    </div>
                    <div class="gain-item">
                        <span class="label">장기 차익:</span>
                        <span class="value">${currencySymbol}${optimizedSale.longTermGain.toFixed(2)}</span>
                    </div>
                </div>

                <h4>매도 상세 내역</h4>
                <table class="sale-detail-table">
                    <thead>
                        <tr>
                            <th>매수 날짜</th>
                            <th>매수 단가</th>
                            <th>매도 수량</th>
                            <th>매도 단가</th>
                            <th>차익</th>
                            <th>보유 기간</th>
                            <th>구분</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        optimizedSale.estimatedSales.forEach((sale) => {
            const gainClass = sale.capitalGain.toNumber() >= 0 ? 'positive' : 'negative';
            html += `
                <tr>
                    <td>${sale.purchaseDate}</td>
                    <td>${currencySymbol}${sale.purchasePrice.toFixed(2)}</td>
                    <td>${sale.quantity.toFixed(2)}</td>
                    <td>${currencySymbol}${sale.salePrice.toFixed(2)}</td>
                    <td class="${gainClass}">${currencySymbol}${Math.abs(sale.capitalGain.toNumber()).toFixed(2)}</td>
                    <td>${sale.holdingPeriodDays}일</td>
                    <td><span class="badge ${sale.isLongTerm ? 'badge-success' : 'badge-warning'}">${sale.isLongTerm ? '장기' : '단기'}</span></td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * @description 포트폴리오 거래 내역 요약 표시
     * @param summary - 거래 내역 요약
     * @param currency - Currency mode
     */
    displayTransactionSummary(summary: PortfolioTransactionSummary, currency: 'krw' | 'usd'): void {
        const container = this.#dom.transactionSummaryContainer;
        if (!container) return;

        const currencySymbol = currency === 'krw' ? '₩' : '$';

        let html = `
            <div class="transaction-summary-wrapper">
                <div class="summary-cards">
                    <div class="summary-card">
                        <h3>총 매수 금액</h3>
                        <p class="amount-large">${currencySymbol}${summary.totalBuyAmount.toNumber().toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </div>
                    <div class="summary-card">
                        <h3>총 매도 금액</h3>
                        <p class="amount-large">${currencySymbol}${summary.totalSellAmount.toNumber().toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </div>
                    <div class="summary-card">
                        <h3>총 배당금</h3>
                        <p class="amount-large">${currencySymbol}${summary.totalDividends.toNumber().toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </div>
                    <div class="summary-card">
                        <h3>총 거래 비용</h3>
                        <p class="amount-large text-danger">${currencySymbol}${summary.totalTradingCosts.toNumber().toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </div>
                    <div class="summary-card">
                        <h3>순현금흐름</h3>
                        <p class="amount-large ${summary.netCashFlow.toNumber() >= 0 ? 'positive' : 'negative'}">${currencySymbol}${Math.abs(summary.netCashFlow.toNumber()).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </div>
                    <div class="summary-card">
                        <h3>총 거래 수</h3>
                        <p class="amount-large">${summary.totalTransactions}</p>
                    </div>
                </div>

                <h3 class="mt-4">종목별 거래 분석</h3>
                <table class="transaction-analysis-table">
                    <thead>
                        <tr>
                            <th>종목</th>
                            <th>매수 횟수</th>
                            <th>매도 횟수</th>
                            <th>평균 매수가</th>
                            <th>평균 매도가</th>
                            <th>거래 빈도</th>
                            <th>거래 비용</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        summary.stockAnalyses.forEach((analysis) => {
            const costInfo = summary.tradingCostByStock.find((c) => c.stockId === analysis.stockId);
            const tradingCost = costInfo ? costInfo.tradingCost : new Decimal(0);

            html += `
                <tr>
                    <td><strong>${escapeHTML(analysis.ticker)}</strong></td>
                    <td>${analysis.buyCount}</td>
                    <td>${analysis.sellCount}</td>
                    <td>${currencySymbol}${analysis.avgBuyPrice.toFixed(2)}</td>
                    <td>${analysis.sellCount > 0 ? `${currencySymbol}${analysis.avgSellPrice.toFixed(2)}` : '-'}</td>
                    <td>${analysis.tradingFrequency.toFixed(2)} 회/월</td>
                    <td>${currencySymbol}${tradingCost.toFixed(2)}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * @description Hide all advanced analysis views
     */
    hideAllViews(): void {
        const taxLotSection = this.#dom.taxLotSection;
        const transactionAnalysisSection = this.#dom.transactionAnalysisSection;

        if (taxLotSection) taxLotSection.classList.add(CSS_CLASSES.HIDDEN);
        if (transactionAnalysisSection) transactionAnalysisSection.classList.add(CSS_CLASSES.HIDDEN);
    }

    /**
     * @description Show tax lot section
     */
    showTaxLotSection(): void {
        const section = this.#dom.taxLotSection;
        if (section) section.classList.remove(CSS_CLASSES.HIDDEN);
    }

    /**
     * @description Show transaction analysis section
     */
    showTransactionAnalysisSection(): void {
        const section = this.#dom.transactionAnalysisSection;
        if (section) section.classList.remove(CSS_CLASSES.HIDDEN);
    }
}
