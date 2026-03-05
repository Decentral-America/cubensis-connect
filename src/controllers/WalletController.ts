import ObservableStore from 'obs-store';
import { seedUtils } from '@decentralchain/transactions';
import { decrypt, encrypt } from '../lib/encryprtor';
import { Wallet } from '../lib/wallet';

const { Seed } = seedUtils;

/** Minimum password length for vault creation. */
const MIN_PASSWORD_LENGTH = 8;

/** Maximum consecutive failed unlock attempts before temporary lockout. */
const MAX_UNLOCK_ATTEMPTS = 5;

/** Lockout duration in milliseconds (30 seconds). */
const LOCKOUT_DURATION_MS = 30_000;

export class WalletController {
  store: any;
  password: string | null;
  wallets: any[];
  _failedUnlockAttempts: number;
  _lockoutUntil: number;
  getNetwork: any;
  getNetworks: any;
  getNetworkCode: any;
  trashControl: any;

  constructor(options: any = {}) {
    const defaults = {
      initialized: false,
    };
    const initState = Object.assign({}, defaults, options.initState);
    this.store = new ObservableStore(initState);
    this.store.updateState({ locked: true });
    this.password = null;
    this.wallets = [];
    this._failedUnlockAttempts = 0;
    this._lockoutUntil = 0;
    this.getNetwork = options.getNetwork;
    this.getNetworks = options.getNetworks;
    this.getNetworkCode = options.getNetworkCode;
    this.trashControl = options.trash;
  }

  // Public
  addWallet(options) {
    if (this.store.getState().locked) throw new Error('App is locked');
    let user;
    switch (options.type) {
      case 'seed':
        const networkCode = this.getNetworkCode(options.network);
        const seed = new Seed(options.seed, networkCode);
        user = {
          seed: seed.phrase,
          publicKey: seed.keyPair.publicKey,
          address: seed.address,
          networkCode: options.networkCode || networkCode,
          network: options.network,
          type: options.type,
          name: options.name,
        };
        break;
      default:
        throw new Error(`Unsupported type: ${options.type}`);
    }

    const wallet = new Wallet(user);

    this._checkForDuplicate(wallet.getAccount().address, user.network);

    this.wallets.push(wallet);
    this._saveWallets();
  }

  removeWallet(address, network) {
    if (this.store.getState().locked) throw new Error('App is locked');
    const wallet = this.getWalletsByNetwork(network).find(
      (wallet) => wallet.getAccount().address === address,
    );
    this._walletToTrash(wallet);
    this.wallets = this.wallets.filter((w) => {
      return w !== wallet;
    });
    this._saveWallets();
  }

  getAccounts() {
    return this.wallets.map((wallet) => wallet.getAccount());
  }

  lock() {
    this.password = null;
    this.wallets = [];
    if (!this.store.getState().locked) {
      this.store.updateState({ locked: true });
    }
  }

  unlock(password) {
    // Brute-force protection: temporary lockout after too many failures
    if (this._failedUnlockAttempts >= MAX_UNLOCK_ATTEMPTS && Date.now() < this._lockoutUntil) {
      const waitSec = Math.ceil((this._lockoutUntil - Date.now()) / 1000);
      throw new Error(`Too many failed attempts. Try again in ${waitSec}s.`);
    }

    try {
      this._restoreWallets(password);
    } catch (e) {
      this._failedUnlockAttempts++;
      if (this._failedUnlockAttempts >= MAX_UNLOCK_ATTEMPTS) {
        this._lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      }
      throw e;
    }

    // Success — reset counter
    this._failedUnlockAttempts = 0;
    this._lockoutUntil = 0;
    this.password = password;
    this._migrateWalletsNetwork();
    this.store.updateState({ locked: false });
  }

  isLocked() {
    return this.store.getState().locked;
  }

