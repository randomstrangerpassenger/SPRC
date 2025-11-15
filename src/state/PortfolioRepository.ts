// src/state/PortfolioRepository.ts
import Decimal from 'decimal.js';
import { CONFIG } from '../constants';
import { DataStore } from '../dataStore';
import type { Portfolio, MetaState } from '../types';
import { logger } from '../services/Logger';

/**
 * @class PortfolioRepository
 * @description 포트폴리오 및 메타 데이터의 영속성을 담당하는 Repository 클래스
 * DataStore와 비즈니스 로직 사이의 추상화 계층
 * - Decimal ↔ number 변환 처리
 * - 메타 데이터(activePortfolioId, version) 관리
 * - LocalStorage 마이그레이션
 */
export class PortfolioRepository {
    /**
     * @description LocalStorage에서 IndexedDB로 마이그레이션
     */
    async migrateFromLocalStorage(): Promise<boolean> {
        try {
            return await DataStore.migrateFromLocalStorage();
        } catch (error) {
            logger.error(
                'Failed to migrate from localStorage',
                'PortfolioRepository.migrateFromLocalStorage',
                error
            );
            return false;
        }
    }

    /**
     * @description IndexedDB에서 메타 데이터 로드
     */
    async loadMeta(): Promise<MetaState | null> {
        try {
            return await DataStore.loadMeta();
        } catch (error) {
            logger.error('Failed to load meta data', 'PortfolioRepository.loadMeta', error);
            return null;
        }
    }

    /**
     * @description IndexedDB에서 포트폴리오 데이터 로드
     */
    async loadPortfolios(): Promise<Record<string, Portfolio> | null> {
        try {
            return await DataStore.loadPortfolios();
        } catch (error) {
            logger.error('Failed to load portfolios', 'PortfolioRepository.loadPortfolios', error);
            return null;
        }
    }

    /**
     * @description 메타 데이터 저장
     * @param activePortfolioId - 현재 활성 포트폴리오 ID
     */
    async saveMeta(activePortfolioId: string | null): Promise<void> {
        try {
            const metaData: MetaState = {
                activePortfolioId: activePortfolioId || '',
                version: CONFIG.DATA_VERSION,
            };
            await DataStore.saveMeta(metaData);
            logger.debug('Meta data saved successfully', 'PortfolioRepository');
        } catch (error) {
            logger.error('Failed to save meta data', 'PortfolioRepository.saveMeta', error);
            throw error; // 메타 저장 실패는 상위로 전파
        }
    }

    /**
     * @description 포트폴리오 데이터 저장
     * Decimal 객체를 number로 변환하여 저장 (IndexedDB는 Decimal 직렬화 불가)
     * 'calculated' 속성은 런타임 전용이므로 저장에서 제외
     *
     * @param portfolios - 저장할 포트폴리오 맵
     */
    async savePortfolios(portfolios: Record<string, Portfolio>): Promise<void> {
        try {
            const saveablePortfolios = this._convertPortfoliosForStorage(portfolios);
            await DataStore.savePortfolios(saveablePortfolios);
            logger.debug(
                `Portfolios saved: ${Object.keys(portfolios).length} portfolio(s)`,
                'PortfolioRepository'
            );
        } catch (error) {
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                logger.error(
                    'Storage quota exceeded',
                    'PortfolioRepository.savePortfolios',
                    error
                );
            } else {
                logger.error('Failed to save portfolios', 'PortfolioRepository.savePortfolios', error);
            }
            throw error; // 저장 실패는 상위로 전파
        }
    }

    /**
     * @description 특정 포트폴리오만 저장 (최적화)
     * @param portfolioId - 저장할 포트폴리오 ID
     * @param portfolio - 저장할 포트폴리오 데이터
     * @param allPortfolios - 전체 포트폴리오 맵 (컨텍스트)
     */
    async savePortfolio(
        portfolioId: string,
        portfolio: Portfolio,
        allPortfolios: Record<string, Portfolio>
    ): Promise<void> {
        // 현재는 전체 저장 - 향후 최적화 가능
        await this.savePortfolios(allPortfolios);
    }

    /**
     * @description 포트폴리오 삭제 (영속성에서만 삭제)
     * @param portfolioId - 삭제할 포트폴리오 ID
     * @param remainingPortfolios - 삭제 후 남은 포트폴리오 맵
     */
    async deletePortfolio(
        portfolioId: string,
        remainingPortfolios: Record<string, Portfolio>
    ): Promise<void> {
        try {
            await this.savePortfolios(remainingPortfolios);
            logger.info(
                `Portfolio ${portfolioId} deleted from storage`,
                'PortfolioRepository'
            );
        } catch (error) {
            logger.error('Failed to delete portfolio', 'PortfolioRepository.deletePortfolio', error);
            throw error;
        }
    }

    /**
     * @description 모든 데이터 삭제
     */
    async clearAll(): Promise<void> {
        try {
            await DataStore.clearAll();
            logger.info('All portfolio data cleared', 'PortfolioRepository');
        } catch (error) {
            logger.error('Failed to clear all data', 'PortfolioRepository.clearAll', error);
            throw error;
        }
    }

    /**
     * @description Decimal 변환 헬퍼 - 저장용 객체로 변환
     * @private
     */
    private _convertPortfoliosForStorage(
        portfolios: Record<string, Portfolio>
    ): Record<string, Portfolio> {
        const saveablePortfolios: Record<string, Portfolio> = {};

        Object.entries(portfolios).forEach(([id, portfolio]) => {
            saveablePortfolios[id] = {
                ...portfolio,
                portfolioData: portfolio.portfolioData.map((stock) => {
                    // 'calculated' 속성은 런타임 전용이므로 저장에서 제외
                    const { calculated, ...saveableStock } = stock;

                    return {
                        ...saveableStock,
                        // Decimal → number 변환
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

        return saveablePortfolios;
    }
}
