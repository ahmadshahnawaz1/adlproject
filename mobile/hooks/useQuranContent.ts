/**
 * useQuranContent — loads a surah's ayahs on demand from the bundled core.
 *
 * The 114 surah JSON files are required lazily through the generated manifest
 * and mapped into the runtime `Ayah` shape. Results are memoised in a
 * module-level cache so re-opening a surah is instant. The (synchronous but
 * heavy) require+map is deferred a tick so a loading state can paint first.
 *
 * Word-by-word data (a separate ~4.6 MB bundle) is loaded only when requested,
 * cached independently, and merged onto the ayahs so it never costs anything
 * until the reader turns the mode on.
 *
 * Downloaded translation editions (Phase 3) are merged the same way: their
 * full-Qurʾān verse index is loaded once from the native store and stitched
 * into each ayah's `translations` map keyed by edition id.
 */
import { useEffect, useMemo, useState } from 'react';
import { SURAH_FILES, WBW_FILES } from '../content/quran';
import type { Ayah, QuranWord } from '../content/quran/types';
import { verseKey, type EditionIndex } from '../lib/quranEditions';
import { getEditionIndex } from '../lib/quranEditionStore';

const cache = new Map<number, Ayah[]>();
const wbwCache = new Map<number, Map<number, QuranWord[]>>();

/** Load and cache a surah's ayahs synchronously. Returns [] if out of range. */
export function getSurahAyahs(surah: number): Ayah[] {
  const cached = cache.get(surah);
  if (cached) return cached;

  const loader = SURAH_FILES[surah];
  if (!loader) return [];

  const raw = loader();
  const ayahs: Ayah[] = raw.ayahs.map((a) => ({
    surah,
    number: a.n,
    arabic: a.arabic,
    transliteration: a.translit,
    translations: a.t,
  }));
  cache.set(surah, ayahs);
  return ayahs;
}

/** Load and cache a surah's word-by-word data, keyed by ayah number. */
export function getSurahWords(surah: number): Map<number, QuranWord[]> {
  const cached = wbwCache.get(surah);
  if (cached) return cached;

  const map = new Map<number, QuranWord[]>();
  const loader = WBW_FILES[surah];
  if (loader) {
    const raw = loader();
    for (const a of raw.ayahs) {
      map.set(
        a.n,
        a.words.map((w) => ({
          arabic: w.a,
          transliteration: w.t,
          gloss: w.g,
        })),
      );
    }
  }
  wbwCache.set(surah, map);
  return map;
}

/** Fetch a single ayah, or undefined if surah/ayah are out of range. */
export function getAyah(surah: number, ayah: number): Ayah | undefined {
  return getSurahAyahs(surah).find((a) => a.number === ayah);
}

export type UseQuranContent = {
  ayahs: Ayah[];
  loading: boolean;
};

export interface UseQuranContentOptions {
  /** Load + merge word-by-word data for this surah. */
  withWords?: boolean;
  /** Downloaded edition ids whose verse text is merged into `translations`. */
  editionIds?: string[];
}

const EMPTY_IDS: string[] = [];

export default function useQuranContent(
  surah: number,
  options: UseQuranContentOptions = {},
): UseQuranContent {
  const withWords = options.withWords ?? false;
  const editionIds = options.editionIds ?? EMPTY_IDS;
  const editionKey = editionIds.join(',');

  const [ayahs, setAyahs] = useState<Ayah[]>(() => cache.get(surah) ?? []);
  const [loading, setLoading] = useState(() => !cache.has(surah));
  const [words, setWords] = useState<Map<number, QuranWord[]> | null>(() =>
    withWords ? (wbwCache.get(surah) ?? null) : null,
  );
  const [editions, setEditions] = useState<Record<string, EditionIndex>>({});

  useEffect(() => {
    let alive = true;
    const cached = cache.get(surah);
    if (cached) {
      setAyahs(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handle = setTimeout(() => {
      const loaded = getSurahAyahs(surah);
      if (alive) {
        setAyahs(loaded);
        setLoading(false);
      }
    }, 0);

    return () => {
      alive = false;
      clearTimeout(handle);
    };
  }, [surah]);

  useEffect(() => {
    if (!withWords) {
      setWords(null);
      return;
    }
    const cached = wbwCache.get(surah);
    if (cached) {
      setWords(cached);
      return;
    }
    let alive = true;
    const handle = setTimeout(() => {
      const loaded = getSurahWords(surah);
      if (alive) setWords(loaded);
    }, 0);
    return () => {
      alive = false;
      clearTimeout(handle);
    };
  }, [surah, withWords]);

  useEffect(() => {
    if (editionIds.length === 0) return;
    let alive = true;
    (async () => {
      for (const id of editionIds) {
        try {
          const index = await getEditionIndex(id);
          if (alive && index) {
            setEditions((prev) => (prev[id] ? prev : { ...prev, [id]: index }));
          }
        } catch {
          // A missing or corrupt edition simply stays unmerged.
        }
      }
    })();
    return () => {
      alive = false;
    };
    // editionKey captures the id list identity for the dependency check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editionKey]);

  return useMemo(() => {
    const activeEditions = editionIds.filter((id) => editions[id]);
    const needsWords = withWords && words && ayahs.length > 0;
    if (!needsWords && activeEditions.length === 0) {
      return { ayahs, loading };
    }
    const merged = ayahs.map((a) => {
      let next: Ayah = a;
      if (needsWords) {
        const w = words!.get(a.number);
        if (w && w.length > 0) next = { ...next, words: w };
      }
      if (activeEditions.length > 0) {
        const translations = { ...next.translations };
        const key = verseKey(surah, a.number);
        for (const id of activeEditions) {
          const text = editions[id][key];
          if (text) translations[id] = text;
        }
        next = { ...next, translations };
      }
      return next;
    });
    return { ayahs: merged, loading };
  }, [ayahs, loading, withWords, words, editions, editionKey, surah]);
}
