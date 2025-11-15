// src/dataStore.ts
import { get, set, del } from 'idb-keyval';
import { CONFIG } from './constants';
import type { Portfolio, MetaState, PortfolioSnapshot } from './types';
import { logger } from './services/Logger';
/**
 * @description 에러 처리를 위한 헬퍼 함수
 * @param label - 작업 레이블 (에러 로깅용)
 * @param fn - 실행할 비동기 함수
 * @param throwOnError - true일 경우 에러를 다시 throw, false일 경우 null 반환
 */
async function executeWithErrorHandling<T>(
    label: string,
    fn: () => Promise<T>,
    throwOnError = false
): Promise<T | null> {
    try {
        return await fn();
    } catch (error) {
        logger.error(`Operation failed: ${label}`, 'DataStore', error);
        if (throwOnError) {
            throw error;
        }
        return null;
    }
}

/**
 * @description IndexedDB 저장/로드 및 마이그레이션을 담당하는 클래스
 *
 * ⚠️ SECURITY NOTE:
 * - All data is stored in plain text in IndexedDB (browser-local storage)
 * - NO API keys or authentication tokens are stored (loaded from environment variables only)
 * - User portfolio data (stock holdings, transactions) is stored in plain text
 * - This is acceptable for a client-side portfolio calculator as:
 *   1. Data never leaves the user's browser
 *   2. No server-side storage or synchronization
 *   3. Users control their own data (export/import via JSON)
 *
 * 🔐 Data stored in IndexedDB:
 * - Portfolio metadata (IDB_META_KEY): Active portfolio ID, version
 * - Portfolio data (IDB_PORTFOLIOS_KEY): Stock holdings, transactions, settings
 * - Performance snapshots (IDB_SNAPSHOTS_KEY): Historical portfolio values
 *
 * ✅ Data NOT stored:
 * - API keys (loaded from import.meta.env only)
 * - User credentials (no authentication)
 * - Sensitive personal information (only stock tickers and quantities)
 */
export class DataStore {
    /**
     * @description Meta 데이터 로드
     */
    static async loadMeta(): Promise<MetaState | null> {
        return executeWithErrorHandling(
            'DataStore.loadMeta',
            async () => (await get<MetaState>(CONFIG.IDB_META_KEY)) || null
        );
    }

    /**
     * @description Meta 데이터 저장
     */
    static async saveMeta(metaData: MetaState): Promise<void> {
        await executeWithErrorHandling(
            'DataStore.saveMeta',
            async () => {
                await set(CONFIG.IDB_META_KEY, metaData);
            },
            true
        );
    }

    /**
     * @description 포트폴리오 데이터 로드
     */
    static async loadPortfolios(): Promise<Record<string, Portfolio> | null> {
        return executeWithErrorHandling(
            'DataStore.loadPortfolios',
            async () => (await get<Record<string, Portfolio>>(CONFIG.IDB_PORTFOLIOS_KEY)) || null
        );
    }

    /**
     * @description 포트폴리오 데이터 저장
     */
    static async savePortfolios(portfolios: Record<string, Portfolio>): Promise<void> {
        await executeWithErrorHandling(
            'DataStore.savePortfolios',
            async () => {
                await set(CONFIG.IDB_PORTFOLIOS_KEY, portfolios);
            },
            true
        );
    }

