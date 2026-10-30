/**
 * CalendarScreen — a free, offline Hijri + Gregorian calendar. A navigable month
 * grid pairs every Gregorian date with its Hijri day; tapping a date reveals its
 * full Hijri reading. Today glows in Adl gold; the first day of each Hijri month
 * is gently marked. Computed entirely on-device via Intl — no API, no network.
 */
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight, CalendarDays, Table, Check } from 'lucide-react-native';
import {
  buildMonthGrid,
  formatHijriLong,
  gregMonthLabel,
  hijriSpan,
  sameDay,
  toHijri,
  WEEKDAYS,
  type CalendarCell,
} from '../lib/hijriCalendar';
import useResolvedSettings from '../hooks/useResolvedSettings';
import usePrayerLog from '../hooks/usePrayerLog';
import { getPrayerTimes } from '../lib/prayerTimes';
import { dayKey, dayOf, isComplete, prayedCount, OBLIGATORY } from '../lib/prayerLog';
import PrayerStatusPill from '../components/PrayerStatusPill';
import MonthlyTimesTable from '../components/MonthlyTimesTable';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const ARABIC: Record<string, string> = {
  fajr: '\u0627\u0644\u0641\u062c\u0631',
  dhuhr: '\u0627\u0644\u0638\u0647\u0631',
  asr: '\u0627\u0644\u0639\u0635\u0631',
  maghrib: '\u0627\u0644\u0645\u063a\u0631\u0628',
  isha: '\u0627\u0644\u0639\u0634\u0627\u0621',
};

