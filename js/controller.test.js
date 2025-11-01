// js/controller.test.js (Refactored for Pub/Sub, Async State, testUtils, and Mock Fixes)
// @ts-check

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Decimal from 'decimal.js';

// --- ▼▼▼ 모의(Mock) 설정 ▼▼▼ ---
vi.mock('./state.js');
vi.mock('./view.js', () => ({
  PortfolioView: {
    // Pub/Sub
    on: vi.fn(),
    emit: vi.fn(),
    // DOM 조작
    cacheDomElements: vi.fn(),
    renderPortfolioSelector: vi.fn(),
    updateCurrencyModeUI: vi.fn(),
    updateMainModeUI: vi.fn(),
    renderTable: vi.fn(),
    updateVirtualTableData: vi.fn(), // [수정] updateUIState -> updateVirtualTableData
    updateAllTargetRatioInputs: vi.fn(),
    updateCurrentPriceInput: vi.fn(),
    displaySkeleton: vi.fn(),
    displayResults: vi.fn(),
    hideResults: vi.fn(),
    updateTableHeader: vi.fn(),
    updateRatioSum: vi.fn(),
    displaySectorAnalysis: vi.fn(),
    // UI 피드백
    showToast: vi.fn(),
    showConfirm: vi.fn(async () => true), 
    showPrompt: vi.fn(async () => 'Test'), 
    announce: vi.fn(),
    focusOnNewStock: vi.fn(),
    // 모달
    openTransactionModal: vi.fn(),
    closeTransactionModal: vi.fn(),
    renderTransactionList: vi.fn(),
    // 기타
    toggleInputValidation: vi.fn(),
    toggleFetchButton: vi.fn(),
    destroyChart: vi.fn(),
    // DOM 요소 (최소한의 모의)
    dom: {
        additionalAmountInput: { value: '0' },
        additionalAmountUSDInput: { value: '0' },
        exchangeRateInput: { value: '1300' },
        importFileInput: { click: vi.fn() },
    }
  }
}));
vi.mock('./validator.js');
vi.mock('./errorService.js');
vi.mock('./calculator.js');

// ▼▼▼ [수정] 전략 클래스 모의(Mock) 방식 변경 ▼▼▼
// 1. 스파이를 모듈 최상단 스코프에 정의
const mockAddCalculate = vi.fn(() => ({ results: [] }));
const mockSellCalculate = vi.fn(() => ({ results: [] }));

// 2. vi.mock 팩토리에서 이 스파이들을 사용하는 '클래스'를 반환
vi.mock('./calculationStrategies.js', () => ({
    AddRebalanceStrategy: class { // 'new'로 호출 가능한 클래스
        constructor(...args) {
            // (선택) 생성자 인수 로깅/테스트
        }
        calculate = mockAddCalculate; // [중요] 인스턴스 메서드로 모의 함수 할당
    },
    SellRebalanceStrategy: class { // 'new'로 호출 가능한 클래스
        constructor(...args) {
            // ...
        }
        calculate = mockSellCalculate;
    },
}));
// ▲▲▲ [수정] ▲▲▲

vi.mock('./apiService.js', () => ({
    apiService: {
        fetchAllStockPrices: vi.fn()
    }
}));
vi.mock('./i18n.js', () => ({
    t: vi.fn((key) => key), // 단순 키 반환
}));
vi.mock('dompurify', () => ({
    default: {
        sanitize: vi.fn((input) => input), 
    }
}));


// --- ▼▼▼ 실제 모듈 및 모의 객체 임포트 ▼▼▼ ---
import { PortfolioController } from './controller.js';
import { PortfolioState } from './state.js';
import { PortfolioView } from './view.js';
import { Validator } from './validator.js';
import { ErrorService, ValidationError } from './errorService.js';
import { Calculator } from './calculator.js';
// [중요] 모의(mock)된 모듈을 임포트 (이때 AddRebalanceStrategy는 위에서 정의한 mock class가 됨)
import { AddRebalanceStrategy, SellRebalanceStrategy } from './calculationStrategies.js'; 
import { apiService } from './apiService.js';
import { t } from './i18n.js';
import { MOCK_PORTFOLIO_1, MOCK_STOCK_1 } from './testUtils.js';


