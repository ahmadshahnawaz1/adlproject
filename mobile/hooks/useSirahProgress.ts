/**
 * useSirahProgress — the persisted state behind the Sīrah journey (F20).
 *
 * Remembers which events have been read, which are bookmarked, and the last one
 * opened (to resume). Stores only ids; the corpus itself is static content.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '../lib/scopedStorage';

const STORE_KEY = 'adl.sirah.v1';

type SirahState = { readIds: string[]; bookmarkIds: string[]; lastEventId: string | null };

function fresh(): SirahState {
  return { readIds: [], bookmarkIds: [], lastEventId: null };
}

export type UseSirahProgress = {
  ready: boolean;
  readEvents: Set<string>;
  bookmarks: Set<string>;
  lastEventId: string | null;
  isRead: (id: string) => boolean;
  isBookmarked: (id: string) => boolean;
  markRead: (id: string) => void;
  toggleBookmark: (id: string) => void;
  reset: () => void;
};

function persist(s: SirahState): void {
  AsyncStorage.setItem(STORE_KEY, JSON.stringify(s)).catch(() => {});
}

function withId(list: string[], id: string, present: boolean): string[] {
  const has = list.includes(id);
  if (present === has) return list;
  return present ? [...list, id] : list.filter((x) => x !== id);
}

export default function useSirahProgress(): UseSirahProgress {
  const [state, setState] = useState<SirahState>(fresh);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as Partial<SirahState>;
          setState({
            readIds: Array.isArray(parsed.readIds) ? parsed.readIds : [],
            bookmarkIds: Array.isArray(parsed.bookmarkIds) ? parsed.bookmarkIds : [],
            lastEventId: typeof parsed.lastEventId === 'string' ? parsed.lastEventId : null,
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

  const markRead = useCallback((id: string) => {
    setState((prev) => {
      const readIds = withId(prev.readIds, id, true);
      const next = { ...prev, readIds, lastEventId: id };
      persist(next);
      return next;
    });
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setState((prev) => {
      const bookmarkIds = withId(prev.bookmarkIds, id, !prev.bookmarkIds.includes(id));
      const next = { ...prev, bookmarkIds };
      persist(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, readIds: [], bookmarkIds: [] };
      persist(next);
      return next;
    });
  }, []);

  const readEvents = useMemo(() => new Set(state.readIds), [state.readIds]);
  const bookmarks = useMemo(() => new Set(state.bookmarkIds), [state.bookmarkIds]);

  return {
    ready,
    readEvents,
    bookmarks,
    lastEventId: state.lastEventId,
    isRead: useCallback((id: string) => readEvents.has(id), [readEvents]),
    isBookmarked: useCallback((id: string) => bookmarks.has(id), [bookmarks]),
    markRead,
    toggleBookmark,
    reset,
  };
}
