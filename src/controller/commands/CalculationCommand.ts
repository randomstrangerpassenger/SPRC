import type { ICommand, CommandContext } from './ICommand';
import { getRatioSum } from '../../utils';
import { generateSectorAnalysisHTML } from '../../templates';

/**
 * 계산 및 기본 렌더링 Command
 *
 * 책임:
 * 1. Web Worker를 통한 포트폴리오 계산
 * 2. 테이블 렌더링 (full/partial 모드)
 * 3. 비율 합계 업데이트
 * 4. 섹터 분석 계산 및 표시
 */
export class CalculationCommand implements ICommand {
    canExecute(_context: CommandContext): boolean {
        // 항상 실행 가능
        return true;
    }

    async execute(context: CommandContext): Promise<void> {
        const { mode, activePortfolio, view, calculatorWorker } = context;

        // Step 1: 포트폴리오 계산
        const calculatedState = await calculatorWorker.calculatePortfolioState({
            portfolioData: activePortfolio.portfolioData,
            exchangeRate: activePortfolio.settings.exchangeRate,
            currentCurrency: activePortfolio.settings.currentCurrency,
        });

        // Context에 계산 결과 저장 (다른 Command에서 사용)
        context.calculatedState = calculatedState;

        // Step 2: 테이블 렌더링
        if (mode === 'full') {
            view.renderTable(
                calculatedState.portfolioData,
                activePortfolio.settings.currentCurrency,
                activePortfolio.settings.mainMode
            );
        } else {
            view.updateVirtualTableData(calculatedState.portfolioData);
        }

        // Step 3: 비율 합계 업데이트
        const ratioSum = getRatioSum(activePortfolio.portfolioData);
        view.updateRatioSum(ratioSum.toNumber());

        // Step 4: 섹터 분석
        const sectorData = await calculatorWorker.calculateSectorAnalysis(
            calculatedState.portfolioData,
            activePortfolio.settings.currentCurrency
        );

        // Context에 섹터 데이터 저장 (WarningAnalysisCommand에서 사용)
        context.sectorData = sectorData;

        // 섹터 분석 표시
        view.displaySectorAnalysis(
            generateSectorAnalysisHTML(sectorData, activePortfolio.settings.currentCurrency)
        );
    }
}
