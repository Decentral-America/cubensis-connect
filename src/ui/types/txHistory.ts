import { type TStateChanges } from '@decentralchain/ts-types';

/**
 * Flattened entry from TStateChanges — a union of transfers, issues,
 * reissues, burns, invokes, leases, etc. with all fields optional.
 */
export interface StateChangeEntry {
  address?: string;
  asset?: string | null;
  assetId?: string;
  name?: string;
  leaseId?: string;
  dApp?: string;
  call?: { function: string; args?: unknown[] };
  stateChanges?: TStateChanges;
  [key: string]: unknown;
}

/**
 * Node-enriched transaction history entry.
 *
 * The node API returns enriched transaction data beyond the base TTransaction
 * discriminated union from @decentralchain/transactions. This interface captures
 * the superset of all fields accessed during tx history display and filtering
 * in both tabTxHistory.tsx and historyItem.tsx.
 */
export interface TxHistoryEntry {
  id: string;
  type: number;
  timestamp: number;
  sender: string;
  senderPublicKey: string;
  version?: number;

  // Transfer / payment fields
  recipient?: string;
  alias?: string;
  amount?: number | string;
  assetId?: string;

  // Issue / reissue / burn fields
  decimals?: number;
  reissuable?: boolean;
  quantity?: number | string;
  script?: string | null;

  // Exchange fields
  order1?: {
    assetPair: {
      amountAsset?: string | null;
      priceAsset?: string | null;
    };
  };
  price?: number | string;

  // Lease fields
  lease?: {
    recipient: string;
    sender: string;
    amount: number | string;
  };

  // Mass transfer fields
  transfers?: Array<{ amount: number; recipient: string }>;
  totalAmount?: number | string;

  // Data transaction fields
  data?: Array<{ key: string; type: string; value: unknown }>;

  // Invoke script fields
  dApp?: string;
  call?: { function: string; args?: unknown[] };
  payment?: Array<{ assetId: string | null; amount: number }>;
  stateChanges?: TStateChanges | null;

  // Sponsorship fields
  minSponsoredAssetFee?: number | string | null;

  // Status
  applicationStatus?: string;
}
