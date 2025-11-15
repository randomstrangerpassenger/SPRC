/**
 * 캐시 네임스페이스
 * 각 캐시는 고유한 네임스페이스로 분리되어 관리됨
 */
export type CacheNamespace =
    | 'portfolio-calculation'   // 포트폴리오 계산 결과
    | 'sector-analysis'         // 섹터 분석 결과
    | 'virtual-scroll-rows'     // VirtualScroll DOM 행
    | 'rebalancing-analysis';   // 리밸런싱 분석 결과

/**
 * 캐시 키 생성 옵션
 */
export interface CacheKeyOptions {
    /** 네임스페이스 */
    namespace: CacheNamespace;
    /** 데이터 버전 (선택사항, 캐시 무효화에 활용) */
    version?: string | number;
    /** 업데이트 타임스탬프 (선택사항) */
    updatedAt?: Date | number;
    /** 추가 키 컴포넌트 */
    components: (string | number)[];
}

/**
 * 캐시 통계 정보
 */
export interface CacheStats {
    /** 캐시 히트 횟수 */
    hits: number;
    /** 캐시 미스 횟수 */
    misses: number;
    /** 히트율 (0-1) */
    hitRate: number;
    /** 현재 캐시 크기 */
    size: number;
    /** 최대 용량 */
    capacity: number;
}

/**
 * 캐시 무효화 패턴
 */
export interface InvalidationPattern {
    /** 네임스페이스 */
    namespace: CacheNamespace;
    /** 키 prefix 패턴 (선택사항, 없으면 전체 네임스페이스 무효화) */
    keyPrefix?: string;
}
