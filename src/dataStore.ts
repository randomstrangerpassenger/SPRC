// src/dataStore.ts - IndexedDB 저장/로드 전담
import { get, set, del } from 'idb-keyval';
import { CONFIG } from './constants.ts';
import { ErrorService } from './errorService.ts';
import type { Portfolio, MetaState } from './types.ts';

/**
 * @description IndexedDB 저장/로드 및 마이그레이션을 담당하는 클래스
 */
export class DataStore {
    /**
     * @description Meta 데이터 로드
     */
    static async loadMeta(): Promise<MetaState | null> {
        try {
            const metaData = await get<MetaState>(CONFIG.IDB_META_KEY);
            return metaData || null;
        } catch (error) {
            ErrorService.handle(error as Error, 'DataStore.loadMeta');
            return null;
        }
    }

    /**
     * @description Meta 데이터 저장
     */
    static async saveMeta(metaData: MetaState): Promise<void> {
        try {
            await set(CONFIG.IDB_META_KEY, metaData);
        } catch (error) {
            ErrorService.handle(error as Error, 'DataStore.saveMeta');
            throw error;
        }
    }

    /**
     * @description 포트폴리오 데이터 로드
     */
    static async loadPortfolios(): Promise<Record<string, Portfolio> | null> {
        try {
            const portfolioData = await get<Record<string, Portfolio>>(
                CONFIG.IDB_PORTFOLIOS_KEY
            );
            return portfolioData || null;
        } catch (error) {
            ErrorService.handle(error as Error, 'DataStore.loadPortfolios');
            return null;
        }
    }

    /**
     * @description 포트폴리오 데이터 저장
     */
    static async savePortfolios(portfolios: Record<string, Portfolio>): Promise<void> {
        try {
            await set(CONFIG.IDB_PORTFOLIOS_KEY, portfolios);
        } catch (error) {
            ErrorService.handle(error as Error, 'DataStore.savePortfolios');
            throw error;
        }
    }

    /**
     * @description LocalStorage에서 IndexedDB로 마이그레이션
     */
    static async migrateFromLocalStorage(): Promise<boolean> {
        try {
            const lsMeta = localStorage.getItem(CONFIG.LEGACY_LS_META_KEY);
            const lsPortfolios = localStorage.getItem(CONFIG.LEGACY_LS_PORTFOLIOS_KEY);

            if (lsMeta && lsPortfolios) {
                const metaData = JSON.parse(lsMeta);
                const portfolioData = JSON.parse(lsPortfolios);

                // IndexedDB에 저장
                await set(CONFIG.IDB_META_KEY, metaData);
                await set(CONFIG.IDB_PORTFOLIOS_KEY, portfolioData);

                // 마이그레이션 성공 후 LocalStorage 데이터 삭제
                localStorage.removeItem(CONFIG.LEGACY_LS_META_KEY);
                localStorage.removeItem(CONFIG.LEGACY_LS_PORTFOLIOS_KEY);

                console.log(
                    '[DataStore] Successfully migrated from LocalStorage to IndexedDB'
                );
                return true;
            }

            console.log('[DataStore] No legacy data found in LocalStorage');
            return false;
        } catch (error) {
            console.error('[DataStore] Migration failed:', error);
            ErrorService.handle(error as Error, 'DataStore.migrateFromLocalStorage');
            return false;
        }
    }

    /**
     * @description 모든 데이터 삭제
     */
    static async clearAll(): Promise<void> {
        try {
            await del(CONFIG.IDB_META_KEY);
            await del(CONFIG.IDB_PORTFOLIOS_KEY);
            console.log('[DataStore] All data cleared');
        } catch (error) {
            ErrorService.handle(error as Error, 'DataStore.clearAll');
            throw error;
        }
    }
}