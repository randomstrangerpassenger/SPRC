// src/services/ErrorHandler.ts
import { t } from '../i18n';
import type { IView } from '../types';
import { logger } from './Logger';
import type { IErrorHandler } from './IErrorHandler';
import {
    ValidationError,
    NetworkError,
    CalculationError,
    StorageError,
} from '../errorService';

/**
 * @class ErrorHandler
 * @description Default implementation of IErrorHandler
 * - Logs errors and shows user-friendly messages
 * - Supports custom error types
 */
export class ErrorHandler implements IErrorHandler {
    #viewInstance: IView | null = null;

    /**
     * @description Set the view instance for displaying error messages
     * @param view - View instance
     */
    setViewInstance(view: IView): void {
        this.#viewInstance = view;
    }

    /**
     * @description Handle an error with context
     * @param error - The error to handle
     * @param context - Context information (e.g., method name, module name)
     */
    handle(error: Error, context: string = 'General'): void {
        logger.error(`Error in ${context}`, context, error);

        const userMessage = this.getUserMessage(error, context);

        // Display toast message if view is available
        if (this.#viewInstance) {
            this.#viewInstance.showToast(userMessage, 'error');
        } else {
            logger.warn('View instance not set. Cannot show toast', 'ErrorHandler');
        }
    }

    /**
     * @description Handle an error with additional data
     * @param error - The error to handle
     * @param context - Context information
     * @param additionalData - Additional debugging data
     */
    handleWithData(error: Error, context: string, additionalData?: Record<string, unknown>): void {
        logger.error(`Error in ${context}`, context, error, additionalData);

        const userMessage = this.getUserMessage(error, context);

        if (this.#viewInstance) {
            this.#viewInstance.showToast(userMessage, 'error');
        } else {
            logger.warn('View instance not set. Cannot show toast', 'ErrorHandler');
        }
    }

    /**
     * @description Get user-friendly error message based on error type
     * @param error - The error
     * @param context - Context information
     * @returns User-friendly message
     */
    private getUserMessage(error: Error, context: string): string {
        // Default error message
        let userMessage = t('validation.calculationError');

        // Handle custom error types
        if (error instanceof ValidationError) {
            userMessage = `${t('validation.validationErrorPrefix')}\n${error.message}`;
        } else if (error instanceof NetworkError) {
            const statusInfo = error.statusCode ? ` (${error.statusCode})` : '';
            userMessage = `네트워크 오류${statusInfo}: ${error.message}`;
        } else if (error instanceof CalculationError) {
            userMessage = `계산 오류: ${error.message}`;
        } else if (error instanceof StorageError) {
            userMessage = `저장소 오류: ${error.message}`;
            if (error.cause) {
                logger.error('StorageError cause', 'ErrorHandler', error.cause);
            }
        } else if (error.name === 'QuotaExceededError') {
            userMessage = t('validation.saveErrorQuota');
        } else if (error.name === 'SecurityError') {
            userMessage = t('validation.saveErrorSecurity');
        } else if (error.name === 'DecimalError') {
            userMessage = t('validation.calcErrorDecimal');
        } else if (error.message.includes('structure')) {
            userMessage = t('validation.invalidFileStructure');
        } else if (context.includes('save') || context.includes('Save')) {
            userMessage = t('validation.saveErrorGeneral');
        }

        return userMessage;
    }
}

/**
 * @description Global error handler instance (for backward compatibility)
 */
export const globalErrorHandler = new ErrorHandler();
