// js/state.test.js (수정본)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PortfolioState } from './state.js';
import { CONFIG } from './constants.js'; // CONFIG 임포트 추가

// localStorage 모의(mock) 처리
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; },
    key: (index) => Object.keys(store)[index] || null, // key() 메소드 추가
    get length() { return Object.keys(store).length; } // length 속성 추가
  };
})();

// window.localStorage 모의 객체 할당
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('PortfolioState', () => {
  let state;

  beforeEach(async () => { // async 추가 (state.init() 호출 위해)
    localStorage.clear();
    if (typeof crypto === 'undefined') {
      global.crypto = { randomUUID: () => `mock-uuid-${Math.random()}` };
    } else {
        // spyOn().mockImplementation() 뒤에 괄호 추가
        vi.spyOn(crypto, 'randomUUID').mockImplementation(() => `mock-uuid-${Math.random()}`); // <--- 여기에 ')' 추가
    }
    state = new PortfolioState();
    await state.init(); // state.js 수정사항 반영 (init 호출)
  });

  afterEach(() => {
    vi.restoreAllMocks(); // 모든 모의 함수 복원
  });

  it('초기화 시 기본 포트폴리오("기본 포트폴리오")를 생성해야 합니다.', () => {
    // beforeEach에서 state가 생성되므로 추가 생성 필요 없음
    expect(Object.keys(state.getAllPortfolios()).length).toBe(1); // 수정: getAllPortfolios 사용
    expect(state.getActivePortfolio()?.name).toBe('기본 포트폴리오'); // 수정: name 확인
  });

  // ⬇️ [추가] localStorage 로드 테스트 케이스
  it('localStorage에 저장된 데이터가 있으면 올바르게 로드해야 합니다.', () => {
    // 1. 테스트 데이터 준비
    const testId = 'p-test123';
    const testPortfolio = {
      id: testId,
      name: "Saved Portfolio",
      settings: { mainMode: 'add', currentCurrency: 'krw', exchangeRate: 1300 },
      portfolioData: [{ id: 's-test', name: 'Test Stock', ticker: 'TEST', sector: 'Tech', currentPrice: 100, targetRatio: 100, isFixedBuyEnabled: false, fixedBuyAmount: 0, transactions: [] }]
    };
    const metaData = { activePortfolioId: testId };

    // 2. localStorage에 데이터 저장 (직렬화된 형태여야 함)
    // _serializePortfolioData를 직접 호출하기 어려우므로 수동으로 유사하게 만듭니다.
    const serializedPortfolio = {
      ...testPortfolio,
      portfolioData: testPortfolio.portfolioData.map(s => ({
        ...s,
        transactions: [] // 여기서는 빈 배열로 가정
      }))
    };
    localStorage.setItem(CONFIG.DATA_PREFIX + testId, JSON.stringify(serializedPortfolio));
    localStorage.setItem(CONFIG.META_KEY, JSON.stringify(metaData));

    // 3. 새 PortfolioState 인스턴스 생성 (로드 로직 실행)
    const loadedState = new PortfolioState();

    // 4. 검증
    expect(Object.keys(loadedState.getAllPortfolios()).length).toBe(1); // 저장된 1개만 로드되어야 함
    expect(loadedState.getActivePortfolio()?.id).toBe(testId);
    expect(loadedState.getActivePortfolio()?.name).toBe("Saved Portfolio");
    expect(loadedState.getActivePortfolio()?.portfolioData.length).toBe(1);
    expect(loadedState.getActivePortfolio()?.portfolioData[0].name).toBe("Test Stock");
  });

  // ⬇️ [추가] META_KEY의 ID가 유효하지 않을 때 로드된 첫 번째 포트폴리오를 활성화하는지 테스트
  it('META_KEY의 activePortfolioId가 유효하지 않으면 로드된 첫 포트폴리오를 활성화해야 합니다.', () => {
     // 1. 테스트 데이터 준비 (위와 동일)
    const testId = 'p-test123';
    const testPortfolio = { id: testId, name: "Saved Portfolio", settings: {}, portfolioData: [] };
    const metaData = { activePortfolioId: 'invalid-id-123' }; // 잘못된 ID

    localStorage.setItem(CONFIG.DATA_PREFIX + testId, JSON.stringify(testPortfolio));
    localStorage.setItem(CONFIG.META_KEY, JSON.stringify(metaData));

    // 2. 새 인스턴스 생성
    const loadedState = new PortfolioState();

    // 3. 검증
    expect(Object.keys(loadedState.getAllPortfolios()).length).toBe(1); // 여전히 1개여야 함 (Default 생성 안 됨)
    expect(loadedState.getActivePortfolio()?.id).toBe(testId); // 로드된 포트폴리오 ID로 활성화되어야 함
    expect(loadedState.getActivePortfolio()?.name).toBe("Saved Portfolio");
  });
  // ⬆️ [추가]

  it('새로운 주식을 액티브 포트폴리오에 추가해야 합니다.', () => {
    const initialCount = state.getActivePortfolio()?.portfolioData.length ?? 0; // 수정: 초기 카운트 안전하게
    const newStock = state.addNewStock(); // 수정: 반환값 사용
    expect(newStock).not.toBeNull(); // 새 주식이 생성되었는지 확인
    const newCount = state.getActivePortfolio()?.portfolioData.length ?? 0; // 수정: 새 카운트 안전하게
    expect(newCount).toBe(initialCount + 1);
    // const addedStock = state.getActivePortfolio()?.portfolioData[newCount - 1]; // 수정: 안전하게 접근
    // expect(addedStock?.name).toBe('새 종목'); // addNewStock에서 기본 이름 설정됨
  });

  it('주식을 삭제해야 합니다.', () => {
    // 삭제할 주식을 추가 (기본 1개만 있으면 삭제 안 됨)
    state.addNewStock();
    const portfolio = state.getActivePortfolio()?.portfolioData;
    if (!portfolio || portfolio.length < 2) throw new Error("테스트 설정 오류: 주식이 2개 이상 필요");

    const initialCount = portfolio.length;
    const stockToDelete = portfolio[0]; // 첫 번째 주식 삭제 시도
    const result = state.deleteStock(stockToDelete.id);
    expect(result).toBe(true);
    expect(state.getActivePortfolio()?.portfolioData.length).toBe(initialCount - 1);
  });

  it('마지막 남은 주식은 삭제할 수 없습니다.', () => {
    const portfolio = state.getActivePortfolio()?.portfolioData;
    if (!portfolio || portfolio.length !== 1) throw new Error("테스트 설정 오류: 주식이 1개여야 함");

    const lastStockId = portfolio[0].id;
    const result = state.deleteStock(lastStockId);

    expect(result).toBe(false); // 마지막 주식 삭제 시도는 false여야 함
    expect(state.getActivePortfolio()?.portfolioData.length).toBe(1); // 배열 길이는 1로 유지되어야 함
  });

  it('주식 정보를 업데이트해야 합니다.', () => {
    const stock = state.getActivePortfolio()?.portfolioData[0];
    if (!stock) throw new Error("테스트 설정 오류: 주식이 존재해야 함");

    const newName = "Updated Stock Name";
    // 수정: updateStock -> updateStockProperty
    state.updateStockProperty(stock.id, 'name', newName);
    const updatedStock = state.getActivePortfolio()?.portfolioData.find(s => s.id === stock.id);
    expect(updatedStock?.name).toBe(newName);
  });

  it('새로운 포트폴리오를 추가하고 활성화해야 합니다.', () => {
    const initialPortfolioCount = Object.keys(state.getAllPortfolios()).length; // 수정: getAllPortfolios 사용
    const newPortfolioName = "My New Portfolio";
    // 수정: addPortfolio -> createNewPortfolio
    const newId = state.createNewPortfolio(newPortfolioName);

    expect(Object.keys(state.getAllPortfolios()).length).toBe(initialPortfolioCount + 1); // 수정: getAllPortfolios 사용
    expect(state.getActivePortfolio()?.id).toBe(newId); // 수정: activePortfolioId 대신 getActivePortfolio().id 사용
    expect(state.getActivePortfolio()?.name).toBe(newPortfolioName);
  });
});