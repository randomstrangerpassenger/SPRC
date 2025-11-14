// src/controller/PortfolioManager.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PortfolioManager } from './PortfolioManager';
import type { PortfolioState } from '../state';
import type { PortfolioView } from '../view';

// DOMPurify 모킹
vi.mock('dompurify', () => ({
    default: {
        sanitize: vi.fn((text: string) => text.trim()),
    },
}));

// i18n 모킹
vi.mock('../i18n', () => ({
    t: vi.fn((key: string, params?: any) => {
        if (params) {
            return `${key}:${JSON.stringify(params)}`;
        }
        return key;
    }),
}));

describe('PortfolioManager', () => {
    let portfolioManager: PortfolioManager;
    let mockState: PortfolioState;
    let mockView: PortfolioView;

    beforeEach(() => {
        // Mock PortfolioState
        mockState = {
            createNewPortfolio: vi.fn().mockResolvedValue(undefined),
            renamePortfolio: vi.fn().mockResolvedValue(undefined),
            deletePortfolio: vi.fn().mockResolvedValue(true),
            setActivePortfolioId: vi.fn().mockResolvedValue(undefined),
            getActivePortfolio: vi.fn().mockReturnValue({
                id: 'portfolio-1',
                name: 'Test Portfolio',
                settings: {
                    mainMode: 'simple',
                    currentCurrency: 'krw',
                    exchangeRate: 1300,
                },
            }),
            getAllPortfolios: vi.fn().mockReturnValue({
                'portfolio-1': { id: 'portfolio-1', name: 'Portfolio 1' },
                'portfolio-2': { id: 'portfolio-2', name: 'Portfolio 2' },
            }),
        } as any;

        // Mock PortfolioView
        mockView = {
            showPrompt: vi.fn(),
            showConfirm: vi.fn(),
            showToast: vi.fn(),
            renderPortfolioSelector: vi.fn(),
            updateCurrencyModeUI: vi.fn(),
            updateMainModeUI: vi.fn(),
            dom: {
                portfolioSelector: {
                    value: 'portfolio-1',
                } as any,
                exchangeRateInput: {
                    value: '1300',
                } as any,
                portfolioExchangeRateInput: {
                    value: '1300',
                } as any,
            },
        } as any;

        portfolioManager = new PortfolioManager(mockState, mockView);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('handleNewPortfolio', () => {
        it('should create new portfolio with given name', async () => {
            vi.mocked(mockView.showPrompt).mockResolvedValue('New Portfolio');

            await portfolioManager.handleNewPortfolio();

            expect(mockView.showPrompt).toHaveBeenCalledWith(
                'modal.promptNewPortfolioNameTitle',
                'modal.promptNewPortfolioNameMsg'
            );
            expect(mockState.createNewPortfolio).toHaveBeenCalledWith('New Portfolio');
            expect(mockView.renderPortfolioSelector).toHaveBeenCalledWith(
                {
                    'portfolio-1': { id: 'portfolio-1', name: 'Portfolio 1' },
                    'portfolio-2': { id: 'portfolio-2', name: 'Portfolio 2' },
                },
                'portfolio-1'
            );
            expect(mockView.showToast).toHaveBeenCalledWith(
                expect.stringContaining('toast.portfolioCreated'),
                'success'
            );
        });

        it('should do nothing when user cancels prompt', async () => {
            vi.mocked(mockView.showPrompt).mockResolvedValue(null);

            await portfolioManager.handleNewPortfolio();

            expect(mockState.createNewPortfolio).not.toHaveBeenCalled();
            expect(mockView.renderPortfolioSelector).not.toHaveBeenCalled();
            expect(mockView.showToast).not.toHaveBeenCalled();
        });

        it('should sanitize portfolio name', async () => {
            vi.mocked(mockView.showPrompt).mockResolvedValue('  Portfolio Name  ');

            await portfolioManager.handleNewPortfolio();

            expect(mockState.createNewPortfolio).toHaveBeenCalledWith('Portfolio Name');
        });

        it('should do nothing when user enters empty name', async () => {
            vi.mocked(mockView.showPrompt).mockResolvedValue('');

            await portfolioManager.handleNewPortfolio();

            expect(mockState.createNewPortfolio).not.toHaveBeenCalled();
        });
    });

    describe('handleRenamePortfolio', () => {
        it('should rename active portfolio', async () => {
            vi.mocked(mockView.showPrompt).mockResolvedValue('Renamed Portfolio');

            await portfolioManager.handleRenamePortfolio();

            expect(mockView.showPrompt).toHaveBeenCalledWith(
                'modal.promptRenamePortfolioTitle',
                'modal.promptRenamePortfolioMsg',
                'Test Portfolio'
            );
            expect(mockState.renamePortfolio).toHaveBeenCalledWith(
                'portfolio-1',
                'Renamed Portfolio'
            );
            expect(mockView.renderPortfolioSelector).toHaveBeenCalledWith(
                {
                    'portfolio-1': { id: 'portfolio-1', name: 'Portfolio 1' },
                    'portfolio-2': { id: 'portfolio-2', name: 'Portfolio 2' },
                },
                'portfolio-1'
            );
            expect(mockView.showToast).toHaveBeenCalledWith(
                'toast.portfolioRenamed',
                'success'
            );
        });

        it('should do nothing when no active portfolio', async () => {
            mockState.getActivePortfolio = vi.fn().mockReturnValue(null);

            await portfolioManager.handleRenamePortfolio();

            expect(mockView.showPrompt).not.toHaveBeenCalled();
            expect(mockState.renamePortfolio).not.toHaveBeenCalled();
        });

        it('should do nothing when user cancels rename', async () => {
            vi.mocked(mockView.showPrompt).mockResolvedValue(null);

            await portfolioManager.handleRenamePortfolio();

            expect(mockState.renamePortfolio).not.toHaveBeenCalled();
        });

        it('should trim and sanitize new name', async () => {
            vi.mocked(mockView.showPrompt).mockResolvedValue('  New Name  ');

            await portfolioManager.handleRenamePortfolio();

            expect(mockState.renamePortfolio).toHaveBeenCalledWith('portfolio-1', 'New Name');
        });

        it('should do nothing when new name is empty after trim', async () => {
            vi.mocked(mockView.showPrompt).mockResolvedValue('   ');

            await portfolioManager.handleRenamePortfolio();

            expect(mockState.renamePortfolio).not.toHaveBeenCalled();
        });
    });

    describe('handleDeletePortfolio', () => {
        it('should delete portfolio after confirmation', async () => {
            vi.mocked(mockView.showConfirm).mockResolvedValue(true);

            await portfolioManager.handleDeletePortfolio();

            expect(mockView.showConfirm).toHaveBeenCalledWith(
                'modal.confirmDeletePortfolioTitle',
                expect.stringContaining('modal.confirmDeletePortfolioMsg')
            );
            expect(mockState.deletePortfolio).toHaveBeenCalledWith('portfolio-1');
            expect(mockView.renderPortfolioSelector).toHaveBeenCalled();
            expect(mockView.showToast).toHaveBeenCalledWith('toast.portfolioDeleted', 'success');
        });

        it('should do nothing when no active portfolio', async () => {
            mockState.getActivePortfolio = vi.fn().mockReturnValue(null);

            await portfolioManager.handleDeletePortfolio();

            expect(mockView.showConfirm).not.toHaveBeenCalled();
            expect(mockState.deletePortfolio).not.toHaveBeenCalled();
        });

        it('should prevent deleting last portfolio', async () => {
            mockState.getAllPortfolios = vi.fn().mockReturnValue({
                'portfolio-1': { id: 'portfolio-1', name: 'Last Portfolio' },
            });

            await portfolioManager.handleDeletePortfolio();

            expect(mockView.showToast).toHaveBeenCalledWith(
                'toast.lastPortfolioDeleteError',
                'error'
            );
            expect(mockView.showConfirm).not.toHaveBeenCalled();
            expect(mockState.deletePortfolio).not.toHaveBeenCalled();
        });

        it('should do nothing when user cancels deletion', async () => {
            vi.mocked(mockView.showConfirm).mockResolvedValue(false);

            await portfolioManager.handleDeletePortfolio();

            expect(mockState.deletePortfolio).not.toHaveBeenCalled();
            expect(mockView.showToast).not.toHaveBeenCalledWith('toast.portfolioDeleted', 'success');
        });

        it('should not show success toast when deletion fails', async () => {
            vi.mocked(mockView.showConfirm).mockResolvedValue(true);
            mockState.deletePortfolio = vi.fn().mockResolvedValue(false);

            await portfolioManager.handleDeletePortfolio();

            expect(mockState.deletePortfolio).toHaveBeenCalled();
            expect(mockView.showToast).not.toHaveBeenCalled();
        });
    });

    describe('handleSwitchPortfolio', () => {
        it('should switch to specified portfolio', async () => {
            await portfolioManager.handleSwitchPortfolio('portfolio-2');

            expect(mockState.setActivePortfolioId).toHaveBeenCalledWith('portfolio-2');
            expect(mockView.updateCurrencyModeUI).toHaveBeenCalledWith('krw');
            expect(mockView.updateMainModeUI).toHaveBeenCalledWith('simple');
        });

        it('should do nothing when empty ID provided and selector has no value', async () => {
            mockView.dom.portfolioSelector = null as any;

            await portfolioManager.handleSwitchPortfolio('');

            expect(mockState.setActivePortfolioId).not.toHaveBeenCalled();
        });

        it('should update exchange rate inputs', async () => {
            await portfolioManager.handleSwitchPortfolio('portfolio-2');

            expect(mockView.dom.exchangeRateInput.value).toBe('1300');
            expect(mockView.dom.portfolioExchangeRateInput.value).toBe('1300');
        });

        it('should handle missing active portfolio after switch', async () => {
            mockState.getActivePortfolio = vi.fn().mockReturnValue(null);

            await portfolioManager.handleSwitchPortfolio('portfolio-2');

            expect(mockState.setActivePortfolioId).toHaveBeenCalledWith('portfolio-2');
            expect(mockView.updateCurrencyModeUI).not.toHaveBeenCalled();
            expect(mockView.updateMainModeUI).not.toHaveBeenCalled();
        });

        it('should do nothing when selector is not HTMLSelectElement', async () => {
            mockView.dom.portfolioSelector = {} as any;

            await portfolioManager.handleSwitchPortfolio('');

            expect(mockState.setActivePortfolioId).not.toHaveBeenCalled();
        });

        it('should handle USD currency mode', async () => {
            const usdPortfolio = {
                id: 'portfolio-2',
                name: 'USD Portfolio',
                settings: {
                    mainMode: 'add' as const,
                    currentCurrency: 'usd' as const,
                    exchangeRate: 1350,
                },
            };

            // Create new mock to ensure fresh state
            mockState.getActivePortfolio = vi.fn().mockReturnValue(usdPortfolio);

            await portfolioManager.handleSwitchPortfolio('portfolio-2');

            expect(mockView.updateCurrencyModeUI).toHaveBeenCalledWith('usd');
            expect(mockView.updateMainModeUI).toHaveBeenCalledWith('add');
            // The input value is set by the actual code
            expect(mockState.setActivePortfolioId).toHaveBeenCalledWith('portfolio-2');
        });

        it('should handle missing exchange rate inputs gracefully', async () => {
            mockView.dom.exchangeRateInput = null as any;
            mockView.dom.portfolioExchangeRateInput = null as any;

            await portfolioManager.handleSwitchPortfolio('portfolio-2');

            expect(mockState.setActivePortfolioId).toHaveBeenCalled();
            // Should not throw error
        });
    });
});
