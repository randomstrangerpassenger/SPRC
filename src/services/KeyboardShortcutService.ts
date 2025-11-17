// src/services/KeyboardShortcutService.ts
import { logger } from './Logger';

/**
 * @class KeyboardShortcutService
 * @description 키보드 단축키 관리 서비스
 */
export class KeyboardShortcutService {
    #shortcuts: Map<string, ShortcutHandler> = new Map();
    #abortController: AbortController | null = null;
    #enabled: boolean = true;

    /**
     * 단축키 등록
     */
    register(shortcut: Shortcut, handler: ShortcutHandler): void {
        const key = this.#createShortcutKey(shortcut);
        this.#shortcuts.set(key, handler);
        logger.info(`Keyboard shortcut registered: ${key}`, 'KeyboardShortcutService');
    }

    /**
     * 여러 단축키 등록
     */
    registerMany(shortcuts: ShortcutConfig[]): void {
        shortcuts.forEach(({ shortcut, handler }) => {
            this.register(shortcut, handler);
        });
    }

    /**
     * 단축키 제거
     */
    unregister(shortcut: Shortcut): void {
        const key = this.#createShortcutKey(shortcut);
        this.#shortcuts.delete(key);
    }

    /**
     * 모든 단축키 제거
     */
    unregisterAll(): void {
        this.#shortcuts.clear();
    }

    /**
     * 키보드 이벤트 리스너 시작
     */
    start(): void {
        if (this.#abortController) {
            logger.warn('KeyboardShortcutService already started', 'KeyboardShortcutService');
            return;
        }

        this.#abortController = new AbortController();
        const signal = this.#abortController.signal;

        document.addEventListener(
            'keydown',
            (e) => this.#handleKeyDown(e),
            { signal, capture: true }
        );

        logger.info('KeyboardShortcutService started', 'KeyboardShortcutService');
    }

    /**
     * 키보드 이벤트 리스너 중지
     */
    stop(): void {
        if (this.#abortController) {
            this.#abortController.abort();
            this.#abortController = null;
            logger.info('KeyboardShortcutService stopped', 'KeyboardShortcutService');
        }
    }

    /**
     * 단축키 활성화/비활성화
     */
    setEnabled(enabled: boolean): void {
        this.#enabled = enabled;
    }

    /**
     * 키다운 이벤트 핸들러
     */
    #handleKeyDown(e: KeyboardEvent): void {
        if (!this.#enabled) {
            return;
        }

        // 입력 필드에서는 대부분의 단축키 무시 (ESC 제외)
        const target = e.target as HTMLElement;
        const isInputField =
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable;

        if (isInputField && e.key !== 'Escape') {
            // Ctrl+Enter는 입력 필드에서도 허용
            if (!(e.ctrlKey && e.key === 'Enter')) {
                return;
            }
        }

        // 단축키 키 생성
        const key = this.#createShortcutKeyFromEvent(e);
        const handler = this.#shortcuts.get(key);

        if (handler) {
            e.preventDefault();
            e.stopPropagation();

            try {
                handler(e);
            } catch (error) {
                logger.error(`Error executing shortcut handler for: ${key}`, 'KeyboardShortcutService', error);
            }
        }
    }

    /**
     * Shortcut 객체로부터 키 문자열 생성
     */
    #createShortcutKey(shortcut: Shortcut): string {
        const parts: string[] = [];

        if (shortcut.ctrl) parts.push('Ctrl');
        if (shortcut.alt) parts.push('Alt');
        if (shortcut.shift) parts.push('Shift');
        if (shortcut.meta) parts.push('Meta');

        parts.push(shortcut.key.toUpperCase());

        return parts.join('+');
    }

    /**
     * KeyboardEvent로부터 키 문자열 생성
     */
    #createShortcutKeyFromEvent(e: KeyboardEvent): string {
        const parts: string[] = [];

        if (e.ctrlKey) parts.push('Ctrl');
        if (e.altKey) parts.push('Alt');
        if (e.shiftKey) parts.push('Shift');
        if (e.metaKey) parts.push('Meta');

        // 숫자 키 처리 (Digit1 -> 1)
        let key = e.key.toUpperCase();
        if (e.code.startsWith('Digit')) {
            key = e.code.replace('Digit', '');
        }

        parts.push(key);

        return parts.join('+');
    }

    /**
     * 등록된 모든 단축키 목록 반환
     */
    getAllShortcuts(): string[] {
        return Array.from(this.#shortcuts.keys());
    }
}

/**
 * 단축키 정의 타입
 */
export interface Shortcut {
    key: string; // 'a', '1', 'Enter', 'Escape' 등
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
}

/**
 * 단축키 핸들러 타입
 */
export type ShortcutHandler = (e: KeyboardEvent) => void;

/**
 * 단축키 설정 타입
 */
export interface ShortcutConfig {
    shortcut: Shortcut;
    handler: ShortcutHandler;
    description?: string;
}

/**
 * 싱글톤 인스턴스
 */
let instance: KeyboardShortcutService | null = null;

/**
 * KeyboardShortcutService 싱글톤 인스턴스 반환
 */
export function getKeyboardShortcutService(): KeyboardShortcutService {
    if (!instance) {
        instance = new KeyboardShortcutService();
    }
    return instance;
}
