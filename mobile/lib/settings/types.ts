/**
 * lib/settings/types — the full per-user settings model.
 *
 * Theme (mode / contrast / text size) and app language live in their own
 * providers (ThemeContext / LocaleContext) and are NOT duplicated here; this
 * model holds every other user & app preference. Persisted per user.
 */
export type TimeFormat = 'system' | '12h' | '24h';
export type DateFormat = 'system' | 'dmy' | 'mdy' | 'ymd';
export type FirstDay = 'system' | 'sat' | 'sun' | 'mon';
export type Numerals = 'latin' | 'arabic';
export type Gender = 'unspecified' | 'male' | 'female';
export type AutoLock = 'immediately' | '1m' | '5m' | '15m' | '1h' | 'never';

export type UserSettings = {
  profile: {
    username: string;
    bio: string;
    gender: Gender;
    dob: string; // ISO date or ''
    country: string;
    city: string;
    timezone: string; // 'auto' or an IANA id
  };
  appearance: {
    boldText: boolean;
    reduceMotion: boolean;
  };
  region: {
    timeFormat: TimeFormat;
    dateFormat: DateFormat;
    firstDayOfWeek: FirstDay;
    numerals: Numerals;
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    showPreview: boolean;
    badges: boolean;
    quietHoursEnabled: boolean;
    quietStart: string; // 'HH:mm'
    quietEnd: string; // 'HH:mm'
    dailyVerse: boolean;
    dailyHadith: boolean;
    streakReminders: boolean;
    prayerReminders: boolean;
    preAdhanMinutes: number;
  };
  privacy: {
    appLock: boolean;
    biometric: boolean;
    autoLock: AutoLock;
    hideInAppSwitcher: boolean;
    analytics: boolean;
    crashReports: boolean;
    personalizedContent: boolean;
  };
  accessibility: {
    largerTouchTargets: boolean;
    screenReaderHints: boolean;
    captions: boolean;
  };
  sound: {
    haptics: boolean;
    inAppSounds: boolean;
    keySounds: boolean;
  };
  data: {
    syncEnabled: boolean;
    autoBackup: boolean;
    wifiOnlyDownloads: boolean;
  };
};

export type SettingsCategory =
  | keyof UserSettings;
