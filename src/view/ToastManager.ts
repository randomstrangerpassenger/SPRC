// src/view/ToastManager.ts
import { escapeHTML } from '../utils';
import { TIMING } from '../constants';

/**
 * @class ToastManager
 * @description Manages toast message display
 */
export class ToastManager {
    private readonly DEFAULT_DURATION = TIMING.TOAST_DEFAULT_DURATION;

    /**
     * @description Show toast message
     * @param message - Message
     * @param type - Message type (info, success, warning, error)
     * @param duration - Display duration (milliseconds, default: 3000ms)
     */
    show(
        message: string,
        type: 'info' | 'success' | 'warning' | 'error' = 'info',
        duration: number = this.DEFAULT_DURATION
    ): void {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create new toast
        const toast = document.createElement('div');
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.className = `toast toast--${type}`;

        // XSS protection: apply escapeHTML
        toast.innerHTML = escapeHTML(message).replace(/\n/g, '<br>');

        document.body.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    /**
     * @description Immediately dismiss currently displayed toast
     */
    dismiss(): void {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
    }
}
