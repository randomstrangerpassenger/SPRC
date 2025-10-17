import { CONFIG, MESSAGES } from './constants.js';
import { getRatioSum } from './utils.js';
import Decimal from 'https://cdn.jsdelivr.net/npm/decimal.js@10.4.3/decimal.mjs';

export const Validator = {
    validateForCalculation({ mainMode, portfolioData, additionalInvestment }) {
        const errors = [];
        const calculatedPortfolio = portfolioData;

        for (const stock of calculatedPortfolio) {
            if (!stock.name.trim()) errors.push(`- 이름 없는 종목의 종목명을 입력해주세요.`);
            if (!stock.ticker.trim()) errors.push(`- '${stock.name}'의 티커를 입력해주세요.`);
            if (stock.calculated.quantity.greaterThan(0) && stock.currentPrice <= 0) {
                 errors.push(`- '${stock.name}'의 현재가는 0보다 커야 합니다.`);
            }
        }

        if (mainMode === 'add') {
            if (additionalInvestment.isZero() || additionalInvestment.isNegative()) {
                errors.push(MESSAGES.INVESTMENT_AMOUNT_ZERO);
            }
            const totalFixedBuy = portfolioData.reduce((sum, s) => {
                return s.isFixedBuyEnabled ? sum.plus(new Decimal(s.fixedBuyAmount || 0)) : sum;
            }, new Decimal(0));
            if (totalFixedBuy.greaterThan(additionalInvestment)) {
                errors.push("- 고정 매수 금액의 합이 총 투자금을 초과합니다.");
            }
        } else { // 'sell' mode
            const currentTotal = calculatedPortfolio.reduce((sum, s) => sum.plus(s.calculated.currentAmount), new Decimal(0));
            if (currentTotal.isZero() || currentTotal.isNegative()) {
                errors.push(MESSAGES.CURRENT_AMOUNT_ZERO);
            }
            const totalRatio = getRatioSum(calculatedPortfolio);
            if (Math.abs(totalRatio - 100) > CONFIG.RATIO_TOLERANCE) {
                errors.push(MESSAGES.RATIO_SUM_NOT_100(totalRatio));
            }
        }
        return errors;
    },

    validateNumericInput(value) {
        const trimmedValue = String(value).trim();
        if (trimmedValue === '') return { isValid: true, value: 0 };

        if (isNaN(value)) return { isValid: false, message: '유효한 숫자가 아닙니다.' };
        
        const numValue = parseFloat(value);
        if (numValue < 0) return { isValid: false, message: '음수는 입력할 수 없습니다.' };

        return { isValid: true, value: numValue };
    },

    validateTransaction(txData) {
        const { date, quantity, price } = txData;
        if (!date || isNaN(quantity) || isNaN(price) || quantity <= 0 || price <= 0) {
            return { isValid: false, message: MESSAGES.INVALID_TRANSACTION_DATA };
        }
        return { isValid: true };
    },

    isDataStructureValid(data) {
        if (!data || !data.portfolios || !data.activePortfolioId) {
            return false;
        }
        const activePortfolio = data.portfolios[data.activePortfolioId];
        if (!activePortfolio || !activePortfolio.portfolioData || !Array.isArray(activePortfolio.portfolioData)) {
            return false;
        }
        const firstStock = activePortfolio.portfolioData[0];
        if (firstStock && typeof firstStock.isFixedBuyEnabled === 'undefined') {
            return false;
        }
        return true;
    }
};