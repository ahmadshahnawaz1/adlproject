/**
 * theme/palettes.ts — the colour palettes behind the app's themes (F17).
 *
 * The app ships a dark theme (the original OLED palette) and a light theme, each
 * with an optional high-contrast variant. Every palette implements the same
 * `ThemeColors` shape — the sixteen colour tokens the whole app is built on — so
 * a component written against `ThemeColors` renders correctly under any of them.
 *
 * The non-colour tokens (spacing, radius, typography, fonts) are theme-agnostic
 * and continue to live in theme/tokens.ts.
 */

/** The sixteen colour tokens every palette must provide. */
export type ThemeColors = {
  background: string;
  card: string;
  cardElevated: string;
  border: string;
  borderFocus: string;
  input: string;
  foreground: string;
  mutedForeground: string;
  subtleForeground: string;
  primary: string;
  primaryForeground: string;
  ring: string;
  destructive: string;
  success: string;
  white: string;
};

/** The original OLED dark palette — Apple-yellow accent on true black. */
export const darkPalette: ThemeColors = {
  background: '#000000',
  card: '#09090B',
  cardElevated: '#0C0C0F',
  border: '#27272A',
  borderFocus: '#3F3F46',
  input: '#0A0A0C',
  foreground: '#FAFAFA',
  mutedForeground: '#A1A1AA',
  // Lifted from #71717A, which sat at 4.12:1 on card — below WCAG AA for body text.
  subtleForeground: '#8A8A94',
  primary: '#FFD60A',
  primaryForeground: '#000000',
  ring: '#FFD60A',
  destructive: '#EF4444',
  success: '#22C55E',
  white: '#FFFFFF',
};

/**
 * The light palette — a calm, paper-like surface. The accent deepens to a
 * readable gold (amber) so it carries as both a fill and as text on white, and
 * `primaryForeground` flips to white so labels sit legibly on the accent.
 */
export const lightPalette: ThemeColors = {
  background: '#F4F4F5',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  border: '#E4E4E7',
  borderFocus: '#D4D4D8',
  input: '#FFFFFF',
  foreground: '#18181B',
  mutedForeground: '#52525B',
  // Lifted from #71717A, which sat at 4.40:1 on the grey background — below AA.
  subtleForeground: '#6B6B75',
  primary: '#A16207',
  primaryForeground: '#FFFFFF',
  ring: '#A16207',
  destructive: '#DC2626',
  success: '#15803D',
  white: '#FFFFFF',
};

/** A higher-contrast dark variant — brighter borders and pure-white text. */
export const highContrastDarkPalette: ThemeColors = {
  ...darkPalette,
  card: '#0A0A0A',
  cardElevated: '#101012',
  border: '#52525B',
  borderFocus: '#71717A',
  foreground: '#FFFFFF',
  mutedForeground: '#D4D4D8',
  subtleForeground: '#A1A1AA',
};

/** A higher-contrast light variant — darker borders and near-black text. */
export const highContrastLightPalette: ThemeColors = {
  ...lightPalette,
  background: '#FFFFFF',
  border: '#A1A1AA',
  borderFocus: '#71717A',
  foreground: '#000000',
  mutedForeground: '#3F3F46',
  subtleForeground: '#52525B',
  primary: '#854D0E',
  ring: '#854D0E',
};

/** The effective colour scheme actually rendered (never 'system'). */
export type ColorScheme = 'light' | 'dark';

/** Resolve the palette for a scheme and contrast preference. */
export function resolvePalette(scheme: ColorScheme, highContrast: boolean): ThemeColors {
  if (scheme === 'light') return highContrast ? highContrastLightPalette : lightPalette;
  return highContrast ? highContrastDarkPalette : darkPalette;
}