  initVault(password) {
    if (!password || typeof password !== 'string') {
      throw new Error('Password is needed to init vault');
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
    (this.wallets || []).forEach((wallet) => this._walletToTrash(wallet));
    this.password = password;
    this.wallets = [];
    this._saveWallets();
    this.store.updateState({ locked: false, initialized: true });
  }

  deleteVault() {
    (this.wallets || []).forEach((wallet) => this._walletToTrash(wallet));
    this.password = null;
    this.wallets = [];
    this.store.updateState({
      locked: true,
      initialized: false,
      vault: undefined,
    });
  }

  newPassword(oldPassword, newPassword) {
    if (
      !oldPassword ||
      !newPassword ||
      typeof oldPassword !== 'string' ||
      typeof newPassword !== 'string'
    ) {
      throw new Error('Password is required');
    }
    this._restoreWallets(oldPassword);
    this.password = newPassword;
    this._saveWallets();
  }

  /**
   * Returns account seed
   * @param {string} address - wallet address
   * @param {string} password - application password
   * @returns {string} encrypted seed
   */
  exportAccount(address, password, network) {
    if (!password) throw new Error('Password is required');
    this._restoreWallets(password);

    const wallet = this.getWalletsByNetwork(network).find(
      (wallet) => wallet.getAccount().address === address,
    );
    if (!wallet) throw new Error(`Wallet not found for address: ${address} in ${network}`);
    return wallet.getSecret();
  }

  exportSeed(address, network) {
    if (this.store.getState().locked) throw new Error('App is locked');
    if (!this.password) throw new Error('Password is required');
    const wallet = this._findWallet(address, network);
    if (!wallet) throw new Error(`Wallet not found for address: ${address} in ${network}`);
    const seed = new Seed(wallet.user.seed);
    return seed.encrypt(this.password, 5000);
  }

  /**
   * Returns encrypted with current password account seed
   * @param {string} address - wallet address
   * @returns {string} encrypted seed
   */
  encryptedSeed(address, network) {
    const wallet = this._findWallet(address, network);
    const seed = wallet.getSecret();
    return Seed.encryptSeedPhrase(seed, this.password);
  }

  updateNetworkCode(network, code) {
    code = code || this.getNetworkCode(network);
    const wallets = this.getWalletsByNetwork(network);
    wallets.forEach((wallet) => {
      if (wallet.user.networkCode !== code) {
        const seed = new Seed(wallet.user.seed, code);
        wallet.user.network = network;
        wallet.user.networkCode = code;
        wallet.user.address = seed.address;
      }
    });

    if (wallets.length) {
      this._saveWallets();
    }
  }

  getWalletsByNetwork(network) {
    return this.wallets.filter((wallet) => wallet.isMyNetwork(network));
  }

  _walletToTrash(wallet) {
    const walletsData = wallet && wallet.serialize && wallet.serialize();
    if (walletsData) {
      // SECURITY: Never store wallet data unencrypted in trash.
      // If password is not available, skip trash (data loss is preferable to plaintext exposure).
      if (!this.password) {
        console.warn('WalletController: Skipping trash — no password available for encryption');
        return;
      }
      const saveData = {
        walletsData: encrypt(walletsData, this.password),
        address: wallet.address,
      };
      this.trashControl.addData(saveData);
    }
  }

  _migrateWalletsNetwork() {
    const networks = this.getNetworks().reduce((acc, net) => {
      acc[net.code] = net.name;
      return acc;
    }, Object.create(null));

    const wallets = this.wallets.map((wallet) => wallet.serialize());

    if (!wallets.find((item) => !item.network)) {
      return null;
    }

    const walletsData = this.wallets.map((wallet) => {
      const data = wallet.serialize();
      if (!data.network) {
        data.network = networks[data.networkCode];
      }

      return data;
    });

    this.wallets = walletsData.map((user) => new Wallet(user));
    this._saveWallets();
  }

  /**
   * Signs transaction
   * @param {string} address - wallet address
   * @param {object} tx - transaction to sign
   * @param {object} network
   * @returns {Promise<string>} signed transaction as json string
   */
  async signTx(address, tx, network) {
    const wallet = this._findWallet(address, network);
    return await wallet.signTx(tx);
  }

  async signDecentralChain(type, data, address, network) {
    const wallet = this._findWallet(address, network);
    return await wallet.signDecentralChain(type, data);
  }

  /**
   * Signs transaction
   * @param {string} address - wallet address
   * @param {array} bytes - array of bytes
   * @returns {Promise<string>} signed transaction as json string
   */
  async signBytes(address, bytes, network) {
    const wallet = this._findWallet(address, network);
    return await wallet.signBytes(bytes);
  }

  /**
   * Signs request
   * @param {string} address - wallet address
   * @param {object} request - transaction to sign
   * @returns {Promise<string>} signature
   */
  async signRequest(address, request, network) {
    const wallet = this._findWallet(address, network);
    return wallet.signRequest(request);
  }

  /**
   * Signs request
   * @param {string} address - wallet address
   * @param {object} authData - object, representing auth request
   * @returns {Promise<object>} object, representing auth response
   */
  async auth(address, authData, network) {
    const wallet = this._findWallet(address, network);
    const signature = await wallet.signRequest(authData);
    const { publicKey } = wallet.getAccount();
    const { host, name, prefix, version } = authData.data;
    return {
      host,
      name,
      prefix,
      address,
      publicKey,
      signature,
      version,
    };
  }

  async getKEK(address, network, publicKey, prefix) {
    const wallet = this._findWallet(address, network);
    return await wallet.getKEK(publicKey, prefix);
  }

  async encryptMessage(address, network, message, publicKey, prefix) {
    const wallet = this._findWallet(address, network);
    return await wallet.encryptMessage(message, publicKey, prefix);
  }

  async decryptMessage(address, network, message, publicKey, prefix) {
    const wallet = this._findWallet(address, network);
    return await wallet.decryptMessage(message, publicKey, prefix);
  }

  // Private
  _checkForDuplicate(address, network) {
    if (this.getWalletsByNetwork(network).find((account) => account.address === address)) {
      throw new Error(`Account with address ${address} already exists`);
    }
  }

  _saveWallets() {
    const walletsData = this.wallets.map((wallet) => wallet.serialize());
    this.store.updateState({ vault: encrypt(walletsData, this.password) });
  }

  _restoreWallets(password) {
    const decryptedData = decrypt(this.store.getState().vault, password) as any[];
    this.wallets = decryptedData.map((user) => new Wallet(user));
  }

  _findWallet(address, network) {
    if (this.store.getState().locked) throw new Error('App is locked');
    const wallet = this.getWalletsByNetwork(network).find(
      (wallet) => wallet.getAccount().address === address,
    );
    if (!wallet) throw new Error(`Wallet not found for address ${address}`);
    return wallet;
  }
}
