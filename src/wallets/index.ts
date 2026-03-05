import { SeedWallet } from './seed';
import { LedgerWallet } from './ledger';
import { TrezorWallet } from './trezor';

export { SeedWallet, LedgerWallet, TrezorWallet };

export const WALLET_MAP: Record<
  string,
  typeof SeedWallet | typeof LedgerWallet | typeof TrezorWallet
> = {
  ledger: LedgerWallet,
  trezor: TrezorWallet,
  seed: SeedWallet,
};
