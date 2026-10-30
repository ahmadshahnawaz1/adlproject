/**
 * useNavOrder — persists the user's sidebar feature order + pinned set
 * (AsyncStorage) and exposes the resolved display order. Pinned features float
 * to the top. Storage is best-effort; ordering logic lives in lib/navOrder.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '../lib/scopedStorage';
import {
  applyNavOrder,
  setOrder as setOrderState,
  togglePinned,
  EMPTY_NAV_ORDER,
  type NavOrderState,
} from '../lib/navOrder';

const STORE_KEY = 'adl.nav.order.v1';

export default function useNavOrder(defaultKeys: string[]) {
  const [state, setState] = useState<NavOrderState>(EMPTY_NAV_ORDER);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (alive && raw) {
          const parsed = JSON.parse(raw) as NavOrderState;
          if (Array.isArray(parsed.order) && Array.isArray(parsed.pinned)) setState(parsed);
        }
      } catch {
        // best-effort
      }
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback((next: NavOrderState) => {
    setState(next);
    void AsyncStorage.setItem(STORE_KEY, JSON.stringify(next));
  }, []);

  const reorder = useCallback(
    (keys: string[]) => setState((s) => {
      const next = setOrderState(s, keys);
      void AsyncStorage.setItem(STORE_KEY, JSON.stringify(next));
      return next;
    }),
    [],
  );

  const toggle = useCallback(
    (key: string) => setState((s) => {
      const next = togglePinned(s, key);
      void AsyncStorage.setItem(STORE_KEY, JSON.stringify(next));
      return next;
    }),
    [],
  );

  const reset = useCallback(() => persist(EMPTY_NAV_ORDER), [persist]);

  const orderedKeys = useMemo(() => applyNavOrder(defaultKeys, state), [defaultKeys, state]);
  const pinned = useMemo(() => new Set(state.pinned), [state.pinned]);

  return { orderedKeys, pinned, ready, reorder, toggle, reset };
}
