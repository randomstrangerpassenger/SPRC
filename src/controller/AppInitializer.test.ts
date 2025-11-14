// src/controller/AppInitializer.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AppInitializer } from './AppInitializer';
import type { PortfolioState } from '../state';
import type { PortfolioView } from '../view';
import { ErrorService } from '../errorService';
import { DarkModeManager } from '../DarkModeManager';

// DarkModeManager 모킹
const mockDarkModeManager = {
    initialize: vi.fn(),
    cleanup: vi.fn(),
};

vi.mock('../DarkModeManager', () => ({
    DarkModeManager: vi.fn(function (this: any) {
        return mockDarkModeManager;
    }),
}));

// ErrorService 모킹
vi.mock('../errorService', () => ({
    ErrorService: {
        setViewInstance: vi.fn(),
        handle: vi.fn(),
    },
}));

describe('AppInitializer', () => {
    let appInitializer: AppInitializer;
    let mockState: PortfolioState;
    let mockView: PortfolioView;

    beforeEach(() => {
        // Reset mock functions
        mockDarkModeManager.initialize.mockClear();
        mockDarkModeManager.cleanup.mockClear();

        // Mock PortfolioState
        mockState = {
            ensureInitialized: vi.fn().mockResolvedValue(undefined),
            getActivePortfolio: vi.fn().mockReturnValue({
                id: 'portfolio-1',
                name: 'Test Portfolio',
                settings: {
                    mainMode: 'simple',
                    currentCurrency: 'krw',
                    exchangeRate: 1300,
                    rebalancingTolerance: 5,
                    tradingFeeRate: 0.3,
                    taxRate: 15,
                },
            }),
            getAllPortfolios: vi.fn().mockReturnValue({
                'portfolio-1': {
                    id: 'portfolio-1',
                    name: 'Test Portfolio',
                },
            }),
            saveActivePortfolio: vi.fn().mockResolvedValue(undefined),
        } as any;

        // Mock PortfolioView
        mockView = {
            cacheDomElements: vi.fn(),
            renderPortfolioSelector: vi.fn(),
            updateCurrencyModeUI: vi.fn(),
            updateMainModeUI: vi.fn(),
            updatePortfolioSettingsInputs: vi.fn(),
            updateExchangeRateInputs: vi.fn(),
        } as any;

        appInitializer = new AppInitializer(mockState, mockView);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('initialize', () => {
        it('should initialize app with all setup steps', async () => {
            const mockBindControllerEvents = vi.fn();
            const mockBindEventListeners = vi.fn().mockReturnValue(new AbortController());

            const abortController = await appInitializer.initialize(
                mockBindControllerEvents,
                mockBindEventListeners
            );

            expect(mockState.ensureInitialized).toHaveBeenCalledOnce();
            expect(mockView.cacheDomElements).toHaveBeenCalledOnce();
            expect(ErrorService.setViewInstance).toHaveBeenCalledWith(mockView);
            expect(mockBindControllerEvents).toHaveBeenCalledOnce();
            expect(mockBindEventListeners).toHaveBeenCalledWith(mockView);
            expect(abortController).toBeInstanceOf(AbortController);
        });

        it('should call setupInitialUI during initialization', async () => {
            const mockBindControllerEvents = vi.fn();
            const mockBindEventListeners = vi.fn().mockReturnValue(new AbortController());

            await appInitializer.initialize(mockBindControllerEvents, mockBindEventListeners);

            expect(mockView.renderPortfolioSelector).toHaveBeenCalled();
            expect(mockView.updateCurrencyModeUI).toHaveBeenCalledWith('krw');
            expect(mockView.updateMainModeUI).toHaveBeenCalledWith('simple');
        });

        it('should handle initialization when no active portfolio exists', async () => {
            mockState.getActivePortfolio = vi.fn().mockReturnValue(null);

            const mockBindControllerEvents = vi.fn();
            const mockBindEventListeners = vi.fn().mockReturnValue(new AbortController());

            await appInitializer.initialize(mockBindControllerEvents, mockBindEventListeners);

            expect(mockView.renderPortfolioSelector).not.toHaveBeenCalled();
            expect(mockView.updateCurrencyModeUI).not.toHaveBeenCalled();
        });
    });

    describe('setupInitialUI', () => {
        it('should setup UI with active portfolio', () => {
            appInitializer.setupInitialUI();

            expect(mockView.renderPortfolioSelector).toHaveBeenCalledWith(
                { 'portfolio-1': { id: 'portfolio-1', name: 'Test Portfolio' } },
                'portfolio-1'
            );
            expect(mockView.updateCurrencyModeUI).toHaveBeenCalledWith('krw');
            expect(mockView.updateMainModeUI).toHaveBeenCalledWith('simple');
            expect(mockView.updatePortfolioSettingsInputs).toHaveBeenCalledWith({
                exchangeRate: 1300,
                rebalancingTolerance: 5,
                tradingFeeRate: 0.3,
                taxRate: 15,
            });
        });

        it('should initialize DarkModeManager', () => {
            const darkModeManager = appInitializer.getDarkModeManager();

            appInitializer.setupInitialUI();

            expect(darkModeManager.initialize).toHaveBeenCalledOnce();
        });

        it('should handle missing optional settings', () => {
            mockState.getActivePortfolio = vi.fn().mockReturnValue({
                id: 'portfolio-1',
                name: 'Test Portfolio',
                settings: {
                    mainMode: 'simple',
                    currentCurrency: 'krw',
                    exchangeRate: 1300,
                    // Missing rebalancingTolerance, tradingFeeRate, taxRate
                },
            });

            appInitializer.setupInitialUI();

            expect(mockView.updatePortfolioSettingsInputs).toHaveBeenCalledWith({
                exchangeRate: 1300,
                rebalancingTolerance: 5, // default
                tradingFeeRate: 0.3, // default
                taxRate: 15, // default
            });
        });

        it('should not setup UI when no active portfolio', () => {
            mockState.getActivePortfolio = vi.fn().mockReturnValue(null);

            appInitializer.setupInitialUI();

            expect(mockView.renderPortfolioSelector).not.toHaveBeenCalled();
            expect(mockView.updateCurrencyModeUI).not.toHaveBeenCalled();
        });
    });

    // Note: loadExchangeRate uses dynamic import and makes actual API calls.
    // This method is better tested in integration or E2E tests.
    // Unit testing it would require complex mocking of dynamic imports.

    describe('cleanup', () => {
        it('should cleanup DarkModeManager', () => {
            const darkModeManager = appInitializer.getDarkModeManager();

            appInitializer.cleanup();

            expect(darkModeManager.cleanup).toHaveBeenCalledOnce();
        });

        it('should be safe to call multiple times', () => {
            const darkModeManager = appInitializer.getDarkModeManager();

            appInitializer.cleanup();
            appInitializer.cleanup();

            expect(darkModeManager.cleanup).toHaveBeenCalledTimes(2);
        });
    });

    describe('getDarkModeManager', () => {
        it('should return DarkModeManager instance', () => {
            const darkModeManager = appInitializer.getDarkModeManager();

            expect(darkModeManager).toBeTruthy();
            expect(darkModeManager).toBe(mockDarkModeManager);
        });

        it('should return same instance on multiple calls', () => {
            const manager1 = appInitializer.getDarkModeManager();
            const manager2 = appInitializer.getDarkModeManager();

            expect(manager1).toBe(manager2);
            expect(manager1).toBe(mockDarkModeManager);
        });
    });

    describe('integration', () => {
        it('should handle full initialization flow', async () => {
            const mockBindControllerEvents = vi.fn();
            const mockBindEventListeners = vi.fn().mockReturnValue(new AbortController());

            const abortController = await appInitializer.initialize(
                mockBindControllerEvents,
                mockBindEventListeners
            );

            // Verify initialization sequence
            expect(mockState.ensureInitialized).toHaveBeenCalledBefore(
                mockView.cacheDomElements as any
            );
            expect(mockView.cacheDomElements).toHaveBeenCalledBefore(
                ErrorService.setViewInstance as any
            );
            expect(mockBindControllerEvents).toHaveBeenCalled();
            expect(mockBindEventListeners).toHaveBeenCalledWith(mockView);

            // Verify UI setup
            expect(mockView.renderPortfolioSelector).toHaveBeenCalled();
            expect(mockView.updateCurrencyModeUI).toHaveBeenCalled();
            expect(mockView.updateMainModeUI).toHaveBeenCalled();

            // Verify return value
            expect(abortController).toBeInstanceOf(AbortController);
        });

        it('should handle USD currency mode', async () => {
            mockState.getActivePortfolio = vi.fn().mockReturnValue({
                id: 'portfolio-1',
                name: 'USD Portfolio',
                settings: {
                    mainMode: 'add',
                    currentCurrency: 'usd',
                    exchangeRate: 1300,
                    rebalancingTolerance: 3,
                    tradingFeeRate: 0.5,
                    taxRate: 20,
                },
            });

            const mockBindControllerEvents = vi.fn();
            const mockBindEventListeners = vi.fn().mockReturnValue(new AbortController());

            await appInitializer.initialize(mockBindControllerEvents, mockBindEventListeners);

            expect(mockView.updateCurrencyModeUI).toHaveBeenCalledWith('usd');
            expect(mockView.updateMainModeUI).toHaveBeenCalledWith('add');
            expect(mockView.updatePortfolioSettingsInputs).toHaveBeenCalledWith({
                exchangeRate: 1300,
                rebalancingTolerance: 3,
                tradingFeeRate: 0.5,
                taxRate: 20,
            });
        });
    });
});
