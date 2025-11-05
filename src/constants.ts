// 설정값들을 정의하는 상수 객체
export const CONFIG = {
    MIN_BUYABLE_AMOUNT: 1000,
    DEFAULT_EXCHANGE_RATE: 1300,
    RATIO_TOLERANCE: 0.01,
    DARK_MODE_KEY: 'darkMode', // (LocalStorage에 유지)

    // ▼▼▼▼▼ [신규] IndexedDB 키 ▼▼▼▼▼
    IDB_META_KEY: 'portfolioMeta_v2',
    IDB_PORTFOLIOS_KEY: 'portfolioData_v2',
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