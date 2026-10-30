/**
 * AuthContext — the app's session + account state, backed by the local-first
 * auth store. Loads any saved session on launch; exposes sign up / in / out,
 * profile edits, password change, and account deletion. Swap the `store` import
 * for a remote API to move auth to a real backend.
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as store from '../lib/auth/store';
import { normalizeEmail } from '../lib/auth/validation';
import { setStorageScope } from '../lib/scopedStorage';
import { runUserScopeMigrationOnce } from '../lib/scopeMigration';
import type { Account, AuthResult, AuthStatus } from '../lib/auth/types';

type AuthValue = {
  user: Account | null;
  status: AuthStatus;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<Account, 'name' | 'email' | 'avatarColor'>>) => Promise<AuthResult>;
  changePassword: (current: string, next: string) => Promise<AuthResult>;
  deleteAccount: () => Promise<void>;
};

const AuthCtx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let alive = true;
    (async () => {
      const id = await store.loadSession();
      const account = id ? await store.getAccount(id) : undefined;
      if (!alive) return;
      if (account) {
        setStorageScope(account.id);
        await runUserScopeMigrationOnce(account.id);
        if (!alive) return;
        setUser(account);
        setStatus('signedIn');
      } else {
        setStatus('signedOut');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string): Promise<AuthResult> => {
    const res = await store.createAccount(name, email, password);
    if (!res.ok) return { ok: false, error: res.error };
    setStorageScope(res.account.id);
    await runUserScopeMigrationOnce(res.account.id);
    await store.saveSession(res.account.id);
    setUser(res.account);
    setStatus('signedIn');
    return { ok: true, recoveryCode: res.recoveryCode };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const account = await store.verify(email, password);
    if (!account) return { ok: false, error: 'Incorrect email or password.' };
    setStorageScope(account.id);
    await runUserScopeMigrationOnce(account.id);
    await store.saveSession(account.id);
    setUser(account);
    setStatus('signedIn');
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    await store.clearSession();
    setStorageScope(null);
    setUser(null);
    setStatus('signedOut');
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<Pick<Account, 'name' | 'email' | 'avatarColor'>>): Promise<AuthResult> => {
      if (!user) return { ok: false, error: 'Not signed in.' };
      if (patch.email) {
        const existing = await store.findByEmail(normalizeEmail(patch.email));
        if (existing && existing.id !== user.id) return { ok: false, error: 'That email is already in use.' };
      }
      const updated = await store.updateAccount(user.id, patch);
      if (updated) setUser(updated);
      return { ok: true };
    },
    [user],
  );

  const changePassword = useCallback(
    async (current: string, next: string): Promise<AuthResult> => {
      if (!user) return { ok: false, error: 'Not signed in.' };
      const res = await store.changePassword(user.id, current, next);
      return res.ok ? { ok: true } : { ok: false, error: res.error ?? 'Could not change password.' };
    },
    [user],
  );

  const deleteAccount = useCallback(async () => {
    if (!user) return;
    await store.deleteAccount(user.id);
    await store.clearSession();
    setStorageScope(null);
    setUser(null);
    setStatus('signedOut');
  }, [user]);

  return (
    <AuthCtx.Provider
      value={{ user, status, signUp, signIn, signOut, updateProfile, changePassword, deleteAccount }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
