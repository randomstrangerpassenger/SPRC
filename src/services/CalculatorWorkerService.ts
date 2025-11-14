// src/services/CalculatorWorkerService.ts
/**
 * @description Service for managing calculator Web Worker
 * - Provides async API for calculations
 * - Falls back to synchronous Calculator if Worker unavailable
 */

import type { Stock, CalculatedStock, Currency } from '../types';
import { Calculator } from '../calculator';
import { CONFIG } from '../constants';
import { ErrorService } from '../errorService';
import Decimal from 'decimal.js';
import { logger } from './Logger';

// ==================== Worker Message Types ====================

/**
 * @description Worker message types
 */
type WorkerMessageType = 'calculatePortfolioState' | 'calculateSectorAnalysis';

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
 * @description Calculate portfolio state request data
 */
interface CalculatePortfolioStateRequest {
    portfolioData: Stock[];
    exchangeRate?: number;
    currentCurrency?: Currency;
}

/**
 * @description Calculate portfolio state response data (serialized)
 */
interface CalculatePortfolioStateResponse {
    portfolioData: SerializedCalculatedStock[];
    currentTotal: string; // Decimal serialized as string
}

/**
 * @description Calculate sector analysis request data
 */
interface CalculateSectorAnalysisRequest {
    portfolioData: CalculatedStock[];
    currentCurrency: Currency;
}

/**
 * @description Serialized calculated stock (Decimal values as strings)
 */
interface SerializedCalculatedStock extends Omit<CalculatedStock, 'calculated'> {
    calculated: SerializedMetrics;
}

/**
 * @description Serialized metrics (Decimal values as strings)
 */
interface SerializedMetrics {
    [key: string]: string | number | boolean;
}

/**
 * @description Sector analysis item (serialized)
 */
interface SerializedSectorAnalysis {
    sector: string;
    amount: string; // Decimal serialized as string
    percentage: string; // Decimal serialized as string
}

/**
 * @description Pending request tracker
 */
interface PendingRequest<T = unknown> {
    resolve: (value: T) => void;
    reject: (reason: Error) => void;
    timeoutId: number;
}

export class CalculatorWorkerService {
    private worker: Worker | null = null;
    private isWorkerAvailable: boolean = false;
    private pendingRequests: Map<string, PendingRequest> = new Map();
    private requestId: number = 0;
    private fallbackCount: number = 0;
    private initializationPromise: Promise<void> | null = null;

    constructor() {
        // Don't await here - store the promise instead
        this.initializationPromise = this.initializeWorker();
    }

    /**
     * @description Initialize Web Worker
     */
    private async initializeWorker(): Promise<void> {
        try {
            // Dynamically import worker in production
            if (typeof Worker !== 'undefined') {
                // Vite handles worker import with ?worker suffix
                const CalculatorWorker = await import('../workers/calculator.worker?worker');
                this.worker = new CalculatorWorker.default();

                this.worker.onmessage = (event) => {
                    this.handleWorkerMessage(event);
                };

                this.worker.onerror = (error) => {
                    logger.error('Worker error', 'CalculatorWorkerService', error);
                    this.isWorkerAvailable = false;
                };

                this.isWorkerAvailable = true;
                logger.info('Worker initialized successfully', 'CalculatorWorkerService');
            } else {
                logger.warn(
                    'Web Workers not supported, using synchronous calculator',
                    'CalculatorWorkerService'
                );
                this.isWorkerAvailable = false;
            }
        } catch (error) {
            logger.error('Failed to initialize worker', 'CalculatorWorkerService', error);
            this.isWorkerAvailable = false;
        }
    }

    /**
     * @description Ensure worker is initialized before use
     */
    private async ensureInitialized(): Promise<void> {
        if (this.initializationPromise) {
            await this.initializationPromise;
            this.initializationPromise = null; // Clear after first initialization
        }
    }

