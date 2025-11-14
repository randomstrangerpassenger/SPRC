// src/state/PersistenceRepository.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import Decimal from 'decimal.js';
import { PersistenceRepository } from './PersistenceRepository';
import { DataStore } from '../dataStore';
import { ErrorService } from '../errorService';
import type { Portfolio, MetaState, Stock } from '../types';

// DataStore 모킹
vi.mock('../dataStore', () => ({
    DataStore: {
        migrateFromLocalStorage: vi.fn(),
        loadMeta: vi.fn(),
        loadPortfolios: vi.fn(),
        saveMeta: vi.fn(),
        savePortfolios: vi.fn(),
    },
}));

// ErrorService 모킹
vi.mock('../errorService', () => ({
    ErrorService: {
        handle: vi.fn(),
    },
}));

describe('PersistenceRepository', () => {
    let repository: PersistenceRepository;

    beforeEach(() => {
        repository = new PersistenceRepository();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('migrateFromLocalStorage', () => {
        it('should call DataStore.migrateFromLocalStorage', async () => {
            vi.mocked(DataStore.migrateFromLocalStorage).mockResolvedValue(true);

            const result = await repository.migrateFromLocalStorage();

            expect(result).toBe(true);
            expect(DataStore.migrateFromLocalStorage).toHaveBeenCalledOnce();
        });

        it('should return false when migration fails', async () => {
            vi.mocked(DataStore.migrateFromLocalStorage).mockResolvedValue(false);

            const result = await repository.migrateFromLocalStorage();

            expect(result).toBe(false);
        });
    });

    describe('loadMeta', () => {
        it('should load meta data from DataStore', async () => {
            const mockMeta: MetaState = {
                version: '2.0.0',
                activePortfolioId: 'portfolio-1',
            };

            vi.mocked(DataStore.loadMeta).mockResolvedValue(mockMeta);

            const result = await repository.loadMeta();

            expect(result).toEqual(mockMeta);
            expect(DataStore.loadMeta).toHaveBeenCalledOnce();
        });

        it('should return null when no meta exists', async () => {
            vi.mocked(DataStore.loadMeta).mockResolvedValue(null);

            const result = await repository.loadMeta();

            expect(result).toBeNull();
        });
    });

    describe('loadPortfolios', () => {
        it('should load portfolios from DataStore', async () => {
            const mockPortfolios: Record<string, Portfolio> = {
                'portfolio-1': {
                    id: 'portfolio-1',
                    name: 'Test Portfolio',
                    portfolioData: [],
                    settings: {
                        mainMode: 'simple',
                        currentCurrency: 'krw',
                        exchangeRate: 1300,
                        rebalancingTolerance: 5,
                        tradingFeeRate: 0.3,
                        taxRate: 15,
                    },
                },
            };

            vi.mocked(DataStore.loadPortfolios).mockResolvedValue(mockPortfolios);

            const result = await repository.loadPortfolios();

            expect(result).toEqual(mockPortfolios);
            expect(DataStore.loadPortfolios).toHaveBeenCalledOnce();
        });

        it('should return null when no portfolios exist', async () => {
            vi.mocked(DataStore.loadPortfolios).mockResolvedValue(null);

            const result = await repository.loadPortfolios();

            expect(result).toBeNull();
        });
    });

    describe('saveMeta', () => {
        it('should save meta data to DataStore', async () => {
            vi.mocked(DataStore.saveMeta).mockResolvedValue(undefined);

            await repository.saveMeta('portfolio-1');

            expect(DataStore.saveMeta).toHaveBeenCalledWith({
                activePortfolioId: 'portfolio-1',
                version: expect.any(String),
            });
        });

        it('should handle null activePortfolioId', async () => {
            vi.mocked(DataStore.saveMeta).mockResolvedValue(undefined);

            await repository.saveMeta(null);

            expect(DataStore.saveMeta).toHaveBeenCalledWith({
                activePortfolioId: '',
                version: expect.any(String),
            });
        });

        it('should handle errors gracefully', async () => {
            const error = new Error('Save failed');
            vi.mocked(DataStore.saveMeta).mockRejectedValue(error);

            await repository.saveMeta('portfolio-1');

            expect(ErrorService.handle).toHaveBeenCalledWith(
                error,
                'PersistenceRepository.saveMeta'
            );
        });
    });

    describe('savePortfolios', () => {
        it('should save portfolios with Decimal conversion', async () => {
            const portfolios: Record<string, Portfolio> = {
                'portfolio-1': {
                    id: 'portfolio-1',
                    name: 'Test Portfolio',
                    portfolioData: [
                        {
                            id: 'stock-1',
                            name: 'Test Stock',
                            ticker: 'TST',
                            sector: 'Tech',
                            targetRatio: new Decimal(10.5),
                            currentPrice: new Decimal(50000),
                            fixedBuyAmount: new Decimal(100000),
                            isFixedBuyEnabled: false,
                            manualAmount: new Decimal(0),
                            transactions: [
                                {
                                    id: 'tx-1',
                                    type: 'buy',
                                    date: '2024-01-01',
                                    quantity: new Decimal(2),
                                    price: new Decimal(50000),
                                },
                            ],
                        } as Stock,
                    ],
                    settings: {
                        mainMode: 'simple',
                        currentCurrency: 'krw',
                        exchangeRate: 1300,
                        rebalancingTolerance: 5,
                        tradingFeeRate: 0.3,
                        taxRate: 15,
                    },
                },
            };

            vi.mocked(DataStore.savePortfolios).mockResolvedValue(undefined);

            await repository.savePortfolios(portfolios);

            expect(DataStore.savePortfolios).toHaveBeenCalledWith({
                'portfolio-1': {
                    id: 'portfolio-1',
                    name: 'Test Portfolio',
                    portfolioData: [
                        {
                            id: 'stock-1',
                            name: 'Test Stock',
                            ticker: 'TST',
                            sector: 'Tech',
                            targetRatio: 10.5,
                            currentPrice: 50000,
                            fixedBuyAmount: 100000,
                            isFixedBuyEnabled: false,
                            manualAmount: 0,
                            transactions: [
                                {
                                    id: 'tx-1',
                                    type: 'buy',
                                    date: '2024-01-01',
                                    quantity: 2,
                                    price: 50000,
                                },
                            ],
                        },
                    ],
                    settings: {
                        mainMode: 'simple',
                        currentCurrency: 'krw',
                        exchangeRate: 1300,
                        rebalancingTolerance: 5,
                        tradingFeeRate: 0.3,
                        taxRate: 15,
                    },
                },
            });
        });

        it('should exclude calculated property from saved data', async () => {
            const portfolios: Record<string, Portfolio> = {
                'portfolio-1': {
                    id: 'portfolio-1',
                    name: 'Test Portfolio',
                    portfolioData: [
                        {
                            id: 'stock-1',
                            name: 'Test Stock',
                            ticker: 'TST',
                            sector: 'Tech',
                            targetRatio: new Decimal(10),
                            currentPrice: new Decimal(50000),
                            fixedBuyAmount: new Decimal(0),
                            isFixedBuyEnabled: false,
                            manualAmount: new Decimal(0),
                            transactions: [],
                            calculated: {
                                // This should be excluded
                                currentValue: 100000,
                                currentRatio: 10,
                            },
                        } as any,
                    ],
                    settings: {
                        mainMode: 'simple',
                        currentCurrency: 'krw',
                        exchangeRate: 1300,
                        rebalancingTolerance: 5,
                        tradingFeeRate: 0.3,
                        taxRate: 15,
                    },
                },
            };

            vi.mocked(DataStore.savePortfolios).mockResolvedValue(undefined);

            await repository.savePortfolios(portfolios);

            const savedData = vi.mocked(DataStore.savePortfolios).mock.calls[0][0];
            expect(savedData['portfolio-1'].portfolioData[0]).not.toHaveProperty('calculated');
        });

        it('should handle QuotaExceededError', async () => {
            const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
            vi.mocked(DataStore.savePortfolios).mockRejectedValue(quotaError);

            const portfolios: Record<string, Portfolio> = {
                'portfolio-1': {
                    id: 'portfolio-1',
                    name: 'Test Portfolio',
                    portfolioData: [],
                    settings: {
                        mainMode: 'simple',
                        currentCurrency: 'krw',
                        exchangeRate: 1300,
                        rebalancingTolerance: 5,
                        tradingFeeRate: 0.3,
                        taxRate: 15,
                    },
                },
            };

            await repository.savePortfolios(portfolios);

            expect(ErrorService.handle).toHaveBeenCalledWith(
                quotaError,
                'PersistenceRepository.savePortfolios - Quota Exceeded'
            );
        });

        it('should handle generic errors', async () => {
            const error = new Error('Save failed');
            vi.mocked(DataStore.savePortfolios).mockRejectedValue(error);

            const portfolios: Record<string, Portfolio> = {
                'portfolio-1': {
                    id: 'portfolio-1',
                    name: 'Test Portfolio',
                    portfolioData: [],
                    settings: {
                        mainMode: 'simple',
                        currentCurrency: 'krw',
                        exchangeRate: 1300,
                        rebalancingTolerance: 5,
                        tradingFeeRate: 0.3,
                        taxRate: 15,
                    },
                },
            };

            await repository.savePortfolios(portfolios);

            expect(ErrorService.handle).toHaveBeenCalledWith(
                error,
                'PersistenceRepository.savePortfolios'
            );
        });

        it('should convert number values when Decimal is not used', async () => {
            const portfolios: Record<string, Portfolio> = {
                'portfolio-1': {
                    id: 'portfolio-1',
                    name: 'Test Portfolio',
                    portfolioData: [
                        {
                            id: 'stock-1',
                            name: 'Test Stock',
                            ticker: 'TST',
                            sector: 'Tech',
                            targetRatio: 10.5 as any, // number instead of Decimal
                            currentPrice: 50000 as any,
                            fixedBuyAmount: 100000 as any,
                            isFixedBuyEnabled: false,
                            manualAmount: 0 as any,
                            transactions: [],
                        } as Stock,
                    ],
                    settings: {
                        mainMode: 'simple',
                        currentCurrency: 'krw',
                        exchangeRate: 1300,
                        rebalancingTolerance: 5,
                        tradingFeeRate: 0.3,
                        taxRate: 15,
                    },
                },
            };

            vi.mocked(DataStore.savePortfolios).mockResolvedValue(undefined);

            await repository.savePortfolios(portfolios);

            const savedData = vi.mocked(DataStore.savePortfolios).mock.calls[0][0];
            expect(savedData['portfolio-1'].portfolioData[0].targetRatio).toBe(10.5);
            expect(savedData['portfolio-1'].portfolioData[0].currentPrice).toBe(50000);
        });
    });
});