function hm(date: Date, timeZone: string): string {
  return date.toLocaleTimeString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function CalendarScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const today = useMemo(() => new Date(), []);
  const { location, timeZone, settings } = useResolvedSettings();
  const { log, day, cycle, clearDay } = usePrayerLog();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<Date>(today);
  const [showTable, setShowTable] = useState(false);

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const subtitle = useMemo(() => hijriSpan(cells), [cells]);
  const weeks = useMemo(() => {
    const out: CalendarCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }, [cells]);

  const selectedHijri = useMemo(() => toHijri(selected), [selected]);
  const selectedKey = dayKey(selected);
  const selectedDay = day(selectedKey);
  const selectedTimes = useMemo(
    () => getPrayerTimes(location.coords, selected, settings),
    [selected, location.coords.latitude, location.coords.longitude, settings],
  );

  const step = (dir: number) => {
    let m = month + dir;
    let y = year;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  };

  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelected(today);
  };

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Calendar</Text>

        {/* Month switcher */}
        <View style={styles.header}>
          <Pressable
            onPress={() => step(-1)}
            style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
            hitSlop={10}
          >
            <ChevronLeft size={22} color={colors.foreground} strokeWidth={2.2} />
          </Pressable>

          <View style={styles.headLabels}>
            <Text style={styles.headGreg}>
              {gregMonthLabel(month)} {year}
            </Text>
            {subtitle ? <Text style={styles.headHijri}>{subtitle}</Text> : null}
          </View>

          <Pressable
            onPress={() => step(1)}
            style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
            hitSlop={10}
          >
            <ChevronRight size={22} color={colors.foreground} strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* Weekday header */}
        <View style={styles.weekRow}>
          {WEEKDAYS.map((d, i) => (
            <Text key={i} style={styles.weekday}>
              {d}
            </Text>
          ))}
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.gridRow}>
              {week.map((cell) => {
                const isToday = sameDay(cell.date, today);
                const isSelected = sameDay(cell.date, selected);
                const cDay = dayOf(log, dayKey(cell.date));
                const cDone = isComplete(cDay);
                const cPartial = !cDone && prayedCount(cDay) > 0;
                return (
                  <Pressable
                    key={cell.date.toISOString()}
                    onPress={() => setSelected(cell.date)}
                    style={({ pressed }) => [
                      styles.cell,
                      isSelected && styles.cellSelected,
                      isToday && styles.cellToday,
                      pressed && !isSelected && styles.cellPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.cellGreg,
                        !cell.inMonth && styles.cellOut,
                        isToday && styles.cellGregToday,
                        isSelected && styles.cellGregSelected,
                      ]}
                    >
                      {cell.gregDay}
                    </Text>
                    <Text
                      style={[
                        styles.cellHijri,
                        !cell.inMonth && styles.cellOut,
                        cell.hijriMonthStart && styles.cellHijriStart,
                        isSelected && styles.cellHijriSelected,
                      ]}
                    >
                      {cell.hijri.day}
                    </Text>
                    <View
                      style={[
                        styles.cellDot,
                        cDone
                          ? isSelected
                            ? styles.cellDotOnSelected
                            : styles.cellDotDone
                          : cPartial
                            ? styles.cellDotPartial
                            : styles.cellDotEmpty,
                      ]}
                    />
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {/* Selected day detail */}
        <View style={styles.detail}>
          <View style={styles.detailIcon}>
            <CalendarDays size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.detailText}>
            <Text style={styles.detailGreg}>
              {selected.toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <Text style={styles.detailHijri}>{formatHijriLong(selectedHijri)}</Text>
          </View>
        </View>

        {/* Selected day prayer times */}
        <View style={styles.timesCard}>
          <Text style={styles.timesTitle}>Prayer times</Text>
          <View style={styles.timesGrid}>
            {(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((k) => (
              <View key={k} style={styles.timeItem}>
                <Text style={styles.timeName}>
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </Text>
                <Text style={styles.timeValue}>{hm(selectedTimes[k], timeZone)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Selected day log */}
        <Text style={styles.logLabel}>Log this day</Text>
        <View style={styles.logPills}>
          {OBLIGATORY.map((p) => (
            <PrayerStatusPill
              key={p}
              prayer={p}
              arabic={ARABIC[p]}
              status={selectedDay[p]}
              onCycle={(pr) => cycle(pr, selectedKey)}
              onClear={() => clearDay(selectedKey)}
            />
          ))}
        </View>

        {/* Monthly table toggle */}
        <Pressable
          onPress={() => setShowTable((s) => !s)}
          style={({ pressed }) => [styles.tableToggle, pressed && styles.navBtnPressed]}
        >
          <Table size={16} color={colors.primary} strokeWidth={2.2} />
          <Text style={styles.tableToggleText}>
            {showTable ? 'Hide monthly table' : 'Monthly prayer table'}
          </Text>
          {showTable ? (
            <Check size={16} color={colors.primary} strokeWidth={2.2} />
          ) : (
            <ChevronRight size={16} color={colors.subtleForeground} strokeWidth={2} />
          )}
        </Pressable>
        {showTable ? (
          <View style={styles.tableWrap}>
            <MonthlyTimesTable
              year={year}
              month={month}
              coords={location.coords}
              settings={settings}
              timeZone={timeZone}
              log={log}
            />
          </View>
        ) : null}

        <Pressable
          onPress={goToday}
          style={({ pressed }) => [styles.todayBtn, pressed && styles.todayBtnPressed]}
        >
          <Text style={styles.todayBtnText}>Today</Text>
        </Pressable>

        <Text style={styles.footnote}>
          Hijri dates use the Umm al-Qura calendar where supported, computed
          on-device. Sighting may shift a day in some regions.
        </Text>
      </ScrollView>
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
    marginBottom: spacing.xl,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnPressed: { backgroundColor: colors.cardElevated },
  headLabels: { flex: 1, alignItems: 'center' },
  headGreg: { ...typography.title, color: colors.foreground },
  headHijri: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
    textAlign: 'center',
  },

  weekRow: { flexDirection: 'row', marginBottom: spacing.sm },
  weekday: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    color: colors.subtleForeground,
    fontWeight: '700',
  },

  grid: { gap: 6 },
  gridRow: { flexDirection: 'row', gap: 6 },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  cellPressed: { backgroundColor: colors.cardElevated },
  cellToday: { borderColor: colors.primary },
  cellSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  cellGreg: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.foreground,
    fontVariant: ['tabular-nums'],
  },
  cellGregToday: { color: colors.primary },
  cellGregSelected: { color: colors.primaryForeground },
  cellHijri: {
    fontSize: 10,
    color: colors.mutedForeground,
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  cellHijriStart: { color: colors.primary, fontWeight: '700' },
  cellHijriSelected: { color: colors.primaryForeground },
  cellOut: { opacity: 0.32 },
  cellDot: { width: 5, height: 5, borderRadius: 999, marginTop: 3 },
  cellDotDone: { backgroundColor: colors.primary },
  cellDotPartial: { backgroundColor: `${colors.primary}66` },
  cellDotEmpty: { backgroundColor: 'transparent' },
  cellDotOnSelected: { backgroundColor: colors.primaryForeground },

  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: { flex: 1 },
  detailGreg: { ...typography.button, color: colors.foreground },
  detailHijri: { ...typography.caption, color: colors.primary, marginTop: 2 },

  timesCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  timesTitle: {
    ...typography.label,
    color: colors.subtleForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  timesGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  timeItem: { width: '33.33%', paddingVertical: spacing.sm },
  timeName: { ...typography.caption, color: colors.mutedForeground },
  timeValue: {
    ...typography.title,
    fontSize: 16,
    color: colors.foreground,
    fontVariant: ['tabular-nums'],
    marginTop: 1,
  },

  logLabel: {
    ...typography.label,
    color: colors.subtleForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  logPills: { gap: spacing.sm },

  tableToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  tableToggleText: { flex: 1, ...typography.button, color: colors.foreground },
  tableWrap: { marginTop: spacing.md },

  todayBtn: {
    marginTop: spacing.lg,
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  todayBtnPressed: { backgroundColor: colors.cardElevated },
  todayBtnText: { ...typography.button, color: colors.foreground },

  footnote: {
    ...typography.caption,
    color: colors.subtleForeground,
    lineHeight: 18,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
});
