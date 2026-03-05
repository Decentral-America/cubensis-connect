import { seedUtils } from '@decentralchain/transactions';

const Seed = seedUtils.Seed;

export class SeedWallet {
  seed: InstanceType<typeof Seed>;
  type: 'seed';

  constructor(phrase: string) {
    this.seed = new Seed(phrase);
    this.type = 'seed';
  }

  getAccount(): { publicKey: string; type: string } {
    return { publicKey: this.seed.keyPair.publicKey, type: this.type };
  }

  serialize(): string {
    return this.seed.phrase;
  }

  getSecret(): string {
    return this.seed.phrase;
  }
}
