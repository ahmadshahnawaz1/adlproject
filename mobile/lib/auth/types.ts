/** Types for the local-first authentication backend. */

export type Account = {
  id: string;
  name: string;
  /** Normalised (lower-cased, trimmed) email — the sign-in identifier. */
  email: string;
  createdAt: number;
  /** Hex colour for the profile avatar tile. */
  avatarColor: string;
};

/** A salted password digest, stored in the device keychain. */
export type StoredCredential = {
  salt: string;
  hash: string;
  /** Hashing scheme: 1 = PBKDF2-HMAC-SHA256. Absent = legacy salted SHA-256. */
  v?: 1;
  iterations?: number;
  /**
   * Digest of the one-time recovery code. Absent on accounts created before
   * recovery existed, which therefore cannot be recovered.
   */
  recoverySalt?: string;
  recoveryHash?: string;
  recoveryIterations?: number;
};

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

export type AuthResult =
  /** `recoveryCode` is present only when an account was just created. */
  { ok: true; recoveryCode?: string } | { ok: false; error: string };
