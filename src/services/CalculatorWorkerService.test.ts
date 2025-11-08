// src/services/CalculatorWorkerService.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CalculatorWorkerService, getCalculatorWorkerService } from './CalculatorWorkerService';
import { Calculator } from '../calculator';
import Decimal from 'decimal.js';
import type { Stock, CalculatedStock } from '../types';

// Calculator 모킹
vi.mock('../calculator', () => ({
    Calculator: {
        calculatePortfolioState: vi.fn(),
        calculateSectorAnalysis: vi.fn(),
    },
}));

// ErrorService 모킹
vi.mock('../errorService', () => ({
    ErrorService: {
        handle: vi.fn(),
    },
}));

// Worker 모킹
class MockWorker {
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: ((error: ErrorEvent) => void) | null = null;

    postMessage(data: any) {
        // 메시지를 받았을 때 즉시 응답하도록 구현
        if (this.onmessage) {
            setTimeout(() => {
                const mockResult = this.getMockResult(data.type);
                this.onmessage!({
                    data: {
                        type: data.type,
                        result: mockResult,
                        requestId: data.requestId,
                    },
                } as MessageEvent);
            }, 10);
        }
    }

    terminate() {
        // Worker 종료 시뮬레이션
    }

    private getMockResult(type: string) {
        if (type === 'calculatePortfolioState') {
            return {
                portfolioData: [
                    {
                        id: 'stock-1',
                        name: 'Stock A',
                        ticker: 'AAPL',
                        sector: 'Tech',
                        targetRatio: new Decimal(50),
                        currentPrice: new Decimal(100),
                        quantity: new Decimal(10),
                        calculated: {
                            quantity: '10',
                            avgBuyPrice: '100',
                            currentAmount: '1000',
                            profitLoss: '0',
                            profitLossRate: '0',
                        },
                    },
                ],
                currentTotal: '1000',
            };
        } else if (type === 'calculateSectorAnalysis') {
            return [
                {
                    sector: 'Tech',
                    amount: '1000',
                    percentage: '100',
                },
            ];
        }
        return null;
    }
}

// Worker 글로벌 모킹
global.Worker = MockWorker as any;

