// src/types.ts

import type { Decimal } from 'decimal.js';

export type TransactionType = 'buy' | 'sell' | 'dividend';

export interface Transaction {
    id: string; // 거래 고유 ID
    type: TransactionType; // 거래 유형
    date: string; // 거래 날짜 (YYYY-MM-DD)
    quantity: Decimal | number; // 수량 (Decimal 또는 number)
    price: Decimal | number; // 단가 (Decimal 또는 number)
}

export interface Stock {
    id: string; // 주식 고유 ID
    name: string; // 종목명
    ticker: string; // 티커
    sector: string; // 섹터
    targetRatio: Decimal | number; // 목표 비율 (%) (Decimal 또는 number)
    currentPrice: Decimal | number; // 현재가 (Decimal 또는 number)
    transactions: Transaction[]; // 거래 내역 배열
    isFixedBuyEnabled: boolean; // 고정 매수 활성화 여부
    fixedBuyAmount: Decimal | number; // 고정 매수 금액 (Decimal 또는 number)
    manualAmount?: Decimal | number; // 간단 모드용 수동 입력 금액 (선택 사항)
}

export interface CalculatedStockMetrics {
    totalBuyQuantity: Decimal; // 총 매수 수량
    totalSellQuantity: Decimal; // 총 매도 수량
    quantity: Decimal; // 현재 보유 수량
    totalBuyAmount: Decimal; // 총 매수 금액
    totalSellAmount: Decimal; // 총 매도 금액
    avgBuyPrice: Decimal; // 평균 매수 단가
    currentAmount: Decimal; // 현재 평가 금액 (USD 기준)
    currentAmountUSD: Decimal; // 현재 평가 금액 (USD)
    currentAmountKRW: Decimal; // 현재 평가 금액 (KRW)
    profitLoss: Decimal; // 미실현 손익 (현재 보유분)
    profitLossRate: Decimal; // 미실현 수익률 (%)
    totalDividends: Decimal; // 총 배당금
    realizedPL: Decimal; // 실현 손익 (매도 차익)
    totalRealizedPL: Decimal; // 총 실현 손익 (실현손익 + 배당금)
}

export interface CalculatedStock extends Stock {
    calculated: CalculatedStockMetrics;
}

export type MainMode = 'add' | 'sell' | 'simple';
export type Currency = 'krw' | 'usd';

// 맞춤형 리밸런싱 규칙 타입
export interface StockLimitRule {
    stockId: string; // 종목 ID
    maxAllocationPercent?: number; // 종목별 최대 할당 비율 (%)
    minTradeAmount?: number; // 최소 거래 금액 (USD)
}

export interface SectorLimitRule {
    sector: string; // 섹터명
    maxAllocationPercent: number; // 섹터별 최대 할당 비율 (%)
}

export interface RebalancingRules {
    enabled: boolean; // 규칙 활성화 여부
    bandPercentage?: number; // ±밴드 설정 (예: 5 = ±5%)
    minTradeAmount?: number; // 최소 거래금액 임계값 (USD)
    stockLimits?: StockLimitRule[]; // 종목별 상한선
    sectorLimits?: SectorLimitRule[]; // 섹터별 상한선
}

// 리밸런싱 프리셋 타입
export interface RebalancingPreset {
    id: string; // 프리셋 고유 ID
    name: string; // 프리셋 이름
    description?: string; // 프리셋 설명
    rules: RebalancingRules; // 리밸런싱 규칙
    createdAt: number; // 생성 시간 (Unix timestamp)
    updatedAt: number; // 수정 시간 (Unix timestamp)
}

export interface PortfolioSettings {
    mainMode: MainMode;
    currentCurrency: Currency;
    exchangeRate: number;
    rebalancingTolerance?: number; // 리밸런싱 허용 오차 (%), optional for backward compatibility
    tradingFeeRate?: number; // 거래 수수료율 (%), optional
    taxRate?: number; // 세율 (%), optional
    rebalancingRules?: RebalancingRules; // 맞춤형 리밸런싱 규칙, optional
}

export interface Portfolio {
    id: string;
    name: string;
    portfolioData: Stock[];
    settings: PortfolioSettings;
}

export interface MetaState {
    activePortfolioId: string;
    version: string;
}

export interface PortfolioData {
    name: string; // 포트폴리오 이름
    portfolioData: Stock[]; // 주식 데이터 배열
    settings: PortfolioSettings;
}

