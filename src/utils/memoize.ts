// src/utils/memoize.ts
/**
 * @description 메모이제이션 헬퍼 함수들
 * (Phase 3-2: 성능 최적화)
 */

/**
 * @description 단순 메모이제이션 (인자 1개)
 * @param fn - 메모이제이션할 함수
 * @returns 메모이제이션된 함수
 */
export function memoize<T, R>(fn: (arg: T) => R): (arg: T) => R {
    const cache = new Map<T, R>();

    return (arg: T): R => {
        if (cache.has(arg)) {
            return cache.get(arg)!;
        }

        const result = fn(arg);
        cache.set(arg, result);
        return result;
    };
}

/**
 * @description 복잡한 객체를 키로 사용하는 메모이제이션
 * @param fn - 메모이제이션할 함수
 * @param keyFn - 캐시 키를 생성하는 함수 (기본값: JSON.stringify)
 * @returns 메모이제이션된 함수
 */
export function memoizeComplex<T, R>(
    fn: (arg: T) => R,
    keyFn: (arg: T) => string = JSON.stringify
): (arg: T) => R {
    const cache = new Map<string, R>();

    return (arg: T): R => {
        const key = keyFn(arg);

        if (cache.has(key)) {
            return cache.get(key)!;
        }

        const result = fn(arg);
        cache.set(key, result);
        return result;
    };
}

/**
 * @description 시간 제한이 있는 메모이제이션 (TTL)
 * @param fn - 메모이제이션할 함수
 * @param ttl - 캐시 유지 시간 (밀리초)
 * @returns 메모이제이션된 함수
 */
export function memoizeWithTTL<T, R>(fn: (arg: T) => R, ttl: number): (arg: T) => R {
    const cache = new Map<T, { value: R; expiry: number }>();

    return (arg: T): R => {
        const now = Date.now();
        const cached = cache.get(arg);

        if (cached && cached.expiry > now) {
            return cached.value;
        }

        const result = fn(arg);
        cache.set(arg, { value: result, expiry: now + ttl });

        // 만료된 엔트리 정리 (메모리 누수 방지)
        if (cache.size > 100) {
            for (const [key, entry] of cache.entries()) {
                if (entry.expiry <= now) {
                    cache.delete(key);
                }
            }
        }

        return result;
    };
}

/**
 * @description LRU 방식의 메모이제이션 (최대 크기 제한)
 * @param fn - 메모이제이션할 함수
 * @param maxSize - 최대 캐시 크기
 * @returns 메모이제이션된 함수
 */
export function memoizeLRU<T, R>(fn: (arg: T) => R, maxSize: number = 100): (arg: T) => R {
    const cache = new Map<T, R>();

    return (arg: T): R => {
        if (cache.has(arg)) {
            const value = cache.get(arg)!;
            // LRU: 재접근 시 맨 뒤로 이동
            cache.delete(arg);
            cache.set(arg, value);
            return value;
        }

        const result = fn(arg);

        // 최대 크기 초과 시 가장 오래된 항목 제거
        if (cache.size >= maxSize) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }

        cache.set(arg, result);
        return result;
    };
}

/**
 * @description 조건부 메모이제이션 (특정 조건에서만 캐시)
 * @param fn - 메모이제이션할 함수
 * @param shouldCache - 캐시 여부를 결정하는 함수
 * @returns 메모이제이션된 함수
 */
export function memoizeIf<T, R>(
    fn: (arg: T) => R,
    shouldCache: (arg: T, result: R) => boolean
): (arg: T) => R {
    const cache = new Map<T, R>();

    return (arg: T): R => {
        if (cache.has(arg)) {
            return cache.get(arg)!;
        }

        const result = fn(arg);

        if (shouldCache(arg, result)) {
            cache.set(arg, result);
        }

        return result;
    };
}

/**
 * @description 메모이제이션 캐시 무효화
 * @param memoizedFn - 메모이제이션된 함수
 */
export function clearMemoCache(memoizedFn: Function): void {
    // 실제 구현은 함수마다 다르므로, 여기서는 placeholder
    // 실제 사용 시에는 각 memoize 함수가 clear 메서드를 제공하도록 확장 가능
    console.warn('[memoize] Cache clearing not implemented for this function');
}

/**
 * @description 여러 인자를 받는 함수의 메모이제이션
 * @param fn - 메모이제이션할 함수
 * @returns 메모이제이션된 함수
 */
export function memoizeMultiArg<T extends any[], R>(fn: (...args: T) => R): (...args: T) => R {
    const cache = new Map<string, R>();

    return (...args: T): R => {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key)!;
        }

        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
}
