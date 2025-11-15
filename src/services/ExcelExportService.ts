// src/services/ExcelExportService.ts
import type { Workbook, Style, Worksheet, Row } from 'exceljs';
import type { Portfolio, Stock, Transaction } from '../types';
import { PortfolioMetricsService } from './PortfolioMetricsService';
import { toNumber } from '../utils/converterUtil';
import { logger } from './Logger';

/**
 * @class ExcelExportService
 * @description Excel file export service (using exceljs)
 * ExcelJS는 동적 import로 로딩하여 초기 번들 크기 감소
 */
export class ExcelExportService {
    /**
     * Export portfolio data to Excel file
     */
    static async exportPortfolioToExcel(portfolio: Portfolio): Promise<void> {
        try {
            // 동적 import: ExcelJS는 사용 시점에만 로드 (938KB 청크)
            const { Workbook } = await import('exceljs');
            const workbook = new Workbook();

            // Set metadata
            workbook.creator = 'Portfolio Rebalancer';
            workbook.created = new Date();
            workbook.modified = new Date();

            // Portfolio summary sheet
            this.createSummarySheet(workbook, portfolio);

            // Transactions sheet
            this.createTransactionsSheet(workbook, portfolio);

            // Stock details sheet
            this.createStocksDetailSheet(workbook, portfolio);

            // Generate and download Excel file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
            logger.error('Excel export error', 'ExcelExportService', error);
            throw new Error('Excel file export failed');
        }
    }

