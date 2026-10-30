import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Sunrise as SunriseIcon,
  Sun,
  CloudSun,
  Sunset,
  MoonStar,
  MapPin,
  ChevronDown,
  ShieldCheck,
  BellRing,
} from 'lucide-react-native';
import { Mosque } from 'phosphor-react-native';
import useBreathing from '../hooks/useBreathing';
import useLocation from '../hooks/useLocation';
import usePrayerPrefs from '../hooks/usePrayerPrefs';
import useNotificationPrefs from '../hooks/useNotificationPrefs';
import CityPicker from '../components/CityPicker';
import PrayerSettingsSheet from '../components/PrayerSettingsSheet';
import NotificationSettingsSheet from '../components/NotificationSettingsSheet';
import {
  OFFICIAL_SOURCES,
  resolveOfficialSource,
  settingsForSource,
} from '../lib/officialSources';
import {
  getNextPrayer,
  getPrayerTimes,
  getCurrentPrayer,
  elevationShiftMinutes,
  type PrayerName,
} from '../lib/prayerTimes';
import {
  configureNotifications,
  ensurePermissions,
  getPermissionStatus,
  scheduleAdhanNotifications,
  cancelAllAdhan,
  scheduleQazaReminder,
  cancelQazaReminder,
  sendTestNotification,
} from '../lib/notifications';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

type Row = {
  key: Exclude<PrayerName, never>;
  label: string;
  arabic: string;
  icon: (active: boolean) => React.ReactNode;
};

const makeTint = (colors: ThemeColors) => (active: boolean) => (active ? colors.primaryForeground : colors.mutedForeground);

const makeRows = (colors: ThemeColors): Row[] => {
  const tint = makeTint(colors);
  return [
    { key: 'fajr', label: 'Fajr', arabic: '\u0627\u0644\u0641\u062C\u0631', icon: (a) => <CloudSun size={22} color={tint(a)} strokeWidth={2} /> },
    { key: 'sunrise', label: 'Sunrise', arabic: '\u0627\u0644\u0634\u0631\u0648\u0642', icon: (a) => <SunriseIcon size={22} color={tint(a)} strokeWidth={2} /> },
    { key: 'dhuhr', label: 'Dhuhr', arabic: '\u0627\u0644\u0638\u0647\u0631', icon: (a) => <Sun size={22} color={tint(a)} strokeWidth={2} /> },
    { key: 'asr', label: 'Asr', arabic: '\u0627\u0644\u0639\u0635\u0631', icon: (a) => <CloudSun size={22} color={tint(a)} strokeWidth={2} /> },
    { key: 'maghrib', label: 'Maghrib', arabic: '\u0627\u0644\u0645\u063A\u0631\u0628', icon: (a) => <Sunset size={22} color={tint(a)} strokeWidth={2} /> },
    { key: 'isha', label: 'Isha', arabic: '\u0627\u0644\u0639\u0634\u0627\u0621', icon: (a) => <MoonStar size={22} color={tint(a)} strokeWidth={2} /> },
  ];
};

