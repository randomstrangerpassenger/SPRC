// src/services/TransactionAnalysisService.ts
import Decimal from 'decimal.js';
import type {
    Stock,
    TransactionAnalysis,
    PortfolioTransactionSummary,
    Transaction,
} from '../types';
import { logger } from './Logger';

/**
 * @class TransactionAnalysisService
 * @description 거래 내역 분석 서비스 (Phase 4.16)
 */
export class TransactionAnalysisService {
    /**
     * @description 종목별 거래 내역 분석
     * @param stock - 종목 데이터
     * @returns TransactionAnalysis
     */
    static analyzeStock(stock: Stock): TransactionAnalysis {
        const buyTransactions = stock.transactions.filter((tx) => tx.type === 'buy');
        const sellTransactions = stock.transactions.filter((tx) => tx.type === 'sell');
        const dividendTransactions = stock.transactions.filter((tx) => tx.type === 'dividend');

        // Calculate buy metrics
        const totalBuyQuantity = buyTransactions.reduce(
            (sum, tx) => sum.plus(tx.quantity instanceof Decimal ? tx.quantity : new Decimal(tx.quantity)),
            new Decimal(0)
        );
        const totalBuyAmount = buyTransactions.reduce(
            (sum, tx) => {
                const quantity = tx.quantity instanceof Decimal ? tx.quantity : new Decimal(tx.quantity);
                const price = tx.price instanceof Decimal ? tx.price : new Decimal(tx.price);
                return sum.plus(quantity.times(price));
            },
            new Decimal(0)
        );
        const avgBuyPrice = totalBuyQuantity.isZero()
            ? new Decimal(0)
            : totalBuyAmount.div(totalBuyQuantity);

        // Calculate sell metrics
        const totalSellQuantity = sellTransactions.reduce(
            (sum, tx) => sum.plus(tx.quantity instanceof Decimal ? tx.quantity : new Decimal(tx.quantity)),
            new Decimal(0)
        );
        const totalSellAmount = sellTransactions.reduce(
            (sum, tx) => {
                const quantity = tx.quantity instanceof Decimal ? tx.quantity : new Decimal(tx.quantity);
                const price = tx.price instanceof Decimal ? tx.price : new Decimal(tx.price);
                return sum.plus(quantity.times(price));
            },
            new Decimal(0)
        );
        const avgSellPrice = totalSellQuantity.isZero()
            ? new Decimal(0)
            : totalSellAmount.div(totalSellQuantity);

        // Calculate dividend metrics
        const totalDividends = dividendTransactions.reduce(
            (sum, tx) => {
                const amount = tx.price instanceof Decimal ? tx.price : new Decimal(tx.price);
                return sum.plus(amount);
            },
            new Decimal(0)
        );

        // Calculate trading frequency
        const allTransactions = stock.transactions.filter((tx) => tx.type === 'buy' || tx.type === 'sell');
        const sortedDates = allTransactions.map((tx) => tx.date).sort();

        let firstTransactionDate = '';
        let lastTransactionDate = '';
        let tradingPeriodDays = 0;
        let tradingFrequency = new Decimal(0);

        if (sortedDates.length > 0) {
            firstTransactionDate = sortedDates[0];
            lastTransactionDate = sortedDates[sortedDates.length - 1];

            const firstDate = new Date(firstTransactionDate);
            const lastDate = new Date(lastTransactionDate);
            tradingPeriodDays = Math.max(1, Math.floor(
                (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
            ));

            // Trading frequency: transactions per month
            const tradingPeriodMonths = tradingPeriodDays / 30.44; // Average days per month
            tradingFrequency = tradingPeriodMonths > 0
                ? new Decimal(allTransactions.length).div(tradingPeriodMonths)
                : new Decimal(0);
        }

        return {
            stockId: stock.id,
            ticker: stock.ticker,
            name: stock.name,
            buyTransactions,
            sellTransactions,
            dividendTransactions,
            avgBuyPrice,
            avgSellPrice,
            totalBuyAmount,
            totalSellAmount,
            totalDividends,
            buyCount: buyTransactions.length,
            sellCount: sellTransactions.length,
            dividendCount: dividendTransactions.length,
            tradingFrequency,
            firstTransactionDate,
            lastTransactionDate,
            tradingPeriodDays,
        };
    }

    /**
     * @description 포트폴리오 전체 거래 내역 요약
     * @param stocks - 종목 배열
     * @param feeRate - 거래 수수료율 (%)
     * @param taxRate - 세율 (%)
     * @returns PortfolioTransactionSummary
     */
    static analyzePortfolio(
        stocks: Stock[],
        feeRate: number = 0,
        taxRate: number = 0
    ): PortfolioTransactionSummary {
        const stockAnalyses = stocks.map((stock) => this.analyzeStock(stock));

        const totalBuyAmount = stockAnalyses.reduce(
            (sum, analysis) => sum.plus(analysis.totalBuyAmount),
            new Decimal(0)
        );

        const totalSellAmount = stockAnalyses.reduce(
            (sum, analysis) => sum.plus(analysis.totalSellAmount),
            new Decimal(0)
        );

        const totalDividends = stockAnalyses.reduce(
            (sum, analysis) => sum.plus(analysis.totalDividends),
            new Decimal(0)
        );

        const totalTransactions = stockAnalyses.reduce(
            (sum, analysis) => sum + analysis.buyCount + analysis.sellCount + analysis.dividendCount,
            0
        );

        // Calculate trading costs
        const totalTradingVolume = totalBuyAmount.plus(totalSellAmount);
        const feeAmount = totalTradingVolume.times(feeRate).div(100);

        // Tax on capital gains (sell - buy)
        const capitalGains = totalSellAmount.minus(totalBuyAmount);
        const taxAmount = capitalGains.greaterThan(0)
            ? capitalGains.times(taxRate).div(100)
            : new Decimal(0);

        const totalTradingCosts = feeAmount.plus(taxAmount);

        // Net cash flow (sell + dividends - buy)
        const netCashFlow = totalSellAmount.plus(totalDividends).minus(totalBuyAmount);

        // Trading cost by stock
        const tradingCostByStock = stockAnalyses.map((analysis) => {
            const tradingVolume = analysis.totalBuyAmount.plus(analysis.totalSellAmount);
            const stockFeeAmount = tradingVolume.times(feeRate).div(100);

            const stockCapitalGains = analysis.totalSellAmount.minus(analysis.totalBuyAmount);
            const stockTaxAmount = stockCapitalGains.greaterThan(0)
                ? stockCapitalGains.times(taxRate).div(100)
                : new Decimal(0);

            return {
                stockId: analysis.stockId,
                ticker: analysis.ticker,
                tradingCost: stockFeeAmount.plus(stockTaxAmount),
                feeAmount: stockFeeAmount,
                taxAmount: stockTaxAmount,
            };
        });

        return {
            totalBuyAmount,
            totalSellAmount,
            totalDividends,
            totalTransactions,
            totalTradingCosts,
            netCashFlow,
            stockAnalyses,
            tradingCostByStock,
        };
    }
}
