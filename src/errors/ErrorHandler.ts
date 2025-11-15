// src/errors/ErrorHandler.ts
/**
 * @description 중앙 집중식 에러 처리 클래스
 */

import { t } from '../i18n';
import { logger } from '../services/Logger';
import type { IView } from '../types';
import {
    ValidationError,
    NetworkError,
    CalculationError,
    StorageError,
} from './CustomErrors';

export class ErrorHandler {
    #view: IView | null = null;

    /**
     * @description View 인스턴스 설정
     */
    setView(view: IView): void {
        this.#view = view;
    }

    /**
     * @description 에러를 처리합니다 (로깅 + 사용자 메시지 표시)
     */
    handle(error: Error, context: string = 'General'): void {
        // 에러 로깅
        this.logError(error, context);

        // 사용자 메시지 표시
        if (this.#view) {
            const userMessage = this.getUserMessage(error, context);
            this.#view.showToast(userMessage, 'error');
        } else {
            logger.warn('View instance not set. Cannot show toast', 'ErrorHandler');
        }
    }

    /**
     * @description 에러를 로깅합니다
     */
    private logError(error: Error, context: string): void {
        logger.error(`Error in ${context}`, context, error);

        // StorageError의 cause 로깅
        if (error instanceof StorageError && error.cause) {
            logger.error('StorageError cause', context, error.cause);
        }
    }

    /**
     * @description 에러 타입에 따라 사용자 친화적인 메시지를 생성합니다
     */
    private getUserMessage(error: Error, context: string): string {
        // ValidationError 처리
        if (error instanceof ValidationError) {
            return `${t('validation.validationErrorPrefix')}\n${error.message}`;
        }

        // NetworkError 처리
        if (error instanceof NetworkError) {
            const statusInfo = error.statusCode ? ` (${error.statusCode})` : '';
            return `네트워크 오류${statusInfo}: ${error.message}`;
        }

        // CalculationError 처리
        if (error instanceof CalculationError) {
            return `계산 오류: ${error.message}`;
        }

        // StorageError 처리
        if (error instanceof StorageError) {
            return `저장소 오류: ${error.message}`;
        }

        // 내장 에러 타입 처리
        if (error.name === 'QuotaExceededError') {
            return t('validation.saveErrorQuota');
        }

        if (error.name === 'SecurityError') {
            return t('validation.saveErrorSecurity');
        }

        if (error.name === 'DecimalError') {
            return t('validation.calcErrorDecimal');
        }

        // 메시지 기반 처리
        if (error.message.includes('structure')) {
            return t('validation.invalidFileStructure');
        }

        // 컨텍스트 기반 처리
        if (context.includes('save') || context.includes('Save')) {
            return t('validation.saveErrorGeneral');
        }

        // 기본 메시지
        return t('validation.calculationError');
    }
}

// 싱글톤 인스턴스
export const errorHandler = new ErrorHandler();
