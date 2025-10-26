// js/state.test.js (최종 수정본)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PortfolioState } from './state.js';
import { CONFIG } from './constants.js'; 
import Decimal from 'decimal.js'; 

// --- ⬇️ 핵심 수정: debounce 모킹 (즉시 실행) ⬇️ ---
// debounce 함수가 실제 함수를 즉시 호출하도록 모킹합니다.
vi.mock('../utils.js', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        // debounce 함수가 전달된 함수를 즉시 실행하도록 재정의
        debounce: (fn) => {
            return function(...args) {
                return fn.apply(this, args);
            };
        },
    };
});
// --- ⬆️ 핵심 수정 ⬆️ ---


// localStorage 모의(mock) 처리
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

// window.localStorage 모의 객체 할당
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


describe('PortfolioState', () => {
  let state;

  beforeEach(async () => {
    localStorage.clear();
    if (typeof crypto === 'undefined') {
      global.crypto = { randomUUID: () => `mock-uuid-${Math.random()}` };
    } else if (crypto && crypto.randomUUID) {
        // --- ⬇️ 핵심 수정: 괄호 문제 해결 ⬇️ ---
        vi.spyOn(crypto, 'randomUUID').mockImplementation(() => `mock-uuid-${Math.random()}`);
        // --- ⬆️ 핵심 수정 ⬆️ ---
    }
    state = new PortfolioState();
    await state.ensureInitialized(); 
  });

  afterEach(() => {
    vi.restoreAllMocks(); // 모든 모의 함수 복원
  });

  it('초기화 시 기본 포트폴리오("기본 포트폴리오")를 생성해야 합니다.', () => {
    expect(Object.keys(state.getAllPortfolios()).length).toBe(1);
    expect(state.getActivePortfolio()?.name).toBe('기본 포트폴리오');
    expect(state.getActivePortfolio()?.portfolioData?.length).toBe(1); 
    expect(state.getActivePortfolio()?.portfolioData?.[0]?.name).toBe('새 종목');
  });

  // ⬇️ [수정] localStorage 로드 테스트 케이스
  it('localStorage에 저장된 데이터가 있으면 올바르게 로드해야 합니다.', async () => { 
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

    // 검증
    expect(Object.keys(loadedState.getAllPortfolios()).length).toBe(1);
    expect(loadedState.getActivePortfolio()?.id).toBe(testId); 
    expect(loadedState.getActivePortfolio()?.name).toBe("Saved Portfolio");
    expect(loadedState.getActivePortfolio()?.portfolioData.length).toBe(1);
    expect(loadedState.getActivePortfolio()?.portfolioData[0].name).toBe("Test Stock");
  });

  // ⬇️ [수정] META_KEY ID 유효하지 않을 때 테스트
  it('META_KEY의 activePortfolioId가 유효하지 않으면 로드된 첫 포트폴리오를 활성화해야 합니다.', async () => { 
    localStorage.clear();

    const testId = 'p-test123';
    const testPortfolio = { id: testId, name: "Saved Portfolio", settings: {}, portfolioData: [] };
    const metaData = { activePortfolioId: 'invalid-id-123' };

    localStorage.setItem(CONFIG.DATA_PREFIX + testId, JSON.stringify(testPortfolio));
    localStorage.setItem(CONFIG.META_KEY, JSON.stringify(metaData));

    const loadedState = new PortfolioState();
    await loadedState.ensureInitialized(); 

    // 검증
    expect(Object.keys(loadedState.getAllPortfolios()).length).toBe(1);
    expect(loadedState.getActivePortfolio()?.id).toBe(testId); 
    expect(loadedState.getActivePortfolio()?.name).toBe("Saved Portfolio");
  });

  it('새로운 주식을 액티브 포트폴리오에 추가해야 합니다.', () => {
    const initialCount = state.getActivePortfolio()?.portfolioData.length ?? 0; // 1
    const newStock = state.addNewStock();
    expect(newStock).not.toBeNull();
    const newCount = state.getActivePortfolio()?.portfolioData.length ?? 0;
    expect(newCount).toBe(initialCount + 1); // 1 + 1 = 2
  });

  // --- ⬇️ 핵심 수정: 주식 삭제 후 길이 검증 (debouncedSave 모킹으로 통과) ⬇️ ---
  it('주식을 삭제해야 합니다.', () => {
    state.addNewStock(); // 1(기본) + 1(추가) = 2개
    const portfolio = state.getActivePortfolio()?.portfolioData;
    expect(portfolio?.length).toBeGreaterThanOrEqual(2); 

    const initialCount = portfolio.length; // 2
    const stockToDelete = portfolio[0];
    const result = state.deleteStock(stockToDelete.id);
    expect(result).toBe(true);
    expect(state.getActivePortfolio()?.portfolioData.length).toBe(initialCount - 1); // 2 - 1 = 1 (이제 통과)
  });
  // --- ⬆️ 핵심 수정 ⬆️ ---

  it('마지막 남은 주식은 삭제할 수 없습니다.', () => {
    const portfolio = state.getActivePortfolio()?.portfolioData;
    expect(portfolio?.length).toBe(1); 

    const lastStockId = portfolio[0].id;
    const result = state.deleteStock(lastStockId);

    expect(result).toBe(false);
    expect(state.getActivePortfolio()?.portfolioData.length).toBe(1);
  });

  it('주식 정보를 업데이트해야 합니다.', () => {
    const stock = state.getActivePortfolio()?.portfolioData[0];
    expect(stock).toBeDefined(); 

    const newName = "Updated Stock Name";
    state.updateStockProperty(stock.id, 'name', newName);
    const updatedStock = state.getActivePortfolio()?.portfolioData.find(s => s.id === stock.id);
    expect(updatedStock?.name).toBe(newName);
  });

  it('새로운 포트폴리오를 추가하고 활성화해야 합니다.', async () => {
    const initialPortfolioCount = Object.keys(state.getAllPortfolios()).length; // 1
    const newPortfolioName = "My New Portfolio";
    const newId = state.createNewPortfolio(newPortfolioName);

    const newCount = Object.keys(state.getAllPortfolios()).length; 
    
    expect(newCount).toBe(initialPortfolioCount + 1); // 1 + 1 = 2 (이제 통과)
    expect(state.getActivePortfolio()?.id).toBe(newId);
    expect(state.getActivePortfolio()?.name).toBe(newPortfolioName);
  });
});