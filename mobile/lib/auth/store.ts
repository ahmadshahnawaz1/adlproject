/**
 * lib/auth/store — the local-first auth "backend": account records in
 * AsyncStorage, salted password digests in the device keychain (expo-secure-
 * store), and the current session id. Native; not imported by tests. The small
 * async surface is designed to be swapped for a remote API later.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { hashPassword, legacyHashPassword, makeSalt, PBKDF2_ITERATIONS } from './crypto';
import {
  codeFromBytes,
  isWellFormedRecoveryCode,
  normalizeRecoveryCode,
  CODE_LENGTH,
} from './recovery';
import * as Crypto from 'expo-crypto';
import { avatarColorFor, normalizeEmail } from './validation';
import { purgeUserData } from '../scopeMigration';
import { clearAllKeys } from '../ai/secureKey';
import type { Account, StoredCredential } from './types';

const ACCOUNTS_KEY = 'adl.auth.accounts.v1';
const SESSION_KEY = 'adl.auth.session.v1';
const credKey = (id: string): string => `adl.auth.cred.${id}`;
const credentialOperations = new Map<string, Promise<unknown>>();

async function withCredentialLock<Result>(
  id: string,
  operation: () => Promise<Result>,
): Promise<Result> {
  const pending = credentialOperations.get(id) ?? Promise.resolve();
  const current = pending.catch(() => undefined).then(operation);
  credentialOperations.set(id, current);
  try {
    return await current;
  } finally {
    if (credentialOperations.get(id) === current) credentialOperations.delete(id);
  }
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listAccounts(): Promise<Account[]> {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as Account[]) : [];
  } catch {
    return [];
  }
}

async function saveAccounts(list: Account[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
  } catch {
    // best-effort
  }
}

export async function findByEmail(email: string): Promise<Account | undefined> {
  const e = normalizeEmail(email);
  return (await listAccounts()).find((a) => a.email === e);
}

export async function getAccount(id: string): Promise<Account | undefined> {
  return (await listAccounts()).find((a) => a.id === id);
}

async function setCredential(id: string, cred: StoredCredential): Promise<void> {
  await SecureStore.setItemAsync(credKey(id), JSON.stringify(cred));
}

async function getCredential(id: string): Promise<StoredCredential | null> {
  try {
    const raw = await SecureStore.getItemAsync(credKey(id));
    return raw ? (JSON.parse(raw) as StoredCredential) : null;
  } catch {
    return null;
  }
}

/** Verify a password against a stored credential (current or legacy scheme). */
async function credentialMatches(cred: StoredCredential, password: string): Promise<boolean> {
  if (cred.v === 1) {
    return (
      (await hashPassword(password, cred.salt, cred.iterations ?? PBKDF2_ITERATIONS)) === cred.hash
    );
  }
  return (await legacyHashPassword(password, cred.salt)) === cred.hash;
}

export type CreateResult =
  { ok: true; account: Account; recoveryCode: string } | { ok: false; error: string };

/** A fresh code plus the digest to store against it. */
async function issueRecoveryCode(): Promise<{ code: string; salt: string; hash: string }> {
  const bytes = await Crypto.getRandomBytesAsync(CODE_LENGTH);
  const code = codeFromBytes(bytes);
  const salt = await makeSalt();
  // Hash the normalised form, which is what verification will present.
  const hash = await hashPassword(normalizeRecoveryCode(code), salt, PBKDF2_ITERATIONS);
  return { code, salt, hash };
}

export async function createAccount(
  name: string,
  email: string,
  password: string,
): Promise<CreateResult> {
  const e = normalizeEmail(email);
  if (await findByEmail(e))
    return { ok: false, error: 'An account with this email already exists.' };
  const id = newId();
  const salt = await makeSalt();
  const hash = await hashPassword(password, salt);
  const recovery = await issueRecoveryCode();
  await setCredential(id, {
    salt,
    hash,
    v: 1,
    iterations: PBKDF2_ITERATIONS,
    recoverySalt: recovery.salt,
    recoveryHash: recovery.hash,
    recoveryIterations: PBKDF2_ITERATIONS,
  });
  const account: Account = {
    id,
    name: name.trim(),
    email: e,
    createdAt: Date.now(),
    avatarColor: avatarColorFor(e),
  };
  await saveAccounts([...(await listAccounts()), account]);
  return { ok: true, account, recoveryCode: recovery.code };
}

