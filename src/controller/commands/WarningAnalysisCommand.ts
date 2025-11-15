import type { ICommand, CommandContext } from './ICommand';
import { RiskAnalyzerService } from '../../services/RiskAnalyzerService';

/**
 * 경고 분석 Command
 *
 * 책임:
 * 1. 리밸런싱 필요 여부 분석 및 알림
 * 2. 리스크 경고 분석 및 알림
 * 3. 메인 모드 UI 업데이트
 *
 * 조건:
 * - full 모드에서만 실행
 * - calculatedState와 sectorData가 준비된 경우에만 실행
 */
export class WarningAnalysisCommand implements ICommand {
    canExecute(context: CommandContext): boolean {
        // full 모드이고, 계산 결과와 섹터 데이터가 준비된 경우에만 실행
        return (
            context.mode === 'full' &&
            context.calculatedState !== undefined &&
            context.sectorData !== undefined
        );
    }

    async execute(context: CommandContext): Promise<void> {
        const { activePortfolio, view, calculatedState, sectorData } = context;

        // canExecute에서 검증했지만 타입 가드 필요
        if (!calculatedState || !sectorData) {
            return;
        }

        // Step 1: 리밸런싱 분석
        const rebalancingAnalysis = RiskAnalyzerService.analyzeRebalancingNeeds(
            calculatedState.portfolioData,
            calculatedState.currentTotal,
            activePortfolio.settings.rebalancingTolerance
        );

        if (rebalancingAnalysis.hasRebalancingNeeds && rebalancingAnalysis.message) {
            view.showToast(rebalancingAnalysis.message, 'info');
        }

        // Step 2: 리스크 경고 분석
        const riskAnalysis = RiskAnalyzerService.analyzeRiskWarnings(
            calculatedState.portfolioData,
            calculatedState.currentTotal,
            sectorData
        );

        const riskMessage = RiskAnalyzerService.formatRiskWarnings(riskAnalysis);
        if (riskMessage) {
            view.showToast(riskMessage, 'warning');
        }

        // Step 3: 메인 모드 UI 업데이트
        view.updateMainModeUI(activePortfolio.settings.mainMode);
    }
}
