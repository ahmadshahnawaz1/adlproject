/**
 * useQuranBookmarks — saved ayahs as live React state.
 *
 * Bookmarks are kept most-recent-first. A parallel Set of "surah:ayah" keys
 * keeps membership checks O(1). Every mutation writes through to storage.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '../lib/scopedStorage';
import { ayahKey } from '../lib/quran';

const BOOKMARKS_KEY = 'adl.quran.bookmarks.v1';

export type Bookmark = {
  surah: number;
  ayah: number;
  /** ISO timestamp of when it was added. */
  atISO: string;
};

export type UseQuranBookmarks = {
  bookmarks: Bookmark[];
  ready: boolean;
  isBookmarked: (surah: number, ayah: number) => boolean;
  toggle: (surah: number, ayah: number) => void;
  remove: (surah: number, ayah: number) => void;
  clearAll: () => void;
};

function keysOf(list: Bookmark[]): Set<string> {
  return new Set(list.map((b) => ayahKey(b.surah, b.ayah)));
}

export default function useQuranBookmarks(): UseQuranBookmarks {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [keys, setKeys] = useState<Set<string>>(() => new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as Bookmark[];
          if (Array.isArray(parsed)) {
            setBookmarks(parsed);
            setKeys(keysOf(parsed));
          }
        }
      } catch {
        // Fall back to no bookmarks.
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const commit = useCallback((next: Bookmark[]) => {
    setBookmarks(next);
    setKeys(keysOf(next));
    AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const isBookmarked = useCallback(
    (surah: number, ayah: number) => keys.has(ayahKey(surah, ayah)),
    [keys],
  );

  const toggle = useCallback(
    (surah: number, ayah: number) => {
      const key = ayahKey(surah, ayah);
      setBookmarks((prev) => {
        const exists = prev.some((b) => ayahKey(b.surah, b.ayah) === key);
        const next = exists
          ? prev.filter((b) => ayahKey(b.surah, b.ayah) !== key)
          : [{ surah, ayah, atISO: new Date().toISOString() }, ...prev];
        setKeys(keysOf(next));
        AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );

  const remove = useCallback(
    (surah: number, ayah: number) => {
      const key = ayahKey(surah, ayah);
      commit(bookmarks.filter((b) => ayahKey(b.surah, b.ayah) !== key));
    },
    [bookmarks, commit],
  );

  const clearAll = useCallback(() => commit([]), [commit]);

  return useMemo(
    () => ({ bookmarks, ready, isBookmarked, toggle, remove, clearAll }),
    [bookmarks, ready, isBookmarked, toggle, remove, clearAll],
  );
}