    /**
     * Create portfolio summary sheet
     */
    private static createSummarySheet(workbook: Workbook, portfolio: Portfolio): void {
        const sheet = workbook.addWorksheet('Portfolio Summary', {
            views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
        });

        // Header style
        const headerStyle: Partial<Style> = {
            font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } },
            alignment: { vertical: 'middle', horizontal: 'center' },
            border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            },
        };

        // Portfolio information
        sheet.addRow(['Portfolio Information']);
        sheet.addRow(['Name', portfolio.name]);
        sheet.addRow(['Exchange Rate', portfolio.settings.exchangeRate]);
        sheet.addRow(['Currency', portfolio.settings.currentCurrency.toUpperCase()]);
        sheet.addRow(['Mode', portfolio.settings.mainMode]);
        sheet.addRow([]);

        // Stock summary header
        const headerRow = sheet.addRow([
            'Stock Name',
            'Ticker',
            'Sector',
            'Target Ratio (%)',
            'Current Price (USD)',
            'Total Transactions',
            'Fixed Buy Enabled',
            'Fixed Buy Amount',
        ]);

        headerRow.eachCell((cell) => {
            cell.style = headerStyle;
        });

        // Stock data
        portfolio.portfolioData.forEach((stock) => {
            const row = sheet.addRow([
                stock.name,
                stock.ticker,
                stock.sector,
                toNumber(stock.targetRatio),
                toNumber(stock.currentPrice),
                stock.transactions.length,
                stock.isFixedBuyEnabled ? 'Yes' : 'No',
                stock.isFixedBuyEnabled ? toNumber(stock.fixedBuyAmount) : 0,
            ]);

            // Data row style
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };

                // Number formatting
                if (colNumber >= 4 && colNumber <= 8) {
                    cell.numFmt = '#,##0.00';
                }
            });
        });

        // Auto-adjust column width
        sheet.columns.forEach((column, idx) => {
            if (idx === 0) column.width = 25;
            else if (idx === 1) column.width = 12;
            else if (idx === 2) column.width = 20;
            else column.width = 18;
        });
    }

    /**
     * Create transactions sheet
     */
    private static createTransactionsSheet(workbook: Workbook, portfolio: Portfolio): void {
        const sheet = workbook.addWorksheet('Transactions', {
            views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
        });

        this.addTransactionHeader(sheet);
        const transactions = this.collectAndSortTransactions(portfolio);
        this.addTransactionRows(sheet, transactions);
        this.adjustTransactionColumnWidths(sheet);
    }

    /**
     * Add header row to transactions sheet
     */
    private static addTransactionHeader(sheet: Worksheet): void {
        const headerStyle: Partial<Style> = {
            font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } },
            alignment: { vertical: 'middle', horizontal: 'center' },
            border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            },
        };

        const headerRow = sheet.addRow([
            'Stock Name',
            'Ticker',
            'Transaction Type',
            'Date',
            'Quantity',
            'Price (USD)',
            'Total Amount (USD)',
        ]);

        headerRow.eachCell((cell) => {
            cell.style = headerStyle;
        });
    }

    /**
     * Collect and sort all transactions by date
     */
    private static collectAndSortTransactions(
        portfolio: Portfolio
    ): Array<{ stock: Stock; transaction: Transaction }> {
        const allTransactions: Array<{ stock: Stock; transaction: Transaction }> = [];

        portfolio.portfolioData.forEach((stock) => {
            stock.transactions.forEach((tx) => {
                allTransactions.push({ stock, transaction: tx });
            });
        });

        allTransactions.sort(
            (a, b) =>
                new Date(b.transaction.date).getTime() - new Date(a.transaction.date).getTime()
        );

        return allTransactions;
    }

    /**
     * Add transaction data rows with styling
     */
    private static addTransactionRows(
        sheet: Worksheet,
        transactions: Array<{ stock: Stock; transaction: Transaction }>
    ): void {
        transactions.forEach(({ stock, transaction }) => {
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
                totalAmount,
            ]);

            this.styleTransactionRow(row, transaction);
        });
    }

    /**
     * Apply styling to transaction row
     */
    private static styleTransactionRow(row: Row, transaction: Transaction): void {
        row.eachCell((cell, colNumber) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };

            // Number formatting
            if (colNumber >= 5 && colNumber <= 7) {
                cell.numFmt = '#,##0.00';
            }

            // Color by transaction type
            if (colNumber === 3) {
                if (transaction.type === 'buy') {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFE2EFDA' },
                    };
                } else if (transaction.type === 'sell') {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFCE4D6' },
                    };
                } else if (transaction.type === 'dividend') {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFE7E6E6' },
                    };
                }
            }
        });
    }

    /**
     * Adjust column widths for transactions sheet
     */
    private static adjustTransactionColumnWidths(sheet: Worksheet): void {
        sheet.columns.forEach((column, idx) => {
            if (idx === 0) column.width = 25;
            else if (idx === 1) column.width = 12;
            else if (idx === 3) column.width = 12;
            else column.width = 18;
        });
    }

    /**
     * Create stock details sheet
     */
    private static createStocksDetailSheet(workbook: Workbook, portfolio: Portfolio): void {
        const sheet = workbook.addWorksheet('Stock Details', {
            views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
        });

        // Header style
        const headerStyle: Partial<Style> = {
            font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } },
            alignment: { vertical: 'middle', horizontal: 'center' },
            border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            },
        };

        // Header
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
            'Unrealized P/L %',
        ]);

        headerRow.eachCell((cell) => {
            cell.style = headerStyle;
        });

        // Stock detail data
        portfolio.portfolioData.forEach((stock) => {
            // Calculate metrics using PortfolioMetricsService
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
                metrics.unrealizedPLPercent,
            ]);

            // Data row style
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };

                // Number formatting
                if (colNumber >= 4) {
                    cell.numFmt = '#,##0.00';
                }

                // P/L color
                if (colNumber === 12 || colNumber === 13) {
                    if (unrealizedPL > 0) {
                        cell.font = { color: { argb: 'FF00B050' }, bold: true };
                    } else if (unrealizedPL < 0) {
                        cell.font = { color: { argb: 'FFFF0000' }, bold: true };
                    }
                }
            });
        });

        // Auto-adjust column width
        sheet.columns.forEach((column, idx) => {
            if (idx === 0) column.width = 25;
            else if (idx === 1) column.width = 12;
            else if (idx === 2) column.width = 20;
            else column.width = 15;
        });
    }
}
