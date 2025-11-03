// js/validator.js
// @ts-check
import { t } from './i18n.js';
import Decimal from 'decimal.js';

/** @typedef {import('./types.js').Transaction} Transaction */
/** @typedef {import('./types.js').ValidationResult} ValidationResult */
/** @typedef {import('./types.js').ValidationErrorDetail} ValidationErrorDetail */
/** @typedef {import('./types.js').CalculatedStock} CalculatedStock */

export const Validator = {
    /**
     * @description 숫자 입력값을 검증하고, 유효하면 숫자 타입으로 변환하여 반환합니다.
     * @param {string | number | null | undefined} value - 검증할 값
     * @returns {{isValid: boolean, value?: number, message?: string}} 검증 결과
     */
    validateNumericInput(value) {
        // --- ⬇️ 재수정: 빈 문자열, null, undefined 체크 강화 ⬇️ ---
        const trimmedValue = String(value ?? '').trim(); // null/undefined를 빈 문자열로 처리 후 trim
        if (trimmedValue === '') {
             return { isValid: false, message: t('validation.invalidNumber') };
        }
        // --- ⬆️ 재수정 ⬆️ ---

        const num = Number(trimmedValue); // Use trimmed value for conversion
        if (isNaN(num)) {
            return { isValid: false, message: t('validation.invalidNumber') };
        }
        if (num < 0) {
            return { isValid: false, message: t('validation.negativeNumber') };
        }
        // Check for excessively large numbers or precision issues using Decimal.js
        try {
            const decValue = new Decimal(trimmedValue); // Use trimmed value
            if (!decValue.isFinite()) {
                 throw new Error('Number is not finite');
            }
            if (!isFinite(num)){ // Check standard JS finiteness too
                 throw new Error('Number is too large for standard JS number');
            }
        } catch (e) {
             console.error("Decimal validation error:", e);
             return { isValid: false, message: t('validation.calcErrorDecimal') };
        }

        return { isValid: true, value: num };
    },

    // ... (validateTransaction 함수 - 이전과 동일하게 유지) ...
    /**
     * @description 단일 거래 내역의 유효성을 검사합니다.
     * @param {Partial<Transaction>} txData - 거래 데이터
     * @returns {ValidationResult} 검증 결과
     */
    validateTransaction(txData) {
        // 날짜 검증
        if (!txData.date || isNaN(new Date(txData.date).getTime())) {
            return { isValid: false, message: t('validation.invalidDate') };
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 시간 제거
        if (new Date(txData.date) > today) {
            return { isValid: false, message: t('validation.futureDate') };
        }

        // 수량 검증
        const quantityValidation = this.validateNumericInput(txData.quantity);
        if (!quantityValidation.isValid) {
            // Provide specific message for 0, otherwise use numeric validation message
            if (Number(txData.quantity) === 0) return { isValid: false, message: t('validation.quantityZero')};
            // --- ⬇️ 수정: 음수 메시지 반환 로직 추가 ---
            if (Number(txData.quantity) < 0) return { isValid: false, message: t('validation.negativeNumber') };
            // --- ⬆️ 수정 ---
            return { isValid: false, message: quantityValidation.message }; // Should be invalidNumber here
        }
        // validateNumericInput already checks for < 0, but explicit 0 check remains useful
        if (quantityValidation.value === 0) {
             return { isValid: false, message: t('validation.quantityZero') };
        }


        // 단가 검증
        const priceValidation = this.validateNumericInput(txData.price);
        if (!priceValidation.isValid) {
            // Provide specific message for 0, otherwise use numeric validation message
            if (Number(txData.price) === 0) return { isValid: false, message: t('validation.priceZero')};
            // --- ⬇️ 수정: 음수 메시지 반환 로직 추가 ---
            if (Number(txData.price) < 0) return { isValid: false, message: t('validation.negativeNumber') };
            // --- ⬆️ 수정 ---
            return { isValid: false, message: priceValidation.message }; // Should be invalidNumber here
        }
         // validateNumericInput already checks for < 0, but explicit 0 check remains useful
        if (priceValidation.value === 0) {
             return { isValid: false, message: t('validation.priceZero') };
        }


        return { isValid: true };
    },

    // ... (validateForCalculation 함수 - 이전과 동일하게 유지) ...
    /**
     * @description 리밸런싱 계산 전 전체 입력 데이터의 유효성을 검사합니다.
     * @param {{mainMode: 'add' | 'sell' | 'simple', portfolioData: CalculatedStock[], additionalInvestment: Decimal}} inputs - 계산 입력값
     * @returns {ValidationErrorDetail[]} 오류 배열 (유효하면 빈 배열)
     */
    validateForCalculation(inputs) {
        /** @type {ValidationErrorDetail[]} */
        const errors = [];
        const { mainMode, portfolioData, additionalInvestment } = inputs;

        // 추가 매수 모드 또는 간단 계산 모드일 때 추가 투자금액 검증
        if (mainMode === 'add' || mainMode === 'simple') {
             // Use Decimal's comparison methods
             if (!additionalInvestment || additionalInvestment.isNaN() || additionalInvestment.isNegative() || additionalInvestment.isZero()) {
                 errors.push({ field: 'additionalInvestment', stockId: null, message: t('validation.investmentAmountZero') });
             }
        }

        let totalFixedBuyAmount = new Decimal(0);

        // 각 주식 항목 검증
        portfolioData.forEach(stock => {
            const stockName = stock.name || t('defaults.newStock'); // Use default if name is empty

            if (!stock.name?.trim()) {
                errors.push({ field: 'name', stockId: stock.id, message: t('validation.nameMissing') });
            }
            if (!stock.ticker?.trim()) {
                errors.push({ field: 'ticker', stockId: stock.id, message: t('validation.tickerMissing', { name: stockName }) });
            }

            // --- ⬇️ 수정: stock.calculated 및 quantity 존재 여부 더 안전하게 확인 ⬇️ ---
            const quantity = stock.calculated?.quantity;
            const currentPrice = new Decimal(stock.currentPrice ?? 0); // Use Decimal for currentPrice check

            if (quantity && quantity instanceof Decimal && quantity.greaterThan(0) && (currentPrice.isNaN() || currentPrice.isNegative() || currentPrice.isZero())) {
                 errors.push({ field: 'currentPrice', stockId: stock.id, message: t('validation.currentPriceZero', { name: stockName }) });
             }
             // --- ⬆️ 수정 ⬆️ ---


            // 고정 매수 관련 검증 (추가 매수 모드 및 간단 계산 모드에서)
            if ((mainMode === 'add' || mainMode === 'simple') && stock.isFixedBuyEnabled) {
                const fixedAmount = new Decimal(stock.fixedBuyAmount || 0);
                // currentPrice는 위에서 Decimal로 변환됨

                if (fixedAmount.isNaN() || fixedAmount.isNegative() || fixedAmount.isZero()) {
                     errors.push({ field: 'fixedBuyAmount', stockId: stock.id, message: t('validation.fixedBuyAmountZero', { name: stockName }) });
                } else if (!currentPrice.isNaN() && currentPrice.greaterThan(0) && fixedAmount.lessThan(currentPrice)) {
                     // 고정 매수 금액이 현재가보다 작아 1주도 살 수 없는 경우
                     errors.push({ field: 'fixedBuyAmount', stockId: stock.id, message: t('validation.fixedBuyAmountTooSmall', { name: stockName }) });
                }
                totalFixedBuyAmount = totalFixedBuyAmount.plus(fixedAmount);
            }

            // 목표 비율 검증 (음수 여부 등)
            const targetRatio = new Decimal(stock.targetRatio ?? 0); // Use ?? 0 for safety
             if (targetRatio.isNaN() || targetRatio.isNegative()) {
                 errors.push({ field: 'targetRatio', stockId: stock.id, message: t('validation.negativeNumber') }); // Can't be negative
             }
        });

         // 추가 매수 모드 및 간단 계산 모드에서 총 고정 매수 금액이 추가 투자금을 초과하는지 검증
         if ((mainMode === 'add' || mainMode === 'simple') && !additionalInvestment.isNaN() && totalFixedBuyAmount.greaterThan(additionalInvestment)) {
             errors.push({ field: 'fixedBuyAmount', stockId: null, message: t('validation.fixedBuyTotalExceeds') });
         }


        return errors;
    },

    // ... (isDataStructureValid 함수 - 이전과 동일하게 유지) ...
    /**
     * @description 가져온(import) 데이터의 기본 구조가 유효한지 검사합니다.
     * @param {any} data - JSON.parse로 읽어온 데이터
     * @returns {boolean} 구조 유효 여부
     */
    isDataStructureValid(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.meta || typeof data.meta !== 'object' || typeof data.meta.activePortfolioId !== 'string') return false; // Check type
        if (!data.portfolios || typeof data.portfolios !== 'object') return false;

        // Check individual portfolios
        for (const portId in data.portfolios) {
            const portfolio = data.portfolios[portId];
            if (!portfolio || typeof portfolio !== 'object') return false;
            if (portfolio.id !== portId || !portfolio.name || typeof portfolio.name !== 'string') return false;
            // Check settings object structure (basic)
            if (!portfolio.settings || typeof portfolio.settings !== 'object') return false;
            if (!['add', 'sell', 'simple'].includes(portfolio.settings.mainMode)) return false;
            if (!['krw', 'usd'].includes(portfolio.settings.currentCurrency)) return false;
            if (typeof portfolio.settings.exchangeRate !== 'number' || portfolio.settings.exchangeRate <= 0) return false;

            // Check portfolioData array structure (basic)
            if (!Array.isArray(portfolio.portfolioData)) return false;
            // Optionally, add checks for individual stock structure within portfolioData if needed
             for (const stock of portfolio.portfolioData) {
                 if (!stock || typeof stock !== 'object' || !stock.id || typeof stock.id !== 'string') return false;
                 // Add more checks for required stock properties (name, ticker, etc.)
                 if (typeof stock.name !== 'string' || typeof stock.ticker !== 'string') return false;
                 // Allow optional sector
                 if (stock.sector !== undefined && typeof stock.sector !== 'string') return false;
                 if (typeof stock.targetRatio !== 'number' || stock.targetRatio < 0) return false;
                 if (typeof stock.currentPrice !== 'number' || stock.currentPrice < 0) return false;
                 // Allow missing optional fields if they have defaults upon loading/calculation
                 if (stock.isFixedBuyEnabled !== undefined && typeof stock.isFixedBuyEnabled !== 'boolean') return false;
                 if (stock.fixedBuyAmount !== undefined && (typeof stock.fixedBuyAmount !== 'number' || stock.fixedBuyAmount < 0)) return false;

                 if (!Array.isArray(stock.transactions)) return false;
                 // Check transaction structure if necessary
                 for (const tx of stock.transactions) {
                      if (!tx || typeof tx !== 'object' || !tx.id || typeof tx.id !== 'string') return false;
                      if (!['buy', 'sell'].includes(tx.type)) return false;
                      if (typeof tx.date !== 'string' || isNaN(new Date(tx.date).getTime())) return false;
                       // Allow quantity/price to be potentially stored as strings if parsed later
                      if ((typeof tx.quantity !== 'number' && typeof tx.quantity !== 'string') || Number(tx.quantity) <= 0) return false;
                      if ((typeof tx.price !== 'number' && typeof tx.price !== 'string') || Number(tx.price) <= 0) return false;
                 }
             }
        }

        return true;
    }
};