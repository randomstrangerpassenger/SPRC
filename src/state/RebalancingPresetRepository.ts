// src/state/RebalancingPresetRepository.ts

import type { RebalancingPreset, RebalancingRules } from '../types';
import { generateId } from '../utils';
import { logger } from '../services/Logger';

/**
 * @description 리밸런싱 프리셋 관리를 위한 Repository
 * LocalStorage를 사용하여 프리셋을 저장/로드/삭제합니다.
 */
export class RebalancingPresetRepository {
    private readonly STORAGE_KEY = 'rebalancing_presets';

    /**
     * @description 모든 프리셋 조회
     */
    getAll(): RebalancingPreset[] {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) {
                return [];
            }
            const presets = JSON.parse(data) as RebalancingPreset[];
            return Array.isArray(presets) ? presets : [];
        } catch (error) {
            logger.error(
                'Failed to load rebalancing presets',
                'RebalancingPresetRepository.getAll',
                error
            );
            return [];
        }
    }

    /**
     * @description 특정 프리셋 조회
     */
    getById(id: string): RebalancingPreset | null {
        const presets = this.getAll();
        return presets.find((p) => p.id === id) || null;
    }

    /**
     * @description 새 프리셋 생성
     */
    create(name: string, rules: RebalancingRules, description?: string): RebalancingPreset {
        try {
            const now = Date.now();
            const newPreset: RebalancingPreset = {
                id: generateId(),
                name,
                description,
                rules,
                createdAt: now,
                updatedAt: now,
            };

            const presets = this.getAll();
            presets.push(newPreset);
            this.saveAll(presets);

            logger.info(`Created new rebalancing preset: ${name}`, 'RebalancingPresetRepository');
            return newPreset;
        } catch (error) {
            logger.error(
                'Failed to create rebalancing preset',
                'RebalancingPresetRepository.create',
                error
            );
            throw new Error(
                `Failed to create preset: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * @description 프리셋 업데이트
     */
    update(id: string, updates: Partial<Omit<RebalancingPreset, 'id' | 'createdAt'>>): boolean {
        try {
            const presets = this.getAll();
            const index = presets.findIndex((p) => p.id === id);

            if (index === -1) {
                logger.warn(`Preset not found: ${id}`, 'RebalancingPresetRepository.update');
                return false;
            }

            presets[index] = {
                ...presets[index],
                ...updates,
                updatedAt: Date.now(),
            };

            this.saveAll(presets);
            logger.info(`Updated rebalancing preset: ${id}`, 'RebalancingPresetRepository');
            return true;
        } catch (error) {
            logger.error(
                'Failed to update rebalancing preset',
                'RebalancingPresetRepository.update',
                error
            );
            return false;
        }
    }

    /**
     * @description 프리셋 삭제
     */
    delete(id: string): boolean {
        try {
            const presets = this.getAll();
            const filteredPresets = presets.filter((p) => p.id !== id);

            if (filteredPresets.length === presets.length) {
                logger.warn(`Preset not found: ${id}`, 'RebalancingPresetRepository.delete');
                return false;
            }

            this.saveAll(filteredPresets);
            logger.info(`Deleted rebalancing preset: ${id}`, 'RebalancingPresetRepository');
            return true;
        } catch (error) {
            logger.error(
                'Failed to delete rebalancing preset',
                'RebalancingPresetRepository.delete',
                error
            );
            return false;
        }
    }

    /**
     * @description 모든 프리셋 저장 (내부 메서드)
     */
    private saveAll(presets: RebalancingPreset[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(presets));
        } catch (error) {
            logger.error(
                'Failed to save rebalancing presets to localStorage',
                'RebalancingPresetRepository.saveAll',
                error
            );
            throw error;
        }
    }

    /**
     * @description 모든 프리셋 삭제
     */
    deleteAll(): void {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            logger.info('Deleted all rebalancing presets', 'RebalancingPresetRepository');
        } catch (error) {
            logger.error(
                'Failed to delete all rebalancing presets',
                'RebalancingPresetRepository.deleteAll',
                error
            );
        }
    }

    /**
     * @description 기본 프리셋 생성 (첫 실행 시)
     */
    createDefaultPresets(): void {
        const existing = this.getAll();
        if (existing.length > 0) {
            return; // 이미 프리셋이 있으면 생성하지 않음
        }

        // 기본 프리셋 1: 보수적 (±3% 밴드, 최소 $100 거래)
        this.create(
            '보수적',
            {
                enabled: true,
                bandPercentage: 3,
                minTradeAmount: 100,
                stockLimits: [],
                sectorLimits: [],
            },
            '보수적인 리밸런싱 전략 (±3% 밴드)'
        );

        // 기본 프리셋 2: 표준 (±5% 밴드, 최소 $50 거래)
        this.create(
            '표준',
            {
                enabled: true,
                bandPercentage: 5,
                minTradeAmount: 50,
                stockLimits: [],
                sectorLimits: [],
            },
            '표준 리밸런싱 전략 (±5% 밴드)'
        );

        // 기본 프리셋 3: 적극적 (±10% 밴드, 최소 $20 거래)
        this.create(
            '적극적',
            {
                enabled: true,
                bandPercentage: 10,
                minTradeAmount: 20,
                stockLimits: [],
                sectorLimits: [],
            },
            '적극적인 리밸런싱 전략 (±10% 밴드)'
        );

        logger.info('Created default rebalancing presets', 'RebalancingPresetRepository');
    }
}