// Validation types
export interface ValidationResult {
    isValid: boolean;
    value?: string | number;
    message?: string;
}

export interface ValidationErrorDetail {
    field: string;
    stockId: string | null;
    message: string;
}

// API types
export interface FetchStockResult {
    id: string;
    ticker: string;
    status: 'fulfilled' | 'rejected';
    value?: number;
    reason?: string;
}

// Performance tracking types
export interface PortfolioSnapshot {
    id: string; // 스냅샷 고유 ID
    portfolioId: string; // 포트폴리오 ID
    timestamp: number; // Unix timestamp (milliseconds)
    date: string; // YYYY-MM-DD format for display
    totalValue: number; // 총 포트폴리오 가치 (USD)
    totalValueKRW: number; // 총 포트폴리오 가치 (KRW)
    totalInvestedCapital: number; // 총 투자 원금 (USD)
    totalUnrealizedPL: number; // 총 미실현 손익 (USD)
    totalRealizedPL: number; // 총 실현 손익 (USD)
    totalDividends: number; // 총 배당금 (USD)
    totalOverallPL: number; // 총 전체 손익 (USD) = unrealized + realized + dividends
    exchangeRate: number; // 환율 (스냅샷 당시)
    stockCount: number; // 보유 종목 수
}

// Sector analysis data type
export interface SectorData {
    sector: string;
    amount: Decimal;
    percentage: Decimal;
}

// 배당금 분석 타입
export interface MonthlyDividend {
    year: number;
    month: number; // 1-12
    amount: Decimal; // USD
    count: number; // 배당 거래 수
}

export interface YearlyDividend {
    year: number;
    totalAmount: Decimal; // USD
    monthlyBreakdown: MonthlyDividend[];
    averageMonthly: Decimal; // USD
    stockCount: number; // 배당 지급 종목 수
}

export interface DividendGrowth {
    year: number;
    totalDividend: Decimal; // USD
    growthRate: Decimal; // % (전년 대비)
}

export interface DividendAnalysisResult {
    totalDividends: Decimal; // 총 배당금 (USD)
    yearlyDividends: YearlyDividend[]; // 연도별 배당
    monthlyDividends: MonthlyDividend[]; // 월별 배당 (최근 12개월)
    dividendGrowth: DividendGrowth[]; // 배당 성장률
    estimatedAnnualDividend: Decimal; // 예상 연간 배당 (최근 12개월 기준)
    dividendYield: Decimal; // 배당 수익률 (%)
}

// 시나리오 분석 타입
export interface MarketScenario {
    name: string; // 시나리오 이름 (예: "시장 +10%")
    marketChange: number; // 시장 변동률 (%) (예: 10, -20)
    description?: string; // 시나리오 설명
}

export interface ScenarioResult {
    scenario: MarketScenario;
    newTotalValue: Decimal; // 시나리오 적용 후 총 가치
    valueChange: Decimal; // 가치 변화량
    valueChangePercent: Decimal; // 가치 변화율 (%)
    newStockValues: Array<{
        stockId: string;
        stockName: string;
        currentValue: Decimal;
        newValue: Decimal;
        change: Decimal;
        changePercent: Decimal;
    }>;
}

export interface RebalancingFrequencyComparison {
    frequency: string; // 리밸런싱 주기 (예: "분기별", "반기별", "연간")
    annualizedReturn: Decimal; // 연환산 수익률 (%)
    volatility: Decimal; // 변동성
    sharpeRatio: Decimal; // 샤프 비율
    transactionCosts: Decimal; // 거래 비용
}

export interface ScenarioAnalysisResult {
    currentTotalValue: Decimal; // 현재 총 가치
    marketScenarios: ScenarioResult[]; // 시장 시나리오 결과
    rebalancingFrequencyComparison?: RebalancingFrequencyComparison[]; // 리밸런싱 주기별 비교
}

// View interface for error service (to avoid circular dependencies)
export interface IView {
    showToast(message: string, type: 'error' | 'success' | 'info' | 'warning'): void;
}

// Result type for error handling (Railway-oriented programming)
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

