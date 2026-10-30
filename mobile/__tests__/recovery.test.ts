/**
 * Recovery code tests.
 *
 * The code is the only route back into an account whose password is forgotten,
 * so its alphabet must be unambiguous and its normalisation forgiving of the
 * characters people habitually confuse when copying by hand.
 */
import {
  CODE_LENGTH,
  codeFromBytes,
  formatRecoveryCode,
  isWellFormedRecoveryCode,
  normalizeRecoveryCode,
} from '../lib/auth/recovery';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { changePassword, createAccount, resetPasswordWithCode, verify } from '../lib/auth/store';
import { hashPassword } from '../lib/auth/crypto';
import type { StoredCredential } from '../lib/auth/types';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-crypto', () => {
  const crypto = jest.requireActual<typeof import('node:crypto')>('node:crypto');
  return {
    getRandomBytesAsync: async (size: number) => new Uint8Array(crypto.randomBytes(size)),
    CryptoDigestAlgorithm: { SHA256: 'SHA256' },
    digestStringAsync: async (_algorithm: string, value: string) =>
      crypto.createHash('sha256').update(value).digest('hex'),
  };
});

jest.mock('../lib/auth/pbkdf2', () => ({
  pbkdf2Hex: (password: string, salt: string, iterations: number, length: number) =>
    jest
      .requireActual<typeof import('node:crypto')>('node:crypto')
      .pbkdf2Sync(password, salt, iterations, length, 'sha256')
      .toString('hex'),
}));
jest.mock('../lib/scopeMigration', () => ({ purgeUserData: jest.fn() }));
jest.mock('../lib/ai/secureKey', () => ({ clearAllKeys: jest.fn() }));

const bytes = (fill: (i: number) => number, length = CODE_LENGTH) =>
  Uint8Array.from({ length }, (_, i) => fill(i));

describe('generating a code', () => {
  it('produces a code of the expected length', () => {
    expect(codeFromBytes(bytes((i) => i))).toHaveLength(CODE_LENGTH);
  });

  it('uses only unambiguous characters', () => {
    const code = codeFromBytes(bytes((i) => i * 7));
    expect(code).toMatch(/^[0-9A-Z]+$/);
    for (const confusable of ['I', 'L', 'O', 'U']) {
      expect(code).not.toContain(confusable);
    }
  });

  it('covers the whole alphabet given the whole byte range', () => {
    const code = codeFromBytes(bytes((i) => i, 256));
    expect(new Set(code).size).toBeGreaterThan(10);
  });

  it('refuses to build a code from too little randomness', () => {
    expect(() => codeFromBytes(bytes((i) => i, CODE_LENGTH - 1))).toThrow(/at least/);
  });

  it('is deterministic for the same bytes', () => {
    expect(codeFromBytes(bytes((i) => i * 3))).toBe(codeFromBytes(bytes((i) => i * 3)));
  });

  it('changes when the bytes change', () => {
    expect(codeFromBytes(bytes((i) => i))).not.toBe(codeFromBytes(bytes((i) => i + 1)));
  });
});

describe('formatting', () => {
  it('groups the code for reading', () => {
    const formatted = formatRecoveryCode(codeFromBytes(bytes((i) => i)));
    expect(formatted).toMatch(/^([0-9A-Z]{5}-){4}[0-9A-Z]{5}$/);
  });

  it('round-trips back to the raw code', () => {
    const raw = codeFromBytes(bytes((i) => i * 5));
    expect(normalizeRecoveryCode(formatRecoveryCode(raw))).toBe(raw);
  });
});

