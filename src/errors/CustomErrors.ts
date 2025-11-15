// src/errors/CustomErrors.ts
/**
 * @description 애플리케이션의 커스텀 에러 클래스들
 */

/**
 * @description 유효성 검사 오류를 나타내는 커스텀 에러 클래스
 */
export class ValidationError extends Error {
    constructor(
        message: string,
        public readonly context?: string
    ) {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * @description 네트워크 오류를 나타내는 커스텀 에러 클래스
 */
export class NetworkError extends Error {
    constructor(
        message: string,
        public readonly statusCode?: number,
        public readonly context?: string
    ) {
        super(message);
        this.name = 'NetworkError';
    }
}

/**
 * @description 계산 오류를 나타내는 커스텀 에러 클래스
 */
export class CalculationError extends Error {
    constructor(
        message: string,
        public readonly context?: string
    ) {
        super(message);
        this.name = 'CalculationError';
    }
}

/**
 * @description 저장소 오류를 나타내는 커스텀 에러 클래스
 */
export class StorageError extends Error {
    constructor(
        message: string,
        public readonly cause?: Error,
        public readonly context?: string
    ) {
        super(message);
        this.name = 'StorageError';
    }
}

/**
 * @description 애플리케이션 에러 타입 유니온
 */
export type AppError = ValidationError | NetworkError | CalculationError | StorageError;
