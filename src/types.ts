// src/types.ts

import type { Decimal } from 'decimal.js';

/**
 * @enum TransactionType
 * @description 거래 유형
 */
export enum TransactionType {
    Buy = 'buy',
    Sell = 'sell',
    Dividend = 'dividend',
}

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

/**
 * @enum MainMode
 * @description 계산 모드 (추가 매수, 매도, 간단 계산)
 */
export enum MainMode {
    Add = 'add',
    Sell = 'sell',
    Simple = 'simple',
}

/**
 * @enum Currency
 * @description 통화 유형
 */
export enum Currency {
    KRW = 'krw',
    USD = 'usd',
}

export interface PortfolioSettings {
    mainMode: MainMode;
    currentCurrency: Currency;
    exchangeRate: number;
    rebalancingTolerance?: number; // 리밸런싱 허용 오차 (%), optional for backward compatibility
    tradingFeeRate?: number; // 거래 수수료율 (%), optional
    taxRate?: number; // 세율 (%), optional
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
}
