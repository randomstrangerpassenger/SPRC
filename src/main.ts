// src/main.ts
import { PortfolioState } from './state';
import { PortfolioView } from './view';
import { PortfolioController } from './controller';
import { ErrorService } from './errorService';
import { globalErrorHandler } from './services/ErrorHandler';
import { setupGlobalErrorHandlers } from './errorHandlers';
import { initPerformancePanel } from './performance/PerformancePanel';
import { perfMonitor } from './performance/PerformanceMonitor';
import { logger } from './services/Logger';
import { displayBootstrapError } from './BootstrapError';

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

    // ErrorService와 globalErrorHandler에 view 인스턴스 설정 (에러 토스트 메시지 표시를 위해)
    ErrorService.setViewInstance(view);
    globalErrorHandler.setViewInstance(view);

    // Controller 생성 (initialize는 생성자에서 자동 호출됨)
    void new PortfolioController(state, view);

    logger.info('Application setup complete.');
} catch (error) {
    logger.error('애플리케이션 초기화 중 치명적인 오류 발생:', 'Main', error as Error);
    displayBootstrapError(error);
}
