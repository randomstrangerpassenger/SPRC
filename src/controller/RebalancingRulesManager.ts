// src/controller/RebalancingRulesManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { RebalancingPresetManager } from './RebalancingPresetManager';
import type { RebalancingRules, StockLimitRule, SectorLimitRule, Stock } from '../types';
import { logger } from '../services/Logger';
import { isInputElement } from '../utils';

/**
 * @class RebalancingRulesManager
 * @description 리밸런싱 규칙 UI 관리
 */
export class RebalancingRulesManager {
    #state: PortfolioState;
    #view: PortfolioView;
    #presetManager: RebalancingPresetManager;

    constructor(state: PortfolioState, view: PortfolioView) {
        this.#state = state;
        this.#view = view;
        this.#presetManager = new RebalancingPresetManager(state, view);
        this.#presetManager.initialize();
    }

    /**
     * @description Initialize UI from current portfolio settings
     */
    initializeUI(): void {
        const rules = this.getCurrentRules();
        if (!rules) {
            this.setDefaultRules();
            return;
        }

        this.syncUIFromRules(rules);
        this.updatePresetSelector();
        logger.info('RebalancingRulesManager UI initialized', 'RebalancingRulesManager');
    }

    /**
     * @description Get current rules from active portfolio
     */
    getCurrentRules(): RebalancingRules | undefined {
        return this.#presetManager.getCurrentRules();
    }

    /**
     * @description Set default rules if none exist
     */
    setDefaultRules(): void {
        const defaultRules: RebalancingRules = {
            enabled: false,
            bandPercentage: 5,
            minTradeAmount: 100,
            stockLimits: [],
            sectorLimits: [],
        };

        this.#presetManager.updateCurrentRules(defaultRules);
        this.syncUIFromRules(defaultRules);
    }

    /**
     * @description Sync UI inputs from rules object
     */
    syncUIFromRules(rules: RebalancingRules): void {
        const dom = this.#view.dom;

        // Checkbox
        if (isInputElement(dom.rebalancingRulesEnabled)) {
            dom.rebalancingRulesEnabled.checked = rules.enabled;
        }

        // Toggle content visibility
        if (dom.rebalancingRulesContent) {
            dom.rebalancingRulesContent.classList.toggle('hidden', !rules.enabled);
        }

        // Band percentage
        if (isInputElement(dom.bandPercentage)) {
            dom.bandPercentage.value = String(rules.bandPercentage ?? 5);
        }

        // Min trade amount
        if (isInputElement(dom.minTradeAmount)) {
            dom.minTradeAmount.value = String(rules.minTradeAmount ?? 100);
        }

        // Stock limits
        this.renderStockLimits(rules.stockLimits || []);

        // Sector limits
        this.renderSectorLimits(rules.sectorLimits || []);
    }

    /**
     * @description Render stock limits dynamically
     */
    renderStockLimits(stockLimits: StockLimitRule[]): void {
        const container = this.#view.dom.stockLimitsContainer;
        if (!container) return;

        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) return;

        const stocks = activePortfolio.portfolioData;

        container.innerHTML = '';

