import { fileURLToPath } from 'node:url';

import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'eslint.config.mjs',
            '.prettierrc.cjs',
            '.dependency-cruiser.js',
            'ecosystem.config.js',
            'webpack.config.js',
            'apps/web/**/*',
            'libs/database/src/migrations/**',
            '**/jest.config.js',
        ],
    },
    {
        files: ['**/*.ts'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintConfigPrettier,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            sourceType: 'module',
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
            },
        },
    },
    {
        // --- Main naming-convention rules (strict) ---
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-unsafe-argument': 'error',
            '@typescript-eslint/explicit-function-return-type': 'warn',
            '@typescript-eslint/strict-boolean-expressions': 'warn',
            '@typescript-eslint/no-unsafe-assignment': 'error',
            '@typescript-eslint/no-unsafe-call': 'error',
            '@typescript-eslint/no-unsafe-member-access': 'error',

            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'default',
                    format: ['camelCase'],
                },
                {
                    selector: 'variable',
                    format: ['camelCase', 'PascalCase', 'UPPER_CASE', 'snake_case'],
                    leadingUnderscore: 'allow',
                },
                {
                    selector: 'parameter',
                    format: ['camelCase', 'snake_case'],
                    leadingUnderscore: 'allow',
                },
                {
                    selector: [
                        'classProperty',
                        'objectLiteralProperty',
                        'typeProperty',
                        'classMethod',
                        'objectLiteralMethod',
                        'typeMethod',
                        'accessor',
                    ],
                    format: ['snake_case', 'UPPER_CASE', 'camelCase', 'PascalCase'],
                    leadingUnderscore: 'allow',
                    filter: {
                        regex: '^[ก-๙]',
                        match: false,
                    },
                },
                {
                    selector: 'enumMember',
                    format: ['UPPER_CASE'],
                },
                {
                    selector: 'typeLike',
                    format: ['PascalCase'],
                },
            ],
        },
    },

    // --- Override for the microservice registry (object keys are PascalCase) ---
    {
        files: ['libs/common/src/enum/app-microservice.enum.ts'],
        rules: {
            '@typescript-eslint/naming-convention': [
                'error',
                { selector: 'default', format: ['camelCase'] },
                {
                    selector: 'variable',
                    format: ['camelCase', 'PascalCase', 'UPPER_CASE', 'snake_case'],
                    leadingUnderscore: 'allow',
                },
                {
                    selector: [
                        'classProperty',
                        'objectLiteralProperty',
                        'typeProperty',
                    ],
                    format: ['snake_case', 'UPPER_CASE', 'camelCase', 'PascalCase'],
                    leadingUnderscore: 'allow',
                },
                { selector: 'typeLike', format: ['PascalCase'] },
            ],
        },
    },

    // --- Override for DTOs and Entities (class properties must be snake_case) ---
    {
        files: ['**/*.dto.ts', '**/*.entity.ts'],
        rules: {
            '@typescript-eslint/naming-convention': [
                'error',
                { selector: 'default', format: ['camelCase'] },
                {
                    selector: 'variable',
                    format: ['camelCase', 'PascalCase', 'UPPER_CASE', 'snake_case'],
                    leadingUnderscore: 'allow',
                },
                {
                    selector: 'parameter',
                    format: ['camelCase', 'snake_case'],
                    leadingUnderscore: 'allow',
                },
                {
                    selector: 'classProperty',
                    format: ['snake_case'],
                    leadingUnderscore: 'allow',
                },
                {
                    selector: [
                        'objectLiteralProperty',
                        'typeProperty',
                        'classMethod',
                        'objectLiteralMethod',
                        'typeMethod',
                        'accessor',
                    ],
                    format: ['snake_case', 'UPPER_CASE', 'camelCase'],
                    leadingUnderscore: 'allow',
                    filter: {
                        regex: '^[ก-๙]',
                        match: false,
                    },
                },
                {
                    selector: 'enumMember',
                    format: ['UPPER_CASE'],
                },
                {
                    selector: 'typeLike',
                    format: ['PascalCase'],
                },
            ],
        },
    },

    // --- Override for test files ---
    {
        files: ['**/*.spec.ts', '**/*.test.ts', '**/*.e2e-spec.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/strict-boolean-expressions': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
        },
    },

    // --- Override for Jest config files ---
    {
        files: ['**/jest.config.js'],
        rules: {
            '@typescript-eslint/naming-convention': 'off',
        },
    },
);