describe('reading a code back in', () => {
  const raw = codeFromBytes(bytes((i) => i * 11));

  it('accepts it with or without the separators', () => {
    expect(normalizeRecoveryCode(formatRecoveryCode(raw))).toBe(raw);
    expect(normalizeRecoveryCode(raw)).toBe(raw);
  });

  it('accepts it in lower case', () => {
    expect(normalizeRecoveryCode(raw.toLowerCase())).toBe(raw);
  });

  it('forgives spaces and stray punctuation', () => {
    expect(normalizeRecoveryCode(` ${formatRecoveryCode(raw)} `)).toBe(raw);
    expect(normalizeRecoveryCode(formatRecoveryCode(raw).replace(/-/g, ' '))).toBe(raw);
  });

  it('folds the characters people confuse onto the real ones', () => {
    expect(normalizeRecoveryCode('O')).toBe('0');
    expect(normalizeRecoveryCode('o')).toBe('0');
    expect(normalizeRecoveryCode('I')).toBe('1');
    expect(normalizeRecoveryCode('l')).toBe('1');
    expect(normalizeRecoveryCode('U')).toBe('V');
  });

  it('lets a hand-copied code through despite those confusions', () => {
    // Someone reading 0 as O and 1 as l still gets in.
    const miscopied = '0123A'.replace('0', 'O').replace('1', 'l');
    expect(normalizeRecoveryCode(miscopied)).toBe('0123A');
  });
});

describe('checking a code looks plausible', () => {
  const raw = codeFromBytes(bytes((i) => i * 13));

  it('accepts a real code, formatted or not', () => {
    expect(isWellFormedRecoveryCode(raw)).toBe(true);
    expect(isWellFormedRecoveryCode(formatRecoveryCode(raw))).toBe(true);
    expect(isWellFormedRecoveryCode(raw.toLowerCase())).toBe(true);
  });

  it('rejects anything of the wrong length', () => {
    expect(isWellFormedRecoveryCode('')).toBe(false);
    expect(isWellFormedRecoveryCode(raw.slice(0, -1))).toBe(false);
    expect(isWellFormedRecoveryCode(`${raw}A`)).toBe(false);
  });

  it('rejects text that is not a code at all', () => {
    expect(isWellFormedRecoveryCode('not a recovery code at all!!')).toBe(false);
  });
});

