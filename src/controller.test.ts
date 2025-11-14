// src/controller.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import Decimal from 'decimal.js';

// --- ▼▼▼ Mock window.matchMedia ▼▼▼ ---
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// --- ▼▼▼ 모의(Mock) 설정 ▼▼▼ ---
vi.mock('./state');
vi.mock('./view', () => ({
    PortfolioView: {
        // Pub/Sub
        on: vi.fn(),
        emit: vi.fn(),
        // DOM 조작
        cacheDomElements: vi.fn(),
        renderPortfolioSelector: vi.fn(),
        updateCurrencyModeUI: vi.fn(),
        updateMainModeUI: vi.fn(),
        updateExchangeRateInputs: vi.fn(),
        updatePortfolioSettingsInputs: vi.fn(),
        renderTable: vi.fn(),
        updateVirtualTableData: vi.fn(),
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
        showCalculationLoading: vi.fn(),
        hideCalculationLoading: vi.fn(),
        // 모달
        openTransactionModal: vi.fn(),
        closeTransactionModal: vi.fn(),
        renderTransactionList: vi.fn(),
        // 기타
        toggleInputValidation: vi.fn(),
        toggleFetchButton: vi.fn(),
        destroyChart: vi.fn(),
        displayChart: vi.fn(),
        // DOM 요소 (최소한의 모의)
        dom: {
            additionalAmountInput: {
                value: '0',
                addEventListener: vi.fn(),
            },
            additionalAmountUSDInput: {
                value: '0',
                addEventListener: vi.fn(),
            },
            exchangeRateInput: {
                value: '1300',
                addEventListener: vi.fn(),
            },
            importFileInput: {
                click: vi.fn(),
                addEventListener: vi.fn(),
            },
        },
    },
}));
vi.mock('./validator');
vi.mock('./errorService');
vi.mock('./calculator');

// 전략 클래스 모의(Mock) 방식 변경
const mockAddCalculate = vi.fn(() => ({ results: [] }));
const mockSellCalculate = vi.fn(() => ({ results: [] }));

vi.mock('./calculationStrategies', () => ({
    AddRebalanceStrategy: class {
        calculate = mockAddCalculate;
    },
    SellRebalanceStrategy: class {
        calculate = mockSellCalculate;
    },
}));

vi.mock('./apiService', () => ({
    apiService: {
        fetchAllStockPrices: vi.fn(),
        fetchExchangeRate: vi.fn().mockResolvedValue(1300),
    },
}));
vi.mock('./i18n', () => ({
    t: vi.fn((key: string) => key),
}));
vi.mock('dompurify', () => ({
    default: {
        sanitize: vi.fn((input: string) => input),
    },
}));

// --- ▼▼▼ 실제 모듈 및 모의 객체 임포트 ▼▼▼ ---
import { PortfolioController } from './controller';
import { PortfolioState } from './state';
import { PortfolioView } from './view';
import { Validator } from './validator';
import { ErrorService, ValidationError } from './errorService';
import { Calculator } from './calculator';
import { AddRebalanceStrategy, SellRebalanceStrategy } from './calculationStrategies';
import { apiService } from './apiService';
import { t } from './i18n';
import { MOCK_PORTFOLIO_1, MOCK_STOCK_1 } from './testUtils';
import type { Portfolio } from './types';

