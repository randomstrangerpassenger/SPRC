// src/validator.ts
import { t } from './i18n';
import Decimal from 'decimal.js';
import { logger } from './services/Logger';
import {
    TransactionType,
    MainMode,
    Currency,
    type Transaction,
    type ValidationResult,
    type ValidationErrorDetail,
    type CalculatedStock,
} from './types';

export const Validator = {
    /**
     * @description 티커 심볼 검증 및 정규화 (대문자, 숫자, ., - 만 허용)
     * @param value - 검증할 티커
     * @returns 검증 결과
     */
    validateTicker(value: string | null | undefined): ValidationResult {
        const trimmedValue = String(value ?? '').trim();
        if (trimmedValue === '') {
            return { isValid: true, value: '' }; // 빈 티커 허용
        }

        // 대문자, 숫자, ., - 만 허용하고 나머지 제거
        const sanitized = trimmedValue.toUpperCase().replace(/[^A-Z0-9.\-]/g, '');

        // 길이 제한 (일반적으로 티커는 1-10자)
        if (sanitized.length > 10) {
            return { isValid: false, message: 'Ticker too long (max 10 characters)' };
        }

        return { isValid: true, value: sanitized };
    },

    /**
     * @description 자유 텍스트 검증 (길이 제한만 적용, DOMPurify는 controller에서 처리)
     * @param value - 검증할 텍스트
     * @param maxLength - 최대 길이
     * @returns 검증 결과
     */
    validateText(value: string | null | undefined, maxLength: number = 100): ValidationResult {
        const trimmedValue = String(value ?? '').trim();
        if (trimmedValue.length > maxLength) {
            return { isValid: false, message: `Text too long (max ${maxLength} characters)` };
        }
        return { isValid: true, value: trimmedValue };
    },

    /**
     * @description 숫자 입력값을 검증하고, 유효하면 숫자 타입으로 변환하여 반환합니다.
     * @param value - 검증할 값
     * @param max - 최대값 (기본: 1000조)
     * @returns 검증 결과 (value는 number 타입이지만, state.ts에서 Decimal로 변환됨)
     */
    validateNumericInput(
        value: string | number | null | undefined,
        max: number = 1e15
    ): ValidationResult {
        const trimmedValue = String(value ?? '').trim();
        if (trimmedValue === '') {
            return { isValid: false, message: t('validation.invalidNumber') };
        }

        const num = Number(trimmedValue);
        if (isNaN(num)) {
            return { isValid: false, message: t('validation.invalidNumber') };
        }
        if (num < 0) {
            return { isValid: false, message: t('validation.negativeNumber') };
        }

        // 최대값 제한
        if (num > max) {
            return {
                isValid: false,
                message: `Number too large (max ${max.toExponential()})`,
            };
        }

        // Check for excessively large numbers or precision issues using Decimal.js
        try {
            const decValue = new Decimal(trimmedValue);
            if (!decValue.isFinite()) {
                throw new Error('Number is not finite');
            }
            if (!isFinite(num)) {
                throw new Error('Number is too large for standard JS number');
            }
        } catch (error) {
            logger.error('Decimal validation error', 'Validator', error);
            return { isValid: false, message: t('validation.calcErrorDecimal') };
        }

        return { isValid: true, value: num };
    },

    /**
     * @description 단일 거래 내역의 유효성을 검사합니다.
     * @param txData - 거래 데이터
     * @returns 검증 결과
     */
    validateTransaction(txData: Partial<Transaction>): ValidationResult {
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
            if (Number(txData.quantity) === 0)
                return { isValid: false, message: t('validation.quantityZero') };
            if (Number(txData.quantity) < 0)
                return { isValid: false, message: t('validation.negativeNumber') };
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
            if (Number(txData.price) === 0)
                return { isValid: false, message: t('validation.priceZero') };
            if (Number(txData.price) < 0)
                return { isValid: false, message: t('validation.negativeNumber') };
            return { isValid: false, message: priceValidation.message }; // Should be invalidNumber here
        }
        // validateNumericInput already checks for < 0, but explicit 0 check remains useful
        if (priceValidation.value === 0) {
            return { isValid: false, message: t('validation.priceZero') };
        }

        return { isValid: true };
    },

    /**
     * @description 리밸런싱 계산 전 전체 입력 데이터의 유효성을 검사합니다.
     * @param inputs - 계산 입력값
     * @returns 오류 배열 (유효하면 빈 배열)
     */
    validateForCalculation(inputs: {
        mainMode: MainMode;
        portfolioData: CalculatedStock[];
        additionalInvestment: Decimal;
    }): ValidationErrorDetail[] {
        const errors: ValidationErrorDetail[] = [];
        const { mainMode, portfolioData, additionalInvestment } = inputs;

        // 추가 매수 모드 또는 간단 계산 모드일 때 추가 투자금액 검증
        if (mainMode === MainMode.Add || mainMode === MainMode.Simple) {
            // Use Decimal's comparison methods
            if (
                !additionalInvestment ||
                additionalInvestment.isNaN() ||
                additionalInvestment.isNegative() ||
                additionalInvestment.isZero()
            ) {
                errors.push({
                    field: 'additionalInvestment',
                    stockId: null,
                    message: t('validation.investmentAmountZero'),
                });
            }
        }

        let totalFixedBuyAmount = new Decimal(0);

        // 각 주식 항목 검증
        portfolioData.forEach((stock) => {
            const stockName = stock.name || t('defaults.newStock'); // Use default if name is empty

            if (!stock.name?.trim()) {
                errors.push({
                    field: 'name',
                    stockId: stock.id,
                    message: t('validation.nameMissing'),
                });
            }
            if (!stock.ticker?.trim()) {
                errors.push({
                    field: 'ticker',
                    stockId: stock.id,
                    message: t('validation.tickerMissing', { name: stockName }),
                });
            }

            const quantity = stock.calculated?.quantity;
            const currentPrice = new Decimal(stock.currentPrice ?? 0); // Use Decimal for currentPrice check

            if (
                quantity &&
                quantity instanceof Decimal &&
                quantity.greaterThan(0) &&
                (currentPrice.isNaN() || currentPrice.isNegative() || currentPrice.isZero())
            ) {
                errors.push({
                    field: 'currentPrice',
                    stockId: stock.id,
                    message: t('validation.currentPriceZero', { name: stockName }),
                });
            }

            // 고정 매수 관련 검증 (추가 매수 모드 및 간단 계산 모드에서)
            if ((mainMode === MainMode.Add || mainMode === MainMode.Simple) && stock.isFixedBuyEnabled) {
                const fixedAmount = new Decimal(stock.fixedBuyAmount || 0);

                if (fixedAmount.isNaN() || fixedAmount.isNegative() || fixedAmount.isZero()) {
                    errors.push({
                        field: 'fixedBuyAmount',
                        stockId: stock.id,
                        message: t('validation.fixedBuyAmountZero', { name: stockName }),
                    });
                }
                // 소수점 거래(fractional shares) 지원을 위해 현재가보다 작은 금액도 허용
                totalFixedBuyAmount = totalFixedBuyAmount.plus(fixedAmount);
            }

            // 목표 비율 검증 (음수 여부 등)
            const targetRatio = new Decimal(stock.targetRatio ?? 0); // Use ?? 0 for safety
            if (targetRatio.isNaN() || targetRatio.isNegative()) {
                errors.push({
                    field: 'targetRatio',
                    stockId: stock.id,
                    message: t('validation.negativeNumber'),
                }); // Can't be negative
            }
        });

        // 추가 매수 모드 및 간단 계산 모드에서 총 고정 매수 금액이 추가 투자금을 초과하는지 검증
        if (
            (mainMode === MainMode.Add || mainMode === MainMode.Simple) &&
            !additionalInvestment.isNaN() &&
            totalFixedBuyAmount.greaterThan(additionalInvestment)
        ) {
            errors.push({
                field: 'fixedBuyAmount',
                stockId: null,
                message: t('validation.fixedBuyTotalExceeds'),
            });
        }

        return errors;
    },

    /**
     * @description 필드별 통합 유효성 검사
     * @param field - 필드 이름
     * @param value - 검증할 값
     * @returns 검증 결과
     */
    validateField(
        field: string,
        value: string | number | boolean | Decimal
    ): ValidationResult {
        switch (field) {
            case 'targetRatio':
            case 'currentPrice':
            case 'fixedBuyAmount':
            case 'manualAmount':
                return this.validateNumericInput(value);

            case 'isFixedBuyEnabled':
                return { isValid: true, value: Boolean(value) };

            case 'ticker':
                return this.validateTicker(value);

            case 'name':
                return this.validateText(value, 50);

            case 'sector':
                return this.validateText(value, 30);

            default:
                // 기본적으로 문자열로 처리
                return this.validateText(value, 100);
        }
    },

    /**
     * @description 가져온(import) 데이터의 기본 구조가 유효한지 검사합니다.
     * @param data - JSON.parse로 읽어온 데이터
     * @returns 구조 유효 여부
     */
    isDataStructureValid(data: unknown): boolean {
        if (!data || typeof data !== 'object') return false;
        if (
            !data.meta ||
            typeof data.meta !== 'object' ||
            typeof data.meta.activePortfolioId !== 'string'
        )
            return false; // Check type
        if (!data.portfolios || typeof data.portfolios !== 'object') return false;

        // Check individual portfolios
        for (const portId in data.portfolios) {
            const portfolio = data.portfolios[portId];
            if (!portfolio || typeof portfolio !== 'object') return false;
            if (portfolio.id !== portId || !portfolio.name || typeof portfolio.name !== 'string')
                return false;
            // Check settings object structure (basic)
            if (!portfolio.settings || typeof portfolio.settings !== 'object') return false;
            if (!Object.values(MainMode).includes(portfolio.settings.mainMode)) return false;
            if (!Object.values(Currency).includes(portfolio.settings.currentCurrency)) return false;
            if (
                typeof portfolio.settings.exchangeRate !== 'number' ||
                portfolio.settings.exchangeRate <= 0
            )
                return false;

            // Check portfolioData array structure (basic)
            if (!Array.isArray(portfolio.portfolioData)) return false;
            // Optionally, add checks for individual stock structure within portfolioData if needed
            for (const stock of portfolio.portfolioData) {
                if (
                    !stock ||
                    typeof stock !== 'object' ||
                    !stock.id ||
                    typeof stock.id !== 'string'
                )
                    return false;
                // Add more checks for required stock properties (name, ticker, etc.)
                if (typeof stock.name !== 'string' || typeof stock.ticker !== 'string')
                    return false;
                // Allow optional sector
                if (stock.sector !== undefined && typeof stock.sector !== 'string') return false;
                if (typeof stock.targetRatio !== 'number' || stock.targetRatio < 0) return false;
                if (typeof stock.currentPrice !== 'number' || stock.currentPrice < 0) return false;
                // Allow missing optional fields if they have defaults upon loading/calculation
                if (
                    stock.isFixedBuyEnabled !== undefined &&
                    typeof stock.isFixedBuyEnabled !== 'boolean'
                )
                    return false;
                if (
                    stock.fixedBuyAmount !== undefined &&
                    (typeof stock.fixedBuyAmount !== 'number' || stock.fixedBuyAmount < 0)
                )
                    return false;

                if (!Array.isArray(stock.transactions)) return false;
                // Check transaction structure if necessary
                for (const tx of stock.transactions) {
                    if (!tx || typeof tx !== 'object' || !tx.id || typeof tx.id !== 'string')
                        return false;
                    if (!Object.values(TransactionType).includes(tx.type)) return false;
                    if (typeof tx.date !== 'string' || isNaN(new Date(tx.date).getTime()))
                        return false;
                    // Allow quantity/price to be potentially stored as strings if parsed later
                    if (
                        (typeof tx.quantity !== 'number' && typeof tx.quantity !== 'string') ||
                        Number(tx.quantity) <= 0
                    )
                        return false;
                    if (
                        (typeof tx.price !== 'number' && typeof tx.price !== 'string') ||
                        Number(tx.price) <= 0
                    )
                        return false;
                }
            }
        }

        return true;
    },
};
