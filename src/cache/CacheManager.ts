import { LRUCache } from './LRUCache';
import type {
    CacheNamespace,
    CacheKeyOptions,
    CacheStats,
    InvalidationPattern,
} from './CacheTypes';
import { logger } from '../services/Logger';

/**
 * 중앙화된 캐시 관리자 (Singleton)
 *
 * 책임:
 * 1. 네임스페이스 기반 캐시 관리
 * 2. 통합된 캐시 키 생성 전략
 * 3. 표준화된 무효화 전략
 * 4. 캐시 통계 및 모니터링
 *
 * 이점:
 * - 캐시 로직 중앙화로 유지보수 용이
 * - 일관된 캐시 키 전략
 * - 디버깅 및 모니터링 간소화
 */
export class CacheManager {
    private static instance: CacheManager;

    /** 네임스페이스별 캐시 저장소 */
    private caches: Map<CacheNamespace, LRUCache<string, any>> = new Map();

    /** 네임스페이스별 통계 */
    private stats: Map<CacheNamespace, { hits: number; misses: number }> = new Map();

    /** 네임스페이스별 기본 용량 */
    private readonly DEFAULT_CAPACITIES: Record<CacheNamespace, number> = {
        'portfolio-calculation': 20,
        'sector-analysis': 20,
        'virtual-scroll-rows': 50,
        'rebalancing-analysis': 10,
    };

    private constructor() {
        // Singleton: private constructor
        this.initializeAllCaches();
    }

    /**
     * Singleton 인스턴스 획득
     */
    static getInstance(): CacheManager {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }

    /**
     * 모든 네임스페이스 캐시 초기화
     */
    private initializeAllCaches(): void {
        const namespaces: CacheNamespace[] = [
            'portfolio-calculation',
            'sector-analysis',
            'virtual-scroll-rows',
            'rebalancing-analysis',
        ];

        for (const namespace of namespaces) {
            const capacity = this.DEFAULT_CAPACITIES[namespace];
            this.caches.set(namespace, new LRUCache<string, any>(capacity));
            this.stats.set(namespace, { hits: 0, misses: 0 });
        }
    }

    /**
     * 캐시 키 생성 (버전/타임스탬프 포함)
     *
     * 형식: {namespace}:{version}:{updatedAt}:{components}
     *
     * @param options - 캐시 키 생성 옵션
     * @returns 생성된 캐시 키
     */
    generateKey(options: CacheKeyOptions): string {
        const { namespace, version, updatedAt, components } = options;

        const parts: string[] = [namespace];

        // 버전 추가 (선택사항)
        if (version !== undefined) {
            parts.push(`v${version}`);
        }

        // 타임스탬프 추가 (선택사항)
        if (updatedAt !== undefined) {
            const timestamp =
                updatedAt instanceof Date ? updatedAt.getTime() : updatedAt;
            parts.push(`t${timestamp}`);
        }

        // 컴포넌트 추가
        parts.push(...components.map(String));

        return parts.join(':');
    }

    /**
     * 캐시에서 값 조회
     *
     * @param namespace - 캐시 네임스페이스
     * @param key - 캐시 키
     * @returns 캐시된 값 (없으면 undefined)
     */
    get<T>(namespace: CacheNamespace, key: string): T | undefined {
        const cache = this.caches.get(namespace);
        if (!cache) {
            logger.warn(`Cache namespace '${namespace}' not found`, 'CacheManager');
            return undefined;
        }

        const value = cache.get(key) as T | undefined;
        const stats = this.stats.get(namespace)!;

        if (value !== undefined) {
            stats.hits++;
            if (import.meta.env.DEV) {
                logger.debug(
                    `Cache hit: ${namespace} - ${key}`,
                    'CacheManager'
                );
            }
        } else {
            stats.misses++;
            if (import.meta.env.DEV) {
                logger.debug(
                    `Cache miss: ${namespace} - ${key}`,
                    'CacheManager'
                );
            }
        }

        return value;
    }

