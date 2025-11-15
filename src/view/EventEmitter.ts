// src/view/EventEmitter.ts
/**
 * @class EventEmitter
 * @description Event system implementing Pub/Sub pattern
 */

export type EventCallback = (data?: unknown) => void;

export class EventEmitter {
    #events: Record<string, EventCallback[]> = {};

    /**
     * @description Subscribe to an abstract event
     * @param event - Event name (e.g., 'calculateClicked')
     * @param callback - Callback function to execute
     */
    on(event: string, callback: EventCallback): void {
        if (!this.#events[event]) {
            this.#events[event] = [];
        }
        this.#events[event].push(callback);
    }

    /**
     * @description Publish an abstract event
     * @param event - Event name
     * @param data - Data to pass
     */
    emit(event: string, data?: unknown): void {
        if (this.#events[event]) {
            this.#events[event].forEach((callback) => callback(data));
        }
    }

    /**
     * @description Clear all event listeners
     */
    clear(): void {
        this.#events = {};
    }

    /**
     * @description Remove all listeners for a specific event
     * @param event - Event name
     */
    off(event: string): void {
        delete this.#events[event];
    }
}
