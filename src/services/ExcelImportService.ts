// src/services/ExcelImportService.ts
import type { Workbook, Worksheet } from 'exceljs';
import type { Transaction, Stock } from '../types';
import Decimal from 'decimal.js';
import { logger } from './Logger';

/**
 * @class ExcelImportService
 * @description Excel/CSV file import service
 */
export class ExcelImportService {
    /**
     * Import transactions from CSV file
     */
    static async importTransactionsFromCSV(file: File): Promise<ParsedTransactionData[]> {
        try {
            const text = await file.text();
            return this.parseCSV(text);
        } catch (error) {
            logger.error('CSV import error', 'ExcelImportService', error);
            throw new Error('CSV 파일 가져오기 실패');
        }
    }

    /**
     * Import transactions from Excel file
     */
    static async importTransactionsFromExcel(file: File): Promise<ParsedTransactionData[]> {
        try {
            // 동적 import: ExcelJS는 사용 시점에만 로드
            const { Workbook } = await import('exceljs');
            const workbook = new Workbook();

            const arrayBuffer = await file.arrayBuffer();
            await workbook.xlsx.load(arrayBuffer);

            // "Transactions" 시트를 먼저 찾고, 없으면 첫 번째 시트 사용
            let worksheet: Worksheet | undefined = workbook.getWorksheet('Transactions');
            if (!worksheet) {
                worksheet = workbook.worksheets[0];
            }

            if (!worksheet) {
                throw new Error('워크시트를 찾을 수 없습니다');
            }

            return this.parseExcelWorksheet(worksheet);
        } catch (error) {
            logger.error('Excel import error', 'ExcelImportService', error);
            throw new Error('Excel 파일 가져오기 실패');
        }
    }

    /**
     * Parse CSV text
     */
    private static parseCSV(text: string): ParsedTransactionData[] {
        const lines = text.split('\n').filter((line) => line.trim());
        if (lines.length < 2) {
            throw new Error('CSV 파일이 비어있거나 형식이 올바르지 않습니다');
        }

        // 헤더 파싱
        const header = this.parseCSVLine(lines[0]);
        const headerMap = this.createHeaderMap(header);

        // 데이터 파싱
        const transactions: ParsedTransactionData[] = [];
        for (let i = 1; i < lines.length; i++) {
            try {
                const values = this.parseCSVLine(lines[i]);
                if (values.length === 0 || values.every((v) => !v.trim())) {
                    continue; // 빈 줄 건너뛰기
                }

                const transaction = this.parseTransactionFromValues(values, headerMap);
                if (transaction) {
                    transactions.push(transaction);
                }
            } catch (error) {
                logger.warn(
                    `Line ${i + 1} parsing failed, skipping`,
                    'ExcelImportService.parseCSV',
                    error
                );
            }
        }

        return transactions;
    }

    /**
     * Parse CSV line (handle quoted values)
     */
    private static parseCSVLine(line: string): string[] {
        const values: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                // 따옴표 처리
                if (inQuotes && line[i + 1] === '"') {
                    // 이중 따옴표는 하나의 따옴표로
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // 쉼표 구분자 (따옴표 밖에서만)
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        values.push(current.trim());
        return values;
    }

    /**
     * Parse Excel worksheet
     */
    private static parseExcelWorksheet(worksheet: Worksheet): ParsedTransactionData[] {
        const transactions: ParsedTransactionData[] = [];

        // 첫 번째 행을 헤더로 사용
        const headerRow = worksheet.getRow(1);
        const header: string[] = [];
        headerRow.eachCell((cell) => {
            header.push(cell.value?.toString() || '');
        });

        const headerMap = this.createHeaderMap(header);

        // 데이터 행 파싱 (2번째 행부터)
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // 헤더 건너뛰기

            try {
                const values: string[] = [];
                row.eachCell({ includeEmpty: true }, (cell) => {
                    values.push(cell.value?.toString() || '');
                });

                const transaction = this.parseTransactionFromValues(values, headerMap);
                if (transaction) {
                    transactions.push(transaction);
                }
            } catch (error) {
                logger.warn(
                    `Row ${rowNumber} parsing failed, skipping`,
                    'ExcelImportService.parseExcelWorksheet',
                    error
                );
            }
        });

