// @ts-check
import { debounce } from './utils.js';
/** @typedef {import('./controller.js').PortfolioController} PortfolioController */

/**
 * @description 애플리케이션의 모든 DOM 이벤트 리스너를 컨트롤러의 핸들러 함수에 바인딩합니다.
 * @param {PortfolioController} controller - PortfolioController 인스턴스
 * @param {Record<string, HTMLElement | NodeListOf<HTMLElement>>} dom - 캐시된 DOM 요소 객체
 * @returns {void}
 */
export function bindEventListeners(controller, dom) {
    // 포트폴리오 관리 버튼
    // @ts-ignore
    dom.newPortfolioBtn?.addEventListener('click', () => controller.handleNewPortfolio());
    // @ts-ignore
    dom.renamePortfolioBtn?.addEventListener('click', () => controller.handleRenamePortfolio());
    // @ts-ignore
    dom.deletePortfolioBtn?.addEventListener('click', () => controller.handleDeletePortfolio());
    // @ts-ignore
    dom.portfolioSelector?.addEventListener('change', () => controller.handleSwitchPortfolio());

    // 포트폴리오 설정 버튼
    // @ts-ignore
    dom.addNewStockBtn?.addEventListener('click', () => controller.handleAddNewStock());
    // @ts-ignore
    dom.resetDataBtn?.addEventListener('click', () => controller.handleResetData());
    // @ts-ignore
    dom.normalizeRatiosBtn?.addEventListener('click', () => controller.handleNormalizeRatios());
    // @ts-ignore
    dom.fetchAllPricesBtn?.addEventListener('click', () => controller.handleFetchAllPrices()); // API 버튼 추가

    // 데이터 관리 드롭다운
    const dataManagementBtn = /** @type {HTMLElement} */ (document.getElementById('dataManagementBtn'));
    const dataDropdownContent = /** @type {HTMLElement} */ (document.getElementById('dataDropdownContent'));
    const exportDataBtn = /** @type {HTMLElement} */ (document.getElementById('exportDataBtn'));
    const importDataBtn = /** @type {HTMLElement} */ (document.getElementById('importDataBtn'));
    const importFileInput = /** @type {HTMLInputElement} */ (document.getElementById('importFileInput'));

    dataManagementBtn?.addEventListener('click', () => {
        dataDropdownContent?.classList.toggle('show');
    });

    exportDataBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        controller.handleExportData();
        dataDropdownContent?.classList.remove('show');
    });

    importDataBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        controller.handleImportData(); // 파일 선택 창 열기
        dataDropdownContent?.classList.remove('show');
    });

    // 드롭다운 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        const target = /** @type {Node | null} */ (e.target);
        if (dataManagementBtn && dataDropdownContent && !dataManagementBtn.contains(target)) {
            dataDropdownContent.classList.remove('show');
        }
    });

    // 파일 선택 완료 시
    importFileInput?.addEventListener('change', (e) => controller.handleFileSelected(e));

    // 포트폴리오 테이블 입력 처리 (Debounce 적용)
    const debouncedUpdate = debounce(() => controller.updateUIState(), 300);
    // @ts-ignore
    dom.portfolioBody?.addEventListener('change', (e) => controller.handlePortfolioBodyChange(e, debouncedUpdate));
    // @ts-ignore
    dom.portfolioBody?.addEventListener('click', (e) => controller.handlePortfolioBodyClick(e));
    
    // 포트폴리오 테이블 내 키보드 네비게이션 및 단축키
    /** @type {HTMLElement | null} */
    const portfolioBody = dom.portfolioBody;
    portfolioBody?.addEventListener('keydown', (e) => {
        const target = /** @type {HTMLElement} */ (e.target);
        if (!target || !(target.matches('input[type="text"], input[type="number"], input[type="checkbox"]'))) return; // 입력 요소에서만 동작

        const row = target.closest('tr[data-id]');
        if (!row?.dataset.id) return;
        const stockId = row.dataset.id;
        const field = target.dataset.field;

        switch (e.key) {
            case 'Enter':
                 // 티커 입력 후 Enter 시 거래 관리 모달 열기
                 if (field === 'ticker') {
                    e.preventDefault();
                    const stock = controller.state.getActivePortfolio()?.portfolioData.find(s => s.id === stockId);
                    const currency = controller.state.getActivePortfolio()?.settings.currentCurrency;
                    if (stock && currency) controller.view.openTransactionModal(stock, currency, controller.state.getTransactions(stockId));
                 }
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                // 위/아래 방향키로 행 이동
                e.preventDefault();
                const parentTbody = row.parentNode;
                const siblingRow = (e.key === 'ArrowUp') ? row.previousElementSibling?.previousElementSibling : row.nextElementSibling?.nextElementSibling; // 입력행 기준으로 2칸 이동

                if (siblingRow && siblingRow.matches('.stock-inputs')) {
                    const targetInput = /** @type {HTMLElement | null} */ (siblingRow.querySelector(`[data-field="${field}"]`));
                    targetInput?.focus();
                }
                break;
            case 'Delete':
                // Ctrl + Delete 로 주식 삭제 (종목명 필드에서)
                if (e.ctrlKey && field === 'name') {
                     e.preventDefault();
                     controller.handleDeleteStock(stockId);
                }
                break;
            case 'Escape':
                 // 입력 취소 (포커스 아웃)
                 e.preventDefault();
                 target.blur();
                 break;
        }
    });

    // 숫자 입력 필드 포커스 시 전체 선택
    // @ts-ignore
    dom.portfolioBody?.addEventListener('focusin', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        if (target.tagName === 'INPUT' && target.type === 'number') {
            target.select();
        }
    });

    // 계산 버튼
    // @ts-ignore
    dom.calculateBtn?.addEventListener('click', () => controller.handleCalculate());
    // 계산 버튼 - Space/Enter 키 지원 (접근성 향상)
    // @ts-ignore
    dom.calculateBtn?.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            controller.handleCalculate();
        }
    });

    // 계산/통화 모드 라디오 버튼
    // @ts-ignore
    dom.mainModeSelector?.forEach(r => r.addEventListener('change', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        /** @type {'add' | 'sell'} */
        const mode = target.value;
        controller.handleMainModeChange(mode);
    }));
    // @ts-ignore
    dom.currencyModeSelector?.forEach(r => r.addEventListener('change', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        /** @type {'krw' | 'usd'} */
        const currency = target.value;
        controller.handleCurrencyModeChange(currency);
    }));

    // 추가 투자금액 입력 및 환율 변환 (Debounce 적용, immediate 옵션 선택적 사용)
    const debouncedConversion = debounce((source) => controller.handleCurrencyConversion(source), 300 /*, true*/ );
    // @ts-ignore
    dom.additionalAmountInput?.addEventListener('input', () => debouncedConversion('krw'));
    // @ts-ignore
    dom.additionalAmountUSDInput?.addEventListener('input', () => debouncedConversion('usd'));
    // @ts-ignore
    dom.exchangeRateInput?.addEventListener('input', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        const rate = parseFloat(target.value);
        const isValid = !isNaN(rate) && rate > 0;
        controller.view.toggleInputValidation(target, isValid);
        if (isValid) debouncedConversion('krw'); // 환율 변경 시 원화 기준으로 USD 금액 재계산
    });

    // 추가 투자금액 관련 필드에서 Enter 키 누르면 계산 실행
    const handleEnterKey = (e) => {
        if (e.key === 'Enter' && !e.isComposing) { // isComposing: 한글 입력 중 Enter 방지
            e.preventDefault();
            controller.handleCalculate();
        }
    };
    // @ts-ignore
    dom.additionalAmountInput?.addEventListener('keydown', handleEnterKey);
    // @ts-ignore
    dom.additionalAmountUSDInput?.addEventListener('keydown', handleEnterKey);
    // @ts-ignore
    dom.exchangeRateInput?.addEventListener('keydown', handleEnterKey);

    // --- 모달 관련 이벤트 ---
    // 거래 내역 모달 닫기 버튼
    // @ts-ignore
    dom.closeModalBtn?.addEventListener('click', () => controller.view.closeTransactionModal());
    // 모달 외부(오버레이) 클릭 시 닫기
    // @ts-ignore
    dom.transactionModal?.addEventListener('click', (e) => {
        if (e.target === dom.transactionModal) controller.view.closeTransactionModal();
    });
    // 새 거래 추가 폼 제출
    // @ts-ignore
    dom.newTransactionForm?.addEventListener('submit', (e) => controller.handleAddNewTransaction(e));
    // 거래 내역 목록 내 삭제 버튼 클릭
    // @ts-ignore
    dom.transactionListBody?.addEventListener('click', (e) => controller.handleTransactionListClick(e));

    // --- 기타 ---
    // 다크 모드 토글 버튼
    // @ts-ignore
    dom.darkModeToggle?.addEventListener('click', () => controller.handleToggleDarkMode());
    // 페이지 닫기 전 자동 저장 (동기식 저장 시도)
    window.addEventListener('beforeunload', () => controller.handleSaveDataOnExit());

    /**
     * [추가] 키보드 네비게이션 시 포커스 표시를 위한 클래스 토글
     */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        }
    });
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav'); // 마우스 사용 시 클래스 제거
    });
}