// src/services/PDFReportService.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Portfolio, Stock } from '../types';
import Decimal from 'decimal.js';
import { PortfolioMetricsService } from './PortfolioMetricsService';
import { logger } from './Logger';

/**
 * @class PDFReportService
 * @description PDF 리포트 생성 서비스 (jspdf, html2canvas 사용)
 */
export class PDFReportService {
    /**
     * 포트폴리오 리포트를 PDF로 생성
     */
    static async generatePortfolioReport(portfolio: Portfolio): Promise<void> {
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            let yPosition = 20;

            // 제목
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Portfolio Report', 105, yPosition, { align: 'center' });

            yPosition += 15;

            // 포트폴리오 정보
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Portfolio Information', 20, yPosition);

            yPosition += 8;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Name: ${portfolio.name}`, 20, yPosition);

            yPosition += 6;
            pdf.text(
                `Exchange Rate: ${portfolio.settings.exchangeRate} ${portfolio.settings.currentCurrency.toUpperCase()}/USD`,
                20,
                yPosition
            );

            yPosition += 6;
            pdf.text(
                `Currency Mode: ${portfolio.settings.currentCurrency.toUpperCase()}`,
                20,
                yPosition
            );

            yPosition += 6;
            pdf.text(
                `Rebalancing Mode: ${portfolio.settings.mainMode.toUpperCase()}`,
                20,
                yPosition
            );

            yPosition += 6;
            pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);

            yPosition += 12;

            // 포트폴리오 요약 통계
            const summary = this.calculatePortfolioSummary(portfolio);

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Portfolio Summary', 20, yPosition);

            yPosition += 8;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Total Stocks: ${portfolio.portfolioData.length}`, 20, yPosition);

            yPosition += 6;
            pdf.text(`Total Invested: $${summary.totalInvested.toFixed(2)}`, 20, yPosition);

            yPosition += 6;
            pdf.text(`Current Value: $${summary.currentValue.toFixed(2)}`, 20, yPosition);

            yPosition += 6;
            pdf.setFont('helvetica', 'bold');
            if (summary.totalPL >= 0) {
                pdf.setTextColor(0, 176, 80); // Green
            } else {
                pdf.setTextColor(255, 0, 0); // Red
            }
            pdf.text(
                `Total P/L: $${summary.totalPL.toFixed(2)} (${summary.totalPLPercent.toFixed(2)}%)`,
                20,
                yPosition
            );
            pdf.setTextColor(0, 0, 0); // Reset to black

            yPosition += 12;

            // 종목 목록 테이블
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.text('Stock Holdings', 20, yPosition);

            yPosition += 8;

            // 테이블 헤더
            pdf.setFontSize(9);
            const tableHeaders = [
                'Stock',
                'Ticker',
                'Qty',
                'Avg Price',
                'Current',
                'Value',
                'P/L %',
            ];
            const colWidths = [40, 20, 18, 22, 22, 25, 23];
            let xPosition = 20;

            pdf.setFillColor(68, 114, 196);
            pdf.setTextColor(255, 255, 255);
            pdf.rect(20, yPosition - 5, 170, 7, 'F');

            tableHeaders.forEach((header, idx) => {
                pdf.text(header, xPosition, yPosition, { align: 'left' });
                xPosition += colWidths[idx];
            });

            yPosition += 7;
            pdf.setTextColor(0, 0, 0);

