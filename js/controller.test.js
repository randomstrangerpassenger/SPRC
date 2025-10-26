// js/controller.test.js (Updated)
// @ts-check

import { describe, it, expect, vi, beforeEach } from 'vitest';
import Decimal from 'decimal.js';

// --- 👇 vi.mock 호출 ---
vi.mock('./state.js');
vi.mock('./view.js', () => {
  const mockClassList = { add: vi.fn(), remove: vi.fn(), toggle: vi.fn(), contains: vi.fn() };
  // --- ⬇️ 핵심 수정: 버튼 등 필요한 요소에 addEventListener Mock 추가 ⬇️ ---
  const mockDom = {
      exchangeRateInput: { value: '1300', addEventListener: vi.fn() }, // Added listener mock
      additionalAmountInput: { value: '1000', addEventListener: vi.fn() }, // Added listener mock
      additionalAmountUSDInput: { value: '0', addEventListener: vi.fn() }, // Added listener mock
      portfolioSelector: { value: 'p-default', addEventListener: vi.fn() }, // Added listener mock
      importFileInput: { click: vi.fn(), value: '', addEventListener: vi.fn() }, // Added listener mock

      portfolioBody: { innerHTML: '', querySelector: vi.fn(), querySelectorAll: vi.fn(() => []), addEventListener: vi.fn() }, // Added listener mock
      resultsSection: { innerHTML: '', classList: mockClassList, scrollIntoView: vi.fn() },
      sectorAnalysisSection: { innerHTML: '', classList: mockClassList },
      chartSection: { classList: mockClassList },
      portfolioChart: {},
      mainModeSelector: [ { value: 'add', checked: true, addEventListener: vi.fn() }, { value: 'sell', checked: false, addEventListener: vi.fn() } ], // Added listener mock
      currencyModeSelector: [ { value: 'krw', checked: true, addEventListener: vi.fn() }, { value: 'usd', checked: false, addEventListener: vi.fn() } ], // Added listener mock
      exchangeRateGroup: { classList: mockClassList },
      usdInputGroup: { classList: mockClassList },
      addInvestmentCard: { classList: mockClassList },
      calculateBtn: { disabled: false, textContent: '', addEventListener: vi.fn() }, // Added listener mock
      darkModeToggle: { addEventListener: vi.fn() }, // Added listener mock
      addNewStockBtn: { addEventListener: vi.fn() }, // Added listener mock
      fetchAllPricesBtn: { disabled: false, textContent: '', setAttribute: vi.fn(), removeAttribute: vi.fn(), addEventListener: vi.fn() }, // Added listener mock
      resetDataBtn: { addEventListener: vi.fn() }, // Added listener mock
      normalizeRatiosBtn: { addEventListener: vi.fn() }, // Added listener mock

      // Data Management Dropdown Mocks
      dataManagementBtn: { addEventListener: vi.fn(), setAttribute: vi.fn(), getAttribute: vi.fn(() => 'false'), focus: vi.fn(), contains: vi.fn(() => false) },
      dataDropdownContent: { classList: mockClassList, querySelectorAll: vi.fn(() => []), addEventListener: vi.fn(), contains: vi.fn(() => false) },
      exportDataBtn: { addEventListener: vi.fn() },
      importDataBtn: { addEventListener: vi.fn() },


      transactionModal: { classList: mockClassList, dataset: {}, removeAttribute: vi.fn(), addEventListener: vi.fn() }, // Added listener mock
      modalStockName: { textContent: '' },
      closeModalBtn: { focus: vi.fn(), addEventListener: vi.fn() }, // Added listener mock
      transactionListBody: { innerHTML: '', closest: vi.fn(), addEventListener: vi.fn() }, // Added listener mock
      newTransactionForm: { reset: vi.fn(), addEventListener: vi.fn() }, // Added listener mock
      txDate: { valueAsDate: new Date() },
      txQuantity: { value: '' },
      txPrice: { value: '' },

      newPortfolioBtn: { addEventListener: vi.fn() }, // Added listener mock
      renamePortfolioBtn: { addEventListener: vi.fn() }, // Added listener mock
      deletePortfolioBtn: { addEventListener: vi.fn() }, // Added listener mock
      portfolioTableHead: { innerHTML: '' },
      ratioValidator: { classList: mockClassList },
      ratioSum: { textContent: '' },

      customModal: { classList: mockClassList, addEventListener: vi.fn() },
      customModalTitle: { textContent: '' },
      customModalMessage: { textContent: '' },
      customModalInput: { value: '', classList: mockClassList, focus: vi.fn() },
      customModalConfirm: { focus: vi.fn(), addEventListener: vi.fn() }, // Added listener mock
      customModalCancel: { addEventListener: vi.fn() }, // Added listener mock

      ariaAnnouncer: { textContent: '', setAttribute: vi.fn() }
  };
  // --- ⬆️ 핵심 수정 완료 ⬆️ ---

  return {
      PortfolioView: {
          dom: {},
          cacheDomElements: vi.fn(function() {
              Object.assign(this.dom, mockDom);
          }),

          // 함수 Mock들... (이전과 동일)
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
          showConfirm: vi.fn(async () => true),
          showPrompt: vi.fn(async () => 'Test'),
          updateTableHeader: vi.fn(),
          updateRatioSum: vi.fn(),
          cleanup: vi.fn(),
          announce: vi.fn(),
          focusOnNewStock: vi.fn(),
          openTransactionModal: vi.fn(),
          closeTransactionModal: vi.fn(), // Added mock
          renderTransactionList: vi.fn(),
          toggleInputValidation: vi.fn(),
          toggleFetchButton: vi.fn(),
          getDOMElements: vi.fn(function() { return this.dom; }),
          getDOMElement: vi.fn(function(id) { return this.dom[id]; }),
      }
  };
});
vi.mock('./validator.js');
vi.mock('./errorService.js');
vi.mock('./calculator.js');
vi.mock('./eventBinder.js', () => ({ // Mock eventBinder to prevent actual binding in test setup
    bindEventListeners: vi.fn()
}));
vi.mock('./i18n.js', () => ({ // Mock i18n
    t: vi.fn((key, replacements) => {
        // Provide simple mock implementations for keys used in controller tests
        if (key === 'aria.resultsLoaded') return 'Calculation results loaded.';
        if (key === 'toast.calculateSuccess') return 'Calculation complete!';
        if (key === 'modal.confirmRatioSumWarnTitle') return 'Confirm Ratios';
        if (key === 'modal.confirmRatioSumWarnMsg') return `Ratio sum is ${replacements?.totalRatio}%. Proceed?`;
        // Add other keys used directly in controller if needed
        return key; // Default fallback
    })
}));


