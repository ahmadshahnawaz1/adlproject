/**
 * useDuaFavorites — the small persisted set of supplications a user has starred.
 *
 * It loads the saved favourites once on mount, lets the screen toggle a duʿā in
 * or out (with a soft haptic), keeps the list in catalogue order, and persists
 * every change. Unknown ids (e.g. from a future content revision) are quietly
 * dropped on load so the list stays valid.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '../lib/scopedStorage';
import * as Haptics from 'expo-haptics';
import { ALL_DUAS, duasByIds, type Dua } from '../lib/duaSearch';

const STORE_KEY = 'adl.duaFavorites.v1';

/** The valid supplication ids, used to drop stale favourites on load. */
const VALID_IDS = new Set(ALL_DUAS.map((d) => d.id));

export type UseDuaFavorites = {
  ready: boolean;
  /** Favourite ids, in catalogue order. */
  favoriteIds: string[];
  /** The favourited supplications, in catalogue order. */
  favorites: Dua[];
  /** How many supplications are favourited. */
  count: number;
  /** Is this supplication favourited? */
  isFavorite: (id: string) => boolean;
  /** Add or remove a supplication from the favourites. */
  toggle: (id: string) => void;
  /** Remove every favourite. */
  clear: () => void;
};

function persist(ids: string[]): void {
  AsyncStorage.setItem(STORE_KEY, JSON.stringify(ids)).catch(() => {});
}

export default function useDuaFavorites(): UseDuaFavorites {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(
              (id): id is string => typeof id === 'string' && VALID_IDS.has(id),
            );
            setIds(cleaned);
            if (cleaned.length !== parsed.length) persist(cleaned);
          }
        }
      } catch {
        // Fall back to no favourites.
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const favoriteSet = useMemo(() => new Set(ids), [ids]);

  const isFavorite = useCallback((id: string) => favoriteSet.has(id), [favoriteSet]);

  const toggle = useCallback((id: string) => {
    if (!VALID_IDS.has(id)) return;
    setIds((prev) => {
      const has = prev.includes(id);
      const next = has ? prev.filter((x) => x !== id) : [...prev, id];
      Haptics.selectionAsync().catch(() => {});
      persist(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setIds((prev) => {
      if (prev.length === 0) return prev;
      persist([]);
      return [];
    });
  }, []);

  // Favourites surfaced in catalogue order (not insertion order).
  const favorites = useMemo(() => duasByIds(ids), [ids]);
  const favoriteIds = useMemo(() => favorites.map((d) => d.id), [favorites]);

  return {
    ready,
    favoriteIds,
    favorites,
    count: favoriteIds.length,
    isFavorite,
    toggle,
    clear,
  };
}
