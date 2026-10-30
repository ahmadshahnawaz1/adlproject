/**
 * lib/scopeMigration — one-time move of the single pre-auth user's data into
 * their per-user namespace, plus a full purge for account deletion.
 *
 * Before multi-account support, every ledger lived under a global key. When the
 * first account is established we relocate that data into the account's scope so
 * nothing is lost; subsequent accounts start clean. Native (SecureStore) — not
 * imported by tests.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { PROVIDERS } from './ai/providers';

const MIGRATION_FLAG = 'adl.migrated.userscope.v1';

/** Every per-user base key that predates scoping (device caches are excluded). */
export const SCOPED_BASE_KEYS: string[] = [
  'adl.prayerLog.v1',
  'adl.fastingLog.v1',
  'adl.fastingLedger.v1',
  'adl.charityLog.v1',
  'adl.qazaLedger.v1',
  'adl.tasbih.v1',
  'adl.adhkar.v1',
  'adl.dhikrGoals.v1',
  'adl.duaFavorites.v1',
  'adl.learn.v1',
  'adl.sirah.v1',
  'adl.tahajjud.v1',
  'adl.trackerPrefs.v1',
  'adl.prayerPrefs.v1',
  'adl.notifyPrefs.v1',
  'adl.fastingPrefs.v1',
  'adl.pilgrimageJourney.v1',
  'adl.pilgrimagePrefs.v1',
  'adl.zakatReminder.v1',
  'adl.zakatWorksheet.v1',
  'adl.hadith.bookmarks.v1',
  'adl.hadith.settings.v1',
  'adl.quran.bookmarks.v1',
  'adl.quran.reader.v1',
  'adl.quran.settings.v2',
  'adl.quran.recitation.pref.v1',
  'adl.nav.order.v1',
  'adl.ai.settings.v1',
  'adl.ai.conversations.v1',
];

function scopedKeyFor(userId: string, key: string): string {
  const rest = key.startsWith('adl.') ? key.slice(4) : key;
  return `adl.u.${userId}.${rest}`;
}

async function moveKey(userId: string, key: string): Promise<void> {
  const val = await AsyncStorage.getItem(key);
  if (val != null) {
    await AsyncStorage.setItem(scopedKeyFor(userId, key), val);
    await AsyncStorage.removeItem(key);
  }
}

/** One-time: relocate the pre-auth user's global data into their scope. */
export async function runUserScopeMigrationOnce(userId: string): Promise<void> {
  try {
    if (await AsyncStorage.getItem(MIGRATION_FLAG)) return;

    for (const key of SCOPED_BASE_KEYS) await moveKey(userId, key);

    // AI messages live under per-conversation keys; migrate via the (now-scoped) index.
    const convRaw = await AsyncStorage.getItem(scopedKeyFor(userId, 'adl.ai.conversations.v1'));
    if (convRaw) {
      const conversations = JSON.parse(convRaw) as { id: string }[];
      for (const c of conversations) await moveKey(userId, `adl.ai.messages.${c.id}`);
    }

    // The AI provider keys live in the keychain; move each into the user's scope.
    for (const p of PROVIDERS) {
      try {
        const global = await SecureStore.getItemAsync(`adl.ai.key.${p.id}`);
        if (global) {
          await SecureStore.setItemAsync(`adl.ai.key.${userId}.${p.id}`, global);
          await SecureStore.deleteItemAsync(`adl.ai.key.${p.id}`);
        }
      } catch {
        // best-effort per provider
      }
    }

    await AsyncStorage.setItem(MIGRATION_FLAG, String(Date.now()));
  } catch {
    // best-effort: on failure the global data remains and can migrate next launch
  }
}

/** Delete every scoped AsyncStorage key belonging to a user (account deletion). */
export async function purgeUserData(userId: string): Promise<void> {
  try {
    const prefix = `adl.u.${userId}.`;
    const all = await AsyncStorage.getAllKeys();
    const mine = all.filter((k) => k.startsWith(prefix));
    if (mine.length) await AsyncStorage.multiRemove(mine);
  } catch {
    // best-effort
  }
}
