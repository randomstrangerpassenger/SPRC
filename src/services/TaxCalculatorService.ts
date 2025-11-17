// src/services/TaxCalculatorService.ts
import Decimal from 'decimal.js';
import { logger } from './Logger';
import type { PortfolioSnapshot, CalculatedStock } from '../types';

/**
 * @interface TaxCalculationResult
 * @description 세금 계산 결과
 */
export interface TaxCalculationResult {
    /** 양도소득세 (국내주식) */
    domesticCapitalGainsTax: number;
    /** 양도소득세 (해외주식) */
    foreignCapitalGainsTax: number;
    /** 배당소득세 */
    dividendIncomeTax: number;
    /** 총 세금 */
    totalTax: number;
    /** 국내주식 양도차익 */
    domesticCapitalGains: number;
    /** 해외주식 양도차익 */
    foreignCapitalGains: number;
    /** 총 배당금 */
    totalDividends: number;
    /** 대주주 여부 (국내주식) */
    isMajorShareholder: boolean;
    /** 세금 계산 상세 */
    details: TaxCalculationDetails;
}

/**
 * @interface TaxCalculationDetails
 * @description 세금 계산 상세 정보
 */
export interface TaxCalculationDetails {
    domestic: {
        capitalGains: number;
        basicDeduction: number;
        taxableAmount: number;
        taxRate: number;
        tax: number;
    };
    foreign: {
        capitalGains: number;
        basicDeduction: number;
        taxableAmount: number;
        taxRate: number;
        tax: number;
    };
    dividend: {
        totalDividends: number;
        taxRate: number;
        tax: number;
    };
}

/**
 * @class TaxCalculatorService
 * @description 한국 주식 투자 세금 계산 서비스
 */
export class TaxCalculatorService {
    // 세율 상수
    private static readonly DOMESTIC_MAJOR_SHAREHOLDER_TAX_RATE = 0.22; // 대주주 22% (지방소득세 포함)
    private static readonly DOMESTIC_BASIC_DEDUCTION = 50_000_000; // 국내주식 기본공제 5천만원
    private static readonly FOREIGN_TAX_RATE = 0.22; // 해외주식 22% (지방소득세 포함)
    private static readonly FOREIGN_BASIC_DEDUCTION = 2_500_000; // 해외주식 기본공제 250만원
    private static readonly DIVIDEND_TAX_RATE = 0.154; // 배당소득세 15.4% (지방소득세 포함)

    // 대주주 판정 기준 (시가총액 기준, 단위: 원)
    private static readonly MAJOR_SHAREHOLDER_THRESHOLD = 10_000_000_000; // 100억원