    /**
     * 캐시에 값 저장
     *
     * @param namespace - 캐시 네임스페이스
     * @param key - 캐시 키
     * @param value - 저장할 값
     */
    set<T>(namespace: CacheNamespace, key: string, value: T): void {
        const cache = this.caches.get(namespace);
        if (!cache) {
            logger.warn(`Cache namespace '${namespace}' not found`, 'CacheManager');
            return;
        }

        cache.set(key, value);

        if (import.meta.env.DEV) {
            logger.debug(
                `Cache set: ${namespace} - ${key}`,
                'CacheManager'
            );
        }
    }

    /**
     * 특정 키 무효화 또는 네임스페이스 전체 무효화
     *
     * @param namespace - 캐시 네임스페이스
     * @param key - 캐시 키 (선택사항, 없으면 네임스페이스 전체 무효화)
     */
    invalidate(namespace: CacheNamespace, key?: string): void {
        const cache = this.caches.get(namespace);
        if (!cache) {
            logger.warn(`Cache namespace '${namespace}' not found`, 'CacheManager');
            return;
        }

        if (key) {
            cache.delete(key);
            logger.debug(
                `Cache invalidated: ${namespace} - ${key}`,
                'CacheManager'
            );
        } else {
            cache.clear();
            logger.debug(
                `Cache namespace cleared: ${namespace}`,
                'CacheManager'
            );
        }
    }

    /**
     * 패턴 기반 캐시 무효화
     *
     * @param pattern - 무효화 패턴
     */
    invalidateByPattern(pattern: InvalidationPattern): void {
        const { namespace, keyPrefix } = pattern;
        const cache = this.caches.get(namespace);

        if (!cache) {
            logger.warn(`Cache namespace '${namespace}' not found`, 'CacheManager');
            return;
        }

        if (!keyPrefix) {
            // prefix가 없으면 전체 무효화
            this.invalidate(namespace);
            return;
        }

        // prefix로 시작하는 모든 키 찾아서 삭제
        // LRUCache는 내부 Map을 사용하므로 직접 접근은 불가능
        // 대신 모든 키를 순회하며 삭제 (비효율적이지만 안전)
        // 더 나은 방법: LRUCache에 keys() 메서드 추가 필요

        // 현재는 전체 무효화로 fallback
        logger.warn(
            `Pattern-based invalidation not fully supported. Clearing entire namespace: ${namespace}`,
            'CacheManager'
        );
        this.invalidate(namespace);
    }

    /**
     * 모든 캐시 무효화
     */
    invalidateAll(): void {
        for (const [namespace, cache] of this.caches.entries()) {
            cache.clear();
            logger.debug(`Cache cleared: ${namespace}`, 'CacheManager');
        }
    }

    /**
     * 특정 네임스페이스의 통계 조회
     *
     * @param namespace - 캐시 네임스페이스
     * @returns 캐시 통계
     */
    getStats(namespace: CacheNamespace): CacheStats {
        const cache = this.caches.get(namespace);
        const stats = this.stats.get(namespace);

        if (!cache || !stats) {
            logger.warn(`Cache namespace '${namespace}' not found`, 'CacheManager');
            return {
                hits: 0,
                misses: 0,
                hitRate: 0,
                size: 0,
                capacity: 0,
            };
        }

        const total = stats.hits + stats.misses;
        const hitRate = total > 0 ? stats.hits / total : 0;

        return {
            hits: stats.hits,
            misses: stats.misses,
            hitRate,
            size: cache.size,
            capacity: cache.capacity,
        };
    }

    /**
     * 모든 네임스페이스의 통계 조회
     *
     * @returns 네임스페이스별 통계 맵
     */
    getAllStats(): Map<CacheNamespace, CacheStats> {
        const allStats = new Map<CacheNamespace, CacheStats>();

        for (const namespace of this.caches.keys()) {
            allStats.set(namespace, this.getStats(namespace));
        }

        return allStats;
    }

    /**
     * 통계 초기화
     *
     * @param namespace - 캐시 네임스페이스 (선택사항, 없으면 모든 통계 초기화)
     */
    resetStats(namespace?: CacheNamespace): void {
        if (namespace) {
            this.stats.set(namespace, { hits: 0, misses: 0 });
        } else {
            for (const ns of this.stats.keys()) {
                this.stats.set(ns, { hits: 0, misses: 0 });
            }
        }
    }
}

/**
 * CacheManager 싱글톤 인스턴스 export
 */
export const cacheManager = CacheManager.getInstance();
