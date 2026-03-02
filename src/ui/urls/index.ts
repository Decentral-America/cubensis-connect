const explorerUrls = new Map([
  ['?', 'decentralscan.com'],
  ['T', 'testnet.decentralscan.com'],
  ['S', 'stagenet.decentralscan.com'],
  ['custom', 'decentralscan.com/custom'],
]);

export function getAccountLink(networkCode: string, address: string) {
  const explorer = explorerUrls.get(explorerUrls.has(networkCode) ? networkCode : 'custom');
  return `https://${explorer}/address/${address}`;
}

export function getTxHistoryLink(networkCode: string, address: string): string {
  return `${getAccountLink(networkCode, address)}/tx/`;
}

export function getTxDetailLink(networkCode: string, txId: string): string {
  const explorer = explorerUrls.get(explorerUrls.has(networkCode) ? networkCode : 'custom');
  return `https://${explorer}/tx/${txId}`;
}

export function getAssetDetailLink(networkCode: string, assetId: string): string {
  const explorer = explorerUrls.get(explorerUrls.has(networkCode) ? networkCode : 'custom');
  return `https://${explorer}/assets/${assetId}`;
}
