// src/dataStore.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DataStore } from './dataStore';
import { CONFIG } from './constants';
import type { MetaState, Portfolio, PortfolioSnapshot } from './types';

// idb-keyval 모킹
const mockStore = new Map<string, any>();

vi.mock('idb-keyval', () => ({
    get: vi.fn((key: string) => Promise.resolve(mockStore.get(key))),
    set: vi.fn((key: string, value: any) => {
        mockStore.set(key, value);
        return Promise.resolve();
    }),
    del: vi.fn((key: string) => {
        mockStore.delete(key);
        return Promise.resolve();
    }),
}));

// ErrorService 모킹
vi.mock('./errorService', () => ({
    ErrorService: {
        handle: vi.fn(),
    },
}));

import { get, set, del } from 'idb-keyval';

describe('DataStore', () => {
    beforeEach(() => {
        // 각 테스트 전에 store 초기화
        mockStore.clear();
        vi.clearAllMocks();
        // localStorage도 초기화
        localStorage.clear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('loadMeta / saveMeta', () => {
        it('should save and load meta data', async () => {
            const metaData: MetaState = {
                version: '2.0.0',
                activePortfolioId: 'portfolio-1',
            };

            await DataStore.saveMeta(metaData);
            const loaded = await DataStore.loadMeta();

            expect(loaded).toEqual(metaData);
            expect(set).toHaveBeenCalledWith(CONFIG.IDB_META_KEY, metaData);
        });

        it('should return null when no meta data exists', async () => {
            const loaded = await DataStore.loadMeta();
            expect(loaded).toBeNull();
        });

        it('should handle errors in loadMeta', async () => {
            vi.mocked(get).mockRejectedValueOnce(new Error('IndexedDB error'));

            const loaded = await DataStore.loadMeta();

            expect(loaded).toBeNull();
        });

        it('should throw error in saveMeta on failure', async () => {
            vi.mocked(set).mockRejectedValueOnce(new Error('IndexedDB error'));

            const metaData: MetaState = {
                version: '2.0.0',
                activePortfolioId: 'portfolio-1',
            };

            await expect(DataStore.saveMeta(metaData)).rejects.toThrow('IndexedDB error');
        });
    });

    describe('loadPortfolios / savePortfolios', () => {
        it('should save and load portfolios', async () => {
            const portfolios: Record<string, Portfolio> = {
                'portfolio-1': {
                    id: 'portfolio-1',
                    name: 'Test Portfolio',
                    stocks: [],
                    createdAt: Date.now(),
                },
            };

            await DataStore.savePortfolios(portfolios);
            const loaded = await DataStore.loadPortfolios();

            expect(loaded).toEqual(portfolios);
            expect(set).toHaveBeenCalledWith(CONFIG.IDB_PORTFOLIOS_KEY, portfolios);
        });

        it('should return null when no portfolios exist', async () => {
            const loaded = await DataStore.loadPortfolios();
            expect(loaded).toBeNull();
        });

        it('should handle errors in loadPortfolios', async () => {
            vi.mocked(get).mockRejectedValueOnce(new Error('IndexedDB error'));

            const loaded = await DataStore.loadPortfolios();

            expect(loaded).toBeNull();
        });

        it('should throw error in savePortfolios on failure', async () => {
            vi.mocked(set).mockRejectedValueOnce(new Error('IndexedDB error'));

            const portfolios: Record<string, Portfolio> = {
                'portfolio-1': {
                    id: 'portfolio-1',
                    name: 'Test Portfolio',
                    stocks: [],
                    createdAt: Date.now(),
                },
            };

            await expect(DataStore.savePortfolios(portfolios)).rejects.toThrow('IndexedDB error');
        });
    });

    describe('migrateFromLocalStorage', () => {
        it('should migrate data from LocalStorage to IndexedDB', async () => {
            const metaData = { version: '1.0.0', activePortfolioId: 'p1' };
            const portfolioData = { p1: { id: 'p1', name: 'Portfolio', stocks: [] } };

            localStorage.setItem(CONFIG.LEGACY_LS_META_KEY, JSON.stringify(metaData));
            localStorage.setItem(CONFIG.LEGACY_LS_PORTFOLIOS_KEY, JSON.stringify(portfolioData));

            const result = await DataStore.migrateFromLocalStorage();

            expect(result).toBe(true);
            expect(set).toHaveBeenCalledWith(CONFIG.IDB_META_KEY, metaData);
            expect(set).toHaveBeenCalledWith(CONFIG.IDB_PORTFOLIOS_KEY, portfolioData);
            expect(localStorage.getItem(CONFIG.LEGACY_LS_META_KEY)).toBeNull();
            expect(localStorage.getItem(CONFIG.LEGACY_LS_PORTFOLIOS_KEY)).toBeNull();
        });

        it('should return false when no legacy data exists', async () => {
            const result = await DataStore.migrateFromLocalStorage();
            expect(result).toBe(false);
        });

        it('should handle invalid JSON in meta data', async () => {
            localStorage.setItem(CONFIG.LEGACY_LS_META_KEY, 'invalid json');
            localStorage.setItem(CONFIG.LEGACY_LS_PORTFOLIOS_KEY, '{}');

            const result = await DataStore.migrateFromLocalStorage();

            expect(result).toBe(false);
        });

        it('should handle invalid JSON in portfolio data', async () => {
            localStorage.setItem(CONFIG.LEGACY_LS_META_KEY, '{}');
            localStorage.setItem(CONFIG.LEGACY_LS_PORTFOLIOS_KEY, 'invalid json');

            const result = await DataStore.migrateFromLocalStorage();

            expect(result).toBe(false);
        });

        it('should handle IndexedDB save errors', async () => {
            const metaData = { version: '1.0.0', activePortfolioId: 'p1' };
            const portfolioData = { p1: { id: 'p1', name: 'Portfolio', stocks: [] } };

            localStorage.setItem(CONFIG.LEGACY_LS_META_KEY, JSON.stringify(metaData));
            localStorage.setItem(CONFIG.LEGACY_LS_PORTFOLIOS_KEY, JSON.stringify(portfolioData));

            vi.mocked(set).mockRejectedValueOnce(new Error('IndexedDB error'));

            const result = await DataStore.migrateFromLocalStorage();

            expect(result).toBe(false);
        });
    });

    describe('snapshots management', () => {
        const mockSnapshot: PortfolioSnapshot = {
            id: 'snapshot-1',
            portfolioId: 'portfolio-1',
            timestamp: Date.now(),
            totalValue: 1000000,
            profitLoss: 50000,
            profitLossRate: 5.0,
            stocks: [],
        };

        it('should load snapshots', async () => {
            const snapshots = {
                'portfolio-1': [mockSnapshot],
            };

            mockStore.set(CONFIG.IDB_SNAPSHOTS_KEY, snapshots);

            const loaded = await DataStore.loadSnapshots();

            expect(loaded).toEqual(snapshots);
        });

        it('should return null when no snapshots exist', async () => {
            const loaded = await DataStore.loadSnapshots();
            expect(loaded).toBeNull();
        });

        it('should get snapshots for specific portfolio', async () => {
            const snapshots = {
                'portfolio-1': [mockSnapshot],
                'portfolio-2': [],
            };

            mockStore.set(CONFIG.IDB_SNAPSHOTS_KEY, snapshots);

            const loaded = await DataStore.getSnapshotsForPortfolio('portfolio-1');

            expect(loaded).toEqual([mockSnapshot]);
        });

        it('should return empty array for non-existent portfolio', async () => {
            const loaded = await DataStore.getSnapshotsForPortfolio('non-existent');

            expect(loaded).toEqual([]);
        });

        it('should add snapshot and sort by timestamp', async () => {
            const snapshot1: PortfolioSnapshot = {
                id: 'snapshot-1',
                portfolioId: 'portfolio-1',
                timestamp: 1000,
                totalValue: 1000000,
                profitLoss: 0,
                profitLossRate: 0,
                stocks: [],
            };

            const snapshot2: PortfolioSnapshot = {
                id: 'snapshot-2',
                portfolioId: 'portfolio-1',
                timestamp: 2000,
                totalValue: 1100000,
                profitLoss: 100000,
                profitLossRate: 10.0,
                stocks: [],
            };

            await DataStore.addSnapshot(snapshot1);
            await DataStore.addSnapshot(snapshot2);

            const loaded = await DataStore.getSnapshotsForPortfolio('portfolio-1');

            expect(loaded).toHaveLength(2);
            expect(loaded[0].timestamp).toBe(2000); // 최신순
            expect(loaded[1].timestamp).toBe(1000);
        });

        it('should limit snapshots to 365', async () => {
            // 366개의 스냅샷 추가
            for (let i = 0; i < 366; i++) {
                const snapshot: PortfolioSnapshot = {
                    id: `snapshot-${i}`,
                    portfolioId: 'portfolio-1',
                    timestamp: i,
                    totalValue: 1000000,
                    profitLoss: 0,
                    profitLossRate: 0,
                    stocks: [],
                };
                await DataStore.addSnapshot(snapshot);
            }

            const loaded = await DataStore.getSnapshotsForPortfolio('portfolio-1');

            expect(loaded).toHaveLength(365);
            expect(loaded[0].timestamp).toBe(365); // 최신 365개만 유지
        });

        it('should delete snapshots for portfolio', async () => {
            const snapshots = {
                'portfolio-1': [mockSnapshot],
                'portfolio-2': [{ ...mockSnapshot, id: 'snapshot-2', portfolioId: 'portfolio-2' }],
            };

            mockStore.set(CONFIG.IDB_SNAPSHOTS_KEY, snapshots);

            await DataStore.deleteSnapshotsForPortfolio('portfolio-1');

            const loaded = await DataStore.loadSnapshots();

            expect(loaded).not.toHaveProperty('portfolio-1');
            expect(loaded).toHaveProperty('portfolio-2');
        });

        it('should handle deleting snapshots for non-existent portfolio', async () => {
            await expect(
                DataStore.deleteSnapshotsForPortfolio('non-existent')
            ).resolves.not.toThrow();
        });
    });

    describe('clearAll', () => {
        it('should clear all data', async () => {
            // 데이터 추가
            mockStore.set(CONFIG.IDB_META_KEY, { version: '2.0.0' });
            mockStore.set(CONFIG.IDB_PORTFOLIOS_KEY, {});
            mockStore.set(CONFIG.IDB_SNAPSHOTS_KEY, {});

            await DataStore.clearAll();

            expect(del).toHaveBeenCalledWith(CONFIG.IDB_META_KEY);
            expect(del).toHaveBeenCalledWith(CONFIG.IDB_PORTFOLIOS_KEY);
            expect(del).toHaveBeenCalledWith(CONFIG.IDB_SNAPSHOTS_KEY);
        });

        it('should throw error on failure', async () => {
            vi.mocked(del).mockRejectedValueOnce(new Error('IndexedDB error'));

            await expect(DataStore.clearAll()).rejects.toThrow('IndexedDB error');
        });
    });
});