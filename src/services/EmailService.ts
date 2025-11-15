// src/services/EmailService.ts
import type { Portfolio } from '../types';
import { logger } from './Logger';

/**
 * Email configuration interface
 */
export interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

/**
 * Email attachment interface
 */
interface EmailAttachment {
    filename: string;
    content: string; // Base64 encoded
    encoding: string;
}

/**
 * @class EmailService
 * @description Email sending service (communicates with backend server)
 */
export class EmailService {
    private static readonly API_BASE_URL = 'http://localhost:3001/api';

    /**
     * Send portfolio report via email
     */
    static async sendPortfolioReport(
        portfolio: Portfolio,
        toEmail: string,
        emailConfig?: EmailConfig,
        options: {
            includeExcel?: boolean;
            includePDF?: boolean;
        } = { includeExcel: true, includePDF: true }
    ): Promise<void> {
        try {
            // Create attachments
            const attachments: EmailAttachment[] = [];

            // Excel attachment
            if (options.includeExcel) {
                const excelBuffer = await this.generateExcelBuffer(portfolio);
                const excelBase64 = this.arrayBufferToBase64(excelBuffer);
                attachments.push({
                    filename: `portfolio_${portfolio.name}_${Date.now()}.xlsx`,
                    content: excelBase64,
                    encoding: 'base64',
                });
            }

            // PDF attachment
            if (options.includePDF) {
                const pdfBuffer = await this.generatePDFBuffer(portfolio);
                const pdfBase64 = this.arrayBufferToBase64(pdfBuffer);
                attachments.push({
                    filename: `portfolio_report_${portfolio.name}_${Date.now()}.pdf`,
                    content: pdfBase64,
                    encoding: 'base64',
                });
            }

            // Email HTML body
            const html = this.generateEmailHTML(portfolio);

            // Email sending request
            const response = await fetch(`${this.API_BASE_URL}/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: toEmail,
                    subject: `Portfolio Report - ${portfolio.name}`,
                    html,
                    text: `Portfolio Report for ${portfolio.name}`,
                    attachments,
                    emailConfig,
                }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to send email');
            }
        } catch (error) {
            logger.error('Email sending error', 'EmailService', error);
            throw new Error(
                'Email sending failed: ' + (error instanceof Error ? error.message : 'Unknown error')
            );
        }
    }

    /**
     * Test email configuration
     */
    static async testEmailConfig(emailConfig: EmailConfig): Promise<boolean> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/test-email-config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ emailConfig }),
            });

            const result = await response.json();
            return result.success;
        } catch (error) {
            logger.error('Email config test error', 'EmailService', error);
            return false;
        }
    }

    /**
     * Check server health
     */
    static async checkServerHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/health`);
            const result = await response.json();
            return result.status === 'ok';
        } catch (error) {
            logger.error('Server health check failed', 'EmailService', error);
            return false;
        }
    }

    /**
     * Generate Excel buffer
     */
    private static async generateExcelBuffer(portfolio: Portfolio): Promise<ArrayBuffer> {
        // 동적 import: ExcelJS는 사용 시점에만 로드
        const { Workbook } = await import('exceljs');
        const workbook = new Workbook();
        workbook.creator = 'Portfolio Rebalancer';
        workbook.created = new Date();

        // Summary sheet
        const summarySheet = workbook.addWorksheet('Summary');
        summarySheet.addRow(['Portfolio Name', portfolio.name]);
        summarySheet.addRow(['Exchange Rate', portfolio.settings.exchangeRate]);
        summarySheet.addRow(['Currency', portfolio.settings.currentCurrency]);
        summarySheet.addRow(['Total Stocks', portfolio.portfolioData.length]);

        // Transactions sheet
        const txSheet = workbook.addWorksheet('Transactions');
        txSheet.addRow(['Stock', 'Ticker', 'Type', 'Date', 'Quantity', 'Price', 'Total']);

        portfolio.portfolioData.forEach((stock) => {
            stock.transactions.forEach((tx) => {
                const qty = tx.quantity instanceof Object ? tx.quantity.toString() : tx.quantity;
                const price = tx.price instanceof Object ? tx.price.toString() : tx.price;
                const total = parseFloat(qty.toString()) * parseFloat(price.toString());

                txSheet.addRow([
                    stock.name,
                    stock.ticker,
                    tx.type,
                    tx.date,
                    parseFloat(qty.toString()),
                    parseFloat(price.toString()),
                    total,
                ]);
            });
        });

        return await workbook.xlsx.writeBuffer();
    }

