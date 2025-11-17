// src/services/CommandHistoryService.ts
import { logger } from './Logger';

/**
 * @class CommandHistoryService
 * @description Undo/Redo 기능을 위한 커맨드 히스토리 관리 서비스
 */
export class CommandHistoryService {
    #undoStack: Command[] = [];
    #redoStack: Command[] = [];
    #maxHistorySize: number = 10;
    #enabled: boolean = true;

    /**
     * 커맨드 실행 및 히스토리에 추가
     */
    execute(command: Command): void {
        if (!this.#enabled) {
            logger.debug('CommandHistoryService is disabled, executing without history', 'CommandHistoryService');
            command.execute();
            return;
        }

        try {
            command.execute();

            // Undo 가능한 커맨드만 히스토리에 추가
            if (command.canUndo) {
                this.#undoStack.push(command);

                // 최대 히스토리 크기 제한
                if (this.#undoStack.length > this.#maxHistorySize) {
                    this.#undoStack.shift();
                }

                // Redo 스택 초기화 (새로운 작업 실행 시)
                this.#redoStack = [];

                logger.debug(`Command executed and added to history: ${command.name}`, 'CommandHistoryService');
            } else {
                logger.debug(`Command executed (not undoable): ${command.name}`, 'CommandHistoryService');
            }
        } catch (error) {
            logger.error(`Error executing command: ${command.name}`, 'CommandHistoryService', error);
            throw error;
        }
    }

    /**
     * 실행 취소 (Undo)
     */
    undo(): boolean {
        if (!this.canUndo()) {
            logger.debug('Cannot undo: history is empty', 'CommandHistoryService');
            return false;
        }

        const command = this.#undoStack.pop()!;

        try {
            command.undo();
            this.#redoStack.push(command);

            logger.info(`Command undone: ${command.name}`, 'CommandHistoryService');
            return true;
        } catch (error) {
            logger.error(`Error undoing command: ${command.name}`, 'CommandHistoryService', error);
            // 실패 시 다시 undo 스택에 추가
            this.#undoStack.push(command);
            throw error;
        }
    }

    /**
     * 다시 실행 (Redo)
     */
    redo(): boolean {
        if (!this.canRedo()) {
            logger.debug('Cannot redo: redo stack is empty', 'CommandHistoryService');
            return false;
        }

        const command = this.#redoStack.pop()!;

        try {
            command.execute();
            this.#undoStack.push(command);

            logger.info(`Command redone: ${command.name}`, 'CommandHistoryService');
            return true;
        } catch (error) {
            logger.error(`Error redoing command: ${command.name}`, 'CommandHistoryService', error);
            // 실패 시 다시 redo 스택에 추가
            this.#redoStack.push(command);
            throw error;
        }
    }

    /**
     * Undo 가능 여부
     */
    canUndo(): boolean {
        return this.#undoStack.length > 0;
    }

    /**
     * Redo 가능 여부
     */
    canRedo(): boolean {
        return this.#redoStack.length > 0;
    }

    /**
     * Undo 스택 크기
     */
    getUndoStackSize(): number {
        return this.#undoStack.length;
    }

    /**
     * Redo 스택 크기
     */
    getRedoStackSize(): number {
        return this.#redoStack.length;
    }

    /**
     * 가장 최근 Undo 가능한 커맨드 이름
     */
    getLastUndoCommandName(): string | null {
        if (this.#undoStack.length === 0) {
            return null;
        }
        return this.#undoStack[this.#undoStack.length - 1].name;
    }

    /**
     * 가장 최근 Redo 가능한 커맨드 이름
     */
    getLastRedoCommandName(): string | null {
        if (this.#redoStack.length === 0) {
            return null;
        }
        return this.#redoStack[this.#redoStack.length - 1].name;
    }

    /**
     * 히스토리 초기화
     */
    clear(): void {
        this.#undoStack = [];
        this.#redoStack = [];
        logger.debug('Command history cleared', 'CommandHistoryService');
    }

    /**
     * 최대 히스토리 크기 설정
     */
    setMaxHistorySize(size: number): void {
        if (size < 1) {
            logger.warn('Max history size must be at least 1', 'CommandHistoryService');
            return;
        }

        this.#maxHistorySize = size;

        // 현재 히스토리가 새 크기보다 크면 잘라내기
        if (this.#undoStack.length > size) {
            this.#undoStack = this.#undoStack.slice(-size);
        }
        if (this.#redoStack.length > size) {
            this.#redoStack = this.#redoStack.slice(-size);
        }

        logger.debug(`Max history size set to ${size}`, 'CommandHistoryService');
    }

    /**
     * 히스토리 서비스 활성화/비활성화
     */
    setEnabled(enabled: boolean): void {
        this.#enabled = enabled;
        logger.debug(`CommandHistoryService ${enabled ? 'enabled' : 'disabled'}`, 'CommandHistoryService');
    }

    /**
     * Undo 스택의 모든 커맨드 이름 반환 (디버깅용)
     */
    getUndoHistory(): string[] {
        return this.#undoStack.map((cmd) => cmd.name);
    }

    /**
     * Redo 스택의 모든 커맨드 이름 반환 (디버깅용)
     */
    getRedoHistory(): string[] {
        return this.#redoStack.map((cmd) => cmd.name);
    }
}

/**
 * 커맨드 인터페이스
 */
export interface Command {
    name: string;
    execute: () => void;
    undo: () => void;
    canUndo: boolean;
}

/**
 * 싱글톤 인스턴스
 */
let instance: CommandHistoryService | null = null;

/**
 * CommandHistoryService 싱글톤 인스턴스 반환
 */
export function getCommandHistoryService(): CommandHistoryService {
    if (!instance) {
        instance = new CommandHistoryService();
    }
    return instance;
}
