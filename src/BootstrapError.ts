// src/BootstrapError.ts
import { escapeHTML } from './utils';

/**
 * @description 치명적인 부트스트랩 오류 발생 시 사용자에게 오류 메시지를 표시합니다.
 * @param error - 발생한 오류
 */
export function displayBootstrapError(error: unknown): void {
    const bodyElement = document.body;
    if (!bodyElement) {
        // body가 없는 경우 console로만 로깅
        console.error('Failed to display bootstrap error: body element not found', error);
        return;
    }

    const errorMsg = error instanceof Error ? error.message : String(error);
    const safeErrorMsg = escapeHTML(errorMsg);

    bodyElement.innerHTML = `<div style="padding: 20px; text-align: center; color: #dc3545; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">애플리케이션 로딩 실패</h1>
        <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">오류가 발생했습니다. 페이지를 새로고침하거나 나중에 다시 시도해주세요.</p>
        <p style="font-size: 0.9rem; color: #6c757d; background: #f8f9fa; padding: 1rem; border-radius: 4px; margin-top: 1rem; font-family: monospace;">오류 메시지: ${safeErrorMsg}</p>
        <button onclick="location.reload()" style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; font-size: 1rem; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            새로고침
        </button>
    </div>`;
}
