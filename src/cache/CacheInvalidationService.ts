import { cacheManager } from './CacheManager';
import { logger } from '../services/Logger';

/**
 * 캐시 무효화 사유
 */
export type InvalidationReason =
    | 'stock-added'           // 주식 추가
    | 'stock-deleted'         // 주식 삭제
    | 'stock-updated'         // 주식 정보 수정
    | 'transaction-added'     // 거래 추가
    | 'transaction-deleted'   // 거래 삭제
    | 'portfolio-loaded'      // 포트폴리오 로드
    | 'portfolio-reset'       // 포트폴리오 초기화
    | 'settings-changed'      // 설정 변경 (환율, 통화 등)
    | 'manual';               // 수동 무효화

/**
 * 중앙화된 캐시 무효화 서비스
 *
 * 책임:
 * 1. 일관된 캐시 무효화 전략 제공
 * 2. 무효화 사유 추적 및 로깅
 * 3. 연쇄 무효화 처리
 *
 * 이점:
 * - 캐시 무효화 로직이 한 곳에 집중
 * - 디버깅 용이 (무효화 사유 추적)
 * - 유지보수 간소화
 */
export class CacheInvalidationService {
    /**
     * 포트폴리오 계산 관련 캐시 무효화
     *
     * 다음 경우에 호출:
     * - 주식 추가/삭제
     * - 거래 추가/삭제
     * - 주식 정보 수정 (가격, 수량 등)
     *
     * @param reason - 무효화 사유
     */
    static invalidatePortfolioCalculation(reason: InvalidationReason): void {
        cacheManager.invalidate('portfolio-calculation');
        cacheManager.invalidate('sector-analysis');

        // 리밸런싱 분석도 무효화 (포트폴리오 계산 결과에 의존)
        cacheManager.invalidate('rebalancing-analysis');

        logger.debug(
            `Portfolio calculation cache invalidated (reason: ${reason})`,
            'CacheInvalidationService'
        );
    }

    /**
     * 섹터 분석 캐시만 무효화
     *
     * 다음 경우에 호출:
     * - 섹터 정보 변경
     * - 통화 변경
     *
     * @param reason - 무효화 사유
     */
    static invalidateSectorAnalysis(reason: InvalidationReason): void {
        cacheManager.invalidate('sector-analysis');

        logger.debug(
            `Sector analysis cache invalidated (reason: ${reason})`,
            'CacheInvalidationService'
        );
    }

    /**
     * 리밸런싱 분석 캐시 무효화
     *
     * 다음 경우에 호출:
     * - 리밸런싱 허용 오차 변경
     * - 포트폴리오 계산 결과 변경
     *
     * @param reason - 무효화 사유
     */
    static invalidateRebalancingAnalysis(reason: InvalidationReason): void {
        cacheManager.invalidate('rebalancing-analysis');

        logger.debug(
            `Rebalancing analysis cache invalidated (reason: ${reason})`,
            'CacheInvalidationService'
        );
    }

    /**
     * 모든 계산 캐시 무효화
     *
     * 다음 경우에 호출:
     * - 포트폴리오 로드
     * - 포트폴리오 초기화
     * - 전역 설정 변경
     *
     * @param reason - 무효화 사유
     */
    static invalidateAll(reason: InvalidationReason): void {
        cacheManager.invalidateAll();

        logger.debug(
            `All caches invalidated (reason: ${reason})`,
            'CacheInvalidationService'
        );
    }

    /**
     * 주식 추가 시 캐시 무효화
     */
    static onStockAdded(): void {
        this.invalidatePortfolioCalculation('stock-added');
    }

    /**
     * 주식 삭제 시 캐시 무효화
     */
    static onStockDeleted(): void {
        this.invalidatePortfolioCalculation('stock-deleted');
    }

    /**
     * 주식 정보 수정 시 캐시 무효화
     */
    static onStockUpdated(): void {
        this.invalidatePortfolioCalculation('stock-updated');
    }

    /**
     * 거래 추가 시 캐시 무효화
     */
    static onTransactionAdded(): void {
        this.invalidatePortfolioCalculation('transaction-added');
    }

    /**
     * 거래 삭제 시 캐시 무효화
     */
    static onTransactionDeleted(): void {
        this.invalidatePortfolioCalculation('transaction-deleted');
    }

    /**
     * 포트폴리오 로드 시 캐시 무효화
     */
    static onPortfolioLoaded(): void {
        this.invalidateAll('portfolio-loaded');
    }

    /**
     * 포트폴리오 초기화 시 캐시 무효화
     */
    static onPortfolioReset(): void {
        this.invalidateAll('portfolio-reset');
    }

    /**
     * 설정 변경 시 캐시 무효화
     * (환율, 통화 등)
     */
    static onSettingsChanged(): void {
        this.invalidatePortfolioCalculation('settings-changed');
    }

    /**
     * 캐시 통계 조회 (디버깅용)
     */
    static getStats() {
        return cacheManager.getAllStats();
    }

    /**
     * 캐시 통계 초기화
     */
    static resetStats(): void {
        cacheManager.resetStats();
    }
}
