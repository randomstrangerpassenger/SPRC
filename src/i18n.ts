// src/i18n.ts
import { logger } from './services/Logger.ts';
import { en, type Locale } from './i18n/locales/en';
import { ko } from './i18n/locales/ko';

type Lang = 'en' | 'ko';
type Replacements = Record<string, string | number>;

// 언어별 locale 맵
const locales: Record<Lang, Locale> = {
    en,
    ko,
};

/**
 * @description 브라우저 언어 설정을 감지하여 'en' 또는 'ko'를 반환합니다.
 */
function getBrowserLanguage(): Lang {
    const nav = navigator as unknown;
    const lang =
        (nav && typeof nav === 'object' && 'language' in nav ? nav.language : null) ||
        (nav && typeof nav === 'object' && 'userLanguage' in nav
            ? (nav as { userLanguage: string }).userLanguage
            : null);
    if (typeof lang === 'string' && lang.toLowerCase().startsWith('ko')) {
        return 'ko';
    }
    return 'en'; // 기본값
}

/**
 * @description localStorage에서 저장된 언어를 로드하거나 브라우저 언어 감지
 */
function getStoredLanguage(): Lang {
    const storedLang = localStorage.getItem('sprc_language');
    if (storedLang === 'ko' || storedLang === 'en') {
        return storedLang;
    }
    return getBrowserLanguage();
}

// 현재 언어 설정 (localStorage 우선, 없으면 브라우저 언어)
let currentLang: Lang = getStoredLanguage();
let messages: Locale = locales[currentLang] || locales.en;

/**
 * @description 언어 변경 및 localStorage 저장
 */
export function setLanguage(newLang: Lang): void {
    if (newLang !== 'en' && newLang !== 'ko') {
        logger.warn(`Unsupported language: ${newLang}`, 'i18n');
        return;
    }
    currentLang = newLang;
    messages = locales[currentLang] || locales.en;
    localStorage.setItem('sprc_language', newLang);
    logger.info(`Language changed to ${newLang}`, 'i18n');
}

/**
 * @description 현재 언어 코드 반환
 */
export function getCurrentLanguage(): Lang {
    return currentLang;
}

/**
 * 키와 대체값을 기반으로 메시지 문자열을 반환합니다.
 */
export function t(key: string, replacements: Replacements = {}): string {
    const keys = key.split('.');
    let message: unknown = keys.reduce(
        (obj: unknown, k: string) =>
            obj && typeof obj === 'object' && k in obj ? (obj as Record<string, unknown>)[k] : key,
        messages as unknown
    );

    if (typeof message !== 'string') {
        message = keys.reduce(
            (obj: unknown, k: string) =>
                obj && typeof obj === 'object' && k in obj
                    ? (obj as Record<string, unknown>)[k]
                    : key,
            locales.en as unknown
        ); // Fallback to English
        if (typeof message !== 'string') {
            logger.warn(`Missing key in all locales: ${key}`, 'i18n');
            return key;
        }
    }

    return message.replace(/{(\w+)}/g, (match: string, placeholder: string) => {
        return replacements[placeholder] !== undefined ? String(replacements[placeholder]) : match;
    });
}
