// js/decimalLoader.js (새 파일)
// @ts-check

/** @type {typeof import('decimal.js') | null} */
let DecimalLib = null;

/**
 * @description Decimal.js 라이브러리를 비동기적으로 로드하고 클래스를 반환합니다.
 * 한 번 로드된 후에는 캐시된 클래스를 반환합니다.
 * @returns {Promise<typeof import('decimal.js')>} Decimal 클래스 생성자 Promise
 */
export async function getDecimal() {
    if (!DecimalLib) {
        console.log("Loading Decimal.js library...");
        try {
            // 동적 import 사용
            const decimalModule = await import('decimal.js');
            DecimalLib = decimalModule.default; // default export 가져오기
            // Decimal 설정 (로드 후 한 번만 수행)
            DecimalLib.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });
            console.log("Decimal.js loaded and configured.");
        } catch (error) {
            console.error("Failed to load Decimal.js:", error);
            throw new Error("Could not load essential Decimal library."); // 로드 실패 시 에러 발생
        }
    }
    // @ts-ignore - DecimalLib is guaranteed to be non-null here after await
    return DecimalLib;
}

/**
 * @description Decimal 객체를 생성하는 비동기 헬퍼 함수. 라이브러리가 로드되지 않았으면 로드합니다.
 * @param {import('decimal.js').Decimal.Value} value - Decimal로 변환할 값
 * @returns {Promise<import('decimal.js').Decimal>} Decimal 인스턴스 Promise
 */
export async function createDecimal(value) {
    const DecimalConstructor = await getDecimal();
    return new DecimalConstructor(value);
}

/**
 * @description Decimal.max 함수를 비동기로 호출하는 헬퍼 함수.
 * @param {import('decimal.js').Decimal.Value} value1
 * @param {import('decimal.js').Decimal.Value} value2
 * @returns {Promise<import('decimal.js').Decimal>} Decimal 인스턴스 Promise
 */
export async function decimalMax(value1, value2) {
    const DecimalConstructor = await getDecimal();
    // Use DecimalConstructor.max static method
    return DecimalConstructor.max(value1, value2);
}

/**
 * @description Decimal.min 함수를 비동기로 호출하는 헬퍼 함수.
 * @param {import('decimal.js').Decimal.Value} value1
 * @param {import('decimal.js').Decimal.Value} value2
 * @returns {Promise<import('decimal.js').Decimal>} Decimal 인스턴스 Promise
 */
export async function decimalMin(value1, value2) {
    const DecimalConstructor = await getDecimal();
     // Use DecimalConstructor.min static method
    return DecimalConstructor.min(value1, value2);
}