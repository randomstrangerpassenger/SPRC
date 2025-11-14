// src/view/EventEmitter.ts
/**
 * @class EventEmitter
 * @description Pub/Sub 패턴을 구현하는 이벤트 시스템
 */

export type EventCallback = (data?: unknown) => void;

export class EventEmitter {
    #events: Record<string, EventCallback[]> = {};

    /**
     * @description 추상 이벤트를 구독합니다.
     * @param event - 이벤트 이름 (예: 'calculateClicked')
     * @param callback - 실행할 콜백 함수
     */
    on(event: string, callback: EventCallback): void {
        if (!this.#events[event]) {
            this.#events[event] = [];
        }
        this.#events[event].push(callback);
    }

    /**
     * @description 추상 이벤트를 발행합니다.
     * @param event - 이벤트 이름
     * @param data - 전달할 데이터
     */
    emit(event: string, data?: unknown): void {
        if (this.#events[event]) {
            this.#events[event].forEach((callback) => callback(data));
        }
    }

    /**
     * @description 모든 이벤트 리스너를 초기화합니다.
     */
    clear(): void {
        this.#events = {};
    }

    /**
     * @description 특정 이벤트의 모든 리스너를 제거합니다.
     * @param event - 이벤트 이름
     */
    off(event: string): void {
        delete this.#events[event];
    }
}
