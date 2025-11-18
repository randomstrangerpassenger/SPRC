// src/services/TaxLotService.ts
import Decimal from 'decimal.js';
import type {
    Stock,
    TaxLot,
    TaxLotAnalysis,
    TaxLotSale,
    TaxOptimizedSale,
    TaxCalculationMethod,
    TaxSettings,
    Transaction,
} from '../types';
import { logger } from './Logger';

/**
 * @class TaxLotService
 * @description Tax-Lot Accounting 서비스 (FIFO/LIFO/HIFO 세금 계산)
 */
export class TaxLotService {
    /**
     * @description 종목의 Tax Lot 분석
     * @param stock - 종목 데이터
     * @param method - 세금 계산 방법
     * @returns TaxLotAnalysis
     */
    static analyzeTaxLots(stock: Stock, method: TaxCalculationMethod = 'FIFO'): TaxLotAnalysis {
        const lots = this.buildTaxLots(stock.transactions);
        const totalQuantity = lots.reduce((sum, lot) => sum.plus(lot.remainingQuantity), new Decimal(0));

        const currentPrice = stock.currentPrice instanceof Decimal
            ? stock.currentPrice
            : new Decimal(stock.currentPrice || 0);

        // Calculate average cost basis
        const totalCost = lots.reduce(
            (sum, lot) => sum.plus(lot.price.times(lot.remainingQuantity)),
            new Decimal(0)
        );
        const averageCostBasis = totalQuantity.isZero()
            ? new Decimal(0)
            : totalCost.div(totalQuantity);

        // Calculate unrealized gain
        const currentValue = currentPrice.times(totalQuantity);
        const unrealizedGain = currentValue.minus(totalCost);
        const unrealizedGainPercent = totalCost.isZero()
            ? new Decimal(0)
            : unrealizedGain.div(totalCost).times(100);

        return {
            stockId: stock.id,
            ticker: stock.ticker,
            name: stock.name,
            method,
            lots,
            totalQuantity,
            averageCostBasis,
            currentPrice,
            unrealizedGain,
            unrealizedGainPercent,
        };
    }

    /**
     * @description 거래 내역으로부터 Tax Lot 구축
     * @param transactions - 거래 내역
     * @returns TaxLot[]
     */
    private static buildTaxLots(transactions: Transaction[]): TaxLot[] {
        const lots: TaxLot[] = [];

        // Sort transactions by date
        const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

        sorted.forEach((tx) => {
            if (tx.type === 'buy') {
                // Create new lot
                const quantity = tx.quantity instanceof Decimal ? tx.quantity : new Decimal(tx.quantity);
                const price = tx.price instanceof Decimal ? tx.price : new Decimal(tx.price);

                lots.push({
                    transactionId: tx.id,
                    date: tx.date,
                    quantity,
                    originalQuantity: quantity,
                    price,
                    remainingQuantity: quantity,
                });
            } else if (tx.type === 'sell') {
                // Reduce lots (FIFO order for building)
                let remainingToSell = tx.quantity instanceof Decimal
                    ? tx.quantity
                    : new Decimal(tx.quantity);

                for (const lot of lots) {
                    if (remainingToSell.isZero()) break;
                    if (lot.remainingQuantity.isZero()) continue;

                    const sellFromThisLot = Decimal.min(lot.remainingQuantity, remainingToSell);
                    lot.remainingQuantity = lot.remainingQuantity.minus(sellFromThisLot);
                    remainingToSell = remainingToSell.minus(sellFromThisLot);
                }
            }
        });

        // Return only lots with remaining quantity
        return lots.filter((lot) => lot.remainingQuantity.greaterThan(0));
    }

    /**
     * @description 세금 최적화 매도 전략 계산
     * @param stock - 종목 데이터
     * @param quantityToSell - 매도할 수량
     * @param currentPrice - 현재 가격
     * @param taxSettings - 세금 설정
     * @returns TaxOptimizedSale
     */
    static calculateOptimizedSale(
        stock: Stock,
        quantityToSell: Decimal,
        currentPrice: Decimal,
        taxSettings: TaxSettings
    ): TaxOptimizedSale {
        // Calculate for each method
        const fifoSale = this.calculateSaleByMethod(stock, quantityToSell, currentPrice, 'FIFO', taxSettings);
        const lifoSale = this.calculateSaleByMethod(stock, quantityToSell, currentPrice, 'LIFO', taxSettings);
        const hifoSale = this.calculateSaleByMethod(stock, quantityToSell, currentPrice, 'HIFO', taxSettings);

        // Find method with lowest tax
        const methods = [fifoSale, lifoSale, hifoSale];
        const bestMethod = methods.reduce((best, current) =>
            current.totalTax.lessThan(best.totalTax) ? current : best
        );

        return bestMethod;
    }

