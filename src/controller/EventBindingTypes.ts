// src/controller/EventBindingTypes.ts
import type { PortfolioController } from '../controller';

/**
 * @interface EventResult
 * @description 이벤트 핸들러의 반환 결과
 */
export interface EventResult {
    needsFullRender?: boolean;
    needsUIUpdate?: boolean;
    needsUISetup?: boolean;
    [key: string]: unknown;
}

/**
 * @type PostAction
 * @description 이벤트 처리 후 실행할 액션
 */
export type PostAction = 'fullRender' | 'updateUI' | 'setupUI' | 'none';

/**
 * @interface EventBindingConfig
 * @description 이벤트 바인딩 설정
 */
export interface EventBindingConfig<T = unknown> {
    /** 이벤트 이름 */
    event: string;
    /** 이벤트 핸들러 함수 */
    handler: (data?: T) => void | Promise<void | EventResult>;
    /** result.needs* 확인 후 자동 실행할 액션 (기본: 'none') */
    autoPostAction?: boolean;
    /** 커스텀 후처리 함수 */
    customPostAction?: (result: EventResult, controller: PortfolioController) => void;
}

/**
 * @description 이벤트 바인딩 헬퍼 함수
 * 공통 패턴(needsFullRender, needsUIUpdate 등)을 자동으로 처리
 */
export function bindEvent(
    controller: PortfolioController,
    config: EventBindingConfig
): void {
    controller.view.on(config.event, async (data?: unknown) => {
        const result = await config.handler(data);

        // result가 객체이고 autoPostAction이 활성화된 경우 자동 처리
        if (config.autoPostAction && result && typeof result === 'object') {
            if (result.needsFullRender) {
                controller.fullRender();
            }
            if (result.needsUIUpdate) {
                controller.updateUIState();
            }
            if (result.needsUISetup) {
                controller.setupInitialUI();
            }
        }

        // 커스텀 후처리
        if (config.customPostAction && result) {
            config.customPostAction(result as EventResult, controller);
        }
    });
}

/**
 * @description 여러 이벤트를 한 번에 바인딩
 */
export function bindEvents(
    controller: PortfolioController,
    configs: EventBindingConfig[]
): void {
    configs.forEach((config) => bindEvent(controller, config));
}
