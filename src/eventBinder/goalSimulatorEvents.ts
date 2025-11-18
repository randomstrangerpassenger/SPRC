// src/eventBinder/goalSimulatorEvents.ts
import type { PortfolioView } from '../view';

/**
 * @description 목표 시뮬레이터 관련 이벤트 바인딩
 * @param view - PortfolioView 인스턴스
 * @param signal - AbortController signal
 */
export function setupGoalSimulatorEvents(view: PortfolioView, signal: AbortSignal): void {
    const dom = view.dom;

    // Simulate goal button
    dom.simulateGoalBtn?.addEventListener('click', () => {
        view.emit('simulateGoalClicked');
    });

    // Calculate required contribution button
    dom.calculateRequiredContributionBtn?.addEventListener('click', () => {
        view.emit('calculateRequiredContributionClicked');
    });
}
