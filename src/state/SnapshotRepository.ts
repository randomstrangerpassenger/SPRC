// src/state/SnapshotRepository.ts
import { DataStore } from '../dataStore';
import { ErrorService } from '../errorService';
import type { PortfolioSnapshot } from '../types';
import { logger } from '../services/Logger';

/**
 * @class SnapshotRepository
 * @description 포트폴리오 스냅샷의 영속성을 담당하는 Repository 클래스
 * DataStore와 비즈니스 로직 사이의 추상화 계층
 */
export class SnapshotRepository {
    /**
     * @description 모든 스냅샷 데이터 로드
     */
    async loadAll(): Promise<Record<string, PortfolioSnapshot[]>> {
        try {
            const snapshots = await DataStore.loadSnapshots();
            return snapshots || {};
        } catch (error) {
            ErrorService.handle(error as Error, 'SnapshotRepository.loadAll');
            return {};
        }
    }

    /**
     * @description 특정 포트폴리오의 스냅샷 목록 로드
     */
    async getByPortfolioId(portfolioId: string): Promise<PortfolioSnapshot[]> {
        try {
            return await DataStore.getSnapshotsForPortfolio(portfolioId);
        } catch (error) {
            ErrorService.handle(
                error as Error,
                'SnapshotRepository.getByPortfolioId'
            );
            return [];
        }
    }

    /**
     * @description 새 스냅샷 추가
     * @param snapshot - 추가할 스냅샷 데이터
     */
    async add(snapshot: PortfolioSnapshot): Promise<void> {
        try {
            await DataStore.addSnapshot(snapshot);
            logger.debug(
                `Snapshot added for portfolio ${snapshot.portfolioId}`,
                'SnapshotRepository'
            );
        } catch (error) {
            ErrorService.handle(error as Error, 'SnapshotRepository.add');
            throw error; // 스냅샷 저장 실패는 상위로 전파
        }
    }

    /**
     * @description 특정 포트폴리오의 모든 스냅샷 삭제
     * @param portfolioId - 삭제할 포트폴리오 ID
     */
    async deleteByPortfolioId(portfolioId: string): Promise<void> {
        try {
            await DataStore.deleteSnapshotsForPortfolio(portfolioId);
            logger.info(
                `All snapshots deleted for portfolio ${portfolioId}`,
                'SnapshotRepository'
            );
        } catch (error) {
            ErrorService.handle(
                error as Error,
                'SnapshotRepository.deleteByPortfolioId'
            );
            throw error;
        }
    }

    /**
     * @description 특정 포트폴리오의 최신 스냅샷 가져오기
     * @param portfolioId - 포트폴리오 ID
     * @returns 최신 스냅샷 또는 null
     */
    async getLatest(portfolioId: string): Promise<PortfolioSnapshot | null> {
        try {
            const snapshots = await this.getByPortfolioId(portfolioId);
            if (snapshots.length === 0) {
                return null;
            }
            // 스냅샷은 이미 날짜 기준 내림차순으로 정렬되어 있음 (최신이 첫 번째)
            return snapshots[0];
        } catch (error) {
            ErrorService.handle(error as Error, 'SnapshotRepository.getLatest');
            return null;
        }
    }

    /**
     * @description 특정 날짜 범위의 스냅샷 가져오기
     * @param portfolioId - 포트폴리오 ID
     * @param startDate - 시작 날짜 (ISO 문자열)
     * @param endDate - 종료 날짜 (ISO 문자열)
     * @returns 날짜 범위 내의 스냅샷 배열
     */
    async getByDateRange(
        portfolioId: string,
        startDate: string,
        endDate: string
    ): Promise<PortfolioSnapshot[]> {
        try {
            const allSnapshots = await this.getByPortfolioId(portfolioId);
            return allSnapshots.filter(
                (snapshot) => snapshot.date >= startDate && snapshot.date <= endDate
            );
        } catch (error) {
            ErrorService.handle(error as Error, 'SnapshotRepository.getByDateRange');
            return [];
        }
    }
}
