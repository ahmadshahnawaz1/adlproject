/**
 * Pilgrimage Notifications — gentle, date-aware nudges for the season of Ḥajj.
 *
 * Three reminders, all anchored to the offline Umm al-Qura calendar: the dawn
 * of the blessed ten of Dhū al-Ḥijjah, the eve of the Day of ʿArafah (its great
 * fast and duʿāʾ), and a countdown as the Ḥajj draws near. Pure scheduling on
 * top of `expo-notifications`, mirroring the fasting engine: it reuses the
 * shared permission flow and foreground handler and adds its own Android
 * channel. The dates come from the device; nothing leaves it.
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { toHijri } from './hijriCalendar';
import {
  DAY_ARAFAH,
  DAY_TARWIYAH,
  DHUL_HIJJAH_MONTH,
  daysUntilHajj,
} from './pilgrimageDates';
import { configureNotifications, ensurePermissions } from './notifications';

const HAJJ_TAG = 'adl.pilgrimage';
const HAJJ_CHANNEL = 'adl.pilgrimage';

/** A confident, calm two-pulse — felt, not jarring. */
const VIBRATION_PATTERN = [0, 320, 180, 320];

/** Which pilgrimage reminders the user wants. */
export type PilgrimageReminderToggles = {
  /** A nudge as the blessed ten of Dhū al-Ḥijjah begin. */
  dhulHijjah: boolean;
  /** A reminder on the eve of ʿArafah. */
  arafah: boolean;
  /** A countdown reminder as the Ḥajj season approaches. */
  hajj: boolean;
};

export type PilgrimageScheduleInput = {
  reminders: PilgrimageReminderToggles;
  /** How far ahead to scan the calendar for the next occurrences. */
  maxDays?: number;
  /** Reference "now" — injectable for testing. */
  from?: Date;
};

let channelReady = false;

/** Ensure the shared handler is set and the pilgrimage channel exists. */
export async function configurePilgrimageNotifications(): Promise<void> {
  await configureNotifications();
  if (Platform.OS === 'android' && !channelReady) {
    await Notifications.setNotificationChannelAsync(HAJJ_CHANNEL, {
      name: 'Ḥajj & ʿUmrah',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: VIBRATION_PATTERN,
      enableVibrate: true,
      lightColor: '#FFD60A',
    });
  }
  channelReady = true;
}

/** Remove every pilgrimage notification we previously scheduled. */
export async function cancelAllPilgrimage(): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pending
      .filter((n) => (n.content.data as { type?: string } | null)?.type === HAJJ_TAG)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/** The next date (from `from`, inclusive of future days) whose Hijri day/month
 *  match, with the clock set to `hour`:00, or null within `maxDays`. */
function nextHijri(
  from: Date,
  hijriDay: number,
  hour: number,
  maxDays: number,
): Date | null {
  for (let i = 0; i <= maxDays; i += 1) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    const h = toHijri(d);
    if (h.month === DHUL_HIJJAH_MONTH && h.day === hijriDay) {
      d.setHours(hour, 0, 0, 0);
      if (d.getTime() > from.getTime()) return d;
    }
  }
  return null;
}

/**
 * (Re)schedule the pilgrimage reminders. Always cancels the previous set first,
 * so calling this on every settings change keeps the queue correct and
 * de-duplicated. Returns the number of alerts queued.
 */
export async function schedulePilgrimageReminders(input: PilgrimageScheduleInput): Promise<number> {
  await configurePilgrimageNotifications();
  const { reminders, maxDays = 400, from = new Date() } = input;
  await cancelAllPilgrimage();

  if (!reminders.dhulHijjah && !reminders.arafah && !reminders.hajj) return 0;

  let count = 0;
  const push = async (at: Date | null, title: string, body: string, sub: string): Promise<void> => {
    if (!at || Number.isNaN(at.getTime()) || at.getTime() <= from.getTime()) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: HAJJ_CHANNEL } : {}),
        data: { type: HAJJ_TAG, sub },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
    });
    count += 1;
  };

  // The blessed ten — at dawn-ish (08:00) on 1 Dhū al-Ḥijjah.
  if (reminders.dhulHijjah) {
    await push(
      nextHijri(from, 1, 8, maxDays),
      'The blessed ten have begun · ذو الحجة',
      'These are the best days of the year — multiply your good deeds, fasting, dhikr and takbīr.',
      'dhulHijjah',
    );
  }

  // ʿArafah — on the eve (20:00 on the Day of Tarwiyah, the 8th).
  if (reminders.arafah) {
    await push(
      nextHijri(from, DAY_TARWIYAH, 20, maxDays),
      'Tomorrow is the Day of ʿArafah · عرفة',
      'The greatest day. If not on Ḥajj, fast it — it expiates the year before and the year after. Prepare your duʿāʾ.',
      'arafah',
    );
  }

  // Ḥajj countdown — at 08:00 on 1 Dhū al-Ḥijjah, naming the days remaining.
  if (reminders.hajj) {
    const start = nextHijri(from, 1, 8, maxDays);
    if (start) {
      const days = daysUntilHajj(start, maxDays);
      const tail = days && days > 0 ? `The standing at ʿArafah is in about ${days} days.` : 'The days of Ḥajj are here.';
      await push(
        start,
        'The Ḥajj draws near · الحج',
        `The season of Ḥajj has begun. ${tail}`,
        'hajj',
      );
    }
  }

  return count;
}

/** Fire a test pilgrimage notification a few seconds out. */
export async function sendTestPilgrimageNotification(delaySeconds = 4): Promise<boolean> {
  await configurePilgrimageNotifications();
  const granted = await ensurePermissions();
  if (!granted) return false;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Labbayk Allāhumma labbayk · لبيك',
      body: 'This is how your pilgrimage reminders will look and feel',
      sound: 'default',
      ...(Platform.OS === 'android' ? { channelId: HAJJ_CHANNEL } : {}),
      data: { type: HAJJ_TAG, sub: 'test' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, delaySeconds),
      repeats: false,
    },
  });
  return true;
}