/** Whether this account was given a recovery code when it was created. */
export async function hasRecoveryCode(email: string): Promise<boolean> {
  const account = await findByEmail(email);
  if (!account) return false;
  const cred = await getCredential(account.id);
  return Boolean(cred?.recoveryHash && cred?.recoverySalt);
}

export type ResetResult =
  { ok: true; recoveryCode: string } | { ok: false; error: string; noCodeOnAccount?: boolean };

/**
 * Reset a forgotten password using the code issued at sign-up. The code is
 * single use: a successful reset immediately issues a new one.
 */
export async function resetPasswordWithCode(
  email: string,
  code: string,
  newPassword: string,
): Promise<ResetResult> {
  if (newPassword.length < 8) {
    return { ok: false, error: 'Use a password with at least 8 characters.' };
  }
  const account = await findByEmail(email);
  const rejected: ResetResult = { ok: false, error: 'That email and recovery code do not match.' };

  if (!account || !isWellFormedRecoveryCode(code)) return rejected;
  return withCredentialLock(account.id, async () => {
    const cred = await getCredential(account.id);
    if (!cred?.recoveryHash || !cred.recoverySalt) return rejected;

    const attempt = await hashPassword(
      normalizeRecoveryCode(code),
      cred.recoverySalt,
      cred.recoveryIterations ?? cred.iterations ?? PBKDF2_ITERATIONS,
    );
    if (attempt !== cred.recoveryHash) return rejected;

    const salt = await makeSalt();
    const hash = await hashPassword(newPassword, salt);
    const next = await issueRecoveryCode();
    await setCredential(account.id, {
      salt,
      hash,
      v: 1,
      iterations: PBKDF2_ITERATIONS,
      recoverySalt: next.salt,
      recoveryHash: next.hash,
      recoveryIterations: PBKDF2_ITERATIONS,
    });
    return { ok: true, recoveryCode: next.code };
  });
}

export async function verify(email: string, password: string): Promise<Account | null> {
  const account = await findByEmail(email);
  if (!account) return null;
  return withCredentialLock(account.id, async () => {
    const cred = await getCredential(account.id);
    if (!cred || !(await credentialMatches(cred, password))) return null;
    if (cred.v !== 1) {
      const salt = await makeSalt();
      const hash = await hashPassword(password, salt);
      await setCredential(account.id, {
        ...cred,
        salt,
        hash,
        v: 1,
        iterations: PBKDF2_ITERATIONS,
        recoveryIterations: cred.recoveryIterations ?? cred.iterations ?? PBKDF2_ITERATIONS,
      });
    }
    return account;
  });
}

export async function changePassword(
  id: string,
  current: string,
  next: string,
): Promise<{ ok: boolean; error?: string }> {
  if (next.length < 8) return { ok: false, error: 'Use a password with at least 8 characters.' };
  return withCredentialLock(id, async () => {
    const cred = await getCredential(id);
    if (!cred) return { ok: false, error: 'Account not found.' };
    if (!(await credentialMatches(cred, current)))
      return { ok: false, error: 'Current password is incorrect.' };
    const salt = await makeSalt();
    const hash = await hashPassword(next, salt);
    await setCredential(id, {
      ...cred,
      salt,
      hash,
      v: 1,
      iterations: PBKDF2_ITERATIONS,
      recoveryIterations: cred.recoveryIterations ?? cred.iterations ?? PBKDF2_ITERATIONS,
    });
    return { ok: true };
  });
}

export async function updateAccount(
  id: string,
  patch: Partial<Pick<Account, 'name' | 'email' | 'avatarColor'>>,
): Promise<Account | null> {
  let updated: Account | null = null;
  const next = (await listAccounts()).map((a) => {
    if (a.id !== id) return a;
    updated = { ...a, ...patch, email: patch.email ? normalizeEmail(patch.email) : a.email };
    return updated;
  });
  await saveAccounts(next);
  return updated;
}

export async function deleteAccount(id: string): Promise<void> {
  await saveAccounts((await listAccounts()).filter((a) => a.id !== id));
  try {
    await SecureStore.deleteItemAsync(credKey(id));
    await AsyncStorage.removeItem(`adl.settings.${id}.v1`);
    await clearAllKeys(); // the current user's AI provider keys
    await purgeUserData(id); // every scoped worship ledger
  } catch {
    // best-effort
  }
}

export async function saveSession(id: string): Promise<void> {
  try {
    await AsyncStorage.setItem(SESSION_KEY, id);
  } catch {
    // best-effort
  }
}

export async function loadSession(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch {
    // best-effort
  }
}