    /**
     * Generate PDF buffer
     */
    private static async generatePDFBuffer(portfolio: Portfolio): Promise<ArrayBuffer> {
        // 동적 import: jsPDF는 사용 시점에만 로드
        const { default: jsPDF } = await import('jspdf');
        const pdf = new jsPDF('p', 'mm', 'a4');
        let yPos = 20;

        // Title
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Portfolio Report', 105, yPos, { align: 'center' });

        yPos += 15;

        // Portfolio info
        pdf.setFontSize(12);
        pdf.text(`Portfolio: ${portfolio.name}`, 20, yPos);
        yPos += 8;
        pdf.setFontSize(10);
        pdf.text(`Total Stocks: ${portfolio.portfolioData.length}`, 20, yPos);
        yPos += 6;
        pdf.text(`Exchange Rate: ${portfolio.settings.exchangeRate}`, 20, yPos);
        yPos += 6;
        pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, yPos);
        yPos += 12;

        // Stock list
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Holdings', 20, yPos);
        yPos += 8;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');

        portfolio.portfolioData.forEach((stock) => {
            if (yPos > 270) {
                pdf.addPage();
                yPos = 20;
            }

            pdf.text(`${stock.name} (${stock.ticker})`, 20, yPos);
            yPos += 6;
        });

        return pdf.output('arraybuffer');
    }

    /**
     * Generate email HTML body
     */
    private static generateEmailHTML(portfolio: Portfolio): string {
        const totalStocks = portfolio.portfolioData.length;
        const generatedDate = new Date().toLocaleString();

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .info-box {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
        .value {
            color: #333;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            color: #777;
            font-size: 12px;
        }
        .stock-list {
            background: white;
            padding: 15px;
            margin: 15px 0;
            border-radius: 8px;
            max-height: 300px;
            overflow-y: auto;
        }
        .stock-item {
            padding: 8px;
            border-bottom: 1px solid #f0f0f0;
        }
        .stock-item:last-child {
            border-bottom: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Portfolio Report</h1>
    </div>
    <div class="content">
        <h2>Portfolio Summary</h2>
        <div class="info-box">
            <div class="info-row">
                <span class="label">Portfolio Name:</span>
                <span class="value">${portfolio.name}</span>
            </div>
            <div class="info-row">
                <span class="label">Total Stocks:</span>
                <span class="value">${totalStocks}</span>
            </div>
            <div class="info-row">
                <span class="label">Exchange Rate:</span>
                <span class="value">${portfolio.settings.exchangeRate} ${portfolio.settings.currentCurrency.toUpperCase()}/USD</span>
            </div>
            <div class="info-row">
                <span class="label">Currency Mode:</span>
                <span class="value">${portfolio.settings.currentCurrency.toUpperCase()}</span>
            </div>
            <div class="info-row">
                <span class="label">Generated:</span>
                <span class="value">${generatedDate}</span>
            </div>
        </div>

        <h3>Holdings</h3>
        <div class="stock-list">
            ${portfolio.portfolioData
                .map(
                    (stock) => `
                <div class="stock-item">
                    <strong>${stock.name}</strong> (${stock.ticker}) - ${stock.sector}<br>
                    <small>Target: ${stock.targetRatio}% | Price: $${stock.currentPrice} | Transactions: ${stock.transactions.length}</small>
                </div>
            `
                )
                .join('')}
        </div>

        <p style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 5px; border-left: 4px solid #2196f3;">
            <strong>📎 Attachments:</strong> This email includes detailed Excel and PDF reports of your portfolio.
        </p>
    </div>
    <div class="footer">
        <p>This report was generated automatically by Portfolio Rebalancer</p>
        <p>&copy; ${new Date().getFullYear()} Portfolio Rebalancer. All rights reserved.</p>
    </div>
</body>
</html>
        `.trim();
    }

    /**
     * Convert ArrayBuffer to Base64
     */
    private static arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}
