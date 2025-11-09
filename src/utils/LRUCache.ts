// src/utils/LRUCache.ts

/**
 * @class LRUCache
 * @description LRU (Least Recently Used) 캐시 구현
 * - Map의 삽입 순서 보장 특성을 활용
 * - 캐시 크기 제한으로 메모리 효율적 관리
 * @template K - 키 타입
 * @template V - 값 타입
 */
export class LRUCache<K, V> {
    private cache: Map<K, V>;
    private maxSize: number;

    /**
     * @param maxSize - 최대 캐시 크기
     */
    constructor(maxSize: number) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    /**
     * @description 캐시에서 값 가져오기 (최근 사용으로 갱신)
     */
    get(key: K): V | undefined {
        const value = this.cache.get(key);
        if (value !== undefined) {
            // 최근 사용으로 갱신: 삭제 후 다시 삽입
            this.cache.delete(key);
            this.cache.set(key, value);
        }
        return value;
    }

    /**
     * @description 캐시에 값 저장 (LRU 정책 적용)
     */
    set(key: K, value: V): void {
        // 이미 존재하면 삭제 (순서 갱신 위해)
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        // 새 항목 추가
        this.cache.set(key, value);

        // 캐시 크기 초과 시 가장 오래된 항목 제거
        if (this.cache.size > this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }
    }

    /**
     * @description 캐시에서 항목 삭제
     */
    delete(key: K): boolean {
        return this.cache.delete(key);
    }

    /**
     * @description 캐시에 키가 존재하는지 확인
     */
    has(key: K): boolean {
        return this.cache.has(key);
    }

    /**
     * @description 캐시 비우기
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * @description 캐시 크기 반환
     */
    get size(): number {
        return this.cache.size;
    }
}