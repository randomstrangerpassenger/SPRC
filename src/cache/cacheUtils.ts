// src/cache/cacheUtils.ts
import type { CalculatedStock } from '../types';
import Decimal from 'decimal.js';

/**
 * @description 계산 캐시 키를 생성합니다.
 * 포트폴리오 데이터와 추가 투자금액을 기반으로 고유 키를 생성합니다.
 * @param portfolioData - 포트폴리오 데이터
 * @param additionalInvestment - 추가 투자금액
 * @param strategyName - 전략 이름
 * @returns 캐시 키
 */
export function generateCalculationCacheKey(
    portfolioData: CalculatedStock[],
    additionalInvestment: Decimal | number,
    strategyName: string
): string {
    // 포트폴리오 데이터를 간단한 문자열로 변환
    // 각 주식의 중요 속성만 사용하여 키 생성
    const portfolioHash = portfolioData
        .map(
            (stock) =>
                `${stock.id}:${stock.targetRatio}:${stock.currentPrice}:${stock.quantity}:${stock.fixedBuyAmount || 0}:${stock.manualAmount || 0}`
        )
        .join('|');

    const investmentValue =
        additionalInvestment instanceof Decimal
            ? additionalInvestment.toString()
            : additionalInvestment.toString();

    return `${strategyName}:${portfolioHash}:${investmentValue}`;
}

/**
 * @description 포트폴리오 변경 시 캐시를 무효화할지 결정하는 함수
 * @param oldData - 이전 포트폴리오 데이터
 * @param newData - 새 포트폴리오 데이터
 * @returns 캐시 무효화 필요 여부
 */
export function shouldInvalidateCache(
    oldData: CalculatedStock[],
    newData: CalculatedStock[]
): boolean {
    // 길이가 다르면 무효화
    if (oldData.length !== newData.length) {
        return true;
    }

    // 주식 ID나 중요 속성이 변경되었는지 확인
    for (let i = 0; i < oldData.length; i++) {
        const oldStock = oldData[i];
        const newStock = newData[i];

        if (
            oldStock.id !== newStock.id ||
            !oldStock.targetRatio.equals(newStock.targetRatio) ||
            !oldStock.currentPrice.equals(newStock.currentPrice) ||
            !oldStock.quantity.equals(newStock.quantity)
        ) {
            return true;
        }
    }

    return false;
}