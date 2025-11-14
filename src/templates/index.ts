// src/templates/index.ts
/**
 * @description 포트폴리오 템플릿 모듈 통합 export
 */

export type { PortfolioTemplate } from './PortfolioTemplate';
export {
    filterStocksBySector,
    filterStocksBySectorOrName,
    setEqualRatios,
} from './PortfolioTemplate';

export { SixtyFortyTemplate } from './SixtyFortyTemplate';
export { AllWeatherTemplate } from './AllWeatherTemplate';
export { FiftyThirtyTwentyTemplate } from './FiftyThirtyTwentyTemplate';
export { EqualWeightTemplate } from './EqualWeightTemplate';

export { TemplateRegistry } from './TemplateRegistry';
