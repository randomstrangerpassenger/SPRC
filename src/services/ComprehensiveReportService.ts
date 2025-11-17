// src/services/ComprehensiveReportService.ts
import type jsPDF from 'jspdf';
import type { Portfolio, CalculatedStock, PortfolioSnapshot } from '../types';
import { RiskMetricsService } from './RiskMetricsService';
import { TaxCalculatorService } from './TaxCalculatorService';
import { logger } from './Logger';
import Decimal from 'decimal.js';

/**
 * @class ComprehensiveReportService
 * @description 종합 투자 리포트 생성 서비스 (리스크 지표, 세금 계산 포함)
 */
export class ComprehensiveReportService {
    /**
     * @description 종합 투자 리포트 PDF 생성
     */
    static async generateComprehensiveReport(
        portfolio: Portfolio,
        snapshots: PortfolioSnapshot[]
    ): Promise<void> {
        try {
            // 동적 import: jsPDF는 사용 시점에만 로드
            const { default: jsPDF } = await import('jspdf');

            // PDF 생성 (A4, portrait)
            const pdf = new jsPDF('p', 'mm', 'a4');
            let yPosition = 20;

            // 한글 폰트 문제로 인해 영문만 사용 (추후 한글 폰트 추가 가능)
            yPosition = this.addCoverPage(pdf, portfolio, yPosition);

            // 새 페이지
            pdf.addPage();
            yPosition = 20;

            // 포트폴리오 요약
            yPosition = this.addPortfolioSummary(pdf, portfolio, yPosition);

            // 성과 지표
            if (snapshots.length >= 2) {
                yPosition = this.addPerformanceMetrics(pdf, snapshots, yPosition);
            }

            // 새 페이지 - 리스크 지표
            if (snapshots.length >= 2) {
                pdf.addPage();
                yPosition = 20;
                yPosition = this.addRiskMetrics(pdf, snapshots, yPosition);
            }

            // 새 페이지 - 세금 계산
            pdf.addPage();
            yPosition = 20;
            yPosition = this.addTaxCalculation(pdf, portfolio, yPosition);

            // 새 페이지 - 종목 상세
            pdf.addPage();
            yPosition = 20;
            yPosition = this.addStockDetails(pdf, portfolio, yPosition);

            // PDF 저장
            const filename = `comprehensive_report_${portfolio.name}_${Date.now()}.pdf`;
            pdf.save(filename.replace(/\s+/g, '_'));

            logger.info('Comprehensive report generated successfully', 'ComprehensiveReportService');
        } catch (error) {
            logger.error('Failed to generate comprehensive report', 'ComprehensiveReportService', error);
            throw new Error('Comprehensive report generation failed');
        }
    }

