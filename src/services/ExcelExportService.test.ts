// src/services/ExcelExportService.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ExcelExportService } from './ExcelExportService';
import type { Portfolio } from '../types';
import Decimal from 'decimal.js';

// Mock exceljs
const mockRow = {
    font: {},
    fill: {},
    alignment: {},
    border: {},
    height: 0,
    eachCell: vi.fn((callback) => {
        // Mock 3 cells
        for (let i = 1; i <= 3; i++) {
            callback({ font: {}, fill: {}, alignment: {}, border: {} }, i);
        }
    }),
};

const mockWorksheet = {
    addRow: vi.fn().mockReturnValue(mockRow),
    getRow: vi.fn().mockReturnValue(mockRow),
    getColumn: vi.fn().mockReturnValue({
        width: 0,
    }),
    mergeCells: vi.fn(),
    columns: [],
};

const mockWorkbook = {
    creator: '',
    created: null as any,
    addWorksheet: vi.fn().mockReturnValue(mockWorksheet),
    xlsx: {
        writeBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(100)),
    },
};

vi.mock('exceljs', () => ({
    Workbook: vi.fn(function (this: any) {
        Object.assign(this, mockWorkbook);
        return this;
    }),
}));

describe('ExcelExportService', () => {
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

        // Mock URL and document methods
        global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
        global.URL.revokeObjectURL = vi.fn();

        const mockLink = {
            href: '',
            download: '',
            click: vi.fn(),
            style: {},
        };
        vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('exportPortfolioToExcel', () => {
        it('should export portfolio to Excel file', async () => {
            await ExcelExportService.exportPortfolioToExcel(mockPortfolio);

            expect(mockWorkbook.addWorksheet).toHaveBeenCalledTimes(3); // Summary, Transactions, Stocks Detail
            expect(mockWorkbook.xlsx.writeBuffer).toHaveBeenCalled();
            expect(global.URL.createObjectURL).toHaveBeenCalled();
        });

        it('should create all required worksheets', async () => {
            await ExcelExportService.exportPortfolioToExcel(mockPortfolio);

            // Should create 3 worksheets: Summary, Transactions, Stocks Detail
            expect(mockWorkbook.addWorksheet).toHaveBeenCalledTimes(3);
        });

        it('should handle empty portfolio data', async () => {
            mockPortfolio.portfolioData = [];

            await ExcelExportService.exportPortfolioToExcel(mockPortfolio);

            expect(mockWorkbook.xlsx.writeBuffer).toHaveBeenCalled();
        });

        it('should include all stock data', async () => {
            mockPortfolio.portfolioData = [
                {
                    id: 'stock-1',
                    name: 'Stock 1',
                    ticker: 'ST1',
                    sector: 'Tech',
                    targetRatio: new Decimal(30),
                    currentPrice: new Decimal(50000),
                    fixedBuyAmount: new Decimal(0),
                    isFixedBuyEnabled: false,
                    manualAmount: new Decimal(0),
                    transactions: [],
                },
                {
                    id: 'stock-2',
                    name: 'Stock 2',
                    ticker: 'ST2',
                    sector: 'Finance',
                    targetRatio: new Decimal(70),
                    currentPrice: new Decimal(100000),
                    fixedBuyAmount: new Decimal(0),
                    isFixedBuyEnabled: false,
                    manualAmount: new Decimal(0),
                    transactions: [],
                },
            ];

            await ExcelExportService.exportPortfolioToExcel(mockPortfolio);

            // Should call addRow for each stock
            expect(mockWorksheet.addRow).toHaveBeenCalled();
        });

        it('should throw error on buffer generation failure', async () => {
            vi.mocked(mockWorkbook.xlsx.writeBuffer).mockRejectedValueOnce(
                new Error('Write failed')
            );

            await expect(ExcelExportService.exportPortfolioToExcel(mockPortfolio)).rejects.toThrow(
                'Excel 파일 내보내기 실패'
            );
        });
    });

    describe('worksheet creation', () => {
        it('should add rows to summary sheet', async () => {
            await ExcelExportService.exportPortfolioToExcel(mockPortfolio);

            // Summary sheet should have portfolio info rows
            expect(mockWorksheet.addRow).toHaveBeenCalled();
        });

        it('should handle stocks with multiple transactions', async () => {
            mockPortfolio.portfolioData[0].transactions = [
                {
                    id: 'tx-1',
                    type: 'buy',
                    date: '2024-01-01',
                    quantity: 10,
                    price: 50000,
                },
                {
                    id: 'tx-2',
                    type: 'sell',
                    date: '2024-01-02',
                    quantity: 5,
                    price: 55000,
                },
                {
                    id: 'tx-3',
                    type: 'dividend',
                    date: '2024-01-03',
                    quantity: 0,
                    price: 1000,
                },
            ];

            await ExcelExportService.exportPortfolioToExcel(mockPortfolio);

            expect(mockWorksheet.addRow).toHaveBeenCalled();
        });

        it('should complete successfully', async () => {
            await ExcelExportService.exportPortfolioToExcel(mockPortfolio);

            expect(mockWorksheet.addRow).toHaveBeenCalled();
            expect(mockWorkbook.xlsx.writeBuffer).toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should log error on export failure', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            vi.mocked(mockWorkbook.xlsx.writeBuffer).mockRejectedValueOnce(
                new Error('Export failed')
            );

            await expect(
                ExcelExportService.exportPortfolioToExcel(mockPortfolio)
            ).rejects.toThrow();

            expect(consoleErrorSpy).toHaveBeenCalledWith('Excel export error:', expect.any(Error));

            consoleErrorSpy.mockRestore();
        });
    });
});