// --- 테스트 스위트 ---
describe('PortfolioController', () => {
  let controller;
  let mockState;
  let mockView;
  let mockCalculator;
  let mockValidator;
  
  let mockDefaultPortfolio;
  
  beforeEach(async () => {
    vi.clearAllMocks(); // [수정] 이 clearAllMocks가 모의된 생성자도 초기화합니다.

    // MOCK_PORTFOLIO_1의 깊은 복사본을 만들어 테스트에 사용
    mockDefaultPortfolio = JSON.parse(JSON.stringify(MOCK_PORTFOLIO_1));
    mockDefaultPortfolio.portfolioData.forEach(stock => {
        stock.targetRatio = new Decimal(stock.targetRatio);
        stock.currentPrice = new Decimal(stock.currentPrice);
        stock.fixedBuyAmount = new Decimal(stock.fixedBuyAmount);
        stock.calculated.currentAmount = new Decimal(stock.calculated.currentAmount);
    });

    // 1. 모의 인스턴스 할당
    mockState = new PortfolioState();
    mockView = PortfolioView;
    mockCalculator = Calculator;
    mockValidator = Validator;

    // 2. State 모의 메서드 설정 (Async)
    vi.mocked(mockState.ensureInitialized).mockResolvedValue(undefined);
    vi.mocked(mockState.getActivePortfolio).mockReturnValue(mockDefaultPortfolio);
    vi.mocked(mockState.getAllPortfolios).mockReturnValue({ [mockDefaultPortfolio.id]: mockDefaultPortfolio });
    vi.mocked(mockState.getStockById).mockReturnValue(mockDefaultPortfolio.portfolioData[0]);
    vi.mocked(mockState.getTransactions).mockReturnValue([]);
    // ... (state 수정 메서드 모의) ...
    vi.mocked(mockState.createNewPortfolio).mockResolvedValue(mockDefaultPortfolio);
    vi.mocked(mockState.renamePortfolio).mockResolvedValue(undefined);
    vi.mocked(mockState.deletePortfolio).mockResolvedValue(true);
    vi.mocked(mockState.setActivePortfolioId).mockResolvedValue(undefined);
    vi.mocked(mockState.addNewStock).mockResolvedValue(mockDefaultPortfolio.portfolioData[0]);
    vi.mocked(mockState.deleteStock).mockResolvedValue(true);
    vi.mocked(mockState.resetData).mockResolvedValue(undefined);
    vi.mocked(mockState.normalizeRatios).mockReturnValue(true);
    vi.mocked(mockState.updateStockProperty).mockReturnValue(undefined);
    vi.mocked(mockState.addTransaction).mockResolvedValue(true);
    vi.mocked(mockState.deleteTransaction).mockResolvedValue(true);
    vi.mocked(mockState.updatePortfolioSettings).mockResolvedValue(undefined);
    vi.mocked(mockState.importData).mockResolvedValue(undefined);

    // 3. Calculator 모의 설정
    vi.mocked(mockCalculator.calculatePortfolioState).mockReturnValue({
      portfolioData: mockDefaultPortfolio.portfolioData,
      currentTotal: new Decimal(5500), 
      cacheKey: 'mock-key'
    });
    vi.mocked(mockCalculator.calculateSectorAnalysis).mockReturnValue([]);
    
    // ▼▼▼▼▼ [수정된 부분] ▼▼▼▼▼
    // 'mockReturnValue' 대신 'mockImplementation'을 사용하여
    // Calculator.calculateRebalancing이 strategy.calculate()를 호출하도록 수정
    vi.mocked(mockCalculator.calculateRebalancing).mockImplementation((strategy) => {
      // 전달받은 strategy의 calculate()를 수동으로 호출해줍니다.
      return strategy.calculate();
    });
    // ▲▲▲▲▲ [수정 완료] ▲▲▲▲▲

    // 4. [삭제] 오류를 유발하는 mockClear 블록 삭제

    // 5. 컨트롤러 생성 (이때 bindControllerEvents가 호출됨)
    controller = new PortfolioController(mockState, mockView);
    await controller.initialize();
  });

  it('should subscribe to all view events on initialization', () => {
      expect(mockView.on).toHaveBeenCalledWith('newPortfolioClicked', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('calculateClicked', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('portfolioBodyChanged', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('transactionDeleteClicked', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('fetchAllPricesClicked', expect.any(Function));
  });

  it('handleCalculate: 유효성 검사 실패 시 ErrorService를 호출해야 한다', async () => {
    vi.mocked(mockValidator.validateForCalculation).mockReturnValue([{ field: null, stockId: null, message: '- 테스트 오류' }]);

    await controller.handleCalculate();

    expect(mockValidator.validateForCalculation).toHaveBeenCalledOnce();
    expect(mockView.hideResults).toHaveBeenCalledOnce();
    expect(ErrorService.handle).toHaveBeenCalledWith(expect.any(ValidationError), 'handleCalculate - Validation');
    expect(mockCalculator.calculateRebalancing).not.toHaveBeenCalled();
  });
  
  it('handleCalculate: 목표 비율 100% 미만 시 확인 창을 띄우고, 취소 시 중단해야 한다', async () => {
     vi.mocked(mockValidator.validateForCalculation).mockReturnValue([]);
     const portfolioWithBadRatio = {
         ...mockDefaultPortfolio,
         portfolioData: [
             {...mockDefaultPortfolio.portfolioData[0], targetRatio: new Decimal(30)}, // 합 30
             {...mockDefaultPortfolio.portfolioData[1], targetRatio: new Decimal(0)}
         ]
     };
     vi.mocked(mockState.getActivePortfolio).mockReturnValue(portfolioWithBadRatio);
     vi.mocked(mockView.showConfirm).mockResolvedValueOnce(false);

     await controller.handleCalculate();
     
     expect(mockView.showConfirm).toHaveBeenCalled(); 
     expect(mockView.hideResults).toHaveBeenCalledOnce(); 
     expect(mockCalculator.calculateRebalancing).not.toHaveBeenCalled(); 
   });

  it('handleCalculate: "add" 모드일 때 AddRebalanceStrategy를 호출해야 한다', async () => {
    vi.mocked(mockValidator.validateForCalculation).mockReturnValue([]);
    // MOCK_PORTFOLIO_1의 합계는 100% (50+50)
    vi.mocked(mockState.getActivePortfolio).mockReturnValue(mockDefaultPortfolio);
    vi.mocked(mockView.showConfirm).mockResolvedValue(true);

    await controller.handleCalculate();

    // ▼▼▼ [수정] 모의 생성자(vi.fn) 대신, 인스턴스의 calculate 메서드(vi.fn)를 검사 ▼▼▼
    expect(mockAddCalculate).toHaveBeenCalledOnce();
    expect(mockSellCalculate).not.toHaveBeenCalled();
    // ▲▲▲ [수정] ▲▲▲
    
    expect(mockCalculator.calculateRebalancing).toHaveBeenCalledOnce();
    // [수정] 'new'로 생성된 실제 클래스 인스턴스를 검사
    expect(mockCalculator.calculateRebalancing).toHaveBeenCalledWith(expect.any(AddRebalanceStrategy)); 
    
    expect(mockView.displayResults).toHaveBeenCalledOnce();
    expect(mockView.showToast).toHaveBeenCalledWith('toast.calculateSuccess', 'success');
  });

  it('handleCalculate: "sell" 모드일 때 SellRebalanceStrategy를 호출해야 한다', async () => {
    vi.mocked(mockValidator.validateForCalculation).mockReturnValue([]);
    vi.mocked(mockState.getActivePortfolio).mockReturnValue({
        ...mockDefaultPortfolio,
        settings: { ...mockDefaultPortfolio.settings, mainMode: 'sell' }
    });
    vi.mocked(mockView.showConfirm).mockResolvedValue(true);

    await controller.handleCalculate();

    // ▼▼▼ [수정] 모의 생성자(vi.fn) 대신, 인스턴스의 calculate 메서드(vi.fn)를 검사 ▼▼▼
    expect(mockSellCalculate).toHaveBeenCalledOnce();
    expect(mockAddCalculate).not.toHaveBeenCalled();
    // ▲▲▲ [수정] ▲▲▲

    expect(mockCalculator.calculateRebalancing).toHaveBeenCalledOnce();
    expect(mockCalculator.calculateRebalancing).toHaveBeenCalledWith(expect.any(SellRebalanceStrategy));
    expect(mockView.displayResults).toHaveBeenCalledOnce();
  });
  
  it('handleFetchAllPrices: API 호출 성공 시 state와 view를 업데이트해야 한다', async () => {
    const mockApiResponse = [
      { id: 's1', ticker: 'AAA', status: 'fulfilled', value: 150 },
      { id: 's2', ticker: 'BBB', status: 'fulfilled', value: 210 }
    ];
    vi.mocked(apiService.fetchAllStockPrices).mockResolvedValue(mockApiResponse);

    await controller.handleFetchAllPrices();

    expect(mockView.toggleFetchButton).toHaveBeenCalledWith(true);
    expect(apiService.fetchAllStockPrices).toHaveBeenCalledWith([{ id: 's1', ticker: 'AAA' }, { id: 's2', ticker: 'BBB' }]);
    expect(mockState.updateStockProperty).toHaveBeenCalledWith('s1', 'currentPrice', 150);
    expect(mockState.updateStockProperty).toHaveBeenCalledWith('s2', 'currentPrice', 210);
    expect(mockView.updateCurrentPriceInput).toHaveBeenCalledWith('s1', '150.00');
    expect(mockView.updateCurrentPriceInput).toHaveBeenCalledWith('s2', '210.00');
    
    // ▼▼▼ [수정] "is not a spy" 오류 수정 ▼▼▼
    // 'controller.updateUIState'가 'view.updateVirtualTableData'를 호출했는지 확인
    expect(mockView.updateVirtualTableData).toHaveBeenCalledOnce(); 
    // ▲▲▲ [수정] ▲▲▲
    
    expect(mockView.showToast).toHaveBeenCalledWith('api.fetchSuccessAll', "success");
    expect(mockView.toggleFetchButton).toHaveBeenCalledWith(false);
  });
  
  it('handleTransactionListClick: 거래 삭제 시 state.deleteTransaction을 호출해야 한다 (async)', async () => {
    vi.mocked(mockView.showConfirm).mockResolvedValue(true);
    
    await controller.handleTransactionListClick('s1', 'tx1');
    
    expect(mockView.showConfirm).toHaveBeenCalledOnce();
    expect(mockState.deleteTransaction).toHaveBeenCalledWith('s1', 'tx1');
    expect(mockView.renderTransactionList).toHaveBeenCalledOnce();
    expect(mockView.showToast).toHaveBeenCalledWith('toast.transactionDeleted', 'success');

    // ▼▼▼ [수정] "is not a spy" 오류 수정 ▼▼▼
    expect(mockView.updateVirtualTableData).toHaveBeenCalledOnce();
    // ▲▲▲ [수정] ▲▲▲
  });
  
  it('handleTransactionListClick: 거래 삭제 취소 시 state를 호출하지 않아야 한다 (async)', async () => {
    vi.mocked(mockView.showConfirm).mockResolvedValue(false);
    
    await controller.handleTransactionListClick('s1', 'tx1');
    
    expect(mockView.showConfirm).toHaveBeenCalledOnce();
    expect(mockState.deleteTransaction).not.toHaveBeenCalled();
    expect(mockView.renderTransactionList).not.toHaveBeenCalled();
    expect(mockView.showToast).not.toHaveBeenCalled();
  });

});