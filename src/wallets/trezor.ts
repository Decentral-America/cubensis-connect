export class TrezorWallet {
  publicKey: string;
  type: 'trezor';

  constructor(publicKey: string) {
    this.publicKey = publicKey;
    this.type = 'trezor';
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
