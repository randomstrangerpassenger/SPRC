// src/controller/DataManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { Calculator } from '../calculator';
import { ErrorService } from '../errorService';
import { t } from '../i18n';

/**
 * @class DataManager
 * @description 데이터 가져오기/내보내기, 초기화 관리
 */
export class DataManager {
    constructor(
        private state: PortfolioState,
        private view: PortfolioView
    ) {}

    /**
     * @description 데이터 초기화
     */
    async handleResetData(): Promise<{ needsFullRender: boolean; needsUISetup: boolean }> {
        const confirmReset = await this.view.showConfirm(t('modal.confirmResetTitle'), t('modal.confirmResetMsg'));
        if (confirmReset) {
            await this.state.resetData();
            Calculator.clearPortfolioStateCache();

            const activePortfolio = this.state.getActivePortfolio();
            if (activePortfolio) {
                this.view.renderPortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id);
                this.view.updateCurrencyModeUI(activePortfolio.settings.currentCurrency);
                this.view.updateMainModeUI(activePortfolio.settings.mainMode);

                const { exchangeRateInput, portfolioExchangeRateInput } = this.view.dom;
                if (exchangeRateInput instanceof HTMLInputElement) {
                    exchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
                }
                if (portfolioExchangeRateInput instanceof HTMLInputElement) {
                    portfolioExchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
                }
            }

            this.view.showToast(t('toast.dataReset'), 'success');
            return { needsFullRender: true, needsUISetup: true };
        }
        return { needsFullRender: false, needsUISetup: false };
    }

    /**
     * @description 데이터 내보내기
     */
    handleExportData(): void {
        try {
            const dataToExport = this.state.exportData();
            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const activePortfolio = this.state.getActivePortfolio();
            const filename = `portfolio_data_${activePortfolio?.name || 'export'}_${Date.now()}.json`;

            const a = document.createElement('a');
            a.href = url;
            a.download = filename.replace(/\s+/g, '_');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.view.showToast(t('toast.exportSuccess'), 'success');
        } catch (error) {
            ErrorService.handle(error as Error, 'handleExportData');
            this.view.showToast(t('toast.exportError'), 'error');
        }
    }

    /**
     * @description 데이터 가져오기 트리거
     */
    handleImportData(): void {
        const fileInput = this.view.dom.importFileInput;
        if (fileInput instanceof HTMLInputElement) fileInput.click();
    }

    /**
     * @description 파일 선택 핸들러
     * @param e - 파일 입력 이벤트
     */
    handleFileSelected(e: Event): Promise<{ needsUISetup: boolean }> {
        return new Promise((resolve) => {
            const fileInput = e.target as HTMLInputElement;
            const file = fileInput.files?.[0];

            if (file) {
                if (file.type !== 'application/json') {
                    this.view.showToast(t('toast.invalidFileType'), 'error');
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
                            await this.state.importData(loadedData);
                            Calculator.clearPortfolioStateCache();
                            this.view.showToast(t('toast.importSuccess'), 'success');
                            resolve({ needsUISetup: true });
                        } else {
                            throw new Error('Failed to read file content.');
                        }
                    } catch (error) {
                        ErrorService.handle(error as Error, 'handleFileSelected');
                        this.view.showToast(t('toast.importError'), 'error');
                        resolve({ needsUISetup: false });
                    } finally {
                        fileInput.value = '';
                    }
                };

                reader.onerror = () => {
                    ErrorService.handle(new Error('File reading error'), 'handleFileSelected - Reader Error');
                    this.view.showToast(t('toast.importError'), 'error');
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