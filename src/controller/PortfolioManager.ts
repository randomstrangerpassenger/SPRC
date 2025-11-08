// src/controller/PortfolioManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { t } from '../i18n';
import DOMPurify from 'dompurify';

/**
 * @class PortfolioManager
 * @description 포트폴리오 CRUD 작업 관리
 */
export class PortfolioManager {
    constructor(
        private state: PortfolioState,
        private view: PortfolioView
    ) {}

    /**
     * @description 새 포트폴리오 생성
     */
    async handleNewPortfolio(): Promise<void> {
        let name = await this.view.showPrompt(
            t('modal.promptNewPortfolioNameTitle'),
            t('modal.promptNewPortfolioNameMsg')
        );

        if (name) {
            name = DOMPurify.sanitize(name);
            await this.state.createNewPortfolio(name);
            this.view.renderPortfolioSelector(
                this.state.getAllPortfolios(),
                this.state.getActivePortfolio()?.id || ''
            );
            this.view.showToast(t('toast.portfolioCreated', { name }), 'success');
            return; // 신호: fullRender 필요
        }
    }

    /**
     * @description 포트폴리오 이름 변경
     */
    async handleRenamePortfolio(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        let newName = await this.view.showPrompt(
            t('modal.promptRenamePortfolioTitle'),
            t('modal.promptRenamePortfolioMsg'),
            activePortfolio.name
        );

        if (newName && newName.trim()) {
            newName = DOMPurify.sanitize(newName.trim());
            await this.state.renamePortfolio(activePortfolio.id, newName);
            this.view.renderPortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id);
            this.view.showToast(t('toast.portfolioRenamed'), 'success');
        }
    }

    /**
     * @description 포트폴리오 삭제
     */
    async handleDeletePortfolio(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        if (Object.keys(this.state.getAllPortfolios()).length <= 1) {
            this.view.showToast(t('toast.lastPortfolioDeleteError'), 'error');
            return;
        }

        const confirmDelete = await this.view.showConfirm(
            t('modal.confirmDeletePortfolioTitle'),
            t('modal.confirmDeletePortfolioMsg', { name: activePortfolio.name })
        );

        if (confirmDelete) {
            const deletedId = activePortfolio.id;
            if (await this.state.deletePortfolio(deletedId)) {
                const newActivePortfolio = this.state.getActivePortfolio();
                if (newActivePortfolio) {
                    this.view.renderPortfolioSelector(
                        this.state.getAllPortfolios(),
                        newActivePortfolio.id
                    );
                    this.view.showToast(t('toast.portfolioDeleted'), 'success');
                    return; // 신호: fullRender 필요
                }
            }
        }
    }

    /**
     * @description 포트폴리오 전환
     * @param newId - 새 포트폴리오 ID
     */
    async handleSwitchPortfolio(newId: string): Promise<void> {
        const selector = this.view.dom.portfolioSelector;
        let targetId = newId;

        if (!targetId && selector instanceof HTMLSelectElement) {
            targetId = selector.value;
        }

        if (targetId) {
            await this.state.setActivePortfolioId(targetId);
            const activePortfolio = this.state.getActivePortfolio();
            if (activePortfolio) {
                this.view.updateCurrencyModeUI(activePortfolio.settings.currentCurrency);
                this.view.updateMainModeUI(activePortfolio.settings.mainMode);

                const { exchangeRateInput, portfolioExchangeRateInput } = this.view.dom;
                if (exchangeRateInput instanceof HTMLInputElement) {
                    exchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
                }
                if (portfolioExchangeRateInput instanceof HTMLInputElement) {
                    portfolioExchangeRateInput.value =
                        activePortfolio.settings.exchangeRate.toString();
                }
            }
            return; // 신호: fullRender 필요
        }
    }
}
