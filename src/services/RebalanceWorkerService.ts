// src/services/RebalanceWorkerService.ts
/**
 * @description Service for managing rebalancing Web Worker
 * - Provides async API for rebalancing calculations
 * - Falls back to synchronous strategies if Worker unavailable
 * - Improves UI responsiveness during CPU-intensive rebalancing
 */

import type { CalculatedStock } from '../types';
import { CONFIG } from '../constants';
import Decimal from 'decimal.js';
import { logger } from './Logger';
import {
    AddRebalanceStrategy,
    SellRebalanceStrategy,
    SimpleRatioStrategy,
    type RebalancingResult,
} from '../calculationStrategies';

// ==================== Worker Message Types ====================

/**
 * @description Worker message types
 */
type WorkerMessageType = 'calculateAddRebalance' | 'calculateSimpleRebalance' | 'calculateSellRebalance';

/**
 * @description Worker request message structure
 */
interface WorkerRequest<T = unknown> {
    type: WorkerMessageType;
    data: T;
    requestId: string;
}

/**
 * @description Worker response message structure
 */
interface WorkerResponse<T = unknown> {
    type: WorkerMessageType;
    result?: T;
    error?: string;
    requestId: string;
}

/**
 * @description Add rebalance request data
 */
interface AddRebalanceRequest {
    portfolioData: CalculatedStock[];
    additionalInvestment: string; // Decimal as string
}

/**
 * @description Simple rebalance request data
 */
interface SimpleRebalanceRequest {
    portfolioData: CalculatedStock[];
    additionalInvestment: string; // Decimal as string
}

/**
 * @description Sell rebalance request data
 */
interface SellRebalanceRequest {
    portfolioData: CalculatedStock[];
}

/**
 * @description Serialized rebalancing result from worker
 */
interface SerializedRebalancingResult {
    [key: string]: string | number | boolean | object | undefined;
}

/**
 * @description Pending request tracker
 */
interface PendingRequest<T = unknown> {
    resolve: (value: T) => void;
    reject: (reason: Error) => void;
    timeoutId: number;
}

export class RebalanceWorkerService {
    #worker: Worker | null = null;
    #isWorkerAvailable: boolean = false;
    #pendingRequests: Map<string, PendingRequest> = new Map();
    #requestId: number = 0;
    #fallbackCount: number = 0;
    #initializationPromise: Promise<void> | null = null;

    constructor() {
        // Store initialization promise for lazy loading
        this.#initializationPromise = this.initializeWorker();
    }

