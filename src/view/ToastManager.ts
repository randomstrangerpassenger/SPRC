// src/view/ToastManager.ts
import { escapeHTML } from '../utils';
import { TIMING } from '../constants';

/**
 * @class ToastManager
 * @description Toast 메시지 표시를 담당하는 클래스
 */
export class ToastManager {
    private readonly DEFAULT_DURATION = TIMING.TOAST_DEFAULT_DURATION;

    /**
     * @description Toast 메시지 표시
     * @param message - 메시지
     * @param type - 메시지 타입 (info, success, warning, error)
     * @param duration - 표시 시간 (밀리초, 기본값: 3000ms)
     */
    show(
        message: string,
        type: 'info' | 'success' | 'warning' | 'error' = 'info',
        duration: number = this.DEFAULT_DURATION
    ): void {
        // 기존 toast 제거
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // 새 toast 생성
        const toast = document.createElement('div');
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.className = `toast toast--${type}`;

        // XSS 방어: escapeHTML 적용
        toast.innerHTML = escapeHTML(message).replace(/\n/g, '<br>');

        document.body.appendChild(toast);

        // 자동 제거
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    /**
     * @description 현재 표시 중인 toast 즉시 제거
     */
    dismiss(): void {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
    }
}
