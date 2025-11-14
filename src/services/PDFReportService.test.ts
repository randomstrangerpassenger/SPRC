// src/services/PDFReportService.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PDFReportService } from './PDFReportService';
import type { Portfolio } from '../types';
import Decimal from 'decimal.js';

// Create mock functions that will be referenced
const mockPdfFunctions = {
    addPage: vi.fn(),
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    setTextColor: vi.fn(),
    setFillColor: vi.fn(),
    rect: vi.fn(),
    addImage: vi.fn(),
    save: vi.fn(),
    output: vi.fn().mockReturnValue(new ArrayBuffer(100)),
};

// Mock jsPDF with proper constructor function
vi.mock('jspdf', () => ({
    default: vi.fn(function (this: any) {
        Object.assign(this, mockPdfFunctions);
        return this;
    }),
}));

// Mock html2canvas
vi.mock('html2canvas', () => ({
    default: vi.fn().mockResolvedValue({
        toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mockImageData'),
        width: 800,
        height: 600,
    }),
}));

// Mock PortfolioMetricsService
vi.mock('./PortfolioMetricsService', () => ({
    PortfolioMetricsService: {
        calculateStockMetrics: vi.fn((stock) => ({
            netHoldings: 10,
            avgBuyPrice: 50000,
            currentPrice: 55000,
            currentValue: 550000,
            totalInvested: 500000,
            unrealizedPL: 50000,
            unrealizedPLPercent: 10,
            realizedPL: 0,
            totalPL: 50000,
        })),
    },
}));

