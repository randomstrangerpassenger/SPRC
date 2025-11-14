// src/eventBinder/modalEvents.ts
import Decimal from 'decimal.js';
import type { PortfolioView } from '../view';
import { logger } from '../services/Logger';
import { isInputElement } from '../utils';

/**
 * @description 모달 관련 이벤트 바인딩
 * @param view - PortfolioView 인스턴스
 * @param signal - AbortController signal
 */
export function setupModalEvents(view: PortfolioView, signal: AbortSignal): void {
    const dom = view.dom;

    // 거래 내역 모달 닫기 버튼
    dom.closeModalBtn?.addEventListener('click', () => view.emit('closeTransactionModalClicked'));

    // 새 거래 추가 폼 제출
    dom.newTransactionForm?.addEventListener('submit', (e) =>
        view.emit('newTransactionSubmitted', e)
    );

    // 입력 방식 전환 (수량 입력 vs 금액 입력)
    const inputModeQuantity = document.getElementById('inputModeQuantity');
    const inputModeAmount = document.getElementById('inputModeAmount');
    const quantityInputGroup = document.getElementById('quantityInputGroup');
    const totalAmountInputGroup = document.getElementById('totalAmountInputGroup');
    const txQuantityInput = document.getElementById('txQuantity') as HTMLInputElement | null;
    const txTotalAmountInput = document.getElementById('txTotalAmount') as HTMLInputElement | null;
    const calculatedQuantityDisplay = document.getElementById('calculatedQuantityDisplay');

    const toggleInputMode = (): void => {
        const isQuantityMode = isInputElement(inputModeQuantity) && inputModeQuantity.checked;

        if (quantityInputGroup && totalAmountInputGroup && txQuantityInput && txTotalAmountInput) {
            if (isQuantityMode) {
                // 수량 입력 모드
                quantityInputGroup.style.display = '';
                totalAmountInputGroup.style.display = 'none';
                txQuantityInput.required = true;
                txTotalAmountInput.required = false;
                txTotalAmountInput.value = '';
                if (calculatedQuantityDisplay) calculatedQuantityDisplay.style.display = 'none';
            } else {
                // 금액 입력 모드
                quantityInputGroup.style.display = 'none';
                totalAmountInputGroup.style.display = '';
                txQuantityInput.required = false;
                txTotalAmountInput.required = true;
                txQuantityInput.value = '';
                if (calculatedQuantityDisplay) calculatedQuantityDisplay.style.display = 'block';
            }
        }
    };

    inputModeQuantity?.addEventListener('change', toggleInputMode);
    inputModeAmount?.addEventListener('change', toggleInputMode);

    // 금액 입력 모드에서 총 금액 또는 단가 변경 시 수량 자동 계산 (Decimal.js 사용)
    const calculateQuantityFromAmount = (): void => {
        const isAmountMode = isInputElement(inputModeAmount) && inputModeAmount.checked;
        if (!isAmountMode) return;

        const txPriceInput = document.getElementById('txPrice') as HTMLInputElement | null;
        const calculatedQuantityValue = document.getElementById('calculatedQuantityValue');

        if (txTotalAmountInput && txPriceInput && calculatedQuantityValue) {
            try {
                const totalAmount = txTotalAmountInput.value
                    ? new Decimal(txTotalAmountInput.value)
                    : new Decimal(0);
                const price = txPriceInput.value ? new Decimal(txPriceInput.value) : new Decimal(0);

                if (price.greaterThan(0) && totalAmount.greaterThan(0)) {
                    const quantity = totalAmount.div(price);
                    calculatedQuantityValue.textContent = quantity.toFixed(8);
                } else {
                    calculatedQuantityValue.textContent = '0';
                }
            } catch (error) {
                calculatedQuantityValue.textContent = '0';
                logger.error('Error calculating quantity from amount', 'ModalEvents', error);
            }
        }
    };

    txTotalAmountInput?.addEventListener('input', calculateQuantityFromAmount);
    document.getElementById('txPrice')?.addEventListener('input', calculateQuantityFromAmount);

    // 거래 내역 목록 내 삭제 버튼 클릭 (이벤트 위임)
    dom.transactionModal?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const deleteButton = target.closest('button[data-action="delete-tx"]');

        // 삭제 버튼이 클릭된 경우 핸들러 호출
        if (deleteButton) {
            const row = deleteButton.closest('tr[data-tx-id]');
            const modal = deleteButton.closest('#transactionModal');
            const stockId = modal?.dataset.stockId;
            const txId = row?.dataset.txId;

            // 컨트롤러 함수에 필요한 ID 직접 전달
            if (stockId && txId) {
                view.emit('transactionDeleteClicked', { stockId, txId });
            }
        }

        // 모달 오버레이 클릭 시 닫기
        if (e.target === dom.transactionModal) {
            view.emit('closeTransactionModalClicked');
        }
    });

    // 모달 외부 클릭 이벤트 (포트폴리오 이름 변경 등)
    document.addEventListener(
        'click',
        (e) => {
            if (e.target === document.getElementById('renamePortfolioModal')) {
                view.emit('renamePortfolioModalClosed');
            }
        },
        { signal }
    );
}
