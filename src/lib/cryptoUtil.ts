import { libs } from '@decentralchain/transactions';

function blake2b(input: Uint8Array): Uint8Array {
  return libs.crypto.blake2b(input);
}

function keccak(input: Uint8Array): Uint8Array {
  return libs.crypto.keccak(input);
}

function hashChain(input: Uint8Array): Uint8Array {
  return keccak(blake2b(input));
}

export function publicKeyHashFromAddress(address: string): string {
  const rawPKHash = libs.crypto.base58Decode(address).slice(2, 22);
  return libs.crypto.base58Encode(rawPKHash);
}

export function publicKeyHashFromPK(pk: string): string {
  const decodedPK = libs.crypto.base58Decode(pk);
  const rawPKHash = hashChain(decodedPK).slice(0, 20);
  return libs.crypto.base58Encode(rawPKHash);
}

export function addressFromPublicKey(pk: string, network: string): string {
  return new (libs.crypto as any).Seed(pk, network).address;
}

export function networkByteFromAddress(address: string): string {
  const rawNetworkByte = libs.crypto.base58Decode(address).slice(1, 2);
  return String.fromCharCode(rawNetworkByte[0]);
}
