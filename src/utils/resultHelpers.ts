// src/utils/resultHelpers.ts
/**
 * @description Railway-Oriented Programming을 위한 Result<T, E> 헬퍼 함수들
 */

import type { Result } from '../types';

/**
 * @description 성공 결과를 생성합니다.
 * @param data - 성공 데이터
 * @returns Result<T, E>
 */
export function ok<T, E = Error>(data: T): Result<T, E> {
    return { success: true, data };
}

/**
 * @description 실패 결과를 생성합니다.
 * @param error - 에러 객체
 * @returns Result<T, E>
 */
export function err<T, E = Error>(error: E): Result<T, E> {
    return { success: false, error };
}

/**
 * @description 함수를 try-catch로 감싸서 Result를 반환합니다.
 * @param fn - 실행할 함수
 * @returns Result<T, Error>
 */
export function tryCatch<T>(fn: () => T): Result<T, Error> {
    try {
        return ok(fn());
    } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
    }
}

/**
 * @description 비동기 함수를 try-catch로 감싸서 Result를 반환합니다.
 * @param fn - 실행할 비동기 함수
 * @returns Promise<Result<T, Error>>
 */
export async function tryCatchAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
    try {
        const data = await fn();
        return ok(data);
    } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
    }
}

/**
 * @description Result가 성공인지 확인합니다.
 * @param result - Result 객체
 * @returns boolean
 */
export function isOk<T, E>(result: Result<T, E>): result is { success: true; data: T } {
    return result.success === true;
}

/**
 * @description Result가 실패인지 확인합니다.
 * @param result - Result 객체
 * @returns boolean
 */
export function isErr<T, E>(result: Result<T, E>): result is { success: false; error: E } {
    return result.success === false;
}

/**
 * @description Result의 데이터를 추출하거나 기본값을 반환합니다.
 * @param result - Result 객체
 * @param defaultValue - 실패 시 반환할 기본값
 * @returns T
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
    return isOk(result) ? result.data : defaultValue;
}

/**
 * @description Result의 데이터를 추출하거나 에러를 throw합니다.
 * @param result - Result 객체
 * @returns T
 * @throws Error
 */
export function unwrap<T, E>(result: Result<T, E>): T {
    if (isOk(result)) {
        return result.data;
    }
    throw result.error;
}

/**
 * @description Result를 map합니다 (성공 시에만 fn 실행).
 * @param result - Result 객체
 * @param fn - 변환 함수
 * @returns Result<U, E>
 */
export function mapResult<T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E> {
    if (isOk(result)) {
        return ok(fn(result.data));
    }
    return result;
}

/**
 * @description Result를 flatMap합니다 (성공 시에만 fn 실행, fn도 Result 반환).
 * @param result - Result 객체
 * @param fn - 변환 함수 (Result 반환)
 * @returns Result<U, E>
 */
export function flatMapResult<T, U, E>(
    result: Result<T, E>,
    fn: (data: T) => Result<U, E>
): Result<U, E> {
    if (isOk(result)) {
        return fn(result.data);
    }
    return result;
}

/**
 * @description 에러를 변환합니다.
 * @param result - Result 객체
 * @param fn - 에러 변환 함수
 * @returns Result<T, F>
 */
export function mapError<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
    if (isErr(result)) {
        return err(fn(result.error));
    }
    return result;
}

/**
 * @description 여러 Result를 모두 성공인 경우에만 성공으로 반환합니다.
 * @param results - Result 배열
 * @returns Result<T[], E>
 */
export function all<T, E>(results: Array<Result<T, E>>): Result<T[], E> {
    const data: T[] = [];
    for (const result of results) {
        if (isErr(result)) {
            return result;
        }
        data.push(result.data);
    }
    return ok(data);
}
