// @vitest-environment node
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('security audit', () => {
  const rootDir = path.resolve(__dirname, '..');
  const srcDir = path.resolve(rootDir, 'src');

  it('should have TypeScript strict mode enabled', () => {
    const raw = fs.readFileSync(path.resolve(rootDir, 'tsconfig.json'), 'utf-8');
    expect(raw).toContain('"strict": true');
  });

  it('should target Node >= 24 in engines', () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'package.json'), 'utf-8'));
    expect(pkg.engines.node).toBe('>=24');
  });

  it('should be ESM-only (type: module)', () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'package.json'), 'utf-8'));
    expect(pkg.type).toBe('module');
  });

  it('should have husky pre-commit hook', () => {
    const hookPath = path.resolve(rootDir, '.husky/pre-commit');
    expect(fs.existsSync(hookPath)).toBe(true);
    const content = fs.readFileSync(hookPath, 'utf-8');
    expect(content).toContain('lint-staged');
    expect(content).toContain('typecheck');
  });

  it('should have ESLint flat config', () => {
    expect(fs.existsSync(path.resolve(rootDir, 'eslint.config.mjs'))).toBe(true);
  });

  it('should have Vitest config', () => {
    expect(fs.existsSync(path.resolve(rootDir, 'vitest.config.ts'))).toBe(true);
  });

  it('should not have legacy Babel 6 .babelrc', () => {
    expect(fs.existsSync(path.resolve(rootDir, '.babelrc'))).toBe(false);
  });

  it('should have Vite config (migrated from Babel)', () => {
    expect(fs.existsSync(path.resolve(rootDir, 'vite.config.ts'))).toBe(true);
    // Babel is no longer used — Vite handles TS/JSX transpilation
    expect(fs.existsSync(path.resolve(rootDir, 'babel.config.json'))).toBe(false);
  });

  it('should not have awesome-typescript-loader in package.json', () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'package.json'), 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(allDeps['awesome-typescript-loader']).toBeUndefined();
  });

  it('should not have webpack in package.json (migrated to Vite)', () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'package.json'), 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(allDeps['webpack']).toBeUndefined();
    expect(allDeps['vite']).toBeDefined();
  });

  it('should not have extract-text-webpack-plugin in package.json', () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'package.json'), 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(allDeps['extract-text-webpack-plugin']).toBeUndefined();
  });

  it('should not have Mocha in package.json', () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'package.json'), 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(allDeps.mocha).toBeUndefined();
    expect(allDeps['@types/mocha']).toBeUndefined();
    expect(allDeps.chai).toBeUndefined();
  });

  it('should have crypto.getRandomValues in Statistics.ts (not Math.random)', () => {
    const content = fs.readFileSync(path.resolve(srcDir, 'controllers/Statistics.ts'), 'utf-8');
    expect(content).toContain('crypto.getRandomValues');
    expect(content).not.toContain('Math.random');
  });

  it('should have crypto.getRandomValues in ConfirmBackup.tsx (not Math.random)', () => {
    const content = fs.readFileSync(
      path.resolve(srcDir, 'ui/components/pages/ConfirmBackup.tsx'),
      'utf-8',
    );
    expect(content).toContain('crypto.getRandomValues');
    expect(content).not.toContain('Math.random');
  });
});
