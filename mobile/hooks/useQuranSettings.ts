/**
 * useQuranSettings — reader display preferences as live React state.
 *
 * Controls the Arabic typeface and size, line spacing, the reader theme, the
 * transliteration / translation / word-by-word layers, which translations are
 * stacked (multi-select), and the active tafsīr. Every mutation writes through
 * to storage. v1 settings are migrated forward on first load.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_TRANSLATION_ID, DEFAULT_TAFSIR_ID } from '../content/quran';
import {
  DEFAULT_READER_THEME,
  READER_THEMES,
  type ReaderThemeKey,
} from '../theme/quranReaderThemes';

const SETTINGS_KEY = 'adl.quran.settings.v2';
const LEGACY_V1_KEY = 'adl.quran.settings.v1';

export type ArabicFont = 'amiri' | 'scheherazade';

export const MIN_ARABIC_FONT = 22;
export const MAX_ARABIC_FONT = 46;
export const ARABIC_FONT_STEP = 2;

export const MIN_LINE_SPACING = 0.9;
export const MAX_LINE_SPACING = 1.5;
export const LINE_SPACING_STEP = 0.1;

export type QuranSettings = {
  arabicFont: ArabicFont;
  arabicFontSize: number;
  lineSpacing: number;
  showTransliteration: boolean;
  showTranslation: boolean;
  showWordByWord: boolean;
  /** Selected translation editions, stacked in order. May be empty. */
  translationIds: string[];
  readerTheme: ReaderThemeKey;
  /** Active tafsīr edition slug. */
  tafsirId: string;
};

export const DEFAULT_SETTINGS: QuranSettings = {
  arabicFont: 'amiri',
  arabicFontSize: 30,
  lineSpacing: 1,
  showTransliteration: false,
  showTranslation: true,
  showWordByWord: false,
  translationIds: [DEFAULT_TRANSLATION_ID],
  readerTheme: DEFAULT_READER_THEME,
  tafsirId: DEFAULT_TAFSIR_ID,
};

function clampFont(size: number): number {
  return Math.min(MAX_ARABIC_FONT, Math.max(MIN_ARABIC_FONT, Math.round(size)));
}

function clampSpacing(value: number): number {
  const rounded = Math.round(value * 10) / 10;
  return Math.min(MAX_LINE_SPACING, Math.max(MIN_LINE_SPACING, rounded));
}

/** Coerce a parsed blob into clean settings, dropping anything malformed. */
function sanitize(raw: unknown): Partial<QuranSettings> {
  const v = (raw ?? {}) as Record<string, unknown>;
  const out: Partial<QuranSettings> = {};
  if (v.arabicFont === 'amiri' || v.arabicFont === 'scheherazade') {
    out.arabicFont = v.arabicFont;
  }
  if (typeof v.arabicFontSize === 'number') {
    out.arabicFontSize = clampFont(v.arabicFontSize);
  }
  if (typeof v.lineSpacing === 'number') {
    out.lineSpacing = clampSpacing(v.lineSpacing);
  }
  if (typeof v.showTransliteration === 'boolean') {
    out.showTransliteration = v.showTransliteration;
  }
  if (typeof v.showTranslation === 'boolean') {
    out.showTranslation = v.showTranslation;
  }
  if (typeof v.showWordByWord === 'boolean') {
    out.showWordByWord = v.showWordByWord;
  }
  if (Array.isArray(v.translationIds)) {
    const ids = v.translationIds.filter(
      (x): x is string => typeof x === 'string',
    );
    out.translationIds = Array.from(new Set(ids));
  } else if (typeof v.translationId === 'string') {
    // v1 → v2: a single translation becomes a one-item list.
    out.translationIds = [v.translationId];
  }
  if (typeof v.readerTheme === 'string' && v.readerTheme in READER_THEMES) {
    out.readerTheme = v.readerTheme as ReaderThemeKey;
  }
  if (typeof v.tafsirId === 'string') out.tafsirId = v.tafsirId;
  return out;
}

export type UseQuranSettings = {
  settings: QuranSettings;
  ready: boolean;
  setArabicFont: (font: ArabicFont) => void;
  setArabicFontSize: (size: number) => void;
  increaseFont: () => void;
  decreaseFont: () => void;
  setLineSpacing: (value: number) => void;
  increaseLineSpacing: () => void;
  decreaseLineSpacing: () => void;
  toggleTransliteration: () => void;
  toggleTranslation: () => void;
  toggleWordByWord: () => void;
  toggleTranslationId: (id: string) => void;
  setReaderTheme: (key: ReaderThemeKey) => void;
  setTafsirId: (id: string) => void;
  reset: () => void;
};