    /**
     * @description 포트폴리오 데이터로부터 세금 계산
     * @param portfolioData - 계산된 주식 데이터 배열
     * @param exchangeRate - 환율 (USD to KRW)
     * @returns TaxCalculationResult
     */
    static calculateTax(
        portfolioData: CalculatedStock[],
        exchangeRate: number
    ): TaxCalculationResult {
        try {
            let domesticCapitalGains = 0;
            let foreignCapitalGains = 0;
            let totalDividends = 0;
            let isMajorShareholder = false;

            // 각 종목별로 양도차익, 배당금 집계
            for (const stock of portfolioData) {
                const calculated = stock.calculated;
                if (!calculated) continue;

                // 실현 손익 (양도차익)
                const realizedPL = new Decimal(calculated.realizedPL).toNumber();
                // 배당금
                const dividends = new Decimal(calculated.totalDividends).toNumber();

                // 국내/해외 주식 구분 (간단한 로직: 티커에 '.' 없으면 한국, 있으면 해외)
                const isDomestic = !stock.ticker.includes('.');

                if (isDomestic) {
                    domesticCapitalGains += realizedPL;

                    // 대주주 판정 (보유 주식 시가총액 기준)
                    const marketValue = new Decimal(calculated.currentAmountKRW).toNumber();
                    if (marketValue >= this.MAJOR_SHAREHOLDER_THRESHOLD) {
                        isMajorShareholder = true;
                    }
                } else {
                    foreignCapitalGains += realizedPL;
                }

                totalDividends += dividends;
            }

            // 국내주식 양도소득세 계산
            const domesticTaxDetails = this.#calculateDomesticCapitalGainsTax(
                domesticCapitalGains,
                isMajorShareholder
            );

            // 해외주식 양도소득세 계산
            const foreignTaxDetails = this.#calculateForeignCapitalGainsTax(foreignCapitalGains);

            // 배당소득세 계산
            const dividendTaxDetails = this.#calculateDividendIncomeTax(totalDividends);

            const totalTax =
                domesticTaxDetails.tax + foreignTaxDetails.tax + dividendTaxDetails.tax;

            return {
                domesticCapitalGainsTax: domesticTaxDetails.tax,
                foreignCapitalGainsTax: foreignTaxDetails.tax,
                dividendIncomeTax: dividendTaxDetails.tax,
                totalTax,
                domesticCapitalGains,
                foreignCapitalGains,
                totalDividends,
                isMajorShareholder,
                details: {
                    domestic: domesticTaxDetails,
                    foreign: foreignTaxDetails,
                    dividend: dividendTaxDetails,
                },
            };
        } catch (error) {
            logger.error('Failed to calculate tax', 'TaxCalculatorService', error);
            return this.#getEmptyResult();
        }
    }

    /**
     * @description 국내주식 양도소득세 계산
     */
    static #calculateDomesticCapitalGainsTax(
        capitalGains: number,
        isMajorShareholder: boolean
    ): {
        capitalGains: number;
        basicDeduction: number;
        taxableAmount: number;
        taxRate: number;
        tax: number;
    } {
        // 대주주가 아닌 경우, 양도소득세 면제
        if (!isMajorShareholder) {
            return {
                capitalGains,
                basicDeduction: 0,
                taxableAmount: 0,
                taxRate: 0,
                tax: 0,
            };
        }

        // 양도차익이 없거나 손실인 경우
        if (capitalGains <= 0) {
            return {
                capitalGains,
                basicDeduction: 0,
                taxableAmount: 0,
                taxRate: this.DOMESTIC_MAJOR_SHAREHOLDER_TAX_RATE,
                tax: 0,
            };
        }

        // 기본공제 적용
        const taxableAmount = Math.max(0, capitalGains - this.DOMESTIC_BASIC_DEDUCTION);

        // 세금 계산
        const tax = taxableAmount * this.DOMESTIC_MAJOR_SHAREHOLDER_TAX_RATE;

        return {
            capitalGains,
            basicDeduction: this.DOMESTIC_BASIC_DEDUCTION,
            taxableAmount,
            taxRate: this.DOMESTIC_MAJOR_SHAREHOLDER_TAX_RATE,
            tax: Math.max(0, tax),
        };
    }

    /**
     * @description 해외주식 양도소득세 계산
     */
    static #calculateForeignCapitalGainsTax(capitalGains: number): {
        capitalGains: number;
        basicDeduction: number;
        taxableAmount: number;
        taxRate: number;
        tax: number;
    } {
        // 양도차익이 없거나 손실인 경우
        if (capitalGains <= 0) {
            return {
                capitalGains,
                basicDeduction: 0,
                taxableAmount: 0,
                taxRate: this.FOREIGN_TAX_RATE,
                tax: 0,
            };
        }

        // 기본공제 적용
        const taxableAmount = Math.max(0, capitalGains - this.FOREIGN_BASIC_DEDUCTION);

        // 세금 계산
        const tax = taxableAmount * this.FOREIGN_TAX_RATE;

        return {
            capitalGains,
            basicDeduction: this.FOREIGN_BASIC_DEDUCTION,
            taxableAmount,
            taxRate: this.FOREIGN_TAX_RATE,
            tax: Math.max(0, tax),
        };
    }

    /**
     * @description 배당소득세 계산
     */
    static #calculateDividendIncomeTax(totalDividends: number): {
        totalDividends: number;
        taxRate: number;
        tax: number;
    } {
        // 배당금이 없는 경우
        if (totalDividends <= 0) {
            return {
                totalDividends,
                taxRate: this.DIVIDEND_TAX_RATE,
                tax: 0,
            };
        }

        // 배당소득세 계산 (기본공제 없음)
        const tax = totalDividends * this.DIVIDEND_TAX_RATE;

        return {
            totalDividends,
            taxRate: this.DIVIDEND_TAX_RATE,
            tax: Math.max(0, tax),
        };
    }

    /**
     * @description 빈 결과 반환 (에러 시)
     */
    static #getEmptyResult(): TaxCalculationResult {
        return {
            domesticCapitalGainsTax: 0,
            foreignCapitalGainsTax: 0,
            dividendIncomeTax: 0,
            totalTax: 0,
            domesticCapitalGains: 0,
            foreignCapitalGains: 0,
            totalDividends: 0,
            isMajorShareholder: false,
            details: {
                domestic: {
                    capitalGains: 0,
                    basicDeduction: 0,
                    taxableAmount: 0,
                    taxRate: 0,
                    tax: 0,
                },
                foreign: {
                    capitalGains: 0,
                    basicDeduction: 0,
                    taxableAmount: 0,
                    taxRate: 0,
                    tax: 0,
                },
                dividend: {
                    totalDividends: 0,
                    taxRate: 0,
                    tax: 0,
                },
            },
        };
    }

    /**
     * @description 숫자 포맷팅 (원화)
     */
    static formatCurrency(value: number): string {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
            maximumFractionDigits: 0,
        }).format(value);
    }

    /**
     * @description 세율 포맷팅 (%)
     */
    static formatTaxRate(rate: number): string {
        return `${(rate * 100).toFixed(1)}%`;
    }

    /**
     * @description 세금 계산 요약 텍스트 생성
     */
    static getSummaryText(result: TaxCalculationResult): string {
        const lines: string[] = [];

        lines.push(`🧾 세금 계산 결과`);
        lines.push(``);

        if (result.domesticCapitalGains > 0) {
            lines.push(`📌 국내주식 양도소득세:`);
            lines.push(`  - 양도차익: ${this.formatCurrency(result.domesticCapitalGains)}`);
            lines.push(
                `  - 대주주 여부: ${result.isMajorShareholder ? '예 (세금 부과)' : '아니오 (면제)'}`
            );
            lines.push(
                `  - 세금: ${this.formatCurrency(result.domesticCapitalGainsTax)}`
            );
            lines.push(``);
        }

        if (result.foreignCapitalGains > 0) {
            lines.push(`🌎 해외주식 양도소득세:`);
            lines.push(`  - 양도차익: ${this.formatCurrency(result.foreignCapitalGains)}`);
            lines.push(
                `  - 기본공제: ${this.formatCurrency(this.FOREIGN_BASIC_DEDUCTION)}`
            );
            lines.push(
                `  - 세금: ${this.formatCurrency(result.foreignCapitalGainsTax)}`
            );
            lines.push(``);
        }

        if (result.totalDividends > 0) {
            lines.push(`💰 배당소득세:`);
            lines.push(`  - 총 배당금: ${this.formatCurrency(result.totalDividends)}`);
            lines.push(`  - 세율: ${this.formatTaxRate(this.DIVIDEND_TAX_RATE)}`);
            lines.push(`  - 세금: ${this.formatCurrency(result.dividendIncomeTax)}`);
            lines.push(``);
        }

        lines.push(`💸 총 납부 세금: ${this.formatCurrency(result.totalTax)}`);

        return lines.join('\n');
    }
}
