import { escapeHTML, formatCurrency } from './utils.js';
import { CONFIG } from './constants.js';
import Decimal from 'decimal.js';

export function generateAddModeResultsHTML(results, summary, currency) {
    const sortedResults = [...results].sort((a, b) => b.finalBuyAmount.comparedTo(a.finalBuyAmount));
    const resultsRows = sortedResults.map((stock, index) => `
        <tr class="result-row-highlight" data-delay="${index * 0.05}s">
            <td><strong>${escapeHTML(stock.name)}</strong><br><span class="ticker">${escapeHTML(stock.ticker)}</span></td>
            <td style="text-align: center;">${stock.currentRatio.toFixed(1)}%</td>
            <td style="text-align: center;"><strong>${stock.targetRatio.toFixed(1)}%</strong></td>
            <td style="text-align: right;"><div class="text-buy">${formatCurrency(stock.finalBuyAmount, currency)}</div></td>
            <td style="text-align: center;">${stock.buyRatio.toFixed(1)}%</td>
        </tr>
    `).join('');
    
    const buyableStocks = sortedResults.filter(s => s.finalBuyAmount.greaterThan(CONFIG.MIN_BUYABLE_AMOUNT));
    const guideContent = buyableStocks.length > 0 
        ? buyableStocks.map((s, i) => `
            <div class="guide-item">
                <div><strong>${i + 1}. ${escapeHTML(s.ticker)}</strong> (${escapeHTML(s.name)}): ${formatCurrency(s.finalBuyAmount, currency)}</div>
                <span style="font-weight: bold;">(${s.buyRatio.toFixed(1)}%)</span>
            </div>`).join('')
        : '<p style="text-align: center;">매수할 종목이 없습니다.</p>';

    return `
        <div class="summary-grid">
            <div class="summary-item summary-item--current"><h3>현재 총 자산</h3><div class="amount">${formatCurrency(summary.currentTotal, currency)}</div></div>
            <div class="summary-item summary-item--additional"><h3>추가 투자금</h3><div class="amount">${formatCurrency(summary.additionalInvestment, currency)}</div></div>
            <div class="summary-item summary-item--final"><h3>투자 후 총 자산</h3><div class="amount">${formatCurrency(summary.finalTotal, currency)}</div></div>
        </div>
        <div class="card">
            <h2>📈 추가 투자 배분 가이드 (매수 금액순 정렬)</h2>
            <div class="table-responsive">
                <table>
                    <thead><tr><th>종목</th><th>현재 비율</th><th>목표 비율</th><th>매수 추천 금액</th><th>투자금 중 비율</th></tr></thead>
                    <tbody>${resultsRows}</tbody>
                </table>
            </div>
            <div class="guide-box guide-box--buy"><h3>💡 매수 실행 가이드</h3>${guideContent}</div>
        </div>`;
}

export function generateSellModeResultsHTML(results, currency) {
    const sortedResults = [...results].sort((a, b) => b.adjustment.comparedTo(a.adjustment));
    const resultsRows = sortedResults.map((s, index) => `
        <tr class="result-row-highlight" data-delay="${index * 0.05}s">
            <td><strong>${escapeHTML(s.name)}</strong><br><span class="ticker">${escapeHTML(s.ticker)}</span></td>
            <td style="text-align: center;">${s.currentRatio.toFixed(1)}%</td>
            <td style="text-align: center;"><strong>${s.targetRatio.toFixed(1)}%</strong></td>
            <td style="text-align: right;">
                <div class="${s.adjustment.isPositive() ? 'text-sell' : 'text-buy'}">
                    ${s.adjustment.isPositive() ? '🔴 매도' : '🔵 매수'}: ${formatCurrency(s.adjustment.abs(), currency)}
                </div>
            </td>
        </tr>`).join('');

    const totalSell = results.filter(s => s.adjustment.isPositive()).reduce((sum, s) => sum.plus(s.adjustment), new Decimal(0));
    const stocksToSell = sortedResults.filter(s => s.adjustment.isPositive());
    const stocksToBuy = sortedResults.filter(s => s.adjustment.isNegative());

    const sellGuide = stocksToSell.map((s, i) => `<div class="guide-item"><strong>${i + 1}. ${escapeHTML(s.ticker)}</strong> (${escapeHTML(s.name)}): ${formatCurrency(s.adjustment, currency)} 매도</div>`).join('') || '<p>매도할 종목이 없습니다.</p>';
    const buyGuide = stocksToBuy.map((s, i) => `<div class="guide-item"><strong>${i + 1}. ${escapeHTML(s.ticker)}</strong> (${escapeHTML(s.name)}): ${formatCurrency(s.adjustment.abs(), currency)} 매수</div>`).join('') || '<p>매수할 종목이 없습니다.</p>';

    return `
        <div class="summary-grid">
            <div class="summary-item summary-item--rebalance"><h3>총 리밸런싱 금액</h3><div class="amount">${formatCurrency(totalSell, currency)}</div></div>
        </div>
        <div class="card">
            <h2>⚖️ 리밸런싱 가이드 (조정 금액순 정렬)</h2>
            <div class="table-responsive">
                <table>
                    <thead><tr><th>종목</th><th>현재 비율</th><th>목표 비율</th><th>조정 금액</th></tr></thead>
                    <tbody>${resultsRows}</tbody>
                </table>
            </div>
            <div class="guide-box guide-box--sell"><h3>🔴 매도 항목</h3>${sellGuide}</div>
            <div class="guide-box guide-box--buy"><h3>🔵 매수 항목 (매도 자금으로)</h3>${buyGuide}</div>
        </div>`;
}

export function generateSectorAnalysisHTML(sectorData, currency) {
    if (!sectorData || sectorData.length === 0) {
        return '';
    }

    const rows = sectorData.map(data => `
        <tr>
            <td>${escapeHTML(data.sector)}</td>
            <td style="text-align: right;">${formatCurrency(data.amount, currency)}</td>
            <td style="text-align: right;">${data.percentage.toFixed(2)}%</td>
        </tr>
    `).join('');

    return `
        <div class="card">
            <h2>🗂️ 섹터별 분석</h2>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th scope="col">섹터</th>
                            <th scope="col">금액</th>
                            <th scope="col">비중</th>
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