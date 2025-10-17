import { PortfolioView } from './view.js';
import { MESSAGES } from './constants.js';

// 커스텀 에러 클래스
export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

// 에러 처리 서비스
export const ErrorService = {
    handle(error, context = 'General') {
        console.error(`Error in ${context}:`, error);

        let userMessage = MESSAGES.CALCULATION_ERROR; // 기본 메시지

        if (error instanceof ValidationError) {
            userMessage = `${MESSAGES.VALIDATION_ERROR_PREFIX}\n${error.message}`;
        } else if (error.name === 'DecimalError') { // Decimal.js 에러
            userMessage = MESSAGES.CALC_ERROR_DECIMAL;
        } else if (error instanceof TypeError) {
            userMessage = MESSAGES.CALC_ERROR_TYPE;
        }
        
        PortfolioView.showToast(userMessage, 'error');
    }
};