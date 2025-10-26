// js/eventBinder.js (Updated)
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

    // --- ⬇️ 데이터 관리 드롭다운 (A11Y 개선) ⬇️ ---
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
        e.stopPropagation(); // window 클릭 리스너와의 충돌 방지
        const isExpanded = dataManagementBtn.getAttribute('aria-expanded') === 'true';
        toggleDropdown(!isExpanded);
        if (!isExpanded && dropdownItems.length > 0) {
            (/** @type {HTMLElement} */ (dropdownItems[0])).focus(); // 첫 번째 항목으로 포커스
        }
    });

    // 드롭다운 메뉴 키보드 네비게이션
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
                dataManagementBtn?.focus(); // 버튼으로 포커스 복귀
                break;
            case 'Tab': // Tab 키 누르면 드롭다운 닫기
                toggleDropdown(false);
                // 기본 Tab 동작 유지
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
        controller.handleImportData(); // 파일 선택 창 열기
        toggleDropdown(false);
        dataManagementBtn?.focus();
    });

    // 드롭다운 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        const target = /** @type {Node | null} */ (e.target);
        if (dataManagementBtn && dataDropdownContent?.classList.contains('show') && !dataManagementBtn.contains(target)) {
            toggleDropdown(false);
        }
    });

    // 파일 선택 완료 시
    importFileInput?.addEventListener('change', (e) => controller.handleFileSelected(e));
    // --- ⬆️ 데이터 관리 드롭다운 (A11Y 개선) ⬆️ ---


    // 포트폴리오 테이블 입력 처리 (Debounce 적용)
    const debouncedUpdate = debounce(() => controller.updateUIState(), 300);
    dom.portfolioBody?.addEventListener('change', (e) => controller.handlePortfolioBodyChange(e, debouncedUpdate));
    dom.portfolioBody?.addEventListener('click', (e) => controller.handlePortfolioBodyClick(e));

    // --- ⬇️ 포트폴리오 테이블 키보드 네비게이션 개선 ⬇️ ---
    /** @type {HTMLElement | null} */
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
                 // 티커 입력 후 Enter 시 거래 관리 모달
                 if (field === 'ticker') {
                    e.preventDefault();
                    const stock = controller.state.getActivePortfolio()?.portfolioData.find(s => s.id === stockId);
                    const currency = controller.state.getActivePortfolio()?.settings.currentCurrency;
                    if (stock && currency) controller.view.openTransactionModal(stock, currency, controller.state.getTransactions(stockId));
                 }
                 // Shift + Enter: 이전 셀 이동, Enter: 다음 셀 이동
                 else if (currentCellIndex !== -1) {
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
                // 위/아래 방향키로 행 이동 (같은 필드)
                e.preventDefault();
                const siblingRow = (e.key === 'ArrowUp')
                    ? currentRow.previousElementSibling?.previousElementSibling // 위 입력 행
                    : currentRow.nextElementSibling?.nextElementSibling;      // 아래 입력 행

                if (siblingRow && siblingRow.matches('.stock-inputs') && currentCellIndex !== -1) {
                     const targetCell = siblingRow.cells[currentCellIndex];
                     const targetInput = /** @type {HTMLElement | null} */ (targetCell?.querySelector('input'));
                     targetInput?.focus();
                }
                break;
             case 'ArrowLeft':
             case 'ArrowRight':
                 // 좌/우 방향키로 셀 이동 (텍스트 입력 외)
                 if (target.type !== 'text' || target.selectionStart === (e.key === 'ArrowLeft' ? 0 : target.value.length)) {
                     e.preventDefault();
                     const direction = e.key === 'ArrowLeft' ? -1 : 1;
                     const nextCellIndex = (currentCellIndex + direction + currentRow.cells.length) % currentRow.cells.length;
                     const nextCell = currentRow.cells[nextCellIndex];
                     const nextInput = /** @type {HTMLElement | null} */ (nextCell?.querySelector('input'));
                     nextInput?.focus();
                 }
                 break;
            case 'Delete':
                // Ctrl + Delete 로 주식 삭제 (종목명 필드)
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
    // --- ⬆️ 포트폴리오 테이블 키보드 네비게이션 개선 ⬆️ ---


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
        /** @type {'add' | 'sell'} */
        const mode = target.value;
        controller.handleMainModeChange(mode);
    }));
    dom.currencyModeSelector?.forEach(r => r.addEventListener('change', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        /** @type {'krw' | 'usd'} */
        const currency = target.value;
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
        if (isValid) debouncedConversion('krw');
    });

    // 추가 투자금액 관련 필드 Enter 키 처리
    const handleEnterKey = (e) => {
        if (e.key === 'Enter' && !e.isComposing) {
            e.preventDefault();
            controller.handleCalculate();
        }
    };
    dom.additionalAmountInput?.addEventListener('keydown', handleEnterKey);
    dom.additionalAmountUSDInput?.addEventListener('keydown', handleEnterKey);
    dom.exchangeRateInput?.addEventListener('keydown', handleEnterKey);

    // 모달 관련 이벤트
    dom.closeModalBtn?.addEventListener('click', () => controller.view.closeTransactionModal());
    dom.transactionModal?.addEventListener('click', (e) => {
        if (e.target === dom.transactionModal) controller.view.closeTransactionModal();
    });
    dom.newTransactionForm?.addEventListener('submit', (e) => controller.handleAddNewTransaction(e));
    dom.transactionListBody?.addEventListener('click', (e) => controller.handleTransactionListClick(e));

    // 기타
    dom.darkModeToggle?.addEventListener('click', () => controller.handleToggleDarkMode());
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