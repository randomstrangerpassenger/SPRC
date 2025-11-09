// src/cache/LRUCache.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { LRUCache } from './LRUCache';

describe('LRUCache', () => {
    let cache: LRUCache<string, number>;

    beforeEach(() => {
        cache = new LRUCache<string, number>(3);
    });

    describe('set and get', () => {
        it('should store and retrieve values', () => {
            cache.set('a', 1);
            cache.set('b', 2);

            expect(cache.get('a')).toBe(1);
            expect(cache.get('b')).toBe(2);
        });

        it('should return undefined for non-existent keys', () => {
            expect(cache.get('nonexistent')).toBeUndefined();
        });

        it('should update existing keys', () => {
            cache.set('a', 1);
            cache.set('a', 2);

            expect(cache.get('a')).toBe(2);
            expect(cache.size).toBe(1);
        });
    });

    describe('LRU eviction', () => {
        it('should evict least recently used item when capacity exceeded', () => {
            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);
            cache.set('d', 4); // This should evict 'a'

            expect(cache.has('a')).toBe(false);
            expect(cache.has('b')).toBe(true);
            expect(cache.has('c')).toBe(true);
            expect(cache.has('d')).toBe(true);
            expect(cache.size).toBe(3);
        });

        it('should update LRU order on get', () => {
            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);

            // Access 'a' to make it recently used
            cache.get('a');

            // Add 'd', should evict 'b' (oldest)
            cache.set('d', 4);

            expect(cache.has('a')).toBe(true);
            expect(cache.has('b')).toBe(false);
            expect(cache.has('c')).toBe(true);
            expect(cache.has('d')).toBe(true);
        });

        it('should update LRU order on set to existing key', () => {
            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);

            // Update 'a' to make it recently used
            cache.set('a', 10);

            // Add 'd', should evict 'b' (oldest)
            cache.set('d', 4);

            expect(cache.has('a')).toBe(true);
            expect(cache.get('a')).toBe(10);
            expect(cache.has('b')).toBe(false);
            expect(cache.has('c')).toBe(true);
            expect(cache.has('d')).toBe(true);
        });
    });

    describe('capacity', () => {
        it('should respect capacity limit', () => {
            const smallCache = new LRUCache<string, number>(2);

            smallCache.set('a', 1);
            smallCache.set('b', 2);
            smallCache.set('c', 3);

            expect(smallCache.size).toBe(2);
        });

        it('should work with capacity of 1', () => {
            const tinyCache = new LRUCache<string, number>(1);

            tinyCache.set('a', 1);
            expect(tinyCache.get('a')).toBe(1);

            tinyCache.set('b', 2);
            expect(tinyCache.has('a')).toBe(false);
            expect(tinyCache.get('b')).toBe(2);
        });

        it('should return correct capacity', () => {
            expect(cache.capacity).toBe(3);

            const largeCache = new LRUCache<string, number>(100);
            expect(largeCache.capacity).toBe(100);
        });
    });

    describe('clear', () => {
        it('should remove all items', () => {
            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);

            expect(cache.size).toBe(3);

            cache.clear();

            expect(cache.size).toBe(0);
            expect(cache.has('a')).toBe(false);
            expect(cache.has('b')).toBe(false);
            expect(cache.has('c')).toBe(false);
        });
    });

    describe('delete', () => {
        it('should delete specific key', () => {
            cache.set('a', 1);
            cache.set('b', 2);

            expect(cache.delete('a')).toBe(true);
            expect(cache.has('a')).toBe(false);
            expect(cache.size).toBe(1);
        });

        it('should return false for non-existent key', () => {
            expect(cache.delete('nonexistent')).toBe(false);
        });
    });

    describe('has', () => {
        it('should return true for existing keys', () => {
            cache.set('a', 1);

            expect(cache.has('a')).toBe(true);
        });

        it('should return false for non-existent keys', () => {
            expect(cache.has('nonexistent')).toBe(false);
        });

        it('should not affect LRU order', () => {
            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);

            // has() should not affect order
            cache.has('a');

            // Add 'd', should still evict 'a' (oldest)
            cache.set('d', 4);

            expect(cache.has('a')).toBe(false);
        });
    });

    describe('complex types', () => {
        it('should work with object values', () => {
            const objectCache = new LRUCache<string, { value: number }>(2);

            objectCache.set('a', { value: 1 });
            objectCache.set('b', { value: 2 });

            expect(objectCache.get('a')).toEqual({ value: 1 });
            expect(objectCache.get('b')).toEqual({ value: 2 });
        });

        it('should work with object keys', () => {
            const objKey1 = { id: 1 };
            const objKey2 = { id: 2 };

            const objectKeyCache = new LRUCache<object, string>(2);

            objectKeyCache.set(objKey1, 'value1');
            objectKeyCache.set(objKey2, 'value2');

            expect(objectKeyCache.get(objKey1)).toBe('value1');
            expect(objectKeyCache.get(objKey2)).toBe('value2');
        });
    });

    describe('default capacity', () => {
        it('should use default capacity of 50', () => {
            const defaultCache = new LRUCache<string, number>();

            expect(defaultCache.capacity).toBe(50);

            // Fill cache
            for (let i = 0; i < 50; i++) {
                defaultCache.set(`key${i}`, i);
            }

            expect(defaultCache.size).toBe(50);

            // Add one more, should evict first
            defaultCache.set('key50', 50);

            expect(defaultCache.size).toBe(50);
            expect(defaultCache.has('key0')).toBe(false);
            expect(defaultCache.has('key50')).toBe(true);
        });
    });
});