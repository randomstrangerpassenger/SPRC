// src/viewModels/TransactionViewModelMapper.ts
import type { Transaction, Stock } from '../types';
import type { TransactionListViewModel, TransactionRowViewModel } from './types';
import Decimal from 'decimal.js';
import { formatCurrency, formatNumber } from '../utils';
import { t } from '../i18n';

/**
 * @class TransactionViewModelMapper
 * @description Maps Transaction domain models to TransactionListViewModel
 */
export class TransactionViewModelMapper {
    /**
     * @description Convert transactions to TransactionListViewModel
     * @param stock - Stock containing transactions
     * @param currency - Current currency
     * @returns TransactionListViewModel
     */
    static toListViewModel(stock: Stock, currency: 'krw' | 'usd'): TransactionListViewModel {
        const transactionRows: TransactionRowViewModel[] = stock.transactions.map((tx) =>
            this.toRowViewModel(tx, currency)
        );

        // Calculate aggregates
        const { totalQuantity, totalInvested, averagePrice } =
            this.calculateAggregates(stock.transactions);

        return {
            stockName: stock.name,
            transactions: transactionRows,
            currency,
            totalQuantity: formatNumber(totalQuantity, 2),
            totalInvested: formatCurrency(totalInvested, currency),
            averagePrice: formatCurrency(averagePrice, currency),
        };
    }

    /**
     * @description Convert single transaction to TransactionRowViewModel
     * @param transaction - Transaction data
     * @param currency - Current currency
     * @returns TransactionRowViewModel
     */
    static toRowViewModel(
        transaction: Transaction,
        currency: 'krw' | 'usd'
    ): TransactionRowViewModel {
        const quantity = new Decimal(transaction.quantity || 0);
        const price = new Decimal(transaction.price || 0);
        const totalAmount = quantity.times(price);

        return {
            id: transaction.id,
            type: transaction.type,
            typeLabel: this.getTypeLabel(transaction.type),
            date: transaction.date,
            dateFormatted: this.formatDate(transaction.date),
            quantity: formatNumber(transaction.quantity || 0, 2),
            price: formatCurrency(transaction.price || 0, currency),
            totalAmount: formatCurrency(totalAmount, currency),
        };
    }

    /**
     * @description Get localized label for transaction type
     * @param type - Transaction type
     * @returns Localized label
     */
    private static getTypeLabel(type: 'buy' | 'sell' | 'dividend'): string {
        const labels: Record<string, string> = {
            buy: t('transactions.buy'),
            sell: t('transactions.sell'),
            dividend: t('transactions.dividend'),
        };
        return labels[type] || type;
    }

    /**
     * @description Format date to user-friendly format
     * @param dateStr - ISO date string
     * @returns Formatted date
     */
    private static formatDate(dateStr: string): string {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
        } catch {
            return dateStr;
        }
    }

    /**
     * @description Calculate transaction aggregates
     * @param transactions - Array of transactions
     * @returns Aggregated values
     */
    private static calculateAggregates(transactions: Transaction[]): {
        totalQuantity: number;
        totalInvested: Decimal;
        averagePrice: Decimal;
    } {
        let totalQuantity = new Decimal(0);
        let totalInvested = new Decimal(0);
        let buyTransactionCount = 0;

        for (const tx of transactions) {
            const quantity = new Decimal(tx.quantity || 0);
            const price = new Decimal(tx.price || 0);

            if (tx.type === 'buy') {
                totalQuantity = totalQuantity.plus(quantity);
                totalInvested = totalInvested.plus(quantity.times(price));
                buyTransactionCount++;
            } else if (tx.type === 'sell') {
                totalQuantity = totalQuantity.minus(quantity);
            }
        }

        const averagePrice =
            buyTransactionCount > 0 && totalQuantity.greaterThan(0)
                ? totalInvested.div(totalQuantity)
                : new Decimal(0);

        return {
            totalQuantity: totalQuantity.toNumber(),
            totalInvested,
            averagePrice,
        };
    }
}
