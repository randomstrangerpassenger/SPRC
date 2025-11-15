import type { ICommand, CommandContext } from './ICommand';

/**
 * 저장 Command
 *
 * 책임:
 * 1. 계산된 포트폴리오 데이터를 activePortfolio에 반영
 * 2. 디바운싱된 저장 트리거 (Controller의 debouncedSave 활용)
 *
 * 참고:
 * - debouncedSave는 Controller 인스턴스의 메서드이므로 context를 통해 전달받아야 함
 * - 실제 저장은 2초 디바운싱 후 IndexedDB에 비동기로 수행됨
 */
export class PersistenceCommand implements ICommand {
    private readonly debouncedSave: () => void;

    constructor(debouncedSave: () => void) {
        this.debouncedSave = debouncedSave;
    }

    canExecute(context: CommandContext): boolean {
        // calculatedState가 준비된 경우에만 실행
        return context.calculatedState !== undefined;
    }

    async execute(context: CommandContext): Promise<void> {
        const { activePortfolio, calculatedState } = context;

        // canExecute에서 검증했지만 타입 가드 필요
        if (!calculatedState) {
            return;
        }

        // Step 1: 메모리 상태 업데이트
        activePortfolio.portfolioData = calculatedState.portfolioData;

        // Step 2: 디바운싱된 저장 트리거
        // (2초 후 PortfolioState.saveActivePortfolio() → PortfolioRepository.savePortfolios() → IndexedDB)
        this.debouncedSave();
    }
}
