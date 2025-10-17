import Decimal from 'decimal.js';

/**
 * HTML 문자열을 이스케이프하여 XSS 공격을 방지합니다.
 * @param {string} str - 이스케이프할 문자열
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
 * 포트폴리오 데이터에서 목표 비율의 합계를 계산합니다.
 * @param {Array<Object>} portfolioData - 포트폴리오 주식 객체 배열
 * @returns {number} 목표 비율의 합계
 */
export function getRatioSum(portfolioData) {
    return portfolioData.reduce((sum, s) => sum + (s.targetRatio || 0), 0);
}

/**
 * 숫자를 통화 형식의 문자열로 변환합니다.
 * @param {number|Decimal|string} amount - 변환할 금액
 * @param {string} currency - 통화 코드 ('KRW', 'USD')
 * @returns {string} 포맷팅된 통화 문자열
 */
export function formatCurrency(amount, currency = 'KRW') {
    const num = (typeof amount === 'number' || typeof amount === 'string') ? Number(amount) : amount.toNumber();
    const options = {
        style: 'currency',
        currency: currency,
    };
    if (currency.toUpperCase() === 'KRW') {
        options.minimumFractionDigits = 0;
        options.maximumFractionDigits = 0;
    } else { // USD and others
        options.minimumFractionDigits = 2;
        options.maximumFractionDigits = 2;
    }
    return new Intl.NumberFormat(currency.toUpperCase() === 'USD' ? 'en-US' : 'ko-KR', options).format(num);
}

/**
 * 함수 실행을 지연시키는 디바운스 함수를 생성합니다.
 * @param {Function} func - 디바운싱을 적용할 함수
 * @param {number} delay - 지연 시간 (ms)
 * @returns {Function} 디바운싱이 적용된 새로운 함수
 */
export function debounce(func, delay = 300) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}