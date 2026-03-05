import { type IAssetInfo } from '@decentralchain/data-entities';
import { type ExchangePool } from 'ui/components/pages/swap/channelClient';

/**
 * Shape of the remote dnode background service object.
 * Every method returns a Promise (via cbToPromise transform in dnode-util).
 */
export interface BackgroundApi {
  // Idle / lifecycle
  setIdleOptions(options: { type: string }): Promise<void>;
  updateIdle(): Promise<void>;

  // Origins
  allowOrigin(origin: string): Promise<void>;
  disableOrigin(origin: string): Promise<void>;
  deleteOrigin(origin: string): Promise<void>;
  setAutoSign(origin: string, options: { interval: number; totalAmount: number }): Promise<void>;
  setNotificationPermissions(options: { origin: string; canUse: boolean }): Promise<void>;

  // Settings
  setCurrentLocale(lng: string): Promise<void>;
  setUiState(newUiState: unknown): Promise<void>;
  setNetwork(network: string): Promise<void>;
  setCustomNode(url: string, network: string): Promise<void>;
  setCustomCode(code: string, network: string): Promise<void>;
  setCustomMatcher(url: string, network: string): Promise<void>;

  // Account / wallet
  selectAccount(address: string, network: string): Promise<void>;
  addWallet(data: unknown): Promise<void>;
  removeWallet(address: string, network: string): Promise<void>;
  deleteVault(): Promise<void>;
  lock(): Promise<void>;
  unlock(password: string): Promise<void>;
  initVault(password?: string): Promise<void>;
  exportAccount(address: string, password: string, network: string): Promise<string>;
  encryptedSeed(address: string, network: string): Promise<string>;
  editWalletName(address: string, name: string, network: string): Promise<void>;
  newPassword(oldPassword: string, newPassword: string): Promise<void>;

  // Messages
  clearMessages(): Promise<void>;
  deleteMessage(id: string): Promise<void>;
  approve(messageId: string, address: string, network: string): Promise<unknown>;
  reject(messageId: string, forever?: boolean): Promise<void>;
  updateTransactionFee(messageId: string, fee: number | string): Promise<void>;
  getMessageById(messageId: string): Promise<MessageInfo>;

  // Assets
  assetInfo(assetId: string): Promise<AssetDetail>;
  updateAssets(assetIds: string[]): Promise<AssetDetail>;
  toggleAssetFavorite(assetId: string): Promise<void>;
  updateBalances(): Promise<void>;

  // Notifications
  deleteNotifications(ids: unknown): Promise<void>;

  // User / analytics
  getUserList(type: string, from: number, to: number): Promise<unknown[]>;
  sendEvent(event: string, properties?: Record<string, unknown>): Promise<void>;

  // Transactions
  swapAssets(params: {
    feeCoins: string;
    feeAssetId: string;
    fromAssetId: string;
    fromCoins: string;
    minReceivedCoins: string;
    route: ExchangePool[];
    slippageTolerance: number;
  }): Promise<{ transactionId: string }>;
  signAndPublishTransaction(data: CubensisConnect.TSignTransactionData): Promise<unknown>;
  getMinimumFee(txType: number): Promise<number>;
  getExtraFee(address: string, network: string): Promise<number>;

  // Errors
  shouldIgnoreError(context: string, message: string): Promise<number>;

  // Window
  closeNotificationWindow(): Promise<void>;
  resizeNotificationWindow(width: number, height: number): Promise<void>;

  // State — returns Record<string, any> because the full state shape (UpdateStateInput)
  // is defined in the Redux layer; importing it here creates a circular dependency.

  getState(): Promise<Record<string, any>>;
  getNetworks(): Promise<Array<Record<string, string>>>;
}

/** Minimal shape of a message returned by getMessageById. */
export interface MessageInfo {
  origin?: string;
  type: string;
  data: { type: string; [key: string]: unknown };
  [key: string]: unknown;
}

function prepareErrorMessage(err: unknown): string {
  return err != null && typeof err === 'object' && 'message' in err
    ? String((err as { message: unknown }).message)
    : String(err);
}

