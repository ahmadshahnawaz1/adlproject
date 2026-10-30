/**
 * lib/navOrder — pure ordering for the sidebar's feature list.
 *
 * Applies a user's saved manual order and pinned set over the app's default
 * feature keys: pinned items float to the top, each group keeps its manual
 * order, and features added in a later app update (not yet in the saved order)
 * fall in at the end. Pure & tested — persistence lives in the hook.
 */
export type NavOrderState = { order: string[]; pinned: string[] };

export const EMPTY_NAV_ORDER: NavOrderState = { order: [], pinned: [] };

/** Merge the saved order with the current default keys (drop unknown, append new). */
export function mergedOrder(defaultKeys: string[], order: string[]): string[] {
  const known = new Set(defaultKeys);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const k of order) {
    if (known.has(k) && !seen.has(k)) {
      out.push(k);
      seen.add(k);
    }
  }
  for (const k of defaultKeys) {
    if (!seen.has(k)) {
      out.push(k);
      seen.add(k);
    }
  }
  return out;
}

/** Final display order: pinned first (stable), then the rest. */
export function applyNavOrder(defaultKeys: string[], state: NavOrderState): string[] {
  const base = mergedOrder(defaultKeys, state.order);
  const known = new Set(defaultKeys);
  const pinned = new Set(state.pinned.filter((k) => known.has(k)));
  const pin = base.filter((k) => pinned.has(k));
  const rest = base.filter((k) => !pinned.has(k));
  return [...pin, ...rest];
}

/** Toggle a key's pinned state. */
export function togglePinned(state: NavOrderState, key: string): NavOrderState {
  const has = state.pinned.includes(key);
  return {
    ...state,
    pinned: has ? state.pinned.filter((k) => k !== key) : [...state.pinned, key],
  };
}

/** Record a new manual order (the full visible sequence after a drag). */
export function setOrder(state: NavOrderState, orderedKeys: string[]): NavOrderState {
  return { ...state, order: orderedKeys };
}
