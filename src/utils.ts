import Decimal from 'decimal.js';
import type { Stock, Currency } from './types.ts';
// Import enhanced i18n formatters
import { formatCurrencyEnhanced, formatNumber } from './i18nEnhancements';
import { DECIMAL_ZERO } from './constants';
import { memoizeWithKey } from './cache/memoization';

/**
 * HTML 문자열을 이스케이프하여 XSS 공격을 방지합니다.
 * @param str - 이스케이프할 문자열
 * @returns 이스케이프된 안전한 HTML 문자열
 */
export function escapeHTML(str: string | number | null | undefined): string {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * @description 포트폴리오 데이터에서 목표 비율의 합계를 Decimal 객체로 계산합니다.
 * ===== [Phase 3 최적화] 메모이제이션 적용 =====
 * @param portfolioData - 포트폴리오 주식 객체 배열
 * @returns 목표 비율 합계
 */
const _getRatioSumImpl = (portfolioData: Stock[]): Decimal => {
    let sum = DECIMAL_ZERO;
    if (!Array.isArray(portfolioData)) return sum;

    for (const s of portfolioData) {
        // targetRatio가 숫자 타입임을 보장하고 Decimal 생성
        const ratio = new Decimal(s.targetRatio || 0);
        sum = sum.plus(ratio);
    }
    return sum;
};

// 메모이제이션 적용: 동일한 포트폴리오 데이터에 대해 캐시된 결과 반환
export const getRatioSum = memoizeWithKey(
    _getRatioSumImpl,
    (portfolioData) =>
        Array.isArray(portfolioData)
            ? portfolioData.map((s) => `${s.id}:${s.targetRatio}`).join('|')
            : 'null',
    20 // 캐시 크기: 최근 20개의 포트폴리오 상태 저장
);
// ===== [Phase 3 최적화 끝] =====

/**
 * @description 숫자를 통화 형식의 문자열로 변환합니다. (Enhanced with i18n)
 * @param amount - 변환할 금액
 * @param currency - 통화 코드 ('krw', 'usd')
 * @returns 포맷팅된 통화 문자열
 */
export function formatCurrency(
    amount: number | Decimal | string | null | undefined,
    currency: Currency = 'krw'
): string {
    // Use enhanced i18n formatter
    return formatCurrencyEnhanced(amount, currency);
}

/**
 * @description 함수 실행을 지연시키는 디바운스 함수를 생성합니다.
 * @param func - 디바운싱을 적용할 함수
 * @param delay - 지연 시간 (ms)
 * @param immediate - 첫 이벤트 시 즉시 실행할지 여부
 * @returns 디바운싱이 적용된 새로운 함수
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay = 300,
    immediate = false
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    return function (this: any, ...args: Parameters<T>) {
        const context = this; // 'this' 컨텍스트 저장
        const callNow = immediate && !timeoutId; // 즉시 실행 조건: immediate가 true이고 타이머가 없을 때
        clearTimeout(timeoutId); // 기존 타이머 취소
        timeoutId = setTimeout(() => {
            timeoutId = undefined; // 타이머 완료 후 ID 초기화
            if (!immediate) func.apply(context, args); // immediate가 false면 지연 후 실행
        }, delay);
        if (callNow) func.apply(context, args); // 즉시 실행 조건 충족 시 바로 실행
    };
}

/**
 * @description 고유 ID를 생성합니다. (nanoid 대체)
 * @returns 고유 ID 문자열
 */
export function generateId(): string {
    // ===== [Phase 3.4 최적화] nanoid 대체 =====
    // nanoid를 간단한 유틸 함수로 교체하여 번들 크기 감소
    // Date.now()와 Math.random()을 조합하여 충분히 고유한 ID 생성
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
    // ===== [Phase 3.4 최적화 끝] =====
}

/**
 * @description 다양한 타입의 값을 안전하게 Decimal 객체로 변환합니다.
 * @param value - 변환할 값 (number, Decimal, string, null, undefined)
 * @returns Decimal 객체 (null/undefined인 경우 DECIMAL_ZERO 반환)
 */
export function toDecimal(value: number | Decimal | string | null | undefined): Decimal {
    if (value instanceof Decimal) return value;
    if (value == null) return DECIMAL_ZERO;
    return new Decimal(value);
}

/**
 * @description 값이 Decimal 타입인지 확인하고, 아니면 TypeError를 throw합니다.
 * @param value - 확인할 값
 * @returns Decimal 객체 (타입 가드)
 * @throws {TypeError} 값이 Decimal이 아닌 경우
 */
export function ensureDecimal(value: unknown): Decimal {
    if (value instanceof Decimal) return value;
    throw new TypeError(`Expected Decimal, got ${typeof value}`);
}

// Re-export enhanced formatters for convenience
export { formatNumber, formatCurrencyEnhanced } from './i18nEnhancements';
