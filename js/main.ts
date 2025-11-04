// js/main.ts (Class-based View)
import { PortfolioState } from './state.js';
import { PortfolioView } from './view.js';
import { PortfolioController } from './controller.js';
import { ErrorService } from './errorService.js';
import { Chart, DoughnutController, ArcElement, Legend, Title, Tooltip } from 'chart.js';

// Chart.js의 필요한 구성 요소만 등록
Chart.register(DoughnutController, ArcElement, Legend, Title, Tooltip);

try {
    const state = new PortfolioState();
    // PortfolioView는 클래스이므로 new 키워드로 인스턴스화
    const view = new PortfolioView();

    // ErrorService에 view 인스턴스 설정 (에러 토스트 메시지 표시를 위해)
    ErrorService.setViewInstance(view);

    // Controller 생성 (initialize는 생성자에서 자동 호출됨)
    const app = new PortfolioController(state, view);

    // Make Chart globally available or pass it where needed (e.g., to View)
    // If View needs Chart, consider passing it during initialization or directly
    // For simplicity, let's assume View can access the global Chart object for now
    // (A better approach might be dependency injection)

    console.log("Application setup complete.");
} catch (error) {
    console.error("애플리케이션 초기화 중 치명적인 오류 발생:", error);
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