// --- 👇 실제 모듈 import ---
import { PortfolioController } from './controller.js';
import { PortfolioState } from './state.js';
import { PortfolioView } from './view.js';
import { Validator } from './validator.js';
import { ErrorService, ValidationError } from './errorService.js';
import { Calculator } from './calculator.js';
import { bindEventListeners } from './eventBinder.js'; // Import the mocked version
import { t } from './i18n.js'; // Import the mocked version

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

    // 2. State 메서드 반환값 설정
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
      portfolioData: [{ id: 's1', name: 'Stock1', ticker: 'T1', targetRatio: 50, currentPrice: 100, isFixedBuyEnabled: false, fixedBuyAmount: 0, transactions: [], calculated: { currentAmount: new Decimal(1000), quantity: new Decimal(10) } }] // Add sample data for ratio check and calculated.quantity
    });
    // @ts-ignore
    mockState.getAllPortfolios.mockReturnValue({
      'p-default': { id: 'p-default', name: '기본 포트폴리오', settings: {}, portfolioData: [] }
    });
    // getRatioSum is not directly part of state, it's a util or calculated, let's remove direct mock
    // vi.mocked(mockState.getRatioSum).mockReturnValue(new Decimal(50));


    // 3. 컨트롤러 생성자에 주입
    controller = new PortfolioController(mockState, mockView);
    await controller.initialize(); // Initialize 호출

    // 4. initialize 내에서 호출된 Mock들 초기화 (cacheDomElements, bindEventListeners 등)
    vi.clearAllMocks();

    // Re-mock bindEventListeners AFTER controller instance is created if needed,
    // but the initial mock should prevent it from running during setup.
    // If you need to test event binding itself, do it in separate tests.
    // vi.mocked(bindEventListeners).mockClear(); // Already cleared by clearAllMocks

  });

  // --- handleCalculate 테스트 (로직 검증) ---

  it('handleCalculate: 유효성 검사 실패 시 ErrorService를 호출해야 한다', async () => {
    // @ts-ignore
    vi.mocked(Validator.validateForCalculation).mockReturnValue([{ field: null, stockId: null, message: '- 테스트 오류' }]);

    await controller.handleCalculate();

    expect(Validator.validateForCalculation).toHaveBeenCalledOnce();
    // @ts-ignore
    expect(controller.view.hideResults).toHaveBeenCalledOnce();
    expect(ErrorService.handle).toHaveBeenCalledWith(expect.any(ValidationError), 'handleCalculate - Validation');
    // @ts-ignore
    expect(controller.view.displayResults).not.toHaveBeenCalled(); // Ensure results aren't shown on validation error
  });

  it('handleCalculate: 목표 비율 합계가 100%가 아닐 때 경고 확인', async () => {
     // @ts-ignore
     vi.mocked(Validator.validateForCalculation).mockReturnValue([]); // Validation passes
     // Mock getActivePortfolio to return data with ratio sum != 100
     const portfolioWithBadRatio = {
        id: 'p-badratio', name: 'Bad Ratio Portfolio', settings: { mainMode: 'add', currentCurrency: 'krw', exchangeRate: 1300 },
        portfolioData: [{ id: 's1', name: 'Stock1', ticker: 'T1', targetRatio: 50, currentPrice: 100, isFixedBuyEnabled: false, fixedBuyAmount: 0, transactions: [], calculated: { currentAmount: new Decimal(1000), quantity: new Decimal(10) } }] // sum = 50
     };
     // @ts-ignore
     mockState.getActivePortfolio.mockReturnValue(portfolioWithBadRatio);

     // Simulate user canceling the confirmation
     // @ts-ignore
     vi.mocked(controller.view.showConfirm).mockResolvedValueOnce(false);

     await controller.handleCalculate();

     expect(Validator.validateForCalculation).toHaveBeenCalledOnce();
     // Use getRatioSum utility (assuming it's imported or globally available) or calculate manually
     const ratioSum = portfolioWithBadRatio.portfolioData.reduce((sum, s) => sum.plus(s.targetRatio || 0), new Decimal(0));
     expect(controller.view.showConfirm).toHaveBeenCalledWith(
        t('modal.confirmRatioSumWarnTitle'),
        t('modal.confirmRatioSumWarnMsg', { totalRatio: ratioSum.toFixed(1) })
     );
     // @ts-ignore
     expect(controller.view.hideResults).toHaveBeenCalledOnce(); // Should hide results if user cancels
     expect(Calculator.calculateAddRebalancing).not.toHaveBeenCalled(); // Calculation shouldn't proceed
     expect(Calculator.calculateSellRebalancing).not.toHaveBeenCalled();
     // @ts-ignore
     expect(controller.view.displayResults).not.toHaveBeenCalled();
   });


  it('handleCalculate: 유효성 검사 성공 시 계산 및 뷰 업데이트를 호출해야 한다 (Add Mode)', async () => {
    const mockCalcResults = { results: [ { id: '1' } ] }; // Simplified mock

    // @ts-ignore
    vi.mocked(Validator.validateForCalculation).mockReturnValue([]); // Validation passes
    // @ts-ignore
    vi.mocked(Calculator.calculateAddRebalancing).mockResolvedValue(mockCalcResults); // Mock calculation result for 'add' mode
    // @ts-ignore
    vi.mocked(controller.view.showConfirm).mockResolvedValue(true); // Assume user confirms ratio warning if it appears

    // Ensure mainMode is 'add' and ratio sum is 100
    // @ts-ignore
    mockState.getActivePortfolio.mockReturnValue({
        id: 'p-default', name: '기본 포트폴리오', settings: { mainMode: 'add', currentCurrency: 'krw', exchangeRate: 1300 },
        portfolioData: [{ id: 's1', name: 'Stock1', ticker: 'T1', targetRatio: 100, currentPrice: 100, isFixedBuyEnabled: false, fixedBuyAmount: 0, transactions: [], calculated: { currentAmount: new Decimal(1000), quantity: new Decimal(10) } }] // Ratio sum = 100
    });


    // Provide values for calculation inputs used in handleCalculate
    // @ts-ignore
    controller.view.dom.additionalAmountInput.value = '100000';
    // @ts-ignore
    controller.view.dom.exchangeRateInput.value = '1300';


    await controller.handleCalculate();

    expect(Validator.validateForCalculation).toHaveBeenCalledOnce();
    // Since ratio sum is 100, showConfirm should NOT be called for the ratio warning
    expect(controller.view.showConfirm).not.toHaveBeenCalledWith(t('modal.confirmRatioSumWarnTitle'), expect.any(String));
    expect(Calculator.calculateAddRebalancing).toHaveBeenCalledOnce(); // Check if add mode calculation was called
    expect(Calculator.calculateSellRebalancing).not.toHaveBeenCalled(); // Ensure sell mode wasn't called
    // @ts-ignore
    expect(controller.view.displayResults).toHaveBeenCalledOnce(); // Check if results are displayed
    // @ts-ignore
    expect(controller.view.hideResults).not.toHaveBeenCalled(); // Ensure results aren't hidden
    expect(ErrorService.handle).not.toHaveBeenCalled();
    // @ts-ignore - view.announce is called inside displayResults which is mocked, so we test displayResults call instead.
    // expect(controller.view.announce).toHaveBeenCalledWith(t('aria.resultsLoaded'));
  });

   it('handleCalculate: 유효성 검사 성공 시 계산 및 뷰 업데이트를 호출해야 한다 (Sell Mode)', async () => {
      const mockCalcResults = { results: [ { id: '1' } ] }; // Simplified mock

      // @ts-ignore
      vi.mocked(Validator.validateForCalculation).mockReturnValue([]); // Validation passes
      // @ts-ignore
      vi.mocked(Calculator.calculateSellRebalancing).mockResolvedValue(mockCalcResults); // Mock calculation result for 'sell' mode
      // @ts-ignore
      vi.mocked(controller.view.showConfirm).mockResolvedValue(true); // Assume user confirms ratio warning

      // Ensure mainMode is 'sell' and ratio sum is 100
      // @ts-ignore
      mockState.getActivePortfolio.mockReturnValue({
          id: 'p-default', name: '기본 포트폴리오', settings: { mainMode: 'sell', currentCurrency: 'krw', exchangeRate: 1300 }, // Set mode to 'sell'
          portfolioData: [{ id: 's1', name: 'Stock1', ticker: 'T1', targetRatio: 100, currentPrice: 100, isFixedBuyEnabled: false, fixedBuyAmount: 0, transactions: [], calculated: { currentAmount: new Decimal(1000), quantity: new Decimal(10) } }] // Ratio sum = 100
      });

      // Provide values (though additionalInvestment isn't used in sell mode, set them just in case)
      // @ts-ignore
      controller.view.dom.additionalAmountInput.value = '0';
      // @ts-ignore
      controller.view.dom.exchangeRateInput.value = '1300';


      await controller.handleCalculate();

      expect(Validator.validateForCalculation).toHaveBeenCalledOnce();
      expect(controller.view.showConfirm).not.toHaveBeenCalledWith(t('modal.confirmRatioSumWarnTitle'), expect.any(String)); // Ratio is 100
      expect(Calculator.calculateSellRebalancing).toHaveBeenCalledOnce(); // Check if sell mode calculation was called
      expect(Calculator.calculateAddRebalancing).not.toHaveBeenCalled(); // Ensure add mode wasn't called
      // @ts-ignore
      expect(controller.view.displayResults).toHaveBeenCalledOnce();
      // @ts-ignore
      expect(controller.view.hideResults).not.toHaveBeenCalled();
      expect(ErrorService.handle).not.toHaveBeenCalled();
    });

});