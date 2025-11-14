import Decimal from 'decimal.js';

// Decimal 상수 캐싱
/**
 * @description 자주 사용되는 Decimal 상수
 * - 매번 new Decimal()을 호출하는 대신 이 상수를 재사용
 */
export const DECIMAL_ZERO = new Decimal(0);
export const DECIMAL_ONE = new Decimal(1);
export const DECIMAL_HUNDRED = new Decimal(100);

// 설정값들을 정의하는 상수 객체
export const CONFIG = {
    MIN_BUYABLE_AMOUNT: 1000,
    DEFAULT_EXCHANGE_RATE: 1300,
    RATIO_TOLERANCE: 0.01,
    DARK_MODE_KEY: 'darkMode', // (LocalStorage에 유지)

    // API 타임아웃 설정 (밀리초)
    API_TIMEOUT: 8000, // 단일 API 호출 타임아웃
    BATCH_API_TIMEOUT: 10000, // 배치 API 호출 타임아웃

    // API Retry 설정
    API_MAX_RETRIES: 3, // 최대 재시도 횟수
    API_RETRY_BASE_DELAY: 1000, // 기본 지연 시간 (밀리초)
    API_RETRY_MAX_DELAY: 10000, // 최대 지연 시간 (밀리초)
    API_RETRY_JITTER_FACTOR: 0.3, // 지터 계수 (0-1, 지연 시간의 ±30% 범위로 무작위화)

    // Worker 타임아웃 설정 (밀리초, 환경변수로 조정 가능)
    WORKER_TIMEOUT: Number(import.meta.env.VITE_WORKER_TIMEOUT) || 10000, // Web Worker 계산 타임아웃

    // 환율 API 키 (.env.local에서 로드)
    EXCHANGE_RATE_API_KEY: import.meta.env.VITE_EXCHANGE_RATE_API_KEY || '',

    // IndexedDB 키
    IDB_META_KEY: 'portfolioMeta_v2',
    IDB_PORTFOLIOS_KEY: 'portfolioData_v2',
    IDB_SNAPSHOTS_KEY: 'portfolioSnapshots_v2',

    // 마이그레이션을 위한 레거시 LocalStorage 키
    // (참고: LEGACY_LS_PORTFOLIOS_KEY는 state.js에서 savePortfolios가 저장하던 방식에 맞게 수정됨)
    LEGACY_LS_META_KEY: 'portfolioCalculatorMeta_v1',
    LEGACY_LS_PORTFOLIOS_KEY: 'portfolioCalculatorData_v1_all',

    DATA_VERSION: '2.0.0', // state.js가 참조하는 버전 키

    // DATA_PREFIX: 'portfolioCalculatorData_v1_', // (현재 state.js에서 미사용)
} as const;

/**
 * @description 리스크 분석 임계값
 */
export const THRESHOLDS = {
    /** 단일 종목 비중 경고 임계값 (%) */
    SINGLE_STOCK_WARNING: 30,
    /** 섹터 집중도 경고 임계값 (%) */
    SECTOR_CONCENTRATION_WARNING: 40,
} as const;

/**
 * @description UI 관련 상수
 */
export const UI = {
    /** 가상 스크롤: 입력 행 높이 (px) */
    ROW_INPUT_HEIGHT: 60,
    /** 가상 스크롤: 출력 행 높이 (px) */
    ROW_OUTPUT_HEIGHT: 50,
    /** 가상 스크롤: 버퍼 행 수 */
    VISIBLE_ROWS_BUFFER: 5,
    /** 가상 스크롤: LRU 캐시 크기 */
    ROW_CACHE_SIZE: 50,
    /** 가상 스크롤: 기본 뷰포트 높이 (px) - 계산 실패 시 fallback */
    DEFAULT_VIEWPORT_HEIGHT: 600,
} as const;

/**
 * @description 캐시 관련 상수
 */
export const CACHE = {
    /** 포트폴리오 계산 LRU 캐시 크기 */
    PORTFOLIO_CACHE_SIZE: 20,
    /** 주식 계산 LRU 캐시 크기 */
    STOCK_CACHE_SIZE: 20,
} as const;

/**
 * @description 성능 모니터링 관련 상수
 */
export const PERFORMANCE = {
    /** 성능 메트릭 최대 저장 개수 */
    MAX_METRICS: 1000,
} as const;

/**
 * @description 반응형 디자인 분기점
 */
export const BREAKPOINTS = {
    /** 모바일 분기점 (px) */
    MOBILE: 768,
} as const;

/**
 * @description CSS 클래스 이름 상수
 */
export const CSS_CLASSES = {
    HIDDEN: 'hidden',
    INPUT_INVALID: 'input-invalid',
    VALID: 'valid',
    INVALID: 'invalid',
    KEYBOARD_NAV: 'keyboard-nav',
    DARK_MODE: 'dark-mode',
    IN_VIEW: 'in-view',
    SHOW: 'show',
    CALCULATION_LOADER: 'calculation-loader',
} as const;

/**
 * @description Toast 메시지 타입
 */
export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning',
} as const;

/**
 * @description ARIA 우선순위
 */
export const ARIA_POLITENESS = {
    POLITE: 'polite',
    ASSERTIVE: 'assertive',
} as const;

/**
 * @description UI 타이밍 및 지연 설정 (밀리초)
 */
export const TIMING = {
    /** 자동 저장 debounce 지연 시간 */
    DEBOUNCE_SAVE_DELAY: 500,
    /** 스크린 리더 알림을 위한 지연 시간 */
    A11Y_SCREEN_READER_DELAY: 100,
    /** Toast 메시지 기본 표시 시간 */
    TOAST_DEFAULT_DURATION: 3000,
} as const;

export type ConfigType = typeof CONFIG;
