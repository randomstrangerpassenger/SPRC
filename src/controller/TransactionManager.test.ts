// src/controller/TransactionManager.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TransactionManager } from './TransactionManager';
import type { PortfolioState } from '../state';
import type { PortfolioView } from '../view';

// Mock dependencies
vi.mock('../calculator', () => ({
    Calculator: {
        clearPortfolioStateCache: vi.fn(),
    },
}));

vi.mock('../i18n', () => ({
    t: vi.fn((key: string, params?: any) => {
        if (params) {
            return `${key}:${JSON.stringify(params)}`;
        }
        return key;
    }),
}));

describe('TransactionManager', () => {
    let transactionManager: TransactionManager;
    let mockState: PortfolioState;
    let mockView: PortfolioView;

    beforeEach(() => {
        mockState = {
            getStockById: vi.fn().mockReturnValue({
                id: 'stock-1',
                name: 'Test Stock',
                ticker: 'TST',
            }),
            getActivePortfolio: vi.fn().mockReturnValue({
                id: 'portfolio-1',
                settings: { currentCurrency: 'krw', exchangeRate: 1300 },
            }),
            getTransactions: vi.fn().mockReturnValue([
                {
                    id: 'tx-1',
                    type: 'buy',
                    date: '2024-01-01',
                    quantity: 10,
                    price: 50000,
                },
            ]),
            addTransaction: vi.fn().mockResolvedValue(true),
            deleteTransaction: vi.fn().mockResolvedValue(true),
        } as any;

        mockView = {
            openTransactionModal: vi.fn(),
            closeTransactionModal: vi.fn(),
            renderTransactionList: vi.fn(),
            showToast: vi.fn(),
        } as any;

        transactionManager = new TransactionManager(mockState, mockView);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('openTransactionModalByStockId', () => {
        it('should open transaction modal with stock data', () => {
            transactionManager.openTransactionModalByStockId('stock-1');

            expect(mockState.getStockById).toHaveBeenCalledWith('stock-1');
            expect(mockView.openTransactionModal).toHaveBeenCalledWith(
                {
                    id: 'stock-1',
                    name: 'Test Stock',
                    ticker: 'TST',
                },
                'krw',
                [
                    {
                        id: 'tx-1',
                        type: 'buy',
                        date: '2024-01-01',
                        quantity: 10,
                        price: 50000,
                    },
                ]
            );
        });

        it('should not open modal when stock not found', () => {
            mockState.getStockById = vi.fn().mockReturnValue(null);

            transactionManager.openTransactionModalByStockId('unknown-stock');

            expect(mockView.openTransactionModal).not.toHaveBeenCalled();
        });

        it('should not open modal when no active portfolio', () => {
            mockState.getActivePortfolio = vi.fn().mockReturnValue(null);

            transactionManager.openTransactionModalByStockId('stock-1');

            expect(mockView.openTransactionModal).not.toHaveBeenCalled();
        });

        it('should handle USD currency', () => {
            mockState.getActivePortfolio = vi.fn().mockReturnValue({
                id: 'portfolio-1',
                settings: { currentCurrency: 'usd', exchangeRate: 1300 },
            });

            transactionManager.openTransactionModalByStockId('stock-1');

            expect(mockView.openTransactionModal).toHaveBeenCalledWith(
                expect.any(Object),
                'usd',
                expect.any(Array)
            );
        });
    });

    describe('handleAddNewTransaction', () => {
        let mockForm: HTMLFormElement;
        let mockModal: HTMLDivElement;
        let mockEvent: Event;

        beforeEach(() => {
            // Setup DOM structure
            mockModal = document.createElement('div');
            mockModal.id = 'transactionModal';
            mockModal.dataset.stockId = 'stock-1';

            mockForm = document.createElement('form');
            mockModal.appendChild(mockForm);

            // Create form inputs
            const typeInput = document.createElement('input');
            typeInput.type = 'radio';
            typeInput.name = 'txType';
            typeInput.value = 'buy';
            typeInput.checked = true;
            mockForm.appendChild(typeInput);

            const inputModeInput = document.createElement('input');
            inputModeInput.type = 'radio';
            inputModeInput.name = 'inputMode';
            inputModeInput.value = 'quantity';
            inputModeInput.checked = true;
            mockForm.appendChild(inputModeInput);

            const dateInput = document.createElement('input');
            dateInput.id = 'txDate';
            dateInput.type = 'date';
            dateInput.value = '2024-01-01';
            mockForm.appendChild(dateInput);

            const quantityInput = document.createElement('input');
            quantityInput.id = 'txQuantity';
            quantityInput.type = 'number';
            quantityInput.value = '10';
            mockForm.appendChild(quantityInput);

            const priceInput = document.createElement('input');
            priceInput.id = 'txPrice';
            priceInput.type = 'number';
            priceInput.value = '50000';
            mockForm.appendChild(priceInput);

            // Create event
            mockEvent = new Event('submit');
            Object.defineProperty(mockEvent, 'target', { value: mockForm, writable: false });
            Object.defineProperty(mockEvent, 'preventDefault', {
                value: vi.fn(),
                writable: false,
            });

            document.body.appendChild(mockModal);
        });

        afterEach(() => {
            document.body.innerHTML = '';
        });

        it('should add buy transaction with quantity input mode', async () => {
            const result = await transactionManager.handleAddNewTransaction(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockState.addTransaction).toHaveBeenCalledWith('stock-1', {
                type: 'buy',
                date: '2024-01-01',
                quantity: 10,
                price: 50000,
            });
            expect(result.needsFullRender).toBe(true);
        });

        it('should handle sell transaction', async () => {
            const sellInput = mockForm.querySelector('input[name="txType"]') as HTMLInputElement;
            sellInput.value = 'sell';

            const result = await transactionManager.handleAddNewTransaction(mockEvent);

            expect(mockState.addTransaction).toHaveBeenCalledWith('stock-1', {
                type: 'sell',
                date: '2024-01-01',
                quantity: 10,
                price: 50000,
            });
        });

        it('should handle dividend transaction', async () => {
            const dividendInput = mockForm.querySelector(
                'input[name="txType"]'
            ) as HTMLInputElement;
            dividendInput.value = 'dividend';

            const result = await transactionManager.handleAddNewTransaction(mockEvent);

            expect(mockState.addTransaction).toHaveBeenCalledWith('stock-1', {
                type: 'dividend',
                date: '2024-01-01',
                quantity: 10,
                price: 50000,
            });
        });

        it('should calculate quantity from total amount in amount input mode', async () => {
            const inputModeInput = mockForm.querySelector(
                'input[name="inputMode"]'
            ) as HTMLInputElement;
            inputModeInput.value = 'amount';

            const totalAmountInput = document.createElement('input');
            totalAmountInput.id = 'txTotalAmount';
            totalAmountInput.type = 'number';
            totalAmountInput.value = '500000'; // 500,000 / 50,000 = 10
            mockForm.appendChild(totalAmountInput);

            const result = await transactionManager.handleAddNewTransaction(mockEvent);

            expect(mockState.addTransaction).toHaveBeenCalledWith('stock-1', {
                type: 'buy',
                date: '2024-01-01',
                quantity: 10,
                price: 50000,
            });
        });

        it('should show error when amount is missing in amount input mode', async () => {
            const inputModeInput = mockForm.querySelector(
                'input[name="inputMode"]'
            ) as HTMLInputElement;
            inputModeInput.value = 'amount';

            const result = await transactionManager.handleAddNewTransaction(mockEvent);

            expect(mockView.showToast).toHaveBeenCalledWith(
                'toast.invalidTransactionInfo',
                'error'
            );
            expect(mockState.addTransaction).not.toHaveBeenCalled();
            expect(result.needsFullRender).toBe(false);
        });

        it('should show error when price is zero in amount mode', async () => {
            const inputModeInput = mockForm.querySelector(
                'input[name="inputMode"]'
            ) as HTMLInputElement;
            inputModeInput.value = 'amount';

            const totalAmountInput = document.createElement('input');
            totalAmountInput.id = 'txTotalAmount';
            totalAmountInput.value = '100000';
            mockForm.appendChild(totalAmountInput);

            const priceInput = mockForm.querySelector('#txPrice') as HTMLInputElement;
            priceInput.value = '0';

            const result = await transactionManager.handleAddNewTransaction(mockEvent);

            expect(mockView.showToast).toHaveBeenCalledWith(
                expect.stringContaining('0보다 커야'),
                'error'
            );
            expect(result.needsFullRender).toBe(false);
        });

        it('should return false when no stockId in modal', async () => {
            delete mockModal.dataset.stockId;

            const result = await transactionManager.handleAddNewTransaction(mockEvent);

            expect(mockState.addTransaction).not.toHaveBeenCalled();
            expect(result.needsFullRender).toBe(false);
        });

        it('should return false when required inputs are missing', async () => {
            mockForm.querySelector('#txDate')?.remove();

            const result = await transactionManager.handleAddNewTransaction(mockEvent);

            expect(mockState.addTransaction).not.toHaveBeenCalled();
            expect(result.needsFullRender).toBe(false);
        });

        it('should show success toast after adding transaction', async () => {
            await transactionManager.handleAddNewTransaction(mockEvent);

            expect(mockView.showToast).toHaveBeenCalledWith(
                expect.stringContaining('toast.transactionAdded'),
                'success'
            );
        });

        it('should close modal and render transaction list after adding', async () => {
            await transactionManager.handleAddNewTransaction(mockEvent);

            expect(mockView.renderTransactionList).toHaveBeenCalledWith(expect.any(Array), 'krw');
            expect(mockForm.reset).toBeDefined(); // Form should be reset
        });
    });

    // Note: handleDeleteTransaction is handled through event delegation
    // and doesn't exist as a direct method on TransactionManager.
});
