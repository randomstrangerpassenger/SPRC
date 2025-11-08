// src/i18nEnhancements.ts
/**
 * @description 국제화 숫자 포맷팅 유틸리티
 */

import Decimal from 'decimal.js';
import type { Currency } from './types';

// ===== [Phase 1.2 최적화] Intl.NumberFormat 캐싱 =====
/**
 * @description NumberFormat 인스턴스 캐시
 * - 키: locale + JSON.stringify(options)
 * - 값: Intl.NumberFormat 인스턴스
 */
const numberFormatCache = new Map<string, Intl.NumberFormat>();
const MAX_CACHE_SIZE = 50;

/**
 * @description 캐시된 NumberFormat 인스턴스 가져오기
 * @param locale - 로케일
 * @param options - NumberFormat 옵션
 * @returns Intl.NumberFormat 인스턴스
 */
function getCachedNumberFormat(
    locale: string,
    options: Intl.NumberFormatOptions
): Intl.NumberFormat {
    const cacheKey = `${locale}:${JSON.stringify(options)}`;

    let formatter = numberFormatCache.get(cacheKey);
    if (!formatter) {
        formatter = new Intl.NumberFormat(locale, options);

        // 캐시 크기 제한 (LRU 방식 대신 간단하게 전체 클리어)
        if (numberFormatCache.size >= MAX_CACHE_SIZE) {
            numberFormatCache.clear();
        }

        numberFormatCache.set(cacheKey, formatter);
    }

    return formatter;
}
// ===== [Phase 1.2 최적화 끝] =====

/**
 * @description 현재 언어 설정 가져오기
 * @returns 'ko' | 'en'
 */
export function getCurrentLanguage(): 'ko' | 'en' {
    // localStorage에서 언어 설정 가져오기
    const storedLang = localStorage.getItem('app_language');
    if (storedLang === 'ko' || storedLang === 'en') {
        return storedLang;
    }

    // 브라우저 언어 감지
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ko')) {
        return 'ko';
    }
    return 'en';
}

/**
 * @description 언어 설정 변경
 * @param lang - 'ko' | 'en'
 */
