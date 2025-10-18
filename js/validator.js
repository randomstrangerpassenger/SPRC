import { CONFIG, MESSAGES } from './constants.js';
import { getRatioSum } from './utils.js';
import Decimal from 'decimal.js';

export const Validator = {
    validateForCalculation({ mainMode, portfolioData, additionalInvestment }) {
        const errors = [];
        
        for (const stock of portfolioData) {
            if (!stock.name.trim()) errors.push(`- 이름 없는 종목의 종목명을 입력해주세요.`);
            if (!stock.ticker.trim()) errors.push(`- '${escapeHTML(stock.name)}'의 티커를 입력해주세요.`);
            if (stock.calculated.quantity.greaterThan(0) && stock.currentPrice <= 0) {
                 errors.push(`- '${escapeHTML(stock.name)}'의 현재가는 0보다 커야 합니다.`);
            }
            if (stock.isFixedBuyEnabled && new Decimal(stock.fixedBuyAmount).lte(0)) {
                errors.push(`- '${escapeHTML(stock.name)}'의 고정 매수 금액은 0보다 커야 합니다.`);
            }
            if (stock.isFixedBuyEnabled && new Decimal(stock.currentPrice).gt(0) && new Decimal(stock.fixedBuyAmount).lt(stock.currentPrice)) {
                errors.push(MESSAGES.FIXED_BUY_AMOUNT_TOO_SMALL(escapeHTML(stock.name)));
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
            const currentTotal = portfolioData.reduce((sum, s) => sum.plus(s.calculated.currentAmount), new Decimal(0));
            if (currentTotal.isZero() || currentTotal.isNegative()) {
                errors.push(MESSAGES.CURRENT_AMOUNT_ZERO);
            }
            const totalRatio = getRatioSum(portfolioData);
            if (Math.abs(totalRatio.toNumber() - 100) > CONFIG.RATIO_TOLERANCE) {
                errors.push(MESSAGES.RATIO_SUM_NOT_100(totalRatio.toNumber()));
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
        const timestamp = Date.parse(txData.date);
        if (isNaN(timestamp)) {
            return { isValid: false, message: '유효한 날짜를 입력해주세요.' };
        }
        if (timestamp > Date.now()) {
            return { isValid: false, message: '미래 날짜는 입력할 수 없습니다.' };
        }
        if (isNaN(txData.quantity) || txData.quantity <= 0) {
            return { isValid: false, message: '수량은 0보다 커야 합니다.' };
        }
        if (isNaN(txData.price) || txData.price <= 0) {
            return { isValid: false, message: '단가는 0보다 커야 합니다.' };
        }
        return { isValid: true };
    },

    isDataStructureValid(data) {
        if (!data || typeof data.portfolios !== 'object' || !data.activePortfolioId) {
            return false;
        }
        const activePortfolio = data.portfolios[data.activePortfolioId];
        if (!activePortfolio || !Array.isArray(activePortfolio.portfolioData)) {
            return false;
        }
        // Check for essential fields in the first stock item, if it exists
        const firstStock = activePortfolio.portfolioData[0];
        if (firstStock && (
            typeof firstStock.id === 'undefined' ||
            typeof firstStock.name === 'undefined' ||
            typeof firstStock.targetRatio === 'undefined' ||
            typeof firstStock.transactions === 'undefined'
        )) {
            return false;
        }
        return true;
    }
};