// src/services/ExcelExportService.ts
import { Workbook } from 'exceljs';
import type { Style } from 'exceljs';
import type { Portfolio, Stock, Transaction } from '../types';
import Decimal from 'decimal.js';
import { PortfolioMetricsService } from './PortfolioMetricsService';
import { toNumber } from '../utils/converterUtil';

/**
 * @class ExcelExportService
 * @description Excel 파일 내보내기 서비스 (exceljs 사용)
 */
export class ExcelExportService {
    /**
     * 포트폴리오 데이터를 Excel 파일로 내보내기
     */
    static async exportPortfolioToExcel(portfolio: Portfolio): Promise<void> {
        try {
            const workbook = new Workbook();

            // 메타데이터 설정
            workbook.creator = 'Portfolio Rebalancer';
            workbook.created = new Date();
            workbook.modified = new Date();

            // 1. 포트폴리오 요약 시트
            this.createSummarySheet(workbook, portfolio);

            // 2. 거래 내역 시트
            this.createTransactionsSheet(workbook, portfolio);

            // 3. 종목별 상세 시트
            this.createStocksDetailSheet(workbook, portfolio);

            // Excel 파일 생성 및 다운로드
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = URL.createObjectURL(blob);
            const filename = `portfolio_${portfolio.name}_${Date.now()}.xlsx`;

            const a = document.createElement('a');
            a.href = url;
            a.download = filename.replace(/\s+/g, '_');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Excel export error:', error);
            throw new Error('Excel 파일 내보내기 실패');
        }
    }

