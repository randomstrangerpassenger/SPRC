// src/errorHandlers.ts
/**
 * @description 전역 에러 핸들러 등록
 * (Phase 3-1: 에러 핸들링 개선)
 */

import { ErrorService } from './errorService';

/**
 * @description 처리되지 않은 Promise rejection을 처리합니다.
 */
function handleUnhandledRejection(event: PromiseRejectionEvent): void {
    event.preventDefault(); // 기본 에러 출력 방지

    const error =
        event.reason instanceof Error ? event.reason : new Error(String(event.reason));

    console.error('[Unhandled Promise Rejection]', error);
    ErrorService.handle(error, 'UnhandledPromiseRejection');
}

/**
 * @description 처리되지 않은 일반 에러를 처리합니다.
 */
function handleError(event: ErrorEvent): void {
    event.preventDefault(); // 기본 에러 출력 방지

    const error = event.error instanceof Error ? event.error : new Error(event.message);

    console.error('[Global Error]', error);
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

    console.log('[ErrorHandlers] Global error handlers registered');
}

/**
 * @description 전역 에러 핸들러를 제거합니다 (주로 테스트용).
 */
export function teardownGlobalErrorHandlers(): void {
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    window.removeEventListener('error', handleError);

    console.log('[ErrorHandlers] Global error handlers removed');
}
