// js/state.test.js (async / idb-keyval / testUtils / Assertion Fix)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PortfolioState } from './state.js';
import { CONFIG } from './constants.js'; 
import Decimal from 'decimal.js';
// ▼▼▼ [신규] testUtils 임포트 ▼▼▼
import { MOCK_PORTFOLIO_1 } from './testUtils.js'; // (MOCK_PORTFOLIO_1은 Decimal 객체를 포함)
// ▲▲▲ [신규] ▲▲▲

// --- ▼▼▼ [신규] idb-keyval 모의(Mock) ▼▼▼ ---
vi.mock('idb-keyval', () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
}));
// --- ▲▲▲ [신규] ▲▲▲ ---

// --- i18n 모의(Mock) ---
vi.mock('./i18n.js', () => ({
  t: vi.fn((key) => {
    if (key === 'defaults.defaultPortfolioName') return '기본 포트폴리오';
    if (key === 'defaults.newStock') return '새 종목';
    if (key === 'defaults.uncategorized') return '미분류';
    return key;
  }),
}));
// --- ▲▲▲ ---

// --- ▼▼▼ [신규] 모의 객체 임포트 ▼▼▼ ---
import { get, set, del } from 'idb-keyval';
// --- ▲▲▲ [신규] ▲▲▲ ---

// [신규] DOMPurify 모의
vi.mock('dompurify', () => ({
    default: {
        sanitize: vi.fn((input) => input), // 소독 함수를 그대로 반환하도록 모의
    }
}));

// ▼▼▼▼▼ [추가된 부분] ▼▼▼▼▼
// ErrorService가 View에 의존하여 발생하는 순환 참조 오류를 방지하기 위해 모의 처리
vi.mock('./errorService.js', () => ({
  ErrorService: {
    handle: vi.fn(), // handle 함수를 모의
  },
  ValidationError: class extends Error {} // ValidationError 클래스도 모의
}));
// ▲▲▲▲▲ [추가된 부분] ▲▲▲▲▲


