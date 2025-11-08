import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
    js.configs.recommended,
    {
        files: ['src/**/*.ts', 'src/**/*.js'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                project: './tsconfig.json',
            },
            globals: {
                console: 'readonly',
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                localStorage: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                HTMLElement: 'readonly',
                Element: 'readonly',
                NodeListOf: 'readonly',
                MediaQueryList: 'readonly',
                MediaQueryListEvent: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            prettier: prettierPlugin,
        },
        rules: {
            ...tsPlugin.configs['recommended'].rules,
            ...tsPlugin.configs['recommended-requiring-type-checking'].rules,
            ...prettierConfig.rules,
            'prettier/prettier': 'warn',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/await-thenable': 'error',
            'no-console': 'off',
            'prefer-const': 'error',
            'no-var': 'error',
        },
    },
    // Special configuration for test files
    {
        files: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                project: './tsconfig.json',
            },
            globals: {
                // Vitest globals
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                vi: 'readonly',
                global: 'readonly',
                // Browser globals
                console: 'readonly',
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                localStorage: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            prettier: prettierPlugin,
        },
        rules: {
            ...tsPlugin.configs['recommended'].rules,
            ...prettierConfig.rules,
            'prettier/prettier': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn', // More lenient for tests
            '@typescript-eslint/no-unsafe-call': 'warn',
            '@typescript-eslint/no-unsafe-member-access': 'warn',
            '@typescript-eslint/no-unsafe-assignment': 'warn',
            '@typescript-eslint/no-unsafe-return': 'warn',
            '@typescript-eslint/require-await': 'off', // Allow async without await in tests
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            'no-console': 'off',
        },
    },
    // Special configuration for worker files
    {
        files: ['src/workers/**/*.ts', 'src/**/*.worker.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                project: './tsconfig.json',
            },
            globals: {
                self: 'readonly', // Web Worker global
                postMessage: 'readonly',
                onmessage: 'readonly',
                importScripts: 'readonly',
                console: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            prettier: prettierPlugin,
        },
        rules: {
            ...tsPlugin.configs['recommended'].rules,
            ...prettierConfig.rules,
            'prettier/prettier': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn', // More lenient for workers
            '@typescript-eslint/no-unsafe-call': 'warn',
            '@typescript-eslint/no-unsafe-member-access': 'warn',
            '@typescript-eslint/no-unsafe-assignment': 'warn',
            '@typescript-eslint/no-unsafe-return': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',
            'no-case-declarations': 'off', // Allow declarations in case blocks
            'no-console': 'off',
        },
    },
    {
        ignores: ['dist/**', 'node_modules/**', '*.config.ts', '*.config.js'],
    },
];