import { t } from './i18n.ts';
import type { IView } from './types';

/**
 * @description 유효성 검사 오류를 나타내는 커스텀 에러 클래스
 */
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export const ErrorService = {
    _viewInstance: null as IView | null,

    /**
     * @description View 인스턴스를 설정합니다.
     */
    setViewInstance(view: IView): void {
        this._viewInstance = view;
    },

    /**
     * @description 중앙 집중식 에러 핸들러. 콘솔에 에러를 기록하고 사용자에게 토스트 메시지를 표시합니다.
     */
    handle(error: Error, context: string = 'General'): void {
        console.error(`Error in ${context}:`, error);

        // 기본 오류 메시지
        let userMessage = t('validation.calculationError');

        // 오류 타입에 따라 사용자 메시지 구체화
        if (error instanceof ValidationError) {
            userMessage = `${t('validation.validationErrorPrefix')}\n${error.message}`;
        } else if (error.name === 'QuotaExceededError') {
            // LocalStorage quota exceeded
            userMessage = t('validation.saveErrorQuota');
        } else if (error.name === 'SecurityError') {
            // LocalStorage access denied
            userMessage = t('validation.saveErrorSecurity');
        } else if (error.name === 'DecimalError') {
            // Decimal.js 관련 오류
            userMessage = t('validation.calcErrorDecimal');
        } else if (error.message.includes('structure')) {
            // 파일 구조 관련 오류 (import 시)
            userMessage = t('validation.invalidFileStructure');
        } else if (context.includes('save') || context.includes('Save')) {
            // 저장 관련 컨텍스트
            userMessage = t('validation.saveErrorGeneral');
        }

        // 사용자에게 토스트 메시지 표시 (view 인스턴스가 설정된 경우에만)
        if (this._viewInstance) {
            this._viewInstance.showToast(userMessage, 'error');
        } else {
            console.warn('[ErrorService] View instance not set. Cannot show toast.');
        }
    },
};