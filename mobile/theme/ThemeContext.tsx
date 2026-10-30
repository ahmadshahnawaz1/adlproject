/**
 * theme/ThemeContext.tsx — the app-wide theme provider (F17).
 *
 * It owns the user's appearance preferences — colour-scheme mode (system /
 * light / dark), a high-contrast switch, and a dynamic-type multiplier — resolves
 * them against the live OS colour scheme, and exposes the effective palette
 * through `useTheme()`. Components turn a `(colors) => StyleSheet.create(...)`
 * factory into a live stylesheet with `useThemedStyles()`, which rebuilds only
 * when the palette changes.
 *
 * Preferences persist under `adl.theme.v1`. Until the saved value loads, the
 * provider renders against the system default so there is never a flash of the
 * wrong theme.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Appearance, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  resolvePalette,
  type ColorScheme,
  type ThemeColors,
} from './palettes';
import {
  clampTextScale,
  DEFAULT_TEXT_SCALE,
  scaleFont as scaleFontValue,
} from './typeScale';

export type { ThemeColors } from './palettes';

const STORE_KEY = 'adl.theme.v1';

/** How the colour scheme is chosen. */
export type ThemeMode = 'system' | 'light' | 'dark';

export type ThemePrefs = {
  mode: ThemeMode;
  highContrast: boolean;
  textScale: number;
};

const DEFAULT_PREFS: ThemePrefs = {
  mode: 'system',
  highContrast: false,
  textScale: DEFAULT_TEXT_SCALE,
};

export type ThemeContextValue = {
  /** The effective palette to render against. */
  colors: ThemeColors;
  /** The chosen mode (may be 'system'). */
  mode: ThemeMode;
  /** The effective scheme actually rendered ('light' | 'dark'). */
  scheme: ColorScheme;
  /** Convenience flag: scheme === 'dark'. */
  isDark: boolean;
  /** Whether the high-contrast variant is active. */
  highContrast: boolean;
  /** The dynamic-type multiplier. */
  textScale: number;
  /** Whether the saved preferences have loaded. */
  ready: boolean;
  setMode: (mode: ThemeMode) => void;
  setHighContrast: (on: boolean) => void;
  setTextScale: (scale: number) => void;
  /** Scale a font size by the active text-scale multiplier. */
  scaleFont: (size: number) => number;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function persist(prefs: ThemePrefs): void {
  AsyncStorage.setItem(STORE_KEY, JSON.stringify(prefs)).catch(() => {});
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<ThemePrefs>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);
  const [systemScheme, setSystemScheme] = useState<ColorScheme>(
    Appearance.getColorScheme() === 'light' ? 'light' : 'dark',
  );

  // Track the OS colour scheme so 'system' mode follows it live.
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === 'light' ? 'light' : 'dark');
    });
    return () => sub.remove();
  }, []);

  // Load saved preferences once.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as Partial<ThemePrefs>;
          setPrefs({
            mode: parsed.mode === 'light' || parsed.mode === 'dark' ? parsed.mode : 'system',
            highContrast: !!parsed.highContrast,
            textScale: clampTextScale(parsed.textScale ?? DEFAULT_TEXT_SCALE),
          });
        }
      } catch {
        // Fall back to defaults.
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const update = useCallback((patch: Partial<ThemePrefs>) => {
    setPrefs((prev) => {
      const next: ThemePrefs = { ...prev, ...patch };
      if (patch.textScale != null) next.textScale = clampTextScale(patch.textScale);
      persist(next);
      return next;
    });
  }, []);

  const setMode = useCallback((mode: ThemeMode) => update({ mode }), [update]);
  const setHighContrast = useCallback((on: boolean) => update({ highContrast: on }), [update]);
  const setTextScale = useCallback((scale: number) => update({ textScale: scale }), [update]);

  const scheme: ColorScheme = prefs.mode === 'system' ? systemScheme : prefs.mode;
  const colors = useMemo(
    () => resolvePalette(scheme, prefs.highContrast),
    [scheme, prefs.highContrast],
  );

  const scaleFont = useCallback(
    (size: number) => scaleFontValue(size, prefs.textScale),
    [prefs.textScale],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors,
      mode: prefs.mode,
      scheme,
      isDark: scheme === 'dark',
      highContrast: prefs.highContrast,
      textScale: prefs.textScale,
      ready,
      setMode,
      setHighContrast,
      setTextScale,
      scaleFont,
    }),
    [colors, prefs.mode, prefs.highContrast, prefs.textScale, scheme, ready, setMode, setHighContrast, setTextScale, scaleFont],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Read the active theme. Outside a provider it falls back to the dark palette,
 * so isolated previews and tests still render sensibly.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  // Provider-less fallback: the original dark palette, no scaling.
  const colors = resolvePalette('dark', false);
  return {
    colors,
    mode: 'dark',
    scheme: 'dark',
    isDark: true,
    highContrast: false,
    textScale: DEFAULT_TEXT_SCALE,
    ready: true,
    setMode: () => {},
    setHighContrast: () => {},
    setTextScale: () => {},
    scaleFont: (size: number) => size,
  };
}

/**
 * Turn a `(colors) => StyleSheet.create({...})` factory into a live stylesheet
 * that rebuilds only when the palette changes. The factory is expected to be a
 * stable, module-scope function.
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (colors: ThemeColors) => T,
): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [factory, colors]);
}
