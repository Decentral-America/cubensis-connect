import { seedUtils } from '@decentralchain/transactions';

export function encrypt(object: unknown, password: string): string {
  const jsonObj = JSON.stringify(object);
  return seedUtils.encryptSeed(jsonObj, password);
}

export function decrypt(ciphertext: string, password: string): unknown {
  try {
    const decryptedJson = seedUtils.decryptSeed(ciphertext, password);
    return JSON.parse(decryptedJson);
  } catch (e) {
    // SECURITY: Generic error message prevents oracle attacks.
    // Preserve original error as cause for internal debugging.
    throw new Error('Invalid password', { cause: e });
  }
}