function formatTime(date: Date, timeZone: string): string {
  return date.toLocaleTimeString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatHijriAndDate(date: Date, timeZone: string): string {
  const greg = date.toLocaleDateString('en-US', {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  try {
    const hijri = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
      timeZone,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
    return `${greg}  \u00B7  ${hijri}`;
  } catch {
    return greg;
  }
}

function formatCountdown(ms: number): string {
  if (ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** The calendar day ('YYYY-MM-DD') for `date` as seen in `timeZone`. */
function dayKeyInZone(date: Date, timeZone: string): string {
  // en-CA renders ISO-style YYYY-MM-DD, which sorts and compares cleanly.
  return date.toLocaleDateString('en-CA', { timeZone });
}

/** Milliseconds from `date` until the next local midnight in `timeZone`. */
function msUntilNextMidnight(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  // Intl renders midnight as "24" in some engines; normalise to 0.
  const h = get('hour') % 24;
  const elapsed = (h * 3600 + get('minute') * 60 + get('second')) * 1000;
  // One day minus the time already elapsed today, +1s of slack to land past 00:00.
  return 86_400_000 - elapsed + 1000;
}


/**
 * PrayerScreen — an exceptionally beautiful, shadcn/ui-inspired prayer schedule.
 * A glowing "next prayer" hero with a live countdown, atop a clean list of the
 * day's six times with the current prayer softly highlighted in Adl yellow.
 */
export default function PrayerScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const ROWS = useMemo(() => makeRows(colors), [colors]);
  const { opacity: glow } = useBreathing();
  const { location, refreshing, useGps, setCity } = useLocation();
  const { prefs, setPref, setAdjustment, resetAdjustments } = usePrayerPrefs();
  const {
    prefs: notify,
    ready: notifyReady,
    setPref: setNotifyPref,
    togglePrayer,
    toConfig,
  } = useNotificationPrefs();
  const [now, setNow] = useState(() => new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const coords = location.coords;
  const timeZone = location.timeZone;

  // The calendar day in the prayer location's timezone. When this changes the
  // schedule must roll over to the new day's times.
  const [dayKey, setDayKey] = useState(() => dayKeyInZone(new Date(), timeZone));

  // Explicit midnight rollover: schedule a single timer to fire just after the
  // next local midnight, then re-key the day and reschedule. This guarantees a
  // recompute at the day boundary even if the per-second tick is throttled
  // (e.g. backgrounded), and is timezone-correct for manually-set cities.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = msUntilNextMidnight(new Date(), timeZone);
      timer = setTimeout(() => {
        setDayKey(dayKeyInZone(new Date(), timeZone));
        schedule();
      }, delay);
    };
    // Sync immediately in case the timezone just changed under us.
    setDayKey(dayKeyInZone(new Date(), timeZone));
    schedule();
    return () => clearTimeout(timer);
  }, [timeZone]);

  // The authority that auto-detection would choose for this country.
  const autoSource = useMemo(
    () => resolveOfficialSource(location.countryCode),
    [location.countryCode],
  );
  // The authority actually in effect (pinned override wins over auto).
  const activeSource = useMemo(
    () => (prefs.sourceId === 'auto' ? autoSource : OFFICIAL_SOURCES[prefs.sourceId]),
    [prefs.sourceId, autoSource],
  );

  const settings = useMemo(
    () =>
      settingsForSource(activeSource, {
        madhab: prefs.madhab === 'auto' ? undefined : prefs.madhab,
        highLatitudeRule: prefs.highLatitudeRule,
        elevation: prefs.useElevation ? location.elevation : undefined,
        adjustments: prefs.adjustments,
      }),
    [
      activeSource,
      prefs.madhab,
      prefs.highLatitudeRule,
      prefs.useElevation,
      prefs.adjustments,
      location.elevation,
    ],
  );

  const times = useMemo(() => getPrayerTimes(coords, now, settings), [
    // Recompute when the local day rolls over, location, OR settings change.
    dayKey,
    coords.latitude,
    coords.longitude,
    settings,
  ]);

  const current = useMemo(
    () => getCurrentPrayer(coords, now, settings),
    [now, coords.latitude, coords.longitude, settings],
  );
  const next = useMemo(
    () => getNextPrayer(coords, now, settings),
    [now, coords.latitude, coords.longitude, settings],
  );

  const nextLabel = next ? ROWS.find((r) => r.key === next.name)?.label ?? '' : 'Fajr';
  const countdown = next ? formatCountdown(next.time.getTime() - now.getTime()) : '--';

  const elevationMinutes = elevationShiftMinutes(location.elevation ?? 0, coords.latitude);

  // Prepare the notification system once (handler + Android channels).
  useEffect(() => {
    configureNotifications().catch(() => {});
  }, []);

  // Keep the scheduled call-to-prayer queue in sync with the user's choices,
  // the active times, and the day rollover. Any change rebuilds a clean queue.
  useEffect(() => {
    if (!notifyReady) return;
    let cancelled = false;
    (async () => {
      if (!notify.enabled) {
        await cancelAllAdhan().catch(() => {});
        return;
      }
      const granted = await ensurePermissions();
      if (cancelled) return;
      setPermissionDenied(!granted);
      if (!granted) return;
      await scheduleAdhanNotifications({
        coords,
        settings,
        config: toConfig(notify),
        cityLabel: location.label,
        from: new Date(),
      }).catch(() => {});

      if (notify.qazaReminder) {
        await scheduleQazaReminder(notify.qazaReminderHour).catch(() => {});
      } else {
        await cancelQazaReminder().catch(() => {});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    notifyReady,
    notify,
    settings,
    coords.latitude,
    coords.longitude,
    location.label,
    dayKey,
    toConfig,
  ]);

  // Reflect the OS permission state when the sheet is opened.
  useEffect(() => {
    if (!notifyOpen) return;
    getPermissionStatus()
      .then((s) => setPermissionDenied(s === 'denied'))
      .catch(() => {});
  }, [notifyOpen]);

  const handleSendTest = useCallback(async () => {
    const ok = await sendTestNotification(notify.mode, notify.voiceId);
    setPermissionDenied(!ok);
    return ok;
  }, [notify.mode, notify.voiceId]);

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>Prayer</Text>
          <Pressable
            onPress={() => setNotifyOpen(true)}
            style={({ pressed }) => [styles.bellButton, pressed && styles.locationPressed]}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Notification settings"
          >
            <BellRing
              size={20}
              color={notify.enabled ? colors.primary : colors.mutedForeground}
              strokeWidth={2.2}
            />
            {notify.enabled ? <View style={styles.bellDot} /> : null}
          </Pressable>
        </View>

        <Pressable
          onPress={() => setPickerOpen(true)}
          style={({ pressed }) => [styles.locationRow, pressed && styles.locationPressed]}
          hitSlop={8}
        >
          <MapPin size={14} color={colors.mutedForeground} strokeWidth={2} />
          <Text style={styles.locationText}>{location.label}</Text>
          <ChevronDown size={14} color={colors.mutedForeground} strokeWidth={2} />
        </Pressable>
        <Text style={styles.dateText}>{formatHijriAndDate(now, timeZone)}</Text>

        <Pressable
          onPress={() => setSettingsOpen(true)}
          style={({ pressed }) => [styles.authorityChip, pressed && styles.locationPressed]}
          hitSlop={8}
        >
          <ShieldCheck size={13} color={colors.primary} strokeWidth={2.25} />
          <Text style={styles.authorityText}>{activeSource.label}</Text>
        </Pressable>

        <Animated.View style={[styles.hero, { opacity: glow }]}>
          <Mosque size={30} color={colors.primary} weight="duotone" duotoneOpacity={0.35} />
          <Text style={styles.heroEyebrow}>Up next</Text>
          <Text style={styles.heroPrayer}>{nextLabel}</Text>
          <Text style={styles.heroCountdown}>{countdown}</Text>
          <Text style={styles.heroHint}>
            {next ? `at ${formatTime(next.time, timeZone)}` : 'See you at Fajr'}
          </Text>
        </Animated.View>

        <View style={styles.list}>
          {ROWS.map((row) => {
            const active = current === row.key;
            return (
              <View
                key={row.key}
                style={[styles.row, active && styles.rowActive]}
              >
                <View style={styles.rowLeft}>
                  {row.icon(active)}
                  <View>
                    <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>
                      {row.label}
                    </Text>
                    <Text style={[styles.rowArabic, active && styles.rowArabicActive]}>
                      {row.arabic}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.rowTime, active && styles.rowTimeActive]}>
                  {formatTime(times[row.key], timeZone)}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <CityPicker
        visible={pickerOpen}
        current={location}
        refreshing={refreshing}
        onClose={() => setPickerOpen(false)}
        onUseGps={() => {
          useGps();
          setPickerOpen(false);
        }}
        onPickCity={(city) => {
          setCity(city);
          setPickerOpen(false);
        }}
      />

      <PrayerSettingsSheet
        visible={settingsOpen}
        prefs={prefs}
        activeSource={activeSource}
        autoSource={autoSource}
        elevation={location.elevation}
        elevationMinutes={elevationMinutes}
        onClose={() => setSettingsOpen(false)}
        onSetPref={setPref}
        onSetAdjustment={setAdjustment}
        onResetAdjustments={resetAdjustments}
      />

      <NotificationSettingsSheet
        visible={notifyOpen}
        prefs={notify}
        permissionDenied={permissionDenied}
        onClose={() => setNotifyOpen(false)}
        onSetPref={setNotifyPref}
        onTogglePrayer={togglePrayer}
        onSendTest={handleSendTest}
      />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing['3xl'],
  },
  title: {
    ...typography.display,
    color: colors.foreground,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  titleRow: {
    justifyContent: 'center',
  },
  bellButton: {
    position: 'absolute',
    right: 0,
    top: spacing.sm,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  bellDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    marginTop: spacing.md,
  },
  locationPressed: { opacity: 0.55 },
  locationText: { ...typography.label, color: colors.mutedForeground },
  authorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  authorityText: {
    ...typography.caption,
    color: colors.foreground,
    fontWeight: '600',
  },
  dateText: {
    ...typography.caption,
    color: colors.subtleForeground,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  hero: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
  },
  heroEyebrow: {
    ...typography.label,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: spacing.sm,
  },
  heroPrayer: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.foreground,
    marginTop: spacing.xs,
    letterSpacing: -0.5,
  },
  heroCountdown: {
    fontSize: 44,
    fontWeight: '300',
    color: colors.primary,
    marginTop: spacing.sm,
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  heroHint: {
    ...typography.body,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  rowActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowLabel: { ...typography.button, color: colors.foreground },
  rowLabelActive: { color: colors.primaryForeground },
  rowArabic: {
    ...typography.caption,
    color: colors.subtleForeground,
    marginTop: 1,
  },
  rowArabicActive: { color: colors.primaryForeground, opacity: 0.7 },
  rowTime: {
    ...typography.button,
    color: colors.foreground,
    fontVariant: ['tabular-nums'],
  },
  rowTimeActive: { color: colors.primaryForeground, fontWeight: '700' },
});
