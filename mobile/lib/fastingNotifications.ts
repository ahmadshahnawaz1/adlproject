/**
 * Fasting Notifications — Suhūr, Imsāk, Iftār, Tarāwīḥ, Laylatul-Qadr and
 * voluntary-fast nudges, delivered.
 *
 * A focused engine on top of `expo-notifications`, mirroring the adhan engine:
 * it reuses the shared permission flow and foreground handler, adds its own
 * Android channel, and (re)schedules a clean rolling window of exact-time
 * alerts computed from the offline prayer engine and Hijri calendar. Pure
 * scheduling — the times come from `lib/fasting`, the dates from the device.
 *
 * NOTE: like the adhan engine, custom audio only plays in an installed build;
 * Expo Go substitutes the default tone but every other behaviour is identical.
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getPrayerTimes } from './prayerTimes';
import type { LatLng, PrayerSettings } from './prayerTimes';
import { toHijri } from './hijriCalendar';
import { fastTimes, forbiddenFastOn, matchesWhen } from './fasting';
import { ODD_NIGHTS, RAMADAN_MONTH } from '../content/fasting/fasting';
import { VOLUNTARY_FASTS } from '../content/fasting/voluntaryFasts';
import { configureNotifications, ensurePermissions } from './notifications';

const FAST_TAG = 'adl.fasting';
const FAST_CHANNEL = 'adl.fasting';

/** A confident, calm two-pulse — felt, not jarring. */
const VIBRATION_PATTERN = [0, 320, 180, 320];

/** Which fasting reminders the user wants. */
export type FastingReminderToggles = {
  suhur: boolean;
  imsak: boolean;
  iftar: boolean;
  taraweeh: boolean;
  qadr: boolean;
  voluntary: boolean;
};

export type FastingNotifyConfig = {
  imsakMinutes: number;
  /** Lead time before Suhūr ends to wake the early riser. */
  suhurLeadMinutes: number;
  reminders: FastingReminderToggles;
};

export type FastingScheduleInput = {
  coords: LatLng;
  settings: PrayerSettings;
  config: FastingNotifyConfig;
  cityLabel?: string;
  /** How many days of alerts to pre-schedule (rolling window). */
  daysAhead?: number;
  /** Reference "now" — injectable for testing. */
  from?: Date;
};

let channelReady = false;

/** Ensure the shared handler is set and the fasting channel exists. */
export async function configureFastingNotifications(): Promise<void> {
  await configureNotifications();
  if (Platform.OS === 'android' && !channelReady) {
    await Notifications.setNotificationChannelAsync(FAST_CHANNEL, {
      name: 'Fasting & Ramadan',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: VIBRATION_PATTERN,
      enableVibrate: true,
      lightColor: '#FFD60A',
    });
  }
  channelReady = true;
}

/** Remove every fasting notification we previously scheduled. */
export async function cancelAllFasting(): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pending
      .filter((n) => (n.content.data as { type?: string } | null)?.type === FAST_TAG)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

function place(cityLabel?: string): string {
  return cityLabel ? ` in ${cityLabel}` : '';
}

/**
 * Compute the next `daysAhead` days and (re)schedule a clean set of fasting
 * alerts. Always cancels the previous set first, so calling this on every
 * settings change keeps the queue correct and de-duplicated. Returns the
 * number of alerts queued.
 */
export async function scheduleFastingReminders(input: FastingScheduleInput): Promise<number> {
  await configureFastingNotifications();
  const { coords, settings, config, cityLabel, daysAhead = 7, from = new Date() } = input;
  await cancelAllFasting();

  const r = config.reminders;
  const anyOn = r.suhur || r.imsak || r.iftar || r.taraweeh || r.qadr || r.voluntary;
  if (!anyOn) return 0;

  let count = 0;
  const push = async (at: Date, title: string, body: string, sub: string): Promise<void> => {
    if (!(at instanceof Date) || Number.isNaN(at.getTime())) return;
    if (at.getTime() <= from.getTime()) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: FAST_CHANNEL } : {}),
        data: { type: FAST_TAG, sub },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
    });
    count += 1;
  };

  for (let d = 0; d < daysAhead; d += 1) {
    const day = new Date(from);
    day.setDate(day.getDate() + d);
    const times = getPrayerTimes(coords, day, settings);
    const ft = fastTimes(times, config.imsakMinutes);
    const hijri = toHijri(day);
    const inRamadan = hijri.month === RAMADAN_MONTH;
    const lead = Math.max(0, config.suhurLeadMinutes) * 60_000;

    if (inRamadan) {
      if (r.suhur) {
        await push(
          new Date(ft.suhoorEnd.getTime() - lead),
          'Suhūr ends soon · السحور',
          `Rise for suhūr${place(cityLabel)} — dawn is approaching`,
          'suhur',
        );
      }
      if (r.imsak) {
        await push(
          ft.imsak,
          'Imsāk · الإمساك',
          'Time to stop eating and drinking · the fast begins at Fajr',
          'imsak',
        );
      }
      if (r.iftar) {
        await push(
          ft.iftar,
          'Iftār · الإفطار',
          `The sun has set${place(cityLabel)} — may Allāh accept your fast`,
          'iftar',
        );
      }
      if (r.taraweeh && times.isha instanceof Date) {
        await push(
          new Date(times.isha.getTime() + 15 * 60_000),
          'Tarāwīḥ · التراويح',
          'The night prayer of Ramadan awaits',
          'taraweeh',
        );
      }
      if (r.qadr && hijri.day >= 21 && (ODD_NIGHTS as readonly number[]).includes(hijri.day)) {
        await push(
          ft.iftar,
          `Laylatul-Qadr · Night ${hijri.day}`,
          'An odd night of the last ten — seek the Night of Decree in worship',
          'qadr',
        );
      }
    }

    // Voluntary fasts (outside Ramadan): nudge the evening before a recommended
    // day so the worshipper can make their intention and prepare suhūr.
    if (!inRamadan && r.voluntary && d >= 1) {
      const fast = VOLUNTARY_FASTS.find((f) => matchesWhen(f.when, day));
      if (fast && !forbiddenFastOn(day)) {
        const eveBefore = new Date(day);
        eveBefore.setDate(eveBefore.getDate() - 1);
        eveBefore.setHours(20, 0, 0, 0);
        await push(
          eveBefore,
          `Tomorrow: ${fast.name} · ${fast.arabic}`,
          'A recommended day to fast — set your intention tonight',
          'voluntary',
        );
      }
    }
  }
  return count;
}

/** Fire a test fasting notification a few seconds out. */
export async function sendTestFastingNotification(delaySeconds = 4): Promise<boolean> {
  await configureFastingNotifications();
  const granted = await ensurePermissions();
  if (!granted) return false;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Iftār · الإفطار',
      body: 'This is how your fasting reminders will look and feel',
      sound: 'default',
      ...(Platform.OS === 'android' ? { channelId: FAST_CHANNEL } : {}),
      data: { type: FAST_TAG, sub: 'test' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, delaySeconds),
      repeats: false,
    },
  });
  return true;
}
