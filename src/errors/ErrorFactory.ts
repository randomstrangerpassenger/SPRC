// src/errors/ErrorFactory.ts
/**
 * @description 에러 생성을 표준화하는 팩토리 클래스
 */

import {
    ValidationError,
    NetworkError,
    CalculationError,
    StorageError,
} from './CustomErrors';

export class ErrorFactory {
    /**
     * @description 유효성 검사 에러 생성
     */
    static createValidationError(message: string, context?: string): ValidationError {
        return new ValidationError(message, context);
    }

    /**
     * @description 네트워크 에러 생성
     */
    static createNetworkError(
        message: string,
        statusCode?: number,
        context?: string
    ): NetworkError {
        return new NetworkError(message, statusCode, context);
    }

    /**
     * @description 계산 에러 생성
     */
    static createCalculationError(message: string, context?: string): CalculationError {
        return new CalculationError(message, context);
    }

    /**
     * @description 저장소 에러 생성
     */
    static createStorageError(
        message: string,
        cause?: Error,
        context?: string
    ): StorageError {
        return new StorageError(message, cause, context);
    }

    /**
     * @description 일반 에러를 적절한 커스텀 에러로 변환
     */
    static wrapError(error: unknown, context?: string): Error {
        if (error instanceof Error) {
            return error;
        }
        return new Error(String(error));
    }
}
