// js/validator.js
// @ts-check
import { CONFIG } from './constants.js';
import { t } from './i18n.js';
import { getRatioSum } from './utils.js'; // 동기 함수로 복구
import Decimal from 'decimal.js'; // 동기 임포트로 복구

/** @typedef {import('./types.js').CalculatedStock} CalculatedStock */
/** @typedef {import('./types.js').ValidationErrorDetail} ValidationErrorDetail */ // 타입 정의 추가

export const Validator = {
    /**
     * @description '계산하기' 실행 전 입력값들의 유효성을 검사합니다.
     * @param {{ mainMode: string, portfolioData: CalculatedStock[], additionalInvestment: Decimal }} param - 계산 모드, 주식 데이터, 추가 투자금
     * @returns {ValidationErrorDetail[]} 유효성 오류 상세 정보 객체 배열. 오류가 없으면 빈 배열.
     */
    validateForCalculation({ mainMode, portfolioData, additionalInvestment }) {
        /** @type {ValidationErrorDetail[]} */
        const errors = [];
        if (!portfolioData) {
            errors.push({ field: null, stockId: null, message: t('validation.calculationError') });
            return errors;
        }

        for (const stock of portfolioData) {
            const stockName = stock.name?.trim() || '이름 없는 종목';

            if (!stock.name?.trim()) errors.push({ field: 'name', stockId: stock.id, message: t('validation.nameMissing') });
            if (!stock.ticker?.trim()) errors.push({ field: 'ticker', stockId: stock.id, message: t('validation.tickerMissing', { name: stockName }) });

            // Check calculated values exist before using them
            if (stock.calculated && stock.calculated.quantity.greaterThan(0) && (stock.currentPrice ?? 0) <= 0) {
                 errors.push({ field: 'currentPrice', stockId: stock.id, message: t('validation.currentPriceZero', { name: stockName }) });
            }
            // ⬇️ Decimal 생성은 동기
            const fixedBuyAmountDec = new Decimal(stock.fixedBuyAmount || 0);
            if (stock.isFixedBuyEnabled && fixedBuyAmountDec.lte(0)) {
                errors.push({ field: 'fixedBuyAmount', stockId: stock.id, message: t('validation.fixedBuyAmountZero', { name: stockName }) });
            }
            const currentPriceDec = new Decimal(stock.currentPrice || 0);
            if (stock.isFixedBuyEnabled && currentPriceDec.gt(0) && fixedBuyAmountDec.lt(currentPriceDec)) {
                errors.push({ field: 'fixedBuyAmount', stockId: stock.id, message: t('validation.fixedBuyAmountTooSmall', { name: stockName }) });
            }
        }

        if (mainMode === 'add') {
            // additionalInvestment는 이미 Decimal 타입으로 받음
            if (!additionalInvestment || additionalInvestment.isZero() || additionalInvestment.isNegative()) {
                errors.push({ field: 'additionalAmount', stockId: null, message: t('validation.investmentAmountZero') });
            }

            // totalFixedBuy 계산 (동기 loop 사용)
            let totalFixedBuy = new Decimal(0);
            for (const s of portfolioData) {
                 if (s.isFixedBuyEnabled) {
                     const amount = new Decimal(s.fixedBuyAmount || 0);
                     totalFixedBuy = totalFixedBuy.plus(amount);
                 }
            }

            if (additionalInvestment && totalFixedBuy.greaterThan(additionalInvestment)) {
                errors.push({ field: null, stockId: null, message: t('validation.fixedBuyTotalExceeds') });
            }
        } else { // 'sell' mode
            // currentTotal 계산 (동기 loop 사용)
            let currentTotal = new Decimal(0);
            for(const s of portfolioData){
                const amount = s.calculated?.currentAmount ?? new Decimal(0);
                currentTotal = currentTotal.plus(amount);
            }

            if (currentTotal.isZero() || currentTotal.isNegative()) {
                errors.push({ field: null, stockId: null, message: t('validation.currentAmountZero') });
            }
            // ⬇️ getRatioSum은 동기 함수
            const totalRatio = getRatioSum(portfolioData);
            if (Math.abs(totalRatio.toNumber() - 100) > CONFIG.RATIO_TOLERANCE) {
                errors.push({ field: 'targetRatio', stockId: null, message: t('validation.ratioSumNot100', { totalRatio: totalRatio.toNumber().toFixed(1) }) });
            }
        }
        return errors;
    },

    /**
     * @description 숫자 입력값(문자열 포함)을 검증하고 유효한 양수 숫자로 변환합니다. 빈 문자열은 0으로 처리합니다.
     * @param {string | number | boolean | undefined | null} value - 검증할 입력값 (다양한 타입 처리)
     * @returns {{isValid: boolean, value?: number, message?: string}} 유효성 결과 객체
     */
    validateNumericInput(value) {
        if (value === true) return { isValid: false, message: t('validation.invalidNumber') };
        const stringValue = String(value ?? '').trim(); // Handle null/undefined safely
        if (stringValue === '') return { isValid: true, value: 0 };

        const numValue = parseFloat(stringValue);
        // @ts-ignore
        if (isNaN(numValue)) return { isValid: false, message: t('validation.invalidNumber') };
        if (numValue < 0) return { isValid: false, message: t('validation.negativeNumber') };

        return { isValid: true, value: numValue };
    },

    /**
     * @description 거래 내역 데이터(날짜, 수량, 단가)의 유효성을 검사합니다.
     * @param {{ date?: string, quantity?: number, price?: number }} txData - 검증할 거래 데이터 (속성 optional 처리)
     * @returns {{isValid: boolean, message?: string}} 유효성 결과 객체
     */
    validateTransaction(txData) {
        if (!txData || typeof txData !== 'object') {
             return { isValid: false, message: t('validation.invalidTransactionData') };
        }
        // Use NaN to fail isNaN check if undefined
        const date = txData.date ?? '';
        const quantity = txData.quantity ?? NaN;
        const price = txData.price ?? NaN;

        const timestamp = Date.parse(date);
        if (isNaN(timestamp)) {
            return { isValid: false, message: t('validation.invalidDate') };
        }
        if (timestamp > Date.now()) { // 미래 날짜 방지
            return { isValid: false, message: t('validation.futureDate') };
        }
        if (isNaN(quantity) || quantity <= 0) {
            return { isValid: false, message: t('validation.quantityZero') };
        }
        if (isNaN(price) || price <= 0) {
            return { isValid: false, message: t('validation.priceZero') };
        }
        return { isValid: true };
    },

    /**
     * @description 가져온 JSON 데이터의 기본 구조가 유효한지 검사합니다.
     * @param {any} data - 검증할 JSON 데이터
     * @returns {boolean} 구조 유효성 여부
     */
    isDataStructureValid(data) {
        if (!data || typeof data.portfolios !== 'object' || data.portfolios === null || typeof data.activePortfolioId !== 'string') {
            return false;
        }

        const portfolioIds = Object.keys(data.portfolios);
        if (portfolioIds.length === 0) {
             return false;
        }

        // Check if activePortfolioId points to a valid portfolio
        const activePortfolio = data.portfolios[data.activePortfolioId];
        if (!activePortfolio || typeof activePortfolio !== 'object' || activePortfolio === null) {
             return false;
        }

        // Check the structure of the active portfolio
        const portfolioToCheck = activePortfolio;
        if (!Array.isArray(portfolioToCheck.portfolioData) || typeof portfolioToCheck.settings !== 'object' || portfolioToCheck.settings === null) {
            return false;
        }

        // Check structure of the first stock if portfolioData is not empty
        const firstStock = portfolioToCheck.portfolioData[0];
        if (firstStock) { // Only check if firstStock exists
             if (
                typeof firstStock.id !== 'string' ||
                typeof firstStock.name !== 'string' ||
                typeof firstStock.ticker !== 'string' ||
                typeof firstStock.targetRatio !== 'number' ||
                typeof firstStock.currentPrice !== 'number' ||
                !Array.isArray(firstStock.transactions) ||
                typeof firstStock.isFixedBuyEnabled !== 'boolean' ||
                typeof firstStock.fixedBuyAmount !== 'number'
            ) {
                 console.warn("First stock structure mismatch:", firstStock);
                return false;
            }
             // Optionally, check the structure of the first transaction
             const firstTransaction = firstStock.transactions[0];
             if (firstTransaction && (
                 typeof firstTransaction.id !== 'string' ||
                 (firstTransaction.type !== 'buy' && firstTransaction.type !== 'sell') ||
                 typeof firstTransaction.date !== 'string' || // Could add regex check for format
                 typeof firstTransaction.quantity !== 'number' ||
                 typeof firstTransaction.price !== 'number'
             )) {
                  console.warn("First transaction structure mismatch:", firstTransaction);
                  return false;
             }
        }
        // If all checks pass
        return true;
    }
};