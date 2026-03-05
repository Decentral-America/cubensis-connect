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
      'react-hooks/exhaustive-deps': 'off',
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
      'no-var': 'off',
      'prefer-const': 'off',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-eval': 'error',
      'no-implied-eval': 'error',

      // Console — off for extension (uses console extensively)
      'no-console': 'off',

      // TypeScript
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',

      // Legacy extension codebase — rules turned off after full audit
      'no-case-declarations': 'off',
      'no-useless-escape': 'off',
      'no-prototype-builtins': 'off',
      'no-extra-boolean-cast': 'off',
      'no-empty': 'off',
      'no-useless-catch': 'off',
      'no-empty-pattern': 'off',
      'no-fallthrough': 'error',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/prefer-as-const': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      'prefer-rest-params': 'off',

      // Bitwise ops used intentionally in crypto/protobuf code
      'no-bitwise': 'off',
    },
  },

  // Relaxed rules for legacy JS controllers (to avoid massive churn)
  {
    files: ['src/**/*.js'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
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
