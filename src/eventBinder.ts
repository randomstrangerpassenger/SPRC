// src/eventBinder.ts (Updated with Pub/Sub emit)
import { debounce } from './utils';
import Decimal from 'decimal.js';
import type { PortfolioView } from './view';

/**
 * @description 애플리케이션의 DOM 이벤트를 View의 추상 이벤트로 연결합니다.
 * @param view - PortfolioView 인스턴스
 * @returns 이벤트 리스너 정리를 위한 AbortController
 */
export function bindEventListeners(view: PortfolioView): AbortController {
    // AbortController 생성 (메모리 누수 방지)
    const abortController = new AbortController();
    const { signal } = abortController;

    // 1. view.dom 객체를 가져옵니다.
    const dom = view.dom;

    // ▼▼▼▼▼ [수정] controller.handle...() -> view.emit('eventName') ▼▼▼▼▼

    // 포트폴리오 관리 버튼 (AbortController signal 적용)
    dom.newPortfolioBtn?.addEventListener('click', () => view.emit('newPortfolioClicked'), { signal });
    dom.renamePortfolioBtn?.addEventListener('click', () => view.emit('renamePortfolioClicked'), { signal });
    dom.deletePortfolioBtn?.addEventListener('click', () => view.emit('deletePortfolioClicked'), { signal });
    dom.portfolioSelector?.addEventListener('change', (e) =>
        view.emit('portfolioSwitched', { newId: (e.target as HTMLSelectElement).value })
    );

    // 포트폴리오 설정 버튼
    dom.addNewStockBtn?.addEventListener('click', () => view.emit('addNewStockClicked'));
    dom.resetDataBtn?.addEventListener('click', () => view.emit('resetDataClicked'));
    dom.normalizeRatiosBtn?.addEventListener('click', () => view.emit('normalizeRatiosClicked'));
    dom.fetchAllPricesBtn?.addEventListener('click', () => view.emit('fetchAllPricesClicked'));

    // 데이터 관리 드롭다운
    const dataManagementBtn = dom.dataManagementBtn as HTMLButtonElement | null;
    const dataDropdownContent = dom.dataDropdownContent as HTMLElement | null;
    const exportDataBtn = dom.exportDataBtn as HTMLAnchorElement | null;
    const importDataBtn = dom.importDataBtn as HTMLAnchorElement | null;
    const importFileInput = dom.importFileInput as HTMLInputElement | null;
    const dropdownItems = dataDropdownContent?.querySelectorAll('a[role="menuitem"]') ?? [];

    const toggleDropdown = (show: boolean): void => {
        if (dataDropdownContent && dataManagementBtn) {
            dataDropdownContent.classList.toggle('show', show);
            dataManagementBtn.setAttribute('aria-expanded', String(show));
        }
    };

    dataManagementBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = dataManagementBtn.getAttribute('aria-expanded') === 'true';
        toggleDropdown(!isExpanded);
        if (!isExpanded && dropdownItems.length > 0) {
            (dropdownItems[0] as HTMLElement).focus();
        }
    });

    dataDropdownContent?.addEventListener('keydown', (e) => {
        const target = e.target as HTMLElement;
        const currentIndex = Array.from(dropdownItems).indexOf(target);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % dropdownItems.length;
                (dropdownItems[nextIndex] as HTMLElement).focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + dropdownItems.length) % dropdownItems.length;
                (dropdownItems[prevIndex] as HTMLElement).focus();
                break;
            case 'Escape':
                toggleDropdown(false);
                dataManagementBtn?.focus();
                break;
            case 'Tab':
                toggleDropdown(false);
                break;
        }
    });


    exportDataBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        view.emit('exportDataClicked');
        toggleDropdown(false);
        dataManagementBtn?.focus();
    });

    importDataBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        view.emit('importDataClicked');
        toggleDropdown(false);
        dataManagementBtn?.focus();
    });

    window.addEventListener('click', (e) => {
        const target = e.target as Node | null;
        if (dataManagementBtn && dataDropdownContent?.classList.contains('show') && !dataManagementBtn.contains(target)) {
            toggleDropdown(false);
        }
    });

    importFileInput?.addEventListener('change', (e) => view.emit('fileSelected', e));

    // 포트폴리오 테이블 입력 처리
    dom.virtualScrollWrapper?.addEventListener('change', (e) =>
        view.emit('portfolioBodyChanged', e)
    );
    dom.virtualScrollWrapper?.addEventListener('click', (e) =>
        view.emit('portfolioBodyClicked', e)
    );

    // 포트폴리오 테이블 키보드 네비게이션
    const virtualScrollWrapper = dom.virtualScrollWrapper;
    virtualScrollWrapper?.addEventListener('keydown', (e) => {
        const target = e.target as HTMLElement;
        if (!target || !(target.matches('input[type="text"], input[type="number"], input[type="checkbox"]'))) return;

        const currentRow = target.closest('div[data-id]') as HTMLDivElement | null;
        if (!currentRow?.dataset.id) return;
        const stockId = currentRow.dataset.id;
        const currentCell = target.closest('.virtual-cell');
        const currentCellIndex = currentCell ? Array.from(currentRow.children).indexOf(currentCell) : -1;
        const field = (target as HTMLInputElement).dataset.field;

        switch (e.key) {
            case 'Enter':
                 if (field === 'ticker') {
                    e.preventDefault();
                    // 컨트롤러가 할 일(모달 열기)을 View에 이벤트로 알림
                    view.emit('manageStockClicked', { stockId });
                 }
                 else if (currentCellIndex !== -1 && currentRow instanceof HTMLDivElement) {
                    e.preventDefault();
                    const direction = e.shiftKey ? -1 : 1;
                    const nextCellIndex = (currentCellIndex + direction + currentRow.children.length) % currentRow.children.length;
                    const nextCell = currentRow.children[nextCellIndex];
                    const nextInput = nextCell?.querySelector('input') as HTMLElement | null;
                    nextInput?.focus();
                 }
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                e.preventDefault();
                const siblingRow = (e.key === 'ArrowUp')
                    ? currentRow.previousElementSibling?.previousElementSibling
                    : currentRow.nextElementSibling?.nextElementSibling;

                if (siblingRow instanceof HTMLDivElement && siblingRow.matches('.virtual-row-inputs') && currentCellIndex !== -1) {
                     const targetCell = siblingRow.children[currentCellIndex];
                     const targetInput = targetCell?.querySelector('input') as HTMLElement | null;
                     targetInput?.focus();
                }
                break;
             case 'ArrowLeft':
             case 'ArrowRight':
                 if (target instanceof HTMLInputElement && (target.type !== 'text' || target.selectionStart === (e.key === 'ArrowLeft' ? 0 : target.value.length)) && currentRow instanceof HTMLDivElement) {
                     e.preventDefault();
                     const direction = e.key === 'ArrowLeft' ? -1 : 1;
                     const nextCellIndex = (currentCellIndex + direction + currentRow.children.length) % currentRow.children.length;
                     const nextCell = currentRow.children[nextCellIndex];
                     const nextInput = nextCell?.querySelector('input') as HTMLElement | null;
                     nextInput?.focus();
                 }
                 break;
            case 'Delete':
                if (e.ctrlKey && field === 'name') {
                     e.preventDefault();
                     view.emit('deleteStockShortcut', { stockId });
                }
                break;
            case 'Escape':
                 e.preventDefault();
                 target.blur();
                 break;
        }
    });

    // 숫자 입력 필드 포커스 시 전체 선택
    dom.virtualScrollWrapper?.addEventListener('focusin', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.tagName === 'INPUT' && target.type === 'number') {
            target.select();
        }
    });

    // 계산 버튼
    dom.calculateBtn?.addEventListener('click', () => view.emit('calculateClicked'));
    dom.calculateBtn?.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            view.emit('calculateClicked');
        }
    });

    // 성과 히스토리 버튼
    dom.showPerformanceHistoryBtn?.addEventListener('click', () => view.emit('showPerformanceHistoryClicked'));

    // 계산/통화 모드 라디오 버튼
    dom.mainModeSelector?.forEach(r => r.addEventListener('change', (e) => {
        const mode = (e.target as HTMLInputElement).value as 'add' | 'sell' | 'simple';
        view.emit('mainModeChanged', { mode });
    }));
    dom.currencyModeSelector?.forEach(r => r.addEventListener('change', (e) => {
        const currency = (e.target as HTMLInputElement).value as 'krw' | 'usd';
        view.emit('currencyModeChanged', { currency });
    }));

    // 추가 투자금액 입력 및 환율 변환
    const debouncedConversion = debounce((source: 'krw' | 'usd') => view.emit('currencyConversion', { source }), 300);
    dom.additionalAmountInput?.addEventListener('input', () => debouncedConversion('krw'));
    dom.additionalAmountUSDInput?.addEventListener('input', () => debouncedConversion('usd'));
    dom.exchangeRateInput?.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const rate = parseFloat(target.value);
        const isValid = !isNaN(rate) && rate > 0;
        view.toggleInputValidation(target, isValid);
        if (isValid) debouncedConversion('krw');
    });

    // 추가 투자금액 관련 필드 Enter 키 처리
    const handleEnterKey = (e: KeyboardEvent): void => {
        if (e.key === 'Enter' && !(e.target instanceof HTMLInputElement && (e.target as any).isComposing)) {
            e.preventDefault();
            view.emit('calculateClicked');
        }
    };
    dom.additionalAmountInput?.addEventListener('keydown', handleEnterKey);
    dom.additionalAmountUSDInput?.addEventListener('keydown', handleEnterKey);
    dom.exchangeRateInput?.addEventListener('keydown', handleEnterKey);

    // 포트폴리오 환율 설정
    dom.portfolioExchangeRateInput?.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const rate = parseFloat(target.value);
        const isValid = !isNaN(rate) && rate > 0;
        view.toggleInputValidation(target, isValid);
        if (isValid) {
            // 두 환율 입력란 동기화
            if (dom.exchangeRateInput instanceof HTMLInputElement) {
                dom.exchangeRateInput.value = target.value;
            }
            // 포트폴리오 설정 업데이트
            view.emit('portfolioExchangeRateChanged', { rate });
            // 추가 투자금 재계산 (USD 모드인 경우)
            debouncedConversion('krw');
        }
    });

    // 추가 투자금 섹션의 환율 변경 시 포트폴리오 환율과 동기화
    const originalExchangeRateHandler = dom.exchangeRateInput;
    if (originalExchangeRateHandler) {
        originalExchangeRateHandler.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const rate = parseFloat(target.value);
            if (!isNaN(rate) && rate > 0) {
                // 포트폴리오 환율 입력란과 동기화
                if (dom.portfolioExchangeRateInput instanceof HTMLInputElement) {
                    dom.portfolioExchangeRateInput.value = target.value;
                }
                // 포트폴리오 설정 업데이트
                view.emit('portfolioExchangeRateChanged', { rate });
            }
        });
    }

    // --- 모달 관련 이벤트 ---
    // 거래 내역 모달 닫기 버튼
    dom.closeModalBtn?.addEventListener('click', () => view.emit('closeTransactionModalClicked'));

    // 새 거래 추가 폼 제출
    dom.newTransactionForm?.addEventListener('submit', (e) => view.emit('newTransactionSubmitted', e));

    // 입력 방식 전환 (수량 입력 vs 금액 입력)
    const inputModeQuantity = document.getElementById('inputModeQuantity');
    const inputModeAmount = document.getElementById('inputModeAmount');
    const quantityInputGroup = document.getElementById('quantityInputGroup');
    const totalAmountInputGroup = document.getElementById('totalAmountInputGroup');
    const txQuantityInput = document.getElementById('txQuantity') as HTMLInputElement | null;
    const txTotalAmountInput = document.getElementById('txTotalAmount') as HTMLInputElement | null;
    const calculatedQuantityDisplay = document.getElementById('calculatedQuantityDisplay');

    const toggleInputMode = (): void => {
        const isQuantityMode = inputModeQuantity instanceof HTMLInputElement && inputModeQuantity.checked;

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
        const isAmountMode = inputModeAmount instanceof HTMLInputElement && inputModeAmount.checked;
        if (!isAmountMode) return;

        const txPriceInput = document.getElementById('txPrice') as HTMLInputElement | null;
        const calculatedQuantityValue = document.getElementById('calculatedQuantityValue');

        if (txTotalAmountInput && txPriceInput && calculatedQuantityValue) {
            try {
                const totalAmount = txTotalAmountInput.value ? new Decimal(txTotalAmountInput.value) : new Decimal(0);
                const price = txPriceInput.value ? new Decimal(txPriceInput.value) : new Decimal(0);

                if (price.greaterThan(0) && totalAmount.greaterThan(0)) {
                    const quantity = totalAmount.div(price);
                    calculatedQuantityValue.textContent = quantity.toFixed(8);
                } else {
                    calculatedQuantityValue.textContent = '0';
                }
            } catch (error) {
                calculatedQuantityValue.textContent = '0';
                console.error('Error calculating quantity from amount:', error);
            }
        }
    };

    txTotalAmountInput?.addEventListener('input', calculateQuantityFromAmount);
    document.getElementById('txPrice')?.addEventListener('input', calculateQuantityFromAmount);

    // 거래 내역 목록 내 삭제 버튼 클릭 (이벤트 위임)
    dom.transactionModal?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const deleteButton = target.closest('button[data-action="delete-tx"]');

        // 1. 삭제 버튼이 클릭된 경우 핸들러 호출
        if (deleteButton) {
            const row = deleteButton.closest('tr[data-tx-id]') as HTMLTableRowElement | null;
            const modal = deleteButton.closest('#transactionModal') as HTMLElement | null;
            const stockId = modal?.dataset.stockId;
            const txId = row?.dataset.txId;

            // 2. 컨트롤러 함수에 필요한 ID 직접 전달
            if (stockId && txId) {
                view.emit('transactionDeleteClicked', { stockId, txId });
            }
        }

        // 3. 모달 오버레이 클릭 시 닫기
        if (e.target === dom.transactionModal) {
             view.emit('closeTransactionModalClicked');
        }
    });

    // --- 기타 ---
    // 다크 모드 토글 버튼
    dom.darkModeToggle?.addEventListener('click', () => view.emit('darkModeToggleClicked'), { signal });
    // 페이지 닫기 전 자동 저장 (beforeunload는 signal 미적용 - 브라우저 이벤트)
    window.addEventListener('beforeunload', () => view.emit('pageUnloading'));

    // 키보드 네비게이션 포커스 스타일
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        }
    }, { signal });
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
    }, { signal });

    // AbortController 반환 (메모리 누수 방지용 cleanup)
    return abortController;
}