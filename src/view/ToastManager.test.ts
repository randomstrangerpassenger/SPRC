// src/view/ToastManager.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ToastManager } from './ToastManager';

// escapeHTML 모킹
vi.mock('../utils', () => ({
    escapeHTML: vi.fn((text: string) => text.replace(/</g, '&lt;').replace(/>/g, '&gt;')),
}));

describe('ToastManager', () => {
    let toastManager: ToastManager;

    beforeEach(() => {
        toastManager = new ToastManager();
        // DOM 초기화
        document.body.innerHTML = '';
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
        document.body.innerHTML = '';
    });

    describe('show', () => {
        it('should create a toast element with correct structure', () => {
            toastManager.show('Test message', 'info');

            const toast = document.querySelector('.toast');
            expect(toast).toBeTruthy();
            expect(toast?.getAttribute('role')).toBe('alert');
            expect(toast?.getAttribute('aria-live')).toBe('assertive');
            expect(toast?.className).toContain('toast--info');
            expect(toast?.innerHTML).toContain('Test message');
        });

        it('should create toast with success type', () => {
            toastManager.show('Success message', 'success');

            const toast = document.querySelector('.toast');
            expect(toast?.className).toContain('toast--success');
        });

        it('should create toast with warning type', () => {
            toastManager.show('Warning message', 'warning');

            const toast = document.querySelector('.toast');
            expect(toast?.className).toContain('toast--warning');
        });

        it('should create toast with error type', () => {
            toastManager.show('Error message', 'error');

            const toast = document.querySelector('.toast');
            expect(toast?.className).toContain('toast--error');
        });

        it('should escape HTML in message for XSS protection', () => {
            toastManager.show('<script>alert("XSS")</script>', 'info');

            const toast = document.querySelector('.toast');
            expect(toast?.innerHTML).toContain('&lt;script&gt;');
            expect(toast?.innerHTML).toContain('&lt;/script&gt;');
            expect(toast?.innerHTML).not.toContain('<script>');
        });

        it('should convert newlines to <br> tags', () => {
            toastManager.show('Line 1\nLine 2\nLine 3', 'info');

            const toast = document.querySelector('.toast');
            expect(toast?.innerHTML).toBe('Line 1<br>Line 2<br>Line 3');
        });

        it('should remove existing toast before showing new one', () => {
            toastManager.show('First message', 'info');
            const firstToast = document.querySelector('.toast');
            expect(firstToast).toBeTruthy();

            toastManager.show('Second message', 'success');
            const toasts = document.querySelectorAll('.toast');
            expect(toasts.length).toBe(1);
            expect(toasts[0].className).toContain('toast--success');
            expect(toasts[0].innerHTML).toContain('Second message');
        });

        it('should auto-remove toast after default duration (3000ms)', () => {
            toastManager.show('Test message', 'info');

            expect(document.querySelector('.toast')).toBeTruthy();

            // 2999ms 후에는 아직 존재
            vi.advanceTimersByTime(2999);
            expect(document.querySelector('.toast')).toBeTruthy();

            // 3000ms 후에는 제거됨
            vi.advanceTimersByTime(1);
            expect(document.querySelector('.toast')).toBeNull();
        });

        it('should auto-remove toast after custom duration', () => {
            toastManager.show('Test message', 'info', 5000);

            expect(document.querySelector('.toast')).toBeTruthy();

            // 4999ms 후에는 아직 존재
            vi.advanceTimersByTime(4999);
            expect(document.querySelector('.toast')).toBeTruthy();

            // 5000ms 후에는 제거됨
            vi.advanceTimersByTime(1);
            expect(document.querySelector('.toast')).toBeNull();
        });

        it('should append toast to document.body', () => {
            toastManager.show('Test message', 'info');

            const toast = document.body.querySelector('.toast');
            expect(toast).toBeTruthy();
            expect(toast?.parentElement).toBe(document.body);
        });
    });

    describe('dismiss', () => {
        it('should remove existing toast immediately', () => {
            toastManager.show('Test message', 'info');
            expect(document.querySelector('.toast')).toBeTruthy();

            toastManager.dismiss();
            expect(document.querySelector('.toast')).toBeNull();
        });

        it('should do nothing when no toast exists', () => {
            expect(document.querySelector('.toast')).toBeNull();

            // Should not throw error
            expect(() => toastManager.dismiss()).not.toThrow();

            expect(document.querySelector('.toast')).toBeNull();
        });

        it('should cancel auto-removal timer', () => {
            toastManager.show('Test message', 'info', 5000);
            expect(document.querySelector('.toast')).toBeTruthy();

            toastManager.dismiss();
            expect(document.querySelector('.toast')).toBeNull();

            // Timer가 실행되어도 아무 일도 일어나지 않음
            vi.advanceTimersByTime(5000);
            expect(document.querySelector('.toast')).toBeNull();
        });
    });

    describe('edge cases', () => {
        it('should handle empty message', () => {
            toastManager.show('', 'info');

            const toast = document.querySelector('.toast');
            expect(toast).toBeTruthy();
            expect(toast?.innerHTML).toBe('');
        });

        it('should handle very long message', () => {
            const longMessage = 'A'.repeat(1000);
            toastManager.show(longMessage, 'info');

            const toast = document.querySelector('.toast');
            expect(toast?.innerHTML).toBe(longMessage);
        });

        it('should handle duration of 0', () => {
            toastManager.show('Test message', 'info', 0);

            expect(document.querySelector('.toast')).toBeTruthy();

            vi.advanceTimersByTime(0);
            expect(document.querySelector('.toast')).toBeNull();
        });

        it('should handle multiple newlines and HTML', () => {
            toastManager.show('<b>Bold</b>\n\n<i>Italic</i>', 'info');

            const toast = document.querySelector('.toast');
            expect(toast?.innerHTML).toBe('&lt;b&gt;Bold&lt;/b&gt;<br><br>&lt;i&gt;Italic&lt;/i&gt;');
        });
    });
});
