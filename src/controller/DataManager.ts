// src/controller/DataManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { Calculator } from '../calculator';
import { t } from '../i18n';
import { isInputElement } from '../utils';
import { logger } from '../services/Logger';
import { PortfolioViewModelMapper } from '../viewModels';
import { CacheInvalidationService } from '../cache';
import { generateId } from '../utils';
import Decimal from 'decimal.js';
import type { Stock, Transaction } from '../types';
// 대형 서비스를 동적 임포트로 변경
import type { EmailConfig } from '../services';
// ExcelExportService, PDFReportService, EmailService는 동적 임포트 사용

/**
 * @class DataManager
 * @description Manages data import/export and initialization
 */
export class DataManager {
    #state: PortfolioState;
    #view: PortfolioView;

    constructor(
        state: PortfolioState,
        view: PortfolioView
    ) {
        this.#state = state;
        this.#view = view;
    }

    /**
     * @description Reset data
     */
    async handleResetData(): Promise<{ needsFullRender: boolean; needsUISetup: boolean }> {
        const confirmReset = await this.#view.showConfirm(
            t('modal.confirmResetTitle'),
            t('modal.confirmResetMsg')
        );
        if (confirmReset) {
            await this.#state.resetData();
            CacheInvalidationService.onPortfolioReset();

            const activePortfolio = this.#state.getActivePortfolio();
            if (activePortfolio) {
                // Use ViewModel mapper
                const viewModel = PortfolioViewModelMapper.toListViewModel(
                    this.#state.getAllPortfolios(),
                    activePortfolio.id
                );
                this.#view.renderPortfolioSelectorViewModel(viewModel);

                this.#view.updateCurrencyModeUI(activePortfolio.settings.currentCurrency);
                this.#view.updateMainModeUI(activePortfolio.settings.mainMode);

                const { exchangeRateInput, portfolioExchangeRateInput } = this.#view.dom;
                if (isInputElement(exchangeRateInput)) {
                    exchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
                }
                if (isInputElement(portfolioExchangeRateInput)) {
                    portfolioExchangeRateInput.value =
                        activePortfolio.settings.exchangeRate.toString();
                }
            }

            this.#view.showToast(t('toast.dataReset'), 'success');
            return { needsFullRender: true, needsUISetup: true };
        }
        return { needsFullRender: false, needsUISetup: false };
    }

    /**
     * @description Export data
     */
    handleExportData(): void {
        try {
            const dataToExport = this.#state.exportData();
            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const activePortfolio = this.#state.getActivePortfolio();
            const filename = `portfolio_data_${activePortfolio?.name || 'export'}_${Date.now()}.json`;

            const a = document.createElement('a');
            a.href = url;
            a.download = filename.replace(/\s+/g, '_');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.#view.showToast(t('toast.exportSuccess'), 'success');
        } catch (error) {
            logger.error('Failed to export portfolio data', 'DataManager.handleExportData', error);
            this.#view.showToast(t('toast.exportError'), 'error');
        }
    }

    /**
     * @description Export transaction history to CSV
     */
    handleExportTransactionsCSV(): void {
        try {
            const activePortfolio = this.#state.getActivePortfolio();
            if (!activePortfolio || activePortfolio.portfolioData.length === 0) {
                this.#view.showToast('내보낼 거래 내역이 없습니다.', 'info');
                return;
            }

            // CSV 헤더
            let csvContent =
                'Stock Name,Ticker,Transaction Type,Date,Quantity,Price (USD),Total Amount (USD)\n';

            // 모든 종목의 거래 내역 수집
            for (const stock of activePortfolio.portfolioData) {
                for (const tx of stock.transactions) {
                    const totalAmount = (
                        parseFloat(tx.quantity.toString()) * parseFloat(tx.price.toString())
                    ).toFixed(2);
                    csvContent += `"${stock.name}","${stock.ticker}","${tx.type}","${tx.date}",${tx.quantity},${tx.price},${totalAmount}\n`;
                }
            }

            // CSV 파일 다운로드
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const filename = `transactions_${activePortfolio.name}_${Date.now()}.csv`;

            const a = document.createElement('a');
            a.href = url;
            a.download = filename.replace(/\s+/g, '_');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.#view.showToast('거래 내역 CSV 내보내기 완료', 'success');
        } catch (error) {
            logger.error('Failed to export transactions CSV', 'DataManager.handleExportTransactionsCSV', error);
            this.#view.showToast('CSV 내보내기 실패', 'error');
        }
    }

    /**
     * @description Export Excel file (using exceljs)
     * Changed to dynamic import
     */
    async handleExportExcel(): Promise<void> {
        try {
            const activePortfolio = this.#state.getActivePortfolio();
            if (!activePortfolio || activePortfolio.portfolioData.length === 0) {
                this.#view.showToast('내보낼 포트폴리오 데이터가 없습니다.', 'info');
                return;
            }

            // 동적 임포트: exceljs는 사용자가 Export 버튼을 클릭할 때만 로드됨
            const { ExcelExportService } = await import('../services/ExcelExportService');
            await ExcelExportService.exportPortfolioToExcel(activePortfolio);
            this.#view.showToast('Excel 파일 내보내기 완료', 'success');
        } catch (error) {
            logger.error('Failed to export Excel file', 'DataManager.handleExportExcel', error);
            this.#view.showToast('Excel 내보내기 실패', 'error');
        }
    }

    /**
     * @description Generate PDF report (using jspdf, html2canvas)
     * Changed to dynamic import
     */
    async handleGeneratePDFReport(): Promise<void> {
        try {
            const activePortfolio = this.#state.getActivePortfolio();
            if (!activePortfolio || activePortfolio.portfolioData.length === 0) {
                this.#view.showToast('생성할 포트폴리오 데이터가 없습니다.', 'info');
                return;
            }

            // 동적 임포트: jspdf, html2canvas는 사용자가 PDF 생성을 요청할 때만 로드됨
            const { PDFReportService } = await import('../services/PDFReportService');
            await PDFReportService.generatePortfolioReport(activePortfolio);
            this.#view.showToast('PDF 리포트 생성 완료', 'success');
        } catch (error) {
            logger.error('Failed to generate PDF report', 'DataManager.handleGeneratePDFReport', error);
            this.#view.showToast('PDF 생성 실패', 'error');
        }
    }

    /**
     * @description Send report via email (using nodemailer)
     * Changed to dynamic import
     */
    async handleSendEmailReport(
        toEmail: string,
        emailConfig?: EmailConfig,
        options?: { includeExcel?: boolean; includePDF?: boolean }
    ): Promise<void> {
        try {
            const activePortfolio = this.#state.getActivePortfolio();
            if (!activePortfolio || activePortfolio.portfolioData.length === 0) {
                this.#view.showToast('전송할 포트폴리오 데이터가 없습니다.', 'info');
                return;
            }

            // 동적 임포트: EmailService는 사용자가 이메일 전송을 요청할 때만 로드됨
            const { EmailService } = await import('../services/EmailService');

            // 병렬 처리: 서버 상태 확인 + 이메일 설정 검증
            const [serverResult, configResult] = await Promise.allSettled([
                EmailService.checkServerHealth(),
                emailConfig ? EmailService.testEmailConfig(emailConfig) : Promise.resolve(true),
            ]);

            const isServerRunning = serverResult.status === 'fulfilled' ? serverResult.value : false;
            const isConfigValid = configResult.status === 'fulfilled' ? configResult.value : true;

            if (!isServerRunning) {
                this.#view.showToast(
                    '이메일 서버가 실행 중이지 않습니다. 서버를 시작해주세요. (npm run server)',
                    'error'
                );
                return;
            }

            if (emailConfig && !isConfigValid) {
                this.#view.showToast('이메일 설정이 올바르지 않습니다.', 'error');
                return;
            }

            // 이메일 전송
            await EmailService.sendPortfolioReport(activePortfolio, toEmail, emailConfig, options);
            this.#view.showToast('이메일 전송 완료', 'success');
        } catch (error) {
            logger.error('Failed to send email report', 'DataManager.handleSendEmailReport', error);
            this.#view.showToast(
                '이메일 전송 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류'),
                'error'
            );
        }
    }

    /**
     * @description Trigger data import
     */
    handleImportData(): void {
        this.#view.triggerFileImport();
    }

    /**
     * @description File selection handler
     * @param e - File input event
     */
    handleFileSelected(e: Event): Promise<{ needsUISetup: boolean }> {
        return new Promise((resolve) => {
            const fileInput = e.target as HTMLInputElement;
            const file = fileInput.files?.[0];

            if (file) {
                if (file.type !== 'application/json') {
                    this.#view.showToast(t('toast.invalidFileType'), 'error');
                    fileInput.value = '';
                    resolve({ needsUISetup: false });
                    return;
                }

                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        const jsonString = event.target?.result;
                        if (typeof jsonString === 'string') {
                            const loadedData = JSON.parse(jsonString);
                            await this.#state.importData(loadedData);
                            CacheInvalidationService.onPortfolioLoaded();
                            this.#view.showToast(t('toast.importSuccess'), 'success');
                            resolve({ needsUISetup: true });
                        } else {
                            throw new Error('Failed to read file content.');
                        }
                    } catch (error) {
                        logger.error('Failed to handle selected file', 'DataManager.handleFileSelected', error);
                        this.#view.showToast(t('toast.importError'), 'error');
                        resolve({ needsUISetup: false });
                    } finally {
                        fileInput.value = '';
                    }
                };

                reader.onerror = () => {
                    logger.error(
                        'File reading error',
                        'DataManager.handleFileSelected',
                        new Error('FileReader error')
                    );
                    this.#view.showToast(t('toast.importError'), 'error');
                    fileInput.value = '';
                    resolve({ needsUISetup: false });
                };

                reader.readAsText(file);
            } else {
                resolve({ needsUISetup: false });
            }
        });
    }

    /**
     * @description Trigger transaction import from CSV/Excel
     */
    handleImportTransactions(): void {
        this.#view.triggerTransactionFileImport();
    }

    /**
     * @description Handle transaction file selection (CSV or Excel)
     */
    async handleTransactionFileSelected(e: Event): Promise<{ needsFullRender: boolean }> {
        const fileInput = e.target as HTMLInputElement;
        const file = fileInput.files?.[0];

        if (!file) {
            return { needsFullRender: false };
        }

        try {
            const activePortfolio = this.#state.getActivePortfolio();
            if (!activePortfolio) {
                this.#view.showToast('활성 포트폴리오가 없습니다.', 'error');
                fileInput.value = '';
                return { needsFullRender: false };
            }

            // 동적 임포트: ExcelImportService는 사용 시점에만 로드
            const { ExcelImportService } = await import('../services/ExcelImportService');

            let parsedData;

            // 파일 타입에 따라 다른 파서 사용
            if (file.name.endsWith('.csv') || file.type === 'text/csv') {
                parsedData = await ExcelImportService.importTransactionsFromCSV(file);
            } else if (
                file.name.endsWith('.xlsx') ||
                file.name.endsWith('.xls') ||
                file.type ===
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.type === 'application/vnd.ms-excel'
            ) {
                parsedData = await ExcelImportService.importTransactionsFromExcel(file);
            } else {
                this.#view.showToast('지원하지 않는 파일 형식입니다. CSV 또는 Excel 파일을 선택하세요.', 'error');
                fileInput.value = '';
                return { needsFullRender: false };
            }

            if (!parsedData || parsedData.length === 0) {
                this.#view.showToast('가져올 거래 내역이 없습니다.', 'info');
                fileInput.value = '';
                return { needsFullRender: false };
            }

            // 사용자에게 가져오기 옵션 확인
            const importResult = await this.#showTransactionImportDialog(parsedData);
            if (!importResult.confirmed) {
                fileInput.value = '';
                return { needsFullRender: false };
            }

            // 거래 내역 추가
            const result = this.#importTransactionsToPortfolio(
                activePortfolio,
                parsedData,
                importResult.createMissingStocks
            );

            this.#state.saveActivePortfolio();
            CacheInvalidationService.onPortfolioUpdated();

            this.#view.showToast(
                `${result.addedCount}개의 거래 내역이 추가되었습니다. (${result.newStocksCount}개의 새 종목 생성)`,
                'success'
            );

            fileInput.value = '';
            return { needsFullRender: true };
        } catch (error) {
            logger.error(
                'Failed to import transactions',
                'DataManager.handleTransactionFileSelected',
                error
            );
            this.#view.showToast(
                '거래 내역 가져오기 실패: ' +
                    (error instanceof Error ? error.message : '알 수 없는 오류'),
                'error'
            );
            fileInput.value = '';
            return { needsFullRender: false };
        }
    }

    /**
     * @description Show transaction import dialog
     */
    async #showTransactionImportDialog(
        parsedData: any[]
    ): Promise<{ confirmed: boolean; createMissingStocks: boolean }> {
        const uniqueStocks = new Set(parsedData.map((tx) => tx.ticker.toUpperCase()));
        const activePortfolio = this.#state.getActivePortfolio();
        const existingTickers = new Set(
            activePortfolio?.portfolioData.map((s) => s.ticker.toUpperCase()) || []
        );

        const missingStocks = Array.from(uniqueStocks).filter((t) => !existingTickers.has(t));

        let message = `${parsedData.length}개의 거래 내역을 가져옵니다.\n`;
        message += `총 ${uniqueStocks.size}개의 종목이 포함되어 있습니다.\n\n`;

        if (missingStocks.length > 0) {
            message += `⚠️ 다음 ${missingStocks.length}개의 종목이 포트폴리오에 없습니다:\n`;
            message += missingStocks.slice(0, 10).join(', ');
            if (missingStocks.length > 10) {
                message += ` 외 ${missingStocks.length - 10}개`;
            }
            message += `\n\n새 종목을 자동으로 생성하시겠습니까?`;

            const createNew = await this.#view.showConfirm('거래 내역 가져오기', message);
            if (!createNew) {
                const skipMissing = await this.#view.showConfirm(
                    '거래 내역 가져오기',
                    '기존 종목의 거래 내역만 가져오시겠습니까?'
                );
                return { confirmed: skipMissing, createMissingStocks: false };
            }
            return { confirmed: true, createMissingStocks: true };
        } else {
            const confirmed = await this.#view.showConfirm('거래 내역 가져오기', message);
            return { confirmed, createMissingStocks: false };
        }
    }

    /**
     * @description Import transactions to portfolio
     */
    #importTransactionsToPortfolio(
        portfolio: any,
        parsedData: any[],
        createMissingStocks: boolean
    ): { addedCount: number; newStocksCount: number } {
        const existingStocksMap = new Map<string, Stock>();
        portfolio.portfolioData.forEach((stock: Stock) => {
            existingStocksMap.set(stock.ticker.toUpperCase(), stock);
        });

        let addedCount = 0;
        let newStocksCount = 0;

        parsedData.forEach((txData) => {
            const tickerUpper = txData.ticker.toUpperCase();
            let stock = existingStocksMap.get(tickerUpper);

            // 종목이 없으면 생성
            if (!stock) {
                if (!createMissingStocks) {
                    return; // 건너뛰기
                }

                stock = {
                    id: `s-${generateId()}`,
                    name: txData.stockName,
                    ticker: txData.ticker,
                    sector: 'Unknown',
                    targetRatio: new Decimal(0),
                    currentPrice: new Decimal(txData.price),
                    transactions: [],
                    isFixedBuyEnabled: false,
                    fixedBuyAmount: new Decimal(0),
                };

                portfolio.portfolioData.push(stock);
                existingStocksMap.set(tickerUpper, stock);
                newStocksCount++;
            }

            // 거래 내역 추가
            const transaction: Transaction = {
                id: `tx-${generateId()}`,
                type: txData.type,
                date: txData.date,
                quantity: new Decimal(txData.quantity),
                price: new Decimal(txData.price),
            };

            stock.transactions.push(transaction);
            addedCount++;
        });

        return { addedCount, newStocksCount };
    }
}
