// src/performance/decorators.ts
/**
 * @description 성능 측정 데코레이터
 * - 함수에 자동으로 성능 측정 추가
 */

import { perfMonitor, type PerformanceMetric } from './PerformanceMonitor';

/**
 * @description 함수 성능 측정 래퍼
 * @example
 * const wrappedFn = withPerformance(myFunction, 'myFunction', 'calculation');
 * wrappedFn();
 */
export function withPerformance<T extends (...args: any[]) => any>(
    fn: T,
    name: string,
    category: PerformanceMetric['category'] = 'other'
): T {
    return ((...args: unknown[]) => {
        return perfMonitor.measure(name, () => fn(...(args as Parameters<T>)), category);
    }) as T;
}

/**
 * @description 비동기 함수 성능 측정 래퍼
 * @example
 * const wrappedFn = withPerformanceAsync(myAsyncFunction, 'myAsyncFunction', 'api');
 * await wrappedFn();
 */
export function withPerformanceAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    name: string,
    category: PerformanceMetric['category'] = 'other'
): T {
    return (async (...args: unknown[]) => {
        return perfMonitor.measureAsync(name, () => fn(...(args as Parameters<T>)), category);
    }) as T;
}

/**
 * @description 클래스 메서드 데코레이터 (TypeScript Experimental Decorators)
 * @example
 * class MyClass {
 *   @measurePerformance('calculation')
 *   myMethod() { ... }
 * }
 */
export function measurePerformance(category: PerformanceMetric['category'] = 'other') {
    return function (
        target: object,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: unknown[]) {
            const className = target.constructor.name;
            const methodName = `${className}.${propertyKey}`;

            return perfMonitor.measure(
                methodName,
                () => originalMethod.apply(this, args),
                category
            );
        };

        return descriptor;
    };
}

/**
 * @description 비동기 클래스 메서드 데코레이터
 */
export function measurePerformanceAsync(category: PerformanceMetric['category'] = 'other') {
    return function (
        target: object,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: unknown[]) {
            const className = target.constructor.name;
            const methodName = `${className}.${propertyKey}`;

            return perfMonitor.measureAsync(
                methodName,
                () => originalMethod.apply(this, args),
                category
            );
        };

        return descriptor;
    };
}

/**
 * @description 성능 측정을 조건부로 활성화하는 래퍼
 * 프로덕션 환경에서만 성능 측정을 활성화할 수 있습니다
 */
export function conditionalPerformance<T extends (...args: any[]) => any>(
    fn: T,
    name: string,
    category: PerformanceMetric['category'] = 'other',
    condition: () => boolean = () => true
): T {
    return ((...args: unknown[]) => {
        if (condition()) {
            return perfMonitor.measure(name, () => fn(...(args as Parameters<T>)), category);
        }
        return fn(...(args as Parameters<T>));
    }) as T;
}
