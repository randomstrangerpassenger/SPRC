// src/DarkModeManager.ts
import { CONFIG } from './constants';

/**
 * @class DarkModeManager
 * @description 다크 모드 관리를 담당하는 클래스
 * 대형 파일 분리
 */
export class DarkModeManager {
    #darkModeMediaQuery?: MediaQueryList;
    #darkModeHandler?: (e: MediaQueryListEvent) => void;

    /**
     * @description 다크 모드 초기화
     */
    initialize(): void {
        // localStorage에서 다크 모드 설정 불러오기
        const storedDarkMode = localStorage.getItem(CONFIG.DARK_MODE_KEY);
        if (storedDarkMode === 'true') {
            document.body.classList.add('dark-mode');
        } else if (
            storedDarkMode === null &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
        ) {
            document.body.classList.add('dark-mode');
            localStorage.setItem(CONFIG.DARK_MODE_KEY, 'true');
        }

        // 시스템 다크 모드 변경 감지
        this.#darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.#darkModeHandler = (e: MediaQueryListEvent) => {
            const storedMode = localStorage.getItem(CONFIG.DARK_MODE_KEY);
            if (storedMode === null) {
                document.body.classList.toggle('dark-mode', e.matches);
            }
        };
        this.#darkModeMediaQuery.addEventListener('change', this.#darkModeHandler);
    }

    /**
     * @description 다크 모드 토글
     */
    toggle(): void {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem(CONFIG.DARK_MODE_KEY, isDarkMode ? 'true' : 'false');
    }

    /**
     * @description 리스너 정리
     */
    cleanup(): void {
        if (this.#darkModeMediaQuery && this.#darkModeHandler) {
            this.#darkModeMediaQuery.removeEventListener('change', this.#darkModeHandler);
            this.#darkModeMediaQuery = undefined;
            this.#darkModeHandler = undefined;
            console.log('[DarkModeManager] Dark mode listener cleaned up');
        }
    }
}