describe('PortfolioState (Async)', () => {
  let state;
  let mockGet;
  let mockSet;
  let mockDel;
  // ▼▼▼ [추가된 부분] ▼▼▼
  let mockErrorService; 
  // ▲▲▲ [추가된 부분] ▲▲▲

  beforeEach(async () => { 
    // 모의 함수 초기화
    vi.clearAllMocks();
    
    // ▼▼▼ [수정] idb-keyval 모의 함수 할당 ▼▼▼
    mockGet = vi.mocked(get);
    mockSet = vi.mocked(set);
    mockDel = vi.mocked(del);
    // mockErrorService = vi.mocked(ErrorService); // ErrorService는 임포트하지 않으므로 이 줄은 필요 없음
    
    // 기본적으로 비어있는 DB 시뮬레이션
    mockGet.mockResolvedValue(null); 
    // ▲▲▲ [수정] ▲▲▲

    // Create a new state instance for each test
    state = new PortfolioState();
    await state.ensureInitialized(); // Wait for initialization
  });

   afterEach(() => {
     // ...
   });

  it('should create default portfolio on initialization if none exists', async () => { 
    // ensureInitialized was called in beforeEach
    expect(Object.keys(state.getAllPortfolios()).length).toBe(1);
    const activePortfolio = state.getActivePortfolio();
    expect(activePortfolio?.id).toBeDefined();
    expect(activePortfolio?.name).toBe('기본 포트폴리오'); 
    expect(activePortfolio?.portfolioData?.length).toBe(1);
    expect(activePortfolio?.portfolioData?.[0]?.name).toBe('새 종목');
    
    // ▼▼▼ [수정] _initialize는 resetData(false)를 호출하므로, set은 호출되지 않아야 합니다. ▼▼▼
    // (resetData(true)가 호출될 때만 set이 호출됨)
    expect(mockSet).not.toHaveBeenCalled();
    // ▲▲▲ [수정] ▲▲▲
  });

   it('should load existing data from IndexedDB on initialization', async () => {
     // ▼▼▼ [수정] testUtils에서 가져온 모의 데이터는 Decimal 객체를 포함하고 있음
     // _validateAndUpgradeData는 숫자형 원시값을 기대하므로, 테스트용 원시 데이터 생성
     const rawStockData = {
         id: 's-test', name: 'Test Stock', ticker: 'TEST', sector: 'Tech',
         targetRatio: 100, currentPrice: 50,
         isFixedBuyEnabled: false, fixedBuyAmount: 0, 
         transactions: []
     };
     const testData = {
       meta: { activePortfolioId: 'p-test', version: CONFIG.DATA_VERSION },
       portfolios: {
         'p-test': {
             id: 'p-test', name: 'Test Portfolio',
             settings: { mainMode: 'sell', currentCurrency: 'usd', exchangeRate: 1200 },
             portfolioData: [rawStockData] // 원시 데이터(number) 사용
            }
       }
     };
     // ▲▲▲ [수정] ▲▲▲
     
     // ▼▼▼ [수정] idb-keyval (get) 모의 설정 ▼▼▼
     mockGet.mockImplementation(async (key) => {
        if (key === CONFIG.IDB_META_KEY) return testData.meta;
        if (key === CONFIG.IDB_PORTFOLIOS_KEY) return testData.portfolios;
        return null;
     });
     // ▲▲▲ [수정] ▲▲▲

     const newState = new PortfolioState(); // Create new instance to test loading
     await newState.ensureInitialized(); // Initialize

     // ▼▼▼ [수정] Decimal 객체로 로드되었는지 확인 ▼▼▼
     expect(Object.keys(newState.getAllPortfolios()).length).toBe(1);
     const loadedPortfolio = newState.getActivePortfolio();
     
     expect(loadedPortfolio?.id).toBe('p-test');
     expect(loadedPortfolio?.name).toBe('Test Portfolio');
     expect(loadedPortfolio?.settings.mainMode).toBe('sell');
     expect(loadedPortfolio?.portfolioData?.[0]?.name).toBe('Test Stock');
     // state.js가 number를 Decimal 객체로 변환하는지 확인
     expect(loadedPortfolio?.portfolioData?.[0]?.targetRatio).toBeInstanceOf(Decimal);
     expect(loadedPortfolio?.portfolioData?.[0]?.targetRatio.toNumber()).toBe(100);
     // ▲▲▲ [수정] ▲▲▲
   });


   it('should add a new stock correctly (async)', async () => {
       const initialLength = state.getActivePortfolio()?.portfolioData?.length || 0;
       
       // ▼▼▼ [수정] await 추가 ▼▼▼
       const newStock = await state.addNewStock(); 
       
       expect(state.getActivePortfolio()?.portfolioData?.length).toBe(initialLength + 1);
       expect(newStock.name).toBe('새 종목'); 
       expect(newStock.targetRatio).toBeInstanceOf(Decimal); // Decimal로 생성되었는지 확인
       expect(newStock.targetRatio.toNumber()).toBe(0);
       
       // saveActivePortfolio -> savePortfolios -> set 호출 확인
       expect(mockSet).toHaveBeenCalledWith(CONFIG.IDB_PORTFOLIOS_KEY, expect.any(Object));
       // ▲▲▲ [수정] ▲▲▲
   });

    it('should not delete the last stock in a portfolio (async)', async () => {
        const portfolio = state.getActivePortfolio();
        expect(portfolio?.portfolioData?.length).toBe(1); 

        if (portfolio && portfolio.portfolioData.length === 1) {
            const stockId = portfolio.portfolioData[0].id;
            
            // ▼▼▼ [수정] await 추가 ▼▼▼
            const deleted = await state.deleteStock(stockId); 
            expect(deleted).toBe(false); // Expect deletion to fail
            expect(state.getActivePortfolio()?.portfolioData?.length).toBe(1);
            // ▲▲▲ [수정] ▲▲▲
        }
    });

    it('should delete a stock if there are multiple (async)', async () => {
        await state.addNewStock(); // Add a second stock (async)
        const initialLength = state.getActivePortfolio()?.portfolioData?.length || 0;
        expect(initialLength).toBeGreaterThan(1);

        const portfolioBeforeDelete = state.getActivePortfolio();
        if (portfolioBeforeDelete) {
            const stockIdToDelete = portfolioBeforeDelete.portfolioData[0].id; 
            
            // ▼▼▼ [수정] await 추가 ▼▼▼
            const deleted = await state.deleteStock(stockIdToDelete);
            expect(deleted).toBe(true); 
            
            const portfolioAfterDelete = state.getActivePortfolio();
            expect(portfolioAfterDelete?.portfolioData?.length).toBe(initialLength - 1); 
            expect(portfolioAfterDelete?.portfolioData?.find(s => s.id === stockIdToDelete)).toBeUndefined();
            // ▲▲▲ [수정] ▲▲▲
        } else {
             throw new Error("Failed to get active portfolio for deletion test");
        }
    });
});