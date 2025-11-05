// src/types.ts

import type { Decimal } from 'decimal.js';

export type TransactionType = 'buy' | 'sell';

export interface Transaction {
    id: string; // 거래 고유 ID
    type: TransactionType; // 거래 유형
    date: string; // 거래 날짜 (YYYY-MM-DD)
    quantity: number; // 수량
    price: number; // 단가
}

export interface Stock {
    id: string; // 주식 고유 ID
    name: string; // 종목명
    ticker: string; // 티커
    sector: string; // 섹터
    targetRatio: number; // 목표 비율 (%)
    currentPrice: number; // 현재가
    transactions: Transaction[]; // 거래 내역 배열
    isFixedBuyEnabled: boolean; // 고정 매수 활성화 여부
    fixedBuyAmount: number; // 고정 매수 금액
    manualAmount?: number; // 간단 모드용 수동 입력 금액 (선택 사항)
}

export interface CalculatedStockMetrics {
    totalBuyQuantity: Decimal; // 총 매수 수량
    totalSellQuantity: Decimal; // 총 매도 수량
    quantity: Decimal; // 현재 보유 수량
    totalBuyAmount: Decimal; // 총 매수 금액
    avgBuyPrice: Decimal; // 평균 매수 단가
    currentAmount: Decimal; // 현재 평가 금액 (USD 기준)
    currentAmountUSD: Decimal; // 현재 평가 금액 (USD)
    currentAmountKRW: Decimal; // 현재 평가 금액 (KRW)
    profitLoss: Decimal; // 평가 손익
    profitLossRate: Decimal; // 평가 수익률 (%)
}

export interface CalculatedStock extends Stock {
    calculated: CalculatedStockMetrics;
}

export type MainMode = 'add' | 'sell';
export type Currency = 'krw' | 'usd';

export interface PortfolioSettings {
    mainMode: MainMode;
    currentCurrency: Currency;
    exchangeRate: number;
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