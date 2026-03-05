import extension from 'extensionizer';
import log from 'loglevel';

/**
 * A wrapper around the extension's storage local API
 */
export default class ExtensionStore {
  isSupported: boolean;

  constructor() {
    this.isSupported = !!extension.storage.local;
    if (!this.isSupported) {
      log.error('Storage local API not available.');
    }
  }

  async get(): Promise<Record<string, unknown> | undefined> {
    if (!this.isSupported) return undefined;
    const result = await this._get();
    if (isEmpty(result)) {
      return undefined;
    } else {
      return result;
    }
  }

  async set(state: Record<string, unknown>): Promise<void> {
    return this._set(state);
  }

  _get(): Promise<Record<string, unknown>> {
    const local = extension.storage.local;
    return new Promise((resolve, reject) => {
      local.get(null, (result: Record<string, unknown>) => {
        const err = extension.runtime.lastError;
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  _set(obj: Record<string, unknown>): Promise<void> {
    const local = extension.storage.local;
    return new Promise((resolve, reject) => {
      local.set(obj, () => {
        const err = extension.runtime.lastError;
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

function isEmpty(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0;
}
