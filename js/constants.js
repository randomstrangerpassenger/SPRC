// 설정값들을 정의하는 상수 객체
export const CONFIG = {
    MIN_BUYABLE_AMOUNT: 1000, // 매수 추천 최소 금액 (이 금액 미만은 추천 목록에서 제외될 수 있음)
    DEFAULT_EXCHANGE_RATE: 1300, // 기본 환율 값
    RATIO_TOLERANCE: 0.01, // 목표 비율 합계가 100%에서 벗어나도 허용하는 오차 범위 (%)
    META_KEY: 'portfolioCalculatorMeta_v1', // localStorage에 설정(활성 ID 등) 저장 시 사용할 키
    DATA_PREFIX: 'portfolioCalculatorData_v1_', // localStorage에 개별 포트폴리오 데이터 저장 시 사용할 접두사
    DARK_MODE_KEY: 'darkMode' // localStorage에 다크 모드 설정 저장 시 사용할 키
};