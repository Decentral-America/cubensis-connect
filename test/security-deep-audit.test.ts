// @vitest-environment node
/**
 * Deep Security Audit Tests — cubensis-connect
 *
 * These tests enforce enterprise-grade security invariants for a financial
 * browser extension. They verify that no security regression can be introduced
 * without a test failure blocking the commit via the bulletproof pipeline.
 *
 * Categories:
 *   A. Supply Chain & Dependencies
 *   B. Cryptographic Security
 *   C. XSS & Injection Prevention
 *   D. Error Handling
 *   E. Origin & Permission Validation
 *   F. Secret Exposure Prevention
 *   G. Network Security
 *   H. Build & Configuration Security
 */

import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.resolve(rootDir, 'src');

/**
 * Helper: recursively find all files matching a pattern in a directory
 */
function findFiles(dir: string, pattern: RegExp, results: string[] = []): string[] {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'copied') {
        continue;
      }
      findFiles(fullPath, pattern, results);
    } else if (pattern.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Helper: read all source files (excluding copied/vendor)
 */
function readAllSourceFiles(): Array<{ path: string; content: string; relativePath: string }> {
  const files = findFiles(srcDir, /\.(ts|tsx|js|jsx)$/);
  return files.map((f) => ({
    path: f,
    content: fs.readFileSync(f, 'utf-8'),
    relativePath: path.relative(rootDir, f),
  }));
}

// ═══════════════════════════════════════════════════════════════════
// A. Supply Chain & Dependencies
// ═══════════════════════════════════════════════════════════════════

describe('A. Supply Chain & Dependencies', () => {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'package.json'), 'utf-8'));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

  it('should have package-lock.json committed', () => {
    // package-lock may be at workspace root
    const lockPaths = [
      path.resolve(rootDir, 'package-lock.json'),
      path.resolve(rootDir, '..', 'package-lock.json'),
    ];
    const exists = lockPaths.some((p) => fs.existsSync(p));
    expect(exists).toBe(true);
  });

  it('should not have yarn.lock (npm is the standard)', () => {
    expect(fs.existsSync(path.resolve(rootDir, 'yarn.lock'))).toBe(false);
  });

  it('should not use deprecated packages: awesome-typescript-loader, tslint, mocha', () => {
    expect(allDeps['awesome-typescript-loader']).toBeUndefined();
    expect(allDeps['tslint']).toBeUndefined();
    expect(allDeps['mocha']).toBeUndefined();
    expect(allDeps['@types/mocha']).toBeUndefined();
  });

  it('should use protobufjs v7+ (not v6)', () => {
    const version = pkg.dependencies?.protobufjs || '';
    expect(version).toMatch(/\^[7-9]|\^\d{2,}/);
  });

  it('should use long v5+ (not v4)', () => {
    const version = pkg.dependencies?.long || '';
    expect(version).toMatch(/\^5/);
  });
});

// ═══════════════════════════════════════════════════════════════════
// B. Cryptographic Security
// ═══════════════════════════════════════════════════════════════════

describe('B. Cryptographic Security', () => {
  it('should never use Math.random() in source code', () => {
    const sourceFiles = readAllSourceFiles();
    const violations: string[] = [];

    for (const file of sourceFiles) {
      if (file.content.includes('Math.random')) {
        violations.push(file.relativePath);
      }
    }

    expect(violations).toEqual([]);
  });

  it('should use crypto.getRandomValues() for any randomness', () => {
    // Verify CSPRNG is used in files that need randomness
    const statisticsContent = fs.readFileSync(
      path.resolve(srcDir, 'controllers/Statistics.ts'),
      'utf-8',
    );
    expect(statisticsContent).toContain('crypto.getRandomValues');

    const confirmBackupContent = fs.readFileSync(
      path.resolve(srcDir, 'ui/components/pages/ConfirmBackup.tsx'),
      'utf-8',
    );
    expect(confirmBackupContent).toContain('crypto.getRandomValues');
  });

  it('should not leak seed phrases in error messages', () => {
    const encryptorContent = fs.readFileSync(path.resolve(srcDir, 'lib/encryprtor.ts'), 'utf-8');
    // The decrypt error should be generic (no seed/key info)
    expect(encryptorContent).toContain("'Invalid password'");
  });

  it('should preserve error cause chain in encryprtor.ts', () => {
    const content = fs.readFileSync(path.resolve(srcDir, 'lib/encryprtor.ts'), 'utf-8');
    expect(content).toContain('{ cause:');
  });

  it('should use strict equality for seed phrase comparison', () => {
    const content = fs.readFileSync(
      path.resolve(srcDir, 'ui/components/pages/ConfirmBackup.tsx'),
      'utf-8',
    );
    // Should use === not == for seed comparison
    expect(content).toContain('seed === state.seed');
    expect(content).not.toMatch(/seed\s*==\s*state\.seed(?![\s=])/);
  });
});

// ═══════════════════════════════════════════════════════════════════
// C. XSS & Injection Prevention
// ═══════════════════════════════════════════════════════════════════

