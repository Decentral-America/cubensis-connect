import { BigNumber } from '@decentralchain/bignumber';
import { Asset, Money } from '@decentralchain/data-entities';
import { SIGN_TYPE } from '@decentralchain/signature-adapter';
import { SWAP_DAPP_ADDRESS } from '../constants';

export class SwapController {
  assetInfoController: any;
  networkController: any;
  preferencesController: any;
  walletController: any;

  constructor({
    assetInfoController,
    networkController,
    preferencesController,
    walletController,
  }: any) {
    this.assetInfoController = assetInfoController;
    this.networkController = networkController;
    this.preferencesController = preferencesController;
    this.walletController = walletController;
  }

  async swapAssets({
    feeCoins,
    feeAssetId,
    fromAssetId,
    fromCoins,
    minReceivedCoins,
    route,
    slippageTolerance,
  }) {
    // --- Input validation (prevent sandwich attacks / garbage trades) ---
    if (!Array.isArray(route) || route.length === 0) {
      throw new Error('Swap route must be a non-empty array');
    }
    if (route.length > 10) {
      throw new Error('Swap route too long (max 10 hops)');
    }
    if (!Number.isFinite(Number(fromCoins)) || Number(fromCoins) <= 0) {
      throw new Error('fromCoins must be a positive number');
    }
    if (!Number.isFinite(Number(minReceivedCoins)) || Number(minReceivedCoins) <= 0) {
      throw new Error(
        'minReceivedCoins must be a positive number to prevent zero-slippage exploits',
      );
    }
    if (
      !Number.isFinite(Number(slippageTolerance)) ||
      Number(slippageTolerance) < 0 ||
      Number(slippageTolerance) > 5000
    ) {
      throw new Error('slippageTolerance must be between 0 and 5000 (0%–50%)');
    }
    for (const pool of route) {
      if (!pool || typeof pool.dApp !== 'string' || pool.dApp.length === 0) {
        throw new Error('Each route hop must have a valid dApp address');
      }
      if (typeof pool.toAssetId !== 'string') {
        throw new Error('Each route hop must have a valid toAssetId');
      }
    }
    const [feeAssetInfo, fromAssetInfo] = await Promise.all([
      this.assetInfoController.assetInfo(feeAssetId),
      this.assetInfoController.assetInfo(fromAssetId),
    ]);

    const tx = {
      type: SIGN_TYPE.SCRIPT_INVOCATION,
      data: {
        timestamp: Date.now(),
        dApp: SWAP_DAPP_ADDRESS,
        fee: new Money(new BigNumber(feeCoins), new Asset(feeAssetInfo)),
        payment: [new Money(new BigNumber(fromCoins), new Asset(fromAssetInfo))],
        call: {
          function: 'swap',
          args: [
            {
              type: 'list',
              value: route.map((pool) => ({
                type: 'string',
                value: pool.dApp,
              })),
            },
            {
              type: 'list',
              value: route.map((pool) => ({
                type: 'string',
                value: pool.toAssetId,
              })),
            },
            {
              type: 'list',
              value: route.map((pool) => ({
                type: 'integer',
                value: pool.type === 'flat' ? pool.estimatedAmount : 0,
              })),
            },
            {
              type: 'integer',
              value: slippageTolerance,
            },
            {
              type: 'integer',
              value: minReceivedCoins,
            },
          ],
        },
      },
    };

    const network = this.networkController.getNetwork();
    const selectedAccount = this.preferencesController.getSelectedAccount();

    const signedTx = await this.walletController.signTx(selectedAccount.address, tx, network);

    const text = await this.networkController.broadcast({
      type: 'transaction',
      result: signedTx,
    });

    const json = JSON.parse(text);

    return {
      transactionId: json.id,
    };
  }
}
