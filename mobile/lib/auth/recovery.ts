/**
 * Recovery codes.
 *
 * Adl holds accounts on the device, so there is no server that can email a
 * reset link. A recovery code shown once at sign-up is the only way back into
 * an account whose password has been forgotten — without it, every ledger the
 * user owns is lost for good.
 *
 * The alphabet is Crockford's base32: no I, L, O or U, so a code cannot be
 * misread as a different one. Input is normalised on the way back in, which
 * means a user who writes O for 0 or l for 1 is still let in.
 */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const GROUPS = 5;
const GROUP_SIZE = 5;

/** Total characters in a code, ignoring separators. */
export const CODE_LENGTH = GROUPS * GROUP_SIZE;

/**
 * Build a code from random bytes. The caller supplies the randomness so this
 * stays pure and testable; production passes a cryptographic source.
 */
export function codeFromBytes(bytes: Uint8Array): string {
  if (bytes.length < CODE_LENGTH) {
    throw new Error(`recovery: need at least ${CODE_LENGTH} bytes`);
  }
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

/** Group a raw code for display: XXXXX-XXXXX-… */
export function formatRecoveryCode(raw: string): string {
  const clean = normalizeRecoveryCode(raw);
  const parts: string[] = [];
  for (let i = 0; i < clean.length; i += GROUP_SIZE) {
    parts.push(clean.slice(i, i + GROUP_SIZE));
  }
  return parts.join('-');
}

/**
 * Reduce user input to its canonical form: upper case, separators removed, and
 * the characters people habitually confuse folded onto the real ones.
 */
export function normalizeRecoveryCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[O]/g, '0')
    .replace(/[IL]/g, '1')
    .replace(/[U]/g, 'V')
    .replace(/[^0-9A-Z]/g, '');
}

/** Whether input could be a code at all, before any hashing is attempted. */
export function isWellFormedRecoveryCode(input: string): boolean {
  const clean = normalizeRecoveryCode(input);
  if (clean.length !== CODE_LENGTH) return false;
  return [...clean].every((c) => ALPHABET.includes(c));
}
