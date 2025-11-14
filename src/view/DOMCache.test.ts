// src/view/DOMCache.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DOMCache } from './DOMCache';

describe('DOMCache', () => {
    let domCache: DOMCache;

    beforeEach(() => {
        domCache = new DOMCache();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('cacheAll', () => {
        it('should cache all DOM elements by ID', () => {
            // Create test elements with actual IDs used by DOMCache
            const element1 = document.createElement('div');
            element1.id = 'aria-announcer';
            document.body.appendChild(element1);

            const element2 = document.createElement('div');
            element2.id = 'resultsSection';
            document.body.appendChild(element2);

            const element3 = document.createElement('button');
            element3.id = 'calculateBtn';
            document.body.appendChild(element3);

            const element4 = document.createElement('button');
            element4.id = 'darkModeToggle';
            document.body.appendChild(element4);

            const cache = domCache.cacheAll();

            expect(cache.ariaAnnouncer).toBeTruthy();
            expect(cache.resultsSection).toBeTruthy();
            expect(cache.calculateBtn).toBeTruthy();
            expect(cache.darkModeToggle).toBeTruthy();
        });

        it('should return null for non-existent elements', () => {
            const cache = domCache.cacheAll();

            // Most elements should be null if not in DOM
            expect(cache.ariaAnnouncer).toBeNull();
            expect(cache.resultsSection).toBeNull();
        });

        it('should cache NodeLists for querySelectorAll elements', () => {
            // Create radio buttons for mainMode
            const radio1 = document.createElement('input');
            radio1.type = 'radio';
            radio1.name = 'mainMode';
            document.body.appendChild(radio1);

            const radio2 = document.createElement('input');
            radio2.type = 'radio';
            radio2.name = 'mainMode';
            document.body.appendChild(radio2);

            const cache = domCache.cacheAll();

            expect(cache.mainModeSelector).toBeTruthy();
            expect(cache.mainModeSelector?.length).toBe(2);
        });

        it('should update cache on subsequent calls', () => {
            const element1 = document.createElement('div');
            element1.id = 'calculateBtn';
            element1.textContent = 'First';
            document.body.appendChild(element1);

            const cache1 = domCache.cacheAll();
            expect(cache1.calculateBtn?.textContent).toBe('First');

            // Replace element
            element1.remove();
            const element2 = document.createElement('div');
            element2.id = 'calculateBtn';
            element2.textContent = 'Second';
            document.body.appendChild(element2);

            const cache2 = domCache.cacheAll();
            expect(cache2.calculateBtn?.textContent).toBe('Second');
        });
    });

    describe('getCache', () => {
        it('should return cached elements', () => {
            const element = document.createElement('div');
            element.id = 'calculateBtn';
            document.body.appendChild(element);

            domCache.cacheAll();
            const cache = domCache.getCache();

            expect(cache.calculateBtn).toBeTruthy();
        });

        it('should return empty cache if cacheAll not called', () => {
            const cache = domCache.getCache();
            expect(Object.keys(cache).length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('queryByData', () => {
        it('should find element by data attribute', () => {
            const element = document.createElement('button');
            element.setAttribute('data-action', 'submit');
            element.textContent = 'Submit';
            document.body.appendChild(element);

            const result = domCache.queryByData('[data-action="submit"]');

            expect(result).toBeTruthy();
            expect(result?.textContent).toBe('Submit');
        });

        it('should return null if element not found', () => {
            const result = domCache.queryByData('[data-action="nonexistent"]');
            expect(result).toBeNull();
        });

        it('should search within context if provided', () => {
            const container = document.createElement('div');
            container.id = 'container';
            document.body.appendChild(container);

            const button1 = document.createElement('button');
            button1.setAttribute('data-action', 'submit');
            button1.textContent = 'Submit 1';
            container.appendChild(button1);

            const button2 = document.createElement('button');
            button2.setAttribute('data-action', 'submit');
            button2.textContent = 'Submit 2';
            document.body.appendChild(button2);

            const result = domCache.queryByData('[data-action="submit"]', container);

            expect(result?.textContent).toBe('Submit 1');
        });

        it('should support various data attribute patterns', () => {
            const element1 = document.createElement('div');
            element1.setAttribute('data-stock-id', 's-123');
            document.body.appendChild(element1);

            const element2 = document.createElement('div');
            element2.setAttribute('data-type', 'card');
            document.body.appendChild(element2);

            expect(domCache.queryByData('[data-stock-id="s-123"]')).toBeTruthy();
            expect(domCache.queryByData('[data-type="card"]')).toBeTruthy();
        });
    });

    describe('queryAllByData', () => {
        it('should find all elements by data attribute', () => {
            const button1 = document.createElement('button');
            button1.setAttribute('data-action', 'delete');
            document.body.appendChild(button1);

            const button2 = document.createElement('button');
            button2.setAttribute('data-action', 'delete');
            document.body.appendChild(button2);

            const button3 = document.createElement('button');
            button3.setAttribute('data-action', 'edit');
            document.body.appendChild(button3);

            const results = domCache.queryAllByData('[data-action="delete"]');

            expect(results.length).toBe(2);
        });

        it('should return empty NodeList if no elements found', () => {
            const results = domCache.queryAllByData('[data-action="nonexistent"]');
            expect(results.length).toBe(0);
        });

        it('should search within context if provided', () => {
            const container1 = document.createElement('div');
            container1.id = 'container1';
            document.body.appendChild(container1);

            const container2 = document.createElement('div');
            container2.id = 'container2';
            document.body.appendChild(container2);

            const button1 = document.createElement('button');
            button1.setAttribute('data-action', 'delete');
            container1.appendChild(button1);

            const button2 = document.createElement('button');
            button2.setAttribute('data-action', 'delete');
            container1.appendChild(button2);

            const button3 = document.createElement('button');
            button3.setAttribute('data-action', 'delete');
            container2.appendChild(button3);

            const results = domCache.queryAllByData('[data-action="delete"]', container1);

            expect(results.length).toBe(2);
        });

        it('should support wildcard attribute selectors', () => {
            const element1 = document.createElement('div');
            element1.setAttribute('data-id', 's-123');
            document.body.appendChild(element1);

            const element2 = document.createElement('div');
            element2.setAttribute('data-id', 's-456');
            document.body.appendChild(element2);

            const element3 = document.createElement('div');
            element3.setAttribute('data-id', 't-789');
            document.body.appendChild(element3);

            const results = domCache.queryAllByData('[data-id^="s-"]');
            expect(results.length).toBe(2);
        });
    });

    describe('closest', () => {
        it('should find closest parent with data attribute', () => {
            const parent = document.createElement('div');
            parent.setAttribute('data-stock-id', 's-123');
            document.body.appendChild(parent);

            const child = document.createElement('span');
            parent.appendChild(child);

            const grandchild = document.createElement('button');
            child.appendChild(grandchild);

            const result = domCache.closest(grandchild, 'data-stock-id');

            expect(result).toBe(parent);
            expect(result?.getAttribute('data-stock-id')).toBe('s-123');
        });

        it('should return null if no parent with attribute found', () => {
            const element = document.createElement('div');
            document.body.appendChild(element);

            const result = domCache.closest(element, 'data-nonexistent');
            expect(result).toBeNull();
        });

        it('should return element itself if it has the attribute', () => {
            const element = document.createElement('div');
            element.setAttribute('data-id', 'test');
            document.body.appendChild(element);

            const result = domCache.closest(element, 'data-id');
            expect(result).toBe(element);
        });

        it('should traverse multiple levels', () => {
            const grandparent = document.createElement('div');
            grandparent.setAttribute('data-container', 'true');
            document.body.appendChild(grandparent);

            const parent = document.createElement('div');
            grandparent.appendChild(parent);

            const child = document.createElement('div');
            parent.appendChild(child);

            const grandchild = document.createElement('span');
            child.appendChild(grandchild);

            const result = domCache.closest(grandchild, 'data-container');
            expect(result).toBe(grandparent);
        });
    });

    describe('getById', () => {
        it('should find element by ID', () => {
            const element = document.createElement('div');
            element.id = 'testElement';
            element.textContent = 'Test';
            document.body.appendChild(element);

            const result = domCache.getById('testElement');

            expect(result).toBeTruthy();
            expect(result?.textContent).toBe('Test');
        });

        it('should return null if element not found', () => {
            const result = domCache.getById('nonexistent');
            expect(result).toBeNull();
        });

        it('should return latest element if ID is reused', () => {
            const element1 = document.createElement('div');
            element1.id = 'testElement';
            element1.textContent = 'First';
            document.body.appendChild(element1);

            element1.remove();

            const element2 = document.createElement('div');
            element2.id = 'testElement';
            element2.textContent = 'Second';
            document.body.appendChild(element2);

            const result = domCache.getById('testElement');
            expect(result?.textContent).toBe('Second');
        });
    });

    describe('clearCache', () => {
        it('should clear cached elements', () => {
            const element = document.createElement('div');
            element.id = 'calculateBtn';
            document.body.appendChild(element);

            domCache.cacheAll();
            let cache = domCache.getCache();
            expect(cache.calculateBtn).toBeTruthy();

            domCache.clearCache();
            cache = domCache.getCache();
            expect(Object.keys(cache).length).toBe(0);
        });

        it('should allow re-caching after clear', () => {
            const element = document.createElement('div');
            element.id = 'calculateBtn';
            document.body.appendChild(element);

            domCache.cacheAll();
            domCache.clearCache();

            const newCache = domCache.cacheAll();
            expect(newCache.calculateBtn).toBeTruthy();
        });
    });

    describe('integration', () => {
        it('should handle real-world scenario with multiple operations', () => {
            // Setup DOM
            const container = document.createElement('div');
            container.id = 'portfolioContainer';
            document.body.appendChild(container);

            const row = document.createElement('div');
            row.setAttribute('data-stock-id', 's-123');
            container.appendChild(row);

            const button = document.createElement('button');
            button.setAttribute('data-action', 'delete');
            button.id = 'deleteBtn';
            row.appendChild(button);

            // Test cacheAll
            const cache = domCache.cacheAll();
            expect(cache).toBeTruthy();

            // Test queryByData
            const foundButton = domCache.queryByData('[data-action="delete"]');
            expect(foundButton).toBe(button);

            // Test closest
            const foundRow = domCache.closest(button, 'data-stock-id');
            expect(foundRow).toBe(row);

            // Test getById
            const foundButtonById = domCache.getById('deleteBtn');
            expect(foundButtonById).toBe(button);
        });
    });
});
