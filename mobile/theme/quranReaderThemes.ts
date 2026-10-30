/**
 * Reader themes for the Qurʾān reader (F7, Phase 4).
 *
 * These are *reader-local* palettes — they recolor the muṣḥaf surface only and
 * never touch the rest of the app. `midnight` is the default and matches the
 * global OLED palette exactly, so the reader looks unchanged until the user
 * opts into another theme.
 */

export type ReaderThemeKey =
  | 'midnight'
  | 'slate'
  | 'sepia'
  | 'paper'
  | 'emerald';

export interface ReaderTheme {
  key: ReaderThemeKey;
  /** Short display name shown in the picker. */
  label: string;
  /** Whether this is a dark theme (drives the status-bar style). */
  dark: boolean;
  /** Page background. */
  bg: string;
  /** Raised surfaces (medallion strip backgrounds, chips). */
  surface: string;
  /** Primary Arabic / body text. */
  text: string;
  /** Translation text. */
  muted: string;
  /** Transliteration / least-prominent text. */
  subtle: string;
  /** Accent (medallion star, active states). */
  accent: string;
  /** Text/icon drawn on top of an accent fill. */
  accentText: string;
  /** Hairline dividers. */
  border: string;
  /** Selected-ayah highlight fill. */
  selection: string;
}

export const READER_THEMES: Record<ReaderThemeKey, ReaderTheme> = {
  midnight: {
    key: 'midnight',
    label: 'Midnight',
    dark: true,
    bg: '#000000',
    surface: '#09090B',
    text: '#FAFAFA',
    muted: '#A1A1AA',
    subtle: '#71717A',
    accent: '#FFD60A',
    accentText: '#000000',
    border: '#27272A',
    selection: 'rgba(255,214,10,0.14)',
  },
  slate: {
    key: 'slate',
    label: 'Slate',
    dark: true,
    bg: '#0B1220',
    surface: '#131C2E',
    text: '#E8EDF6',
    muted: '#9FB0C6',
    subtle: '#6B7C95',
    accent: '#7DD3FC',
    accentText: '#04121F',
    border: '#1E293B',
    selection: 'rgba(125,211,252,0.14)',
  },
  emerald: {
    key: 'emerald',
    label: 'Emerald',
    dark: true,
    bg: '#04140E',
    surface: '#0A2018',
    text: '#E6F4ED',
    muted: '#97BBAA',
    subtle: '#5E8975',
    accent: '#34D399',
    accentText: '#03130D',
    border: '#15352A',
    selection: 'rgba(52,211,153,0.14)',
  },
  sepia: {
    key: 'sepia',
    label: 'Sepia',
    dark: false,
    bg: '#F4ECD8',
    surface: '#ECE2C6',
    text: '#3A2E18',
    muted: '#6E5D3C',
    subtle: '#94815B',
    accent: '#A2741A',
    accentText: '#FFF7E6',
    border: '#DCCEA8',
    selection: 'rgba(162,116,26,0.16)',
  },
  paper: {
    key: 'paper',
    label: 'Paper',
    dark: false,
    bg: '#FFFFFF',
    surface: '#F4F4F5',
    text: '#18181B',
    muted: '#52525B',
    subtle: '#8A8A93',
    accent: '#A16207',
    accentText: '#FFFFFF',
    border: '#E4E4E7',
    selection: 'rgba(161,98,7,0.12)',
  },
};

/** Ordered list for the theme picker. */
export const READER_THEME_LIST: readonly ReaderTheme[] = [
  READER_THEMES.midnight,
  READER_THEMES.slate,
  READER_THEMES.emerald,
  READER_THEMES.sepia,
  READER_THEMES.paper,
];

/** The default reader theme key (matches the global OLED palette). */
export const DEFAULT_READER_THEME: ReaderThemeKey = 'midnight';

/** Resolve a theme key to its palette, falling back to the default. */
export function getReaderTheme(key: string | null | undefined): ReaderTheme {
  return (
    READER_THEMES[(key as ReaderThemeKey) ?? DEFAULT_READER_THEME] ??
    READER_THEMES[DEFAULT_READER_THEME]
  );
}
