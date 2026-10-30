/**
 * lib/auth/crypto — password hashing for local accounts.
 *
 * PBKDF2-HMAC-SHA256 with a per-account random salt and key stretching, using
 * the pure implementation in ./pbkdf2. The legacy salted single-pass SHA-256
 * stays verifiable so existing accounts upgrade transparently on their next
 * successful sign-in. Native only for the RNG.
 *
 * The work factor is bounded by the JS thread: this runs in Hermes, which is
 * several times slower than V8, and a sign-in must stay responsive. Credentials
 * live in the hardware-backed keychain, so this is defence in depth rather than
 * the only barrier. Each credential records the count it was created with, so
 * this value can be raised later without locking anyone out.
 */
import * as Crypto from 'expo-crypto';
import { pbkdf2Hex } from './pbkdf2';

export const PBKDF2_ITERATIONS = 10000;

export async function makeSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Current scheme: PBKDF2-HMAC-SHA256 → 32-byte hex digest. */
export async function hashPassword(
  password: string,
  salt: string,
  iterations: number = PBKDF2_ITERATIONS,
): Promise<string> {
  return pbkdf2Hex(password, salt, iterations, 32);
}

/** Legacy scheme (pre-PBKDF2): salted single-pass SHA-256. Verify-only. */
export async function legacyHashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}