export function setLanguage(lang: 'ko' | 'en'): void {
    localStorage.setItem('app_language', lang);
    // 페이지 리로드 또는 이벤트 발생으로 UI 업데이트
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

/**
 * @description 숫자를 로케일에 맞게 포맷팅 (소수점 있는 숫자)
 * @param value - 숫자 또는 Decimal
 * @param fractionDigits - 소수점 자릿수 (기본값: 2)
 * @returns 포맷팅된 문자열
 */
export function formatNumber(
    value: number | Decimal | string | null | undefined,
    fractionDigits: number = 2
): string {
    const lang = getCurrentLanguage();
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';

    let num: number;
    if (value === null || value === undefined) {
        num = 0;
    } else if (typeof value === 'object' && 'toNumber' in value) {
        num = value.toNumber();
    } else {
        num = Number(value);
        if (isNaN(num)) num = 0;
    }

    return getCachedNumberFormat(locale, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(num);
}

/**
 * @description 퍼센트를 로케일에 맞게 포맷팅
 * @param value - 숫자 (예: 15.5 = 15.5%)
 * @param fractionDigits - 소수점 자릿수 (기본값: 2)
 * @returns 포맷팅된 문자열
 */
export function formatPercent(
    value: number | Decimal | string | null | undefined,
    fractionDigits: number = 2
): string {
    const lang = getCurrentLanguage();
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';

    let num: number;
    if (value === null || value === undefined) {
        num = 0;
    } else if (typeof value === 'object' && 'toNumber' in value) {
        num = value.toNumber();
    } else {
        num = Number(value);
        if (isNaN(num)) num = 0;
    }

    return getCachedNumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(num / 100); // Intl.NumberFormat의 percent는 0-1 범위를 사용
}

/**
 * @description 통화를 로케일에 맞게 포맷팅 (기존 formatCurrency 개선 버전)
 * @param amount - 금액
 * @param currency - 통화 ('krw', 'usd')
 * @returns 포맷팅된 문자열
 */
export function formatCurrencyEnhanced(
    amount: number | Decimal | string | null | undefined,
    currency: Currency = 'krw'
): string {
    const lang = getCurrentLanguage();

    try {
        let num: number;
        if (amount === null || amount === undefined) {
            num = 0;
        } else if (typeof amount === 'object' && 'toNumber' in amount) {
            num = amount.toNumber();
        } else {
            num = Number(amount);
            if (isNaN(num)) num = 0;
        }

        const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
        const options: Intl.NumberFormatOptions = {
            style: 'currency',
            currency: currency.toUpperCase(),
        };

        if (currency.toLowerCase() === 'krw') {
            options.minimumFractionDigits = 0;
            options.maximumFractionDigits = 0;
        } else {
            options.minimumFractionDigits = 2;
            options.maximumFractionDigits = 2;
        }

        return getCachedNumberFormat(locale, options).format(num);
    } catch (e) {
        console.error('formatCurrencyEnhanced error:', e);
        return String(amount);
    }
}

/**
 * @description 큰 숫자를 축약 형태로 포맷팅 (예: 1,234,567 → 1.23M)
 * @param value - 숫자
 * @param fractionDigits - 소수점 자릿수
 * @returns 축약된 문자열
 */
export function formatCompactNumber(
    value: number | Decimal | string | null | undefined,
    fractionDigits: number = 2
): string {
    const lang = getCurrentLanguage();
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';

    let num: number;
    if (value === null || value === undefined) {
        num = 0;
    } else if (typeof value === 'object' && 'toNumber' in value) {
        num = value.toNumber();
    } else {
        num = Number(value);
        if (isNaN(num)) num = 0;
    }

    // Intl.NumberFormat의 notation: 'compact'는 일부 브라우저에서만 지원
    try {
        return getCachedNumberFormat(locale, {
            notation: 'compact' as any, // TypeScript 버전에 따라 type assertion 필요
            minimumFractionDigits: 0,
            maximumFractionDigits: fractionDigits,
        }).format(num);
    } catch (e) {
        // Fallback: 수동 축약
        if (num >= 1_000_000_000) {
            return `${(num / 1_000_000_000).toFixed(fractionDigits)}B`;
        } else if (num >= 1_000_000) {
            return `${(num / 1_000_000).toFixed(fractionDigits)}M`;
        } else if (num >= 1_000) {
            return `${(num / 1_000).toFixed(fractionDigits)}K`;
        }
        return num.toFixed(fractionDigits);
    }
}

/**
 * @description 날짜를 로케일에 맞게 포맷팅
 * @param date - Date 객체 또는 날짜 문자열
 * @param style - 'short' | 'medium' | 'long' | 'full'
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(
    date: Date | string,
    style: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
    const lang = getCurrentLanguage();
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat(locale, {
        dateStyle: style,
    }).format(dateObj);
}

/**
 * @description 상대 시간 포맷팅 (예: "3일 전", "2 hours ago")
 * @param date - Date 객체 또는 날짜 문자열
 * @returns 상대 시간 문자열
 */
export function formatRelativeTime(date: Date | string): string {
    const lang = getCurrentLanguage();
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    try {
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

        if (diffYear > 0) return rtf.format(-diffYear, 'year');
        if (diffMonth > 0) return rtf.format(-diffMonth, 'month');
        if (diffDay > 0) return rtf.format(-diffDay, 'day');
        if (diffHour > 0) return rtf.format(-diffHour, 'hour');
        if (diffMin > 0) return rtf.format(-diffMin, 'minute');
        return rtf.format(-diffSec, 'second');
    } catch (e) {
        // Fallback
        if (diffYear > 0) return lang === 'ko' ? `${diffYear}년 전` : `${diffYear} years ago`;
        if (diffMonth > 0) return lang === 'ko' ? `${diffMonth}개월 전` : `${diffMonth} months ago`;
        if (diffDay > 0) return lang === 'ko' ? `${diffDay}일 전` : `${diffDay} days ago`;
        if (diffHour > 0) return lang === 'ko' ? `${diffHour}시간 전` : `${diffHour} hours ago`;
        if (diffMin > 0) return lang === 'ko' ? `${diffMin}분 전` : `${diffMin} minutes ago`;
        return lang === 'ko' ? '방금 전' : 'just now';
    }
}
