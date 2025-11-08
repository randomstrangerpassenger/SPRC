// src/performance/PerformanceMonitor.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerformanceMonitor, perfMonitor } from './PerformanceMonitor';

describe('PerformanceMonitor', () => {
    let monitor: PerformanceMonitor;

    beforeEach(() => {
        monitor = PerformanceMonitor.getInstance();
        monitor.clear();
        monitor.setEnabled(true);
    });

    describe('singleton', () => {
        it('should return same instance', () => {
            const instance1 = PerformanceMonitor.getInstance();
            const instance2 = PerformanceMonitor.getInstance();

            expect(instance1).toBe(instance2);
            expect(instance1).toBe(perfMonitor);
        });
    });

    describe('start and end', () => {
        it('should measure execution time', () => {
            monitor.start('testOperation', 'calculation');

            // Simulate some work
            const start = performance.now();
            while (performance.now() - start < 10) {
                // Wait 10ms
            }

            const duration = monitor.end('testOperation', 'calculation');

            expect(duration).toBeGreaterThanOrEqual(10);
        });

        it('should return 0 when no start time found', () => {
            const duration = monitor.end('nonExistent', 'calculation');

            expect(duration).toBe(0);
        });

        it('should store metrics', () => {
            monitor.start('testOp', 'rendering');
            monitor.end('testOp', 'rendering');

            const metrics = monitor.getMetrics();

            expect(metrics).toHaveLength(1);
            expect(metrics[0].name).toBe('testOp');
            expect(metrics[0].category).toBe('rendering');
            expect(metrics[0].duration).toBeGreaterThanOrEqual(0);
        });

        it('should store metadata', () => {
            monitor.start('testOp', 'api', { stockCount: 10, mode: 'add' });
            monitor.end('testOp', 'api');

            const metrics = monitor.getMetrics();

            expect(metrics[0].metadata).toEqual({ stockCount: 10, mode: 'add' });
        });
    });

    describe('measure', () => {
        it('should measure synchronous function', () => {
            const fn = vi.fn(() => {
                let sum = 0;
                for (let i = 0; i < 1000; i++) {
                    sum += i;
                }
                return sum;
            });

            const result = monitor.measure('syncOp', fn, 'calculation');

            expect(fn).toHaveBeenCalledOnce();
            expect(result).toBe(499500);

            const metrics = monitor.getMetrics();
            expect(metrics).toHaveLength(1);
            expect(metrics[0].name).toBe('syncOp');
        });

        it('should propagate errors', () => {
            const fn = () => {
                throw new Error('Test error');
            };

            expect(() => monitor.measure('errorOp', fn)).toThrow('Test error');

            // Should still record the metric
            const metrics = monitor.getMetrics();
            expect(metrics).toHaveLength(1);
        });
    });

    describe('measureAsync', () => {
        it('should measure asynchronous function', async () => {
            const fn = vi.fn(async () => {
                await new Promise((resolve) => setTimeout(resolve, 10));
                return 'done';
            });

            const result = await monitor.measureAsync('asyncOp', fn, 'api');

            expect(fn).toHaveBeenCalledOnce();
            expect(result).toBe('done');

            const metrics = monitor.getMetrics();
            expect(metrics).toHaveLength(1);
            expect(metrics[0].duration).toBeGreaterThanOrEqual(10);
        });

        it('should propagate async errors', async () => {
            const fn = async () => {
                throw new Error('Async error');
            };

            await expect(monitor.measureAsync('asyncErrorOp', fn)).rejects.toThrow('Async error');

            const metrics = monitor.getMetrics();
            expect(metrics).toHaveLength(1);
        });
    });

    describe('getMetrics', () => {
        beforeEach(() => {
            monitor.start('calc1', 'calculation');
            monitor.end('calc1', 'calculation');

            monitor.start('render1', 'rendering');
            monitor.end('render1', 'rendering');

            monitor.start('api1', 'api');
            monitor.end('api1', 'api');
        });

        it('should get all metrics', () => {
            const metrics = monitor.getMetrics();

            expect(metrics).toHaveLength(3);
        });

        it('should filter by category', () => {
            const calcMetrics = monitor.getMetrics('calculation');

            expect(calcMetrics).toHaveLength(1);
            expect(calcMetrics[0].name).toBe('calc1');
        });
    });

    describe('getStats', () => {
        beforeEach(() => {
            // Add multiple metrics for same operation
            for (let i = 0; i < 5; i++) {
                monitor.start('repeatedOp', 'calculation');
                // Simulate varying execution times
                const start = performance.now();
                while (performance.now() - start < i * 2) {
                    // Wait
                }
                monitor.end('repeatedOp', 'calculation');
            }
        });

        it('should calculate statistics', () => {
            const stats = monitor.getStats();

            expect(stats).toHaveLength(1);
            expect(stats[0].name).toBe('repeatedOp');
            expect(stats[0].count).toBe(5);
            expect(stats[0].avgDuration).toBeGreaterThanOrEqual(0);
            expect(stats[0].minDuration).toBeLessThanOrEqual(stats[0].maxDuration);
        });

        it('should filter stats by name', () => {
            monitor.start('anotherOp', 'rendering');
            monitor.end('anotherOp', 'rendering');

            const stats = monitor.getStats('repeatedOp');

            expect(stats).toHaveLength(1);
            expect(stats[0].name).toBe('repeatedOp');
        });

        it('should filter stats by category', () => {
            monitor.start('apiOp', 'api');
            monitor.end('apiOp', 'api');

            const stats = monitor.getStats(undefined, 'calculation');

            expect(stats).toHaveLength(1);
            expect(stats[0].category).toBe('calculation');
        });

        it('should calculate percentiles', () => {
            const stats = monitor.getStats('repeatedOp');

            expect(stats[0].p50Duration).toBeDefined();
            expect(stats[0].p95Duration).toBeDefined();
            expect(stats[0].p99Duration).toBeDefined();
            expect(stats[0].p50Duration).toBeLessThanOrEqual(stats[0].p95Duration);
        });
    });

    describe('getSlowOperations', () => {
        beforeEach(() => {
            monitor.start('fastOp', 'calculation');
            monitor.end('fastOp', 'calculation');

            monitor.start('slowOp', 'calculation');
            // Simulate slow operation
            const start = performance.now();
            while (performance.now() - start < 150) {
                // Wait 150ms
            }
            monitor.end('slowOp', 'calculation');
        });

        it('should detect slow operations', () => {
            const slowOps = monitor.getSlowOperations(100);

            expect(slowOps).toHaveLength(1);
            expect(slowOps[0].name).toBe('slowOp');
            expect(slowOps[0].duration).toBeGreaterThan(100);
        });

        it('should use custom threshold', () => {
            const slowOps = monitor.getSlowOperations(200);

            expect(slowOps).toHaveLength(0);
        });
    });

    describe('enabled/disabled', () => {
        it('should not record when disabled', () => {
            monitor.setEnabled(false);

            monitor.start('disabledOp', 'calculation');
            monitor.end('disabledOp', 'calculation');

            const metrics = monitor.getMetrics();
            expect(metrics).toHaveLength(0);
        });

        it('should record when re-enabled', () => {
            monitor.setEnabled(false);
            monitor.setEnabled(true);

            monitor.start('enabledOp', 'calculation');
            monitor.end('enabledOp', 'calculation');

            const metrics = monitor.getMetrics();
            expect(metrics).toHaveLength(1);
        });
    });

    describe('clear', () => {
        it('should clear all metrics', () => {
            monitor.start('op1', 'calculation');
            monitor.end('op1', 'calculation');

            monitor.clear();

            const metrics = monitor.getMetrics();
            expect(metrics).toHaveLength(0);
        });
    });

    describe('export', () => {
        it('should export metrics as JSON', () => {
            monitor.start('exportOp', 'calculation');
            monitor.end('exportOp', 'calculation');

            const exported = monitor.export();
            const data = JSON.parse(exported);

            expect(data.metrics).toHaveLength(1);
            expect(data.stats).toHaveLength(1);
            expect(data.timestamp).toBeDefined();
        });
    });

    describe('printReport', () => {
        it('should not throw when printing report', () => {
            monitor.start('reportOp', 'calculation');
            monitor.end('reportOp', 'calculation');

            expect(() => monitor.printReport()).not.toThrow();
            expect(() => monitor.printReport('calculation')).not.toThrow();
        });
    });
});