    /**
     * @description Initialize Web Worker
     */
    private async initializeWorker(): Promise<void> {
        try {
            if (typeof Worker !== 'undefined') {
                // Dynamically import worker with Vite's ?worker suffix
                const RebalanceWorker = await import('../workers/rebalance.worker?worker');
                this.#worker = new RebalanceWorker.default();

                this.#worker.onmessage = (event) => {
                    this.handleWorkerMessage(event);
                };

                this.#worker.onerror = (error) => {
                    logger.error('Rebalance worker error', 'RebalanceWorkerService', error);
                    this.#isWorkerAvailable = false;
                };

                this.#isWorkerAvailable = true;
                logger.info('Rebalance worker initialized successfully', 'RebalanceWorkerService');
            } else {
                logger.warn(
                    'Web Workers not supported, using synchronous rebalancing',
                    'RebalanceWorkerService'
                );
                this.#isWorkerAvailable = false;
            }
        } catch (error) {
            logger.error('Failed to initialize rebalance worker', 'RebalanceWorkerService', error);
            this.#isWorkerAvailable = false;
        }
    }

    /**
     * @description Ensure worker is initialized before use
     */
    private async ensureInitialized(): Promise<void> {
        if (this.#initializationPromise) {
            await this.#initializationPromise;
            this.#initializationPromise = null;
        }
    }

    /**
     * @description Handle messages from worker
     */
    private handleWorkerMessage(event: MessageEvent<WorkerResponse>): void {
        const { result, error, requestId } = event.data;

        if (error) {
            logger.error('Rebalance worker error', 'RebalanceWorkerService', error);
            const request = this.#pendingRequests.get(requestId);
            if (request) {
                clearTimeout(request.timeoutId);
                request.reject(new Error(error));
                this.#pendingRequests.delete(requestId);
            }
            return;
        }

        const request = this.#pendingRequests.get(requestId);
        if (request) {
            clearTimeout(request.timeoutId);
            request.resolve(result);
            this.#pendingRequests.delete(requestId);
        }
    }

    /**
     * @description Send message to worker and wait for response
     */
    private sendToWorker<TRequest, TResponse>(
        type: WorkerMessageType,
        data: TRequest
    ): Promise<TResponse> {
        return new Promise<TResponse>((resolve, reject) => {
            if (!this.#worker || !this.#isWorkerAvailable) {
                reject(new Error('Rebalance worker not available'));
                return;
            }

            const requestId = `req_${++this.#requestId}`;

            const timeoutId = window.setTimeout(() => {
                if (this.#pendingRequests.has(requestId)) {
                    this.#pendingRequests.delete(requestId);
                    reject(new Error('Rebalance worker request timeout'));
                }
            }, CONFIG.WORKER_TIMEOUT);

            this.#pendingRequests.set(requestId, {
                resolve: resolve as (value: unknown) => void,
                reject,
                timeoutId,
            });

            const message: WorkerRequest<TRequest> = { type, data, requestId };
            this.#worker.postMessage(message);
        });
    }

    /**
     * @description Calculate Add Rebalance (async with worker, fallback to sync)
     */
    async calculateAddRebalance(
        portfolioData: CalculatedStock[],
        additionalInvestment: Decimal
    ): Promise<{ results: RebalancingResult[] }> {
        await this.ensureInitialized();

        if (this.#isWorkerAvailable) {
            try {
                const result = await this.sendToWorker<
                    AddRebalanceRequest,
                    SerializedRebalancingResult[]
                >('calculateAddRebalance', {
                    portfolioData,
                    additionalInvestment: additionalInvestment.toString(),
                });

                // Deserialize Decimal strings back to Decimal objects
                return {
                    results: result.map((item) => this.deserializeRebalancingResult(item)),
                };
            } catch (error) {
                this.handleWorkerFailure(error as Error, 'calculateAddRebalance');
            }
        }

        // Fallback to synchronous calculation
        const strategy = new AddRebalanceStrategy(portfolioData, additionalInvestment);
        return strategy.calculate();
    }

    /**
     * @description Calculate Simple Rebalance (async with worker, fallback to sync)
     */
    async calculateSimpleRebalance(
        portfolioData: CalculatedStock[],
        additionalInvestment: Decimal
    ): Promise<{ results: RebalancingResult[] }> {
        await this.ensureInitialized();

        if (this.#isWorkerAvailable) {
            try {
                const result = await this.sendToWorker<
                    SimpleRebalanceRequest,
                    SerializedRebalancingResult[]
                >('calculateSimpleRebalance', {
                    portfolioData,
                    additionalInvestment: additionalInvestment.toString(),
                });

                return {
                    results: result.map((item) => this.deserializeRebalancingResult(item)),
                };
            } catch (error) {
                this.handleWorkerFailure(error as Error, 'calculateSimpleRebalance');
            }
        }

        // Fallback to synchronous calculation
        const strategy = new SimpleRatioStrategy(portfolioData, additionalInvestment);
        return strategy.calculate();
    }

    /**
     * @description Calculate Sell Rebalance (async with worker, fallback to sync)
     */
    async calculateSellRebalance(
        portfolioData: CalculatedStock[]
    ): Promise<{ results: RebalancingResult[] }> {
        await this.ensureInitialized();

        if (this.#isWorkerAvailable) {
            try {
                const result = await this.sendToWorker<
                    SellRebalanceRequest,
                    SerializedRebalancingResult[]
                >('calculateSellRebalance', {
                    portfolioData,
                });

                return {
                    results: result.map((item) => this.deserializeRebalancingResult(item)),
                };
            } catch (error) {
                this.handleWorkerFailure(error as Error, 'calculateSellRebalance');
            }
        }

        // Fallback to synchronous calculation
        const strategy = new SellRebalanceStrategy(portfolioData);
        return strategy.calculate();
    }

    /**
     * @description Handle worker failure and fallback
     */
    private handleWorkerFailure(error: Error, context: string): void {
        this.#fallbackCount++;
        logger.error(
            `Rebalance worker failed, falling back to synchronous calculation`,
            `RebalanceWorkerService.${context}`,
            error
        );

        logger.warn(
            `Rebalance worker failed (${this.#fallbackCount} times), falling back to sync: ${error.message}`,
            'RebalanceWorkerService'
        );

        this.#isWorkerAvailable = false;

        // Attempt to reinitialize worker after 3 failures
        if (this.#fallbackCount >= 3 && this.#fallbackCount % 3 === 0) {
            logger.info('Attempting to reinitialize rebalance worker', 'RebalanceWorkerService');
            setTimeout(() => {
                this.#initializationPromise = this.initializeWorker();
            }, 1000);
        }
    }

    /**
     * @description Deserialize rebalancing result from worker (string -> Decimal)
     */
    private deserializeRebalancingResult(
        serialized: SerializedRebalancingResult
    ): RebalancingResult {
        const deserialized: Record<string, any> = {};

        for (const key in serialized) {
            const value = serialized[key];

            // Deserialize Decimal strings
            if (
                typeof value === 'string' &&
                (key === 'targetRatio' ||
                    key === 'currentRatio' ||
                    key === 'finalBuyAmount' ||
                    key === 'buyRatio' ||
                    key === 'adjustment')
            ) {
                deserialized[key] = new Decimal(value);
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // Handle nested objects like 'calculated'
                deserialized[key] = this.deserializeMetrics(value as Record<string, any>);
            } else {
                deserialized[key] = value;
            }
        }

        return deserialized as RebalancingResult;
    }

    /**
     * @description Deserialize metrics object
     */
    private deserializeMetrics(metrics: Record<string, any>): Record<string, any> {
        const deserialized: Record<string, any> = {};
        for (const key in metrics) {
            const value = metrics[key];
            deserialized[key] =
                typeof value === 'string' && !isNaN(Number(value)) ? new Decimal(value) : value;
        }
        return deserialized;
    }

    /**
     * @description Terminate worker (cleanup)
     */
    terminate(): void {
        if (this.#worker) {
            this.#worker.terminate();
            this.#worker = null;
            this.#isWorkerAvailable = false;
            logger.info('Rebalance worker terminated', 'RebalanceWorkerService');
        }
    }
}

// Singleton instance
let rebalanceWorkerServiceInstance: RebalanceWorkerService | null = null;

export function getRebalanceWorkerService(): RebalanceWorkerService {
    if (!rebalanceWorkerServiceInstance) {
        rebalanceWorkerServiceInstance = new RebalanceWorkerService();
    }
    return rebalanceWorkerServiceInstance;
}
