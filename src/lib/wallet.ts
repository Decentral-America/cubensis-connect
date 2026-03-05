import { getAdapterByType } from '@decentralchain/signature-adapter';
import { libs as transactionsLibs } from '@decentralchain/transactions';
import { decentralChain } from '../controllers/transactionsController';
import { BigNumber } from '@decentralchain/bignumber';
import create from '@decentralchain/parse-json-bignumber';

const { messageEncrypt, messageDecrypt, sharedKey, base58Encode } = transactionsLibs.crypto;
const { stringify } = create({ BigNumber } as any);

interface WalletUser {
  address: string;
  seed?: string;
  networkCode: string;
  name: string;
  publicKey: string;
  type: string;
  network: string;
  id?: string;
}

export class Wallet {
  user: WalletUser;
  address: string;

  constructor(user: WalletUser) {
    if (!user) throw new Error('user required');
    this.user = user;
    this.address = user.address;
  }

  get _adapter(): any {
    const Adapter = getAdapterByType(this.user.type as any);

    Adapter.initOptions({ networkCode: this.user.networkCode.charCodeAt(0) });

    //Todo: temporary for seed
    let params: unknown = this.user;
    if (this.user.type === 'seed') {
      params = this.user.seed;
    }

    return new (Adapter as any)(params);
  }

  isMyNetwork(network: string): boolean {
    return network === this.user.network;
  }

  getAccount(): Omit<WalletUser, 'id' | 'seed'> {
    const account = Object.assign({}, this.user);
    delete account['id'];
    delete account['seed'];
    return account;
  }

  serialize(): WalletUser {
    return this.user;
  }

  getSecret(): string | undefined {
    return this.user.seed;
  }

  async encryptMessage(
    message: string,
    publicKey: string,
    prefix = 'CubensisConnect',
  ): Promise<string> {
    const privateKey = await this._adapter.getPrivateKey();
    const shKey = sharedKey(privateKey, publicKey, prefix);
    return base58Encode(messageEncrypt(shKey, message));
  }

  async decryptMessage(
    message: string,
    publicKey: string,
    prefix = 'CubensisConnect',
  ): Promise<string> {
    const privateKey = await this._adapter.getPrivateKey();
    const shKey = sharedKey(privateKey, publicKey, prefix);
    try {
      return messageDecrypt(shKey, message);
    } catch (e) {
      throw new Error('message is invalid', { cause: e });
    }
  }

  async getKEK(publicKey: string, prefix?: string): Promise<string> {
    prefix = (prefix || '') + 'dcc';
    const privateKey = await this._adapter.getPrivateKey();
    return base58Encode(sharedKey(privateKey, publicKey, prefix));
  }

  async signDecentralChain(type: string, data: unknown): Promise<unknown> {
    return (decentralChain as Record<string, (data: unknown, user: WalletUser) => unknown>)[type](
      data,
      this.user,
    );
  }

  async signTx(tx: unknown): Promise<string> {
    const signable = this._adapter.makeSignable(tx);
    const data = await signable.getDataForApi();

    // This workaround will not be needed once money-like-to-node starts
    // converting lists of integers here.
    if (data.type === 16 && data.call && data.call.args) {
      data.call.args.forEach(
        (arg: { type: string; value: Array<{ type: string; value: unknown }> }) => {
          if (arg.type === 'list') {
            arg.value.forEach((item: { type: string; value: unknown }) => {
              if (item.type === 'integer') {
                item.value = new BigNumber(item.value as string);
              }
            });
          }
        },
      );
    }

    return stringify(data);
  }

  async signBytes(bytes: number[]): Promise<string> {
    return await this._adapter.signData(Uint8Array.from(bytes));
  }

  async signRequest(request: unknown): Promise<string> {
    const signable = this._adapter.makeSignable(request);
    return await signable.getSignature();
  }
}
