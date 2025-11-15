// src/controller/PortfolioManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { t } from '../i18n';
import DOMPurify from 'dompurify';
import { isInputElement } from '../utils';
import { PortfolioViewModelMapper } from '../viewModels';

/**
 * @class PortfolioManager
 * @description Manages portfolio CRUD operations
 */
export class PortfolioManager {
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
     * @description Create new portfolio
     */
    async handleNewPortfolio(): Promise<void> {
        let name = await this.#view.showPrompt(
            t('modal.promptNewPortfolioNameTitle'),
            t('modal.promptNewPortfolioNameMsg')
        );

        if (name) {
            name = DOMPurify.sanitize(name);
            await this.#state.createNewPortfolio(name);

            // Use ViewModel mapper
            const viewModel = PortfolioViewModelMapper.toListViewModel(
                this.#state.getAllPortfolios(),
                this.#state.getActivePortfolio()?.id || ''
            );
            this.#view.renderPortfolioSelectorViewModel(viewModel);

            this.#view.showToast(t('toast.portfolioCreated', { name }), 'success');
            return; // 신호: fullRender 필요
        }
    }

    /**
     * @description Rename portfolio
     */
    async handleRenamePortfolio(): Promise<void> {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) return;

        let newName = await this.#view.showPrompt(
            t('modal.promptRenamePortfolioTitle'),
            t('modal.promptRenamePortfolioMsg'),
            activePortfolio.name
        );

        if (newName && newName.trim()) {
            newName = DOMPurify.sanitize(newName.trim());
            await this.#state.renamePortfolio(activePortfolio.id, newName);

            // Use ViewModel mapper
            const viewModel = PortfolioViewModelMapper.toListViewModel(
                this.#state.getAllPortfolios(),
                activePortfolio.id
            );
            this.#view.renderPortfolioSelectorViewModel(viewModel);

            this.#view.showToast(t('toast.portfolioRenamed'), 'success');
        }
    }

    /**
     * @description Delete portfolio
     */
    async handleDeletePortfolio(): Promise<void> {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) return;

        if (Object.keys(this.#state.getAllPortfolios()).length <= 1) {
            this.#view.showToast(t('toast.lastPortfolioDeleteError'), 'error');
            return;
        }

        const confirmDelete = await this.#view.showConfirm(
            t('modal.confirmDeletePortfolioTitle'),
            t('modal.confirmDeletePortfolioMsg', { name: activePortfolio.name })
        );

        if (confirmDelete) {
            const deletedId = activePortfolio.id;
            if (await this.#state.deletePortfolio(deletedId)) {
                const newActivePortfolio = this.#state.getActivePortfolio();
                if (newActivePortfolio) {
                    // Use ViewModel mapper
                    const viewModel = PortfolioViewModelMapper.toListViewModel(
                        this.#state.getAllPortfolios(),
                        newActivePortfolio.id
                    );
                    this.#view.renderPortfolioSelectorViewModel(viewModel);

                    this.#view.showToast(t('toast.portfolioDeleted'), 'success');
                    return; // 신호: fullRender 필요
                }
            }
        }
    }

    /**
     * @description Switch portfolio
     * @param newId - New portfolio ID
     */
    async handleSwitchPortfolio(newId: string): Promise<void> {
        let targetId = newId;

        if (!targetId) {
            targetId = this.#view.getPortfolioSelectorValue() || '';
        }

        if (targetId) {
            await this.#state.setActivePortfolioId(targetId);
            const activePortfolio = this.#state.getActivePortfolio();
            if (activePortfolio) {
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
            return; // 신호: fullRender 필요
        }
    }
}
