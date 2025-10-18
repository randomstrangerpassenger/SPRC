import { PortfolioController } from './controller.js';

// DOM이 완전히 로드된 후 애플리케이션 초기화
window.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new PortfolioController();
        app.init();
    } catch (error) {
        console.error("애플리케이션 초기화 중 치명적인 오류 발생:", error);
        // 사용자에게 오류 메시지를 보여주는 UI 로직 (예: alert 또는 DOM 조작)
        document.body.innerHTML = `<h1>애플리케이션을 로드하는 데 실패했습니다. 콘솔을 확인해주세요.</h1>`;
    }
});