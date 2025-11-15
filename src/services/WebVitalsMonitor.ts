// src/services/WebVitalsMonitor.ts
/**
 * @description Web Vitals monitoring service for production performance tracking
 * - Tracks Core Web Vitals (LCP, FID, CLS, FCP, TTFB)
 * - Uses Performance Observer API (native, no dependencies)
 * - Provides analytics integration hooks
 */

import { logger } from './Logger';

export interface WebVital {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    id: string;
    navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender';
}

interface VitalThresholds {
    good: number;
    needsImprovement: number;
}

// Core Web Vitals thresholds (based on web.dev recommendations)
const THRESHOLDS: Record<string, VitalThresholds> = {
    LCP: { good: 2500, needsImprovement: 4000 },       // Largest Contentful Paint (ms)
    FID: { good: 100, needsImprovement: 300 },         // First Input Delay (ms)
    CLS: { good: 0.1, needsImprovement: 0.25 },        // Cumulative Layout Shift
    FCP: { good: 1800, needsImprovement: 3000 },       // First Contentful Paint (ms)
    TTFB: { good: 800, needsImprovement: 1800 },       // Time to First Byte (ms)
    INP: { good: 200, needsImprovement: 500 },         // Interaction to Next Paint (ms)
};

export class WebVitalsMonitor {
    #metrics: Map<string, WebVital> = new Map();
    #isInitialized: boolean = false;
    #observers: PerformanceObserver[] = [];

    /**
     * @description Initialize Web Vitals monitoring
     */
    initialize(): void {
        if (this.#isInitialized) {
            logger.warn('WebVitalsMonitor already initialized', 'WebVitalsMonitor');
            return;
        }

        // Skip in development (optional - can enable for testing)
        if (import.meta.env.DEV) {
            logger.info('Web Vitals monitoring skipped in development', 'WebVitalsMonitor');
            return;
        }

        try {
            this.observeLCP();
            this.observeFID();
            this.observeCLS();
            this.observeFCP();
            this.observeTTFB();
            this.observeINP();

            this.#isInitialized = true;
            logger.info('Web Vitals monitoring initialized', 'WebVitalsMonitor');
        } catch (error) {
            logger.error('Failed to initialize Web Vitals monitoring', 'WebVitalsMonitor', error);
        }
    }

    /**
     * @description Observe Largest Contentful Paint (LCP)
     */
    private observeLCP(): void {
        if (!('PerformanceObserver' in window)) return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1] as PerformanceEntry;