            // 테이블 데이터
            pdf.setFont('helvetica', 'normal');
            portfolio.portfolioData.forEach((stock, index) => {
                const stockData = PortfolioMetricsService.calculateStockMetrics(stock);

                // 새 페이지가 필요한지 확인
                if (yPosition > 270) {
                    pdf.addPage();
                    yPosition = 20;
                }

                // 행 배경색 (교대로)
                if (index % 2 === 0) {
                    pdf.setFillColor(242, 242, 242);
                    pdf.rect(20, yPosition - 5, 170, 7, 'F');
                }

                xPosition = 20;

                // Stock Name (truncate if too long)
                const stockName =
                    stock.name.length > 18 ? stock.name.substring(0, 15) + '...' : stock.name;
                pdf.text(stockName, xPosition, yPosition);
                xPosition += colWidths[0];

                // Ticker
                pdf.text(stock.ticker, xPosition, yPosition);
                xPosition += colWidths[1];

                // Quantity
                pdf.text(stockData.netHoldings.toFixed(2), xPosition, yPosition);
                xPosition += colWidths[2];

                // Avg Buy Price
                pdf.text(`$${stockData.avgBuyPrice.toFixed(2)}`, xPosition, yPosition);
                xPosition += colWidths[3];

                // Current Price
                pdf.text(`$${stockData.currentPrice.toFixed(2)}`, xPosition, yPosition);
                xPosition += colWidths[4];

                // Current Value
                pdf.text(`$${stockData.currentValue.toFixed(2)}`, xPosition, yPosition);
                xPosition += colWidths[5];

                // P/L %
                if (stockData.unrealizedPLPercent >= 0) {
                    pdf.setTextColor(0, 176, 80); // Green
                } else {
                    pdf.setTextColor(255, 0, 0); // Red
                }
                pdf.text(`${stockData.unrealizedPLPercent.toFixed(2)}%`, xPosition, yPosition);
                pdf.setTextColor(0, 0, 0); // Reset

                yPosition += 7;
            });

            // 차트 캡처 및 추가 (차트가 있는 경우)
            await this.addChartsIfAvailable(pdf, yPosition);

            // PDF 다운로드
            const filename = `portfolio_report_${portfolio.name}_${Date.now()}.pdf`;
            pdf.save(filename.replace(/\s+/g, '_'));
        } catch (error) {
            logger.error('PDF generation error', 'PDFReportService', error);
            throw new Error('PDF 리포트 생성 실패');
        }
    }

    /**
     * 포트폴리오 요약 통계 계산
     */
    private static calculatePortfolioSummary(portfolio: Portfolio): {
        totalInvested: number;
        currentValue: number;
        totalPL: number;
        totalPLPercent: number;
    } {
        let totalInvested = 0;
        let currentValue = 0;

        portfolio.portfolioData.forEach((stock) => {
            const metrics = PortfolioMetricsService.calculateStockMetrics(stock);
            totalInvested += metrics.totalInvested;
            currentValue += metrics.currentValue;
        });

        const totalPL = currentValue - totalInvested;
        const totalPLPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

        return {
            totalInvested,
            currentValue,
            totalPL,
            totalPLPercent,
        };
    }

    /**
     * 차트를 PDF에 추가 (차트가 있는 경우)
     */
    private static async addChartsIfAvailable(pdf: jsPDF, startY: number): Promise<void> {
        try {
            // 메인 차트 찾기
            const chartCanvas = document.querySelector('#myChart') as HTMLCanvasElement;

            if (chartCanvas) {
                // 새 페이지 추가
                pdf.addPage();

                // 제목
                pdf.setFontSize(14);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Portfolio Visualization', 105, 20, { align: 'center' });

                // 차트 캡처
                const canvas = await html2canvas(chartCanvas, {
                    scale: 2,
                    backgroundColor: '#ffffff',
                });

                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 170;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                // 차트 이미지 추가
                pdf.addImage(imgData, 'PNG', 20, 30, imgWidth, imgHeight);
            }
        } catch (error) {
            logger.warn('차트 추가 실패 (차트가 없거나 오류 발생)', 'PDFReportService', error);
            // 차트 추가 실패는 치명적 오류가 아니므로 계속 진행
        }
    }

    /**
     * HTML 요소를 PDF에 추가 (고급 기능)
     */
    static async generateReportFromHTML(elementId: string, filename: string): Promise<void> {
        try {
            const element = document.getElementById(elementId);
            if (!element) {
                throw new Error(`Element with id "${elementId}" not found`);
            }

            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // 첫 페이지 추가
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // 추가 페이지가 필요한 경우
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(filename.replace(/\s+/g, '_'));
        } catch (error) {
            logger.error('HTML to PDF conversion error', 'PDFReportService', error);
            throw new Error('HTML to PDF 변환 실패');
        }
    }
}
