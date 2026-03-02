import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'dist/**',
      'builds/**',
      'coverage/**',
      'node_modules/**',
      'scripts/**',
      '*.proto.compiled.*',
      'src/copied/**',
    ],
  },

  // Base JS recommended
  js.configs.recommended,

  // TypeScript recommended (type-aware OFF for now — too many legacy issues)
  ...tseslint.configs.recommended,

  // React
  {
    plugins: { react },
    settings: {
      react: { version: '17' },
    },
    rules: {
      'react/jsx-key': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/jsx-no-target-blank': 'error',
    },
  },

  // React Hooks
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Legacy React patterns — hooks rule downgraded for known false positives
  {
    files: ['src/ui/components/pages/assets/tabs/helpers.ts'],
    rules: {
      'react-hooks/rules-of-hooks': 'warn',
    },
  },

  // Prettier (must be last — disables formatting rules)
  prettier,

  // Global settings for all files
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.webextensions,
        chrome: 'readonly',
        browser: 'readonly',
        __SENTRY_DSN__: 'readonly',
        __SENTRY_ENVIRONMENT__: 'readonly',
        __SENTRY_RELEASE__: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    rules: {
      // Core
      'no-var': 'warn',
      'prefer-const': 'warn',
      eqeqeq: ['warn', 'always', { null: 'ignore' }],
      'no-eval': 'error',
      'no-implied-eval': 'error',

      // Console — warn only (allow warn + error)
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',

      // Legacy migration — downgraded from error to warn
      'no-case-declarations': 'warn',
      'no-useless-escape': 'warn',
      'no-prototype-builtins': 'warn',
      'no-extra-boolean-cast': 'warn',
      'no-empty': 'warn',
      'no-useless-catch': 'warn',
      'no-empty-pattern': 'warn',
      'no-fallthrough': 'warn',
      '@typescript-eslint/no-this-alias': 'warn',
      '@typescript-eslint/prefer-as-const': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'warn',
      'prefer-rest-params': 'warn',

      // Security — no bitwise (prevent & vs && mistakes in financial code)
      'no-bitwise': 'warn',
    },
  },

  // Relaxed rules for legacy JS controllers (to avoid massive churn)
  {
    files: ['src/**/*.js'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
      'prefer-const': 'warn',
      'no-bitwise': 'off',
      'no-undef': 'off', // ESLint can't resolve non-standard globals in plain JS
    },
  },

  // Test files — relaxed
  {
    files: ['test/**/*', '**/*.test.*', '**/*.spec.*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
);
