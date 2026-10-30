/**
 * ADL Design Tokens — the single source of truth for the non-colour design
 * language (spacing, radius, typography, fonts). shadcn/ui-inspired.
 *
 * Colours now live in theme/palettes.ts and are served live through
 * theme/ThemeContext.tsx (`useTheme().colors`), so the app can switch between
 * the dark and light themes at runtime. The `colors` export below remains as
 * the static **dark** palette for backwards compatibility — components that have
 * not yet been migrated to `useTheme()` keep rendering in the original dark
 * theme. New and migrated code should read colours from `useTheme()`.
 */
import { Platform } from 'react-native';
import { darkPalette, type ThemeColors } from './palettes';

export type { ThemeColors } from './palettes';

/** The static dark palette (back-compat alias; prefer `useTheme().colors`). */
export const colors: ThemeColors = darkPalette;

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const typography = {
  display: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  body: { fontSize: 15, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '500' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  button: { fontSize: 15, fontWeight: '600' as const },
} as const;

export const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: undefined,
});

export const arabicFont = Platform.select({
  ios: 'Geeza Pro',
  default: undefined,
});

/**
 * Bundled Qurʾān typefaces (loaded in App.tsx via expo-font). The family name
 * equals the key passed to `useFonts`, so it is identical on iOS and Android.
 */
export const quranFonts = {
  amiri: 'AmiriQuran',
  scheherazade: 'ScheherazadeNew',
} as const;

export type QuranFontKey = keyof typeof quranFonts;

/** Resolve a Qurʾān font key to its loaded font-family name. */
export function quranFontFamily(key: QuranFontKey): string {
  return quranFonts[key];
}
