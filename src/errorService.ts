// src/errorService.ts
/**
 * @description 레거시 호환성을 위한 ErrorService
 * @deprecated 새로운 코드에서는 errors/ 모듈을 직접 사용하세요
 */

import type { IView } from './types';
import {
    ValidationError,
    NetworkError,
    CalculationError,
    StorageError,
    errorHandler,
} from './errors';

// 하위 호환성을 위해 에러 클래스들을 re-export
export { ValidationError, NetworkError, CalculationError, StorageError };

/**
 * @description 레거시 ErrorService 객체 (errorHandler로 위임)
 * @deprecated 새로운 코드에서는 errorHandler를 직접 사용하세요
 */
export const ErrorService = {
    /**
     * @description View 인스턴스를 설정합니다.
     * @deprecated errorHandler.setView()를 사용하세요
     */
    setViewInstance(view: IView): void {
        errorHandler.setView(view);
    },

    /**
     * @description 중앙 집중식 에러 핸들러
     * @deprecated errorHandler.handle()을 사용하세요
     */
    handle(error: Error, context: string = 'General'): void {
        errorHandler.handle(error, context);
    },
};
