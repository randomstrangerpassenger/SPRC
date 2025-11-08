import Decimal from 'decimal.js';

// ===== [Phase 1.3 최적화] Decimal 상수 캐싱 =====
/**
 * @description 자주 사용되는 Decimal 상수
 * - 매번 new Decimal()을 호출하는 대신 이 상수를 재사용
 */
export const DECIMAL_ZERO = new Decimal(0);
export const DECIMAL_ONE = new Decimal(1);
export const DECIMAL_HUNDRED = new Decimal(100);
// ===== [Phase 1.3 최적화 끝] =====

// 설정값들을 정의하는 상수 객체
export const CONFIG = {
    MIN_BUYABLE_AMOUNT: 1000,
    DEFAULT_EXCHANGE_RATE: 1300,
    RATIO_TOLERANCE: 0.01,
    DARK_MODE_KEY: 'darkMode', // (LocalStorage에 유지)

    // API 타임아웃 설정 (밀리초)
    API_TIMEOUT: 8000, // 단일 API 호출 타임아웃
    BATCH_API_TIMEOUT: 10000, // 배치 API 호출 타임아웃

    // Worker 타임아웃 설정 (밀리초, 환경변수로 조정 가능)
    WORKER_TIMEOUT: Number(import.meta.env.VITE_WORKER_TIMEOUT) || 10000, // Web Worker 계산 타임아웃

    // 환율 API 키 (.env.local에서 로드)
    EXCHANGE_RATE_API_KEY: import.meta.env.VITE_EXCHANGE_RATE_API_KEY || '',

    // ▼▼▼▼▼ [신규] IndexedDB 키 ▼▼▼▼▼
    IDB_META_KEY: 'portfolioMeta_v2',
    IDB_PORTFOLIOS_KEY: 'portfolioData_v2',
    IDB_SNAPSHOTS_KEY: 'portfolioSnapshots_v2',
    // ▲▲▲▲▲ [신규] ▲▲▲▲▲

    // ▼▼▼▼▼ [수정] 마이그레이션을 위한 레거시 LocalStorage 키 ▼▼▼▼▼
    // (참고: LEGACY_LS_PORTFOLIOS_KEY는 state.js에서 savePortfolios가 저장하던 방식에 맞게 수정됨)
    LEGACY_LS_META_KEY: 'portfolioCalculatorMeta_v1',
    LEGACY_LS_PORTFOLIOS_KEY: 'portfolioCalculatorData_v1_all',
    // ▲▲▲▲▲ [수정] ▲▲▲▲▲

    DATA_VERSION: '2.0.0', // [신규] state.js가 참조하는 버전 키

    // DATA_PREFIX: 'portfolioCalculatorData_v1_', // (주석 처리 - 현재 state.js에서 미사용)
} as const;

export type ConfigType = typeof CONFIG;