describe('CalculatorWorkerService', () => {
    let service: CalculatorWorkerService;

    beforeEach(() => {
        vi.clearAllMocks();
        // Worker를 사용 가능하도록 설정
        global.Worker = MockWorker as any;
    });

    afterEach(() => {
        if (service) {
            service.terminate();
        }
    });

    describe('initialization', () => {
        it('should initialize worker successfully', async () => {
            service = new CalculatorWorkerService();

            // Worker 초기화가 완료될 때까지 대기
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Worker가 초기화되었는지 확인 (calculatePortfolioState 호출로 검증)
            const mockStock: Stock = {
                id: 'stock-1',
                name: 'Stock A',
                ticker: 'AAPL',
                sector: 'Tech',
                targetRatio: new Decimal(50),
                currentPrice: new Decimal(100),
                quantity: new Decimal(10),
                transactions: [],
            };

            const result = await service.calculatePortfolioState({
                portfolioData: [mockStock],
            });

            expect(result).toBeDefined();
            expect(result.portfolioData).toHaveLength(1);
        });

        it('should fallback to synchronous calculator when Worker is unavailable', async () => {
            // Worker를 사용 불가능하도록 설정
            global.Worker = undefined as any;

            service = new CalculatorWorkerService();

            const mockStock: Stock = {
                id: 'stock-1',
                name: 'Stock A',
                ticker: 'AAPL',
                sector: 'Tech',
                targetRatio: new Decimal(50),
                currentPrice: new Decimal(100),
                quantity: new Decimal(10),
                transactions: [],
            };

            vi.mocked(Calculator.calculatePortfolioState).mockReturnValue({
                portfolioData: [
                    {
                        ...mockStock,
                        calculated: {
                            quantity: new Decimal(10),
                            avgBuyPrice: new Decimal(100),
                            currentAmount: new Decimal(1000),
                            profitLoss: new Decimal(0),
                            profitLossRate: new Decimal(0),
                        },
                    },
                ],
                currentTotal: new Decimal(1000),
                cacheKey: 'test-key',
            });

            const result = await service.calculatePortfolioState({
                portfolioData: [mockStock],
            });

            expect(Calculator.calculatePortfolioState).toHaveBeenCalled();
            expect(result.currentTotal).toEqual(new Decimal(1000));
        });
    });

    describe('calculatePortfolioState', () => {
        beforeEach(async () => {
            global.Worker = MockWorker as any;
            service = new CalculatorWorkerService();
            await new Promise((resolve) => setTimeout(resolve, 50));
        });

        it('should calculate portfolio state using worker', async () => {
            const mockStock: Stock = {
                id: 'stock-1',
                name: 'Stock A',
                ticker: 'AAPL',
                sector: 'Tech',
                targetRatio: new Decimal(50),
                currentPrice: new Decimal(100),
                quantity: new Decimal(10),
                transactions: [],
            };

            const result = await service.calculatePortfolioState({
                portfolioData: [mockStock],
            });

            expect(result.portfolioData).toHaveLength(1);
            expect(result.currentTotal).toBeInstanceOf(Decimal);
        });

        it('should deserialize Decimal fields correctly', async () => {
            const mockStock: Stock = {
                id: 'stock-1',
                name: 'Stock A',
                ticker: 'AAPL',
                sector: 'Tech',
                targetRatio: new Decimal(50),
                currentPrice: new Decimal(100),
                quantity: new Decimal(10),
                transactions: [],
            };

            const result = await service.calculatePortfolioState({
                portfolioData: [mockStock],
            });

            const calculated = result.portfolioData[0].calculated;
            expect(calculated.quantity).toBeInstanceOf(Decimal);
            expect(calculated.avgBuyPrice).toBeInstanceOf(Decimal);
            expect(calculated.currentAmount).toBeInstanceOf(Decimal);
        });
    });

    describe('calculateSectorAnalysis', () => {
        beforeEach(async () => {
            global.Worker = MockWorker as any;
            service = new CalculatorWorkerService();
            await new Promise((resolve) => setTimeout(resolve, 50));
        });

        it('should calculate sector analysis using worker', async () => {
            const mockCalculatedStock: CalculatedStock = {
                id: 'stock-1',
                name: 'Stock A',
                ticker: 'AAPL',
                sector: 'Tech',
                targetRatio: new Decimal(50),
                currentPrice: new Decimal(100),
                quantity: new Decimal(10),
                transactions: [],
                calculated: {
                    quantity: new Decimal(10),
                    avgBuyPrice: new Decimal(100),
                    currentAmount: new Decimal(1000),
                    profitLoss: new Decimal(0),
                    profitLossRate: new Decimal(0),
                },
            };

            const result = await service.calculateSectorAnalysis([mockCalculatedStock], 'krw');

            expect(result).toHaveLength(1);
            expect(result[0].sector).toBe('Tech');
            expect(result[0].amount).toBeInstanceOf(Decimal);
            expect(result[0].percentage).toBeInstanceOf(Decimal);
        });

        it('should fallback to synchronous calculator on worker failure', async () => {
            global.Worker = undefined as any;
            service = new CalculatorWorkerService();

            const mockCalculatedStock: CalculatedStock = {
                id: 'stock-1',
                name: 'Stock A',
                ticker: 'AAPL',
                sector: 'Tech',
                targetRatio: new Decimal(50),
                currentPrice: new Decimal(100),
                quantity: new Decimal(10),
                transactions: [],
                calculated: {
                    quantity: new Decimal(10),
                    avgBuyPrice: new Decimal(100),
                    currentAmount: new Decimal(1000),
                    profitLoss: new Decimal(0),
                    profitLossRate: new Decimal(0),
                },
            };

            vi.mocked(Calculator.calculateSectorAnalysis).mockReturnValue([
                {
                    sector: 'Tech',
                    amount: new Decimal(1000),
                    percentage: new Decimal(100),
                },
            ]);

            const result = await service.calculateSectorAnalysis([mockCalculatedStock], 'krw');

            expect(Calculator.calculateSectorAnalysis).toHaveBeenCalled();
            expect(result[0].sector).toBe('Tech');
        });
    });

    describe('terminate', () => {
        it('should terminate worker', async () => {
            global.Worker = MockWorker as any;
            service = new CalculatorWorkerService();
            await new Promise((resolve) => setTimeout(resolve, 50));

            service.terminate();

            // 종료 후에는 synchronous calculator로 fallback
            const mockStock: Stock = {
                id: 'stock-1',
                name: 'Stock A',
                ticker: 'AAPL',
                sector: 'Tech',
                targetRatio: new Decimal(50),
                currentPrice: new Decimal(100),
                quantity: new Decimal(10),
                transactions: [],
            };

            vi.mocked(Calculator.calculatePortfolioState).mockReturnValue({
                portfolioData: [],
                currentTotal: new Decimal(0),
                cacheKey: 'test-key',
            });

            await service.calculatePortfolioState({ portfolioData: [mockStock] });

            expect(Calculator.calculatePortfolioState).toHaveBeenCalled();
        });
    });

    describe('singleton', () => {
        it('should return same instance', () => {
            const instance1 = getCalculatorWorkerService();
            const instance2 = getCalculatorWorkerService();

            expect(instance1).toBe(instance2);
        });
    });
});
