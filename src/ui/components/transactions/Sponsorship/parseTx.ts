import { SIGN_TYPE } from '@decentralchain/signature-adapter';

export const messageType = 'sponsorship';
export const txType = 'transaction';
export const SPONSOR_MODE = {
  enable: 'sponsor_enable',
  disable: 'sponsor_disable',
};

export function getAssetsId(tx): Array<string> {
  const feeAssetId = tx.fee && tx.fee.assetId ? tx.fee.assetId : tx.feeAssetId || 'DCC';
  const sponsoredAssetId = (tx.minSponsoredAssetFee && tx.minSponsoredAssetFee.assetId) || 'DCC';
  return [feeAssetId, sponsoredAssetId];
}

export { getFee } from '../BaseTransaction/parseTx';

export function getAssetFee(tx) {
  const amount = tx.minSponsoredAssetFee;
  return typeof amount === 'object' ? amount : { coins: amount, assetId: tx.assetId };
}

export function getAmount() {
  return { coins: 0, assetId: 'DCC' };
}

export function getAmountSign() {
  return '' as const;
}

export function isMe(tx: any, type: string) {
  return tx.type === SIGN_TYPE.SPONSORSHIP && type === txType;
}
