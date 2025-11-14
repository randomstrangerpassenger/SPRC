// src/state/PersistenceRepository.ts
import Decimal from 'decimal.js';
import { CONFIG } from '../constants';
import { ErrorService } from '../errorService';
import { DataStore } from '../dataStore';
import type { Portfolio, MetaState } from '../types';

/**
 * @class PersistenceRepository
 * @description 데이터 저장/로드를 담당하는 Repository 클래스
 * PortfolioState와 DataStore 사이의 중간 계층 역할
 */
export class PersistenceRepository {
    /**
     * @description LocalStorage에서 IndexedDB로 마이그레이션
     */
    async migrateFromLocalStorage(): Promise<boolean> {
        return await DataStore.migrateFromLocalStorage();
    }

    /**
     * @description IDB에서 Meta 로드
     */
    async loadMeta(): Promise<MetaState | null> {
        return await DataStore.loadMeta();
    }

    /**
     * @description IDB에서 Portfolios 로드
     */
    async loadPortfolios(): Promise<Record<string, Portfolio> | null> {
        return await DataStore.loadPortfolios();
    }

    /**
     * @description Meta 데이터 저장
     */
    async saveMeta(activePortfolioId: string | null): Promise<void> {
        try {
            const metaData: MetaState = {
                activePortfolioId: activePortfolioId || '',
                version: CONFIG.DATA_VERSION,
            };
            await DataStore.saveMeta(metaData);
        } catch (error) {
            ErrorService.handle(error as Error, 'PersistenceRepository.saveMeta');
        }
    }

    /**
     * @description 포트폴리오 데이터 저장
     * Decimal 객체를 number로 변환하여 저장
     */
    async savePortfolios(portfolios: Record<string, Portfolio>): Promise<void> {
        try {
            const saveablePortfolios = {};
            Object.entries(portfolios).forEach(([id, portfolio]) => {
                saveablePortfolios[id] = {
                    ...portfolio,
                    portfolioData: portfolio.portfolioData.map((stock) => {
                        // 'calculated' 속성을 분해해서 저장 대상에서 제외
                        const { calculated, ...saveableStock } = stock;

                        return {
                            ...saveableStock,
                            targetRatio:
                                saveableStock.targetRatio instanceof Decimal
                                    ? saveableStock.targetRatio.toNumber()
                                    : Number(saveableStock.targetRatio ?? 0),
                            currentPrice:
                                saveableStock.currentPrice instanceof Decimal
                                    ? saveableStock.currentPrice.toNumber()
                                    : Number(saveableStock.currentPrice ?? 0),
                            fixedBuyAmount:
                                saveableStock.fixedBuyAmount instanceof Decimal
                                    ? saveableStock.fixedBuyAmount.toNumber()
                                    : Number(saveableStock.fixedBuyAmount ?? 0),
                            manualAmount:
                                saveableStock.manualAmount instanceof Decimal
                                    ? saveableStock.manualAmount.toNumber()
                                    : Number(saveableStock.manualAmount ?? 0),
                            transactions: saveableStock.transactions.map((tx) => ({
                                ...tx,
                                quantity:
                                    tx.quantity instanceof Decimal
                                        ? tx.quantity.toNumber()
                                        : Number(tx.quantity ?? 0),
                                price:
                                    tx.price instanceof Decimal
                                        ? tx.price.toNumber()
                                        : Number(tx.price ?? 0),
                            })),
                        };
                    }),
                };
            });
            await DataStore.savePortfolios(saveablePortfolios);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                ErrorService.handle(error, 'PersistenceRepository.savePortfolios - Quota Exceeded');
            } else {
                ErrorService.handle(error as Error, 'PersistenceRepository.savePortfolios');
            }
        }
    }
}