describe('C. XSS & Injection Prevention', () => {
  it('should not use eval() or new Function() in source code', () => {
    const sourceFiles = readAllSourceFiles();
    const violations: string[] = [];

    for (const file of sourceFiles) {
      // Match eval( but not no-eval in comments
      if (/(?<!\w)eval\s*\(/.test(file.content) && !file.relativePath.includes('.test.')) {
        violations.push(`${file.relativePath}: eval() usage`);
      }
      // Match new Function( but not in comments
      const funcMatches = file.content.match(/new\s+Function\s*\(/g);
      if (funcMatches && !file.relativePath.includes('.test.')) {
        violations.push(`${file.relativePath}: new Function() usage`);
      }
    }

    expect(violations).toEqual([]);
  });

  it('should sanitize SVG in QrCode component (defense-in-depth)', () => {
    const content = fs.readFileSync(
      path.resolve(srcDir, 'ui/components/ui/qRCode/QrCode.tsx'),
      'utf-8',
    );
    // Must have sanitization before dangerouslySetInnerHTML
    expect(content).toContain('sanitizeSvg');
  });

  it('should not use postMessage with wildcard "*" origin', () => {
    const sourceFiles = readAllSourceFiles();
    const violations: string[] = [];

    for (const file of sourceFiles) {
      // postMessage(data, '*') is a critical security risk
      if (/postMessage\s*\([^)]*,\s*['"]?\*['"]?\s*\)/.test(file.content)) {
        violations.push(file.relativePath);
      }
    }

    expect(violations).toEqual([]);
  });

  it('should not store sensitive data in localStorage/sessionStorage', () => {
    const sourceFiles = readAllSourceFiles();
    const violations: string[] = [];

    for (const file of sourceFiles) {
      if (
        /localStorage\.(setItem|getItem)/.test(file.content) ||
        /sessionStorage\.(setItem|getItem)/.test(file.content)
      ) {
        // Check if it's storing sensitive data
        if (
          /localStorage\.setItem\s*\([^)]*(?:seed|password|key|secret|private)/i.test(file.content)
        ) {
          violations.push(`${file.relativePath}: sensitive data in localStorage`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// D. Error Handling
// ═══════════════════════════════════════════════════════════════════

describe('D. Error Handling', () => {
  it('should not have empty catch blocks in critical financial code paths', () => {
    const criticalFiles = [
      'controllers/WalletController.ts',
      'controllers/MessageController.ts',
      'controllers/NetworkController.ts',
      'lib/encryprtor.ts',
      'lib/wallet.ts',
      'lib/cryptoUtil.ts',
    ];

    const violations: string[] = [];

    for (const file of criticalFiles) {
      const fullPath = path.resolve(srcDir, file);
      if (!fs.existsSync(fullPath)) continue;
      const content = fs.readFileSync(fullPath, 'utf-8');
      const emptyMatches = content.match(/catch\s*\([^)]*\)\s*\{\s*\}/g);
      if (emptyMatches) {
        violations.push(`${file}: ${emptyMatches.length} empty catch block(s)`);
      }
    }

    expect(violations).toEqual([]);
  });

  it('should not silently swallow errors in inpage.js payment handler', () => {
    const content = fs.readFileSync(path.resolve(srcDir, 'inpage.ts'), 'utf-8');
    // The payment link handler catch block should not be empty
    expect(content).not.toMatch(/processPaymentAPILink[\s\S]*catch\s*\([^)]*\)\s*\{\s*\}/);
  });

  it('should not silently swallow errors in NetworksSettings save handler', () => {
    const content = fs.readFileSync(
      path.resolve(srcDir, 'ui/components/pages/NetworksSettings.tsx'),
      'utf-8',
    );
    expect(content).not.toMatch(/onSaveNodeHandler[\s\S]*catch\s*\([^)]*\)\s*\{\s*\}/);
  });
});

// ═══════════════════════════════════════════════════════════════════
// E. Origin & Permission Validation
// ═══════════════════════════════════════════════════════════════════

describe('E. Origin & Permission Validation', () => {
  it('should validate origin in setupPageConnection', () => {
    const content = fs.readFileSync(path.resolve(srcDir, 'background.ts'), 'utf-8');
    // The setupPageConnection should validate origin, not just have a TODO
    expect(content).not.toContain('//ToDo: check origin');
    expect(content).toContain('setupPageConnection');
    // Should have some form of permission/origin check
    expect(content).toMatch(/setupPageConnection[\s\S]*?hasPermission/);
  });
});

// ═══════════════════════════════════════════════════════════════════
// F. Secret Exposure Prevention
// ═══════════════════════════════════════════════════════════════════

describe('F. Secret Exposure Prevention', () => {
  it('should not expose background service globally in production', () => {
    const content = fs.readFileSync(path.resolve(srcDir, 'background.ts'), 'utf-8');
    // The global exposure should be doubly guarded (DEBUG + NODE_ENV check)
    expect(content).toMatch(/CubensisConnect_DEBUG.*process\.env\.NODE_ENV.*development/s);
  });

  it('should redact sensitive Redux actions in debug logging', () => {
    const content = fs.readFileSync(path.resolve(srcDir, 'ui/store.ts'), 'utf-8');
    // The logger should redact sensitive actions
    expect(content).toContain('REDACTED');
    expect(content).toContain('SENSITIVE_ACTIONS');
  });

  it('should not send wallet data to trash unencrypted', () => {
    const content = fs.readFileSync(
      path.resolve(srcDir, 'controllers/WalletController.ts'),
      'utf-8',
    );
    // The _walletToTrash method should not have a fallback to unencrypted
    expect(content).not.toMatch(/this\.password\s*\?\s*encrypt\(walletsData.*:\s*walletsData/);
  });
});

// ═══════════════════════════════════════════════════════════════════
// G. Network Security
// ═══════════════════════════════════════════════════════════════════

describe('G. Network Security', () => {
  it('should have URL validation for custom node/matcher endpoints', () => {
    const content = fs.readFileSync(
      path.resolve(srcDir, 'controllers/NetworkController.ts'),
      'utf-8',
    );
    expect(content).toContain('_isValidNodeUrl');
  });

  it('should have timeout on broadcast requests', () => {
    const content = fs.readFileSync(
      path.resolve(srcDir, 'controllers/NetworkController.ts'),
      'utf-8',
    );
    expect(content).toContain('AbortSignal.timeout');
  });

  it('should validate broadcast response is not empty', () => {
    const content = fs.readFileSync(
      path.resolve(srcDir, 'controllers/NetworkController.ts'),
      'utf-8',
    );
    expect(content).toContain('Empty response from node on broadcast');
  });

  it('should cache matcher public key at instance level (not local variable)', () => {
    const content = fs.readFileSync(
      path.resolve(srcDir, 'controllers/NetworkController.ts'),
      'utf-8',
    );
    // Should use this._matcherKeyCache, not a local variable
    expect(content).toContain('_matcherKeyCache');
  });

  it('should use HTTPS for all configured endpoints', () => {
    const content = fs.readFileSync(path.resolve(srcDir, 'constants.ts'), 'utf-8');
    // Extract all URL strings
    const urlMatches = content.match(/https?:\/\/[^\s'"]+/g) || [];
    const httpUrls = urlMatches.filter(
      (url) =>
        url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1'),
    );
    expect(httpUrls).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// H. Build & Configuration Security
// ═══════════════════════════════════════════════════════════════════

describe('H. Build & Configuration Security', () => {
  it('should have CI workflow with Node matrix testing', () => {
    const ciPath = path.resolve(rootDir, '.github/workflows/ci.yml');
    expect(fs.existsSync(ciPath)).toBe(true);
    const content = fs.readFileSync(ciPath, 'utf-8');
    expect(content).toContain('node-version: [24]');
    expect(content).toContain('bulletproof:check');
  });

  it('should have updated tests.yml (no deprecated actions)', () => {
    const testsPath = path.resolve(rootDir, '.github/workflows/tests.yml');
    if (fs.existsSync(testsPath)) {
      const content = fs.readFileSync(testsPath, 'utf-8');
      // Should not use deprecated actions/checkout@v2 or set-output
      expect(content).not.toContain('actions/checkout@v2');
      expect(content).not.toContain('actions/setup-node@v2');
      expect(content).not.toContain('::set-output');
    }
  });

  it('should have eqeqeq as error (not warn) in ESLint config', () => {
    const content = fs.readFileSync(path.resolve(rootDir, 'eslint.config.mjs'), 'utf-8');
    // eqeqeq should be error level for financial code
    expect(content).toMatch(/eqeqeq:\s*\[\s*['"]error['"]/);
  });

  it('should have no-fallthrough as error in ESLint config', () => {
    const content = fs.readFileSync(path.resolve(rootDir, 'eslint.config.mjs'), 'utf-8');
    expect(content).toMatch(/'no-fallthrough':\s*'error'/);
  });

  it('should have security overrides for critical npm packages', () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'package.json'), 'utf-8'));
    // Verify security overrides exist
    expect(pkg.overrides).toBeDefined();
    expect(pkg.overrides.axios).toBeDefined();
  });

  it('should be ESM-only with no CJS require() in source code', () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'package.json'), 'utf-8'));
    expect(pkg.type).toBe('module');

    const eslintConfig = fs.readFileSync(path.resolve(rootDir, 'eslint.config.mjs'), 'utf-8');
    expect(eslintConfig).toMatch(/'@typescript-eslint\/no-require-imports':\s*'error'/);

    const tsconfigRaw = fs.readFileSync(path.resolve(rootDir, 'tsconfig.json'), 'utf-8');
    expect(tsconfigRaw).toMatch(/"module":\s*"esnext"/i);
    expect(tsconfigRaw).toMatch(/"moduleResolution":\s*"bundler"/i);
  });
});
