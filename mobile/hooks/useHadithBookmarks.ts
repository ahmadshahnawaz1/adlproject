/**
 * useHadithBookmarks — the reader's saved narrations (F18).
 *
 * A most-recent-first list of hadith ids in AsyncStorage, with a parallel Set
 * for O(1) lookups. Ids are unique across collections (e.g. "nawawi-1",
 * "bukhari-1"), so a bare id is enough.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '../lib/scopedStorage';

const STORE_KEY = 'adl.hadith.bookmarks.v1';

export type UseHadithBookmarks = {
  ids: string[];
  ready: boolean;
  isBookmarked: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clearAll: () => void;
};

export default function useHadithBookmarks(): UseHadithBookmarks {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  const persist = useCallback((next: string[]) => {
    AsyncStorage.setItem(STORE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setIds(parsed.filter((x) => typeof x === 'string'));
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

  const set = useMemo(() => new Set(ids), [ids]);

  const toggle = useCallback(
    (id: string) => {
      setIds((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const remove = useCallback(
    (id: string) => {
      setIds((prev) => {
        if (!prev.includes(id)) return prev;
        const next = prev.filter((x) => x !== id);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const clearAll = useCallback(() => {
    setIds([]);
    persist([]);
  }, [persist]);

  const isBookmarked = useCallback((id: string) => set.has(id), [set]);

  return { ids, ready, isBookmarked, toggle, remove, clearAll };
}
