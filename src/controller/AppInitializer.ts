// src/controller/AppInitializer.ts
import type { PortfolioState } from '../state';
import type { PortfolioView } from '../view';
import { ErrorService } from '../errorService';
import { DarkModeManager } from '../DarkModeManager';
import { logger } from '../services/Logger';

/**
 * @class AppInitializer
 * @description 앱 초기화를 담당하는 클래스
 * initialize, setupInitialUI, loadExchangeRate 등 앱 시작 시 필요한 로직 처리
 */
export class AppInitializer {
    #state: PortfolioState;
    #view: PortfolioView;
    #darkModeManager: DarkModeManager;

    constructor(state: PortfolioState, view: PortfolioView) {
        this.#state = state;
        this.#view = view;
        this.#darkModeManager = new DarkModeManager();
    }

    /**
     * @description 앱 초기화 실행
     * @param bindControllerEvents - Controller의 이벤트 바인딩 함수
     * @param bindEventListeners - 전역 이벤트 리스너 바인딩 함수
     * @returns 이벤트 AbortController
     */
    async initialize(
        bindControllerEvents: () => void,
        bindEventListeners: (view: PortfolioView) => AbortController
    ): Promise<AbortController> {
        await this.#state.ensureInitialized();
        this.#view.cacheDomElements();
        ErrorService.setViewInstance(this.#view);
        this.setupInitialUI();
        bindControllerEvents();
        return bindEventListeners(this.#view);
    }

    /**
     * @description 초기 UI 설정
     */
    setupInitialUI(): void {
        this.#darkModeManager.initialize();

        const activePortfolio = this.#state.getActivePortfolio();
        if (activePortfolio) {
            this.#view.renderPortfolioSelector(this.#state.getAllPortfolios(), activePortfolio.id);
            this.#view.updateCurrencyModeUI(activePortfolio.settings.currentCurrency);
            this.#view.updateMainModeUI(activePortfolio.settings.mainMode);

            this.#view.updatePortfolioSettingsInputs({
                exchangeRate: activePortfolio.settings.exchangeRate,
                rebalancingTolerance: activePortfolio.settings.rebalancingTolerance ?? 5,
                tradingFeeRate: activePortfolio.settings.tradingFeeRate ?? 0.3,
                taxRate: activePortfolio.settings.taxRate ?? 15,
            });

            // 환율 자동 로드
            this.loadExchangeRate();
        }
    }

    /**
     * @description 환율 자동 로드
     */
    async loadExchangeRate(): Promise<void> {
        try {
            const { apiService } = await import('../apiService');
            const rate = await apiService.fetchExchangeRate();
            if (rate) {
                const activePortfolio = this.#state.getActivePortfolio();
                if (activePortfolio) {
                    activePortfolio.settings.exchangeRate = rate;
                    await this.#state.saveActivePortfolio();

                    this.#view.updateExchangeRateInputs(rate);

                    logger.info(`Exchange rate auto-loaded: ${rate}`, 'AppInitializer');
                }
            }
        } catch (error) {
            logger.warn('Failed to auto-load exchange rate', 'AppInitializer', error);
        }
    }

    /**
     * @description 다크 모드 매니저 정리
     */
    cleanup(): void {
        this.#darkModeManager.cleanup();
    }

    /**
     * @description 다크 모드 매니저 접근자
     */
    getDarkModeManager(): DarkModeManager {
        return this.#darkModeManager;
    }
}
