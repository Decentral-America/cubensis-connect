import * as Sentry from '@sentry/react';
import ObservableStore from 'obs-store';

export class NetworkController {
  // SECURITY: Cache matcher public keys at instance level to avoid repeated network fetches
  _matcherKeyCache: Record<string, any> = {};
  store: any;
  configApi: any;

  constructor(options: any = {}) {
    const defaults = {
      currentNetwork: 'mainnet',
      customNodes: {
        mainnet: null,
        stagenet: null,
        testnet: null,
        custom: null,
      },
      customMatchers: {
        mainnet: null,
        testnet: null,
        stagenet: null,
        custom: null,
      },
      customCodes: {
        mainnet: null,
        testnet: null,
        stagenet: null,
        custom: null,
      },
    };

    const { initState, getNetworkConfig, getNetworks } = options;
    this.store = new ObservableStore({ ...defaults, ...initState });
    this.configApi = { getNetworkConfig, getNetworks };
    Sentry.setTag('network', this.store.getState().currentNetwork);
  }

  getNetworks() {
    const networks = this.configApi.getNetworkConfig();
    return this.configApi.getNetworks().map((name) => ({ ...networks[name], name }));
  }

  setNetwork(network) {
    Sentry.setTag('network', network);

    Sentry.addBreadcrumb({
      type: 'user',
      category: 'network-change',
      level: 'info',
      message: `Change network to ${network}`,
    });

    this.store.updateState({ currentNetwork: network });
  }

  getNetwork() {
    return this.store.getState().currentNetwork;
  }

  setCustomNode(url, network = 'mainnet') {
    if (url && !this._isValidNodeUrl(url)) {
      throw new Error('Invalid node URL. Must be a valid HTTPS URL.');
    }
    const { customNodes } = this.store.getState();
    customNodes[network] = url;
    this.store.updateState({ customNodes });
  }

  setCustomMatcher(url, network = 'mainnet') {
    if (url && !this._isValidNodeUrl(url)) {
      throw new Error('Invalid matcher URL. Must be a valid HTTPS URL.');
    }
    const { customMatchers } = this.store.getState();
    customMatchers[network] = url;
    this.store.updateState({ customMatchers });
  }

  setCustomCode(code, network = 'mainnet') {
    const { customCodes } = this.store.getState();
    customCodes[network] = code;
    this.store.updateState({ customCodes });
  }

  getCustomCodes() {
    return this.store.getState().customCodes;
  }

  getNetworkCode(network?) {
    const networks = this.configApi.getNetworkConfig();
    network = network || this.getNetwork();
    return this.getCustomCodes()[network] || networks[network].code;
  }

  getCustomNodes() {
    return this.store.getState().customNodes;
  }

  getNode(network?) {
    const networks = this.configApi.getNetworkConfig();
    network = network || this.getNetwork();
    return this.getCustomNodes()[network] || networks[network].server;
  }

  getCustomMatchers() {
    return this.store.getState().customMatchers;
  }

  getMather(network?) {
    network = network || this.getNetwork();
    return this.getCustomMatchers()[network] || this.configApi.getNetworkConfig()[network].matcher;
  }

  // Alias for the typo — preserves backward compatibility
  getMatcher(network) {
    return this.getMather(network);
  }

  async getMatcherPublicKey() {
    const url = new URL('/matcher', this.getMather()).toString();
    if (this._matcherKeyCache[url] == null) {
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`Failed to fetch matcher public key: ${resp.status}`);
      }
      this._matcherKeyCache[url] = await resp.text();
    }
    return this._matcherKeyCache[url];
  }

  /**
   * SECURITY: Validate that a URL is a valid HTTPS URL.
   * Prevents users from setting malicious node/matcher endpoints.
   */
  _isValidNodeUrl(url) {
    try {
      const parsed = new URL(url);
      return (
        parsed.protocol === 'https:' ||
        parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1'
      );
    } catch {
      return false;
    }
  }

  async broadcast(message) {
    const { result, type } = message;
    let API_BASE, url;

    switch (type) {
      case 'transaction':
        API_BASE = this.getNode();
        url = new URL('transactions/broadcast', API_BASE).toString();
        break;
      case 'order':
        API_BASE = this.getMather();
        if (!API_BASE) {
          throw new Error('Matcher not set. Cannot send order');
        }
        url = new URL('matcher/orderbook', API_BASE).toString();
        break;
      case 'cancelOrder':
        const { amountAsset, priceAsset } = message;
        API_BASE = this.getMather();
        if (!API_BASE) {
          throw new Error('Matcher not set. Cannot send order');
        }
        url = new URL(`matcher/orderbook/${amountAsset}/${priceAsset}/cancel`, API_BASE).toString();
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: result,
      signal: AbortSignal.timeout(30000), // SECURITY: 30s timeout prevents hanging connections
    });

    switch (resp.status) {
      case 200: {
        const responseText = await resp.text();
        // SECURITY: Validate 200 response is not empty — a node returning an empty body
        // on broadcast means the transaction was likely not accepted.
        if (!responseText || responseText.trim().length === 0) {
          throw new Error('Empty response from node on broadcast');
        }
        return responseText;
      }
      case 400: {
        const error = await resp.json();
        throw new Error(error.message || 'Transaction rejected by node');
      }
      default:
        throw new Error(await resp.text());
    }
  }
}
