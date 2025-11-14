// src/main.ts
import { PortfolioState } from './state.ts';
import { PortfolioView } from './view.ts';
import { PortfolioController } from './controller.ts';
import { ErrorService } from './errorService.ts';
import { setupGlobalErrorHandlers } from './errorHandlers.ts';
import { initPerformancePanel } from './performance/PerformancePanel.ts';
import { perfMonitor } from './performance/PerformanceMonitor.ts';
import { logger } from './services/Logger.ts';

// Chart.js는 이미 CalculationManager에서 동적으로 임포트되므로 여기서 임포트 제거
// (await import('chart.js/auto')).default를 사용하여 필요할 때만 로드

// 개발 모드에서 성능 모니터링 활성화
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
if (isDevelopment) {
    perfMonitor.setEnabled(true);
    initPerformancePanel();
    logger.info('Monitoring enabled. Press Ctrl+Shift+P to view metrics.', 'Performance');
} else {
    perfMonitor.setEnabled(false);
}

// 전역 에러 핸들러 등록
setupGlobalErrorHandlers();

try {
    const state = new PortfolioState();
    // PortfolioView는 클래스이므로 new 키워드로 인스턴스화
    const view = new PortfolioView();

    // ErrorService에 view 인스턴스 설정 (에러 토스트 메시지 표시를 위해)
    ErrorService.setViewInstance(view);

    // Controller 생성 (initialize는 생성자에서 자동 호출됨)
    const app = new PortfolioController(state, view);

    logger.info('Application setup complete.');
} catch (error) {
    logger.error('애플리케이션 초기화 중 치명적인 오류 발생:', 'Main', error as Error);
    // 사용자에게 오류 메시지를 표시하는 UI 로직 추가 가능
    const bodyElement = document.body;
    if (bodyElement) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        bodyElement.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">
            <h1>애플리케이션 로딩 실패</h1>
            <p>오류가 발생했습니다. 페이지를 새로고침하거나 나중에 다시 시도해주세요.</p>
            <p>오류 메시지: ${errorMsg}</p>
        </div>`;
    }
}