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

export class CalculatorWorkerService {
    private worker: Worker | null = null;
    private isWorkerAvailable: boolean = false;
    private pendingRequests: Map<string, { resolve: (value: any) => void; reject: (reason: any) => void }> = new Map();
    private requestId: number = 0;
    private fallbackCount: number = 0; // Track fallback occurrences

    constructor() {
        this.initializeWorker();
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
                    console.error('Worker error:', error);
                    this.isWorkerAvailable = false;
                };

                this.isWorkerAvailable = true;
                console.log('[CalculatorWorkerService] Worker initialized successfully');
            } else {
                console.warn('[CalculatorWorkerService] Web Workers not supported, using synchronous calculator');
                this.isWorkerAvailable = false;
            }
        } catch (error) {
            console.error('[CalculatorWorkerService] Failed to initialize worker:', error);
            this.isWorkerAvailable = false;
        }
    }

    /**
     * @description Handle messages from worker
     */
    private handleWorkerMessage(event: MessageEvent): void {
        const { type, result, error, requestId } = event.data;

        if (error) {
            console.error('[CalculatorWorkerService] Worker error:', error);
            const request = this.pendingRequests.get(requestId);
            if (request) {
                request.reject(new Error(error));
                this.pendingRequests.delete(requestId);
            }
            return;
        }

        const request = this.pendingRequests.get(requestId);
        if (request) {
            request.resolve(result);
            this.pendingRequests.delete(requestId);
        }
    }

    /**
     * @description Send message to worker and wait for response
     */
    private sendToWorker(type: string, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.worker || !this.isWorkerAvailable) {
                reject(new Error('Worker not available'));
                return;
            }

            const requestId = `req_${++this.requestId}`;
            this.pendingRequests.set(requestId, { resolve, reject });

            this.worker.postMessage({ type, data, requestId });

            // Dynamic timeout (configurable via environment variable)
            setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
                    reject(new Error('Worker request timeout'));
                }
            }, CONFIG.WORKER_TIMEOUT);
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
        if (this.isWorkerAvailable) {
            try {
                const result = await this.sendToWorker('calculatePortfolioState', options);

                // Deserialize Decimal strings back to Decimal objects
                return {
                    portfolioData: result.portfolioData.map((stock: any) => ({
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
        if (this.isWorkerAvailable) {
            try {
                const result = await this.sendToWorker('calculateSectorAnalysis', {
                    portfolioData,
                    currentCurrency,
                });

                return result.map((item: any) => ({
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

        console.warn(
            `[CalculatorWorkerService] Worker failed (${this.fallbackCount} times), falling back to sync:`,
            error.message
        );

        this.isWorkerAvailable = false;

        // Attempt to reinitialize worker after 3 failures
        if (this.fallbackCount >= 3 && this.fallbackCount % 3 === 0) {
            console.log('[CalculatorWorkerService] Attempting to reinitialize worker...');
            setTimeout(() => {
                this.initializeWorker();
            }, 1000);
        }
    }

    /**
     * @description Deserialize metrics from worker (string -> Decimal)
     */
    private deserializeMetrics(metrics: any): any {
        const deserialized: any = {};
        for (const key in metrics) {
            const value = metrics[key];
            deserialized[key] = typeof value === 'string' && !isNaN(Number(value)) ? new Decimal(value) : value;
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
            console.log('[CalculatorWorkerService] Worker terminated');
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
