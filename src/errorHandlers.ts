// src/errorHandlers.ts
/**
 * @description 전역 에러 핸들러 등록 및 관리
 */

import { logger } from './services/Logger';
import { errorHandler } from './errors';
import { ErrorFactory } from './errors/ErrorFactory';

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

    // ErrorHandler를 통해 처리
    errorHandler.handle(error, 'UnhandledRejection');
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

    // ErrorHandler를 통해 처리
    errorHandler.handle(error, context);
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
