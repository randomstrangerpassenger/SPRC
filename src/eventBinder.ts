// src/eventBinder.ts
import type { PortfolioView } from './view';
import { setupPortfolioEvents } from './eventBinder/portfolioEvents';
import { setupDataEvents } from './eventBinder/dataEvents';
import { setupTableEvents } from './eventBinder/tableEvents';
import { setupCalculationEvents } from './eventBinder/calculationEvents';
import { setupModalEvents } from './eventBinder/modalEvents';
import { setupRebalancingRulesEvents } from './eventBinder/rebalancingRulesEvents';
import { setupDividendDashboardEvents } from './eventBinder/dividendDashboardEvents';
import { setupScenarioAnalysisEvents } from './eventBinder/scenarioAnalysisEvents';
import { setupGoalSimulatorEvents } from './eventBinder/goalSimulatorEvents';

/**
 * @description 애플리케이션의 DOM 이벤트를 View의 추상 이벤트로 연결합니다.
 * @param view - PortfolioView 인스턴스
 * @returns 이벤트 리스너 정리를 위한 AbortController
 */
export function bindEventListeners(view: PortfolioView): AbortController {
    // AbortController 생성 (메모리 누수 방지)
    const abortController = new AbortController();
    const { signal } = abortController;

    // 기능별 이벤트 바인딩
    setupPortfolioEvents(view, signal);
    setupDataEvents(view, signal);
    setupTableEvents(view, signal);
    setupCalculationEvents(view, signal);
    setupModalEvents(view, signal);
    setupRebalancingRulesEvents(view, signal);
    setupDividendDashboardEvents(view, signal);
    setupScenarioAnalysisEvents(view, signal);
    setupGoalSimulatorEvents(view, signal);

    // 키보드 네비게이션 포커스 스타일
    document.addEventListener(
        'keydown',
        (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        },
        { signal }
    );
    document.addEventListener(
        'mousedown',
        () => {
            document.body.classList.remove('keyboard-nav');
        },
        { signal }
    );

    return abortController;
}