        stockLimits.forEach((limit, index) => {
            const stock = stocks.find((s) => s.id === limit.stockId);
            const stockName = stock ? `${stock.name} (${stock.ticker})` : '알 수 없는 종목';

            const div = document.createElement('div');
            div.className = 'stock-limit-item';
            div.innerHTML = `
                <div class="input-group">
                    <label>${stockName}</label>
                    <div class="limit-controls">
                        <input type="number" class="stock-limit-input" data-index="${index}" data-field="maxAllocationPercent" placeholder="최대 비율 (%)" min="0" max="100" step="0.1" value="${limit.maxAllocationPercent ?? ''}">
                        <input type="number" class="stock-limit-input" data-index="${index}" data-field="minTradeAmount" placeholder="최소 거래금액 (USD)" min="0" step="1" value="${limit.minTradeAmount ?? ''}">
                        <button class="btn btn-sm remove-stock-limit-btn" data-index="${index}">삭제</button>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    }

    /**
     * @description Render sector limits dynamically
     */
    renderSectorLimits(sectorLimits: SectorLimitRule[]): void {
        const container = this.#view.dom.sectorLimitsContainer;
        if (!container) return;

        container.innerHTML = '';

        sectorLimits.forEach((limit, index) => {
            const div = document.createElement('div');
            div.className = 'sector-limit-item';
            div.innerHTML = `
                <div class="input-group">
                    <label>${limit.sector}</label>
                    <div class="limit-controls">
                        <input type="number" class="sector-limit-input" data-index="${index}" data-field="maxAllocationPercent" placeholder="최대 비율 (%)" min="0" max="100" step="0.1" value="${limit.maxAllocationPercent}">
                        <button class="btn btn-sm remove-sector-limit-btn" data-index="${index}">삭제</button>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    }

    /**
     * @description Update preset selector dropdown
     */
    updatePresetSelector(): void {
        const selector = this.#view.dom.presetSelector as HTMLSelectElement;
        if (!selector) return;

        const presets = this.#presetManager.getAllPresets();

        // Clear existing options except first
        selector.innerHTML = '<option value="">-- 프리셋 선택 --</option>';

        presets.forEach((preset) => {
            const option = document.createElement('option');
            option.value = preset.id;
            option.textContent = preset.name;
            if (preset.description) {
                option.title = preset.description;
            }
            selector.appendChild(option);
        });
    }

    /**
     * @description Handle enabled checkbox change
     */
    handleEnabledChanged(enabled: boolean): void {
        const rules = this.getCurrentRules();
        if (!rules) return;

        rules.enabled = enabled;
        this.#presetManager.updateCurrentRules(rules);

        // Toggle content visibility
        if (this.#view.dom.rebalancingRulesContent) {
            this.#view.dom.rebalancingRulesContent.classList.toggle('hidden', !enabled);
        }

        logger.info(`Rebalancing rules ${enabled ? 'enabled' : 'disabled'}`, 'RebalancingRulesManager');
    }

    /**
     * @description Handle band percentage change
     */
    handleBandPercentageChanged(value: number): void {
        const rules = this.getCurrentRules();
        if (!rules) return;

        rules.bandPercentage = value;
        this.#presetManager.updateCurrentRules(rules);
    }

    /**
     * @description Handle min trade amount change
     */
    handleMinTradeAmountChanged(value: number): void {
        const rules = this.getCurrentRules();
        if (!rules) return;

        rules.minTradeAmount = value;
        this.#presetManager.updateCurrentRules(rules);
    }

    /**
     * @description Handle add stock limit
     */
    async handleAddStockLimit(): Promise<void> {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) return;

        const stocks = activePortfolio.portfolioData;
        if (stocks.length === 0) {
            this.#view.showToast('종목이 없습니다.', 'warning');
            return;
        }

        const rules = this.getCurrentRules();
        if (!rules) return;

        // 이미 제한이 설정된 종목 ID 목록
        const existingStockIds = new Set((rules.stockLimits || []).map((l) => l.stockId));

        // 제한이 없는 종목만 필터링
        const availableStocks = stocks.filter((s) => !existingStockIds.has(s.id));

        if (availableStocks.length === 0) {
            this.#view.showToast('모든 종목에 이미 제한이 설정되어 있습니다.', 'info');
            return;
        }

        // 간단한 프롬프트로 종목 선택 (실제 구현에서는 더 나은 UI를 사용할 수 있음)
        const stockList = availableStocks.map((s, i) => `${i + 1}. ${s.name} (${s.ticker})`).join('\n');
        const input = await this.#view.showPrompt(
            '종목 선택',
            `추가할 종목 번호를 입력하세요:\n\n${stockList}`
        );

        if (!input) return;

        const index = parseInt(input, 10) - 1;
        if (isNaN(index) || index < 0 || index >= availableStocks.length) {
            this.#view.showToast('잘못된 번호입니다.', 'error');
            return;
        }

        const selectedStock = availableStocks[index];

        // 새 제한 추가
        if (!rules.stockLimits) {
            rules.stockLimits = [];
        }

        rules.stockLimits.push({
            stockId: selectedStock.id,
            maxAllocationPercent: undefined,
            minTradeAmount: undefined,
        });

        this.#presetManager.updateCurrentRules(rules);
        this.renderStockLimits(rules.stockLimits);