    /**
     * @description 특정 방법으로 매도 계산
     * @param stock - 종목 데이터
     * @param quantityToSell - 매도할 수량
     * @param salePrice - 매도 가격
     * @param method - 세금 계산 방법
     * @param taxSettings - 세금 설정
     * @returns TaxOptimizedSale
     */
    static calculateSaleByMethod(
        stock: Stock,
        quantityToSell: Decimal,
        salePrice: Decimal,
        method: TaxCalculationMethod,
        taxSettings: TaxSettings
    ): TaxOptimizedSale {
        const lots = this.buildTaxLots(stock.transactions);
        const today = new Date().toISOString().split('T')[0];

        // Sort lots based on method
        const sortedLots = this.sortLotsByMethod(lots, method);

        const estimatedSales: TaxLotSale[] = [];
        let remainingToSell = quantityToSell;
        let totalCapitalGain = new Decimal(0);
        let shortTermGain = new Decimal(0);
        let longTermGain = new Decimal(0);

        for (const lot of sortedLots) {
            if (remainingToSell.isZero()) break;
            if (lot.remainingQuantity.isZero()) continue;

            const sellQuantity = Decimal.min(lot.remainingQuantity, remainingToSell);
            const capitalGain = salePrice.minus(lot.price).times(sellQuantity);

            // Calculate holding period
            const purchaseDate = new Date(lot.date);
            const saleDate = new Date(today);
            const holdingPeriodDays = Math.floor(
                (saleDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            const isLongTerm = holdingPeriodDays >= taxSettings.holdingPeriodForLongTerm;

            if (isLongTerm) {
                longTermGain = longTermGain.plus(capitalGain);
            } else {
                shortTermGain = shortTermGain.plus(capitalGain);
            }

            totalCapitalGain = totalCapitalGain.plus(capitalGain);

            estimatedSales.push({
                lotId: lot.transactionId,
                quantity: sellQuantity,
                purchasePrice: lot.price,
                purchaseDate: lot.date,
                salePrice,
                saleDate: today,
                capitalGain,
                isLongTerm,
                holdingPeriodDays,
            });

            remainingToSell = remainingToSell.minus(sellQuantity);
        }

        // Calculate tax
        const shortTermTax = shortTermGain.times(taxSettings.shortTermTaxRate).div(100);
        const longTermTax = longTermGain.times(taxSettings.longTermTaxRate).div(100);
        const totalTax = shortTermTax.plus(longTermTax);

        const totalSaleAmount = salePrice.times(quantityToSell);
        const effectiveTaxRate = totalSaleAmount.isZero()
            ? new Decimal(0)
            : totalTax.div(totalSaleAmount).times(100);

        return {
            stockId: stock.id,
            ticker: stock.ticker,
            quantityToSell,
            method,
            estimatedSales,
            totalCapitalGain,
            totalTax,
            shortTermGain,
            longTermGain,
            effectiveTaxRate,
        };
    }

    /**
     * @description Tax Lot을 방법에 따라 정렬
     * @param lots - Tax Lot 배열
     * @param method - 정렬 방법
     * @returns 정렬된 Tax Lot 배열
     */
    private static sortLotsByMethod(lots: TaxLot[], method: TaxCalculationMethod): TaxLot[] {
        const sorted = [...lots];

        switch (method) {
            case 'FIFO':
                // First In, First Out (oldest first)
                sorted.sort((a, b) => a.date.localeCompare(b.date));
                break;

            case 'LIFO':
                // Last In, First Out (newest first)
                sorted.sort((a, b) => b.date.localeCompare(a.date));
                break;

            case 'HIFO':
                // Highest In, First Out (highest cost first)
                sorted.sort((a, b) => b.price.comparedTo(a.price));
                break;
        }

        return sorted;
    }

    /**
     * @description 기본 세금 설정 가져오기
     * @returns TaxSettings
     */
    static getDefaultTaxSettings(): TaxSettings {
        return {
            shortTermTaxRate: 22, // 단기 양도세율 22% (US federal + state 예상)
            longTermTaxRate: 15, // 장기 양도세율 15% (US long-term capital gains)
            holdingPeriodForLongTerm: 365, // 1년
        };
    }
}
