/**
 * Adhan Notifications — the call to prayer, delivered.
 *
 * A focused engine on top of `expo-notifications`. It owns three things and
 * nothing else: device permissions, the Android notification channels (where
 * sound + vibration actually live on Android), and scheduling a rolling window
 * of exact-time prayer alerts computed from the offline engine.
 *
 *   • Silent   — a quiet banner, no sound, no buzz.
 *   • Vibrate  — a gentle two-pulse haptic, no sound.
 *   • Chime    — the system notification tone.
 *   • Adhan    — the full muezzin call (a bundled audio file).
 *
 * NOTE ON AUDIO: custom muezzin audio only plays in an installed build. In
 * Expo Go the OS substitutes the default tone — everything else (timing,
 * vibration, copy, scheduling) behaves identically, so it is fully testable.
 * Drop `adhan-*.wav` files into `assets/sounds/` and register them in
 * `app.json` → expo-notifications `sounds` to enable real audio in a build.
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getPrayerTimes } from './prayerTimes';
import type { LatLng, PrayerName, PrayerSettings } from './prayerTimes';

/** How a prayer should announce itself. */
export type AlertMode = 'silent' | 'vibrate' | 'chime' | 'adhan';

/** A selectable muezzin voice for the full adhan. */
export type MuezzinVoice = {
  id: string;
  label: string;
  origin: string;
  /** Bundled file name (without path). Falls back to default in Expo Go. */
  sound: string;
};

/**
 * The available calls. To add a real voice: drop e.g. `adhan-makkah.wav` into
 * assets/sounds/, list it under app.json expo-notifications `sounds`, and the
 * channel below will pick it up in an installed build.
 */
export const MUEZZIN_VOICES: MuezzinVoice[] = [
  { id: 'makkah', label: 'Makkah', origin: 'Masjid al-Haram', sound: 'adhan-makkah.wav' },
  { id: 'madinah', label: 'Madinah', origin: "Masjid an-Nabawi", sound: 'adhan-madinah.wav' },
  { id: 'classic', label: 'Classic', origin: 'Traditional maqam', sound: 'adhan-classic.wav' },
];

export const DEFAULT_VOICE_ID = 'makkah';

export function voiceById(id: string): MuezzinVoice {
  return MUEZZIN_VOICES.find((v) => v.id === id) ?? MUEZZIN_VOICES[0];
}

/** Stable Android channel IDs — one per delivery style. */
const CHANNELS = {
  silent: 'adl.silent',
  vibrate: 'adl.vibrate',
  chime: 'adl.chime',
  adhan: 'adl.adhan',
} as const;

/** A confident, calm two-pulse — felt, not jarring. */
const VIBRATION_PATTERN = [0, 320, 180, 320];

const PRAYER_TAG = 'adl.adhan';
const QAZA_TAG = 'adl.qaza';
const TAHAJJUD_TAG = 'adl.tahajjud';
const ZAKAT_DUE_TAG = 'adl.zakat-due';

/** Beautiful, restrained copy for each call. */
const COPY: Record<PrayerName, { title: string; arabic: string; line: string }> = {
  fajr: { title: 'Fajr', arabic: '\u0627\u0644\u0641\u062C\u0631', line: 'As-salatu khayrun min an-nawm \u00B7 prayer is better than sleep' },
  sunrise: { title: 'Sunrise', arabic: '\u0627\u0644\u0634\u0631\u0648\u0642', line: 'The time for Fajr has ended' },
  dhuhr: { title: 'Dhuhr', arabic: '\u0627\u0644\u0638\u0647\u0631', line: 'It is time for Dhuhr prayer' },
  asr: { title: 'Asr', arabic: '\u0627\u0644\u0639\u0635\u0631', line: 'It is time for Asr prayer' },
  maghrib: { title: 'Maghrib', arabic: '\u0627\u0644\u0645\u063A\u0631\u0628', line: 'It is time for Maghrib prayer' },
  isha: { title: 'Isha', arabic: '\u0627\u0644\u0639\u0634\u0627\u0621', line: 'It is time for Isha prayer' },
};

