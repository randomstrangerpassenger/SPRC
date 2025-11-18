// src/controller/ControllerEventBinder.ts
import type { PortfolioController } from '../controller';
import { bindEvents, type EventBindingConfig } from './EventBindingTypes';

/**
 * @description Controller 이벤트 바인딩 (선언형 바인딩 맵)
 * @param controller - PortfolioController 인스턴스
 */
export function bindControllerEvents(controller: PortfolioController): void {
    // === 선언형 이벤트 바인딩 ===
    const eventBindings: EventBindingConfig[] = [
        // 포트폴리오 관리
        {
            event: 'newPortfolioClicked',
            handler: async () => {
                await controller.portfolioManager.handleNewPortfolio();
                controller.fullRender();
            },
        },
        {
            event: 'renamePortfolioClicked',
            handler: () => controller.portfolioManager.handleRenamePortfolio(),
        },
        {
            event: 'deletePortfolioClicked',
            handler: async () => {
                await controller.portfolioManager.handleDeletePortfolio();
            },
        },
        {
            event: 'portfolioSwitched',
            handler: async (data: { newId: string }) => {
                await controller.portfolioManager.handleSwitchPortfolio(data.newId);
                controller.fullRender();
            },
        },

        // 주식 관리 (autoPostAction 사용)
        {
            event: 'addNewStockClicked',
            handler: async () => controller.stockManager.handleAddNewStock(),
            autoPostAction: true,
            customPostAction: (result, ctrl) => {
                if (result.stockId) ctrl.view.focusOnNewStock(result.stockId);
            },
        },
        {
            event: 'normalizeRatiosClicked',
            handler: () => controller.calculationManager.handleNormalizeRatios(),
        },
        {
            event: 'applyTemplateClicked',
            handler: (data: { template: string }) => controller.handleApplyTemplate(data.template),
        },
        {
            event: 'fetchAllPricesClicked',
            handler: async () => controller.calculationManager.handleFetchAllPrices(),
            autoPostAction: true,
        },
        {
            event: 'deleteStockShortcut',
            handler: async (data: { stockId: string }) =>
                controller.stockManager.handleDeleteStock(data.stockId),
            autoPostAction: true,
        },

        // 데이터 관리
        {
            event: 'resetDataClicked',
            handler: async () => controller.dataManager.handleResetData(),
            autoPostAction: true,
        },
        {
            event: 'exportDataClicked',
            handler: () => controller.dataManager.handleExportData(),
        },
        {
            event: 'importDataClicked',
            handler: () => controller.dataManager.handleImportData(),
        },
        {
            event: 'exportTransactionsCSVClicked',
            handler: () => controller.dataManager.handleExportTransactionsCSV(),
        },
        {
            event: 'fileSelected',
            handler: async (e: Event) => controller.dataManager.handleFileSelected(e),
            autoPostAction: true,
        },

        // 테이블 상호작용 (단순)
        {
            event: 'portfolioBodyChanged',
            handler: (e: Event) => controller.stockManager.handlePortfolioBodyChange(e),
        },
        {
            event: 'manageStockClicked',
            handler: (data: { stockId: string }) =>
                controller.transactionManager.openTransactionModalByStockId(data.stockId),
        },

        // 계산 및 통화
        {
            event: 'calculateClicked',
            handler: () => controller.calculationManager.handleCalculate(),
        },
        {
            event: 'showPerformanceHistoryClicked',
            handler: () => controller.snapshotManager.handleShowPerformanceHistory(),
        },
        {
            event: 'showSnapshotListClicked',
            handler: () => controller.snapshotManager.handleShowSnapshotList(),
        },
        {
            event: 'mainModeChanged',
            handler: async (data: { mode: any }) =>
                controller.calculationManager.handleMainModeChange(data.mode),
            autoPostAction: true,
        },
        {
            event: 'currencyModeChanged',
            handler: async (data: { currency: any }) =>
                controller.calculationManager.handleCurrencyModeChange(data.currency),
            autoPostAction: true,
        },
        {
            event: 'currencyConversion',
            handler: (data: { source: 'krw' | 'usd' }) =>
                controller.calculationManager.handleCurrencyConversion(data.source),
        },
        {
            event: 'portfolioExchangeRateChanged',
            handler: (data: { rate: number }) =>
                controller.calculationManager.handlePortfolioExchangeRateChange(data.rate),
        },
        {
            event: 'rebalancingToleranceChanged',
            handler: (data: { tolerance: number }) =>
                controller.handleRebalancingToleranceChange(data.tolerance),
        },

        // 리밸런싱 규칙
        {
            event: 'rebalancingRulesEnabledChanged',
            handler: (data: { enabled: boolean }) =>
                controller.rebalancingRulesManager.handleEnabledChanged(data.enabled),
        },
        {
            event: 'bandPercentageChanged',
            handler: (data: { value: number }) =>
                controller.rebalancingRulesManager.handleBandPercentageChanged(data.value),
        },
        {
            event: 'minTradeAmountChanged',
            handler: (data: { value: number }) =>
                controller.rebalancingRulesManager.handleMinTradeAmountChanged(data.value),
        },
        {
            event: 'addStockLimitClicked',
            handler: async () => controller.rebalancingRulesManager.handleAddStockLimit(),
        },
        {
            event: 'removeStockLimitClicked',
            handler: (data: { index: number }) =>
                controller.rebalancingRulesManager.handleRemoveStockLimit(data.index),
        },
        {
            event: 'addSectorLimitClicked',
            handler: async () => controller.rebalancingRulesManager.handleAddSectorLimit(),
        },
        {
            event: 'removeSectorLimitClicked',
            handler: (data: { index: number }) =>
                controller.rebalancingRulesManager.handleRemoveSectorLimit(data.index),
        },
        {
            event: 'stockLimitsChanged',
            handler: () => controller.rebalancingRulesManager.handleStockLimitsChanged(),
        },
        {
            event: 'sectorLimitsChanged',
            handler: () => controller.rebalancingRulesManager.handleSectorLimitsChanged(),
        },
        {
            event: 'loadPresetClicked',
            handler: (data: { presetId: string }) =>
                controller.rebalancingRulesManager.handleLoadPreset(data.presetId),
        },
        {
            event: 'savePresetClicked',
            handler: async () => controller.rebalancingRulesManager.handleSavePreset(),
        },
        {
            event: 'deletePresetClicked',
            handler: async (data: { presetId: string }) =>
                controller.rebalancingRulesManager.handleDeletePreset(data.presetId),
        },

        // 배당금 대시보드
        {
            event: 'showYearlyDividendsClicked',
            handler: () => controller.dividendDashboardManager.handleShowYearlyDividends(),
        },
        {
            event: 'showMonthlyDividendsClicked',
            handler: () => controller.dividendDashboardManager.handleShowMonthlyDividends(),
        },
        {
            event: 'showDividendGrowthClicked',
            handler: () => controller.dividendDashboardManager.handleShowDividendGrowth(),
        },

        // 시나리오 분석
        {
            event: 'analyzeScenarioClicked',
            handler: () => controller.scenarioAnalysisManager.handleAnalyzeScenario(),
        },
        {
            event: 'customScenarioToggled',
            handler: () => controller.scenarioAnalysisManager.handleCustomScenarioToggle(),
        },
        {
            event: 'runCustomScenarioClicked',
            handler: () => controller.scenarioAnalysisManager.handleRunCustomScenario(),
        },

        // 목표 시뮬레이터
        {
            event: 'simulateGoalClicked',
            handler: () => controller.goalSimulatorManager.handleSimulateGoal(),
        },
        {
            event: 'calculateRequiredContributionClicked',
            handler: () => controller.goalSimulatorManager.handleCalculateRequiredContribution(),
        },

        // 자산 배분 분석 (Phase 4.14)
        {
            event: 'showAssetTypeAllocationClicked',
            handler: () => controller.assetAllocationManager.handleShowAssetTypeAllocation(),
        },
        {
            event: 'showCountryAllocationClicked',
            handler: () => controller.assetAllocationManager.handleShowCountryAllocation(),
        },
        {
            event: 'showHeatmapClicked',
            handler: () => controller.assetAllocationManager.handleShowHeatmap(),
        },

        // Tax-Lot Accounting (Phase 4.15)
        {
            event: 'showTaxLotAnalysisClicked',
            handler: () => controller.advancedAnalysisManager.handleShowTaxLotAnalysis(),
        },
        {
            event: 'calculateTaxOptimizedSaleClicked',
            handler: () => controller.advancedAnalysisManager.handleCalculateTaxOptimizedSale(),
        },

        // Transaction Analysis (Phase 4.16)
        {
            event: 'showTransactionAnalysisClicked',
            handler: () => controller.advancedAnalysisManager.handleShowTransactionAnalysis(),
        },

        // 모달 상호작용
        {
            event: 'closeTransactionModalClicked',
            handler: () => controller.view.closeTransactionModal(),
        },
        {
            event: 'newTransactionSubmitted',
            handler: async (e: Event) =>
                controller.transactionManager.handleAddNewTransaction(e),
            autoPostAction: true,
        },
        {
            event: 'transactionDeleteClicked',
            handler: async (data: { stockId: string; txId: string }) =>
                controller.transactionManager.handleTransactionListClick(data.stockId, data.txId),
            autoPostAction: true,
        },

        // 기타
        {
            event: 'darkModeToggleClicked',
            handler: () => controller.handleToggleDarkMode(),
        },
        {
            event: 'pageUnloading',
            handler: () => controller.handleSaveDataOnExit(),
        },
    ];

    // 선언형 바인딩 적용
    bindEvents(controller, eventBindings);

    // === 복잡한 로직 (별도 처리) ===
    bindPortfolioBodyClick(controller);
}

/**
 * @description portfolioBodyClicked 이벤트 처리 (복잡한 로직)
 */
function bindPortfolioBodyClick(controller: PortfolioController): void {
    controller.view.on('portfolioBodyClicked', (e: Event) => {
        const result = controller.stockManager.handlePortfolioBodyClick(e);

        if (result.action === 'manage' && result.stockId) {
            controller.transactionManager.openTransactionModalByStockId(result.stockId);
        } else if (result.action === 'delete' && result.stockId) {
            controller.stockManager.handleDeleteStock(result.stockId).then((deleteResult) => {
                if (deleteResult.needsFullRender) {
                    controller.fullRender();
                }
            });
        }
    });
}