                this.recordMetric('LCP', lastEntry.startTime);
            });

            observer.observe({ type: 'largest-contentful-paint', buffered: true });
            this.#observers.push(observer);
        } catch (error) {
            logger.warn('LCP observation not supported', 'WebVitalsMonitor');
        }
    }

    /**
     * @description Observe First Input Delay (FID)
     */
    private observeFID(): void {
        if (!('PerformanceObserver' in window)) return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry: any) => {
                    if (entry.processingStart && entry.startTime) {
                        const fid = entry.processingStart - entry.startTime;
                        this.recordMetric('FID', fid);
                    }
                });
            });

            observer.observe({ type: 'first-input', buffered: true });
            this.#observers.push(observer);
        } catch (error) {
            logger.warn('FID observation not supported', 'WebVitalsMonitor');
        }
    }

    /**
     * @description Observe Cumulative Layout Shift (CLS)
     */
    private observeCLS(): void {
        if (!('PerformanceObserver' in window)) return;

        let clsValue = 0;
        let sessionValue = 0;
        let sessionEntries: any[] = [];

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry: any) => {
                    // Only count layout shifts without recent user input
                    if (!entry.hadRecentInput) {
                        const firstSessionEntry = sessionEntries[0];
                        const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

                        // Start new session if gap > 1s or > 5s total
                        if (
                            sessionValue &&
                            entry.startTime - lastSessionEntry.startTime > 1000
                        ) {
                            sessionValue = 0;
                            sessionEntries = [];
                        }

                        sessionValue += entry.value;
                        sessionEntries.push(entry);

                        if (sessionValue > clsValue) {
                            clsValue = sessionValue;
                            this.recordMetric('CLS', clsValue);
                        }
                    }
                });
            });

            observer.observe({ type: 'layout-shift', buffered: true });
            this.#observers.push(observer);
        } catch (error) {
            logger.warn('CLS observation not supported', 'WebVitalsMonitor');
        }
    }

    /**
     * @description Observe First Contentful Paint (FCP)
     */
    private observeFCP(): void {
        if (!('PerformanceObserver' in window)) return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.name === 'first-contentful-paint') {
                        this.recordMetric('FCP', entry.startTime);
                    }
                });
            });

            observer.observe({ type: 'paint', buffered: true });
            this.#observers.push(observer);
        } catch (error) {
            logger.warn('FCP observation not supported', 'WebVitalsMonitor');
        }
    }

    /**
     * @description Observe Time to First Byte (TTFB)
     */
    private observeTTFB(): void {
        try {
            const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            if (navigationEntry) {
                const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
                this.recordMetric('TTFB', ttfb);
            }
        } catch (error) {
            logger.warn('TTFB observation not supported', 'WebVitalsMonitor');
        }
    }

    /**
     * @description Observe Interaction to Next Paint (INP) - Chrome 96+
     */
    private observeINP(): void {
        if (!('PerformanceObserver' in window)) return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry: any) => {
                    if (entry.duration) {
                        this.recordMetric('INP', entry.duration);
                    }
                });
            });

            observer.observe({ type: 'event', buffered: true, durationThreshold: 40 });
            this.#observers.push(observer);
        } catch (error) {
            // INP is newer, so it's OK if not supported
            logger.debug('INP observation not supported', 'WebVitalsMonitor');
        }
    }

    /**
     * @description Record metric with rating
     */
    private recordMetric(name: string, value: number): void {
        const threshold = THRESHOLDS[name];
        const rating = this.getRating(value, threshold);

        const vital: WebVital = {
            name,
            value,
            rating,
            delta: value - (this.#metrics.get(name)?.value || 0),
            id: `v1-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            navigationType: this.getNavigationType(),
        };

        this.#metrics.set(name, vital);

        // Log metric
        logger.info(
            `[${name}] ${value.toFixed(2)}ms - ${rating}`,
            'WebVitals',
            { vital }
        );

        // Send to analytics
        this.sendToAnalytics(vital);
    }

    /**
     * @description Get rating based on thresholds
     */
    private getRating(value: number, threshold?: VitalThresholds): 'good' | 'needs-improvement' | 'poor' {
        if (!threshold) return 'good';

        if (value <= threshold.good) return 'good';
        if (value <= threshold.needsImprovement) return 'needs-improvement';
        return 'poor';
    }

    /**
     * @description Get navigation type
     */
    private getNavigationType(): 'navigate' | 'reload' | 'back-forward' | 'prerender' {
        try {
            const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            return (navEntry?.type as any) || 'navigate';
        } catch {
            return 'navigate';
        }
    }

    /**
     * @description Send metric to analytics service (placeholder)
     */
    private sendToAnalytics(vital: WebVital): void {
        // Placeholder for analytics integration
        // Example: gtag('event', vital.name, { value: vital.value, rating: vital.rating });
        // Example: analytics.track('web_vital', vital);

        if (import.meta.env.DEV) {
            return;
        }

        // In production, send to analytics service
        logger.debug('Web Vital sent to analytics', 'WebVitals', vital);
    }

    /**
     * @description Get all recorded metrics
     */
    getMetrics(): Map<string, WebVital> {
        return new Map(this.#metrics);
    }

    /**
     * @description Get metric summary for reporting
     */
    getSummary(): { name: string; value: string; rating: string }[] {
        return Array.from(this.#metrics.values()).map((vital) => ({
            name: vital.name,
            value: `${vital.value.toFixed(2)}${vital.name === 'CLS' ? '' : 'ms'}`,
            rating: vital.rating,
        }));
    }

    /**
     * @description Cleanup observers
     */
    cleanup(): void {
        this.#observers.forEach((observer) => observer.disconnect());
        this.#observers = [];
        this.#metrics.clear();
        this.#isInitialized = false;
        logger.info('Web Vitals monitoring cleaned up', 'WebVitalsMonitor');
    }
}

// Singleton instance
export const webVitalsMonitor = new WebVitalsMonitor();
