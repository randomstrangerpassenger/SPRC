import Decimal from 'decimal.js';
import type { Stock, Currency } from './types.js';

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
 * @param portfolioData - 포트폴리오 주식 객체 배열
 * @returns 목표 비율 합계
 */
export function getRatioSum(portfolioData: Stock[]): Decimal {
    let sum = new Decimal(0);
    if (!Array.isArray(portfolioData)) return sum;

    for (const s of portfolioData) {
        // targetRatio가 숫자 타입임을 보장하고 Decimal 생성
        const ratio = new Decimal(s.targetRatio || 0);
        sum = sum.plus(ratio);
    }
    return sum;
}

/**
 * @description 숫자를 통화 형식의 문자열로 변환합니다. (null, undefined, Decimal 객체 안전 처리)
 * @param amount - 변환할 금액
 * @param currency - 통화 코드 ('krw', 'usd')
 * @returns 포맷팅된 통화 문자열
 */
export function formatCurrency(
    amount: number | Decimal | string | null | undefined,
    currency: Currency = 'krw'
): string {
    try {
        let num: number;
        if (amount === null || amount === undefined) {
            num = 0;
        } else if (typeof amount === 'object' && 'toNumber' in amount) {
            // Check if it's Decimal-like
            num = amount.toNumber(); // This is synchronous
        } else {
            num = Number(amount);
            if (isNaN(num)) num = 0;
        }

        const options: Intl.NumberFormatOptions = {
            style: 'currency',
            currency: currency.toUpperCase(), // Intl.NumberFormat requires uppercase
        };

        if (currency.toLowerCase() === 'krw') {
            options.minimumFractionDigits = 0;
            options.maximumFractionDigits = 0;
        } else {
            // usd and others
            options.minimumFractionDigits = 2;
            options.maximumFractionDigits = 2;
        }
        return new Intl.NumberFormat(
            currency.toLowerCase() === 'usd' ? 'en-US' : 'ko-KR',
            options
        ).format(num);
    } catch (e) {
        console.error('formatCurrency error:', e);
        return String(amount); // 에러 발생 시 원본 값 문자열로 반환
    }
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