describe('PDFReportService', () => {
    let mockPortfolio: Portfolio;

    beforeEach(() => {
        mockPortfolio = {
            id: 'portfolio-1',
            name: 'Test Portfolio',
            portfolioData: [
                {
                    id: 'stock-1',
                    name: 'Test Stock',
                    ticker: 'TST',
                    sector: 'Tech',
                    targetRatio: new Decimal(50),
                    currentPrice: new Decimal(100000),
                    fixedBuyAmount: new Decimal(0),
                    isFixedBuyEnabled: false,
                    manualAmount: new Decimal(0),
                    transactions: [
                        {
                            id: 'tx-1',
                            type: 'buy',
                            date: '2024-01-01',
                            quantity: 10,
                            price: 50000,
                        },
                    ],
                },
            ],
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

    describe('generatePortfolioReport', () => {
        it('should generate PDF report successfully', async () => {
            await PDFReportService.generatePortfolioReport(mockPortfolio);

            expect(mockPdfFunctions.save).toHaveBeenCalled();
            const savedFilename = mockPdfFunctions.save.mock.calls[0][0];
            expect(savedFilename).toMatch(/portfolio_report_Test_Portfolio_\d+\.pdf/);
        });

        it('should set PDF text content', async () => {
            await PDFReportService.generatePortfolioReport(mockPortfolio);

            expect(mockPdfFunctions.text).toHaveBeenCalledWith('Portfolio Report', 105, 20, {
                align: 'center',
            });
        });

        it('should include portfolio information', async () => {
            await PDFReportService.generatePortfolioReport(mockPortfolio);

            const textCalls = mockPdfFunctions.text.mock.calls;
            const allText = textCalls.map((call: any) => call[0]).join(' ');

            expect(allText).toContain('Portfolio Information');
            expect(allText).toContain('Test Portfolio');
            expect(allText).toContain('1300');
            expect(allText).toContain('KRW');
        });

        it('should handle USD currency', async () => {
            mockPortfolio.settings.currentCurrency = 'usd';
            mockPortfolio.settings.exchangeRate = 1;

            await PDFReportService.generatePortfolioReport(mockPortfolio);

            const textCalls = mockPdfFunctions.text.mock.calls;
            const allText = textCalls.map((call: any) => call[0]).join(' ');

            expect(allText).toContain('USD');
        });

        it('should include stock holdings table', async () => {
            await PDFReportService.generatePortfolioReport(mockPortfolio);

            const textCalls = mockPdfFunctions.text.mock.calls;
            const allText = textCalls.map((call: any) => call[0]).join(' ');

            expect(allText).toContain('Stock Holdings');
            expect(allText).toContain('Test Stock');
            expect(allText).toContain('TST');
        });

        it('should handle empty portfolio data', async () => {
            mockPortfolio.portfolioData = [];

            await PDFReportService.generatePortfolioReport(mockPortfolio);

            expect(mockPdfFunctions.save).toHaveBeenCalled();
        });

        it('should add pagination for many stocks', async () => {
            const manyStocks = Array.from({ length: 50 }, (_, i) => ({
                id: `stock-${i}`,
                name: `Stock ${i}`,
                ticker: `ST${i}`,
                sector: 'Tech',
                targetRatio: new Decimal(2),
                currentPrice: new Decimal(100000),
                fixedBuyAmount: new Decimal(0),
                isFixedBuyEnabled: false,
                manualAmount: new Decimal(0),
                transactions: [],
            }));

            mockPortfolio.portfolioData = manyStocks;

            await PDFReportService.generatePortfolioReport(mockPortfolio);

            expect(mockPdfFunctions.addPage).toHaveBeenCalled();
        });

        it('should truncate long stock names', async () => {
            mockPortfolio.portfolioData[0].name =
                'Very Long Stock Name That Exceeds Maximum Length';

            await PDFReportService.generatePortfolioReport(mockPortfolio);

            const textCalls = mockPdfFunctions.text.mock.calls;
            const stockNameCalls = textCalls.filter(
                (call: any) => typeof call[0] === 'string' && call[0].includes('...')
            );

            expect(stockNameCalls.length).toBeGreaterThan(0);
        });

        it('should apply color coding for positive P/L', async () => {
            await PDFReportService.generatePortfolioReport(mockPortfolio);

            expect(mockPdfFunctions.setTextColor).toHaveBeenCalledWith(0, 176, 80); // Green
        });

        it('should apply color coding for negative P/L', async () => {
            const { PortfolioMetricsService } = await import('./PortfolioMetricsService');
            vi.mocked(PortfolioMetricsService.calculateStockMetrics).mockReturnValue({
                netHoldings: 10,
                avgBuyPrice: 55000,
                currentPrice: 50000,
                currentValue: 500000,
                totalInvested: 550000,
                unrealizedPL: -50000,
                unrealizedPLPercent: -9.09,
                realizedPL: 0,
                totalPL: -50000,
            });

            await PDFReportService.generatePortfolioReport(mockPortfolio);

            expect(mockPdfFunctions.setTextColor).toHaveBeenCalledWith(255, 0, 0); // Red
        });

        it('should add chart if available', async () => {
            const mockCanvas = document.createElement('canvas');
            mockCanvas.id = 'myChart';
            document.body.appendChild(mockCanvas);

            const html2canvas = (await import('html2canvas')).default;

            await PDFReportService.generatePortfolioReport(mockPortfolio);

            expect(html2canvas).toHaveBeenCalledWith(mockCanvas, {
                scale: 2,
                backgroundColor: '#ffffff',
            });
            expect(mockPdfFunctions.addImage).toHaveBeenCalled();

            document.body.removeChild(mockCanvas);
        });

        it('should handle missing chart gracefully', async () => {
            await PDFReportService.generatePortfolioReport(mockPortfolio);

            expect(mockPdfFunctions.save).toHaveBeenCalled();
        });

        it('should throw error on PDF generation failure', async () => {
            mockPdfFunctions.save.mockImplementationOnce(() => {
                throw new Error('Save failed');
            });

            await expect(PDFReportService.generatePortfolioReport(mockPortfolio)).rejects.toThrow(
                'PDF 리포트 생성 실패'
            );
        });
    });

    describe('generateReportFromHTML', () => {
        let mockElement: HTMLDivElement;

        beforeEach(() => {
            mockElement = document.createElement('div');
            mockElement.id = 'test-element';
            mockElement.innerHTML = '<h1>Test Content</h1>';
            document.body.appendChild(mockElement);
        });

        afterEach(() => {
            if (document.body.contains(mockElement)) {
                document.body.removeChild(mockElement);
            }
        });

        it('should generate PDF from HTML element', async () => {
            const html2canvas = (await import('html2canvas')).default;

            await PDFReportService.generateReportFromHTML('test-element', 'test_report.pdf');

            expect(html2canvas).toHaveBeenCalledWith(mockElement, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
            });
            expect(mockPdfFunctions.addImage).toHaveBeenCalled();
            expect(mockPdfFunctions.save).toHaveBeenCalledWith('test_report.pdf');
        });

        it('should throw error if element not found', async () => {
            await expect(
                PDFReportService.generateReportFromHTML('non-existent', 'test.pdf')
            ).rejects.toThrow('HTML to PDF 변환 실패');
        });

        it('should replace spaces in filename', async () => {
            await PDFReportService.generateReportFromHTML('test-element', 'my test report.pdf');

            expect(mockPdfFunctions.save).toHaveBeenCalledWith('my_test_report.pdf');
        });

        it('should handle multi-page content', async () => {
            const html2canvas = (await import('html2canvas')).default;
            vi.mocked(html2canvas).mockResolvedValueOnce({
                toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mockImageData'),
                width: 800,
                height: 3000, // Very tall
            } as any);

            await PDFReportService.generateReportFromHTML('test-element', 'test.pdf');

            expect(mockPdfFunctions.addPage).toHaveBeenCalled();
        });

        it('should throw error on html2canvas failure', async () => {
            const html2canvas = (await import('html2canvas')).default;
            vi.mocked(html2canvas).mockRejectedValueOnce(new Error('Canvas error'));

            await expect(
                PDFReportService.generateReportFromHTML('test-element', 'test.pdf')
            ).rejects.toThrow('HTML to PDF 변환 실패');
        });
    });

    describe('integration', () => {
        it('should handle complete workflow', async () => {
            const mockCanvas = document.createElement('canvas');
            mockCanvas.id = 'myChart';
            document.body.appendChild(mockCanvas);

            await PDFReportService.generatePortfolioReport(mockPortfolio);

            // Verify main operations
            expect(mockPdfFunctions.text).toHaveBeenCalled();
            expect(mockPdfFunctions.save).toHaveBeenCalled();

            document.body.removeChild(mockCanvas);
        });
    });
});
