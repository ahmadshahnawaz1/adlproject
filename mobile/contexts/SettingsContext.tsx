/**
 * SettingsContext — per-user app settings, persisted in AsyncStorage keyed by
 * the signed-in account. Loads on sign-in, resets on sign-out, and keeps the
 * global haptics flag in sync. Theme & language live in their own providers.
 */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { DEFAULT_SETTINGS, mergeSettings } from '../lib/settings/defaults';
import { setHapticsEnabled } from '../lib/haptics';
import type { UserSettings } from '../lib/settings/types';

const keyFor = (userId: string): string => `adl.settings.${userId}.v1`;

type SettingsValue = {
  settings: UserSettings;
  ready: boolean;
  update: <K extends keyof UserSettings>(category: K, patch: Partial<UserSettings[K]>) => void;
  reset: () => void;
};

const Ctx = createContext<SettingsValue | null>(null);

const FALLBACK_SETTINGS: SettingsValue = {
  settings: DEFAULT_SETTINGS,
  ready: true,
  update: () => {},
  reset: () => {},
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) {
        userIdRef.current = null;
        setSettings(DEFAULT_SETTINGS);
        setHapticsEnabled(DEFAULT_SETTINGS.sound.haptics);
        setReady(true);
        return;
      }
      userIdRef.current = user.id;
      setReady(false);
      let next = DEFAULT_SETTINGS;
      try {
        const raw = await AsyncStorage.getItem(keyFor(user.id));
        next = mergeSettings(raw ? JSON.parse(raw) : null);
      } catch {
        next = DEFAULT_SETTINGS;
      }
      if (!alive) return;
      setSettings(next);
      setHapticsEnabled(next.sound.haptics);
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  const write = useCallback((next: UserSettings) => {
    setHapticsEnabled(next.sound.haptics);
    const id = userIdRef.current;
    if (id) void AsyncStorage.setItem(keyFor(id), JSON.stringify(next));
  }, []);

  const update = useCallback(
    <K extends keyof UserSettings>(category: K, patch: Partial<UserSettings[K]>) => {
      setSettings((prev) => {
        const next = { ...prev, [category]: { ...prev[category], ...patch } };
        write(next);
        return next;
      });
    },
    [write],
  );

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    write(DEFAULT_SETTINGS);
  }, [write]);

  return <Ctx.Provider value={{ settings, ready, update, reset }}>{children}</Ctx.Provider>;
}

export function useSettings(): SettingsValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}

/** Settings without requiring a provider — falls back to defaults. */
export function useSettingsOptional(): SettingsValue {
  const ctx = useContext(Ctx);
  return ctx ?? FALLBACK_SETTINGS;
}
