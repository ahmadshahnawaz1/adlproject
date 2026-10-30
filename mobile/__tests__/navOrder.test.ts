/**
 * Tests for the pure sidebar nav-order logic.
 */
import {
  applyNavOrder,
  mergedOrder,
  setOrder,
  togglePinned,
  EMPTY_NAV_ORDER,
} from '../lib/navOrder';

const DEFAULTS = ['quran', 'hadith', 'sirah', 'prayer'];

describe('mergedOrder', () => {
  it('keeps the saved order and appends new default keys', () => {
    expect(mergedOrder(DEFAULTS, ['prayer', 'quran'])).toEqual(['prayer', 'quran', 'hadith', 'sirah']);
  });

  it('drops keys that are no longer known and de-duplicates', () => {
    expect(mergedOrder(DEFAULTS, ['gone', 'hadith', 'hadith'])).toEqual([
      'hadith',
      'quran',
      'sirah',
      'prayer',
    ]);
  });
});

describe('applyNavOrder', () => {
  it('returns defaults when there is no saved state', () => {
    expect(applyNavOrder(DEFAULTS, EMPTY_NAV_ORDER)).toEqual(DEFAULTS);
  });

  it('floats pinned keys to the top, preserving each group order', () => {
    const state = { order: ['prayer', 'quran', 'hadith', 'sirah'], pinned: ['hadith'] };
    expect(applyNavOrder(DEFAULTS, state)).toEqual(['hadith', 'prayer', 'quran', 'sirah']);
  });

  it('keeps multiple pinned in their manual order', () => {
    const state = { order: ['prayer', 'sirah', 'quran', 'hadith'], pinned: ['quran', 'sirah'] };
    expect(applyNavOrder(DEFAULTS, state)).toEqual(['sirah', 'quran', 'prayer', 'hadith']);
  });
});

describe('togglePinned / setOrder', () => {
  it('adds and removes a pin', () => {
    const pinned = togglePinned(EMPTY_NAV_ORDER, 'sirah');
    expect(pinned.pinned).toEqual(['sirah']);
    expect(togglePinned(pinned, 'sirah').pinned).toEqual([]);
  });

  it('records a new manual order', () => {
    const next = setOrder(EMPTY_NAV_ORDER, ['sirah', 'prayer']);
    expect(next.order).toEqual(['sirah', 'prayer']);
  });
});
