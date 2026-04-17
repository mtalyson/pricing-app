import eslint from '@eslint/js';
import pluginConfigPrettier from 'eslint-config-prettier';
import pluginImportHelpers from 'eslint-plugin-import-helpers';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginSecurity from 'eslint-plugin-security';
import pluginUnusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  pluginJsxA11y.flatConfigs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReactHooks.configs.flat.recommended,
  pluginSecurity.configs.recommended,
  pluginPrettierRecommended,
  { files: ['**/*.{js,jsx,ts,tsx}'] },
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      ...pluginJsxA11y.flatConfigs.recommended.languageOptions,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
  },
  {
    plugins: {
      'import-helpers': pluginImportHelpers,
      'unused-imports': pluginUnusedImports,
    },
  },
  {
    rules: {
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'security/detect-unsafe-regex': 'off',
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-regexp': 'off',
      'no-console': 'warn',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'import-helpers/order-imports': [
        'warn',
        {
          newlinesBetween: 'always',
          groups: [
            '/^react/',
            'module',
            '/^~/',
            ['parent', 'sibling', 'index'],
          ],
          alphabetize: {
            order: 'asc',
            ignoreCase: true,
          },
        },
      ],
    },
  },
  {
    settings: {
      react: { version: 'detect' },
      'import/resolver': { typescript: {} },
    },
  },
  { ignores: ['tsconfig.json'] },
  pluginConfigPrettier,
];
