// src/eventBinder/dividendDashboardEvents.ts
import type { PortfolioView } from '../view';

/**
 * @description 배당금 대시보드 관련 이벤트 바인딩
 * @param view - PortfolioView 인스턴스
 * @param signal - AbortController signal
 */
export function setupDividendDashboardEvents(view: PortfolioView, signal: AbortSignal): void {
    const dom = view.dom;

    // Show yearly dividends button
    dom.showYearlyDividendsBtn?.addEventListener('click', () => {
        view.emit('showYearlyDividendsClicked');
    });

    // Show monthly dividends button
    dom.showMonthlyDividendsBtn?.addEventListener('click', () => {
        view.emit('showMonthlyDividendsClicked');
    });

    // Show dividend growth button
    dom.showDividendGrowthBtn?.addEventListener('click', () => {
        view.emit('showDividendGrowthClicked');
    });
}
