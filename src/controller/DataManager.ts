// src/controller/DataManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { Calculator } from '../calculator';
import { t } from '../i18n';
import { isInputElement } from '../utils';
import { logger } from '../services/Logger';
import { PortfolioViewModelMapper } from '../viewModels';
import { CacheInvalidationService } from '../cache';
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
}