    /**
     * 포트폴리오 요약 시트 생성
     */
    private static createSummarySheet(workbook: Workbook, portfolio: Portfolio): void {
        const sheet = workbook.addWorksheet('Portfolio Summary', {
            views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
        });

        // 헤더 스타일
        const headerStyle: Partial<Style> = {
            font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } },
            alignment: { vertical: 'middle', horizontal: 'center' },
            border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }
        };

        // 포트폴리오 정보
        sheet.addRow(['Portfolio Information']);
        sheet.addRow(['Name', portfolio.name]);
        sheet.addRow(['Exchange Rate', portfolio.settings.exchangeRate]);
        sheet.addRow(['Currency', portfolio.settings.currentCurrency.toUpperCase()]);
        sheet.addRow(['Mode', portfolio.settings.mainMode]);
        sheet.addRow([]);

        // 종목 요약 헤더
        const headerRow = sheet.addRow([
            'Stock Name',
            'Ticker',
            'Sector',
            'Target Ratio (%)',
            'Current Price (USD)',
            'Total Transactions',
            'Fixed Buy Enabled',
            'Fixed Buy Amount'
        ]);

        headerRow.eachCell((cell) => {
            cell.style = headerStyle;
        });

        // 종목 데이터
        portfolio.portfolioData.forEach((stock) => {
            const row = sheet.addRow([
                stock.name,
                stock.ticker,
                stock.sector,
                toNumber(stock.targetRatio),
                toNumber(stock.currentPrice),
                stock.transactions.length,
                stock.isFixedBuyEnabled ? 'Yes' : 'No',
                stock.isFixedBuyEnabled ? toNumber(stock.fixedBuyAmount) : 0
            ]);

            // 데이터 행 스타일
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // 숫자 포맷팅
                if (colNumber >= 4 && colNumber <= 8) {
                    cell.numFmt = '#,##0.00';
                }
            });
        });

        // 열 너비 자동 조정
        sheet.columns.forEach((column, idx) => {
            if (idx === 0) column.width = 25;
            else if (idx === 1) column.width = 12;
            else if (idx === 2) column.width = 20;
            else column.width = 18;
        });
    }

    /**
     * 거래 내역 시트 생성
     */
    private static createTransactionsSheet(workbook: Workbook, portfolio: Portfolio): void {
        const sheet = workbook.addWorksheet('Transactions', {
            views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
        });

        // 헤더 스타일
        const headerStyle: Partial<Style> = {
            font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } },
            alignment: { vertical: 'middle', horizontal: 'center' },
            border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }
        };

        // 헤더
        const headerRow = sheet.addRow([
            'Stock Name',
            'Ticker',
            'Transaction Type',
            'Date',
            'Quantity',
            'Price (USD)',
            'Total Amount (USD)'
        ]);

        headerRow.eachCell((cell) => {
            cell.style = headerStyle;
        });

        // 모든 거래 내역 수집 및 정렬
        const allTransactions: Array<{
            stock: Stock;
            transaction: Transaction;
        }> = [];

        portfolio.portfolioData.forEach((stock) => {
            stock.transactions.forEach((tx) => {
                allTransactions.push({ stock, transaction: tx });
            });
        });

        // 날짜순 정렬
        allTransactions.sort((a, b) =>
            new Date(b.transaction.date).getTime() - new Date(a.transaction.date).getTime()
        );

        // 거래 내역 데이터
        allTransactions.forEach(({ stock, transaction }) => {
            const quantity = toNumber(transaction.quantity);
            const price = toNumber(transaction.price);
            const totalAmount = quantity * price;

            const row = sheet.addRow([
                stock.name,
                stock.ticker,
                transaction.type.toUpperCase(),
                transaction.date,
                quantity,
                price,
                totalAmount
            ]);

            // 데이터 행 스타일
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // 숫자 포맷팅
                if (colNumber >= 5 && colNumber <= 7) {
                    cell.numFmt = '#,##0.00';
                }

                // 거래 유형별 색상
                if (colNumber === 3) {
                    if (transaction.type === 'buy') {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFE2EFDA' }
                        };
                    } else if (transaction.type === 'sell') {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFCE4D6' }
                        };
                    } else if (transaction.type === 'dividend') {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFE7E6E6' }
                        };
                    }
                }
            });
        });

        // 열 너비 자동 조정
        sheet.columns.forEach((column, idx) => {
            if (idx === 0) column.width = 25;
            else if (idx === 1) column.width = 12;
            else if (idx === 3) column.width = 12;
            else column.width = 18;
        });
    }

    /**
     * 종목별 상세 시트 생성
     */
    private static createStocksDetailSheet(workbook: Workbook, portfolio: Portfolio): void {
        const sheet = workbook.addWorksheet('Stock Details', {
            views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
        });

        // 헤더 스타일
        const headerStyle: Partial<Style> = {
            font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } },
            alignment: { vertical: 'middle', horizontal: 'center' },
            border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }
        };

        // 헤더
        const headerRow = sheet.addRow([
            'Stock Name',
            'Ticker',
            'Sector',
            'Target Ratio (%)',
            'Current Price (USD)',
            'Total Buy Qty',
            'Total Sell Qty',
            'Net Holdings',
            'Avg Buy Price',
            'Total Invested',
            'Current Value',
            'Unrealized P/L',
            'Unrealized P/L %'
        ]);

        headerRow.eachCell((cell) => {
            cell.style = headerStyle;
        });

        // 종목별 상세 데이터
        portfolio.portfolioData.forEach((stock) => {
            // PortfolioMetricsService를 사용하여 메트릭 계산
            const metrics = PortfolioMetricsService.calculateStockMetrics(stock);

            const row = sheet.addRow([
                stock.name,
                stock.ticker,
                stock.sector,
                toNumber(stock.targetRatio),
                metrics.currentPrice,
                metrics.totalBuyQty,
                metrics.totalSellQty,
                metrics.netHoldings,
                metrics.avgBuyPrice,
                metrics.totalInvested,
                metrics.currentValue,
                metrics.unrealizedPL,
                metrics.unrealizedPLPercent
            ]);

            // 데이터 행 스타일
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // 숫자 포맷팅
                if (colNumber >= 4) {
                    cell.numFmt = '#,##0.00';
                }

                // P/L 색상
                if (colNumber === 12 || colNumber === 13) {
                    if (unrealizedPL > 0) {
                        cell.font = { color: { argb: 'FF00B050' }, bold: true };
                    } else if (unrealizedPL < 0) {
                        cell.font = { color: { argb: 'FFFF0000' }, bold: true };
                    }
                }
            });
        });

        // 열 너비 자동 조정
        sheet.columns.forEach((column, idx) => {
            if (idx === 0) column.width = 25;
            else if (idx === 1) column.width = 12;
            else if (idx === 2) column.width = 20;
            else column.width = 15;
        });
    }
}