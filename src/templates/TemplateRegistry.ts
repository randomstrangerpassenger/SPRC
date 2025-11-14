// src/templates/TemplateRegistry.ts
/**
 * @description 포트폴리오 템플릿 레지스트리
 */

import type { PortfolioTemplate } from './PortfolioTemplate';
import { SixtyFortyTemplate } from './SixtyFortyTemplate';
import { AllWeatherTemplate } from './AllWeatherTemplate';
import { FiftyThirtyTwentyTemplate } from './FiftyThirtyTwentyTemplate';
import { EqualWeightTemplate } from './EqualWeightTemplate';

/**
 * @class TemplateRegistry
 * @description 포트폴리오 템플릿을 등록하고 조회하는 싱글톤 레지스트리
 */
export class TemplateRegistry {
    private static instance: TemplateRegistry;
    private templates: Map<string, PortfolioTemplate>;

    /**
     * @description Private constructor (싱글톤 패턴)
     */
    private constructor() {
        this.templates = new Map<string, PortfolioTemplate>();
        this.registerDefaultTemplates();
    }

    /**
     * @description 싱글톤 인스턴스 반환
     */
    static getInstance(): TemplateRegistry {
        if (!TemplateRegistry.instance) {
            TemplateRegistry.instance = new TemplateRegistry();
        }
        return TemplateRegistry.instance;
    }

    /**
     * @description 기본 템플릿 등록
     */
    private registerDefaultTemplates(): void {
        this.register(new SixtyFortyTemplate());
        this.register(new AllWeatherTemplate());
        this.register(new FiftyThirtyTwentyTemplate());
        this.register(new EqualWeightTemplate());
    }

    /**
     * @description 템플릿 등록
     * @param template - 등록할 템플릿
     */
    register(template: PortfolioTemplate): void {
        this.templates.set(template.name, template);
    }

    /**
     * @description 템플릿 조회
     * @param name - 템플릿 이름
     * @returns 템플릿 객체 또는 undefined
     */
    get(name: string): PortfolioTemplate | undefined {
        return this.templates.get(name);
    }

    /**
     * @description 모든 템플릿 이름 목록 반환
     * @returns 템플릿 이름 배열
     */
    getAvailableTemplates(): string[] {
        return Array.from(this.templates.keys());
    }

    /**
     * @description 템플릿 존재 여부 확인
     * @param name - 템플릿 이름
     * @returns 존재 여부
     */
    has(name: string): boolean {
        return this.templates.has(name);
    }

    /**
     * @description 모든 템플릿 정보 반환
     * @returns 템플릿 정보 배열 [{ name, description }]
     */
    getAllTemplateInfo(): Array<{ name: string; description: string }> {
        return Array.from(this.templates.values()).map((template) => ({
            name: template.name,
            description: template.description,
        }));
    }
}
