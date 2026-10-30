/**
 * lib/scopedStorage — a per-user AsyncStorage namespace.
 *
 * Multi-account support means each signed-in user must see only their own
 * worship data. This is a drop-in replacement for AsyncStorage that transparently
 * prefixes keys with the active user's id, so a hook keeps its familiar base key
 * (e.g. 'adl.prayerLog.v1') while the bytes land under 'adl.u.<id>.prayerLog.v1'.
 *
 * The active scope is set by AuthContext before the authenticated tree mounts;
 * with no scope (tests, device-level caches) keys pass through unchanged.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

let scopeId: string | null = null;

/** Set (or clear) the active user scope. Called by AuthContext on auth changes. */
export function setStorageScope(id: string | null): void {
  scopeId = id;
}

export function getStorageScope(): string | null {
  return scopeId;
}

/** Prefix a base key with the active user scope (unchanged when no user). */
export function scopedKey(key: string): string {
  if (!scopeId) return key;
  const rest = key.startsWith('adl.') ? key.slice(4) : key;
  return `adl.u.${scopeId}.${rest}`;
}

// Serialize writes per key so rapid successive saves (e.g. tapping two prayers
// quickly) can never interleave and clobber each other's disk flush.
const writeChains = new Map<string, Promise<void>>();
function enqueue(fullKey: string, op: () => Promise<void>): Promise<void> {
  const prev = writeChains.get(fullKey) ?? Promise.resolve();
  const next = prev.then(op, op);
  writeChains.set(fullKey, next.catch(() => undefined));
  return next;
}

const scopedStorage = {
  getItem: (key: string): Promise<string | null> => AsyncStorage.getItem(scopedKey(key)),
  setItem: (key: string, value: string): Promise<void> => {
    const k = scopedKey(key);
    return enqueue(k, () => AsyncStorage.setItem(k, value));
  },
  removeItem: (key: string): Promise<void> => {
    const k = scopedKey(key);
    return enqueue(k, () => AsyncStorage.removeItem(k));
  },
  multiRemove: (keys: string[]): Promise<void> => AsyncStorage.multiRemove(keys.map(scopedKey)),
  getAllKeys: (): Promise<readonly string[]> => AsyncStorage.getAllKeys(),
};

export default scopedStorage;