export default function useQuranSettings(): UseQuranSettings {
  const [settings, setSettings] = useState<QuranSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (raw) {
          if (alive) {
            setSettings({ ...DEFAULT_SETTINGS, ...sanitize(JSON.parse(raw)) });
          }
        } else {
          const legacy = await AsyncStorage.getItem(LEGACY_V1_KEY);
          if (legacy) {
            const migrated = {
              ...DEFAULT_SETTINGS,
              ...sanitize(JSON.parse(legacy)),
            };
            if (alive) setSettings(migrated);
            AsyncStorage.setItem(
              SETTINGS_KEY,
              JSON.stringify(migrated),
            ).catch(() => {});
            AsyncStorage.removeItem(LEGACY_V1_KEY).catch(() => {});
          }
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

  const persist = useCallback(
    (updater: (prev: QuranSettings) => QuranSettings) => {
      setSettings((prev) => {
        const next = updater(prev);
        AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );

  const setArabicFont = useCallback(
    (arabicFont: ArabicFont) => persist((prev) => ({ ...prev, arabicFont })),
    [persist],
  );

  const setArabicFontSize = useCallback(
    (size: number) =>
      persist((prev) => ({ ...prev, arabicFontSize: clampFont(size) })),
    [persist],
  );

  const increaseFont = useCallback(
    () =>
      persist((prev) => ({
        ...prev,
        arabicFontSize: clampFont(prev.arabicFontSize + ARABIC_FONT_STEP),
      })),
    [persist],
  );

  const decreaseFont = useCallback(
    () =>
      persist((prev) => ({
        ...prev,
        arabicFontSize: clampFont(prev.arabicFontSize - ARABIC_FONT_STEP),
      })),
    [persist],
  );

  const toggleTransliteration = useCallback(
    () =>
      persist((prev) => ({
        ...prev,
        showTransliteration: !prev.showTransliteration,
      })),
    [persist],
  );

  const toggleTranslation = useCallback(
    () =>
      persist((prev) => ({ ...prev, showTranslation: !prev.showTranslation })),
    [persist],
  );

  const toggleTranslationId = useCallback(
    (id: string) =>
      persist((prev) => {
        const has = prev.translationIds.includes(id);
        const translationIds = has
          ? prev.translationIds.filter((x) => x !== id)
          : [...prev.translationIds, id];
        return {
          ...prev,
          translationIds,
          // Reveal the layer when adding a translation.
          showTranslation: has ? prev.showTranslation : true,
        };
      }),
    [persist],
  );

  const toggleWordByWord = useCallback(
    () =>
      persist((prev) => ({ ...prev, showWordByWord: !prev.showWordByWord })),
    [persist],
  );

  const setReaderTheme = useCallback(
    (readerTheme: ReaderThemeKey) =>
      persist((prev) => ({ ...prev, readerTheme })),
    [persist],
  );

  const setTafsirId = useCallback(
    (tafsirId: string) => persist((prev) => ({ ...prev, tafsirId })),
    [persist],
  );

  const setLineSpacing = useCallback(
    (value: number) =>
      persist((prev) => ({ ...prev, lineSpacing: clampSpacing(value) })),
    [persist],
  );

  const increaseLineSpacing = useCallback(
    () =>
      persist((prev) => ({
        ...prev,
        lineSpacing: clampSpacing(prev.lineSpacing + LINE_SPACING_STEP),
      })),
    [persist],
  );

  const decreaseLineSpacing = useCallback(
    () =>
      persist((prev) => ({
        ...prev,
        lineSpacing: clampSpacing(prev.lineSpacing - LINE_SPACING_STEP),
      })),
    [persist],
  );

  const reset = useCallback(() => persist(() => DEFAULT_SETTINGS), [persist]);

  return useMemo(
    () => ({
      settings,
      ready,
      setArabicFont,
      setArabicFontSize,
      increaseFont,
      decreaseFont,
      setLineSpacing,
      increaseLineSpacing,
      decreaseLineSpacing,
      toggleTransliteration,
      toggleTranslation,
      toggleWordByWord,
      toggleTranslationId,
      setReaderTheme,
      setTafsirId,
      reset,
    }),
    [
      settings,
      ready,
      setArabicFont,
      setArabicFontSize,
      increaseFont,
      decreaseFont,
      setLineSpacing,
      increaseLineSpacing,
      decreaseLineSpacing,
      toggleTransliteration,
      toggleTranslation,
      toggleWordByWord,
      toggleTranslationId,
      setReaderTheme,
      setTafsirId,
      reset,
    ],
  );
}
