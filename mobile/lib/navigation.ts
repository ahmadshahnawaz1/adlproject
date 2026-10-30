/**
 * lib/navigation — the pure routing model behind the app shell.
 *
 * Adl presents one base view (a "tab"), a stack of full-screen feature
 * overlays on top of it, and at most one sheet-style modal. Modelling that as
 * data — rather than a boolean per feature — gives real back-navigation, keeps
 * the most recently opened screen on top, and makes the whole thing testable.
 * Pure: no React, no side effects.
 */

/** Base views reachable from the header/sidebar; they replace one another. */
export const TAB_KEYS = ['home', 'prayer', 'qibla', 'sunnah', 'calendar', 'tracker'] as const;
export type TabKey = (typeof TAB_KEYS)[number];

/** Full-screen features that stack over the current tab. */
export const OVERLAY_KEYS = [
  'wudu',
  'zakat',
  'sadaqah',
  'fasting',
  'pilgrimage',
  'tasbih',
  'salah',
  'adhkar',
  'duas',
  'quran',
  'hadith',
  'names',
  'hifz',
  'travel',
  'faraid',
  'jumuah',
  'halal',
  'ramadan',
  'ai',
  'sirah',
  'dhikr',
  'tahajjud',
  'learn',
  'mosques',
  'settings',
] as const;
export type OverlayKey = (typeof OVERLAY_KEYS)[number];

/** Sheet-style modals that float above everything. */
export const MODAL_KEYS = ['appearance', 'language'] as const;
export type ModalKey = (typeof MODAL_KEYS)[number];

export type RouteKey = TabKey | OverlayKey | ModalKey;

/** The whole navigation state: one tab, a stack of overlays, one optional modal. */
export type NavState = {
  tab: TabKey;
  /** Bottom → top; the last entry is the visible screen. */
  stack: OverlayKey[];
  modal: ModalKey | null;
};

export const INITIAL_NAV: NavState = { tab: 'home', stack: [], modal: null };

export function isTab(key: string): key is TabKey {
  return (TAB_KEYS as readonly string[]).includes(key);
}

export function isOverlay(key: string): key is OverlayKey {
  return (OVERLAY_KEYS as readonly string[]).includes(key);
}

export function isModal(key: string): key is ModalKey {
  return (MODAL_KEYS as readonly string[]).includes(key);
}

/** The overlay currently on top, or null when the tab is showing. */
export function activeOverlay(state: NavState): OverlayKey | null {
  return state.stack.length ? state.stack[state.stack.length - 1] : null;
}

/**
 * Go to a route. Tabs replace the whole stack (so "Home" always gets you home),
 * overlays push on top (an already-open overlay is raised, never duplicated),
 * and modals float above whatever is showing. Unknown keys are ignored.
 */
export function navigate(state: NavState, key: string): NavState {
  if (isModal(key)) return { ...state, modal: key };
  if (isTab(key)) return { tab: key, stack: [], modal: null };
  if (isOverlay(key)) {
    if (activeOverlay(state) === key) return state;
    return { ...state, stack: [...state.stack.filter((k) => k !== key), key], modal: null };
  }
  return state;
}

/** Whether a back gesture has somewhere to go (false = exit the app). */
export function canGoBack(state: NavState): boolean {
  return state.modal !== null || state.stack.length > 0 || state.tab !== 'home';
}

/**
 * Resolve one step back: close the modal, else pop the top overlay, else
 * return to Home. Returns null when there is nothing left to leave.
 */
export function goBack(state: NavState): NavState | null {
  if (state.modal) return { ...state, modal: null };
  if (state.stack.length) return { ...state, stack: state.stack.slice(0, -1) };
  if (state.tab !== 'home') return { ...state, tab: 'home' };
  return null;
}

/** Close one specific overlay wherever it sits in the stack. */
export function closeOverlay(state: NavState, key: OverlayKey): NavState {
  return { ...state, stack: state.stack.filter((k) => k !== key) };
}

/** Close the active modal. */
export function closeModal(state: NavState): NavState {
  return { ...state, modal: null };
}

/** Swap one overlay for another in place (e.g. Dhikr hub → Tasbīḥ). */
export function replaceOverlay(state: NavState, from: OverlayKey, to: OverlayKey): NavState {
  const without = state.stack.filter((k) => k !== from && k !== to);
  return { ...state, stack: [...without, to], modal: null };
}
