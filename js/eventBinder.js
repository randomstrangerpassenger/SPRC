import { debounce } from './utils.js';

export function bindEventListeners(controller, dom) {
    // 포트폴리오 관리
    dom.newPortfolioBtn.addEventListener('click', () => controller.handleNewPortfolio());
    dom.renamePortfolioBtn.addEventListener('click', () => controller.handleRenamePortfolio());
    dom.deletePortfolioBtn.addEventListener('click', () => controller.handleDeletePortfolio());
    dom.portfolioSelector.addEventListener('change', () => controller.handleSwitchPortfolio());

    // 포트폴리오 설정
    dom.addNewStockBtn.addEventListener('click', () => controller.handleAddNewStock());
    dom.resetDataBtn.addEventListener('click', () => controller.handleResetData());
    dom.normalizeRatiosBtn.addEventListener('click', () => controller.handleNormalizeRatios());
    dom.saveDataBtn.addEventListener('click', () => controller.handleSaveData());
    dom.loadDataBtn.addEventListener('click', () => controller.handleLoadData());
    dom.exportDataBtn.addEventListener('click', () => controller.handleExportData());
    dom.importDataBtn.addEventListener('click', () => controller.handleImportData());
    dom.importFileInput.addEventListener('change', (e) => controller.handleFileSelected(e));

    // 메인 테이블 이벤트 (이벤트 위임)
    dom.portfolioBody.addEventListener('change', (e) => controller.handlePortfolioBodyChange(e));
    dom.portfolioBody.addEventListener('click', (e) => controller.handlePortfolioBodyClick(e));

    // 계산 및 모드 변경
    dom.calculateBtn.addEventListener('click', () => controller.handleCalculate());
    dom.mainModeSelector.forEach(r => r.addEventListener('change', (e) => controller.handleMainModeChange(e.target.value)));
    dom.currencyModeSelector.forEach(r => r.addEventListener('change', (e) => controller.handleCurrencyModeChange(e.target.value)));

    // 추가 투자금 및 환율 (디바운스 적용)
    const debouncedConversion = debounce((source) => controller.handleCurrencyConversion(source), 300);
    dom.additionalAmountInput.addEventListener('input', () => debouncedConversion('krw'));
    dom.additionalAmountUSDInput.addEventListener('input', () => debouncedConversion('usd'));
    dom.exchangeRateInput.addEventListener('input', (e) => {
        const rate = parseFloat(e.target.value);
        const isValid = !isNaN(rate) && rate > 0;
        controller.view.toggleInputValidation(e.target, isValid);
        if (isValid) debouncedConversion('krw');
    });

    // 모달 관련 이벤트
    dom.closeModalBtn.addEventListener('click', () => controller.view.closeTransactionModal());
    dom.transactionModal.addEventListener('click', (e) => {
        if (e.target === dom.transactionModal) controller.view.closeTransactionModal();
    });
    dom.newTransactionForm.addEventListener('submit', (e) => controller.handleAddNewTransaction(e));
    dom.transactionListBody.addEventListener('click', (e) => controller.handleTransactionListClick(e));
    
    // 기타 UI 이벤트
    dom.darkModeToggle.addEventListener('click', () => controller.handleToggleDarkMode());
}