import { PortfolioView } from './view.js';
import { MESSAGES } from './constants.js';

export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

export const ErrorService = {
    /**
     * 중앙 집중식 에러 핸들러
     * @param {Error} error - 발생한 에러 객체
     * @param {string} context - 에러가 발생한 컨텍스트(함수명 등)
     */
    handle(error, context = 'General') {
        console.error(`Error in ${context}:`, error);

        let userMessage = MESSAGES.CALCULATION_ERROR;

        if (error instanceof ValidationError) {
            userMessage = `${MESSAGES.VALIDATION_ERROR_PREFIX}\n${error.message}`;
        } else if (error.name === 'DecimalError') {
            userMessage = MESSAGES.CALC_ERROR_DECIMAL;
        } else if (error.message.includes("structure")) {
            userMessage = MESSAGES.INVALID_FILE_STRUCTURE;
        }
        
        PortfolioView.showToast(userMessage, 'error');
    }
};