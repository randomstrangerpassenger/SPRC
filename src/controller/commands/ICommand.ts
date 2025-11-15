import type { CalculatedStock } from '../../types/CalculatedStock';
import type { SectorData } from '../../types/SectorData';
import type Decimal from 'decimal.js';
import type { Portfolio } from '../../types/Portfolio';
import type { PortfolioView } from '../../view';
import type { CalculatorWorkerService } from '../../services/CalculatorWorkerService';

/**
 * Command 실행 모드
 * - full: 전체 렌더링 및 모든 분석 수행
 * - partial: 데이터 업데이트만 수행
 */
export type CommandMode = 'full' | 'partial';

/**
 * Command 실행 시 공유되는 컨텍스트
 */
export interface CommandContext {
    /** 실행 모드 */
    mode: CommandMode;

    /** 현재 활성화된 포트폴리오 */
    activePortfolio: Portfolio;

    /** View 인스턴스 */
    view: PortfolioView;

    /** Calculator Worker 서비스 */
    calculatorWorker: CalculatorWorkerService;

    /** 계산된 포트폴리오 데이터 (CalculationCommand에서 설정) */
    calculatedState?: {
        portfolioData: CalculatedStock[];
        currentTotal: Decimal;
    };

    /** 섹터 분석 데이터 (CalculationCommand에서 설정) */
    sectorData?: SectorData[];
}

/**
 * Command 패턴 인터페이스
 * 각 Command는 단일 책임을 가지며 독립적으로 실행 가능
 */
export interface ICommand {
    /**
     * Command 실행
     * @param context - 공유 컨텍스트
     * @returns Promise<void>
     */
    execute(context: CommandContext): Promise<void>;

    /**
     * Command 실행 가능 여부 확인
     * @param context - 공유 컨텍스트
     * @returns 실행 가능 여부
     */
    canExecute(context: CommandContext): boolean;
}
