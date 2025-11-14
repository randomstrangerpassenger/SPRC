// src/state/SnapshotRepository.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SnapshotRepository } from './SnapshotRepository';
import { DataStore } from '../dataStore';
import { ErrorService } from '../errorService';
import type { PortfolioSnapshot } from '../types';

// DataStore 모킹
vi.mock('../dataStore', () => ({
    DataStore: {
        loadSnapshots: vi.fn(),
        getSnapshotsForPortfolio: vi.fn(),
        addSnapshot: vi.fn(),
        deleteSnapshotsForPortfolio: vi.fn(),
    },
}));

// ErrorService 모킹
vi.mock('../errorService', () => ({
    ErrorService: {
        handle: vi.fn(),
    },
}));

describe('SnapshotRepository', () => {
    let repository: SnapshotRepository;

    beforeEach(() => {
        repository = new SnapshotRepository();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('loadAll', () => {
        it('should load all snapshots from DataStore', async () => {
            const mockSnapshots: Record<string, PortfolioSnapshot[]> = {
                'portfolio-1': [
                    {
                        id: 'snapshot-1',
                        portfolioId: 'portfolio-1',
                        date: '2024-01-01',
                        totalValue: 1000000,
                        currency: 'krw',
                        stocks: [],
                    },
                ],
            };

            vi.mocked(DataStore.loadSnapshots).mockResolvedValue(mockSnapshots);

            const result = await repository.loadAll();

            expect(result).toEqual(mockSnapshots);
            expect(DataStore.loadSnapshots).toHaveBeenCalledOnce();
        });

        it('should return empty object when no snapshots exist', async () => {
            vi.mocked(DataStore.loadSnapshots).mockResolvedValue(null);

            const result = await repository.loadAll();

            expect(result).toEqual({});
        });

        it('should handle errors gracefully', async () => {
            const error = new Error('Load failed');
            vi.mocked(DataStore.loadSnapshots).mockRejectedValue(error);

            const result = await repository.loadAll();

            expect(result).toEqual({});
            expect(ErrorService.handle).toHaveBeenCalledWith(error, 'SnapshotRepository.loadAll');
        });
    });

    describe('getByPortfolioId', () => {
        it('should get snapshots for specific portfolio', async () => {
            const mockSnapshots: PortfolioSnapshot[] = [
                {
                    id: 'snapshot-1',
                    portfolioId: 'portfolio-1',
                    date: '2024-01-01',
                    totalValue: 1000000,
                    currency: 'krw',
                    stocks: [],
                },
                {
                    id: 'snapshot-2',
                    portfolioId: 'portfolio-1',
                    date: '2024-01-02',
                    totalValue: 1100000,
                    currency: 'krw',
                    stocks: [],
                },
            ];

            vi.mocked(DataStore.getSnapshotsForPortfolio).mockResolvedValue(mockSnapshots);

            const result = await repository.getByPortfolioId('portfolio-1');

            expect(result).toEqual(mockSnapshots);
            expect(DataStore.getSnapshotsForPortfolio).toHaveBeenCalledWith('portfolio-1');
        });

        it('should return empty array when no snapshots exist', async () => {
            vi.mocked(DataStore.getSnapshotsForPortfolio).mockResolvedValue([]);

            const result = await repository.getByPortfolioId('portfolio-1');

            expect(result).toEqual([]);
        });

        it('should handle errors gracefully', async () => {
            const error = new Error('Get failed');
            vi.mocked(DataStore.getSnapshotsForPortfolio).mockRejectedValue(error);

            const result = await repository.getByPortfolioId('portfolio-1');

            expect(result).toEqual([]);
            expect(ErrorService.handle).toHaveBeenCalledWith(
                error,
                'SnapshotRepository.getByPortfolioId'
            );
        });
    });

    describe('add', () => {
        it('should add a new snapshot', async () => {
            const snapshot: PortfolioSnapshot = {
                id: 'snapshot-1',
                portfolioId: 'portfolio-1',
                date: '2024-01-01',
                totalValue: 1000000,
                currency: 'krw',
                stocks: [],
            };

            vi.mocked(DataStore.addSnapshot).mockResolvedValue(undefined);

            await repository.add(snapshot);

            expect(DataStore.addSnapshot).toHaveBeenCalledWith(snapshot);
        });

        it('should propagate errors', async () => {
            const snapshot: PortfolioSnapshot = {
                id: 'snapshot-1',
                portfolioId: 'portfolio-1',
                date: '2024-01-01',
                totalValue: 1000000,
                currency: 'krw',
                stocks: [],
            };

            const error = new Error('Add failed');
            vi.mocked(DataStore.addSnapshot).mockRejectedValue(error);

            await expect(repository.add(snapshot)).rejects.toThrow('Add failed');

            expect(ErrorService.handle).toHaveBeenCalledWith(error, 'SnapshotRepository.add');
        });
    });

    describe('deleteByPortfolioId', () => {
        it('should delete all snapshots for a portfolio', async () => {
            vi.mocked(DataStore.deleteSnapshotsForPortfolio).mockResolvedValue(undefined);

            await repository.deleteByPortfolioId('portfolio-1');

            expect(DataStore.deleteSnapshotsForPortfolio).toHaveBeenCalledWith('portfolio-1');
        });

        it('should propagate errors', async () => {
            const error = new Error('Delete failed');
            vi.mocked(DataStore.deleteSnapshotsForPortfolio).mockRejectedValue(error);

            await expect(repository.deleteByPortfolioId('portfolio-1')).rejects.toThrow(
                'Delete failed'
            );

            expect(ErrorService.handle).toHaveBeenCalledWith(
                error,
                'SnapshotRepository.deleteByPortfolioId'
            );
        });
    });

    describe('getLatest', () => {
        it('should return the most recent snapshot', async () => {
            const mockSnapshots: PortfolioSnapshot[] = [
                {
                    id: 'snapshot-2',
                    portfolioId: 'portfolio-1',
                    date: '2024-01-02',
                    totalValue: 1100000,
                    currency: 'krw',
                    stocks: [],
                },
                {
                    id: 'snapshot-1',
                    portfolioId: 'portfolio-1',
                    date: '2024-01-01',
                    totalValue: 1000000,
                    currency: 'krw',
                    stocks: [],
                },
            ];

            vi.mocked(DataStore.getSnapshotsForPortfolio).mockResolvedValue(mockSnapshots);

            const result = await repository.getLatest('portfolio-1');

            expect(result).toEqual(mockSnapshots[0]);
        });

        it('should return null when no snapshots exist', async () => {
            vi.mocked(DataStore.getSnapshotsForPortfolio).mockResolvedValue([]);

            const result = await repository.getLatest('portfolio-1');

            expect(result).toBeNull();
        });

        it('should handle errors gracefully', async () => {
            const error = new Error('Get failed');
            vi.mocked(DataStore.getSnapshotsForPortfolio).mockRejectedValue(error);

            const result = await repository.getLatest('portfolio-1');

            expect(result).toBeNull();
            expect(ErrorService.handle).toHaveBeenCalledWith(
                error,
                'SnapshotRepository.getLatest'
            );
        });
    });

    describe('getByDateRange', () => {
        it('should return snapshots within date range', async () => {
            const mockSnapshots: PortfolioSnapshot[] = [
                {
                    id: 'snapshot-1',
                    portfolioId: 'portfolio-1',
                    date: '2024-01-01',
                    totalValue: 1000000,
                    currency: 'krw',
                    stocks: [],
                },
                {
                    id: 'snapshot-2',
                    portfolioId: 'portfolio-1',
                    date: '2024-01-05',
                    totalValue: 1100000,
                    currency: 'krw',
                    stocks: [],
                },
                {
                    id: 'snapshot-3',
                    portfolioId: 'portfolio-1',
                    date: '2024-01-10',
                    totalValue: 1200000,
                    currency: 'krw',
                    stocks: [],
                },
            ];

            vi.mocked(DataStore.getSnapshotsForPortfolio).mockResolvedValue(mockSnapshots);

            const result = await repository.getByDateRange(
                'portfolio-1',
                '2024-01-03',
                '2024-01-08'
            );

            expect(result).toEqual([mockSnapshots[1]]);
        });

        it('should return empty array when no snapshots in range', async () => {
            const mockSnapshots: PortfolioSnapshot[] = [
                {
                    id: 'snapshot-1',
                    portfolioId: 'portfolio-1',
                    date: '2024-01-01',
                    totalValue: 1000000,
                    currency: 'krw',
                    stocks: [],
                },
            ];

            vi.mocked(DataStore.getSnapshotsForPortfolio).mockResolvedValue(mockSnapshots);

            const result = await repository.getByDateRange(
                'portfolio-1',
                '2024-02-01',
                '2024-02-28'
            );

            expect(result).toEqual([]);
        });

        it('should handle errors gracefully', async () => {
            const error = new Error('Get failed');
            vi.mocked(DataStore.getSnapshotsForPortfolio).mockRejectedValue(error);

            const result = await repository.getByDateRange(
                'portfolio-1',
                '2024-01-01',
                '2024-12-31'
            );

            expect(result).toEqual([]);
            expect(ErrorService.handle).toHaveBeenCalledWith(
                error,
                'SnapshotRepository.getByDateRange'
            );
        });
    });
});
