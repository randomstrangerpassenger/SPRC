export const MESSAGES = {
    // Toast Messages
    DATA_RESET: "데이터가 초기화되었습니다.",
    RATIOS_NORMALIZED: "목표 비율이 100%에 맞춰 조정되었습니다.",
    NO_RATIOS_TO_NORMALIZE: "자동 조정을 위한 목표 비율이 없습니다.",
    SAVE_SUCCESS: "포트폴리오가 저장되었습니다.",
    SAVE_NO_DATA: "저장할 데이터가 없습니다.",
    LOAD_SUCCESS: "저장된 데이터를 불러왔습니다.",
    IMPORT_SUCCESS: "데이터를 성공적으로 불러왔습니다.",
    IMPORT_ERROR: "파일을 불러오는 중 오류가 발생했습니다.",
    PORTFOLIO_CREATED: (name) => `포트폴리오 '${name}'이(가) 생성되었습니다.`,
    PORTFOLIO_RENAMED: "포트폴리오 이름이 변경되었습니다.",
    PORTFOLIO_DELETED: "포트폴리오가 삭제되었습니다.",
    LAST_PORTFOLIO_DELETE_ERROR: "마지막 포트폴리오는 삭제할 수 없습니다.",
    TRANSACTION_ADDED: "거래 내역이 추가되었습니다.",
    TRANSACTION_DELETED: "거래 내역이 삭제되었습니다.",
    CONFIRM_RESET: "현재 포트폴리오를 초기 템플릿으로 되돌리시겠습니까?",
    CONFIRM_LOAD: "경고: 현재 입력된 내용을 덮어쓰고 저장된 데이터를 불러오시겠습니까?",
    CONFIRM_DELETE_PORTFOLIO: (name) => `정말로 '${name}' 포트폴리오를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
    CONFIRM_DELETE_TRANSACTION: "이 거래 내역을 정말로 삭제하시겠습니까?",
    CONFIRM_RATIO_SUM_WARN: (totalRatio) => `목표비율 합이 ${totalRatio.toFixed(1)}%입니다. 그래도 계산하시겠습니까?`,
    CALCULATION_ERROR: "계산 중 오류가 발생했습니다. 입력값을 확인해주세요.",
    VALIDATION_ERROR_PREFIX: "입력값을 확인해주세요: ",
    SAVE_ERROR_GENERAL: "저장 중 오류가 발생했습니다.",
    SAVE_ERROR_QUOTA: "저장 공간이 부족합니다.",
    CALC_ERROR_DECIMAL: "입력값이 너무 크거나 잘못된 형식입니다.",
    CALC_ERROR_TYPE: "데이터 형식 오류가 발생했습니다.",

    // Prompts
    PROMPT_NEW_PORTFOLIO_NAME: "새 포트폴리오의 이름을 입력하세요:",
    PROMPT_RENAME_PORTFOLIO: "새로운 포트폴리오 이름을 입력하세요:",

    // Validation Error Messages
    INVESTMENT_AMOUNT_ZERO: "- 추가 투자 금액을 0보다 크게 입력해주세요.",
    CURRENT_AMOUNT_ZERO: "- 현재 금액이 0보다 커야 리밸런싱을 계산할 수 있습니다.",
    RATIO_SUM_NOT_100: (totalRatio) => `- 목표 비율의 합이 100%가 되어야 합니다. (현재: ${totalRatio.toFixed(1)}%)`,
    INVALID_TRANSACTION_DATA: "- 거래 날짜, 수량, 단가를 올바르게 입력해주세요.",
    
    // ARIA Labels
    TICKER_INPUT: (name) => `${name} 티커 입력`,
    SECTOR_INPUT: (name) => `${name} 섹터 입력`,
    TARGET_RATIO_INPUT: (name) => `${name} 목표 비율 입력`,
    CURRENT_PRICE_INPUT: (name) => `${name} 현재가 입력`,
};

export const CONFIG = {
    MIN_BUYABLE_AMOUNT: 1000,
    DEFAULT_EXCHANGE_RATE: 1300,
    RATIO_TOLERANCE: 0.01,
    LOCAL_STORAGE_KEY: 'portfolioCalculatorData_v5',
    DARK_MODE_KEY: 'darkMode'
};