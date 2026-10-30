/**
 * useNamesProgress — the persisted state behind al-Asmāʾ al-Ḥusnā (F21).
 *
 * Remembers which names the user has marked memorised and which are favourited.
 * Stores only ids; the corpus itself is static content.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '../lib/scopedStorage';

const STORE_KEY = 'adl.names.v1';

type NamesState = { memorisedIds: string[]; favouriteIds: string[] };

function fresh(): NamesState {
  return { memorisedIds: [], favouriteIds: [] };
}

export type UseNamesProgress = {
  ready: boolean;
  memorised: Set<string>;
  favourites: Set<string>;
  isMemorised: (id: string) => boolean;
  isFavourite: (id: string) => boolean;
  toggleMemorised: (id: string) => void;
  toggleFavourite: (id: string) => void;
  reset: () => void;
};

function persist(s: NamesState): void {
  AsyncStorage.setItem(STORE_KEY, JSON.stringify(s)).catch(() => {});
}

function withId(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export default function useNamesProgress(): UseNamesProgress {
  const [state, setState] = useState<NamesState>(fresh);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as Partial<NamesState>;
          setState({
            memorisedIds: Array.isArray(parsed.memorisedIds) ? parsed.memorisedIds : [],
            favouriteIds: Array.isArray(parsed.favouriteIds) ? parsed.favouriteIds : [],
          });
        }
      } catch {
        // fall back to a fresh slate
      }
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const update = useCallback((next: NamesState) => {
    setState(next);
    persist(next);
  }, []);

  const toggleMemorised = useCallback(
    (id: string) =>
      setState((prev) => {
        const next = { ...prev, memorisedIds: withId(prev.memorisedIds, id) };
        persist(next);
        return next;
      }),
    [],
  );

  const toggleFavourite = useCallback(
    (id: string) =>
      setState((prev) => {
        const next = { ...prev, favouriteIds: withId(prev.favouriteIds, id) };
        persist(next);
        return next;
      }),
    [],
  );

  const memorised = useMemo(() => new Set(state.memorisedIds), [state.memorisedIds]);
  const favourites = useMemo(() => new Set(state.favouriteIds), [state.favouriteIds]);

  return {
    ready,
    memorised,
    favourites,
    isMemorised: (id) => memorised.has(id),
    isFavourite: (id) => favourites.has(id),
    toggleMemorised,
    toggleFavourite,
    reset: () => update(fresh()),
  };
}
