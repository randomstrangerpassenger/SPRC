// js/eventBinder.js (Updated with Event Delegation)
// @ts-check
import { debounce } from './utils.js';
/** @typedef {import('./controller.js').PortfolioController} PortfolioController */

/**
 * @description 애플리케이션의 모든 DOM 이벤트 리스너를 컨트롤러의 핸들러 함수에 바인딩합니다.
 * @param {PortfolioController} controller - PortfolioController 인스턴스
 * @param {Record<string, HTMLElement | NodeListOf<HTMLElement> | null>} dom - 캐시된 DOM 요소 객체
 * @returns {void}
 */
export function bindEventListeners(controller, dom) {
    // 포트폴리오 관리 버튼
    dom.newPortfolioBtn?.addEventListener('click', () => controller.handleNewPortfolio());
    dom.renamePortfolioBtn?.addEventListener('click', () => controller.handleRenamePortfolio());
    dom.deletePortfolioBtn?.addEventListener('click', () => controller.handleDeletePortfolio());
    dom.portfolioSelector?.addEventListener('change', () => controller.handleSwitchPortfolio());

    // 포트폴리오 설정 버튼
    dom.addNewStockBtn?.addEventListener('click', () => controller.handleAddNewStock());
    dom.resetDataBtn?.addEventListener('click', () => controller.handleResetData());
    dom.normalizeRatiosBtn?.addEventListener('click', () => controller.handleNormalizeRatios());
    dom.fetchAllPricesBtn?.addEventListener('click', () => controller.handleFetchAllPrices());

    // 데이터 관리 드롭다운
    const dataManagementBtn = /** @type {HTMLButtonElement | null} */ (dom.dataManagementBtn);
    const dataDropdownContent = /** @type {HTMLElement | null} */ (dom.dataDropdownContent);
    const exportDataBtn = /** @type {HTMLAnchorElement | null} */ (dom.exportDataBtn);
    const importDataBtn = /** @type {HTMLAnchorElement | null} */ (dom.importDataBtn);
    const importFileInput = /** @type {HTMLInputElement | null} */ (dom.importFileInput);
    const dropdownItems = dataDropdownContent?.querySelectorAll('a[role="menuitem"]') ?? [];

    const toggleDropdown = (show) => {
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
            (/** @type {HTMLElement} */ (dropdownItems[0])).focus();
        }
    });

    dataDropdownContent?.addEventListener('keydown', (e) => {
        const target = /** @type {HTMLElement} */ (e.target);
        const currentIndex = Array.from(dropdownItems).indexOf(target);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % dropdownItems.length;
                (/** @type {HTMLElement} */ (dropdownItems[nextIndex])).focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + dropdownItems.length) % dropdownItems.length;
                (/** @type {HTMLElement} */ (dropdownItems[prevIndex])).focus();
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
        controller.handleExportData();
        toggleDropdown(false);
        dataManagementBtn?.focus();
    });

    importDataBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        controller.handleImportData();
        toggleDropdown(false);
        dataManagementBtn?.focus();
    });

    window.addEventListener('click', (e) => {
        const target = /** @type {Node | null} */ (e.target);
        if (dataManagementBtn && dataDropdownContent?.classList.contains('show') && !dataManagementBtn.contains(target)) {
            toggleDropdown(false);
        }
    });

    importFileInput?.addEventListener('change', (e) => controller.handleFileSelected(e));

    // 포트폴리오 테이블 입력 처리
    dom.portfolioBody?.addEventListener('change', (e) => controller.handlePortfolioBodyChange(e, null));
    dom.portfolioBody?.addEventListener('click', (e) => controller.handlePortfolioBodyClick(e));

    // 포트폴리오 테이블 키보드 네비게이션
    const portfolioBody = dom.portfolioBody;
    portfolioBody?.addEventListener('keydown', (e) => {
        const target = /** @type {HTMLElement} */ (e.target);
        if (!target || !(target.matches('input[type="text"], input[type="number"], input[type="checkbox"]'))) return;

        const currentRow = target.closest('tr[data-id]');
        if (!currentRow?.dataset.id) return;
        const stockId = currentRow.dataset.id;
        const currentCell = target.closest('td');
        const currentCellIndex = currentCell ? Array.from(currentRow.cells).indexOf(currentCell) : -1;
        const field = target.dataset.field;

        switch (e.key) {
            case 'Enter':
                 if (field === 'ticker') {
                    e.preventDefault();
                    const stock = controller.state.getActivePortfolio()?.portfolioData.find(s => s.id === stockId);
                    const currency = controller.state.getActivePortfolio()?.settings.currentCurrency;
                    if (stock && currency) controller.view.openTransactionModal(stock, currency, controller.state.getTransactions(stockId));
                 }
                 else if (currentCellIndex !== -1 && currentRow instanceof HTMLTableRowElement) { // Type guard
                    e.preventDefault();
                    const direction = e.shiftKey ? -1 : 1;
                    const nextCellIndex = (currentCellIndex + direction + currentRow.cells.length) % currentRow.cells.length;
                    const nextCell = currentRow.cells[nextCellIndex];
                    const nextInput = /** @type {HTMLElement | null} */ (nextCell?.querySelector('input'));
                    nextInput?.focus();
                 }
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                e.preventDefault();
                const siblingRow = (e.key === 'ArrowUp')
                    ? currentRow.previousElementSibling?.previousElementSibling
                    : currentRow.nextElementSibling?.nextElementSibling;

                if (siblingRow instanceof HTMLTableRowElement && siblingRow.matches('.stock-inputs') && currentCellIndex !== -1) { // Type guard
                     const targetCell = siblingRow.cells[currentCellIndex];
                     const targetInput = /** @type {HTMLElement | null} */ (targetCell?.querySelector('input'));
                     targetInput?.focus();
                }
                break;
             case 'ArrowLeft':
             case 'ArrowRight':
                 if (target instanceof HTMLInputElement && (target.type !== 'text' || target.selectionStart === (e.key === 'ArrowLeft' ? 0 : target.value.length)) && currentRow instanceof HTMLTableRowElement) { // Type guards
                     e.preventDefault();
                     const direction = e.key === 'ArrowLeft' ? -1 : 1;
                     const nextCellIndex = (currentCellIndex + direction + currentRow.cells.length) % currentRow.cells.length;
                     const nextCell = currentRow.cells[nextCellIndex];
                     const nextInput = /** @type {HTMLElement | null} */ (nextCell?.querySelector('input'));
                     nextInput?.focus();
                 }
                 break;
            case 'Delete':
                if (e.ctrlKey && field === 'name') {
                     e.preventDefault();
                     controller.handleDeleteStock(stockId);
                }
                break;
            case 'Escape':
                 e.preventDefault();
                 target.blur();
                 break;
        }
    });

    // 숫자 입력 필드 포커스 시 전체 선택
    dom.portfolioBody?.addEventListener('focusin', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        if (target.tagName === 'INPUT' && target.type === 'number') {
            target.select();
        }
    });

    // 계산 버튼
    dom.calculateBtn?.addEventListener('click', () => controller.handleCalculate());
    dom.calculateBtn?.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            controller.handleCalculate();
        }
    });

    // 계산/통화 모드 라디오 버튼
    dom.mainModeSelector?.forEach(r => r.addEventListener('change', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        const mode = /** @type {'add' | 'sell'} */ (target.value);
        controller.handleMainModeChange(mode);
    }));
    dom.currencyModeSelector?.forEach(r => r.addEventListener('change', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        const currency = /** @type {'krw' | 'usd'} */ (target.value);
        controller.handleCurrencyModeChange(currency);
    }));

    // 추가 투자금액 입력 및 환율 변환
    const debouncedConversion = debounce((source) => controller.handleCurrencyConversion(source), 300);
    dom.additionalAmountInput?.addEventListener('input', () => debouncedConversion('krw'));
    dom.additionalAmountUSDInput?.addEventListener('input', () => debouncedConversion('usd'));
    dom.exchangeRateInput?.addEventListener('input', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        const rate = parseFloat(target.value);
        const isValid = !isNaN(rate) && rate > 0;
        controller.view.toggleInputValidation(target, isValid);
        if (isValid) debouncedConversion('krw'); // 환율 변경 시 원화 기준으로 USD 금액 재계산
    });

    // 추가 투자금액 관련 필드 Enter 키 처리
    const handleEnterKey = (e) => {
        if (e.key === 'Enter' && !(e.target instanceof HTMLInputElement && e.target.isComposing)) { // Type guard and isComposing check
            e.preventDefault();
            controller.handleCalculate();
        }
    };
    dom.additionalAmountInput?.addEventListener('keydown', handleEnterKey);
    dom.additionalAmountUSDInput?.addEventListener('keydown', handleEnterKey);
    dom.exchangeRateInput?.addEventListener('keydown', handleEnterKey);

    // --- 모달 관련 이벤트 ---
    // 거래 내역 모달 닫기 버튼
    dom.closeModalBtn?.addEventListener('click', () => controller.view.closeTransactionModal());

    // 새 거래 추가 폼 제출
    dom.newTransactionForm?.addEventListener('submit', (e) => controller.handleAddNewTransaction(e));

    // --- ⬇️ 수정: 이벤트 위임 방식으로 변경 ⬇️ ---
    // console.log("Event Binding: Attempting to bind click listener to:", dom.transactionListBody); // 로그 제거

    // 거래 내역 목록 내 삭제 버튼 클릭 (이벤트 위임)
    dom.transactionModal?.addEventListener('click', (e) => {
        const target = /** @type {HTMLElement} */ (e.target);
        const deleteButton = target.closest('button[data-action="delete-tx"]');

        // 1. 삭제 버튼이 클릭된 경우 핸들러 호출
        if (deleteButton) {
            console.log("!!! Delete button clicked via delegation !!!", deleteButton); // 디버깅 로그

            const row = deleteButton.closest('tr[data-tx-id]');
            const modal = deleteButton.closest('#transactionModal');
            const stockId = modal?.dataset.stockId;
            const txId = row?.dataset.txId;

            console.log(`Delegation: stockId=${stockId}, txId=${txId}`); // ID 확인

            // 2. 컨트롤러 함수에 필요한 ID 직접 전달
            if (stockId && txId) {
                controller.handleTransactionListClick(stockId, txId); // event 대신 ID 전달
            }
        }

        // 3. 모달 오버레이 클릭 시 닫기 (주석 해제 및 로직 유지)
        if (e.target === dom.transactionModal) {
             console.log("Overlay clicked, closing modal."); // 오버레이 클릭 로그
             controller.view.closeTransactionModal();
        }
    });

    /* // 이전 tbody 리스너 제거
    dom.transactionListBody?.addEventListener('click', (e) => {
        console.log("!!! transactionListBody CLICKED !!!", e.target);
        // controller.handleTransactionListClick(e);
    });
    */
    // --- ⬆️ 수정 완료 ⬆️ ---


    // --- 기타 ---
    // 다크 모드 토글 버튼
    dom.darkModeToggle?.addEventListener('click', () => controller.handleToggleDarkMode());
    // 페이지 닫기 전 자동 저장 (동기식 저장 시도)
    window.addEventListener('beforeunload', () => controller.handleSaveDataOnExit());

    // 키보드 네비게이션 포커스 스타일
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        }
    });
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
    });
}