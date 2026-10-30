/**
 * useQuranReader — remembers the last place read so the reader can resume.
 *
 * Stores a single "last read" position (surah + ayah + timestamp). Screens call
 * `setPosition` as the reader scrolls; the index screen offers a resume card
 * when `last` is set.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '../lib/scopedStorage';

const READER_KEY = 'adl.quran.reader.v1';

export type ReadPosition = {
  surah: number;
  ayah: number;
  /** ISO timestamp of when this position was recorded. */
  atISO: string;
};

export type UseQuranReader = {
  last: ReadPosition | null;
  ready: boolean;
  setPosition: (surah: number, ayah: number) => void;
  clear: () => void;
};

export default function useQuranReader(): UseQuranReader {
  const [last, setLast] = useState<ReadPosition | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(READER_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as Partial<ReadPosition>;
          if (
            typeof parsed.surah === 'number' &&
            typeof parsed.ayah === 'number'
          ) {
            setLast({
              surah: parsed.surah,
              ayah: parsed.ayah,
              atISO: parsed.atISO || new Date().toISOString(),
            });
          }
        }
      } catch {
        // Fall back to no resume.
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setPosition = useCallback((surah: number, ayah: number) => {
    setLast((prev) => {
      if (prev && prev.surah === surah && prev.ayah === ayah) return prev;
      const next: ReadPosition = {
        surah,
        ayah,
        atISO: new Date().toISOString(),
      };
      AsyncStorage.setItem(READER_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setLast(null);
    AsyncStorage.removeItem(READER_KEY).catch(() => {});
  }, []);

  return useMemo(
    () => ({ last, ready, setPosition, clear }),
    [last, ready, setPosition, clear],
  );
}