class Background {
  static instance: Background;
  background: BackgroundApi;
  initPromise: Promise<void>;
  updatedByUser = false;
  private _defer: { resolve: () => void; reject: (reason?: unknown) => void };
  private _lastUpdateIdle = 0;
  private _tmr: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this._defer = {} as { resolve: () => void; reject: (reason?: unknown) => void };
    this.initPromise = new Promise((res, rej) => {
      this._defer.resolve = res;
      this._defer.reject = rej;
    });
  }

  init(background: BackgroundApi) {
    this.background = background;
    this._defer.resolve();
  }

  async updateIdle() {
    this.updatedByUser = true;
    this._updateIdle();
  }

  async setIdleOptions(options: { type: string }) {
    try {
      await this.initPromise;
      return await this.background.setIdleOptions(options);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async allowOrigin(origin: string) {
    try {
      await this.initPromise;
      return await this.background.allowOrigin(origin);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async disableOrigin(origin: string) {
    try {
      await this.initPromise;
      return await this.background.disableOrigin(origin);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async deleteOrigin(origin: string) {
    try {
      await this.initPromise;
      return await this.background.deleteOrigin(origin);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async setAutoSign(origin: string, options: { interval: number; totalAmount: number }) {
    try {
      await this.initPromise;
      return await this.background.setAutoSign(origin, options);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async setNotificationPermissions(options: { origin: string; canUse: boolean }) {
    try {
      await this.initPromise;
      return await this.background.setNotificationPermissions(options);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async setCurrentLocale(lng: string): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.setCurrentLocale(lng);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async setUiState(newUiState: unknown) {
    try {
      await this.initPromise;
      return await this.background.setUiState(newUiState);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async selectAccount(address: string, network: string): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.selectAccount(address, network);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async addWallet(data: unknown): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.addWallet(data);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async removeWallet(address: string, network: string): Promise<void> {
    try {
      await this.initPromise;
      if (address) {
        return await this.background.removeWallet(address, network);
      }

      return await this.deleteVault();
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async deleteVault() {
    try {
      await this.initPromise;
      return await this.background.deleteVault();
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async closeNotificationWindow(): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.closeNotificationWindow();
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async lock(): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.lock();
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async unlock(password: string): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.unlock(password);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async initVault(password?: string): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.initVault(password);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async exportAccount(address: string, password: string, network: string): Promise<string> {
    try {
      await this.initPromise;
      return await this.background.exportAccount(address, password, network);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async exportSeed(address: string, network: string): Promise<string> {
    try {
      await this.initPromise;
      return await this.background.encryptedSeed(address, network);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async editWalletName(address: string, name: string, network: string) {
    try {
      await this.initPromise;
      return await this.background.editWalletName(address, name, network);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async newPassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.newPassword(oldPassword, newPassword);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async clearMessages(): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.clearMessages();
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async deleteMessage(id: string): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.deleteMessage(id);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async approve(messageId: string, address: string, network: string): Promise<unknown> {
    try {
      await this.initPromise;
      return await this.background.approve(messageId, address, network);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async reject(messageId: string, forever = false): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.reject(messageId, forever);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async updateTransactionFee(messageId: string, fee: number | string): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.updateTransactionFee(messageId, fee);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async setNetwork(network: string): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.setNetwork(network);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async setCustomNode(url: string, network: string): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.setCustomNode(url, network);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async setCustomCode(code: string, network: string): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.setCustomCode(code, network);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async setCustomMatcher(url: string, network: string): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.setCustomMatcher(url, network);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async assetInfo(assetId: string): Promise<AssetDetail> {
    try {
      await this.initPromise;
      return await this.background.assetInfo(assetId || 'DCC');
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async updateAssets(assetIds: string[]): Promise<AssetDetail> {
    try {
      await this.initPromise;
      return await this.background.updateAssets(assetIds);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async toggleAssetFavorite(assetId: string): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.toggleAssetFavorite(assetId);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async deleteNotifications(ids: unknown) {
    try {
      await this.initPromise;
      return await this.background.deleteNotifications(ids);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async getUserList(type: string, from: number, to: number): Promise<unknown[]> {
    try {
      await this.initPromise;
      return await this.background.getUserList(type, from, to);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async sendEvent(event: 'addWallet', properties: { type: string });
  async sendEvent(event: 'click', properties: { id: string });
  async sendEvent(event: string, properties: Record<string, unknown> = {}) {
    try {
      await this.initPromise;
      return await this.background.sendEvent(event, properties);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async updateBalances() {
    try {
      await this.initPromise;
      return await this.background.updateBalances();
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async swapAssets(params: {
    feeCoins: string;
    feeAssetId: string;
    fromAssetId: string;
    fromCoins: string;
    minReceivedCoins: string;
    route: ExchangePool[];
    slippageTolerance: number;
  }): Promise<{ transactionId: string }> {
    try {
      await this.initPromise;
      return await this.background.swapAssets(params);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async signAndPublishTransaction(data: CubensisConnect.TSignTransactionData) {
    try {
      await this.initPromise;
      return await this.background.signAndPublishTransaction(data);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async getMinimumFee(txType: number): Promise<number> {
    try {
      await this.initPromise;
      return await this.background.getMinimumFee(txType);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async getExtraFee(address: string, network: string): Promise<number> {
    try {
      await this.initPromise;
      return await this.background.getExtraFee(address, network);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async getMessageById(messageId: string) {
    try {
      await this.initPromise;
      return await this.background.getMessageById(messageId);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async shouldIgnoreError(context: string, message: string): Promise<number> {
    try {
      await this.initPromise;
      return await this.background.shouldIgnoreError(context, message);
    } catch (err) {
      throw new Error(prepareErrorMessage(err), { cause: err });
    }
  }

  async _updateIdle() {
    const now = Date.now();
    clearTimeout(this._tmr);
    this._tmr = setTimeout(() => this._updateIdle(), 4000);

    if (!this.updatedByUser || now - this._lastUpdateIdle < 4000) {
      return null;
    }

    this.updatedByUser = false;
    this._lastUpdateIdle = now;
    await this.initPromise;
    return this.background.updateIdle();
  }
}

export default new Background();

export enum WalletTypes {
  New = 'new',
  Seed = 'seed',
  Keystore = 'keystore',
  KeystoreWx = 'keystore_wx',
}

export interface AssetDetail extends IAssetInfo {
  displayName: string;
  originTransactionId: string;
  issuer?: string;
  isFavorite?: boolean;
  isSuspicious?: boolean;
}
