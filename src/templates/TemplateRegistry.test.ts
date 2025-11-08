// src/templates/TemplateRegistry.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TemplateRegistry } from './TemplateRegistry';
import { EqualWeightTemplate } from './EqualWeightTemplate';
import type { PortfolioTemplate } from './PortfolioTemplate';
import type { Stock } from '../types';
import Decimal from 'decimal.js';

describe('TemplateRegistry', () => {
    let registry: TemplateRegistry;

    beforeEach(() => {
        // Get singleton instance
        registry = TemplateRegistry.getInstance();
    });

    describe('getInstance', () => {
        it('should return singleton instance', () => {
            const instance1 = TemplateRegistry.getInstance();
            const instance2 = TemplateRegistry.getInstance();

            expect(instance1).toBe(instance2);
        });
    });

    describe('default templates', () => {
        it('should register default templates on initialization', () => {
            const availableTemplates = registry.getAvailableTemplates();

            expect(availableTemplates).toContain('60-40');
            expect(availableTemplates).toContain('all-weather');
            expect(availableTemplates).toContain('50-30-20');
            expect(availableTemplates).toContain('equal');
        });
    });

    describe('get', () => {
        it('should return template by name', () => {
            const template = registry.get('60-40');

            expect(template).toBeDefined();
            expect(template?.name).toBe('60-40');
        });

        it('should return undefined for non-existent template', () => {
            const template = registry.get('non-existent');

            expect(template).toBeUndefined();
        });
    });

    describe('has', () => {
        it('should return true for existing template', () => {
            const exists = registry.has('equal');

            expect(exists).toBe(true);
        });

        it('should return false for non-existent template', () => {
            const exists = registry.has('non-existent');

            expect(exists).toBe(false);
        });
    });

    describe('register', () => {
        it('should register a new custom template', () => {
            const customTemplate: PortfolioTemplate = {
                name: 'custom-test',
                description: 'Test template',
                apply: (stocks: Stock[]) => {
                    stocks.forEach((s) => (s.targetRatio = new Decimal(25)));
                },
            };

            registry.register(customTemplate);

            expect(registry.has('custom-test')).toBe(true);
            expect(registry.get('custom-test')).toBe(customTemplate);
        });
    });

    describe('getAvailableTemplates', () => {
        it('should return array of template names', () => {
            const templates = registry.getAvailableTemplates();

            expect(Array.isArray(templates)).toBe(true);
            expect(templates.length).toBeGreaterThanOrEqual(4);
        });
    });

    describe('getAllTemplateInfo', () => {
        it('should return template info array', () => {
            const info = registry.getAllTemplateInfo();

            expect(Array.isArray(info)).toBe(true);
            expect(info.length).toBeGreaterThanOrEqual(4);

            const equalInfo = info.find((t) => t.name === 'equal');
            expect(equalInfo).toBeDefined();
            expect(equalInfo?.description).toBeTruthy();
        });

        it('should include name and description for each template', () => {
            const info = registry.getAllTemplateInfo();

            info.forEach((template) => {
                expect(template.name).toBeTruthy();
                expect(template.description).toBeTruthy();
            });
        });
    });

    describe('template application', () => {
        it('should apply equal weight template correctly', () => {
            const stocks: Stock[] = [
                {
                    id: 's-1',
                    name: 'Stock 1',
                    ticker: 'S1',
                    sector: 'Tech',
                    targetRatio: new Decimal(0),
                    currentPrice: new Decimal(100),
                    isFixedBuyEnabled: false,
                    fixedBuyAmount: new Decimal(0),
                    transactions: [],
                },
                {
                    id: 's-2',
                    name: 'Stock 2',
                    ticker: 'S2',
                    sector: 'Finance',
                    targetRatio: new Decimal(0),
                    currentPrice: new Decimal(50),
                    isFixedBuyEnabled: false,
                    fixedBuyAmount: new Decimal(0),
                    transactions: [],
                },
            ];

            const template = registry.get('equal');
            template?.apply(stocks);

            expect(stocks[0].targetRatio.toNumber()).toBe(50);
            expect(stocks[1].targetRatio.toNumber()).toBe(50);
        });
    });
});