        this.#view.showToast(`${selectedStock.name} 종목 제한이 추가되었습니다.`, 'success');
    }

    /**
     * @description Handle remove stock limit
     */
    handleRemoveStockLimit(index: number): void {
        const rules = this.getCurrentRules();
        if (!rules || !rules.stockLimits) return;

        rules.stockLimits.splice(index, 1);
        this.#presetManager.updateCurrentRules(rules);
        this.renderStockLimits(rules.stockLimits);

        this.#view.showToast('종목 제한이 삭제되었습니다.', 'success');
    }

    /**
     * @description Handle add sector limit
     */
    async handleAddSectorLimit(): Promise<void> {
        const activePortfolio = this.#state.getActivePortfolio();
        if (!activePortfolio) return;

        const stocks = activePortfolio.portfolioData;
        if (stocks.length === 0) {
            this.#view.showToast('종목이 없습니다.', 'warning');
            return;
        }

        const rules = this.getCurrentRules();
        if (!rules) return;

        // 포트폴리오의 모든 섹터 추출
        const sectors = Array.from(new Set(stocks.map((s) => s.sector).filter((s) => s)));
        const existingSectors = new Set((rules.sectorLimits || []).map((l) => l.sector));
        const availableSectors = sectors.filter((s) => !existingSectors.has(s));

        if (availableSectors.length === 0) {
            this.#view.showToast('모든 섹터에 이미 제한이 설정되어 있습니다.', 'info');
            return;
        }

        const sectorList = availableSectors.map((s, i) => `${i + 1}. ${s}`).join('\n');
        const input = await this.#view.showPrompt(
            '섹터 선택',
            `추가할 섹터 번호를 입력하세요:\n\n${sectorList}`
        );

        if (!input) return;

        const index = parseInt(input, 10) - 1;
        if (isNaN(index) || index < 0 || index >= availableSectors.length) {
            this.#view.showToast('잘못된 번호입니다.', 'error');
            return;
        }

        const selectedSector = availableSectors[index];

        // 새 제한 추가
        if (!rules.sectorLimits) {
            rules.sectorLimits = [];
        }

        rules.sectorLimits.push({
            sector: selectedSector,
            maxAllocationPercent: 0,
        });

        this.#presetManager.updateCurrentRules(rules);
        this.renderSectorLimits(rules.sectorLimits);

        this.#view.showToast(`${selectedSector} 섹터 제한이 추가되었습니다.`, 'success');
    }

    /**
     * @description Handle remove sector limit
     */
    handleRemoveSectorLimit(index: number): void {
        const rules = this.getCurrentRules();
        if (!rules || !rules.sectorLimits) return;

        rules.sectorLimits.splice(index, 1);
        this.#presetManager.updateCurrentRules(rules);
        this.renderSectorLimits(rules.sectorLimits);

        this.#view.showToast('섹터 제한이 삭제되었습니다.', 'success');
    }

    /**
     * @description Handle stock limits changed (from input)
     */
    handleStockLimitsChanged(): void {
        const container = this.#view.dom.stockLimitsContainer;
        if (!container) return;

        const rules = this.getCurrentRules();
        if (!rules || !rules.stockLimits) return;

        const inputs = container.querySelectorAll('.stock-limit-input') as NodeListOf<HTMLInputElement>;
        inputs.forEach((input) => {
            const index = parseInt(input.dataset.index || '-1', 10);
            const field = input.dataset.field as 'maxAllocationPercent' | 'minTradeAmount';
            if (index >= 0 && index < rules.stockLimits!.length) {
                const value = parseFloat(input.value);
                if (!isNaN(value) && value >= 0) {
                    rules.stockLimits![index][field] = value;
                } else {
                    rules.stockLimits![index][field] = undefined;
                }
            }
        });

        this.#presetManager.updateCurrentRules(rules);
    }

    /**
     * @description Handle sector limits changed (from input)
     */
    handleSectorLimitsChanged(): void {
        const container = this.#view.dom.sectorLimitsContainer;
        if (!container) return;

        const rules = this.getCurrentRules();
        if (!rules || !rules.sectorLimits) return;

        const inputs = container.querySelectorAll('.sector-limit-input') as NodeListOf<HTMLInputElement>;
        inputs.forEach((input) => {
            const index = parseInt(input.dataset.index || '-1', 10);
            if (index >= 0 && index < rules.sectorLimits!.length) {
                const value = parseFloat(input.value);
                if (!isNaN(value) && value >= 0) {
                    rules.sectorLimits![index].maxAllocationPercent = value;
                }
            }
        });

        this.#presetManager.updateCurrentRules(rules);
    }

    /**
     * @description Handle load preset
     */
    handleLoadPreset(presetId: string): void {
        this.#presetManager.loadPreset(presetId);
        const rules = this.getCurrentRules();
        if (rules) {
            this.syncUIFromRules(rules);
        }
    }

    /**
     * @description Handle save preset
     */
    async handleSavePreset(): Promise<void> {
        await this.#presetManager.saveCurrentAsPreset();
        this.updatePresetSelector();
    }

    /**
     * @description Handle delete preset
     */
    async handleDeletePreset(presetId: string): Promise<void> {
        await this.#presetManager.deletePreset(presetId);
        this.updatePresetSelector();
    }
}
