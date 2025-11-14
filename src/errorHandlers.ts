// src/errorHandlers.ts
/**
 * @description 전역 에러 핸들러 등록
 */

import { ErrorService } from './errorService';
import { logger } from './services/Logger';

/**
 * @description 처리되지 않은 Promise rejection을 처리합니다.
 */
function handleUnhandledRejection(event: PromiseRejectionEvent): void {
    event.preventDefault(); // 기본 에러 출력 방지

    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));

    logger.error('Unhandled Promise Rejection', 'ErrorHandlers', error);
    ErrorService.handle(error, 'UnhandledPromiseRejection');
}

/**
 * @description 처리되지 않은 일반 에러를 처리합니다.
 */
function handleError(event: ErrorEvent): void {
    event.preventDefault(); // 기본 에러 출력 방지

    const error = event.error instanceof Error ? event.error : new Error(event.message);

    logger.error('Global Error', 'ErrorHandlers', error);
    ErrorService.handle(error, 'GlobalError');
}

/**
 * @description 전역 에러 핸들러를 등록합니다.
 */
export function setupGlobalErrorHandlers(): void {
    // Promise rejection 핸들러
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // 일반 에러 핸들러
    window.addEventListener('error', handleError);

    logger.debug('Global error handlers registered', 'ErrorHandlers');
}

/**
 * @description 전역 에러 핸들러를 제거합니다 (주로 테스트용).
 */
export function teardownGlobalErrorHandlers(): void {
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    window.removeEventListener('error', handleError);

    logger.debug('Global error handlers removed', 'ErrorHandlers');
}
