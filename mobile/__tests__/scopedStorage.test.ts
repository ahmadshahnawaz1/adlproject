/**
 * Tests for the per-user storage key scoping.
 */
import { scopedKey, setStorageScope, getStorageScope } from '../lib/scopedStorage';

describe('scopedKey', () => {
  afterEach(() => setStorageScope(null));

  it('passes keys through unchanged when there is no active user', () => {
    setStorageScope(null);
    expect(scopedKey('adl.prayerLog.v1')).toBe('adl.prayerLog.v1');
  });

  it('namespaces adl.* keys under the active user', () => {
    setStorageScope('user-123');
    expect(scopedKey('adl.prayerLog.v1')).toBe('adl.u.user-123.prayerLog.v1');
    expect(scopedKey('adl.ai.conversations.v1')).toBe('adl.u.user-123.ai.conversations.v1');
  });

  it('namespaces non-adl keys too', () => {
    setStorageScope('u1');
    expect(scopedKey('somekey')).toBe('adl.u.u1.somekey');
  });

  it('isolates two users into different namespaces', () => {
    setStorageScope('a');
    const a = scopedKey('adl.charityLog.v1');
    setStorageScope('b');
    const b = scopedKey('adl.charityLog.v1');
    expect(a).not.toBe(b);
    expect(getStorageScope()).toBe('b');
  });
});