const ORDER: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

let configured = false;

/**
 * One-time setup: route foreground alerts to a real banner and (re)create the
 * Android channels carrying each delivery style. Safe to call repeatedly.
 */
export async function configureNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNELS.silent, {
      name: 'Prayer \u2014 Silent',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: undefined,
      vibrationPattern: undefined,
      enableVibrate: false,
      lightColor: '#FFD60A',
    });
    await Notifications.setNotificationChannelAsync(CHANNELS.vibrate, {
      name: 'Prayer \u2014 Vibrate',
      importance: Notifications.AndroidImportance.HIGH,
      sound: undefined,
      vibrationPattern: VIBRATION_PATTERN,
      enableVibrate: true,
      lightColor: '#FFD60A',
    });
    await Notifications.setNotificationChannelAsync(CHANNELS.chime, {
      name: 'Prayer \u2014 Chime',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: VIBRATION_PATTERN,
      enableVibrate: true,
      lightColor: '#FFD60A',
    });
    // The adhan channel's sound is fixed at creation time on Android, so we key
    // it to the default voice; an installed build with the bundled file plays it.
    await Notifications.setNotificationChannelAsync(CHANNELS.adhan, {
      name: 'Prayer \u2014 Adhan',
      importance: Notifications.AndroidImportance.MAX,
      sound: voiceById(DEFAULT_VOICE_ID).sound,
      vibrationPattern: VIBRATION_PATTERN,
      enableVibrate: true,
      lightColor: '#FFD60A',
    });
  }

  configured = true;
}

/** Current OS permission state without prompting. */
export async function getPermissionStatus(): Promise<Notifications.PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/** Ask for permission (no-op if already granted). Returns whether granted. */
export async function ensurePermissions(): Promise<boolean> {
  if (!configured) await configureNotifications();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain && current.status === 'denied') return false;
  const next = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return next.granted;
}

/** Map an alert mode + voice to the right channel / iOS sound payload. */
function deliveryFor(mode: AlertMode, voice: MuezzinVoice) {
  switch (mode) {
    case 'silent':
      return { channelId: CHANNELS.silent, sound: undefined as string | undefined };
    case 'vibrate':
      return { channelId: CHANNELS.vibrate, sound: undefined as string | undefined };
    case 'chime':
      return { channelId: CHANNELS.chime, sound: 'default' as string | undefined };
    case 'adhan':
    default:
      return { channelId: CHANNELS.adhan, sound: voice.sound as string | undefined };
  }
}

function content(
  prayer: PrayerName,
  cityLabel: string | undefined,
  mode: AlertMode,
  voice: MuezzinVoice,
  reminderMinutes?: number,
): Notifications.NotificationContentInput {
  const c = COPY[prayer];
  const delivery = deliveryFor(mode, voice);
  const place = cityLabel ? ` in ${cityLabel}` : '';
  const isReminder = typeof reminderMinutes === 'number' && reminderMinutes > 0;
  return {
    title: isReminder
      ? `${c.title} in ${reminderMinutes} min \u00B7 ${c.arabic}`
      : `${c.title} \u00B7 ${c.arabic}`,
    body: isReminder ? `${c.title} approaches${place}` : `${c.line}${place}`,
    sound: delivery.sound,
    ...(Platform.OS === 'android' ? { channelId: delivery.channelId } : {}),
    data: { type: PRAYER_TAG, prayer, reminder: isReminder },
  };
}

/** Per-prayer notification choices the scheduler needs. */
export type PrayerNotifyConfig = {
  enabled: Partial<Record<PrayerName, boolean>>;
  mode: AlertMode;
  voiceId: string;
  /** Optional heads-up this many minutes before each prayer (0 = off). */
  reminderMinutes: number;
};

