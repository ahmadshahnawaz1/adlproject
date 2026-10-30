/**
 * i18n/LocaleContext.tsx — the app-wide language provider (F14).
 *
 * Resolves the active language (a saved choice, else the device locale, else
 * English), exposes a `t()` translator with `{name}` interpolation through
 * `useT()`, and lets the user switch language via `useLocale()`. The choice
 * persists under `adl.locale.v1`. RTL layout mirroring is intentionally out of
 * scope — Arabic and Urdu render as text within the existing layout.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import {
  DEFAULT_LOCALE,
  getCatalog,
  interpolate,
  isRTLLocale,
  isSupportedLocale,
  LOCALES,
  type LocaleDef,
  type MessageKey,
  type Messages,
} from './index';

const STORE_KEY = 'adl.locale.v1';

/** Values interpolated into a message's `{placeholders}`. */
export type TParams = Record<string, string | number>;

export type LocaleContextValue = {
  /** The active locale code. */
  code: string;
  /** The registered languages, for a picker. */
  locales: LocaleDef[];
  /** Whether the saved choice has loaded. */
  ready: boolean;
  /** Whether the active language is written right-to-left. */
  isRTL: boolean;
  /** Translate a key, interpolating any `{params}`. */
  t: (key: MessageKey, params?: TParams) => string;
  /** Switch the interface language. */
  setLocale: (code: string) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

/** Pick the best supported locale from the device's preferred languages. */
function detectDeviceLocale(): string {
  try {
    for (const l of getLocales()) {
      const code = l.languageCode ?? '';
      if (isSupportedLocale(code)) return code;
    }
  } catch {
    // expo-localization unavailable — fall through.
  }
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<string>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORE_KEY);
        const next = saved && isSupportedLocale(saved) ? saved : detectDeviceLocale();
        if (alive) setCode(next);
      } catch {
        if (alive) setCode(detectDeviceLocale());
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const messages: Messages = useMemo(() => getCatalog(code), [code]);

  const t = useCallback(
    (key: MessageKey, params?: TParams) => interpolate(messages[key] ?? key, params),
    [messages],
  );

  const setLocale = useCallback((next: string) => {
    if (!isSupportedLocale(next)) return;
    setCode(next);
    AsyncStorage.setItem(STORE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ code, locales: LOCALES, ready, isRTL: isRTLLocale(code), t, setLocale }),
    [code, ready, t, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Full locale context (code, setLocale, list). */
export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (ctx) return ctx;
  // Provider-less fallback: plain English, no persistence.
  const messages = getCatalog(DEFAULT_LOCALE);
  return {
    code: DEFAULT_LOCALE,
    locales: LOCALES,
    ready: true,
    isRTL: false,
    t: (key: MessageKey, params?: TParams) => interpolate(messages[key] ?? key, params),
    setLocale: () => {},
  };
}

/** Just the translator, for components that only need `t`. */
export function useT(): (key: MessageKey, params?: TParams) => string {
  return useLocale().t;
}
