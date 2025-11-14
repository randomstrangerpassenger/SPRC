// src/performance/PerformanceMonitor.ts
/**
 * @description 성능 모니터링 시스템
 * - 함수 실행 시간 측정
 * - 메모리 사용량 추적
 * - 성능 메트릭 저장 및 분석
 */

import { logger } from '../services/Logger';

export interface PerformanceMetric {
    name: string;
    category: 'calculation' | 'rendering' | 'api' | 'storage' | 'other';
    startTime: number;
    endTime: number;
    duration: number;
    memoryUsed?: number;
    metadata?: Record<string, any>;
}

export interface PerformanceStats {
    name: string;
    category: string;
    count: number;
    totalDuration: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    p50Duration: number;
    p95Duration: number;
    p99Duration: number;
}

export class PerformanceMonitor {
    private static instance: PerformanceMonitor | null = null;
    private metrics: PerformanceMetric[] = [];
    private activeTimers: Map<string, number> = new Map();
    private maxMetrics: number = 1000; // 최대 저장 메트릭 수
    private enabled: boolean = true;

    private constructor() {
        // Singleton pattern
    }

    /**
     * @description 싱글톤 인스턴스 가져오기
     */
    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    /**
     * @description 성능 모니터링 활성화/비활성화
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * @description 성능 측정 시작
     */
    start(
        name: string,
        category: PerformanceMetric['category'] = 'other',
        metadata?: Record<string, any>
    ): void {
        if (!this.enabled) return;

        const timerId = `${category}:${name}`;
        this.activeTimers.set(timerId, performance.now());

        // 메타데이터를 임시 저장 (end에서 사용)
        if (metadata) {
            (this as any)[`_meta_${timerId}`] = metadata;
        }
    }

    /**
     * @description 성능 측정 종료
     */
    end(name: string, category: PerformanceMetric['category'] = 'other'): number {
        if (!this.enabled) return 0;

        const timerId = `${category}:${name}`;
        const startTime = this.activeTimers.get(timerId);

        if (startTime === undefined) {
            logger.warn(`No start time found for: ${timerId}`, 'PerformanceMonitor');
            return 0;
        }

        const endTime = performance.now();
        const duration = endTime - startTime;

        // 메모리 사용량 (가능한 경우)
        let memoryUsed: number | undefined;
        if (performance.memory) {
            memoryUsed = performance.memory.usedJSHeapSize;
        }

        // 메타데이터 가져오기
        const metadata = (this as any)[`_meta_${timerId}`];
        delete (this as any)[`_meta_${timerId}`];

        const metric: PerformanceMetric = {
            name,
            category,
            startTime,
            endTime,
            duration,
            memoryUsed,
            metadata,
        };

        this.addMetric(metric);
        this.activeTimers.delete(timerId);

        return duration;
    }

    /**
     * @description 메트릭 추가
     */
    private addMetric(metric: PerformanceMetric): void {
        this.metrics.push(metric);

        // 최대 메트릭 수 초과 시 오래된 것 제거
        if (this.metrics.length > this.maxMetrics) {
            this.metrics.shift();
        }
    }

    /**
     * @description 함수 실행 시간 측정 (동기)
     */
    measure<T>(
        name: string,
        fn: () => T,
        category: PerformanceMetric['category'] = 'other',
        metadata?: Record<string, any>
    ): T {
        if (!this.enabled) return fn();

        this.start(name, category, metadata);
        try {
            const result = fn();
            this.end(name, category);
            return result;
        } catch (error) {
            this.end(name, category);
            throw error;
        }
    }

    /**
     * @description 비동기 함수 실행 시간 측정
     */
    async measureAsync<T>(
        name: string,
        fn: () => Promise<T>,
        category: PerformanceMetric['category'] = 'other',
        metadata?: Record<string, any>
    ): Promise<T> {
        if (!this.enabled) return fn();

        this.start(name, category, metadata);
        try {
            const result = await fn();
            this.end(name, category);
            return result;
        } catch (error) {
            this.end(name, category);
            throw error;
        }
    }

    /**
     * @description 특정 카테고리의 메트릭 가져오기
     */
    getMetrics(category?: PerformanceMetric['category']): PerformanceMetric[] {
        if (category) {
            return this.metrics.filter((m) => m.category === category);
        }
        return [...this.metrics];
    }

    /**
     * @description 성능 통계 계산
     */
    getStats(name?: string, category?: PerformanceMetric['category']): PerformanceStats[] {
        let filteredMetrics = this.metrics;

        if (category) {
            filteredMetrics = filteredMetrics.filter((m) => m.category === category);
        }

        if (name) {
            filteredMetrics = filteredMetrics.filter((m) => m.name === name);
        }

        // 이름별로 그룹화
        const grouped = new Map<string, PerformanceMetric[]>();
        filteredMetrics.forEach((metric) => {
            const key = `${metric.category}:${metric.name}`;
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key)!.push(metric);
        });

        // 통계 계산
        const stats: PerformanceStats[] = [];
        grouped.forEach((metrics, key) => {
            const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
            const totalDuration = durations.reduce((sum, d) => sum + d, 0);

            stats.push({
                name: metrics[0].name,
                category: metrics[0].category,
                count: metrics.length,
                totalDuration,
                avgDuration: totalDuration / metrics.length,
                minDuration: durations[0],
                maxDuration: durations[durations.length - 1],
                p50Duration: this.percentile(durations, 50),
                p95Duration: this.percentile(durations, 95),
                p99Duration: this.percentile(durations, 99),
            });
        });

        return stats.sort((a, b) => b.totalDuration - a.totalDuration);
    }

    /**
     * @description 백분위수 계산
     */
    private percentile(sorted: number[], p: number): number {
        const index = Math.ceil((p / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }

    /**
     * @description 느린 작업 감지 (임계값 초과)
     */
    getSlowOperations(thresholdMs: number = 100): PerformanceMetric[] {
        return this.metrics.filter((m) => m.duration > thresholdMs);
    }

    /**
     * @description 성능 리포트 생성 (콘솔 출력)
     */
    printReport(category?: PerformanceMetric['category']): void {
        const stats = this.getStats(undefined, category);

        console.group(`[Performance Report]${category ? ` - ${category}` : ''}`);
        console.table(
            stats.map((s) => ({
                Name: s.name,
                Category: s.category,
                Count: s.count,
                'Avg (ms)': s.avgDuration.toFixed(2),
                'Min (ms)': s.minDuration.toFixed(2),
                'Max (ms)': s.maxDuration.toFixed(2),
                'P95 (ms)': s.p95Duration.toFixed(2),
            }))
        );
        console.groupEnd();
    }

    /**
     * @description 메트릭 초기화
     */
    clear(): void {
        this.metrics = [];
        this.activeTimers.clear();
    }

    /**
     * @description 성능 데이터 내보내기 (JSON)
     */
    export(): string {
        return JSON.stringify({
            metrics: this.metrics,
            stats: this.getStats(),
            timestamp: Date.now(),
        });
    }
}

// 싱글톤 인스턴스 가져오기 헬퍼
export const perfMonitor = PerformanceMonitor.getInstance();
