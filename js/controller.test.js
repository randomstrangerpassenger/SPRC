// js/controller.test.js (최종 수정본)
// @ts-check

import { describe, it, expect, vi, beforeEach } from 'vitest'; 
import Decimal from 'decimal.js'; 

// --- 👇 vi.mock 호출 ---
vi.mock('./state.js'); 
vi.mock('./view.js', () => {
  const mockDom = { 
      exchangeRateInput: { value: '1300' }, 
      additionalAmountInput: { value: '1000' },
      additionalAmountUSDInput: { value: '0' },
      portfolioSelector: { value: 'p-default' },
      importFileInput: { click: vi.fn() },
  };

  return {
      PortfolioView: {
          // --- ⬇️ 핵심 수정: 누락된 mock 함수 모두 추가 ⬇️ ---
          dom: {},
          cacheDomElements: vi.fn(function() {
              Object.assign(this.dom, mockDom);
          }),

          renderPortfolioSelector: vi.fn(),
          updateCurrencyModeUI: vi.fn(),
          updateMainModeUI: vi.fn(),
          renderTable: vi.fn(),
          updateStockRowOutputs: vi.fn(),
          displaySectorAnalysis: vi.fn(),
          updateAllTargetRatioInputs: vi.fn(),
          updateCurrentPriceInput: vi.fn(),

          displaySkeleton: vi.fn(),
          displayResults: vi.fn(),
          hideResults: vi.fn(),
          showToast: vi.fn(),
          showConfirm: vi.fn(),
          updateTableHeader: vi.fn(),
          updateRatioSum: vi.fn(),
          cleanup: vi.fn(),

          getDOMElements: vi.fn(function() { return this.dom; }),
          getDOMElement: vi.fn(function(id) { return this.dom[id]; }),
      }
  };
});
vi.mock('./validator.js');
vi.mock('./errorService.js');
vi.mock('./calculator.js'); 

// --- 👇 실제 모듈 import ---
import { PortfolioController } from './controller.js';
import { PortfolioState } from './state.js';
import { PortfolioView } from './view.js';
import { Validator } from './validator.js';
import { ErrorService, ValidationError } from './errorService.js';
import { Calculator } from './calculator.js';

// --- 테스트 스위트 ---
describe('PortfolioController', () => {
  let controller;
  let mockState;
  let mockView;

  beforeEach(async () => { 
    vi.clearAllMocks();
    
    // Calculator 모의 설정
    // @ts-ignore
    vi.mocked(Calculator.calculatePortfolioState).mockReturnValue({
      portfolioData: [],
      currentTotal: new Decimal(0),
      cacheKey: 'mock-key'
    });
    // @ts-ignore
    vi.mocked(Calculator.calculateSectorAnalysis).mockReturnValue([]);
    
    // 1. 모의 인스턴스 생성
    // @ts-ignore
    mockState = new PortfolioState();
    // @ts-ignore
    mockView = PortfolioView;

    // 2. 생성자 호출 함수 반환값 설정
    // @ts-ignore
    mockState.ensureInitialized.mockResolvedValue(undefined); 
    
    // @ts-ignore
    mockState.getActivePortfolio.mockReturnValue({
      id: 'p-default',
      name: '기본 포트폴리오',
      settings: {
        mainMode: 'add',
        currentCurrency: 'krw',
        exchangeRate: 1300,
        additionalInvestment: 0
      },
      portfolioData: []
    });
    // @ts-ignore
    mockState.getAllPortfolios.mockReturnValue({
      'p-default': { id: 'p-default', name: '기본 포트폴리오', settings: {}, portfolioData: [] }
    });
    // @ts-ignore
    mockState.getRatioSum.mockReturnValue(new Decimal(0));
    
    // 3. 컨트롤러 생성자에 주입
    controller = new PortfolioController(mockState, mockView);
    await controller.initialize(); // Promise를 반환하는 initialize 호출

    // 4. 생성자 호출 기록 초기화
    vi.clearAllMocks();

    // 내부 헬퍼 모의 처리
    // @ts-ignore
    controller.calculateRatioSumSync = vi.fn().mockReturnValue(new Decimal(100));
    // @ts-ignore
    controller._getInputsForCalculation = vi.fn().mockResolvedValue({
      settings: { mainMode: 'add', currentCurrency: 'krw' },
      portfolioData: [],
      calculatedPortfolioData: [],
      additionalInvestment: new Decimal(0)
    });
    // @ts-ignore
    controller._runRebalancingLogic = vi.fn().mockResolvedValue({ results: [], summary: {} });
    // @ts-ignore
    controller._updateResultsView = vi.fn().mockResolvedValue(undefined);
  });
  
  // --- handleCalculate 테스트 (로직 검증) ---

  it('handleCalculate: 유효성 검사 실패 시 ErrorService를 호출해야 한다', async () => {
    const validationError = new ValidationError('- 테스트 오류');
    // @ts-ignore
    vi.mocked(Validator.validateForCalculation).mockReturnValue([{ field: null, stockId: null, message: '- 테스트 오류' }]);

    await controller.handleCalculate();

    expect(Validator.validateForCalculation).toHaveBeenCalledOnce();
    expect(controller.view.hideResults).toHaveBeenCalledOnce();
    expect(ErrorService.handle).toHaveBeenCalledWith(expect.any(ValidationError), 'handleCalculate - Validation'); 
  });

  it('handleCalculate: 유효성 검사 성공 시 계산 및 뷰 업데이트를 호출해야 한다', async () => {
    const mockResults = { results: [ { id: '1' } ], summary: { total: 100 } };

    // @ts-ignore
    vi.mocked(Validator.validateForCalculation).mockReturnValue([]);
    // @ts-ignore
    vi.mocked(Calculator.calculateAddRebalancing).mockReturnValue(mockResults); 
    // @ts-ignore
    vi.mocked(Calculator.calculateSellRebalancing).mockReturnValue(mockResults);
    
    // @ts-ignore
    controller.calculateRatioSumSync.mockReturnValue(new Decimal(100)); 

    await controller.handleCalculate();

    expect(Validator.validateForCalculation).toHaveBeenCalledOnce();
    expect(Calculator.calculateAddRebalancing).toHaveBeenCalled();
    expect(controller.view.displayResults).toHaveBeenCalled();
    expect(controller.view.hideResults).not.toHaveBeenCalled();
    expect(ErrorService.handle).not.toHaveBeenCalled();
  });
});