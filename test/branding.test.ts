// @vitest-environment node
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('branding audit', () => {
  const srcDir = path.resolve(__dirname, '../src');

  it('should not have support@decentralchain.org in manifest', () => {
    const manifest = fs.readFileSync(path.resolve(srcDir, 'copied/manifest.json'), 'utf-8');
    expect(manifest).not.toContain('support@decentralchain.org');
    expect(manifest).toContain('DecentralChain');
  });

  it('should not use Math.random() in security-sensitive files', () => {
    const securityFiles = [
      path.resolve(srcDir, 'controllers/Statistics.ts'),
      path.resolve(srcDir, 'ui/components/pages/ConfirmBackup.tsx'),
    ];
    for (const file of securityFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toContain('Math.random()');
      expect(content).toContain('crypto.getRandomValues');
    }
  });
});
