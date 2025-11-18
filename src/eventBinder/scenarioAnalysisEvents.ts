// src/eventBinder/scenarioAnalysisEvents.ts
import type { PortfolioView } from '../view';

/**
 * @description 시나리오 분석 관련 이벤트 바인딩
 * @param view - PortfolioView 인스턴스
 * @param signal - AbortController signal
 */
export function setupScenarioAnalysisEvents(view: PortfolioView, signal: AbortSignal): void {
    const dom = view.dom;

    // Analyze scenario button
    dom.analyzeScenarioBtn?.addEventListener('click', () => {
        view.emit('analyzeScenarioClicked');
    });

    // Custom scenario toggle button
    dom.customScenarioBtn?.addEventListener('click', () => {
        view.emit('customScenarioToggled');
    });

    // Run custom scenario button
    dom.runCustomScenarioBtn?.addEventListener('click', () => {
        view.emit('runCustomScenarioClicked');
    });
}
