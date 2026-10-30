/**
 * lib/ai/secureKey — the API key vault for ADL AI (F19).
 *
 * The user's own provider key is stored in the device keychain via
 * expo-secure-store — never in AsyncStorage, never logged, never bundled. Keys
 * are namespaced per provider so a user can keep several.
 */
import * as SecureStore from 'expo-secure-store';
import { getStorageScope } from '../scopedStorage';
import { PROVIDERS } from './providers';

const keyName = (providerId: string): string => {
  const scope = getStorageScope();
  return scope ? `adl.ai.key.${scope}.${providerId}` : `adl.ai.key.${providerId}`;
};

/** Read the stored key for a provider, or null. */
export async function getKey(providerId: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(keyName(providerId));
  } catch {
    return null;
  }
}

/** Store (or, with an empty value, clear) a provider key. */
export async function setKey(providerId: string, value: string): Promise<void> {
  const trimmed = value.trim();
  try {
    if (!trimmed) {
      await SecureStore.deleteItemAsync(keyName(providerId));
    } else {
      await SecureStore.setItemAsync(keyName(providerId), trimmed);
    }
  } catch {
    // Keychain unavailable — fail silently; the caller surfaces "no key".
  }
}

/** Remove a provider key. */
export async function clearKey(providerId: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(keyName(providerId));
  } catch {
    // no-op
  }
}

/** Whether a non-empty key is stored for a provider. */
export async function hasKey(providerId: string): Promise<boolean> {
  const k = await getKey(providerId);
  return !!k && k.length > 0;
}

/** Clear the active user's stored key for every known provider. */
export async function clearAllKeys(): Promise<void> {
  for (const p of PROVIDERS) await clearKey(p.id);
}
