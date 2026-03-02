import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      ui: path.resolve(__dirname, 'src/ui'),
      controllers: path.resolve(__dirname, 'src/controllers'),
      lib: path.resolve(__dirname, 'src/lib'),
      wallets: path.resolve(__dirname, 'src/wallets'),
      accounts: path.resolve(__dirname, 'src/accounts'),
      assets: path.resolve(__dirname, 'src/assets'),
      constants: path.resolve(__dirname, 'src/constants'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['test/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'test/*.ui.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['src/**/*.{ts,tsx,js}'],
      exclude: ['src/copied/**', 'src/**/*.d.ts', 'node_modules/**', 'dist/**', 'test/**'],
      thresholds: {
        branches: 30,
        functions: 30,
        lines: 30,
        statements: 30,
      },
    },
  },
});
