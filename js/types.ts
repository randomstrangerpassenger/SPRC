// js/types.ts

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
    quantity: Decimal; // 현재 보유 수량
    avgBuyPrice: Decimal; // 평균 매수 단가
    currentAmount: Decimal; // 현재 평가 금액
    profitLoss: Decimal; // 평가 손익
    profitLossRate: Decimal; // 평가 수익률 (%)
}

export interface CalculatedStock extends Stock {
    calculated: CalculatedStockMetrics;
}

export type MainMode = 'add' | 'sell';
export type Currency = 'krw' | 'usd';

export interface PortfolioSettings {
    mainMode: MainMode; // 계산 모드
    currentCurrency: Currency; // 통화
}

export interface PortfolioData {
    name: string; // 포트폴리오 이름
    portfolioData: Stock[]; // 주식 데이터 배열
    settings: PortfolioSettings;
}
