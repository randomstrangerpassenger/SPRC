// js/types.js (새 파일)

/**
 * @typedef {import('decimal.js').Decimal} Decimal
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id - 거래 고유 ID
 * @property {'buy' | 'sell'} type - 거래 유형
 * @property {string} date - 거래 날짜 (YYYY-MM-DD)
 * @property {number} quantity - 수량
 * @property {number} price - 단가
 */

/**
 * @typedef {Object} Stock
 * @property {string} id - 주식 고유 ID
 * @property {string} name - 종목명
 * @property {string} ticker - 티커
 * @property {string} sector - 섹터
 * @property {number} targetRatio - 목표 비율 (%)
 * @property {number} currentPrice - 현재가
 * @property {Transaction[]} transactions - 거래 내역 배열
 * @property {boolean} isFixedBuyEnabled - 고정 매수 활성화 여부
 * @property {number} fixedBuyAmount - 고정 매수 금액
 * @property {number} [manualAmount] - 간단 모드용 수동 입력 금액 (선택 사항)
 */

/**
 * @typedef {Object} CalculatedStockMetrics
 * @property {Decimal} quantity - 현재 보유 수량
 * @property {Decimal} avgBuyPrice - 평균 매수 단가
 * @property {Decimal} currentAmount - 현재 평가 금액
 * @property {Decimal} profitLoss - 평가 손익
 * @property {Decimal} profitLossRate - 평가 수익률 (%)
 */

/**
 * @typedef {Stock & { calculated: CalculatedStockMetrics }} CalculatedStock
 */

/**
 * @typedef {Object} PortfolioData
 * @property {string} name - 포트폴리오 이름
 * @property {Stock[]} portfolioData - 주식 데이터 배열
 * @property {Object} settings
 * @property {'add' | 'sell'} settings.mainMode - 계산 모드
 * @property {'krw' | 'usd'} settings.currentCurrency - 통화
 */

// 이 파일은 타입을 정의하는 파일이므로, export는 필요 없습니다.