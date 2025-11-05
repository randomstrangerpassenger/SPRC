// src/controller/TransactionManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { Calculator } from '../calculator';
import { Validator } from '../validator';
import { t } from '../i18n';
import Decimal from 'decimal.js';

/**
 * @class TransactionManager
 * @description 거래 내역 추가, 삭제 관리
 */
export class TransactionManager {
    constructor(
        private state: PortfolioState,
        private view: PortfolioView
    ) {}

    /**
     * @description 주식 ID로 거래 내역 모달 열기
     * @param stockId - 주식 ID
     */
    openTransactionModalByStockId(stockId: string): void {
        const stock = this.state.getStockById(stockId);
        const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
        if (stock && currency) {
            this.view.openTransactionModal(stock, currency, this.state.getTransactions(stockId));
        }
    }

    /**
     * @description 새 거래 내역 추가
     * @param e - 폼 제출 이벤트
     */
    async handleAddNewTransaction(e: Event): Promise<{ needsFullRender: boolean }> {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const modal = form.closest('#transactionModal') as HTMLElement | null;
        const stockId = modal?.dataset.stockId;
        if (!stockId) return { needsFullRender: false };

        const typeInput = form.querySelector('input[name="txType"]:checked');
        const inputModeInput = form.querySelector('input[name="inputMode"]:checked');
        const dateInput = form.querySelector('#txDate') as HTMLInputElement;
        const quantityInput = form.querySelector('#txQuantity') as HTMLInputElement;
        const totalAmountInput = form.querySelector('#txTotalAmount') as HTMLInputElement;
        const priceInput = form.querySelector('#txPrice') as HTMLInputElement;

        if (!typeInput || !dateInput || !priceInput) return { needsFullRender: false };

        const typeValue = typeInput instanceof HTMLInputElement ? typeInput.value : 'buy';
        const type: 'buy' | 'sell' | 'dividend' =
            typeValue === 'sell' ? 'sell' :
            typeValue === 'dividend' ? 'dividend' :
            'buy';
        const inputMode = inputModeInput instanceof HTMLInputElement ? inputModeInput.value : 'quantity';
        const date = dateInput.value;
        const priceStr = priceInput.value;

        let finalQuantity: number;

        if (inputMode === 'amount') {
            if (!totalAmountInput || !totalAmountInput.value) {
                this.view.showToast(t('toast.invalidTransactionInfo'), 'error');
                return { needsFullRender: false };
            }

            const totalAmountStr = totalAmountInput.value;

            try {
                const totalAmountDec = new Decimal(totalAmountStr);
                const priceDec = new Decimal(priceStr);

                if (priceDec.isZero() || priceDec.isNegative()) {
                    this.view.showToast('단가는 0보다 커야 합니다.', 'error');
                    return { needsFullRender: false };
                }

                const quantityDec = totalAmountDec.div(priceDec);
                finalQuantity = quantityDec.toNumber();
            } catch (error) {
                this.view.showToast('금액 또는 단가 입력이 올바르지 않습니다.', 'error');
                return { needsFullRender: false };
            }
        } else {
            if (!quantityInput || !quantityInput.value) {
                this.view.showToast(t('toast.invalidTransactionInfo'), 'error');
                return { needsFullRender: false };
            }

            const quantityStr = quantityInput.value;
            finalQuantity = Number(quantityStr);
        }

        const txData = { type, date, quantity: String(finalQuantity), price: priceStr };
        const validationResult = Validator.validateTransaction(txData);

        if (!validationResult.isValid) {
            this.view.showToast(validationResult.message || t('toast.invalidTransactionInfo'), 'error');
            return { needsFullRender: false };
        }

        const success = await this.state.addTransaction(stockId, {
            type,
            date,
            quantity: finalQuantity,
            price: Number(priceStr)
        });

        if (success) {
            const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
            if (currency) {
                this.view.renderTransactionList(this.state.getTransactions(stockId), currency);
            }
            form.reset();
            dateInput.valueAsDate = new Date();

            // 입력 모드를 수량 입력으로 리셋
            const inputModeQuantity = form.querySelector('#inputModeQuantity');
            if (inputModeQuantity instanceof HTMLInputElement) {
                inputModeQuantity.checked = true;
                const quantityInputGroup = document.getElementById('quantityInputGroup');
                const totalAmountInputGroup = document.getElementById('totalAmountInputGroup');
                const calculatedQuantityDisplay = document.getElementById('calculatedQuantityDisplay');

                if (quantityInputGroup) quantityInputGroup.style.display = '';
                if (totalAmountInputGroup) totalAmountInputGroup.style.display = 'none';
                if (calculatedQuantityDisplay) calculatedQuantityDisplay.style.display = 'none';
                if (quantityInput) quantityInput.required = true;
                if (totalAmountInput) totalAmountInput.required = false;
            }

            this.view.showToast(t('toast.transactionAdded'), 'success');
            Calculator.clearPortfolioStateCache();
            return { needsFullRender: true };
        } else {
            this.view.showToast(t('toast.transactionAddFailed'), 'error');
            return { needsFullRender: false };
        }
    }

    /**
     * @description 거래 내역 삭제
     * @param stockId - 주식 ID
     * @param txId - 거래 내역 ID
     */
    async handleTransactionListClick(stockId: string, txId: string): Promise<{ needsUIUpdate: boolean }> {
        if (stockId && txId) {
            const confirmDelete = await this.view.showConfirm(
                t('modal.confirmDeleteTransactionTitle'),
                t('modal.confirmDeleteTransactionMsg')
            );
            if (confirmDelete) {
                const success = await this.state.deleteTransaction(stockId, txId);
                if (success) {
                    const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
                    if (currency) {
                        const transactionsBeforeRender = this.state.getTransactions(stockId);
                        this.view.renderTransactionList(transactionsBeforeRender, currency);
                    }
                    this.view.showToast(t('toast.transactionDeleted'), 'success');
                    Calculator.clearPortfolioStateCache();
                    return { needsUIUpdate: true };
                } else {
                    this.view.showToast(t('toast.transactionDeleteFailed'), 'error');
                }
            }
        } else {
            console.error('handleTransactionListClick received invalid IDs:', stockId, txId);
        }
        return { needsUIUpdate: false };
    }
}