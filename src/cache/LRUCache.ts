// src/cache/LRUCache.ts
/**
 * @class LRUCache
 * @description Least Recently Used (LRU) 캐시 구현
 * @template K - 키 타입
 * @template V - 값 타입
 */
export class LRUCache<K, V> {
    #capacity: number;
    #cache: Map<K, V>;

    /**
     * @param capacity - 캐시 최대 용량 (기본값: 50)
     */
    constructor(capacity: number = 50) {
        this.#capacity = capacity;
        this.#cache = new Map<K, V>();
    }

    /**
     * @description 캐시에서 값을 가져옵니다. 가져온 항목은 가장 최근 사용으로 표시됩니다.
     * @param key - 검색할 키
     * @returns 캐시된 값 또는 undefined
     */
    get(key: K): V | undefined {
        if (!this.#cache.has(key)) {
            return undefined;
        }

        // 가져온 항목을 가장 최근 사용으로 표시 (Map의 마지막으로 이동)
        const value = this.#cache.get(key)!;
        this.#cache.delete(key);
        this.#cache.set(key, value);

        return value;
    }

    /**
     * @description 캐시에 값을 저장합니다.
     * @param key - 저장할 키
     * @param value - 저장할 값
     */
    set(key: K, value: V): void {
        // 이미 존재하는 키면 삭제 (재삽입하여 순서 갱신)
        if (this.#cache.has(key)) {
            this.#cache.delete(key);
        }

        // 용량 초과 시 가장 오래된 항목 제거 (Map의 첫 번째 항목)
        if (this.#cache.size >= this.#capacity) {
            const firstKey = this.#cache.keys().next().value;
            if (firstKey !== undefined) {
                this.#cache.delete(firstKey);
            }
        }

        this.#cache.set(key, value);
    }

    /**
     * @description 캐시를 비웁니다.
     */
    clear(): void {
        this.#cache.clear();
    }

    /**
     * @description 캐시에 키가 존재하는지 확인합니다.
     * @param key - 확인할 키
     * @returns 존재 여부
     */
    has(key: K): boolean {
        return this.#cache.has(key);
    }

    /**
     * @description 현재 캐시 크기를 반환합니다.
     * @returns 캐시에 저장된 항목 수
     */
    get size(): number {
        return this.#cache.size;
    }

    /**
     * @description 캐시 용량을 반환합니다.
     * @returns 최대 용량
     */
    get capacity(): number {
        return this.#capacity;
    }

    /**
     * @description 캐시에서 특정 키를 삭제합니다.
     * @param key - 삭제할 키
     * @returns 삭제 성공 여부
     */
    delete(key: K): boolean {
        return this.#cache.delete(key);
    }
}