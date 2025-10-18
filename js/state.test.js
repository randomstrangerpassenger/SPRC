import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PortfolioState } from './state.js';

// localStorage 모의(mock) 처리
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('PortfolioState', () => {
  beforeEach(() => {
    localStorage.clear();
    // crypto.randomUUID 모의 처리
    vi.spyOn(crypto, 'randomUUID').mockImplementation(() => `mock-uuid-${Math.random()}`);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('초기화 시 기본 포트폴리오를 생성해야 합니다.', () => {
    const state = new PortfolioState();
    expect(Object.keys(state.portfolios).length).toBe(1);
    expect(state.activePortfolioId).not.toBeNull();
    const activePortfolio = state.getActivePortfolio();
    expect(activePortfolio.name).toBe('기본 포트폴리오');
  });

  it('새로운 주식을 액티브 포트폴리오에 추가해야 합니다.', () => {
    const state = new PortfolioState();
    const initialCount = state.getActivePortfolio().portfolioData.length;
    state.addNewStock();
    const newCount = state.getActivePortfolio().portfolioData.length;
    expect(newCount).toBe(initialCount + 1);
    const newStock = state.getActivePortfolio().portfolioData[newCount - 1];
    expect(newStock.name).toBe('새 종목');
  });

  it('주식을 삭제해야 합니다.', () => {
    const state = new PortfolioState();
    const portfolio = state.getActivePortfolio().portfolioData;
    const initialCount = portfolio.length;
    const stockToDelete = portfolio[0];
    const result = state.deleteStock(stockToDelete.id);
    expect(result).toBe(true);
    expect(state.getActivePortfolio().portfolioData.length).toBe(initialCount - 1);
  });

  it('마지막 남은 주식은 삭제할 수 없습니다.', () => {
    const state = new PortfolioState();
    
    // 무한 루프를 피하기 위해 루프 조건문에서 항상 최신 데이터를 가져옵니다.
    while (state.getActivePortfolio().portfolioData.length > 1) {
      const stockToDeleteId = state.getActivePortfolio().portfolioData[0].id;
      state.deleteStock(stockToDeleteId);
    }
    
    const lastStockId = state.getActivePortfolio().portfolioData[0].id;
    const result = state.deleteStock(lastStockId);
    
    expect(result).toBe(false); // 마지막 주식 삭제 시도는 false여야 함
    expect(state.getActivePortfolio().portfolioData.length).toBe(1); // 배열 길이는 1로 유지되어야 함
  });
  
  it('주식 정보를 업데이트해야 합니다.', () => {
    const state = new PortfolioState();
    const stock = state.getActivePortfolio().portfolioData[0];
    const newName = "Updated Stock Name";
    state.updateStock(stock.id, 'name', newName);
    const updatedStock = state.getActivePortfolio().portfolioData.find(s => s.id === stock.id);
    expect(updatedStock.name).toBe(newName);
  });

  it('새로운 포트폴리오를 추가하고 활성화해야 합니다.', () => {
    const state = new PortfolioState();
    const initialPortfolioCount = Object.keys(state.portfolios).length;
    const newPortfolioName = "My New Portfolio";
    const { id } = state.addPortfolio(newPortfolioName);
    
    expect(Object.keys(state.portfolios).length).toBe(initialPortfolioCount + 1);
    expect(state.activePortfolioId).toBe(id);
    expect(state.getActivePortfolio().name).toBe(newPortfolioName);
  });
});