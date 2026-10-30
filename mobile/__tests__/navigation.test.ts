/**
 * Tests for the pure navigation model behind the app shell.
 */
import {
  INITIAL_NAV,
  TAB_KEYS,
  OVERLAY_KEYS,
  MODAL_KEYS,
  activeOverlay,
  canGoBack,
  closeModal,
  closeOverlay,
  goBack,
  isModal,
  isOverlay,
  isTab,
  navigate,
  replaceOverlay,
  type NavState,
} from '../lib/navigation';

describe('route classification', () => {
  it('recognises each kind of route', () => {
    expect(isTab('home')).toBe(true);
    expect(isOverlay('quran')).toBe(true);
    expect(isModal('language')).toBe(true);
  });

  it('rejects foreign keys', () => {
    expect(isTab('quran')).toBe(false);
    expect(isOverlay('home')).toBe(false);
    expect(isModal('quran')).toBe(false);
  });

  it('keeps the three route sets disjoint', () => {
    const all = [...TAB_KEYS, ...OVERLAY_KEYS, ...MODAL_KEYS];
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('navigate', () => {
  it('starts at home with nothing stacked', () => {
    expect(INITIAL_NAV).toEqual({ tab: 'home', stack: [], modal: null });
    expect(activeOverlay(INITIAL_NAV)).toBeNull();
  });

  it('pushes overlays so the newest is on top', () => {
    const s = navigate(navigate(INITIAL_NAV, 'fasting'), 'zakat');
    expect(s.stack).toEqual(['fasting', 'zakat']);
    expect(activeOverlay(s)).toBe('zakat');
  });

  it('raises an already-open overlay instead of duplicating it', () => {
    const s = navigate(navigate(navigate(INITIAL_NAV, 'fasting'), 'zakat'), 'fasting');
    expect(s.stack).toEqual(['zakat', 'fasting']);
  });

  it('is a no-op when the overlay is already on top', () => {
    const s = navigate(INITIAL_NAV, 'quran');
    expect(navigate(s, 'quran')).toBe(s);
  });

  it('switching tab clears the overlay stack', () => {
    const s = navigate(navigate(INITIAL_NAV, 'quran'), 'prayer');
    expect(s).toEqual({ tab: 'prayer', stack: [], modal: null });
  });

  it('going home from deep in a stack returns to a clean home', () => {
    const deep = navigate(navigate(navigate(INITIAL_NAV, 'learn'), 'quran'), 'ai');
    expect(navigate(deep, 'home')).toEqual({ tab: 'home', stack: [], modal: null });
  });

  it('opens a modal above the current screen', () => {
    const s = navigate(navigate(INITIAL_NAV, 'quran'), 'language');
    expect(s.modal).toBe('language');
    expect(activeOverlay(s)).toBe('quran');
  });

  it('ignores unknown keys', () => {
    expect(navigate(INITIAL_NAV, 'nope')).toBe(INITIAL_NAV);
  });
});

describe('goBack', () => {
  it('closes the modal first', () => {
    const s = navigate(navigate(INITIAL_NAV, 'quran'), 'appearance');
    const back = goBack(s);
    expect(back?.modal).toBeNull();
    expect(activeOverlay(back as NavState)).toBe('quran');
  });

  it('pops one overlay at a time', () => {
    const s = navigate(navigate(INITIAL_NAV, 'fasting'), 'zakat');
    const once = goBack(s) as NavState;
    expect(once.stack).toEqual(['fasting']);
    expect((goBack(once) as NavState).stack).toEqual([]);
  });

  it('falls back to home from another tab', () => {
    expect(goBack({ tab: 'tracker', stack: [], modal: null })?.tab).toBe('home');
  });

  it('returns null at the root so the app can exit', () => {
    expect(goBack(INITIAL_NAV)).toBeNull();
    expect(canGoBack(INITIAL_NAV)).toBe(false);
  });

  it('canGoBack is true whenever something is showing', () => {
    expect(canGoBack(navigate(INITIAL_NAV, 'quran'))).toBe(true);
    expect(canGoBack(navigate(INITIAL_NAV, 'language'))).toBe(true);
    expect(canGoBack(navigate(INITIAL_NAV, 'prayer'))).toBe(true);
  });
});

describe('closeOverlay / closeModal / replaceOverlay', () => {
  it('closes a specific overlay from the middle of the stack', () => {
    const s = navigate(navigate(navigate(INITIAL_NAV, 'fasting'), 'zakat'), 'quran');
    expect(closeOverlay(s, 'zakat').stack).toEqual(['fasting', 'quran']);
  });

  it('closing an overlay that is not open changes nothing meaningful', () => {
    const s = navigate(INITIAL_NAV, 'quran');
    expect(closeOverlay(s, 'zakat').stack).toEqual(['quran']);
  });

  it('closes the modal', () => {
    expect(closeModal(navigate(INITIAL_NAV, 'appearance')).modal).toBeNull();
  });

  it('swaps one overlay for another in place', () => {
    const s = navigate(INITIAL_NAV, 'dhikr');
    expect(replaceOverlay(s, 'dhikr', 'tasbih').stack).toEqual(['tasbih']);
  });

  it('replacing never leaves a duplicate of the target', () => {
    const s = navigate(navigate(INITIAL_NAV, 'tasbih'), 'dhikr');
    expect(replaceOverlay(s, 'dhikr', 'tasbih').stack).toEqual(['tasbih']);
  });
});
