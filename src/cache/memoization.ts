// src/cache/memoization.ts
/**
 * @description 함수 결과를 메모이제이션하는 유틸리티
 */

/**
 * @description 단일 인자 함수에 대한 메모이제이션
 * @param fn - 메모이제이션할 함수
 * @param cacheSize - 캐시 크기 (기본값: 10)
 * @returns 메모이제이션된 함수
 */
export function memoize<T, R>(fn: (arg: T) => R, cacheSize: number = 10): (arg: T) => R {
    const cache = new Map<T, R>();

    return (arg: T): R => {
        if (cache.has(arg)) {
            return cache.get(arg)!;
        }

        const result = fn(arg);

        // LRU 캐시 크기 제한
        if (cache.size >= cacheSize) {
            const firstKey = cache.keys().next().value;
            if (firstKey !== undefined) {
                cache.delete(firstKey);
            }
        }

        cache.set(arg, result);
        return result;
    };
}

/**
 * @description 다중 인자 함수에 대한 메모이제이션 (문자열 키 기반)
 * @param fn - 메모이제이션할 함수
 * @param keyGenerator - 캐시 키 생성 함수
 * @param cacheSize - 캐시 크기 (기본값: 10)
 * @returns 메모이제이션된 함수
 */
export function memoizeWithKey<Args extends any[], R>(
    fn: (...args: Args) => R,
    keyGenerator: (...args: Args) => string,
    cacheSize: number = 10
): (...args: Args) => R {
    const cache = new Map<string, R>();

    return (...args: Args): R => {
        const key = keyGenerator(...args);

        if (cache.has(key)) {
            return cache.get(key)!;
        }

        const result = fn(...args);

        // LRU 캐시 크기 제한
        if (cache.size >= cacheSize) {
            const firstKey = cache.keys().next().value;
            if (firstKey !== undefined) {
                cache.delete(firstKey);
            }
        }

        cache.set(key, result);
        return result;
    };
}