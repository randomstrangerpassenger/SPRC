// src/view/AccessibilityAnnouncer.ts

import { logger } from '../services/Logger';
import { TIMING } from '../constants';

/**
 * @class AccessibilityAnnouncer
 * @description 스크린 리더를 위한 ARIA Live 영역 관리 클래스
 */
export class AccessibilityAnnouncer {
    #announcer: HTMLElement | null = null;

    /**
     * @param announcerElement - ARIA Live 영역 DOM 엘리먼트
     */
    constructor(announcerElement?: HTMLElement) {
        this.#announcer = announcerElement || null;
    }

    /**
     * @description Announcer 엘리먼트 설정
     * @param element - ARIA Live 영역 DOM 엘리먼트
     */
    setElement(element: HTMLElement): void {
        this.#announcer = element;
    }

    /**
     * @description 스크린 리더에 메시지 알림
     * @param message - 알림 메시지
     * @param politeness - 알림 우선순위 (polite: 낮음, assertive: 높음)
     */
    announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
        if (!this.#announcer) {
            logger.warn('Announcer element not set', 'AccessibilityAnnouncer');
            return;
        }

        // 기존 내용 초기화
        this.#announcer.textContent = '';
        this.#announcer.setAttribute('aria-live', politeness);

        // 약간의 지연 후 메시지 설정 (스크린 리더가 변경을 감지하도록)
        setTimeout(() => {
            if (this.#announcer) {
                this.#announcer.textContent = message;
            }
        }, TIMING.A11Y_SCREEN_READER_DELAY);
    }

    /**
     * @description 알림 내용 초기화
     */
    clear(): void {
        if (this.#announcer) {
            this.#announcer.textContent = '';
        }
    }
}
