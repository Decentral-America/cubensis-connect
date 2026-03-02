import { describe, expect, it } from 'vitest';
import {
  MSG_STATUSES,
  STATUS,
  DEFAULT_CONFIG,
  CubensisConnect_DEBUG,
  CubensisConnect_ENV,
  allowMatcher,
} from '../src/constants';

describe('constants', () => {
  describe('MSG_STATUSES', () => {
    it('should define all expected message statuses', () => {
      expect(MSG_STATUSES.UNAPPROVED).toBe('unapproved');
      expect(MSG_STATUSES.SIGNED).toBe('signed');
      expect(MSG_STATUSES.PUBLISHED).toBe('published');
      expect(MSG_STATUSES.FAILED).toBe('failed');
      expect(MSG_STATUSES.REJECTED).toBe('rejected');
      expect(MSG_STATUSES.REJECTED_FOREVER).toBe('rejected_forever');
      expect(MSG_STATUSES.SHOWED_NOTIFICATION).toBe('showed_notify');
      expect(MSG_STATUSES.NEW_NOTIFICATION).toBe('new_notify');
    });

    it('should have exactly 8 statuses', () => {
      expect(Object.keys(MSG_STATUSES)).toHaveLength(8);
    });
  });

  describe('STATUS', () => {
    it('should define numeric status codes', () => {
      expect(STATUS.ERROR).toBe(-1);
      expect(STATUS.OK).toBe(1);
      expect(STATUS.PENDING).toBe(0);
      expect(STATUS.UPDATED).toBe(2);
    });
  });

  describe('DEFAULT_CONFIG', () => {
    it('should define four networks', () => {
      expect(DEFAULT_CONFIG.NETWORKS).toEqual(['mainnet', 'testnet', 'stagenet', 'custom']);
    });

    it('should have DecentralChain node URLs (not legacy Waves)', () => {
      const { NETWORK_CONFIG } = DEFAULT_CONFIG;
      expect(NETWORK_CONFIG.mainnet.server).toContain('decentralchain.io');
      expect(NETWORK_CONFIG.testnet.server).toContain('decentralchain.io');
      expect(NETWORK_CONFIG.stagenet.server).toContain('decentralchain.io');

      // Verify no legacy Waves URLs remain
      const allUrls = Object.values(NETWORK_CONFIG)
        .flatMap((cfg) => [cfg.server, cfg.matcher])
        .filter(Boolean);
      for (const url of allUrls) {
        expect(url).not.toContain('waves');
      }
    });

    it('should have valid message config defaults', () => {
      expect(DEFAULT_CONFIG.MESSAGES_CONFIG.max_messages).toBe(100);
      expect(DEFAULT_CONFIG.MESSAGES_CONFIG.message_expiration_ms).toBeGreaterThan(0);
    });

    it('should define pack config with allowed transaction types', () => {
      expect(DEFAULT_CONFIG.PACK_CONFIG.max).toBe(7);
      expect(DEFAULT_CONFIG.PACK_CONFIG.allow_tx).toContain(16); // InvokeScript
    });
  });

  describe('environment flags', () => {
    it('should define CubensisConnect_ENV', () => {
      expect(typeof CubensisConnect_ENV).toBe('string');
    });

    it('should define CubensisConnect_DEBUG as boolean', () => {
      expect(typeof CubensisConnect_DEBUG).toBe('boolean');
    });
  });

  describe('allowMatcher', () => {
    it('should be an array of allowed matcher domains', () => {
      expect(Array.isArray(allowMatcher)).toBe(true);
      expect(allowMatcher.length).toBeGreaterThan(0);
    });

    it('should not contain any legacy Waves domains', () => {
      for (const domain of allowMatcher) {
        expect(domain).not.toContain('waves');
      }
    });
  });
});
