// src/utils/currency.ts
import Decimal from 'decimal.js';
import type { Currency } from '../types';

/**
 * Currency converter utility class
 * Handles conversion between KRW and USD based on exchange rate
 */
export class CurrencyConverter {
    #exchangeRate: Decimal;

    constructor(exchangeRate: number | Decimal) {
        this.#exchangeRate = exchangeRate instanceof Decimal ? exchangeRate : new Decimal(exchangeRate);
    }

    /**
     * Convert USD amount to KRW
     */
    toKRW(usdAmount: Decimal | number): Decimal {
        const amount = usdAmount instanceof Decimal ? usdAmount : new Decimal(usdAmount);
        return amount.times(this.#exchangeRate);
    }

    /**
     * Convert KRW amount to USD
     */
    toUSD(krwAmount: Decimal | number): Decimal {
        const amount = krwAmount instanceof Decimal ? krwAmount : new Decimal(krwAmount);
        return amount.div(this.#exchangeRate);
    }

    /**
     * Convert amount from one currency to another
     */
    convertAmount(
        amount: Decimal | number,
        fromCurrency: Currency,
        toCurrency: Currency
    ): Decimal {
        if (fromCurrency === toCurrency) {
            return amount instanceof Decimal ? amount : new Decimal(amount);
        }

        if (fromCurrency === 'usd' && toCurrency === 'krw') {
            return this.toKRW(amount);
        }

        if (fromCurrency === 'krw' && toCurrency === 'usd') {
            return this.toUSD(amount);
        }

        throw new Error(`Unsupported currency conversion: ${fromCurrency} to ${toCurrency}`);
    }

    /**
     * Get the current exchange rate
     */
    getExchangeRate(): Decimal {
        return this.#exchangeRate;
    }

    /**
     * Update the exchange rate
     */
    setExchangeRate(rate: number | Decimal): void {
        this.#exchangeRate = rate instanceof Decimal ? rate : new Decimal(rate);
    }
}