export type ScheduleInput = {
  coords: LatLng;
  settings: PrayerSettings;
  config: PrayerNotifyConfig;
  cityLabel?: string;
  /** How many days of alerts to pre-schedule (rolling window). */
  daysAhead?: number;
  /** Reference "now" — injectable for testing. */
  from?: Date;
};

/** Remove every adhan notification we previously scheduled. */
export async function cancelAllAdhan(): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pending
      .filter((n) => (n.content.data as { type?: string } | null)?.type === PRAYER_TAG)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/**
 * Compute the next `daysAhead` days of prayer times and (re)schedule a clean
 * set of exact-time alerts. Always cancels the previous set first, so calling
 * this on every settings change keeps the queue correct and de-duplicated.
 * Returns the number of alerts queued.
 */
export async function scheduleAdhanNotifications(input: ScheduleInput): Promise<number> {
  if (!configured) await configureNotifications();
  const { coords, settings, config, cityLabel, daysAhead = 3, from = new Date() } = input;
  await cancelAllAdhan();

  const voice = voiceById(config.voiceId);
  const anyEnabled = ORDER.some((p) => config.enabled[p]);
  if (!anyEnabled) return 0;

  let count = 0;
  for (let d = 0; d < daysAhead; d += 1) {
    const day = new Date(from);
    day.setDate(day.getDate() + d);
    const times = getPrayerTimes(coords, day, settings);

    for (const prayer of ORDER) {
      if (!config.enabled[prayer]) continue;
      const at = times[prayer];
      if (!(at instanceof Date) || Number.isNaN(at.getTime())) continue;

      // Main call, exactly on time.
      if (at.getTime() > from.getTime()) {
        await Notifications.scheduleNotificationAsync({
          content: content(prayer, cityLabel, config.mode, voice),
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: at,
          },
        });
        count += 1;
      }

      // Optional heads-up reminder before the call.
      if (config.reminderMinutes > 0) {
        const remindAt = new Date(at.getTime() - config.reminderMinutes * 60_000);
        if (remindAt.getTime() > from.getTime()) {
          await Notifications.scheduleNotificationAsync({
            content: content(prayer, cityLabel, 'silent', voice, config.reminderMinutes),
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: remindAt,
            },
          });
          count += 1;
        }
      }
    }
  }
  return count;
}

/** Remove a previously scheduled qaza reminder. */
export async function cancelQazaReminder(): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pending
      .filter((n) => (n.content.data as { type?: string } | null)?.type === QAZA_TAG)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/**
 * Schedule a single, gentle daily reminder at `hour` to log or make up any
 * prayers still outstanding for the day. Always clears the previous one first.
 * Returns true if a reminder was queued.
 */
export async function scheduleQazaReminder(hour: number): Promise<boolean> {
  if (!configured) await configureNotifications();
  await cancelQazaReminder();
  const granted = await ensurePermissions();
  if (!granted) return false;

  const safeHour = Math.max(0, Math.min(23, Math.round(hour)));
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Have you prayed all five today?',
      body: 'Log today\u2019s prayers and protect your streak \u00B7 make up any qaza',
      data: { type: QAZA_TAG },
      ...(Platform.OS === 'android' ? { channelId: CHANNELS.chime } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: safeHour,
      minute: 0,
    },
  });
  return true;
}

/** Remove any previously scheduled Tahajjud reminders. */
export async function cancelTahajjudReminder(): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pending
      .filter((n) => (n.content.data as { type?: string } | null)?.type === TAHAJJUD_TAG)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/**
 * Schedule a clean set of Tahajjud wake reminders at the given moments (the
 * caller computes them for the next few nights). Always clears the previous set
 * first and skips any time already in the past. Returns how many were queued.
 */
