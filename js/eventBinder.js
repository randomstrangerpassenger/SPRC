// js/eventBinder.js (Updated with Pub/Sub emit)
// @ts-check
import { debounce } from './utils.js';
/** @typedef {import('./view.js').PortfolioView} PortfolioView */ // 컨트롤러 대신 View를 임포트

/**
 * @description 애플리케이션의 DOM 이벤트를 View의 추상 이벤트로 연결합니다.
 * @param {PortfolioView} view - PortfolioView 인스턴스
 * @returns {void}
 */
export function bindEventListeners(view) {
    // 1. view.dom 객체를 가져옵니다.
    const dom = view.dom;

    // ▼▼▼▼▼ [수정] controller.handle...() -> view.emit('eventName') ▼▼▼▼▼

    // 포트폴리오 관리 버튼
    dom.newPortfolioBtn?.addEventListener('click', () => view.emit('newPortfolioClicked'));
    dom.renamePortfolioBtn?.addEventListener('click', () => view.emit('renamePortfolioClicked'));
    dom.deletePortfolioBtn?.addEventListener('click', () => view.emit('deletePortfolioClicked'));
    dom.portfolioSelector?.addEventListener('change', (e) => 
        view.emit('portfolioSwitched', { newId: (/** @type {HTMLSelectElement} */ (e.target)).value })
    );

    // 포트폴리오 설정 버튼
    dom.addNewStockBtn?.addEventListener('click', () => view.emit('addNewStockClicked'));
    dom.resetDataBtn?.addEventListener('click', () => view.emit('resetDataClicked'));
    dom.normalizeRatiosBtn?.addEventListener('click', () => view.emit('normalizeRatiosClicked'));
    dom.fetchAllPricesBtn?.addEventListener('click', () => view.emit('fetchAllPricesClicked'));

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
        view.emit('exportDataClicked'); // view.emit으로 변경
        toggleDropdown(false);
        dataManagementBtn?.focus();
    });

    importDataBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        view.emit('importDataClicked'); // view.emit으로 변경
        toggleDropdown(false);
        dataManagementBtn?.focus();
    });

    window.addEventListener('click', (e) => {
        const target = /** @type {Node | null} */ (e.target);
        if (dataManagementBtn && dataDropdownContent?.classList.contains('show') && !dataManagementBtn.contains(target)) {
            toggleDropdown(false);
        }
    });

    importFileInput?.addEventListener('change', (e) => view.emit('fileSelected', e)); // view.emit으로 변경

    // 포트폴리오 테이블 입력 처리
    dom.portfolioBody?.addEventListener('change', (e) => 
        view.emit('portfolioBodyChanged', e) // view.emit으로 변경
    );
    dom.portfolioBody?.addEventListener('click', (e) => 
        view.emit('portfolioBodyClicked', e) // view.emit으로 변경
    );

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
                    // 컨트롤러가 할 일(모달 열기)을 View에 이벤트로 알림
                    view.emit('manageStockClicked', { stockId });
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
                     view.emit('deleteStockShortcut', { stockId }); // 삭제 이벤트 발행
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
    dom.calculateBtn?.addEventListener('click', () => view.emit('calculateClicked')); // view.emit으로 변경
    dom.calculateBtn?.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            view.emit('calculateClicked'); // view.emit으로 변경
        }
    });

    // 계산/통화 모드 라디오 버튼
    dom.mainModeSelector?.forEach(r => r.addEventListener('change', (e) => {
        const mode = /** @type {'add' | 'sell'} */ ((/** @type {HTMLInputElement} */ (e.target)).value);
        view.emit('mainModeChanged', { mode }); // view.emit으로 변경
    }));
    dom.currencyModeSelector?.forEach(r => r.addEventListener('change', (e) => {
        const currency = /** @type {'krw' | 'usd'} */ ((/** @type {HTMLInputElement} */ (e.target)).value);
        view.emit('currencyModeChanged', { currency }); // view.emit으로 변경
    }));

    // 추가 투자금액 입력 및 환율 변환
    const debouncedConversion = debounce((source) => view.emit('currencyConversion', { source }), 300); // view.emit으로 변경
    dom.additionalAmountInput?.addEventListener('input', () => debouncedConversion('krw'));
    dom.additionalAmountUSDInput?.addEventListener('input', () => debouncedConversion('usd'));
    dom.exchangeRateInput?.addEventListener('input', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        const rate = parseFloat(target.value);
        const isValid = !isNaN(rate) && rate > 0;
        view.toggleInputValidation(target, isValid); // View 자체 검증은 유지
        if (isValid) debouncedConversion('krw'); 
    });

    // 추가 투자금액 관련 필드 Enter 키 처리
    const handleEnterKey = (e) => {
        if (e.key === 'Enter' && !(e.target instanceof HTMLInputElement && e.target.isComposing)) { // Type guard and isComposing check
            e.preventDefault();
            view.emit('calculateClicked'); // view.emit으로 변경
        }
    };
    dom.additionalAmountInput?.addEventListener('keydown', handleEnterKey);
    dom.additionalAmountUSDInput?.addEventListener('keydown', handleEnterKey);
    dom.exchangeRateInput?.addEventListener('keydown', handleEnterKey);

    // --- 모달 관련 이벤트 ---
    // 거래 내역 모달 닫기 버튼
    dom.closeModalBtn?.addEventListener('click', () => view.emit('closeTransactionModalClicked')); // view.emit으로 변경

    // 새 거래 추가 폼 제출
    dom.newTransactionForm?.addEventListener('submit', (e) => view.emit('newTransactionSubmitted', e)); // view.emit으로 변경

    // 거래 내역 목록 내 삭제 버튼 클릭 (이벤트 위임)
    dom.transactionModal?.addEventListener('click', (e) => {
        const target = /** @type {HTMLElement} */ (e.target);
        const deleteButton = target.closest('button[data-action="delete-tx"]');

        // 1. 삭제 버튼이 클릭된 경우 핸들러 호출
        if (deleteButton) {
            const row = deleteButton.closest('tr[data-tx-id]');
            const modal = deleteButton.closest('#transactionModal');
            const stockId = modal?.dataset.stockId;
            const txId = row?.dataset.txId;

            // 2. 컨트롤러 함수에 필요한 ID 직접 전달
            if (stockId && txId) {
                // controller.handleTransactionListClick(stockId, txId) 대신 emit
                view.emit('transactionDeleteClicked', { stockId, txId }); 
            }
        }

        // 3. 모달 오버레이 클릭 시 닫기
        if (e.target === dom.transactionModal) {
             view.emit('closeTransactionModalClicked'); // view.emit으로 변경
        }
    });

    // --- 기타 ---
    // 다크 모드 토글 버튼
    dom.darkModeToggle?.addEventListener('click', () => view.emit('darkModeToggleClicked')); // view.emit으로 변경
    // 페이지 닫기 전 자동 저장 (동기식 저장 시도)
    window.addEventListener('beforeunload', () => view.emit('pageUnloading')); // view.emit으로 변경

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