    /**
     * @description 표지 페이지
     */
    private static addCoverPage(pdf: jsPDF, portfolio: Portfolio, yPosition: number): number {
        // 제목
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Comprehensive Investment Report', 105, yPosition, { align: 'center' });

        yPosition += 20;
        pdf.setFontSize(18);
        pdf.text(portfolio.name, 105, yPosition, { align: 'center' });

        yPosition += 40;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated: ${new Date().toLocaleString()}`, 105, yPosition, { align: 'center' });

        yPosition += 10;
        pdf.text(`Currency: ${portfolio.settings.currentCurrency.toUpperCase()}`, 105, yPosition, {
            align: 'center',
        });

        yPosition += 10;
        pdf.text(`Exchange Rate: ${portfolio.settings.exchangeRate}`, 105, yPosition, {
            align: 'center',
        });

        // 목차
        yPosition += 40;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Table of Contents', 20, yPosition);

        yPosition += 10;
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const sections = [
            '1. Portfolio Summary',
            '2. Performance Metrics',
            '3. Risk Analysis',
            '4. Tax Calculations',
            '5. Stock Details',
        ];

        sections.forEach((section) => {
            yPosition += 8;
            pdf.text(section, 25, yPosition);
        });

        return yPosition;
    }

    /**
     * @description 포트폴리오 요약
     */
    private static addPortfolioSummary(
        pdf: jsPDF,
        portfolio: Portfolio,
        yPosition: number
    ): number {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('1. Portfolio Summary', 20, yPosition);

        yPosition += 10;

        // 총 자산 계산
        const portfolioData = portfolio.portfolioData as CalculatedStock[];
        let totalValue = 0;
        let totalInvested = 0;
        let totalUnrealizedPL = 0;
        let totalRealizedPL = 0;
        let totalDividends = 0;

        portfolioData.forEach((stock) => {
            if (stock.calculated) {
                const currentAmountKRW = new Decimal(stock.calculated.currentAmountKRW).toNumber();
                const totalBuyAmount = new Decimal(stock.calculated.totalBuyAmount)
                    .times(portfolio.settings.exchangeRate)
                    .toNumber();
                const profitLoss = new Decimal(stock.calculated.profitLoss)
                    .times(portfolio.settings.exchangeRate)
                    .toNumber();
                const realizedPL = new Decimal(stock.calculated.realizedPL)
                    .times(portfolio.settings.exchangeRate)
                    .toNumber();
                const dividends = new Decimal(stock.calculated.totalDividends)
                    .times(portfolio.settings.exchangeRate)
                    .toNumber();

                totalValue += currentAmountKRW;
                totalInvested += totalBuyAmount;
                totalUnrealizedPL += profitLoss;
                totalRealizedPL += realizedPL;
                totalDividends += dividends;
            }
        });

        const totalPL = totalUnrealizedPL + totalRealizedPL + totalDividends;
        const totalReturn = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');

        const summaryData = [
            `Total Value: ${this.formatCurrency(totalValue)} KRW`,
            `Total Invested: ${this.formatCurrency(totalInvested)} KRW`,
            `Unrealized P/L: ${this.formatCurrency(totalUnrealizedPL)} KRW`,
            `Realized P/L: ${this.formatCurrency(totalRealizedPL)} KRW`,
            `Total Dividends: ${this.formatCurrency(totalDividends)} KRW`,
            `Total P/L: ${this.formatCurrency(totalPL)} KRW`,
            `Total Return: ${totalReturn.toFixed(2)}%`,
            `Number of Stocks: ${portfolioData.length}`,
        ];

        summaryData.forEach((line) => {
            yPosition += 7;
            pdf.text(line, 25, yPosition);
        });

        return yPosition + 10;
    }

    /**
     * @description 성과 지표
     */
    private static addPerformanceMetrics(
        pdf: jsPDF,
        snapshots: PortfolioSnapshot[],
        yPosition: number
    ): number {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('2. Performance Metrics', 20, yPosition);

        yPosition += 10;

        if (snapshots.length < 2) {
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Insufficient data for performance metrics', 25, yPosition);
            return yPosition + 10;
        }

        // 총 수익률 및 CAGR 계산
        const sortedSnapshots = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);
        const firstValue = sortedSnapshots[0].totalValue;
        const lastValue = sortedSnapshots[sortedSnapshots.length - 1].totalValue;
        const totalReturn = ((lastValue - firstValue) / firstValue) * 100;

        const periodMs =
            sortedSnapshots[sortedSnapshots.length - 1].timestamp - sortedSnapshots[0].timestamp;
        const periodDays = Math.max(1, Math.floor(periodMs / (1000 * 60 * 60 * 24)));
        const periodYears = periodDays / 365;
        const cagr =
            periodYears > 0 ? (Math.pow(lastValue / firstValue, 1 / periodYears) - 1) * 100 : totalReturn;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');

        const metricsData = [
            `Total Return: ${totalReturn.toFixed(2)}%`,
            `CAGR: ${cagr.toFixed(2)}%`,
            `Analysis Period: ${periodDays} days`,
            `First Snapshot: ${new Date(sortedSnapshots[0].timestamp).toLocaleDateString()}`,
            `Last Snapshot: ${new Date(sortedSnapshots[sortedSnapshots.length - 1].timestamp).toLocaleDateString()}`,
            `Number of Snapshots: ${snapshots.length}`,
        ];

        metricsData.forEach((line) => {
            yPosition += 7;
            pdf.text(line, 25, yPosition);
        });

        return yPosition + 10;
    }

    /**
     * @description 리스크 지표
     */
    private static addRiskMetrics(
        pdf: jsPDF,
        snapshots: PortfolioSnapshot[],
        yPosition: number
    ): number {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('3. Risk Analysis', 20, yPosition);

        yPosition += 10;

        const riskMetrics = RiskMetricsService.calculateRiskMetrics(snapshots);

        if (!riskMetrics) {
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Unable to calculate risk metrics', 25, yPosition);
            return yPosition + 10;
        }

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');

        const riskData = [
            `Sharpe Ratio: ${riskMetrics.sharpeRatio.toFixed(2)}`,
            `Sortino Ratio: ${riskMetrics.sortinoRatio.toFixed(2)}`,
            `Calmar Ratio: ${riskMetrics.calmarRatio.toFixed(2)}`,
            `Volatility (Annualized): ${riskMetrics.volatility.toFixed(2)}%`,
            `Maximum Drawdown: ${riskMetrics.maxDrawdown.toFixed(2)}%`,
            `MDD Duration: ${riskMetrics.maxDrawdownDays} days`,
            `Win Rate: ${riskMetrics.winRate.toFixed(2)}%`,
            `Max Consecutive Wins: ${riskMetrics.maxConsecutiveWins} days`,
            `Max Consecutive Losses: ${riskMetrics.maxConsecutiveLosses} days`,
        ];

        riskData.forEach((line) => {
            yPosition += 7;
            pdf.text(line, 25, yPosition);
        });

        // 리스크 등급
        yPosition += 10;
        const grade = RiskMetricsService.evaluateRiskGrade(riskMetrics.sharpeRatio);
        const gradeDesc = RiskMetricsService.getRiskGradeDescription(grade);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Risk Grade: ${gradeDesc}`, 25, yPosition);

