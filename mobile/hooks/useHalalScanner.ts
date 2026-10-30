/**
 * The user's own position on the three questions the schools differ over, and
 * the products they have scanned. Both are per-user and stay on the device.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '../lib/scopedStorage';
import { DEFAULT_PREFS, type HalalPrefs, type Stance, type Verdict } from '../lib/halal/assess';
import type { StandardAxis } from '../content/halal';

const PREFS_KEY = 'adl.halal.prefs.v1';
const HISTORY_KEY = 'adl.halal.history.v1';
const HISTORY_MAX = 60;

export type ScanRecord = {
  barcode: string;
  name: string;
  brand: string;
  verdict: Verdict;
  flagCount: number;
  scannedAt: number;
};

function sanitisePrefs(raw: unknown): HalalPrefs {
  const out = { ...DEFAULT_PREFS };
  if (!raw || typeof raw !== 'object') return out;
  const v = raw as Record<string, unknown>;
  for (const axis of Object.keys(DEFAULT_PREFS) as StandardAxis[]) {
    if (v[axis] === 'accept' || v[axis] === 'avoid') out[axis] = v[axis] as Stance;
  }
  return out;
}

export default function useHalalScanner() {
  const [prefs, setPrefs] = useState<HalalPrefs>(DEFAULT_PREFS);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [p, h] = await Promise.all([
          AsyncStorage.getItem(PREFS_KEY),
          AsyncStorage.getItem(HISTORY_KEY),
        ]);
        if (!alive) return;
        if (p) setPrefs(sanitisePrefs(JSON.parse(p)));
        if (h) {
          const parsed = JSON.parse(h);
          if (Array.isArray(parsed)) setHistory(parsed as ScanRecord[]);
        }
      } catch {
        // Corrupt storage falls back to the cautious defaults.
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setStance = useCallback((axis: StandardAxis, stance: Stance) => {
    setPrefs((prev) => {
      const next = { ...prev, [axis]: stance };
      void AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleStance = useCallback((axis: StandardAxis) => {
    setPrefs((prev) => {
      const next = { ...prev, [axis]: prev[axis] === 'accept' ? 'avoid' : 'accept' } as HalalPrefs;
      void AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remember = useCallback((record: ScanRecord) => {
    setHistory((prev) => {
      const next = [record, ...prev.filter((r) => r.barcode !== record.barcode)].slice(0, HISTORY_MAX);
      void AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    void AsyncStorage.removeItem(HISTORY_KEY);
  }, []);

  const relaxedCount = useMemo(
    () => Object.values(prefs).filter((s) => s === 'accept').length,
    [prefs],
  );

  return { prefs, setStance, toggleStance, history, remember, clearHistory, ready, relaxedCount };
}
