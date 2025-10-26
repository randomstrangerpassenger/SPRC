// js/state.test.js

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PortfolioState } from './state.js';
import { CONFIG } from './constants.js';
import Decimal from 'decimal.js';

// Mock debounce to execute immediately
vi.mock('./utils.js', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        debounce: (fn) => {
            return function(...args) {
                return fn.apply(this, args);
            };
        },
    };
});

// localStorage mock
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; },
    key: (index) => Object.keys(store)[index] || null,
    get length() { return Object.keys(store).length; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('PortfolioState', () => {
  let state;

  beforeEach(async () => {
    localStorage.clear();
    if (typeof crypto === 'undefined') {
      global.crypto = { randomUUID: () => `mock-uuid-${Math.random()}` };
    } else if (crypto && crypto.randomUUID) {
        vi.spyOn(crypto, 'randomUUID').mockImplementation(() => `mock-uuid-${Math.random()}`);
    }
    state = new PortfolioState();
    await state.ensureInitialized();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create default portfolio on initialization', () => {
    expect(Object.keys(state.getAllPortfolios()).length).toBe(1);
    expect(state.getActivePortfolio()?.name).toBe('기본 포트폴리오');
    expect(state.getActivePortfolio()?.portfolioData?.length).toBe(1);
    expect(state.getActivePortfolio()?.portfolioData?.[0]?.name).toBe('새 종목');
  });

  it('should load portfolio from localStorage', async () => {
    localStorage.clear();

    const testId = 'p-test123';
    const testPortfolio = {
      id: testId,
      name: "Saved Portfolio",
      settings: { mainMode: 'add', currentCurrency: 'krw', exchangeRate: 1300 },
      portfolioData: [{ id: 's-test', name: 'Test Stock', ticker: 'TEST', sector: 'Tech', currentPrice: 100, targetRatio: 100, isFixedBuyEnabled: false, fixedBuyAmount: 0, transactions: [] }]
    };
    const metaData = { activePortfolioId: testId };

    const serializedPortfolio = {
      ...testPortfolio,
      portfolioData: testPortfolio.portfolioData.map(s => ({
        ...s,
        transactions: []
      }))
    };
    localStorage.setItem(CONFIG.DATA_PREFIX + testId, JSON.stringify(serializedPortfolio));
    localStorage.setItem(CONFIG.META_KEY, JSON.stringify(metaData));

    const loadedState = new PortfolioState();
    await loadedState.ensureInitialized();

    expect(Object.keys(loadedState.getAllPortfolios()).length).toBe(1);
    expect(loadedState.getActivePortfolio()?.id).toBe(testId);
    expect(loadedState.getActivePortfolio()?.name).toBe("Saved Portfolio");
    expect(loadedState.getActivePortfolio()?.portfolioData.length).toBe(1);
    expect(loadedState.getActivePortfolio()?.portfolioData[0].name).toBe("Test Stock");
  });

  it('should activate first portfolio if activePortfolioId is invalid', async () => {
    localStorage.clear();

    const testId = 'p-test123';
    const testPortfolio = { id: testId, name: "Saved Portfolio", settings: {}, portfolioData: [] };
    const metaData = { activePortfolioId: 'invalid-id-123' };

    localStorage.setItem(CONFIG.DATA_PREFIX + testId, JSON.stringify(testPortfolio));
    localStorage.setItem(CONFIG.META_KEY, JSON.stringify(metaData));

    const loadedState = new PortfolioState();
    await loadedState.ensureInitialized();

    expect(Object.keys(loadedState.getAllPortfolios()).length).toBe(1);
    expect(loadedState.getActivePortfolio()?.id).toBe(testId);
    expect(loadedState.getActivePortfolio()?.name).toBe("Saved Portfolio");
  });

  it('should add new stock to active portfolio', () => {
    const initialCount = state.getActivePortfolio()?.portfolioData.length ?? 0;
    const newStock = state.addNewStock();
    expect(newStock).not.toBeNull();
    const newCount = state.getActivePortfolio()?.portfolioData.length ?? 0;
    expect(newCount).toBe(initialCount + 1);
  });

  it('should delete stock', () => {
    state.addNewStock();
    const portfolio = state.getActivePortfolio()?.portfolioData;
    expect(portfolio?.length).toBeGreaterThanOrEqual(2);

    const initialCount = portfolio.length;
    const stockToDelete = portfolio[0];
    const result = state.deleteStock(stockToDelete.id);
    expect(result).toBe(true);
    expect(state.getActivePortfolio()?.portfolioData.length).toBe(initialCount - 1);
  });

  it('should not delete last stock', () => {
    const portfolio = state.getActivePortfolio()?.portfolioData;
    expect(portfolio?.length).toBe(1);

    const lastStockId = portfolio[0].id;
    const result = state.deleteStock(lastStockId);

    expect(result).toBe(false);
    expect(state.getActivePortfolio()?.portfolioData.length).toBe(1);
  });

  it('should update stock property', () => {
    const stock = state.getActivePortfolio()?.portfolioData[0];
    expect(stock).toBeDefined();

    const newName = "Updated Stock Name";
    state.updateStockProperty(stock.id, 'name', newName);
    const updatedStock = state.getActivePortfolio()?.portfolioData.find(s => s.id === stock.id);
    expect(updatedStock?.name).toBe(newName);
  });

  it('should create and activate new portfolio', async () => {
    const initialPortfolioCount = Object.keys(state.getAllPortfolios()).length;
    const newPortfolioName = "My New Portfolio";
    const newId = state.createNewPortfolio(newPortfolioName);

    const newCount = Object.keys(state.getAllPortfolios()).length;

    expect(newCount).toBe(initialPortfolioCount + 1);
    expect(state.getActivePortfolio()?.id).toBe(newId);
    expect(state.getActivePortfolio()?.name).toBe(newPortfolioName);
  });
});