    /**
     * @description LocalStorage에서 IndexedDB로 마이그레이션
     */
    static async migrateFromLocalStorage(): Promise<boolean> {
        try {
            const lsMeta = localStorage.getItem(CONFIG.LEGACY_LS_META_KEY);
            const lsPortfolios = localStorage.getItem(CONFIG.LEGACY_LS_PORTFOLIOS_KEY);

            if (!lsMeta || !lsPortfolios) {
                logger.debug('No legacy data found in LocalStorage', 'DataStore');
                return false;
            }

            let metaData, portfolioData;

            try {
                metaData = JSON.parse(lsMeta);
            } catch (parseError) {
                throw new Error(
                    `Failed to parse meta data: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`
                );
            }

            try {
                portfolioData = JSON.parse(lsPortfolios);
            } catch (parseError) {
                throw new Error(
                    `Failed to parse portfolio data: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`
                );
            }

            // IndexedDB에 저장
            try {
                await set(CONFIG.IDB_META_KEY, metaData);
            } catch (saveError) {
                throw new Error(
                    `Failed to save meta to IndexedDB: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`
                );
            }

            try {
                await set(CONFIG.IDB_PORTFOLIOS_KEY, portfolioData);
            } catch (saveError) {
                throw new Error(
                    `Failed to save portfolios to IndexedDB: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`
                );
            }

            // 마이그레이션 성공 후 LocalStorage 데이터 삭제
            localStorage.removeItem(CONFIG.LEGACY_LS_META_KEY);
            localStorage.removeItem(CONFIG.LEGACY_LS_PORTFOLIOS_KEY);

            logger.info('Successfully migrated from LocalStorage to IndexedDB', 'DataStore');
            return true;
        } catch (error) {
            // 세분화된 에러 메시지와 함께 로깅
            logger.error(
                'Migration from LocalStorage to IndexedDB failed',
                'DataStore.migrateFromLocalStorage',
                error
            );
            return false;
        }
    }

    /**
     * @description 포트폴리오 스냅샷 전체 로드
     */
    static async loadSnapshots(): Promise<Record<string, PortfolioSnapshot[]> | null> {
        return executeWithErrorHandling(
            'DataStore.loadSnapshots',
            async () =>
                (await get<Record<string, PortfolioSnapshot[]>>(CONFIG.IDB_SNAPSHOTS_KEY)) || null
        );
    }

    /**
     * @description 특정 포트폴리오의 스냅샷 목록 로드
     */
    static async getSnapshotsForPortfolio(portfolioId: string): Promise<PortfolioSnapshot[]> {
        const result = await executeWithErrorHandling(
            'DataStore.getSnapshotsForPortfolio',
            async () => {
                const allSnapshots = await this.loadSnapshots();
                return allSnapshots?.[portfolioId] || [];
            }
        );
        return result || [];
    }

    /**
     * @description 새 스냅샷 추가
     */
    static async addSnapshot(snapshot: PortfolioSnapshot): Promise<void> {
        await executeWithErrorHandling(
            'DataStore.addSnapshot',
            async () => {
                const allSnapshots = (await this.loadSnapshots()) || {};
                const portfolioSnapshots = allSnapshots[snapshot.portfolioId] || [];

                // 새 스냅샷은 항상 최신이므로 unshift로 맨 앞에 추가 (O(1) vs O(n log n))
                portfolioSnapshots.unshift(snapshot);

                // 최대 365개 스냅샷 유지 (1년치)
                if (portfolioSnapshots.length > 365) {
                    portfolioSnapshots.splice(365);
                }

                allSnapshots[snapshot.portfolioId] = portfolioSnapshots;
                await set(CONFIG.IDB_SNAPSHOTS_KEY, allSnapshots);
            },
            true
        );
    }

    /**
     * @description 특정 포트폴리오의 스냅샷 삭제
     */
    static async deleteSnapshotsForPortfolio(portfolioId: string): Promise<void> {
        await executeWithErrorHandling(
            'DataStore.deleteSnapshotsForPortfolio',
            async () => {
                const allSnapshots = await this.loadSnapshots();
                if (allSnapshots && allSnapshots[portfolioId]) {
                    delete allSnapshots[portfolioId];
                    await set(CONFIG.IDB_SNAPSHOTS_KEY, allSnapshots);
                }
            },
            true
        );
    }

    /**
     * @description 모든 데이터 삭제
     */
    static async clearAll(): Promise<void> {
        await executeWithErrorHandling(
            'DataStore.clearAll',
            async () => {
                await del(CONFIG.IDB_META_KEY);
                await del(CONFIG.IDB_PORTFOLIOS_KEY);
                await del(CONFIG.IDB_SNAPSHOTS_KEY);
                logger.debug('All data cleared', 'DataStore');
            },
            true
        );
    }
}
