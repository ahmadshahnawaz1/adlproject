/**
 * lib/settings/defaults — the default settings + a forward-compatible merge so
 * a stored (possibly older/partial) blob always resolves to a complete object.
 * Pure & tested.
 */
import type { UserSettings } from './types';

export const DEFAULT_SETTINGS: UserSettings = {
  profile: {
    username: '',
    bio: '',
    gender: 'unspecified',
    dob: '',
    country: '',
    city: '',
    timezone: 'auto',
  },
  appearance: {
    boldText: false,
    reduceMotion: false,
  },
  region: {
    timeFormat: 'system',
    dateFormat: 'system',
    firstDayOfWeek: 'system',
    numerals: 'latin',
  },
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    showPreview: true,
    badges: true,
    quietHoursEnabled: false,
    quietStart: '22:00',
    quietEnd: '06:00',
    dailyVerse: true,
    dailyHadith: false,
    streakReminders: true,
    prayerReminders: true,
    preAdhanMinutes: 10,
  },
  privacy: {
    appLock: false,
    biometric: false,
    autoLock: 'never',
    hideInAppSwitcher: false,
    analytics: false,
    crashReports: true,
    personalizedContent: true,
  },
  accessibility: {
    largerTouchTargets: false,
    screenReaderHints: false,
    captions: false,
  },
  sound: {
    haptics: true,
    inAppSounds: true,
    keySounds: false,
  },
  data: {
    syncEnabled: false,
    autoBackup: false,
    wifiOnlyDownloads: true,
  },
};

type DeepPartial<T> = { [K in keyof T]?: Partial<T[K]> };

/** Merge a stored blob over the defaults so every key is always present. */
export function mergeSettings(stored: DeepPartial<UserSettings> | null | undefined): UserSettings {
  const d = DEFAULT_SETTINGS;
  const s = stored ?? {};
  return {
    profile: { ...d.profile, ...(s.profile ?? {}) },
    appearance: { ...d.appearance, ...(s.appearance ?? {}) },
    region: { ...d.region, ...(s.region ?? {}) },
    notifications: { ...d.notifications, ...(s.notifications ?? {}) },
    privacy: { ...d.privacy, ...(s.privacy ?? {}) },
    accessibility: { ...d.accessibility, ...(s.accessibility ?? {}) },
    sound: { ...d.sound, ...(s.sound ?? {}) },
    data: { ...d.data, ...(s.data ?? {}) },
  };
}
