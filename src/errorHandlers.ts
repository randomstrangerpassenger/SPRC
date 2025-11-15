// src/errorHandlers.ts
/**
 * @description 전역 에러 핸들러 등록 및 관리 (Production-grade)
 * Enhanced with error tracking, resource error handling, and monitoring integration
 */

import { logger } from './services/Logger';
import { errorHandler } from './errors';
import { ErrorFactory } from './errors/ErrorFactory';

// Error tracking state
let errorCount = 0;
const ERROR_THRESHOLD = 10; // Maximum errors before stopping notifications

/**
 * @description 처리되지 않은 Promise rejection을 처리합니다.
 */
function handleUnhandledRejection(event: PromiseRejectionEvent): void {
    event.preventDefault(); // 기본 에러 출력 방지

    // rejection reason을 Error 객체로 변환
    const error =
        event.reason instanceof Error
            ? event.reason
            : ErrorFactory.wrapError(event.reason, 'UnhandledRejection');

    // Track and handle error
    trackAndHandleError(error, 'UnhandledRejection');
}

/**
 * @description 처리되지 않은 일반 에러를 처리합니다.
 */
function handleError(event: ErrorEvent): void {
    event.preventDefault(); // 기본 에러 출력 방지

    // ErrorEvent를 Error 객체로 변환
    const error =
        event.error instanceof Error
            ? event.error
            : new Error(event.message || 'Unknown error');

    // 추가 컨텍스트 정보 포함
    const context = event.filename
        ? `GlobalError (${event.filename}:${event.lineno}:${event.colno})`
        : 'GlobalError';

    // Track and handle error
    trackAndHandleError(error, context, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
    });
}

/**
 * @description Handle resource loading errors (images, scripts, stylesheets)
 */
function handleResourceError(event: Event): void {
    if (event.target instanceof HTMLImageElement ||
        event.target instanceof HTMLScriptElement ||
        event.target instanceof HTMLLinkElement) {

        const resourceUrl = (event.target as HTMLElement).getAttribute('src') ||
                          (event.target as HTMLElement).getAttribute('href') ||
                          'unknown';
        const resourceType = event.target.tagName.toLowerCase();

        const error = new Error(`Failed to load ${resourceType}: ${resourceUrl}`);

        logger.error(
            `Resource loading failed: ${resourceType}`,
            'ResourceError',
            error
        );

        // Don't show toast for resource errors (too noisy), just log
        // But track for monitoring
        reportToMonitoring(error, 'ResourceError', { resourceUrl, resourceType });
    }
}

/**
 * @description Track error count and delegate to ErrorHandler
 */
function trackAndHandleError(error: Error, context: string, metadata?: Record<string, any>): void {
    errorCount++;

    // Check error threshold
    if (errorCount > ERROR_THRESHOLD) {
        logger.error(
            `Error threshold exceeded (${errorCount} errors). Suppressing user notifications.`,
            'GlobalErrorHandler'
        );
        // Still log and report, but don't show toast
        reportToMonitoring(error, context, metadata);
        return;
    }

    // Log with metadata
    if (metadata) {
        logger.error(`${context}: ${error.message}`, context, error, metadata);
    }

    // Report to monitoring
    reportToMonitoring(error, context, metadata);

    // ErrorHandler를 통해 처리 (shows toast)
    try {
        errorHandler.handle(error, context);
    } catch (handlerError) {
        logger.error(
            'ErrorHandler failed to handle error',
            'GlobalErrorHandler',
            handlerError
        );
    }
}

/**
 * @description Report error to monitoring service (production placeholder)
 */
function reportToMonitoring(error: Error, context: string, metadata?: Record<string, any>): void {
    // Skip in development
    if (import.meta.env.DEV) {
        return;
    }

    // Placeholder for production monitoring integration
    // Example: Sentry.captureException(error, { contexts: { custom: metadata }, tags: { context } });
    logger.debug(
        `Error reported to monitoring: ${context}`,
        'GlobalErrorHandler',
        { error: error.message, metadata }
    );
}

/**
 * @description Get error statistics
 */
export function getErrorStatistics(): { errorCount: number; threshold: number; isHealthy: boolean } {
    return {
        errorCount,
        threshold: ERROR_THRESHOLD,
        isHealthy: errorCount < ERROR_THRESHOLD,
    };
}

/**
 * @description Reset error count (useful after recovery or for testing)
 */
export function resetErrorCount(): void {
    errorCount = 0;
    logger.info('Error count reset', 'GlobalErrorHandler');
}

/**
 * @description 전역 에러 핸들러를 등록합니다.
 */
export function setupGlobalErrorHandlers(): void {
    // Promise rejection 핸들러
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // 일반 에러 핸들러
    window.addEventListener('error', handleError);

    // Resource loading 에러 핸들러 (capture phase)
    window.addEventListener('error', handleResourceError, true);

    logger.debug('Global error handlers registered (with resource tracking)', 'ErrorHandlers');
}

/**
 * @description 전역 에러 핸들러를 제거합니다 (주로 테스트용).
 */
export function teardownGlobalErrorHandlers(): void {
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    window.removeEventListener('error', handleError);
    window.removeEventListener('error', handleResourceError, true);

    logger.debug('Global error handlers removed', 'ErrorHandlers');
}
