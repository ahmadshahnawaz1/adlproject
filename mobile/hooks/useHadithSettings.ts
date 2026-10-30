/**
 * useHadithSettings — the reader's display preferences (F18).
 *
 * Persists the authenticity filter (on by default), Arabic font size, and the
 * isnād/translation toggles under `adl.hadith.settings.v1`.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '../lib/scopedStorage';

const STORE_KEY = 'adl.hadith.settings.v1';

export const MIN_HADITH_FONT = 20;
export const MAX_HADITH_FONT = 40;
export const HADITH_FONT_STEP = 2;

export type HadithSettings = {
  /** Show only ṣaḥīḥ/ḥasan narrations. On by default — the safe stance. */
  authenticOnly: boolean;
  arabicFontSize: number;
  showTranslation: boolean;
  showIsnad: boolean;
};

const DEFAULTS: HadithSettings = {
  authenticOnly: true,
  arabicFontSize: 26,
  showTranslation: true,
  showIsnad: false,
};

function clampFont(n: number): number {
  return Math.min(MAX_HADITH_FONT, Math.max(MIN_HADITH_FONT, n));
}

export type UseHadithSettings = HadithSettings & {
  ready: boolean;
  setAuthenticOnly: (on: boolean) => void;
  toggleTranslation: () => void;
  toggleIsnad: () => void;
  increaseFont: () => void;
  decreaseFont: () => void;
};

export default function useHadithSettings(): UseHadithSettings {
  const [settings, setSettings] = useState<HadithSettings>(DEFAULTS);
  const [ready, setReady] = useState(false);

  const persist = useCallback((next: HadithSettings) => {
    AsyncStorage.setItem(STORE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as Partial<HadithSettings>;
          setSettings({
            ...DEFAULTS,
            ...parsed,
            arabicFontSize: clampFont(parsed.arabicFontSize ?? DEFAULTS.arabicFontSize),
          });
        }
      } catch {
        // defaults
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const update = useCallback(
    (patch: Partial<HadithSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        if (patch.arabicFontSize != null) next.arabicFontSize = clampFont(patch.arabicFontSize);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  return useMemo(
    () => ({
      ...settings,
      ready,
      setAuthenticOnly: (on: boolean) => update({ authenticOnly: on }),
      toggleTranslation: () => update({ showTranslation: !settings.showTranslation }),
      toggleIsnad: () => update({ showIsnad: !settings.showIsnad }),
      increaseFont: () => update({ arabicFontSize: settings.arabicFontSize + HADITH_FONT_STEP }),
      decreaseFont: () => update({ arabicFontSize: settings.arabicFontSize - HADITH_FONT_STEP }),
    }),
    [settings, ready, update],
  );
}
