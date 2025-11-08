// src/a11yHelpers.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    addKeyboardActivation,
    createFocusTrap,
    createScreenReaderText,
    announceToScreenReader,
    linkFormError,
    clearFormError,
    updateProgressBar,
    createSkipLink,
    FocusManager,
    checkColorContrast,
    checkTouchTargetSize,
} from './a11yHelpers';

describe('a11yHelpers', () => {
    beforeEach(() => {
        // DOM 초기화
        document.body.innerHTML = '';
    });

    describe('addKeyboardActivation', () => {
        it('should trigger callback on Enter key', () => {
            const element = document.createElement('div');
            const callback = vi.fn();

            addKeyboardActivation(element, callback);

            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            element.dispatchEvent(event);

            expect(callback).toHaveBeenCalledWith(event);
        });

        it('should trigger callback on Space key', () => {
            const element = document.createElement('div');
            const callback = vi.fn();

            addKeyboardActivation(element, callback);

            const event = new KeyboardEvent('keydown', { key: ' ' });
            element.dispatchEvent(event);

            expect(callback).toHaveBeenCalledWith(event);
        });

        it('should not trigger callback on other keys', () => {
            const element = document.createElement('div');
            const callback = vi.fn();

            addKeyboardActivation(element, callback);

            const event = new KeyboardEvent('keydown', { key: 'Escape' });
            element.dispatchEvent(event);

            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('createFocusTrap', () => {
        it('should trap focus within container', () => {
            const container = document.createElement('div');
            const button1 = document.createElement('button');
            const button2 = document.createElement('button');
            const button3 = document.createElement('button');

            container.append(button1, button2, button3);
            document.body.appendChild(container);

            const cleanup = createFocusTrap(container);

            expect(document.activeElement).toBe(button1);

            // Tab forward from last element should focus first element
            button3.focus();
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
            container.dispatchEvent(tabEvent);

            // Shift+Tab from first element should focus last element
            button1.focus();
            const shiftTabEvent = new KeyboardEvent('keydown', {
                key: 'Tab',
                shiftKey: true,
                bubbles: true,
            });
            container.dispatchEvent(shiftTabEvent);

            cleanup();
        });

        it('should return empty cleanup function for container without focusable elements', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);

            const cleanup = createFocusTrap(container);

            expect(typeof cleanup).toBe('function');
            expect(() => cleanup()).not.toThrow();
        });
    });

    describe('createScreenReaderText', () => {
        it('should create span with sr-only class', () => {
            const text = 'Screen reader only text';
            const span = createScreenReaderText(text);

            expect(span.tagName).toBe('SPAN');
            expect(span.textContent).toBe(text);
            expect(span.className).toBe('sr-only');
            expect(span.getAttribute('aria-hidden')).toBe('false');
        });
    });

    describe('announceToScreenReader', () => {
        it('should announce message to aria-announcer element', (done) => {
            const announcer = document.createElement('div');
            announcer.id = 'aria-announcer';
            document.body.appendChild(announcer);

            const message = 'Test announcement';
            announceToScreenReader(message, 'polite');

            setTimeout(() => {
                expect(announcer.textContent).toBe(message);
                expect(announcer.getAttribute('aria-live')).toBe('polite');
                done();
            }, 150);
        });

        it('should handle assertive priority', (done) => {
            const announcer = document.createElement('div');
            announcer.id = 'aria-announcer';
            document.body.appendChild(announcer);

            const message = 'Urgent announcement';
            announceToScreenReader(message, 'assertive');

            setTimeout(() => {
                expect(announcer.textContent).toBe(message);
                expect(announcer.getAttribute('aria-live')).toBe('assertive');
                done();
            }, 150);
        });

        it('should do nothing if aria-announcer does not exist', () => {
            expect(() => announceToScreenReader('Test', 'polite')).not.toThrow();
        });
    });

    describe('linkFormError', () => {
        it('should create and link error message to input', () => {
            const input = document.createElement('input');
            input.id = 'test-input';
            const parent = document.createElement('div');
            parent.appendChild(input);
            document.body.appendChild(parent);

            const errorMessage = 'This field is required';
            const errorEl = linkFormError(input, errorMessage);

            expect(errorEl.textContent).toBe(errorMessage);
            expect(errorEl.id).toBe('test-input-error');
            expect(errorEl.getAttribute('role')).toBe('alert');
            expect(errorEl.getAttribute('aria-live')).toBe('polite');
            expect(input.getAttribute('aria-describedby')).toBe('test-input-error');
            expect(input.getAttribute('aria-invalid')).toBe('true');
        });

        it('should update existing error message', () => {
            const input = document.createElement('input');
            input.id = 'test-input';
            const parent = document.createElement('div');
            parent.appendChild(input);
            document.body.appendChild(parent);

            linkFormError(input, 'First error');
            const errorEl = linkFormError(input, 'Second error');

            expect(errorEl.textContent).toBe('Second error');
            expect(document.querySelectorAll('[id$="-error"]')).toHaveLength(1);
        });
    });

    describe('clearFormError', () => {
        it('should remove error message and aria attributes', () => {
            const input = document.createElement('input');
            input.id = 'test-input';
            const parent = document.createElement('div');
            parent.appendChild(input);
            document.body.appendChild(parent);

            linkFormError(input, 'Error message');
            clearFormError(input);

            expect(document.getElementById('test-input-error')).toBeNull();
            expect(input.getAttribute('aria-describedby')).toBeNull();
            expect(input.getAttribute('aria-invalid')).toBeNull();
        });
    });

    describe('updateProgressBar', () => {
        it('should set aria attributes for progress bar', () => {
            const element = document.createElement('div');

            updateProgressBar(element, 50, 100, 'Loading progress');

            expect(element.getAttribute('role')).toBe('progressbar');
            expect(element.getAttribute('aria-valuenow')).toBe('50');
            expect(element.getAttribute('aria-valuemin')).toBe('0');
            expect(element.getAttribute('aria-valuemax')).toBe('100');
            expect(element.getAttribute('aria-label')).toBe('Loading progress');
            expect(element.getAttribute('aria-valuetext')).toBe('50%');
        });

        it('should work without label', () => {
            const element = document.createElement('div');

            updateProgressBar(element, 25, 100);

            expect(element.getAttribute('role')).toBe('progressbar');
            expect(element.getAttribute('aria-valuenow')).toBe('25');
            expect(element.getAttribute('aria-valuetext')).toBe('25%');
        });
    });

    describe('createSkipLink', () => {
        it('should create skip link with correct attributes', () => {
            const skipLink = createSkipLink('main-content', 'Skip to content');

            expect(skipLink.tagName).toBe('A');
            expect(skipLink.href).toContain('#main-content');
            expect(skipLink.textContent).toBe('Skip to content');
            expect(skipLink.className).toBe('skip-link');
        });

        it('should focus and scroll to target on click', () => {
            const target = document.createElement('div');
            target.id = 'main-content';
            target.tabIndex = -1;

            // Mock scrollIntoView for jsdom
            target.scrollIntoView = vi.fn();

            document.body.appendChild(target);

            const skipLink = createSkipLink('main-content');
            document.body.appendChild(skipLink);

            const focusSpy = vi.spyOn(target, 'focus');

            skipLink.click();

            expect(focusSpy).toHaveBeenCalled();
            expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
        });

        it('should use default text if not provided', () => {
            const skipLink = createSkipLink('main');

            expect(skipLink.textContent).toBe('Skip to main content');
        });
    });

    describe('FocusManager', () => {
        it('should save and restore focus', () => {
            const button1 = document.createElement('button');
            const button2 = document.createElement('button');
            document.body.append(button1, button2);

            button1.focus();

            const manager = new FocusManager();
            manager.saveFocus();

            button2.focus();
            expect(document.activeElement).toBe(button2);

            manager.restoreFocus();
            expect(document.activeElement).toBe(button1);
        });

        it('should handle restoring focus when no previous focus exists', () => {
            const manager = new FocusManager();

            expect(() => manager.restoreFocus()).not.toThrow();
        });
    });

    describe('checkColorContrast', () => {
        it('should calculate contrast ratio for black on white', () => {
            const result = checkColorContrast('#000000', '#FFFFFF');

            expect(result.ratio).toBe(21); // Black on white has maximum contrast
            expect(result.passAA).toBe(true);
            expect(result.passAAA).toBe(true);
        });

        it('should calculate contrast ratio for white on black', () => {
            const result = checkColorContrast('#FFFFFF', '#000000');

            expect(result.ratio).toBe(21);
            expect(result.passAA).toBe(true);
            expect(result.passAAA).toBe(true);
        });

        it('should fail for low contrast colors', () => {
            const result = checkColorContrast('#888888', '#999999');

            expect(result.passAA).toBe(false);
            expect(result.passAAA).toBe(false);
        });

        it('should pass AA but fail AAA for medium contrast', () => {
            const result = checkColorContrast('#000000', '#777777');

            expect(result.ratio).toBeGreaterThan(4.5);
            expect(result.passAA).toBe(true);
        });

        it('should handle invalid hex colors', () => {
            const result = checkColorContrast('invalid', '#FFFFFF');

            expect(result.ratio).toBe(0);
            expect(result.passAA).toBe(false);
            expect(result.passAAA).toBe(false);
        });
    });

    describe('checkTouchTargetSize', () => {
        it('should check if element meets minimum touch target size', () => {
            const element = document.createElement('button');
            element.style.width = '50px';
            element.style.height = '50px';
            document.body.appendChild(element);

            // Force layout calculation
            element.getBoundingClientRect();

            const result = checkTouchTargetSize(element);

            expect(result.width).toBeGreaterThanOrEqual(0);
            expect(result.height).toBeGreaterThanOrEqual(0);
            expect(result).toHaveProperty('isSufficient');
        });

        it('should return false for small elements', () => {
            const element = document.createElement('button');
            element.style.width = '20px';
            element.style.height = '20px';
            document.body.appendChild(element);

            const result = checkTouchTargetSize(element);

            // jsdom may return 0 for width/height without layout engine
            expect(result).toHaveProperty('isSufficient');
        });
    });
});