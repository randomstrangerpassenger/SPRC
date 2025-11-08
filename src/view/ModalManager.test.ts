// src/view/ModalManager.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ModalManager } from './ModalManager';

// Mock i18n
vi.mock('../i18n', () => ({
    t: vi.fn((key: string) => {
        const translations: Record<string, string> = {
            'view.noTransactions': '거래 내역이 없습니다',
            'ui.buy': '매수',
            'ui.sell': '매도',
            'ui.delete': '삭제',
            'modal.transactionTitle': '거래 내역',
        };
        return translations[key] || key;
    }),
}));

describe('ModalManager', () => {
    let modalManager: ModalManager;
    let mockDom: any;

    beforeEach(() => {
        // Create mock DOM elements
        const txDateInput = document.createElement('input');
        txDateInput.type = 'date'; // Set type to date to support valueAsDate

        mockDom = {
            customModal: document.createElement('div'),
            customModalTitle: document.createElement('h2'),
            customModalMessage: document.createElement('p'),
            customModalInput: document.createElement('input'),
            customModalConfirm: document.createElement('button'),
            customModalCancel: document.createElement('button'),
            transactionModal: document.createElement('div'),
            modalStockName: document.createElement('h2'),
            closeModalBtn: document.createElement('button'),
            transactionListBody: document.createElement('tbody'),
            newTransactionForm: document.createElement('form'),
            txDate: txDateInput, // Use the date input with proper type
            txQuantity: document.createElement('input'),
            txPrice: document.createElement('input'),
        };

        // Setup IDs for elements
        mockDom.customModal.id = 'customModal';
        mockDom.transactionModal.id = 'transactionModal';

        // Append to document body for focus trap to work
        document.body.appendChild(mockDom.customModal);
        document.body.appendChild(mockDom.transactionModal);

        modalManager = new ModalManager(mockDom);
    });

    afterEach(() => {
        // Cleanup
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    describe('showConfirm()', () => {
        it('should display confirm modal with title and message', () => {
            const promise = modalManager.showConfirm('Test Title', 'Test Message');

            expect(mockDom.customModalTitle.textContent).toBe('Test Title');
            expect(mockDom.customModalMessage.textContent).toBe('Test Message');
            expect(mockDom.customModal.classList.contains('hidden')).toBe(false);
            expect(mockDom.customModalInput.classList.contains('hidden')).toBe(true);

            // Cleanup promise
            modalManager.handleCustomModal(false);
        });

        it('should resolve to true when confirmed', async () => {
            const promise = modalManager.showConfirm('Confirm', 'Are you sure?');

            // Simulate confirm click
            setTimeout(() => {
                modalManager.handleCustomModal(true);
            }, 10);

            const result = await promise;
            expect(result).toBe(true);
        });

        it('should resolve to false when cancelled', async () => {
            const promise = modalManager.showConfirm('Confirm', 'Are you sure?');

            setTimeout(() => {
                modalManager.handleCustomModal(false);
            }, 10);

            const result = await promise;
            expect(result).toBe(false);
        });

        it('should set aria-modal attribute', () => {
            modalManager.showConfirm('Test', 'Message');
            expect(mockDom.customModal.getAttribute('aria-modal')).toBe('true');

            modalManager.handleCustomModal(false);
        });
    });

    describe('showPrompt()', () => {
        it('should display prompt modal with input field', () => {
            const promise = modalManager.showPrompt(
                'Enter Name',
                'Please provide a name',
                'Default'
            );

            expect(mockDom.customModalTitle.textContent).toBe('Enter Name');
            expect(mockDom.customModalMessage.textContent).toBe('Please provide a name');
            expect(mockDom.customModalInput.value).toBe('Default');
            expect(mockDom.customModalInput.classList.contains('hidden')).toBe(false);

            modalManager.handleCustomModal(false);
        });

        it('should resolve to input value when confirmed', async () => {
            const promise = modalManager.showPrompt('Name', 'Enter your name', '');

            setTimeout(() => {
                mockDom.customModalInput.value = 'John Doe';
                modalManager.handleCustomModal(true);
            }, 10);

            const result = await promise;
            expect(result).toBe('John Doe');
        });

        it('should resolve to null when cancelled', async () => {
            const promise = modalManager.showPrompt('Name', 'Enter your name');

            setTimeout(() => {
                modalManager.handleCustomModal(false);
            }, 10);

            const result = await promise;
            expect(result).toBe(null);
        });
    });

    describe('openTransactionModal()', () => {
        it('should open transaction modal with stock info', () => {
            const mockStock = {
                id: 'stock-1',
                name: 'Apple',
                ticker: 'AAPL',
                sector: 'Technology',
                targetRatio: 25,
                currentPrice: 150,
                transactions: [],
            };

            modalManager.openTransactionModal(mockStock, 'usd', []);

            expect(mockDom.transactionModal.dataset.stockId).toBe('stock-1');
            expect(mockDom.modalStockName.textContent).toContain('Apple');
            expect(mockDom.modalStockName.textContent).toContain('AAPL');
            expect(mockDom.transactionModal.classList.contains('hidden')).toBe(false);
        });

        it('should render transaction list', () => {
            const mockStock = {
                id: 'stock-1',
                name: 'Apple',
                ticker: 'AAPL',
                sector: 'Technology',
                targetRatio: 25,
                currentPrice: 150,
                transactions: [],
            };

            const mockTransactions = [
                {
                    id: 'tx-1',
                    type: 'buy' as const,
                    date: '2024-01-01',
                    quantity: 10,
                    price: 140,
                },
            ];

            modalManager.openTransactionModal(mockStock, 'usd', mockTransactions);

            const rows = mockDom.transactionListBody.querySelectorAll('tr');
            expect(rows.length).toBeGreaterThan(0);
        });
    });

    describe('closeTransactionModal()', () => {
        it('should close transaction modal and reset form', () => {
            const mockStock = {
                id: 'stock-1',
                name: 'Apple',
                ticker: 'AAPL',
                sector: 'Technology',
                targetRatio: 25,
                currentPrice: 150,
                transactions: [],
            };

            modalManager.openTransactionModal(mockStock, 'usd', []);
            modalManager.closeTransactionModal();

            expect(mockDom.transactionModal.classList.contains('hidden')).toBe(true);
            expect(mockDom.transactionModal.hasAttribute('data-stock-id')).toBe(false);
        });

        it('should remove aria-modal attribute', () => {
            const mockStock = {
                id: 'stock-1',
                name: 'Apple',
                ticker: 'AAPL',
                sector: 'Technology',
                targetRatio: 25,
                currentPrice: 150,
                transactions: [],
            };

            modalManager.openTransactionModal(mockStock, 'usd', []);
            expect(mockDom.transactionModal.getAttribute('aria-modal')).toBe('true');

            modalManager.closeTransactionModal();
            expect(mockDom.transactionModal.hasAttribute('aria-modal')).toBe(false);
        });
    });

    describe('renderTransactionList()', () => {
        it('should show "no transactions" message when list is empty', () => {
            modalManager.renderTransactionList([], 'krw');

            const rows = mockDom.transactionListBody.querySelectorAll('tr');
            expect(rows.length).toBe(1);
            expect(rows[0].textContent).toContain('거래 내역이 없습니다');
        });

        it('should render transactions sorted by date (newest first)', () => {
            const transactions = [
                { id: 'tx-1', type: 'buy' as const, date: '2024-01-01', quantity: 10, price: 100 },
                { id: 'tx-2', type: 'sell' as const, date: '2024-01-03', quantity: 5, price: 110 },
                { id: 'tx-3', type: 'buy' as const, date: '2024-01-02', quantity: 8, price: 105 },
            ];

            modalManager.renderTransactionList(transactions, 'usd');

            const rows = mockDom.transactionListBody.querySelectorAll('tr');
            expect(rows.length).toBe(3);

            // Check sorting (newest first)
            expect(rows[0].cells[0].textContent).toBe('2024-01-03');
            expect(rows[1].cells[0].textContent).toBe('2024-01-02');
            expect(rows[2].cells[0].textContent).toBe('2024-01-01');
        });

        it('should display buy/sell types with correct styling', () => {
            const transactions = [
                { id: 'tx-1', type: 'buy' as const, date: '2024-01-01', quantity: 10, price: 100 },
                { id: 'tx-2', type: 'sell' as const, date: '2024-01-02', quantity: 5, price: 110 },
            ];

            modalManager.renderTransactionList(transactions, 'krw');

            const rows = mockDom.transactionListBody.querySelectorAll('tr');
            const buySpan = rows[1].querySelector('.text-buy');
            const sellSpan = rows[0].querySelector('.text-sell');

            expect(buySpan).toBeTruthy();
            expect(sellSpan).toBeTruthy();
        });
    });

    describe('bindModalEvents()', () => {
        it('should bind cancel button click', () => {
            const handleSpy = vi.spyOn(modalManager, 'handleCustomModal');
            modalManager.bindModalEvents();

            mockDom.customModalCancel.click();

            expect(handleSpy).toHaveBeenCalledWith(false);
        });

        it('should bind confirm button click', () => {
            const handleSpy = vi.spyOn(modalManager, 'handleCustomModal');
            modalManager.bindModalEvents();

            mockDom.customModalConfirm.click();

            expect(handleSpy).toHaveBeenCalledWith(true);
        });

        it('should handle Escape key', () => {
            const handleSpy = vi.spyOn(modalManager, 'handleCustomModal');
            modalManager.bindModalEvents();

            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            mockDom.customModal.dispatchEvent(escapeEvent);

            expect(handleSpy).toHaveBeenCalledWith(false);
        });
    });
});