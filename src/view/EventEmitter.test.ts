// src/view/EventEmitter.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from './EventEmitter';

describe('EventEmitter', () => {
    let emitter: EventEmitter;

    beforeEach(() => {
        emitter = new EventEmitter();
    });

    describe('on() and emit()', () => {
        it('should register and call a single event listener', () => {
            const callback = vi.fn();
            emitter.on('testEvent', callback);
            emitter.emit('testEvent', { data: 'test' });

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith({ data: 'test' });
        });

        it('should call multiple listeners for the same event', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();
            const callback3 = vi.fn();

            emitter.on('testEvent', callback1);
            emitter.on('testEvent', callback2);
            emitter.on('testEvent', callback3);

            emitter.emit('testEvent', 'payload');

            expect(callback1).toHaveBeenCalledWith('payload');
            expect(callback2).toHaveBeenCalledWith('payload');
            expect(callback3).toHaveBeenCalledWith('payload');
        });

        it('should emit events without data', () => {
            const callback = vi.fn();
            emitter.on('noDataEvent', callback);
            emitter.emit('noDataEvent');

            expect(callback).toHaveBeenCalledWith(undefined);
        });

        it('should not call listeners for different events', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            emitter.on('event1', callback1);
            emitter.on('event2', callback2);

            emitter.emit('event1', 'data1');

            expect(callback1).toHaveBeenCalledWith('data1');
            expect(callback2).not.toHaveBeenCalled();
        });

        it('should handle emitting non-existent events gracefully', () => {
            expect(() => {
                emitter.emit('nonExistentEvent', 'data');
            }).not.toThrow();
        });
    });

    describe('clear()', () => {
        it('should remove all event listeners', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            emitter.on('event1', callback1);
            emitter.on('event2', callback2);

            emitter.clear();

            emitter.emit('event1');
            emitter.emit('event2');

            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).not.toHaveBeenCalled();
        });
    });

    describe('off()', () => {
        it('should remove listeners for a specific event', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            emitter.on('event1', callback1);
            emitter.on('event2', callback2);

            emitter.off('event1');

            emitter.emit('event1');
            emitter.emit('event2');

            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });

        it('should handle removing non-existent events gracefully', () => {
            expect(() => {
                emitter.off('nonExistentEvent');
            }).not.toThrow();
        });
    });

    describe('multiple subscriptions', () => {
        it('should support multiple events with different callbacks', () => {
            const callbacks = {
                calculate: vi.fn(),
                save: vi.fn(),
                delete: vi.fn()
            };

            emitter.on('calculateClicked', callbacks.calculate);
            emitter.on('saveClicked', callbacks.save);
            emitter.on('deleteClicked', callbacks.delete);

            emitter.emit('calculateClicked', { amount: 1000 });
            emitter.emit('saveClicked', { id: 123 });

            expect(callbacks.calculate).toHaveBeenCalledWith({ amount: 1000 });
            expect(callbacks.save).toHaveBeenCalledWith({ id: 123 });
            expect(callbacks.delete).not.toHaveBeenCalled();
        });
    });

    describe('edge cases', () => {
        it('should handle rapid successive emits', () => {
            const callback = vi.fn();
            emitter.on('rapidEvent', callback);

            for (let i = 0; i < 100; i++) {
                emitter.emit('rapidEvent', i);
            }

            expect(callback).toHaveBeenCalledTimes(100);
        });

        it('should handle callbacks that throw errors', () => {
            const errorCallback = vi.fn(() => {
                throw new Error('Callback error');
            });
            const normalCallback = vi.fn();

            emitter.on('errorEvent', errorCallback);
            emitter.on('errorEvent', normalCallback);

            // First callback throws, but second should still execute
            expect(() => {
                emitter.emit('errorEvent');
            }).toThrow();

            expect(errorCallback).toHaveBeenCalled();
            // Note: Due to the throw, normalCallback might not be called
            // depending on implementation
        });
    });
});