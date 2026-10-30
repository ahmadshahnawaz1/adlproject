/**
 * useZakatWorksheet — the user's Zakat worksheet and settings, persisted.
 *
 * Holds two things: the amounts entered for each asset/liability (values) and
 * the configuration that shapes the ruling (settings — niṣāb standard, metal
 * prices, debt policy, madhab choices, the ḥawl date). Everything is written
 * straight through to AsyncStorage so a half-finished worksheet survives a
 * close, fully offline.
 */
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_ZAKAT_SETTINGS,
  emptyValues,
  type AssetKey,
  type ZakatSettings,
  type ZakatValues,
} from '../content/zakat/zakat';

const STORE_KEY = 'adl.zakatWorksheet.v1';

type Stored = {
  values: ZakatValues;
  settings: ZakatSettings;
};

export type UseZakatWorksheet = {
  values: ZakatValues;
  settings: ZakatSettings;
  ready: boolean;
  setValue: (key: AssetKey, value: number) => void;
  setSetting: <K extends keyof ZakatSettings>(key: K, value: ZakatSettings[K]) => void;
  resetValues: () => void;
  resetAll: () => void;
};

function persist(values: ZakatValues, settings: ZakatSettings) {
  AsyncStorage.setItem(STORE_KEY, JSON.stringify({ values, settings } satisfies Stored)).catch(() => {});
}

export default function useZakatWorksheet(): UseZakatWorksheet {
  const [values, setValues] = useState<ZakatValues>(emptyValues);
  const [settings, setSettings] = useState<ZakatSettings>(DEFAULT_ZAKAT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as Partial<Stored>;
          setValues({ ...emptyValues(), ...(parsed.values ?? {}) });
          setSettings({ ...DEFAULT_ZAKAT_SETTINGS, ...(parsed.settings ?? {}) });
        }
      } catch {
        // Fall back to empty worksheet + default settings.
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setValue = useCallback((key: AssetKey, value: number) => {
    setValues((prev) => {
      const next = { ...prev, [key]: isFinite(value) && value > 0 ? value : 0 };
      setSettings((s) => {
        persist(next, s);
        return s;
      });
      return next;
    });
  }, []);

  const setSetting = useCallback(<K extends keyof ZakatSettings>(key: K, value: ZakatSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      setValues((v) => {
        persist(v, next);
        return v;
      });
      return next;
    });
  }, []);

  const resetValues = useCallback(() => {
    const blank = emptyValues();
    setValues(blank);
    setSettings((s) => {
      persist(blank, s);
      return s;
    });
  }, []);

  const resetAll = useCallback(() => {
    const blank = emptyValues();
    setValues(blank);
    setSettings(DEFAULT_ZAKAT_SETTINGS);
    persist(blank, DEFAULT_ZAKAT_SETTINGS);
  }, []);

  return { values, settings, ready, setValue, setSetting, resetValues, resetAll };
}
