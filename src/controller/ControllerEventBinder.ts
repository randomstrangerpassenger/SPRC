// src/controller/ControllerEventBinder.ts
import type { PortfolioController } from '../controller';

/**
 * @description Controller 이벤트 바인딩 (분리된 모듈)
 * @param controller - PortfolioController 인스턴스
 */
export function bindControllerEvents(controller: PortfolioController): void {
    // 포트폴리오 관리
    controller.view.on('newPortfolioClicked', async () => {
        await controller.portfolioManager.handleNewPortfolio();
        controller.fullRender();
    });
    controller.view.on('renamePortfolioClicked', () =>
        controller.portfolioManager.handleRenamePortfolio()
    );
    controller.view.on('deletePortfolioClicked', async () => {
        await controller.portfolioManager.handleDeletePortfolio();
    });
    controller.view.on('portfolioSwitched', async (data) => {
        await controller.portfolioManager.handleSwitchPortfolio(data.newId);
        controller.fullRender();
    });

    // 주식 관리
    controller.view.on('addNewStockClicked', async () => {
        const result = await controller.stockManager.handleAddNewStock();
        if (result.needsFullRender) {
            controller.fullRender();
            if (result.stockId) controller.view.focusOnNewStock(result.stockId);
        }
    });
    controller.view.on('normalizeRatiosClicked', () =>
        controller.calculationManager.handleNormalizeRatios()
    );
    controller.view.on('applyTemplateClicked', (data) =>
        controller.handleApplyTemplate(data.template)
    );
    controller.view.on('fetchAllPricesClicked', async () => {
        const result = await controller.calculationManager.handleFetchAllPrices();
        if (result.needsUIUpdate) controller.updateUIState();
    });

    // 데이터 관리
    controller.view.on('resetDataClicked', async () => {
        const result = await controller.dataManager.handleResetData();
        if (result.needsFullRender) controller.fullRender();
    });
    controller.view.on('exportDataClicked', () => controller.dataManager.handleExportData());
    controller.view.on('importDataClicked', () => controller.dataManager.handleImportData());
    controller.view.on('exportTransactionsCSVClicked', () =>
        controller.dataManager.handleExportTransactionsCSV()
    );
    controller.view.on('fileSelected', async (e) => {
        const result = await controller.dataManager.handleFileSelected(e);
        if (result.needsUISetup) controller.setupInitialUI();
    });

    // 테이블 상호작용
    controller.view.on('portfolioBodyChanged', (e) =>
        controller.stockManager.handlePortfolioBodyChange(e)
    );
    controller.view.on('portfolioBodyClicked', (e) => {
        const result = controller.stockManager.handlePortfolioBodyClick(e);
        if (result.action === 'manage' && result.stockId) {
            controller.transactionManager.openTransactionModalByStockId(result.stockId);
        } else if (result.action === 'delete' && result.stockId) {
            controller.stockManager.handleDeleteStock(result.stockId).then((deleteResult) => {
                if (deleteResult.needsFullRender) controller.fullRender();
            });
        }
    });
    controller.view.on('manageStockClicked', (data) =>
        controller.transactionManager.openTransactionModalByStockId(data.stockId)
    );
    controller.view.on('deleteStockShortcut', async (data) => {
        const result = await controller.stockManager.handleDeleteStock(data.stockId);
        if (result.needsFullRender) controller.fullRender();
    });

    // 계산 및 통화
    controller.view.on('calculateClicked', () => controller.calculationManager.handleCalculate());
    controller.view.on('showPerformanceHistoryClicked', () =>
        controller.handleShowPerformanceHistory()
    );
    controller.view.on('showSnapshotListClicked', () => controller.handleShowSnapshotList());
    controller.view.on('mainModeChanged', async (data) => {
        const result = await controller.calculationManager.handleMainModeChange(data.mode);
        if (result.needsFullRender) controller.fullRender();
    });
    controller.view.on('currencyModeChanged', async (data) => {
        const result = await controller.calculationManager.handleCurrencyModeChange(data.currency);
        if (result.needsFullRender) controller.fullRender();
    });
    controller.view.on('currencyConversion', (data) =>
        controller.calculationManager.handleCurrencyConversion(data.source)
    );
    controller.view.on('portfolioExchangeRateChanged', (data) =>
        controller.calculationManager.handlePortfolioExchangeRateChange(data.rate)
    );
    controller.view.on('rebalancingToleranceChanged', (data) =>
        controller.handleRebalancingToleranceChange(data.tolerance)
    );

    // 모달 상호작용
    controller.view.on('closeTransactionModalClicked', () =>
        controller.view.closeTransactionModal()
    );
    controller.view.on('newTransactionSubmitted', async (e) => {
        const result = await controller.transactionManager.handleAddNewTransaction(e);
        if (result.needsFullRender) controller.fullRender();
    });
    controller.view.on('transactionDeleteClicked', async (data) => {
        const result = await controller.transactionManager.handleTransactionListClick(
            data.stockId,
            data.txId
        );
        if (result.needsUIUpdate) controller.updateUIState();
    });

    // 기타
    controller.view.on('darkModeToggleClicked', () => controller.handleToggleDarkMode());
    controller.view.on('pageUnloading', () => controller.handleSaveDataOnExit());
}
