// src/view/AccessibilityAnnouncer.ts

import { logger } from '../services/Logger';
import { TIMING } from '../constants';

/**
 * @class AccessibilityAnnouncer
 * @description Manages ARIA Live region for screen readers
 */
export class AccessibilityAnnouncer {
    #announcer: HTMLElement | null = null;

    /**
     * @param announcerElement - ARIA Live region DOM element
     */
    constructor(announcerElement?: HTMLElement) {
        this.#announcer = announcerElement || null;
    }

    /**
     * @description Set announcer element
     * @param element - ARIA Live region DOM element
     */
    setElement(element: HTMLElement): void {
        this.#announcer = element;
    }

    /**
     * @description Announce message to screen readers
     * @param message - Announcement message
     * @param politeness - Announcement priority (polite: low, assertive: high)
     */
    announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
        if (!this.#announcer) {
            logger.warn('Announcer element not set', 'AccessibilityAnnouncer');
            return;
        }

        // Clear existing content
        this.#announcer.textContent = '';
        this.#announcer.setAttribute('aria-live', politeness);

        // Set message after slight delay (to ensure screen reader detects the change)
        setTimeout(() => {
            if (this.#announcer) {
                this.#announcer.textContent = message;
            }
        }, TIMING.A11Y_SCREEN_READER_DELAY);
    }

    /**
     * @description Clear announcement content
     */
    clear(): void {
        if (this.#announcer) {
            this.#announcer.textContent = '';
        }
    }
}
