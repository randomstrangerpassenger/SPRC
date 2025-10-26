// js/controller.test.js (수정본)
// @ts-check

import { describe, it, expect, vi, beforeEach } from 'vitest'; // Vitest import는 맨 위

// --- 👇 vi.mock 호출을 import 구문 위로 이동 ---
vi.mock('./state.js'); // PortfolioState 생성자를 자동으로 모의 처리
vi.mock('./view.js', () => ({
  PortfolioView: { // view 객체와 필요한 함수들을 모의 처리
    cacheDomElements: vi.fn(),
    displaySkeleton: vi.fn(),
    displayResults: vi.fn(),
    hideResults: vi.fn(),
    showToast: vi.fn(),
    showConfirm: vi.fn(),
    // ... 다른 필요한 view 모의 함수들을 여기에 추가 ...
    updateTableHeader: vi.fn(),
    toggleFixedBuyColumn: vi.fn(),
    updateMainModeUI: vi.fn(),
    renderPortfolioSelector: vi.fn(),
    renderTable: vi.fn(),
    updateCurrencyModeUI: vi.fn(),
    updateRatioSum: vi.fn(),
    cleanup: vi.fn(),
  }
}));
vi.mock('./validator.js');
vi.mock('./errorService.js');
vi.mock('./calculator.js'); // Calculator도 모의 처리
// --- 👆 여기까지 ---

// --- 👇 실제 모듈 import는 mock 호출 아래에 ---
import { PortfolioController } from './controller.js';
import { Validator } from './validator.js'; // 실제 Validator 사용 시 필요 (테스트 내에서)
import { ErrorService, ValidationError } from './errorService.js'; // 실제 ErrorService 사용 시 필요 (테스트 내에서)
// Calculator는 Controller 내부에서만 사용되므로 테스트 파일에서 직접 import할 필요는 없을 수 있습니다.
// PortfolioState는 자동으로 모의 처리되었으므로 여기서 import하지 않습니다.

// --- 테스트 스위트 ---
describe('PortfolioController', () => {
  /** @type {PortfolioController} */
  let controller;

  beforeEach(() => {
    // 매 테스트 전에 모든 모의 함수의 호출 기록을 초기화합니다.
    vi.clearAllMocks();

    // PortfolioState 모의 생성자 설정 (필요한 경우)
    // vi.mocked(PortfolioState).mockImplementation(() => {
    //   return { /* 모의 state 객체의 필요한 메소드/속성 구현 */ };
    // });

    // @ts-ignore - PortfolioState가 모의 처리되었으므로 타입 에러 무시
    controller = new PortfolioController();

    // Controller의 내부 헬퍼 함수들도 모의 처리하여
    // 'handleCalculate' 자체의 로직만 테스트합니다.
    // (이 모의 함수들은 controller 인스턴스 생성 *후*에 설정해야 합니다)
    controller._getInputsForCalculation = vi.fn().mockResolvedValue({ // Promise 반환하도록 수정
      settings: { mainMode: 'add', currentCurrency: 'krw' }, // settings 객체 추가
      portfolioData: [], // portfolioData 추가
      calculatedPortfolioData: [],
      additionalInvestment: { /* Decimal 모의 객체 또는 실제 Decimal 값 */ isZero: () => false, isNegative: () => false } // Decimal 객체 모의
    });
    controller._runRebalancingLogic = vi.fn().mockResolvedValue({ results: [], summary: {} });
    controller._updateResultsView = vi.fn().mockResolvedValue(undefined);
  });

  // 테스트 1: 유효성 검사 실패 시나리오
  it('handleCalculate: 유효성 검사 실패 시 ErrorService를 호출해야 한다', async () => {
    // [Arrange] 준비
    const validationError = new ValidationError('- 테스트 오류');
    // Validator가 에러 메시지 배열을 반환하도록 설정 (Promise 반환하도록 수정)
    // @ts-ignore
    vi.mocked(Validator.validateForCalculation).mockResolvedValue([{ field: null, stockId: null, message: '- 테스트 오류' }]);

    // [Act] 실행
    await controller.handleCalculate();

    // [Assert] 검증
    expect(controller.view.displaySkeleton).toHaveBeenCalledOnce(); // 1. 스켈레톤 표시
    expect(Validator.validateForCalculation).toHaveBeenCalledOnce(); // 2. 유효성 검사 호출
    expect(controller.view.hideResults).toHaveBeenCalledOnce(); // 3. (실패 시) 결과 숨김
    // ErrorService.handle의 첫 번째 인자가 ValidationError 인스턴스인지 확인
    expect(ErrorService.handle).toHaveBeenCalledWith(expect.any(ValidationError), 'handleCalculate'); // 4. 에러 핸들러 호출

    // 5. (중요) 계산 로직과 뷰 업데이트는 호출되면 안 됨
    expect(controller._runRebalancingLogic).not.toHaveBeenCalled();
    expect(controller._updateResultsView).not.toHaveBeenCalled();
  });

  // 테스트 2: 유효성 검사 성공 시나리오
  it('handleCalculate: 유효성 검사 성공 시 계산 및 뷰 업데이트를 호출해야 한다', async () => {
    // [Arrange] 준비
    const mockResults = { results: [ { id: '1' } ], summary: { total: 100 } };
    const mockInputs = {
        settings: { mainMode: 'add', currentCurrency: 'krw' }, // settings 객체 구조 맞추기
        portfolioData: [{id: 'stock1-data'}], // portfolioData 추가
        calculatedPortfolioData: [ { id: 'stock1', calculated: {} } ], // calculatedPortfolioData 구조 맞추기
        additionalInvestment: { /* Decimal 모의 객체 */ isZero: () => false, isNegative: () => false }
    };
    // @ts-ignore
    controller._getInputsForCalculation.mockResolvedValue(mockInputs); // Promise 반환하도록 수정
    // @ts-ignore
    vi.mocked(Validator.validateForCalculation).mockResolvedValue([]); // 유효성 검사 통과 (빈 배열 Promise)
    controller._runRebalancingLogic.mockResolvedValue(mockResults);

    // [Act] 실행
    await controller.handleCalculate();

    // [Assert] 검증
    expect(controller.view.displaySkeleton).toHaveBeenCalledOnce(); // 1. 스켈레톤 표시
    expect(Validator.validateForCalculation).toHaveBeenCalledOnce(); // 2. 유효성 검사 호출

    // 3. (중요) 계산 로직과 뷰 업데이트가 올바른 인자와 함께 호출되어야 함
    expect(controller._runRebalancingLogic).toHaveBeenCalledWith(mockInputs);
    expect(controller._updateResultsView).toHaveBeenCalledWith(
        mockInputs.settings.mainMode,
        mockResults,
        mockInputs.settings.currentCurrency.toUpperCase(), // 통화 코드는 대문자로 전달
        mockInputs.calculatedPortfolioData
    );

    // 4. (중요) 실패 로직은 호출되면 안 됨
    expect(controller.view.hideResults).not.toHaveBeenCalled();
    expect(ErrorService.handle).not.toHaveBeenCalled();
  });

  // ... (다른 Controller 메소드들에 대한 테스트 케이스 추가 가능) ...

});