    /**
     * @description Handle messages from worker
     */
    private handleWorkerMessage(event: MessageEvent<WorkerResponse>): void {
        const { result, error, requestId } = event.data;

        if (error) {
            logger.error('Worker error', 'CalculatorWorkerService', error);
            const request = this.pendingRequests.get(requestId);
            if (request) {
                clearTimeout(request.timeoutId);
                request.reject(new Error(error));
                this.pendingRequests.delete(requestId);
            }
            return;
        }

        const request = this.pendingRequests.get(requestId);
        if (request) {
            clearTimeout(request.timeoutId);
            request.resolve(result);
            this.pendingRequests.delete(requestId);
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
            if (!this.worker || !this.isWorkerAvailable) {
                reject(new Error('Worker not available'));
                return;
            }

            const requestId = `req_${++this.requestId}`;

            const timeoutId = window.setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
                    reject(new Error('Worker request timeout'));
                }
            }, CONFIG.WORKER_TIMEOUT);

            this.pendingRequests.set(requestId, {
                resolve: resolve as (value: unknown) => void,
                reject,
                timeoutId,
            });

            const message: WorkerRequest<TRequest> = { type, data, requestId };
            this.worker.postMessage(message);
        });
    }

    /**
     * @description Calculate portfolio state (async with worker, fallback to sync)
     */
    async calculatePortfolioState(options: {
        portfolioData: Stock[];
        exchangeRate?: number;
        currentCurrency?: Currency;
    }): Promise<{ portfolioData: CalculatedStock[]; currentTotal: Decimal }> {
        await this.ensureInitialized();

        if (this.isWorkerAvailable) {
            try {
                const result = await this.sendToWorker<
                    CalculatePortfolioStateRequest,
                    CalculatePortfolioStateResponse
                >('calculatePortfolioState', options);

                // Deserialize Decimal strings back to Decimal objects
                return {
                    portfolioData: result.portfolioData.map((stock) => ({
                        ...stock,
                        calculated: this.deserializeMetrics(stock.calculated),
                    })),
                    currentTotal: new Decimal(result.currentTotal),
                };
            } catch (error) {
                this.handleWorkerFailure(error as Error, 'calculatePortfolioState');
            }
        }

        // Fallback to synchronous calculator
        const syncResult = Calculator.calculatePortfolioState(options);
        return {
            portfolioData: syncResult.portfolioData,
            currentTotal: syncResult.currentTotal,
        };
    }

    /**
     * @description Calculate sector analysis (async with worker, fallback to sync)
     */
    async calculateSectorAnalysis(
        portfolioData: CalculatedStock[],
        currentCurrency: Currency = 'krw'
    ): Promise<{ sector: string; amount: Decimal; percentage: Decimal }[]> {
        await this.ensureInitialized();

        if (this.isWorkerAvailable) {
            try {
                const result = await this.sendToWorker<
                    CalculateSectorAnalysisRequest,
                    SerializedSectorAnalysis[]
                >('calculateSectorAnalysis', {
                    portfolioData,
                    currentCurrency,
                });

                return result.map((item) => ({
                    sector: item.sector,
                    amount: new Decimal(item.amount),
                    percentage: new Decimal(item.percentage),
                }));
            } catch (error) {
                this.handleWorkerFailure(error as Error, 'calculateSectorAnalysis');
            }
        }

        // Fallback to synchronous calculator
        return Calculator.calculateSectorAnalysis(portfolioData, currentCurrency);
    }

    /**
     * @description Handle worker failure and fallback
     */
    private handleWorkerFailure(error: Error, context: string): void {
        this.fallbackCount++;
        ErrorService.handle(error, `CalculatorWorkerService.${context}`);

        logger.warn(
            `Worker failed (${this.fallbackCount} times), falling back to sync: ${error.message}`,
            'CalculatorWorkerService'
        );

        this.isWorkerAvailable = false;

        // Attempt to reinitialize worker after 3 failures
        if (this.fallbackCount >= 3 && this.fallbackCount % 3 === 0) {
            logger.info('Attempting to reinitialize worker', 'CalculatorWorkerService');
            setTimeout(() => {
                this.initializationPromise = this.initializeWorker();
            }, 1000);
        }
    }

    /**
     * @description Deserialize metrics from worker (string -> Decimal)
     */
    private deserializeMetrics(
        metrics: SerializedMetrics
    ): Record<string, Decimal | number | boolean> {
        const deserialized: Record<string, Decimal | number | boolean> = {};
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
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
            this.isWorkerAvailable = false;
            logger.info('Worker terminated', 'CalculatorWorkerService');
        }
    }
}

// Singleton instance
let workerServiceInstance: CalculatorWorkerService | null = null;

export function getCalculatorWorkerService(): CalculatorWorkerService {
    if (!workerServiceInstance) {
        workerServiceInstance = new CalculatorWorkerService();
    }
    return workerServiceInstance;
}
