// @ts-check
import Decimal from 'decimal.js'; // 동기 임포트로 복구

/** @typedef {import('decimal.js').Decimal} Decimal */ // 타입 정의는 유지
/** @typedef {import('./types.js').Stock} Stock */ // Stock 타입 추가

/**
 * HTML 문자열을 이스케이프하여 XSS 공격을 방지합니다.
 * @param {string | number | null | undefined} str - 이스케이프할 문자열
 * @returns {string} 이스케이프된 안전한 HTML 문자열
 */
export function escapeHTML(str) {
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
 * @param {Stock[]} portfolioData - 포트폴리오 주식 객체 배열
 * @returns {Decimal} 목표 비율 합계
 */
export function getRatioSum(portfolioData) {
    let sum = new Decimal(0); // Decimal 생성은 동기
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
 * @param {number|Decimal|string|null|undefined} amount - 변환할 금액
 * @param {string} currency - 통화 코드 ('krw', 'usd')
 * @returns {string} 포맷팅된 통화 문자열
 */
export function formatCurrency(amount, currency = 'krw') {
    try {
        let num;
        if (amount === null || amount === undefined) {
            num = 0;
        } else if (typeof amount === 'object' && 'toNumber' in amount) { // Check if it's Decimal-like
            // @ts-ignore
            num = amount.toNumber(); // This is synchronous
        } else {
            num = Number(amount);
            if (isNaN(num)) num = 0;
        }

        const options = {
            style: 'currency',
            currency: currency.toUpperCase(), // Intl.NumberFormat requires uppercase
        };

        if (currency.toLowerCase() === 'krw') {
            options.minimumFractionDigits = 0;
            options.maximumFractionDigits = 0;
        } else { // usd and others
            options.minimumFractionDigits = 2;
            options.maximumFractionDigits = 2;
        }
        return new Intl.NumberFormat(currency.toLowerCase() === 'usd' ? 'en-US' : 'ko-KR', options).format(num);
    } catch (e) {
        console.error("formatCurrency error:", e);
        return String(amount); // 에러 발생 시 원본 값 문자열로 반환
    }
}

/**
 * @description 함수 실행을 지연시키는 디바운스 함수를 생성합니다.
 * @param {Function} func - 디바운싱을 적용할 함수
 * @param {number} [delay=300] - 지연 시간 (ms)
 * @param {boolean} [immediate=false] - 첫 이벤트 시 즉시 실행할지 여부
 * @returns {Function} 디바운싱이 적용된 새로운 함수
 */
export function debounce(func, delay = 300, immediate = false) { // immediate 옵션 추가
    let timeoutId;
    return function(...args) {
        const context = this; // 'this' 컨텍스트 저장
        const callNow = immediate && !timeoutId; // 즉시 실행 조건 확인
        // @ts-ignore
        clearTimeout(timeoutId); // 기존 타이머 취소
        timeoutId = setTimeout(() => {
            timeoutId = null; // 타이머 완료 후 ID 초기화
            if (!immediate) func.apply(context, args); // immediate가 false면 지연 후 실행
        }, delay);
        if (callNow) func.apply(context, args); // 즉시 실행 조건 충족 시 바로 실행
    };
}