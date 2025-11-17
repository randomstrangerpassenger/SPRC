// src/commands/UndoableCommands.ts
import type { Command } from '../services/CommandHistoryService';
import type { PortfolioState } from '../state';
import type { Stock, Transaction } from '../types';
import { logger } from '../services/Logger';
import Decimal from 'decimal.js';

/**
 * 추상 Undoable 커맨드 클래스
 */
abstract class UndoableCommand implements Command {
    abstract name: string;
    canUndo: boolean = true;

    abstract execute(): void;
    abstract undo(): void;
}

/**
 * 종목 추가 커맨드
 */
export class AddStockCommand extends UndoableCommand {
    name = '종목 추가';
    #state: PortfolioState;
    #stock: Stock;
    #portfolioId: string;

    constructor(state: PortfolioState, stock: Stock) {
        super();
        this.#state = state;
        this.#stock = stock;

        const activePortfolio = state.getActivePortfolio();
        if (!activePortfolio) {
            throw new Error('Active portfolio not found');
        }
        this.#portfolioId = activePortfolio.id;
    }

    execute(): void {
        const portfolio = this.#state.getPortfolioById(this.#portfolioId);
        if (!portfolio) {
            throw new Error('Portfolio not found');
        }
        portfolio.portfolioData.push(this.#stock);
        this.#state.saveActivePortfolio();
        logger.debug(`Stock added: ${this.#stock.name}`, 'AddStockCommand');
    }

    undo(): void {
        const portfolio = this.#state.getPortfolioById(this.#portfolioId);
        if (!portfolio) {
            throw new Error('Portfolio not found');
        }

        const index = portfolio.portfolioData.findIndex((s) => s.id === this.#stock.id);
        if (index !== -1) {
            portfolio.portfolioData.splice(index, 1);
            this.#state.saveActivePortfolio();
            logger.debug(`Stock removed: ${this.#stock.name}`, 'AddStockCommand.undo');
        }
    }
}

/**
 * 종목 삭제 커맨드
 */
export class DeleteStockCommand extends UndoableCommand {
    name = '종목 삭제';
    #state: PortfolioState;
    #stock: Stock;
    #stockIndex: number;
    #portfolioId: string;

    constructor(state: PortfolioState, stock: Stock, stockIndex: number) {
        super();
        this.#state = state;
        this.#stock = stock;
        this.#stockIndex = stockIndex;

        const activePortfolio = state.getActivePortfolio();
        if (!activePortfolio) {
            throw new Error('Active portfolio not found');
        }
        this.#portfolioId = activePortfolio.id;
    }

    execute(): void {
        const portfolio = this.#state.getPortfolioById(this.#portfolioId);
        if (!portfolio) {
            throw new Error('Portfolio not found');
        }
        portfolio.portfolioData.splice(this.#stockIndex, 1);
        this.#state.saveActivePortfolio();
        logger.debug(`Stock deleted: ${this.#stock.name}`, 'DeleteStockCommand');
    }

    undo(): void {
        const portfolio = this.#state.getPortfolioById(this.#portfolioId);
        if (!portfolio) {
            throw new Error('Portfolio not found');
        }

        portfolio.portfolioData.splice(this.#stockIndex, 0, this.#stock);
        this.#state.saveActivePortfolio();
        logger.debug(`Stock restored: ${this.#stock.name}`, 'DeleteStockCommand.undo');
    }
}

/**
 * 종목 정보 수정 커맨드
 */
export class UpdateStockCommand extends UndoableCommand {
    name = '종목 정보 수정';
    #state: PortfolioState;
    #stockId: string;
    #portfolioId: string;
    #oldData: Partial<Stock>;
    #newData: Partial<Stock>;

    constructor(
        state: PortfolioState,
        stockId: string,
        oldData: Partial<Stock>,
        newData: Partial<Stock>
    ) {
        super();
        this.#state = state;
        this.#stockId = stockId;
        this.#oldData = oldData;
        this.#newData = newData;

        const activePortfolio = state.getActivePortfolio();
        if (!activePortfolio) {
            throw new Error('Active portfolio not found');
        }
        this.#portfolioId = activePortfolio.id;
    }

    execute(): void {
        const portfolio = this.#state.getPortfolioById(this.#portfolioId);
        if (!portfolio) {
            throw new Error('Portfolio not found');
        }

        const stock = portfolio.portfolioData.find((s) => s.id === this.#stockId);
        if (!stock) {
            throw new Error('Stock not found');
        }

        Object.assign(stock, this.#newData);
        this.#state.saveActivePortfolio();
        logger.debug(`Stock updated: ${stock.name}`, 'UpdateStockCommand');
    }

    undo(): void {
        const portfolio = this.#state.getPortfolioById(this.#portfolioId);
        if (!portfolio) {
            throw new Error('Portfolio not found');
        }

        const stock = portfolio.portfolioData.find((s) => s.id === this.#stockId);
        if (!stock) {
            throw new Error('Stock not found');
        }

        Object.assign(stock, this.#oldData);
        this.#state.saveActivePortfolio();
        logger.debug(`Stock reverted: ${stock.name}`, 'UpdateStockCommand.undo');
    }
}

/**
 * 거래 내역 추가 커맨드
 */
export class AddTransactionCommand extends UndoableCommand {
    name = '거래 추가';
    #state: PortfolioState;
    #stockId: string;
    #transaction: Transaction;
    #portfolioId: string;

    constructor(state: PortfolioState, stockId: string, transaction: Transaction) {
        super();
        this.#state = state;
        this.#stockId = stockId;
        this.#transaction = transaction;

        const activePortfolio = state.getActivePortfolio();
        if (!activePortfolio) {
            throw new Error('Active portfolio not found');
        }
        this.#portfolioId = activePortfolio.id;
    }

    execute(): void {
        const portfolio = this.#state.getPortfolioById(this.#portfolioId);
        if (!portfolio) {
            throw new Error('Portfolio not found');
        }

        const stock = portfolio.portfolioData.find((s) => s.id === this.#stockId);
        if (!stock) {
            throw new Error('Stock not found');
        }

        stock.transactions.push(this.#transaction);
        this.#state.saveActivePortfolio();
        logger.debug(`Transaction added to ${stock.name}`, 'AddTransactionCommand');
    }

    undo(): void {
        const portfolio = this.#state.getPortfolioById(this.#portfolioId);
        if (!portfolio) {
            throw new Error('Portfolio not found');
        }

        const stock = portfolio.portfolioData.find((s) => s.id === this.#stockId);
        if (!stock) {
            throw new Error('Stock not found');
        }

        const index = stock.transactions.findIndex((t) => t.id === this.#transaction.id);
        if (index !== -1) {
            stock.transactions.splice(index, 1);
            this.#state.saveActivePortfolio();
            logger.debug(`Transaction removed from ${stock.name}`, 'AddTransactionCommand.undo');
        }
    }
}

/**
 * 거래 내역 삭제 커맨드
 */
export class DeleteTransactionCommand extends UndoableCommand {
    name = '거래 삭제';
    #state: PortfolioState;
    #stockId: string;
    #transaction: Transaction;
    #transactionIndex: number;
    #portfolioId: string;

    constructor(
        state: PortfolioState,
        stockId: string,
        transaction: Transaction,
        transactionIndex: number
    ) {
        super();
        this.#state = state;
        this.#stockId = stockId;
        this.#transaction = transaction;
        this.#transactionIndex = transactionIndex;

        const activePortfolio = state.getActivePortfolio();
        if (!activePortfolio) {
            throw new Error('Active portfolio not found');
        }
        this.#portfolioId = activePortfolio.id;
    }

    execute(): void {
        const portfolio = this.#state.getPortfolioById(this.#portfolioId);
        if (!portfolio) {
            throw new Error('Portfolio not found');
        }

        const stock = portfolio.portfolioData.find((s) => s.id === this.#stockId);
        if (!stock) {
            throw new Error('Stock not found');
        }

        stock.transactions.splice(this.#transactionIndex, 1);
        this.#state.saveActivePortfolio();
        logger.debug(`Transaction deleted from ${stock.name}`, 'DeleteTransactionCommand');
    }

    undo(): void {
        const portfolio = this.#state.getPortfolioById(this.#portfolioId);
        if (!portfolio) {
            throw new Error('Portfolio not found');
        }

        const stock = portfolio.portfolioData.find((s) => s.id === this.#stockId);
        if (!stock) {
            throw new Error('Stock not found');
        }

        stock.transactions.splice(this.#transactionIndex, 0, this.#transaction);
        this.#state.saveActivePortfolio();
        logger.debug(`Transaction restored to ${stock.name}`, 'DeleteTransactionCommand.undo');
    }
}

/**
 * 비율 정규화 커맨드
 */
export class NormalizeRatiosCommand extends UndoableCommand {
    name = '비율 정규화';
    #state: PortfolioState;
    #portfolioId: string;
    #oldRatios: Map<string, Decimal>;

    constructor(state: PortfolioState) {
        super();
        this.#state = state;

        const activePortfolio = state.getActivePortfolio();
        if (!activePortfolio) {
            throw new Error('Active portfolio not found');
        }
        this.#portfolioId = activePortfolio.id;

        // 이전 비율 저장
        this.#oldRatios = new Map();
        activePortfolio.portfolioData.forEach((stock) => {
            this.#oldRatios.set(stock.id, new Decimal(stock.targetRatio.toString()));
        });
    }

    execute(): void {
        const portfolio = this.#state.getPortfolioById(this.#portfolioId);
        if (!portfolio) {
            throw new Error('Portfolio not found');
        }

        const sum = portfolio.portfolioData.reduce(
            (total, stock) => total.plus(stock.targetRatio),
            new Decimal(0)
        );

        if (sum.isZero()) {
            logger.warn('Cannot normalize: sum is zero', 'NormalizeRatiosCommand');
            return;
        }

        portfolio.portfolioData.forEach((stock) => {
            stock.targetRatio = new Decimal(stock.targetRatio).div(sum).times(100);
        });

        this.#state.saveActivePortfolio();
        logger.debug('Ratios normalized', 'NormalizeRatiosCommand');
    }

    undo(): void {
        const portfolio = this.#state.getPortfolioById(this.#portfolioId);
        if (!portfolio) {
            throw new Error('Portfolio not found');
        }

        portfolio.portfolioData.forEach((stock) => {
            const oldRatio = this.#oldRatios.get(stock.id);
            if (oldRatio) {
                stock.targetRatio = oldRatio;
            }
        });

        this.#state.saveActivePortfolio();
        logger.debug('Ratios reverted', 'NormalizeRatiosCommand.undo');
    }
}