        return transactions;
    }

    /**
     * Create header map for flexible column matching
     */
    private static createHeaderMap(header: string[]): HeaderMap {
        const map: HeaderMap = {
            stockName: -1,
            ticker: -1,
            type: -1,
            date: -1,
            quantity: -1,
            price: -1,
        };

        header.forEach((col, index) => {
            const normalized = col.toLowerCase().trim();

            // Stock Name
            if (
                normalized.includes('stock') &&
                (normalized.includes('name') || normalized === 'stock')
            ) {
                map.stockName = index;
            }
            // Ticker
            else if (normalized.includes('ticker') || normalized === 'symbol') {
                map.ticker = index;
            }
            // Transaction Type
            else if (
                normalized.includes('type') ||
                normalized.includes('transaction') ||
                normalized === 'action'
            ) {
                map.type = index;
            }
            // Date
            else if (normalized.includes('date')) {
                map.date = index;
            }
            // Quantity
            else if (
                normalized.includes('quantity') ||
                normalized.includes('qty') ||
                normalized.includes('shares') ||
                normalized.includes('수량')
            ) {
                map.quantity = index;
            }
            // Price
            else if (
                normalized.includes('price') ||
                normalized.includes('단가') ||
                normalized === 'cost'
            ) {
                map.price = index;
            }
        });

        return map;
    }

    /**
     * Parse transaction from values array using header map
     */
    private static parseTransactionFromValues(
        values: string[],
        headerMap: HeaderMap
    ): ParsedTransactionData | null {
        // 필수 필드 확인
        if (
            headerMap.stockName === -1 ||
            headerMap.type === -1 ||
            headerMap.date === -1 ||
            headerMap.quantity === -1 ||
            headerMap.price === -1
        ) {
            throw new Error('필수 컬럼이 누락되었습니다');
        }

        const stockName = values[headerMap.stockName]?.trim();
        const ticker = headerMap.ticker !== -1 ? values[headerMap.ticker]?.trim() : '';
        const typeStr = values[headerMap.type]?.trim().toLowerCase();
        const dateStr = values[headerMap.date]?.trim();
        const quantityStr = values[headerMap.quantity]?.trim();
        const priceStr = values[headerMap.price]?.trim();

        // 빈 행 건너뛰기
        if (!stockName || !typeStr || !dateStr || !quantityStr || !priceStr) {
            return null;
        }

        // Transaction Type 매핑
        let type: 'buy' | 'sell' | 'dividend';
        if (typeStr === 'buy' || typeStr === 'b' || typeStr === '매수') {
            type = 'buy';
        } else if (typeStr === 'sell' || typeStr === 's' || typeStr === '매도') {
            type = 'sell';
        } else if (typeStr === 'dividend' || typeStr === 'd' || typeStr === '배당') {
            type = 'dividend';
        } else {
            logger.warn(
                `Unknown transaction type: ${typeStr}, defaulting to 'buy'`,
                'ExcelImportService'
            );
            type = 'buy';
        }

        // 날짜 파싱 및 검증
        const date = this.parseDate(dateStr);
        if (!date) {
            throw new Error(`Invalid date format: ${dateStr}`);
        }

        // 숫자 파싱
        const quantity = this.parseNumber(quantityStr);
        const price = this.parseNumber(priceStr);

        if (quantity === null || price === null || quantity <= 0 || price <= 0) {
            throw new Error('Invalid quantity or price');
        }

        return {
            stockName,
            ticker: ticker || stockName, // ticker가 없으면 stockName 사용
            type,
            date,
            quantity,
            price,
        };
    }

    /**
     * Parse date string to YYYY-MM-DD format
     */
    private static parseDate(dateStr: string): string | null {
        try {
            // 여러 날짜 형식 지원
            let date: Date;

            // YYYY-MM-DD
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                date = new Date(dateStr);
            }
            // MM/DD/YYYY or M/D/YYYY
            else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
                const [month, day, year] = dateStr.split('/').map(Number);
                date = new Date(year, month - 1, day);
            }
            // DD/MM/YYYY or D/M/YYYY
            else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(dateStr)) {
                const parts = dateStr.split('/').map(Number);
                if (parts[2] < 100) {
                    parts[2] += 2000; // 2자리 연도를 4자리로 변환
                }
                date = new Date(parts[2], parts[1] - 1, parts[0]);
            }
            // YYYY.MM.DD
            else if (/^\d{4}\.\d{2}\.\d{2}$/.test(dateStr)) {
                date = new Date(dateStr.replace(/\./g, '-'));
            }
            // YYYYMMDD
            else if (/^\d{8}$/.test(dateStr)) {
                const year = parseInt(dateStr.substring(0, 4));
                const month = parseInt(dateStr.substring(4, 6));
                const day = parseInt(dateStr.substring(6, 8));
                date = new Date(year, month - 1, day);
            } else {
                // 기본 Date 파싱 시도
                date = new Date(dateStr);
            }

            if (isNaN(date.getTime())) {
                return null;
            }

            // YYYY-MM-DD 형식으로 변환
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            logger.warn(`Date parsing failed: ${dateStr}`, 'ExcelImportService.parseDate', error);
            return null;
        }
    }

    /**
     * Parse number string (handle various formats)
     */
    private static parseNumber(numStr: string): number | null {
        try {
            // 쉼표 제거
            const cleaned = numStr.replace(/,/g, '').trim();
            const num = parseFloat(cleaned);
            return isNaN(num) ? null : num;
        } catch (error) {
            return null;
        }
    }

    /**
     * Group transactions by stock
     */
    static groupTransactionsByStock(
        transactions: ParsedTransactionData[]
    ): Map<string, ParsedTransactionData[]> {
        const grouped = new Map<string, ParsedTransactionData[]>();

        transactions.forEach((tx) => {
            const key = tx.ticker.toUpperCase();
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key)!.push(tx);
        });

        return grouped;
    }
}

/**
 * Header map for flexible column matching
 */
interface HeaderMap {
    stockName: number;
    ticker: number;
    type: number;
    date: number;
    quantity: number;
    price: number;
}

/**
 * Parsed transaction data (before converting to Transaction type)
 */
export interface ParsedTransactionData {
    stockName: string;
    ticker: string;
    type: 'buy' | 'sell' | 'dividend';
    date: string; // YYYY-MM-DD
    quantity: number;
    price: number;
}