        return yPosition + 10;
    }

    /**
     * @description 세금 계산
     */
    private static addTaxCalculation(
        pdf: jsPDF,
        portfolio: Portfolio,
        yPosition: number
    ): number {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('4. Tax Calculations (Korea)', 20, yPosition);

        yPosition += 10;

        const portfolioData = portfolio.portfolioData as CalculatedStock[];
        const taxResult = TaxCalculatorService.calculateTax(
            portfolioData,
            portfolio.settings.exchangeRate
        );

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');

        const taxData = [
            `Total Tax: ${TaxCalculatorService.formatCurrency(taxResult.totalTax)}`,
            '',
            'Domestic Stocks:',
            `  Capital Gains: ${TaxCalculatorService.formatCurrency(taxResult.domesticCapitalGains)}`,
            `  Major Shareholder: ${taxResult.isMajorShareholder ? 'Yes' : 'No'}`,
            `  Tax: ${TaxCalculatorService.formatCurrency(taxResult.domesticCapitalGainsTax)}`,
            '',
            'Foreign Stocks:',
            `  Capital Gains: ${TaxCalculatorService.formatCurrency(taxResult.foreignCapitalGains)}`,
            `  Tax: ${TaxCalculatorService.formatCurrency(taxResult.foreignCapitalGainsTax)}`,
            '',
            'Dividends:',
            `  Total Dividends: ${TaxCalculatorService.formatCurrency(taxResult.totalDividends)}`,
            `  Tax: ${TaxCalculatorService.formatCurrency(taxResult.dividendIncomeTax)}`,
        ];

        taxData.forEach((line) => {
            yPosition += 6;
            pdf.text(line, 25, yPosition);
        });

        yPosition += 10;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.text(
            'Note: Tax calculations are for reference only. Consult a tax professional for accurate advice.',
            25,
            yPosition,
            { maxWidth: 160 }
        );

        return yPosition + 10;
    }

    /**
     * @description 종목 상세
     */
    private static addStockDetails(
        pdf: jsPDF,
        portfolio: Portfolio,
        yPosition: number
    ): number {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('5. Stock Details', 20, yPosition);

        yPosition += 10;

        const portfolioData = portfolio.portfolioData as CalculatedStock[];

        portfolioData.forEach((stock, index) => {
            if (yPosition > 250) {
                pdf.addPage();
                yPosition = 20;
            }

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${index + 1}. ${stock.name} (${stock.ticker})`, 25, yPosition);

            yPosition += 7;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');

            if (stock.calculated) {
                const stockDetails = [
                    `Sector: ${stock.sector}`,
                    `Current Price: ${new Decimal(stock.currentPrice).toFixed(2)}`,
                    `Quantity: ${new Decimal(stock.calculated.quantity).toFixed(2)}`,
                    `Avg Buy Price: ${new Decimal(stock.calculated.avgBuyPrice).toFixed(2)}`,
                    `Current Value: ${new Decimal(stock.calculated.currentAmountKRW).toFixed(0)} KRW`,
                    `Profit/Loss: ${new Decimal(stock.calculated.profitLoss).times(portfolio.settings.exchangeRate).toFixed(0)} KRW`,
                    `P/L Rate: ${new Decimal(stock.calculated.profitLossRate).toFixed(2)}%`,
                ];

                stockDetails.forEach((line) => {
                    yPosition += 6;
                    pdf.text(line, 30, yPosition);
                });
            }

            yPosition += 8;
        });

        return yPosition;
    }

    /**
     * @description 통화 포맷팅
     */
    private static formatCurrency(value: number): string {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }
}
