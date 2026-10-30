/**
 * MonthlyTimesTable — every day of a Gregorian month with its five prayer
 * times, computed offline for the active location and authority. Today's row is
 * highlighted; each row also carries a small completion dot from the log.
 */
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getPrayerTimes, type LatLng, type PrayerSettings } from '../lib/prayerTimes';
import { dayKey, dayOf, isComplete, prayedCount, type PrayerLog } from '../lib/prayerLog';
import { radius, spacing, typography } from '../theme/tokens';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const COLS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

function hm(date: Date, timeZone: string): string {
  return date.toLocaleTimeString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });
}

export default function MonthlyTimesTable({
  year,
  month,
  coords,
  settings,
  timeZone,
  log,
}: {
  year: number;
  month: number;
  coords: LatLng;
  settings: PrayerSettings;
  timeZone: string;
  log: PrayerLog;
}) {
  const styles = useThemedStyles(makeStyles);
  const todayKey = dayKey(new Date());

  const rows = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: { d: number; key: string; times: ReturnType<typeof getPrayerTimes> }[] = [];
    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = new Date(year, month, d, 12, 0, 0);
      out.push({ d, key: dayKey(date), times: getPrayerTimes(coords, date, settings) });
    }
    return out;
  }, [year, month, coords.latitude, coords.longitude, settings]);

  return (
    <View style={styles.wrap}>
      <View style={[styles.row, styles.headRow]}>
        <Text style={[styles.cellDay, styles.headText]}>Day</Text>
        {COLS.map((c) => (
          <Text key={c} style={[styles.cell, styles.headText]}>
            {c}
          </Text>
        ))}
      </View>

      {rows.map((r) => {
        const isToday = r.key === todayKey;
        const day = dayOf(log, r.key);
        const done = isComplete(day);
        const partial = !done && prayedCount(day) > 0;
        return (
          <View key={r.key} style={[styles.row, isToday && styles.rowToday]}>
            <View style={styles.cellDay}>
              <View
                style={[
                  styles.dot,
                  done ? styles.dotDone : partial ? styles.dotPartial : styles.dotNone,
                ]}
              />
              <Text style={[styles.dayText, isToday && styles.todayText]}>{r.d}</Text>
            </View>
            <Text style={[styles.cell, isToday && styles.todayText]}>{hm(r.times.fajr, timeZone)}</Text>
            <Text style={[styles.cell, isToday && styles.todayText]}>{hm(r.times.dhuhr, timeZone)}</Text>
            <Text style={[styles.cell, isToday && styles.todayText]}>{hm(r.times.asr, timeZone)}</Text>
            <Text style={[styles.cell, isToday && styles.todayText]}>{hm(r.times.maghrib, timeZone)}</Text>
            <Text style={[styles.cell, isToday && styles.todayText]}>{hm(r.times.isha, timeZone)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headRow: { backgroundColor: colors.cardElevated },
  rowToday: { backgroundColor: `${colors.primary}14` },
  headText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.subtleForeground,
    textTransform: 'uppercase',
  },
  cellDay: { width: 40, flexDirection: 'row', alignItems: 'center', gap: 5 },
  dayText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: colors.foreground,
    fontVariant: ['tabular-nums'],
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    fontSize: 12,
    color: colors.mutedForeground,
    fontVariant: ['tabular-nums'],
  },
  todayText: { color: colors.primary, fontWeight: '700' },
  dot: { width: 7, height: 7, borderRadius: 999 },
  dotDone: { backgroundColor: colors.primary },
  dotPartial: { backgroundColor: `${colors.primary}66` },
  dotNone: { backgroundColor: colors.cardElevated },
});
