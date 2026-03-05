export class LedgerWallet {
  publicKey: string;
  type: 'ledger';

  constructor(publicKey: string) {
    this.publicKey = publicKey;
    this.type = 'ledger';
  }

  getAccount(): { publicKey: string; type: string } {
    return { publicKey: this.publicKey, type: this.type };
  }

  serialize(): string {
    return this.publicKey;
  }

  getSecret(): string | undefined {
    return undefined;
  }
}
