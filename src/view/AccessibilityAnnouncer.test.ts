// src/view/AccessibilityAnnouncer.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AccessibilityAnnouncer } from './AccessibilityAnnouncer';

describe('AccessibilityAnnouncer', () => {
    let announcer: AccessibilityAnnouncer;
    let mockElement: HTMLElement;

    beforeEach(() => {
        mockElement = document.createElement('div');
        mockElement.setAttribute('id', 'aria-announcer');
        document.body.appendChild(mockElement);
        vi.useFakeTimers();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('constructor', () => {
        it('should create announcer without element', () => {
            announcer = new AccessibilityAnnouncer();
            expect(announcer).toBeTruthy();
        });

        it('should create announcer with element', () => {
            announcer = new AccessibilityAnnouncer(mockElement);
            expect(announcer).toBeTruthy();
        });
    });

    describe('setElement', () => {
        it('should set announcer element', () => {
            announcer = new AccessibilityAnnouncer();
            announcer.setElement(mockElement);

            // 설정 확인 (announce를 호출해서 간접적으로 확인)
            announcer.announce('Test message');
            vi.advanceTimersByTime(100);
            expect(mockElement.textContent).toBe('Test message');
        });

        it('should replace existing element', () => {
            const firstElement = document.createElement('div');
            const secondElement = document.createElement('div');

            announcer = new AccessibilityAnnouncer(firstElement);
            announcer.setElement(secondElement);

            announcer.announce('Test message');
            vi.advanceTimersByTime(100);

            expect(firstElement.textContent).toBe('');
            expect(secondElement.textContent).toBe('Test message');
        });
    });

    describe('announce', () => {
        beforeEach(() => {
            announcer = new AccessibilityAnnouncer(mockElement);
        });

        it('should announce message with polite mode by default', () => {
            announcer.announce('Test message');

            expect(mockElement.textContent).toBe('');
            expect(mockElement.getAttribute('aria-live')).toBe('polite');

            vi.advanceTimersByTime(100);
            expect(mockElement.textContent).toBe('Test message');
        });

        it('should announce message with polite mode explicitly', () => {
            announcer.announce('Test message', 'polite');

            expect(mockElement.getAttribute('aria-live')).toBe('polite');

            vi.advanceTimersByTime(100);
            expect(mockElement.textContent).toBe('Test message');
        });

        it('should announce message with assertive mode', () => {
            announcer.announce('Urgent message', 'assertive');

            expect(mockElement.getAttribute('aria-live')).toBe('assertive');

            vi.advanceTimersByTime(100);
            expect(mockElement.textContent).toBe('Urgent message');
        });

        it('should clear existing content before announcing', () => {
            mockElement.textContent = 'Old message';

            announcer.announce('New message');

            expect(mockElement.textContent).toBe('');

            vi.advanceTimersByTime(100);
            expect(mockElement.textContent).toBe('New message');
        });

        it('should delay message setting by 100ms', () => {
            announcer.announce('Test message');

            expect(mockElement.textContent).toBe('');

            vi.advanceTimersByTime(99);
            expect(mockElement.textContent).toBe('');

            vi.advanceTimersByTime(1);
            expect(mockElement.textContent).toBe('Test message');
        });

        it('should warn when announcer element is not set', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            announcer = new AccessibilityAnnouncer();

            announcer.announce('Test message');

            expect(consoleSpy).toHaveBeenCalledWith(
                '[AccessibilityAnnouncer] Announcer element not set'
            );

            consoleSpy.mockRestore();
        });

        it('should not set message when element is not set', () => {
            announcer = new AccessibilityAnnouncer();
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            announcer.announce('Test message');
            vi.advanceTimersByTime(100);

            // No element to check, just ensure no error is thrown
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should handle multiple consecutive announcements', () => {
            announcer.announce('First message');
            vi.advanceTimersByTime(50);

            announcer.announce('Second message');
            vi.advanceTimersByTime(100);

            // Second message should be shown
            expect(mockElement.textContent).toBe('Second message');
        });

        it('should handle empty message', () => {
            announcer.announce('');

            vi.advanceTimersByTime(100);
            expect(mockElement.textContent).toBe('');
        });

        it('should handle very long message', () => {
            const longMessage = 'A'.repeat(1000);
            announcer.announce(longMessage);

            vi.advanceTimersByTime(100);
            expect(mockElement.textContent).toBe(longMessage);
        });

        it('should handle messages with special characters', () => {
            const specialMessage = 'Test\n<b>HTML</b>\t&amp;';
            announcer.announce(specialMessage);

            vi.advanceTimersByTime(100);
            expect(mockElement.textContent).toBe(specialMessage);
        });
    });

    describe('clear', () => {
        beforeEach(() => {
            announcer = new AccessibilityAnnouncer(mockElement);
        });

        it('should clear announcer content', () => {
            mockElement.textContent = 'Test message';

            announcer.clear();

            expect(mockElement.textContent).toBe('');
        });

        it('should do nothing when element is not set', () => {
            announcer = new AccessibilityAnnouncer();

            // Should not throw error
            expect(() => announcer.clear()).not.toThrow();
        });

        it('should clear content set by announce', () => {
            announcer.announce('Test message');
            vi.advanceTimersByTime(100);
            expect(mockElement.textContent).toBe('Test message');

            announcer.clear();
            expect(mockElement.textContent).toBe('');
        });

        it('should handle repeated clear calls', () => {
            mockElement.textContent = 'Test message';

            announcer.clear();
            expect(mockElement.textContent).toBe('');

            announcer.clear();
            expect(mockElement.textContent).toBe('');
        });
    });

    describe('integration', () => {
        beforeEach(() => {
            announcer = new AccessibilityAnnouncer(mockElement);
        });

        it('should work with announce -> clear -> announce cycle', () => {
            announcer.announce('First message');
            vi.advanceTimersByTime(100);
            expect(mockElement.textContent).toBe('First message');

            announcer.clear();
            expect(mockElement.textContent).toBe('');

            announcer.announce('Second message');
            vi.advanceTimersByTime(100);
            expect(mockElement.textContent).toBe('Second message');
        });

        it('should preserve aria-live attribute after clear', () => {
            announcer.announce('Test message', 'assertive');
            expect(mockElement.getAttribute('aria-live')).toBe('assertive');

            announcer.clear();
            expect(mockElement.getAttribute('aria-live')).toBe('assertive');
        });

        it('should handle rapid announce calls', () => {
            announcer.announce('Message 1');
            announcer.announce('Message 2');
            announcer.announce('Message 3');

            vi.advanceTimersByTime(100);

            // Only the last message should be shown
            expect(mockElement.textContent).toBe('Message 3');
        });
    });
});
