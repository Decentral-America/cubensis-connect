// @vitest-environment node
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('branding audit', () => {
  const srcDir = path.resolve(__dirname, '../src');

  function getAllFiles(dir: string, extensions: string[]): string[] {
    const results: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        results.push(...getAllFiles(fullPath, extensions));
      } else if (entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext))) {
        results.push(fullPath);
      }
    }
    return results;
  }

  it('should have zero @waves/* imports in source code', () => {
    const files = getAllFiles(srcDir, ['.ts', '.tsx', '.js']);
    const violations: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes("from '@waves/") || content.includes('from "@waves/')) {
        violations.push(path.relative(srcDir, file));
      }
    }
    expect(violations).toEqual([]);
  });

  it('should not have support@waves.tech in manifest', () => {
    const manifest = fs.readFileSync(path.resolve(srcDir, 'copied/manifest.json'), 'utf-8');
    expect(manifest).not.toContain('support@waves.tech');
    expect(manifest).toContain('DecentralChain');
  });

  it('should not use Math.random() in security-sensitive files', () => {
    const securityFiles = [
      path.resolve(srcDir, 'controllers/Statistics.js'),
      path.resolve(srcDir, 'ui/components/pages/ConfirmBackup.tsx'),
    ];
    for (const file of securityFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toContain('Math.random()');
      expect(content).toContain('crypto.getRandomValues');
    }
  });
});
