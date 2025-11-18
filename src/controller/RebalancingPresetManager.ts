// src/controller/RebalancingPresetManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { RebalancingPresetRepository } from '../state/RebalancingPresetRepository';
import type { RebalancingRules } from '../types';
import { logger } from '../services/Logger';

/**
 * @class RebalancingPresetManager
 * @description 리밸런싱 프리셋 관리
 */
export class RebalancingPresetManager {
    #state: PortfolioState;
    #view: PortfolioView;
    #presetRepo: RebalancingPresetRepository;

    constructor(state: PortfolioState, view: PortfolioView) {
        this.#state = state;
        this.#view = view;
        this.#presetRepo = new RebalancingPresetRepository();
    }

    /**
     * @description Initialize default presets if needed
     */
    initialize(): void {
        this.#presetRepo.createDefaultPresets();
        logger.info('RebalancingPresetManager initialized', 'RebalancingPresetManager');
    }

    /**
     * @description Get current rebalancing rules from active portfolio
     */
    getCurrentRules(): RebalancingRules | undefined {
        const activePortfolio = this.#state.getActivePortfolio();
        return activePortfolio?.settings?.rebalancingRules;
    }

    /**
     * @description Update current rebalancing rules
     */
    updateCurrentRules(rules: RebalancingRules): void {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) return;

        activePortfolio.settings.rebalancingRules = rules;
        this.#state.saveActivePortfolio();
        logger.info('Rebalancing rules updated', 'RebalancingPresetManager');
    }

    /**
     * @description Load preset by ID
     */
    loadPreset(presetId: string): void {
        const preset = this.#presetRepo.getById(presetId);
        if (!preset) {
            this.#view.showToast('프리셋을 찾을 수 없습니다.', 'error');
            return;
        }

        this.updateCurrentRules(preset.rules);
        this.#view.showToast(`프리셋 "${preset.name}"을 불러왔습니다.`, 'success');
        logger.info(`Loaded preset: ${preset.name}`, 'RebalancingPresetManager');
    }

    /**
     * @description Save current rules as new preset
     */
    async saveCurrentAsPreset(): Promise<void> {
        const currentRules = this.getCurrentRules();
        if (!currentRules) {
            this.#view.showToast('저장할 규칙이 없습니다.', 'warning');
            return;
        }

        const name = await this.#view.showPrompt(
            '프리셋 저장',
            '프리셋 이름을 입력하세요:'
        );

        if (!name || name.trim() === '') {
            return;
        }

        const description = await this.#view.showPrompt(
            '프리셋 설명',
            '프리셋 설명을 입력하세요 (선택사항):'
        );

        try {
            this.#presetRepo.create(name.trim(), currentRules, description || undefined);
            this.#view.showToast(`프리셋 "${name}"을 저장했습니다.`, 'success');
            logger.info(`Saved preset: ${name}`, 'RebalancingPresetManager');
        } catch (error) {
            this.#view.showToast('프리셋 저장에 실패했습니다.', 'error');
            logger.error('Failed to save preset', 'RebalancingPresetManager', error);
        }
    }

    /**
     * @description Delete preset by ID
     */
    async deletePreset(presetId: string): Promise<void> {
        const preset = this.#presetRepo.getById(presetId);
        if (!preset) {
            this.#view.showToast('프리셋을 찾을 수 없습니다.', 'error');
            return;
        }

        const confirmed = await this.#view.showConfirm(
            '프리셋 삭제',
            `프리셋 "${preset.name}"을 삭제하시겠습니까?`
        );

        if (!confirmed) return;

        const success = this.#presetRepo.delete(presetId);
        if (success) {
            this.#view.showToast(`프리셋 "${preset.name}"을 삭제했습니다.`, 'success');
            logger.info(`Deleted preset: ${preset.name}`, 'RebalancingPresetManager');
        } else {
            this.#view.showToast('프리셋 삭제에 실패했습니다.', 'error');
        }
    }

    /**
     * @description Get all presets
     */
    getAllPresets() {
        return this.#presetRepo.getAll();
    }
}
