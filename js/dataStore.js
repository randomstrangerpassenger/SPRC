// js/dataStore.js - IndexedDB 저장/로드 전담
// @ts-check
import { get, set, del } from 'idb-keyval';
import { CONFIG } from './constants.js';
import { ErrorService } from './errorService.js';

/**
 * @typedef {import('./types.js').Portfolio} Portfolio
 * @typedef {import('./types.js').MetaState} MetaState
 */

/**
 * @description IndexedDB 저장/로드 및 마이그레이션을 담당하는 클래스
 */
export class DataStore {
    /**
     * @description Meta 데이터 로드
     * @returns {Promise<MetaState | null>}
     */
    static async loadMeta() {
        try {
            const metaData = await get(CONFIG.IDB_META_KEY);
            return metaData || null;
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), 'DataStore.loadMeta');
            return null;
        }
    }

    /**
     * @description Meta 데이터 저장
     * @param {MetaState} metaData
     * @returns {Promise<void>}
     */
    static async saveMeta(metaData) {
        try {
            await set(CONFIG.IDB_META_KEY, metaData);
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), 'DataStore.saveMeta');
            throw error;
        }
    }

    /**
     * @description 포트폴리오 데이터 로드
     * @returns {Promise<Record<string, Portfolio> | null>}
     */
    static async loadPortfolios() {
        try {
            const portfolioData = await get(CONFIG.IDB_PORTFOLIOS_KEY);
            return portfolioData || null;
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), 'DataStore.loadPortfolios');
            return null;
        }
    }

    /**
     * @description 포트폴리오 데이터 저장
     * @param {Record<string, Portfolio>} portfolios
     * @returns {Promise<void>}
     */
    static async savePortfolios(portfolios) {
        try {
            await set(CONFIG.IDB_PORTFOLIOS_KEY, portfolios);
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), 'DataStore.savePortfolios');
            throw error;
        }
    }

    /**
     * @description LocalStorage에서 IndexedDB로 마이그레이션
     * @returns {Promise<boolean>} 마이그레이션 성공 여부
     */
    static async migrateFromLocalStorage() {
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

                console.log('[DataStore] Successfully migrated from LocalStorage to IndexedDB');
                return true;
            }

            console.log('[DataStore] No legacy data found in LocalStorage');
            return false;
        } catch (error) {
            console.error('[DataStore] Migration failed:', error);
            ErrorService.handle(/** @type {Error} */ (error), 'DataStore.migrateFromLocalStorage');
            return false;
        }
    }

    /**
     * @description 모든 데이터 삭제
     * @returns {Promise<void>}
     */
    static async clearAll() {
        try {
            await del(CONFIG.IDB_META_KEY);
            await del(CONFIG.IDB_PORTFOLIOS_KEY);
            console.log('[DataStore] All data cleared');
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), 'DataStore.clearAll');
            throw error;
        }
    }
}
