// js/i18n.js (새 파일)
// @ts-check

// 1. 모든 문자열을 계층 구조로 정의합니다.
const messages = {
  toast: {
    dataReset: "데이터가 초기화되었습니다.",
    ratiosNormalized: "목표 비율이 100%에 맞춰 조정되었습니다.",
    noRatiosToNormalize: "자동 조정을 위한 목표 비율이 없습니다.",
    saveSuccess: "포트폴리오가 저장되었습니다.",
    saveNoData: "저장할 데이터가 없습니다.",
    loadSuccess: "저장된 데이터를 불러왔습니다.",
    importSuccess: "데이터를 성공적으로 불러왔습니다.",
    importError: "파일을 불러오는 중 오류가 발생했습니다.",
    portfolioCreated: "포트폴리오 '{name}'이(가) 생성되었습니다.",
    portfolioRenamed: "포트폴리오 이름이 변경되었습니다.",
    portfolioDeleted: "포트폴리오가 삭제되었습니다.",
    lastPortfolioDeleteError: "마지막 포트폴리오는 삭제할 수 없습니다.",
    lastStockDeleteError: "마지막 남은 주식은 삭제할 수 없습니다.",
    transactionAdded: "거래 내역이 추가되었습니다.",
    transactionDeleted: "거래 내역이 삭제되었습니다.",
    transactionAddFailed: "거래 추가 실패.",
    transactionDeleteFailed: "거래 삭제 실패.",
    chartError: "차트 시각화에 실패했습니다.",
    normalizeRatiosError: "비율 정규화 중 오류 발생",
    calculateSuccess: "계산 완료!",
    noTickersToFetch: "가져올 티커가 없습니다.",
    modeChanged: "모드가 {mode} 모드로 변경되었습니다.",
    currencyChanged: "통화 기준이 {currency}로 변경되었습니다.",
    invalidExchangeRate: "유효하지 않은 환율입니다. 기본값으로 복원됩니다.",
    amountInputError: "금액 입력 오류.",
    invalidTransactionInfo: "거래 정보가 유효하지 않습니다.",
    invalidFileType: "JSON 파일만 가져올 수 있습니다.",
    exportSuccess: "데이터를 성공적으로 내보냈습니다.",
    exportError: "데이터 내보내기 중 오류 발생."
  },
  modal: {
    confirmResetTitle: "데이터 초기화",
    confirmResetMsg: "현재 포트폴리오를 초기 템플릿으로 되돌리시겠습니까? 이 작업은 되돌릴 수 없습니다.",
    confirmDeletePortfolioTitle: "포트폴리오 삭제",
    confirmDeletePortfolioMsg: "정말로 '{name}' 포트폴리오를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
    confirmDeleteStockTitle: "종목 삭제",
    confirmDeleteStockMsg: "'{name}' 종목을 삭제하시겠습니까?",
    confirmDeleteTransactionTitle: "거래 내역 삭제",
    confirmDeleteTransactionMsg: "이 거래 내역을 정말로 삭제하시겠습니까?",
    confirmRatioSumWarnTitle: "목표 비율 확인",
    confirmRatioSumWarnMsg: "목표비율 합이 {totalRatio}%입니다. 100%가 아니어도 계산을 진행하시겠습니까?",
    promptNewPortfolioNameTitle: "새 포트폴리오 생성",
    promptNewPortfolioNameMsg: "새 포트폴리오의 이름을 입력하세요:",
    promptRenamePortfolioTitle: "이름 변경",
    promptRenamePortfolioMsg: "새로운 포트폴리오 이름을 입력하세요:"
  },
  ui: {
    // Table headers and labels
    stockName: "종목명",
    ticker: "티커",
    sector: "섹터",
    quantity: "수량",
    avgBuyPrice: "평단가",
    currentValue: "현재 평가액",
    profitLoss: "평가 손익",
    profitLossRate: "수익률",
    fixedBuy: "고정 매수",
    // Button labels
    manage: "거래",
    delete: "삭제",
    fetchingPrices: "가져오는 중...",
    updateAllPrices: "현재가 일괄 업데이트",
    // Transaction types
    buy: "매수",
    sell: "매도",
    buyWithIcon: "🔵 매수",
    sellWithIcon: "🔴 매도",
    // Currency symbols
    krw: "원",
    usd: "$",
    // Mode names
    addMode: "추가 매수",
    sellMode: "매도 리밸런싱"
  },
  defaults: {
    defaultPortfolioName: "기본 포트폴리오",
    newStock: "새 종목",
    uncategorized: "미분류",
    unknownStock: "해당 종목"
  },
  validation: {
    calculationError: "계산 중 오류가 발생했습니다. 입력값을 확인해주세요.",
    validationErrorPrefix: "입력값을 확인해주세요: ",
    saveErrorGeneral: "저장 중 오류가 발생했습니다.",
    saveErrorQuota: "저장 공간이 부족합니다. 불필요한 포트폴리오를 삭제해 주세요.",
    saveErrorSecurity: "브라우저 설정으로 인해 데이터를 저장할 수 없습니다. 쿠키 및 사이트 데이터 설정을 확인해주세요.",
    calcErrorDecimal: "입력값이 너무 크거나 잘못된 형식입니다.",
    calcErrorType: "데이터 형식 오류가 발생했습니다.",
    invalidFileStructure: "파일의 구조가 올바르지 않거나 손상되었습니다.",
    investmentAmountZero: "- 추가 투자 금액을 0보다 크게 입력해주세요.",
    currentAmountZero: "- 현재 금액이 0보다 커야 리밸런싱을 계산할 수 있습니다.",
    ratioSumNot100: "- 목표 비율의 합이 100%가 되어야 합니다. (현재: {totalRatio}%)",
    invalidTransactionData: "- 거래 날짜, 수량, 단가를 올바르게 입력해주세요.",
    fixedBuyAmountTooSmall: "- '{name}'의 고정 매수 금액이 현재가보다 작아 1주도 매수할 수 없습니다.",
    // validator.js에서 가져온 메시지
    invalidNumber: "유효한 숫자가 아닙니다.",
    negativeNumber: "음수는 입력할 수 없습니다.",
    invalidDate: "유효한 날짜를 입력해주세요.",
    futureDate: "미래 날짜는 입력할 수 없습니다.",
    quantityZero: "수량은 0보다 커야 합니다.",
    priceZero: "단가는 0보다 커야 합니다.",
    // controller.js validation
    nameMissing: "- 이름 없는 종목의 종목명을 입력해주세요.",
    tickerMissing: "- '{name}'의 티커를 입력해주세요.",
    currentPriceZero: "- '{name}'의 현재가는 0보다 커야 합니다.",
    fixedBuyAmountZero: "- '{name}'의 고정 매수 금액은 0보다 커야 합니다.",
    fixedBuyTotalExceeds: "- 고정 매수 금액의 합이 총 투자금을 초과합니다."
  },
  aria: {
    tickerInput: "{name} 티커 입력",
    sectorInput: "{name} 섹터 입력",
    targetRatioInput: "{name} 목표 비율 입력",
    currentPriceInput: "{name} 현재가 입력"
  }
};

/**
 * 키와 대체값을 기반으로 메시지 문자열을 반환합니다.
 * @param {string} key - 점으로 구분된 메시지 키 (예: 'toast.dataReset')
 * @param {Record<string, string | number>} [replacements] - {name}, {totalRatio} 등을 대체할 값
 * @returns {string}
 */
export function t(key, replacements = {}) {
    // 'toast.dataReset' -> ['toast', 'dataReset']
    const keys = key.split('.');
    
    let message = keys.reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : key, messages);

    if (typeof message !== 'string') {
        console.warn(`[i18n] Missing key: ${key}`);
        return key; // 키가 없으면 키 자체를 반환
    }

    // {name}, {totalRatio}와 같은 플레이스홀더를 실제 값으로 대체
    return message.replace(/{(\w+)}/g, (match, placeholder) => {
        return replacements[placeholder] !== undefined
            ? String(replacements[placeholder])
            : match;
    });
}