// --- 테스트 스위트 ---
describe('PortfolioController', () => {
    let controller: PortfolioController;
    let mockState: PortfolioState;
    let mockView: typeof PortfolioView;
    let mockCalculator: typeof Calculator;
    let mockValidator: typeof Validator;

    let mockDefaultPortfolio: Portfolio;

    beforeEach(async () => {
        vi.clearAllMocks();

        // MOCK_PORTFOLIO_1의 깊은 복사본을 만들어 테스트에 사용
        mockDefaultPortfolio = JSON.parse(JSON.stringify(MOCK_PORTFOLIO_1));
        mockDefaultPortfolio.portfolioData.forEach((stock) => {
            stock.targetRatio = new Decimal(stock.targetRatio).toNumber();
            stock.currentPrice = new Decimal(stock.currentPrice).toNumber();
            stock.fixedBuyAmount = new Decimal(stock.fixedBuyAmount).toNumber();
            const calculated = (stock as any).calculated;
            if (calculated) {
                calculated.currentAmount = new Decimal(calculated.currentAmount);
            }
        });

        // 모의 인스턴스 할당
        mockState = new PortfolioState();
        mockView = PortfolioView;
        mockCalculator = Calculator;
        mockValidator = Validator;

        // State 모의 메서드 설정 (Async)
        vi.mocked(mockState.ensureInitialized).mockResolvedValue(undefined);
        vi.mocked(mockState.getActivePortfolio).mockReturnValue(mockDefaultPortfolio);
        vi.mocked(mockState.getAllPortfolios).mockReturnValue({
            [mockDefaultPortfolio.id]: mockDefaultPortfolio,
        });
        vi.mocked(mockState.getStockById).mockReturnValue(mockDefaultPortfolio.portfolioData[0]);
        vi.mocked(mockState.getTransactions).mockReturnValue([]);
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

        // Calculator 모의 설정
        vi.mocked(mockCalculator.calculatePortfolioState).mockReturnValue({
            portfolioData: mockDefaultPortfolio.portfolioData as any,
            currentTotal: new Decimal(5500),
            cacheKey: 'mock-key',
        });
        vi.mocked(mockCalculator.calculateSectorAnalysis).mockReturnValue([]);

        vi.mocked(mockCalculator.calculateRebalancing).mockImplementation((strategy: any) => {
            return strategy.calculate();
        });

        // 컨트롤러 생성 (이때 bindControllerEvents가 호출됨)
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
        vi.mocked(mockValidator.validateForCalculation).mockReturnValue([
            { field: '', stockId: null, message: '- 테스트 오류' },
        ]);

        await controller.handleCalculate();

        expect(mockValidator.validateForCalculation).toHaveBeenCalledOnce();
        expect(mockView.hideResults).toHaveBeenCalledOnce();
        expect(ErrorService.handle).toHaveBeenCalledWith(
            expect.any(ValidationError),
            'handleCalculate - Validation'
        );
        expect(mockCalculator.calculateRebalancing).not.toHaveBeenCalled();
    });

    it('handleCalculate: 목표 비율 100% 미만 시 확인 창을 띄우고, 취소 시 중단해야 한다', async () => {
        vi.mocked(mockValidator.validateForCalculation).mockReturnValue([]);
        const portfolioWithBadRatio: Portfolio = {
            ...mockDefaultPortfolio,
            portfolioData: [
                { ...mockDefaultPortfolio.portfolioData[0], targetRatio: 30 },
                { ...mockDefaultPortfolio.portfolioData[1], targetRatio: 0 },
            ],
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
        vi.mocked(mockState.getActivePortfolio).mockReturnValue(mockDefaultPortfolio);
        vi.mocked(mockView.showConfirm).mockResolvedValue(true);

        await controller.handleCalculate();

        expect(mockAddCalculate).toHaveBeenCalledOnce();
        expect(mockSellCalculate).not.toHaveBeenCalled();

        expect(mockCalculator.calculateRebalancing).toHaveBeenCalledOnce();
        expect(mockCalculator.calculateRebalancing).toHaveBeenCalledWith(
            expect.any(AddRebalanceStrategy)
        );

        expect(mockView.displayResults).toHaveBeenCalledOnce();
        expect(mockView.showToast).toHaveBeenCalledWith('toast.calculateSuccess', 'success');
    });

    it('handleCalculate: "sell" 모드일 때 SellRebalanceStrategy를 호출해야 한다', async () => {
        vi.mocked(mockValidator.validateForCalculation).mockReturnValue([]);
        vi.mocked(mockState.getActivePortfolio).mockReturnValue({
            ...mockDefaultPortfolio,
            settings: { ...mockDefaultPortfolio.settings, mainMode: 'sell' },
        });
        vi.mocked(mockView.showConfirm).mockResolvedValue(true);

        await controller.handleCalculate();

        expect(mockSellCalculate).toHaveBeenCalledOnce();
        expect(mockAddCalculate).not.toHaveBeenCalled();

        expect(mockCalculator.calculateRebalancing).toHaveBeenCalledOnce();
        expect(mockCalculator.calculateRebalancing).toHaveBeenCalledWith(
            expect.any(SellRebalanceStrategy)
        );
        expect(mockView.displayResults).toHaveBeenCalledOnce();
    });

    it('handleFetchAllPrices: API 호출 성공 시 state와 view를 업데이트해야 한다', async () => {
        const mockApiResponse = [
            { id: 's1', ticker: 'AAA', status: 'fulfilled' as const, value: 150 },
            { id: 's2', ticker: 'BBB', status: 'fulfilled' as const, value: 210 },
        ];
        vi.mocked(apiService.fetchAllStockPrices).mockResolvedValue(mockApiResponse);

        await controller.handleFetchAllPrices();

        expect(mockView.toggleFetchButton).toHaveBeenCalledWith(true);
        expect(apiService.fetchAllStockPrices).toHaveBeenCalledWith([
            { id: 's1', ticker: 'AAA' },
            { id: 's2', ticker: 'BBB' },
        ]);
        // Currency is KRW, so prices are converted: 150 * 1300 = 195000, 210 * 1300 = 273000
        expect(mockState.updateStockProperty).toHaveBeenCalledWith('s1', 'currentPrice', 195000);
        expect(mockState.updateStockProperty).toHaveBeenCalledWith('s2', 'currentPrice', 273000);
        expect(mockView.updateCurrentPriceInput).toHaveBeenCalledWith('s1', '195000.00');
        expect(mockView.updateCurrentPriceInput).toHaveBeenCalledWith('s2', '273000.00');

        expect(mockView.showToast).toHaveBeenCalledWith('api.fetchSuccessAll', 'success');
        expect(mockView.toggleFetchButton).toHaveBeenCalledWith(false);
    });

    it('handleTransactionListClick: 거래 삭제 시 state.deleteTransaction을 호출해야 한다 (async)', async () => {
        vi.mocked(mockView.showConfirm).mockResolvedValue(true);

        const result = await controller.handleTransactionListClick('s1', 'tx1');

        expect(mockView.showConfirm).toHaveBeenCalledOnce();
        expect(mockState.deleteTransaction).toHaveBeenCalledWith('s1', 'tx1');
        expect(mockView.renderTransactionList).toHaveBeenCalledOnce();
        expect(mockView.showToast).toHaveBeenCalledWith('toast.transactionDeleted', 'success');
        expect(result.needsUIUpdate).toBe(true);
    });

    it('handleTransactionListClick: 거래 삭제 취소 시 state를 호출하지 않아야 한다 (async)', async () => {
        vi.mocked(mockView.showConfirm).mockResolvedValue(false);

        // Clear any previous showToast calls from initialization
        vi.mocked(mockView.showToast).mockClear();

        await controller.handleTransactionListClick('s1', 'tx1');

        expect(mockView.showConfirm).toHaveBeenCalledOnce();
        expect(mockState.deleteTransaction).not.toHaveBeenCalled();
        expect(mockView.renderTransactionList).not.toHaveBeenCalled();
        expect(mockView.showToast).not.toHaveBeenCalled();
    });
});
