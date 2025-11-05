// src/a11yHelpers.ts
/**
 * @description 접근성(Accessibility) 개선 유틸리티
 */

/**
 * @description 키보드 네비게이션 헬퍼 - Enter/Space로 버튼 활성화
 * @param element - 대상 요소
 * @param callback - 실행할 콜백
 */
export function addKeyboardActivation(
    element: HTMLElement,
    callback: (e: KeyboardEvent) => void
): void {
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            callback(e);
        }
    });
}

/**
 * @description 포커스 트랩 (모달 내부에서만 포커스 이동)
 * @param container - 컨테이너 요소
 * @returns cleanup 함수
 */
export function createFocusTrap(container: HTMLElement): () => void {
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = container.querySelectorAll(focusableSelector);

    if (focusableElements.length === 0) {
        return () => {};
    }

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    };

    container.addEventListener('keydown', handleKeyDown);

    // 초기 포커스
    firstElement.focus();

    // Cleanup 함수 반환
    return () => {
        container.removeEventListener('keydown', handleKeyDown);
    };
}

/**
 * @description 스크린 리더 전용 텍스트 생성
 * @param text - 읽을 텍스트
 * @returns HTMLElement (visually hidden)
 */
export function createScreenReaderText(text: string): HTMLSpanElement {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = 'sr-only'; // CSS에서 .sr-only 정의 필요
    span.setAttribute('aria-hidden', 'false');
    return span;
}

/**
 * @description ARIA live region에 메시지 발표
 * @param message - 알림 메시지
 * @param priority - 'polite' | 'assertive'
 */
export function announceToScreenReader(
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
): void {
    const announcer = document.getElementById('aria-announcer');
    if (announcer) {
        announcer.textContent = '';
        announcer.setAttribute('aria-live', priority);
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);
    }
}

/**
 * @description 폼 필드 에러 연결 (aria-describedby)
 * @param input - 입력 필드
 * @param errorMessage - 에러 메시지
 * @returns 에러 메시지 요소
 */
export function linkFormError(input: HTMLInputElement, errorMessage: string): HTMLElement {
    const errorId = `${input.id || 'input'}-error`;
    let errorEl = document.getElementById(errorId);

    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.id = errorId;
        errorEl.className = 'error-message';
        errorEl.setAttribute('role', 'alert');
        errorEl.setAttribute('aria-live', 'polite');
        input.parentElement?.appendChild(errorEl);
    }

    errorEl.textContent = errorMessage;
    input.setAttribute('aria-describedby', errorId);
    input.setAttribute('aria-invalid', 'true');

    return errorEl;
}

/**
 * @description 폼 필드 에러 제거
 * @param input - 입력 필드
 */
export function clearFormError(input: HTMLInputElement): void {
    const errorId = `${input.id || 'input'}-error`;
    const errorEl = document.getElementById(errorId);

    if (errorEl) {
        errorEl.remove();
    }

    input.removeAttribute('aria-describedby');
    input.removeAttribute('aria-invalid');
}

/**
 * @description 진행률 표시 (aria-valuenow, aria-valuemin, aria-valuemax)
 * @param element - 진행률 요소
 * @param current - 현재 값
 * @param max - 최대 값
 * @param label - 라벨 (선택)
 */
export function updateProgressBar(
    element: HTMLElement,
    current: number,
    max: number,
    label?: string
): void {
    element.setAttribute('role', 'progressbar');
    element.setAttribute('aria-valuenow', String(current));
    element.setAttribute('aria-valuemin', '0');
    element.setAttribute('aria-valuemax', String(max));

    if (label) {
        element.setAttribute('aria-label', label);
    }

    const percent = (current / max) * 100;
    element.setAttribute('aria-valuetext', `${percent.toFixed(0)}%`);
}

/**
 * @description 스킵 링크 생성 (페이지 상단에서 메인 콘텐츠로 바로 이동)
 * @param targetId - 이동할 요소의 ID
 * @param text - 링크 텍스트
 * @returns HTMLAnchorElement
 */
export function createSkipLink(targetId: string, text: string = 'Skip to main content'): HTMLAnchorElement {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'skip-link'; // CSS에서 정의 필요 (시각적으로 숨김, 포커스 시 표시)
    skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
            target.focus();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
    return skipLink;
}

/**
 * @description 모달 오픈 시 이전 포커스 저장 및 복원
 */
export class FocusManager {
    private previousFocus: HTMLElement | null = null;

    /**
     * @description 현재 포커스 저장
     */
    saveFocus(): void {
        this.previousFocus = document.activeElement as HTMLElement;
    }

    /**
     * @description 이전 포커스 복원
     */
    restoreFocus(): void {
        if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
            this.previousFocus.focus();
            this.previousFocus = null;
        }
    }
}

/**
 * @description 색상 대비 검사 (WCAG 2.0 기준)
 * @param foreground - 전경색 (hex)
 * @param background - 배경색 (hex)
 * @returns { ratio: number, passAA: boolean, passAAA: boolean }
 */
export function checkColorContrast(
    foreground: string,
    background: string
): { ratio: number; passAA: boolean; passAAA: boolean } {
    // Hex to RGB
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16)
              }
            : null;
    };

    // Relative luminance
    const getLuminance = (r: number, g: number, b: number) => {
        const [rs, gs, bs] = [r, g, b].map((c) => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const fg = hexToRgb(foreground);
    const bg = hexToRgb(background);

    if (!fg || !bg) {
        return { ratio: 0, passAA: false, passAAA: false };
    }

    const l1 = getLuminance(fg.r, fg.g, fg.b);
    const l2 = getLuminance(bg.r, bg.g, bg.b);

    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
        ratio: Math.round(ratio * 100) / 100,
        passAA: ratio >= 4.5, // WCAG AA 기준
        passAAA: ratio >= 7 // WCAG AAA 기준
    };
}

/**
 * @description 터치 타겟 크기 검사 (최소 44x44px 권장)
 * @param element - 검사할 요소
 * @returns { width: number, height: number, isSufficient: boolean }
 */
export function checkTouchTargetSize(element: HTMLElement): {
    width: number;
    height: number;
    isSufficient: boolean;
} {
    const rect = element.getBoundingClientRect();
    const minSize = 44; // WCAG 2.1 권장 크기

    return {
        width: rect.width,
        height: rect.height,
        isSufficient: rect.width >= minSize && rect.height >= minSize
    };
}