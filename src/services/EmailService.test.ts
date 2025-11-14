// src/services/EmailService.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EmailService } from './EmailService';
import type { Portfolio } from '../types';

// Mock fetch globally
global.fetch = vi.fn();

// Mock ExcelExportService
vi.mock('./ExcelExportService', () => ({
    ExcelExportService: {
        generateExcelReport: vi.fn().mockResolvedValue(new ArrayBuffer(100)),
    },
}));

// Mock PDFReportService
vi.mock('./PDFReportService', () => ({
    PDFReportService: {
        generatePDFReport: vi.fn().mockResolvedValue({
            output: vi.fn().mockReturnValue('base64pdfdata'),
        }),
    },
}));

describe('EmailService', () => {
    let mockPortfolio: Portfolio;

    beforeEach(() => {
        mockPortfolio = {
            id: 'portfolio-1',
            name: 'Test Portfolio',
            portfolioData: [],
            settings: {
                mainMode: 'simple',
                currentCurrency: 'krw',
                exchangeRate: 1300,
                rebalancingTolerance: 5,
                tradingFeeRate: 0.3,
                taxRate: 15,
            },
        };

        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('sendPortfolioReport', () => {
        it('should send email with Excel and PDF attachments', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true }),
            } as Response);

            await EmailService.sendPortfolioReport(
                mockPortfolio,
                'test@example.com',
                undefined,
                { includeExcel: true, includePDF: true }
            );

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3001/api/send-email',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: expect.any(String),
                })
            );
        });

        it('should send email with Excel only', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true }),
            } as Response);

            await EmailService.sendPortfolioReport(
                mockPortfolio,
                'test@example.com',
                undefined,
                { includeExcel: true, includePDF: false }
            );

            expect(fetch).toHaveBeenCalled();
            const callArgs = vi.mocked(fetch).mock.calls[0];
            const body = JSON.parse(callArgs[1]?.body as string);
            expect(body.attachments).toHaveLength(1);
        });

        it('should send email with PDF only', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true }),
            } as Response);

            await EmailService.sendPortfolioReport(
                mockPortfolio,
                'test@example.com',
                undefined,
                { includeExcel: false, includePDF: true }
            );

            expect(fetch).toHaveBeenCalled();
            const callArgs = vi.mocked(fetch).mock.calls[0];
            const body = JSON.parse(callArgs[1]?.body as string);
            expect(body.attachments).toHaveLength(1);
        });

        it('should throw error when email send fails', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: false, message: 'Failed to send email' }),
            } as Response);

            await expect(
                EmailService.sendPortfolioReport(mockPortfolio, 'test@example.com')
            ).rejects.toThrow('이메일 전송 실패');
        });

        it('should handle network errors', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

            await expect(
                EmailService.sendPortfolioReport(mockPortfolio, 'test@example.com')
            ).rejects.toThrow('이메일 전송 실패');
        });
    });

    describe('arrayBufferToBase64', () => {
        it('should convert ArrayBuffer to base64', () => {
            const buffer = new Uint8Array([72, 101, 108, 108, 111]).buffer; // "Hello"
            const base64 = (EmailService as any).arrayBufferToBase64(buffer);

            expect(typeof base64).toBe('string');
            expect(base64.length).toBeGreaterThan(0);
        });

        it('should handle empty ArrayBuffer', () => {
            const buffer = new ArrayBuffer(0);
            const base64 = (EmailService as any).arrayBufferToBase64(buffer);

            expect(base64).toBe('');
        });
    });

    describe('testEmailConfig', () => {
        it('should successfully test email config', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true }),
            } as Response);

            const result = await EmailService.testEmailConfig({
                host: 'smtp.example.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'test@example.com',
                    pass: 'password',
                },
            });

            expect(result).toBe(true);
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3001/api/test-email-config',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            );
        });

        it('should return false when connection test fails', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: false }),
            } as Response);

            const result = await EmailService.testEmailConfig({
                host: 'smtp.example.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'test@example.com',
                    pass: 'wrong-password',
                },
            });

            expect(result).toBe(false);
        });

        it('should return false on network error', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

            const result = await EmailService.testEmailConfig({
                host: 'smtp.example.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'test@example.com',
                    pass: 'password',
                },
            });

            expect(result).toBe(false);
        });
    });

    describe('generateEmailHTML', () => {
        it('should generate HTML email content', () => {
            const content = (EmailService as any).generateEmailHTML(mockPortfolio);

            expect(typeof content).toBe('string');
            expect(content).toContain('Test Portfolio');
            expect(content).toContain('<html>');
            expect(content).toContain('</html>');
        });

        it('should include portfolio name in content', () => {
            const content = (EmailService as any).generateEmailHTML(mockPortfolio);

            expect(content).toContain(mockPortfolio.name);
        });

        it('should be valid HTML structure', () => {
            const content = (EmailService as any).generateEmailHTML(mockPortfolio);

            expect(content).toMatch(/<html[^>]*>.*<\/html>/s);
            expect(content).toMatch(/<body[^>]*>.*<\/body>/s);
        });

        it('should include exchange rate and currency info', () => {
            const content = (EmailService as any).generateEmailHTML(mockPortfolio);

            expect(content).toContain('1300');
            expect(content).toContain('KRW');
        });
    });

    describe('checkServerHealth', () => {
        it('should return true when server is healthy', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'ok' }),
            } as Response);

            const result = await EmailService.checkServerHealth();

            expect(result).toBe(true);
            expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/health');
        });

        it('should return false when server is unhealthy', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'error' }),
            } as Response);

            const result = await EmailService.checkServerHealth();

            expect(result).toBe(false);
        });

        it('should return false on network error', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

            const result = await EmailService.checkServerHealth();

            expect(result).toBe(false);
        });
    });
});
