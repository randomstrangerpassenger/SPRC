// js/state.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PortfolioState } from './state';
import { CONFIG } from './constants';
import Decimal from 'decimal.js';
import { MOCK_PORTFOLIO_1 } from './testUtils';
import type { Portfolio, Stock } from './types';

// idb-keyval 모의(Mock)
vi.mock('idb-keyval', () => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
}));

// i18n 모의(Mock)
vi.mock('./i18n', () => ({
    t: vi.fn((key: string) => {
        if (key === 'defaults.defaultPortfolioName') return '기본 포트폴리오';
        if (key === 'defaults.newStock') return '새 종목';
        if (key === 'defaults.uncategorized') return '미분류';
        return key;
    }),
}));

// 모의 객체 임포트
import { get, set, del } from 'idb-keyval';

// DOMPurify 모의
vi.mock('dompurify', () => ({
    default: {
        sanitize: vi.fn((input: string) => input),
    },
}));

// ErrorService가 View에 의존하여 발생하는 순환 참조 오류를 방지하기 위해 모의 처리
vi.mock('./errorService', () => ({
    ErrorService: {
        handle: vi.fn(),
    },
    ValidationError: class extends Error {},
}));

describe('PortfolioState (Async)', () => {
    let state: PortfolioState;
    let mockGet: ReturnType<typeof vi.mocked<typeof get>>;
    let mockSet: ReturnType<typeof vi.mocked<typeof set>>;
    let mockDel: ReturnType<typeof vi.mocked<typeof del>>;

    beforeEach(async () => {
        vi.clearAllMocks();

        mockGet = vi.mocked(get);
        mockSet = vi.mocked(set);
        mockDel = vi.mocked(del);

        // 기본적으로 비어있는 DB 시뮬레이션
        mockGet.mockResolvedValue(null);

        // Create a new state instance for each test
        state = new PortfolioState();
        await state.ensureInitialized(); // Wait for initialization
    });

    it('should create default portfolio on initialization if none exists', async () => {
        expect(Object.keys(state.getAllPortfolios()).length).toBe(1);
        const activePortfolio = state.getActivePortfolio();
        expect(activePortfolio?.id).toBeDefined();
        expect(activePortfolio?.name).toBe('기본 포트폴리오');
        expect(activePortfolio?.portfolioData?.length).toBe(1);
        expect(activePortfolio?.portfolioData?.[0]?.name).toBe('새 종목');

        // _initialize는 resetData(false)를 호출하므로, set은 호출되지 않아야 합니다.
        expect(mockSet).not.toHaveBeenCalled();
    });

    it('should load existing data from IndexedDB on initialization', async () => {
        const rawStockData: Stock = {
            id: 's-test',
            name: 'Test Stock',
            ticker: 'TEST',
            sector: 'Tech',
            targetRatio: 100,
            currentPrice: 50,
            isFixedBuyEnabled: false,
            fixedBuyAmount: 0,
            transactions: [],
        };
        const testData = {
            meta: { activePortfolioId: 'p-test', version: CONFIG.DATA_VERSION },
            portfolios: {
                'p-test': {
                    id: 'p-test',
                    name: 'Test Portfolio',
                    settings: {
                        mainMode: 'sell' as const,
                        currentCurrency: 'usd' as const,
                        exchangeRate: 1200,
                    },
                    portfolioData: [rawStockData],
                },
            },
        };

        mockGet.mockImplementation(async (key: string) => {
            if (key === CONFIG.IDB_META_KEY) return testData.meta;
            if (key === CONFIG.IDB_PORTFOLIOS_KEY) return testData.portfolios;
            return null;
        });

        const newState = new PortfolioState();
        await newState.ensureInitialized();

        expect(Object.keys(newState.getAllPortfolios()).length).toBe(1);
        const loadedPortfolio = newState.getActivePortfolio();

        expect(loadedPortfolio?.id).toBe('p-test');
        expect(loadedPortfolio?.name).toBe('Test Portfolio');
        expect(loadedPortfolio?.settings.mainMode).toBe('sell');
        expect(loadedPortfolio?.portfolioData?.[0]?.name).toBe('Test Stock');
        expect(Number(loadedPortfolio?.portfolioData?.[0]?.targetRatio)).toBe(100);
    });

    it('should add a new stock correctly (async)', async () => {
        const initialLength = state.getActivePortfolio()?.portfolioData?.length || 0;

        const newStock = await state.addNewStock();

        expect(state.getActivePortfolio()?.portfolioData?.length).toBe(initialLength + 1);
        expect(newStock.name).toBe('새 종목');
        expect(Number(newStock.targetRatio)).toBe(0);

        // saveActivePortfolio -> savePortfolios -> set 호출 확인
        expect(mockSet).toHaveBeenCalledWith(CONFIG.IDB_PORTFOLIOS_KEY, expect.any(Object));
    });

    it('should not delete the last stock in a portfolio (async)', async () => {
        const portfolio = state.getActivePortfolio();
        expect(portfolio?.portfolioData?.length).toBe(1);

        if (portfolio && portfolio.portfolioData.length === 1) {
            const stockId = portfolio.portfolioData[0].id;

            const deleted = await state.deleteStock(stockId);
            expect(deleted).toBe(false);
            expect(state.getActivePortfolio()?.portfolioData?.length).toBe(1);
        }
    });

    it('should delete a stock if there are multiple (async)', async () => {
        await state.addNewStock();
        const initialLength = state.getActivePortfolio()?.portfolioData?.length || 0;
        expect(initialLength).toBeGreaterThan(1);

        const portfolioBeforeDelete = state.getActivePortfolio();
        if (portfolioBeforeDelete) {
            const stockIdToDelete = portfolioBeforeDelete.portfolioData[0].id;

            const deleted = await state.deleteStock(stockIdToDelete);
            expect(deleted).toBe(true);

            const portfolioAfterDelete = state.getActivePortfolio();
            expect(portfolioAfterDelete?.portfolioData?.length).toBe(initialLength - 1);
            expect(
                portfolioAfterDelete?.portfolioData?.find((s) => s.id === stockIdToDelete)
            ).toBeUndefined();
        } else {
            throw new Error('Failed to get active portfolio for deletion test');
        }
    });
});