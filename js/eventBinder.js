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
    
    const dataManagementBtn = document.getElementById('dataManagementBtn');
    const dataDropdownContent = document.getElementById('dataDropdownContent');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const importDataBtn = document.getElementById('importDataBtn');

    dataManagementBtn.addEventListener('click', () => {
        dataDropdownContent.classList.toggle('show');
    });

    exportDataBtn.addEventListener('click', (e) => {
        e.preventDefault();
        controller.handleExportData();
        dataDropdownContent.classList.remove('show');
    });

    importDataBtn.addEventListener('click', (e) => {
        e.preventDefault();
        controller.handleImportData();
        dataDropdownContent.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if (!e.target.matches('#dataManagementBtn')) {
            if (dataDropdownContent.classList.contains('show')) {
                dataDropdownContent.classList.remove('show');
            }
        }
    });
    
    document.getElementById('importFileInput').addEventListener('change', (e) => controller.handleFileSelected(e));

    const debouncedUpdate = debounce(() => controller.updateUIState(), 300);
    dom.portfolioBody.addEventListener('change', (e) => controller.handlePortfolioBodyChange(e, debouncedUpdate));
    dom.portfolioBody.addEventListener('click', (e) => controller.handlePortfolioBodyClick(e));
    dom.portfolioBody.addEventListener('focusin', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'number') {
            e.target.select();
        }
    });

    dom.calculateBtn.addEventListener('click', () => controller.handleCalculate());
    dom.mainModeSelector.forEach(r => r.addEventListener('change', (e) => controller.handleMainModeChange(e.target.value)));
    dom.currencyModeSelector.forEach(r => r.addEventListener('change', (e) => controller.handleCurrencyModeChange(e.target.value)));

    const debouncedConversion = debounce((source) => controller.handleCurrencyConversion(source), 300);
    dom.additionalAmountInput.addEventListener('input', () => debouncedConversion('krw'));
    dom.additionalAmountUSDInput.addEventListener('input', () => debouncedConversion('usd'));
    dom.exchangeRateInput.addEventListener('input', (e) => {
        const rate = parseFloat(e.target.value);
        const isValid = !isNaN(rate) && rate > 0;
        controller.view.toggleInputValidation(e.target, isValid);
        if (isValid) debouncedConversion('krw');
    });

    const handleEnterKey = (e) => {
        if (e.key === 'Enter' && !e.isComposing) {
            e.preventDefault();
            controller.handleCalculate();
        }
    };
    dom.additionalAmountInput.addEventListener('keydown', handleEnterKey);
    dom.additionalAmountUSDInput.addEventListener('keydown', handleEnterKey);
    dom.exchangeRateInput.addEventListener('keydown', handleEnterKey);
    
    // 모달 관련 이벤트
    dom.closeModalBtn.addEventListener('click', () => controller.view.closeTransactionModal());
    dom.transactionModal.addEventListener('click', (e) => {
        if (e.target === dom.transactionModal) controller.view.closeTransactionModal();
    });
    dom.newTransactionForm.addEventListener('submit', (e) => controller.handleAddNewTransaction(e));
    dom.transactionListBody.addEventListener('click', (e) => controller.handleTransactionListClick(e));
    
    // 기타
    dom.darkModeToggle.addEventListener('click', () => controller.handleToggleDarkMode());
    window.addEventListener('beforeunload', () => controller.handleSaveDataOnExit());
}