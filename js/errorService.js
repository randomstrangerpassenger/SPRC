// @ts-check
import { PortfolioView } from './view.js';
import { t } from './i18n.js';

/**
 * @description 유효성 검사 오류를 나타내는 커스텀 에러 클래스
 */
export class ValidationError extends Error {
    /**
     * @param {string} message - 오류 메시지
     */
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

export const ErrorService = {
    /**
     * @description 중앙 집중식 에러 핸들러. 콘솔에 에러를 기록하고 사용자에게 토스트 메시지를 표시합니다.
     * @param {Error} error - 발생한 에러 객체
     * @param {string} [context='General'] - 에러가 발생한 컨텍스트(함수명 등)
     * @returns {void}
     */
    handle(error, context = 'General') {
        console.error(`Error in ${context}:`, error);

        // 기본 오류 메시지
        let userMessage = t('validation.calculationError');

        // 오류 타입에 따라 사용자 메시지 구체화
        if (error instanceof ValidationError) {
            userMessage = `${t('validation.validationErrorPrefix')}\n${error.message}`;
        } else if (error.name === 'DecimalError') { // Decimal.js 관련 오류
            userMessage = t('validation.calcErrorDecimal');
        } else if (error.message.includes("structure")) { // 파일 구조 관련 오류 (import 시)
            userMessage = t('validation.invalidFileStructure');
        }
        // TODO: 네트워크 오류 등 다른 종류의 에러에 대한 처리 추가 가능

        // 사용자에게 토스트 메시지 표시
        PortfolioView.showToast(userMessage, 'error');
    }
};