describe('offline account recovery', () => {
  const credentials = new Map<string, string>();
  const email = 'recovery@example.com';
  const originalPassword = 'original-password';
  const nextPassword = 'replacement-password';

  beforeEach(async () => {
    credentials.clear();
    jest.clearAllMocks();
    await AsyncStorage.clear();
    jest
      .mocked(SecureStore.getItemAsync)
      .mockImplementation(async (key) => credentials.get(key) ?? null);
    jest.mocked(SecureStore.setItemAsync).mockImplementation(async (key, value) => {
      credentials.set(key, value);
    });
    jest.mocked(SecureStore.deleteItemAsync).mockImplementation(async (key) => {
      credentials.delete(key);
    });
  });

  async function registeredAccount() {
    const result = await createAccount('Test Account', email, originalPassword);
    if (!result.ok) throw new Error(result.error);
    return result;
  }

  it('stores only the recovery digest, never the issued code', async () => {
    const created = await registeredAccount();
    const raw = credentials.get(`adl.auth.cred.${created.account.id}`)!;
    const stored = JSON.parse(raw) as StoredCredential;
    expect(stored.recoveryHash).toHaveLength(64);
    expect(raw).not.toContain(created.recoveryCode);
    expect(stored.recoverySalt).not.toBe(stored.salt);
  });

  it('resets the password without changing the account or its ledger', async () => {
    const created = await registeredAccount();
    const ledgerKey = `adl.u.${created.account.id}.prayerLog.v1`;
    await AsyncStorage.setItem(ledgerKey, '{"prayers":5}');
    const result = await resetPasswordWithCode(
      email,
      formatRecoveryCode(created.recoveryCode),
      nextPassword,
    );
    expect(result.ok).toBe(true);
    expect(await verify(email, nextPassword)).toEqual(created.account);
    expect(await verify(email, originalPassword)).toBeNull();
    expect(await AsyncStorage.getItem(ledgerKey)).toBe('{"prayers":5}');
  });

  it('consumes the old code and accepts only the replacement', async () => {
    const created = await registeredAccount();
    const reset = await resetPasswordWithCode(email, created.recoveryCode, nextPassword);
    if (!reset.ok) throw new Error(reset.error);
    expect(reset.recoveryCode).not.toBe(created.recoveryCode);
    expect((await resetPasswordWithCode(email, created.recoveryCode, originalPassword)).ok).toBe(
      false,
    );
    expect(
      (await resetPasswordWithCode(email, reset.recoveryCode.toLowerCase(), originalPassword)).ok,
    ).toBe(true);
  });

  it('keeps recovery usable after a normal password change', async () => {
    const created = await registeredAccount();
    expect((await changePassword(created.account.id, originalPassword, nextPassword)).ok).toBe(
      true,
    );
    expect((await resetPasswordWithCode(email, created.recoveryCode, 'third-password')).ok).toBe(
      true,
    );
    expect((await verify(email, 'third-password'))?.id).toBe(created.account.id);
  });

  it('preserves a recovery hash created with a different work factor', async () => {
    const created = await registeredAccount();
    const credentialKey = `adl.auth.cred.${created.account.id}`;
    const stored = JSON.parse(credentials.get(credentialKey)!) as StoredCredential;
    stored.iterations = 1000;
    stored.hash = await hashPassword(originalPassword, stored.salt, 1000);
    stored.recoveryHash = await hashPassword(
      normalizeRecoveryCode(created.recoveryCode),
      stored.recoverySalt!,
      1000,
    );
    delete stored.recoveryIterations;
    credentials.set(credentialKey, JSON.stringify(stored));
    await changePassword(created.account.id, originalPassword, nextPassword);
    expect((await resetPasswordWithCode(email, created.recoveryCode, 'third-password')).ok).toBe(
      true,
    );
  });

  it('rejects a weak new password without consuming the recovery code', async () => {
    const created = await registeredAccount();
    expect((await resetPasswordWithCode(email, created.recoveryCode, 'short')).ok).toBe(false);
    expect((await verify(email, originalPassword))?.id).toBe(created.account.id);
    expect((await resetPasswordWithCode(email, created.recoveryCode, nextPassword)).ok).toBe(true);
  });

  it('rejects another account code without altering credentials', async () => {
    const created = await registeredAccount();
    const other = await createAccount('Other Account', 'other@example.com', originalPassword);
    if (!other.ok) throw new Error(other.error);
    expect((await resetPasswordWithCode(email, other.recoveryCode, nextPassword)).ok).toBe(false);
    expect((await verify(email, originalPassword))?.id).toBe(created.account.id);
  });

  it('does not claim success if the keychain write fails', async () => {
    const created = await registeredAccount();
    jest.mocked(SecureStore.setItemAsync).mockRejectedValueOnce(new Error('Keychain unavailable'));
    await expect(resetPasswordWithCode(email, created.recoveryCode, nextPassword)).rejects.toThrow(
      'Keychain unavailable',
    );
    expect((await verify(email, originalPassword))?.id).toBe(created.account.id);
    expect((await resetPasswordWithCode(email, created.recoveryCode, nextPassword)).ok).toBe(true);
  });

  it('accepts only one simultaneous use of a recovery code', async () => {
    const created = await registeredAccount();
    const results = await Promise.all([
      resetPasswordWithCode(email, created.recoveryCode, nextPassword),
      resetPasswordWithCode(email, created.recoveryCode, 'competing-password'),
    ]);
    expect(results.filter((result) => result.ok)).toHaveLength(1);
  });

  it('returns the same rejection for unknown, wrong-code, and code-less accounts', async () => {
    const created = await registeredAccount();
    const unknown = await resetPasswordWithCode(
      'unknown@example.com',
      created.recoveryCode,
      nextPassword,
    );
    const wrong = await resetPasswordWithCode(email, '!invalid!', nextPassword);
    const credentialKey = `adl.auth.cred.${created.account.id}`;
    const stored = JSON.parse(credentials.get(credentialKey)!) as StoredCredential;
    delete stored.recoveryHash;
    delete stored.recoverySalt;
    credentials.set(credentialKey, JSON.stringify(stored));
    expect(await resetPasswordWithCode(email, created.recoveryCode, nextPassword)).toEqual(unknown);
    expect(wrong).toEqual(unknown);
  });
});
