import type { ICommand, CommandContext } from './ICommand';
import { ErrorHandler } from '../../errors/ErrorHandler';
import { ErrorFactory } from '../../errors/ErrorFactory';

/**
 * Command 파이프라인 실행기
 *
 * 책임:
 * - 여러 Command를 순차적으로 실행
 * - 각 Command의 실행 가능 여부 확인 (canExecute)
 * - 오류 처리 및 로깅
 *
 * 특징:
 * - Command는 순차적으로 실행됨 (비동기)
 * - canExecute가 false인 Command는 건너뜀
 * - 한 Command에서 오류 발생 시 전체 파이프라인 중단
 */
export class CommandPipeline {
    private readonly commands: ICommand[];
    private readonly errorHandler: ErrorHandler;

    constructor(commands: ICommand[], errorHandler: ErrorHandler) {
        this.commands = commands;
        this.errorHandler = errorHandler;
    }

    /**
     * 파이프라인 실행
     * @param context - 공유 컨텍스트
     */
    async execute(context: CommandContext): Promise<void> {
        for (const command of this.commands) {
            try {
                // 실행 가능 여부 확인
                if (!command.canExecute(context)) {
                    continue;
                }

                // Command 실행
                await command.execute(context);
            } catch (error) {
                // 오류 처리
                const wrappedError = ErrorFactory.createOperationError(
                    `Command ${command.constructor.name} 실행 중 오류 발생`,
                    { cause: error as Error }
                );

                this.errorHandler.handle(wrappedError);

                // 파이프라인 중단
                throw wrappedError;
            }
        }
    }
}