export async function scheduleTahajjudReminder(
  times: Date[],
  body = 'The last third of the night \u2014 a time of the divine descent. Rise for Qiy\u0101m al-Layl.',
): Promise<number> {
  if (!configured) await configureNotifications();
  await cancelTahajjudReminder();
  const granted = await ensurePermissions();
  if (!granted) return 0;

  const now = Date.now();
  let count = 0;
  for (const at of times) {
    if (!(at instanceof Date) || Number.isNaN(at.getTime())) continue;
    if (at.getTime() <= now) continue;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for Tahajjud',
        body,
        data: { type: TAHAJJUD_TAG },
        ...(Platform.OS === 'android' ? { channelId: CHANNELS.chime } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: at,
      },
    });
    count += 1;
  }
  return count;
}

/**
 * Fire a one-off Tahajjud reminder a few seconds out so the user can feel how
 * the wake-up alert reads. Tagged as a test so it neither cancels nor is
 * cancelled by the real nightly reminders.
 */
export async function sendTestTahajjud(delaySeconds = 5): Promise<boolean> {
  if (!configured) await configureNotifications();
  const granted = await ensurePermissions();
  if (!granted) return false;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time for Tahajjud',
      body: 'The last third of the night \u2014 a time of the divine descent. Rise for Qiy\u0101m al-Layl.',
      data: { type: 'test' },
      ...(Platform.OS === 'android' ? { channelId: CHANNELS.chime } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, delaySeconds),
      repeats: false,
    },
  });
  return true;
}

/** Remove any previously scheduled zakāt-due reminder. */
export async function cancelZakatDueReminder(): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pending
      .filter((n) => (n.content.data as { type?: string } | null)?.type === ZAKAT_DUE_TAG)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/**
 * Schedule the annual zakāt-due reminder for the moment the ḥawl completes (the
 * caller passes the exact instant, optionally brought forward a few days).
 * Always clears the previous one first and skips a date already in the past.
 * Returns true if a reminder was queued.
 */
export async function scheduleZakatDueReminder(
  dueDate: Date,
  body = 'Your wealth has completed a full lunar year. Review your zakat and give what is due.',
): Promise<boolean> {
  if (!configured) await configureNotifications();
  await cancelZakatDueReminder();
  const granted = await ensurePermissions();
  if (!granted) return false;
  if (!(dueDate instanceof Date) || Number.isNaN(dueDate.getTime())) return false;
  if (dueDate.getTime() <= Date.now()) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Zakāt is due',
      body,
      data: { type: ZAKAT_DUE_TAG },
      ...(Platform.OS === 'android' ? { channelId: CHANNELS.chime } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: dueDate,
    },
  });
  return true;
}

/**
 * Fire a one-off zakāt-due reminder a few seconds out so the user can feel how
 * the alert reads. Tagged as a test so it neither cancels nor is cancelled by
 * the real annual reminder.
 */
export async function sendTestZakatDue(delaySeconds = 5): Promise<boolean> {
  if (!configured) await configureNotifications();
  const granted = await ensurePermissions();
  if (!granted) return false;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Zakāt is due',
      body: 'Your wealth has completed a full lunar year. Review your zakat and give what is due.',
      data: { type: 'test' },
      ...(Platform.OS === 'android' ? { channelId: CHANNELS.chime } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, delaySeconds),
      repeats: false,
    },
  });
  return true;
}
export async function sendTestNotification(
  mode: AlertMode,
  voiceId: string,
  prayer: PrayerName = 'dhuhr',
  delaySeconds = 4,
): Promise<boolean> {
  const granted = await ensurePermissions();
  if (!granted) return false;
  const voice = voiceById(voiceId);
  await Notifications.scheduleNotificationAsync({
    content: {
      ...content(prayer, undefined, mode, voice),
      title: `Test \u00B7 ${COPY[prayer].title} \u00B7 ${COPY[prayer].arabic}`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, delaySeconds),
      repeats: false,
    },
  });
  return true;
}

/** Total adhan alerts currently queued — handy for a debug readout. */
export async function scheduledAdhanCount(): Promise<number> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  return pending.filter(
    (n) => (n.content.data as { type?: string } | null)?.type === PRAYER_TAG,
  ).length;
}