// DOM Elements type
export interface DOMElements {
    ariaAnnouncer: HTMLElement | null;
    resultsSection: HTMLElement | null;
    sectorAnalysisSection: HTMLElement | null;
    chartSection: HTMLElement | null;
    portfolioChart: HTMLElement | null;
    additionalAmountInput: HTMLElement | null;
    additionalAmountUSDInput: HTMLElement | null;
    exchangeRateInput: HTMLElement | null;
    portfolioExchangeRateInput: HTMLElement | null;
    mainModeSelector: NodeListOf<HTMLElement> | null;
    currencyModeSelector: NodeListOf<HTMLElement> | null;
    exchangeRateGroup: HTMLElement | null;
    usdInputGroup: HTMLElement | null;
    addInvestmentCard: HTMLElement | null;
    calculateBtn: HTMLElement | null;
    darkModeToggle: HTMLElement | null;
    addNewStockBtn: HTMLElement | null;
    fetchAllPricesBtn: HTMLElement | null;
    resetDataBtn: HTMLElement | null;
    normalizeRatiosBtn: HTMLElement | null;
    dataManagementBtn: HTMLElement | null;
    dataDropdownContent: HTMLElement | null;
    exportDataBtn: HTMLElement | null;
    importDataBtn: HTMLElement | null;
    importFileInput: HTMLElement | null;
    transactionModal: HTMLElement | null;
    modalStockName: HTMLElement | null;
    closeModalBtn: HTMLElement | null;
    transactionListBody: HTMLElement | null;
    newTransactionForm: HTMLElement | null;
    txDate: HTMLElement | null;
    txQuantity: HTMLElement | null;
    txPrice: HTMLElement | null;
    portfolioSelector: HTMLElement | null;
    newPortfolioBtn: HTMLElement | null;
    renamePortfolioBtn: HTMLElement | null;
    deletePortfolioBtn: HTMLElement | null;
    virtualTableHeader: HTMLElement | null;
    virtualScrollWrapper: HTMLElement | null;
    virtualScrollSpacer: HTMLElement | null;
    virtualScrollContent: HTMLElement | null;
    ratioValidator: HTMLElement | null;
    ratioSum: HTMLElement | null;
    customModal: HTMLElement | null;
    customModalTitle: HTMLElement | null;
    customModalMessage: HTMLElement | null;
    customModalInput: HTMLElement | null;
    customModalConfirm: HTMLElement | null;
    customModalCancel: HTMLElement | null;
    performanceHistorySection: HTMLElement | null;
    showPerformanceHistoryBtn: HTMLElement | null;
    showSnapshotListBtn: HTMLElement | null;
    performanceChartContainer: HTMLElement | null;
    performanceChart: HTMLElement | null;
    snapshotListContainer: HTMLElement | null;
    snapshotList: HTMLElement | null;
    rebalancingToleranceInput: HTMLElement | null;
    tradingFeeRateInput: HTMLElement | null;
    taxRateInput: HTMLElement | null;
    rebalancingRulesEnabled: HTMLElement | null;
    rebalancingRulesContent: HTMLElement | null;
    bandPercentage: HTMLElement | null;
    minTradeAmount: HTMLElement | null;
    stockLimitsContainer: HTMLElement | null;
    addStockLimitBtn: HTMLElement | null;
    sectorLimitsContainer: HTMLElement | null;
    addSectorLimitBtn: HTMLElement | null;
    presetSelector: HTMLElement | null;
    loadPresetBtn: HTMLElement | null;
    savePresetBtn: HTMLElement | null;
    deletePresetBtn: HTMLElement | null;
    dividendDashboardSection: HTMLElement | null;
    totalDividendsAmount: HTMLElement | null;
    estimatedAnnualDividend: HTMLElement | null;
    dividendYield: HTMLElement | null;
    showYearlyDividendsBtn: HTMLElement | null;
    showMonthlyDividendsBtn: HTMLElement | null;
    showDividendGrowthBtn: HTMLElement | null;
    yearlyDividendsContainer: HTMLElement | null;
    monthlyDividendsContainer: HTMLElement | null;
    dividendGrowthContainer: HTMLElement | null;
    yearlyDividendsTable: HTMLElement | null;
    monthlyDividendsTable: HTMLElement | null;
    dividendGrowthChart: HTMLElement | null;
    scenarioAnalysisSection: HTMLElement | null;
    scenarioCurrentValue: HTMLElement | null;
    analyzeScenarioBtn: HTMLElement | null;
    customScenarioBtn: HTMLElement | null;
    scenarioResultsContainer: HTMLElement | null;
    scenarioResultsTable: HTMLElement | null;
    customScenarioContainer: HTMLElement | null;
    customMarketChange: HTMLElement | null;
    runCustomScenarioBtn: HTMLElement | null;
    customScenarioResult: HTMLElement | null;
}
