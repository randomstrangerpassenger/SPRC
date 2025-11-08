// src/dataStore.ts - IndexedDB 저장/로드 전담
import { get, set, del } from 'idb-keyval';
import { CONFIG } from './constants.ts';
import { ErrorService } from './errorService.ts';
import type { Portfolio, MetaState, PortfolioSnapshot } from './types.ts';

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
            const portfolioData = await get<Record<string, Portfolio>>(CONFIG.IDB_PORTFOLIOS_KEY);
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

            if (!lsMeta || !lsPortfolios) {
                console.log('[DataStore] No legacy data found in LocalStorage');
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

            console.log('[DataStore] Successfully migrated from LocalStorage to IndexedDB');
            return true;
        } catch (error) {
            // 세분화된 에러 메시지와 함께 로깅
            console.error(
                '[DataStore] Migration failed:',
                error instanceof Error ? error.message : error
            );
            ErrorService.handle(error as Error, 'DataStore.migrateFromLocalStorage');
            return false;
        }
    }

    /**
     * @description 포트폴리오 스냅샷 전체 로드
     */
    static async loadSnapshots(): Promise<Record<string, PortfolioSnapshot[]> | null> {
        try {
            const snapshots = await get<Record<string, PortfolioSnapshot[]>>(
                CONFIG.IDB_SNAPSHOTS_KEY
            );
            return snapshots || null;
        } catch (error) {
            ErrorService.handle(error as Error, 'DataStore.loadSnapshots');
            return null;
        }
    }

    /**
     * @description 특정 포트폴리오의 스냅샷 목록 로드
     */
    static async getSnapshotsForPortfolio(portfolioId: string): Promise<PortfolioSnapshot[]> {
        try {
            const allSnapshots = await this.loadSnapshots();
            return allSnapshots?.[portfolioId] || [];
        } catch (error) {
            ErrorService.handle(error as Error, 'DataStore.getSnapshotsForPortfolio');
            return [];
        }
    }

    /**
     * @description 새 스냅샷 추가
     */
    static async addSnapshot(snapshot: PortfolioSnapshot): Promise<void> {
        try {
            const allSnapshots = (await this.loadSnapshots()) || {};
            const portfolioSnapshots = allSnapshots[snapshot.portfolioId] || [];

            // 새 스냅샷 추가
            portfolioSnapshots.push(snapshot);

            // 날짜순 정렬 (최신순)
            portfolioSnapshots.sort((a, b) => b.timestamp - a.timestamp);

            // 최대 365개 스냅샷 유지 (1년치)
            if (portfolioSnapshots.length > 365) {
                portfolioSnapshots.splice(365);
            }

            allSnapshots[snapshot.portfolioId] = portfolioSnapshots;
            await set(CONFIG.IDB_SNAPSHOTS_KEY, allSnapshots);
        } catch (error) {
            ErrorService.handle(error as Error, 'DataStore.addSnapshot');
            throw error;
        }
    }

    /**
     * @description 특정 포트폴리오의 스냅샷 삭제
     */
    static async deleteSnapshotsForPortfolio(portfolioId: string): Promise<void> {
        try {
            const allSnapshots = await this.loadSnapshots();
            if (allSnapshots && allSnapshots[portfolioId]) {
                delete allSnapshots[portfolioId];
                await set(CONFIG.IDB_SNAPSHOTS_KEY, allSnapshots);
            }
        } catch (error) {
            ErrorService.handle(error as Error, 'DataStore.deleteSnapshotsForPortfolio');
            throw error;
        }
    }

    /**
     * @description 모든 데이터 삭제
     */
    static async clearAll(): Promise<void> {
        try {
            await del(CONFIG.IDB_META_KEY);
            await del(CONFIG.IDB_PORTFOLIOS_KEY);
            await del(CONFIG.IDB_SNAPSHOTS_KEY);
            console.log('[DataStore] All data cleared');
        } catch (error) {
            ErrorService.handle(error as Error, 'DataStore.clearAll');
            throw error;
        }
    }
}
