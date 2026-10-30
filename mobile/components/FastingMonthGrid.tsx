/**
 * FastingMonthGrid — the Ramadan log as a tappable calendar. Each of the
 * month's days is a cell coloured by how it was observed; tapping cycles
 * fasted → broke → exempt → unset. A tally summarises the month and a legend
 * explains the colours. Today is ringed. The dates come from the offline
 * calendar; the log hook owns the state.
 */
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native';
import { CalendarCheck } from 'lucide-react-native';
import { dayKey } from '../lib/fastingLog';
import type { UseFastingLog } from '../hooks/useFastingLog';
import type { FastingStatus } from '../content/fasting';
import { colors, radius, spacing, typography } from '../theme/tokens';

function cellColors(status: FastingStatus): { bg: string; border: string; text: string } {
  switch (status) {
    case 'fasted':
      return { bg: colors.primary, border: colors.primary, text: colors.primaryForeground };
    case 'broke':
      return { bg: `${colors.destructive}26`, border: `${colors.destructive}66`, text: colors.destructive };
    case 'exempt':
      return { bg: colors.cardElevated, border: colors.borderFocus, text: colors.mutedForeground };
    default:
      return { bg: colors.cardElevated, border: colors.border, text: colors.subtleForeground };
  }
}

const LEGEND: { status: FastingStatus; label: string }[] = [
  { status: 'fasted', label: 'Fasted' },
  { status: 'broke', label: 'Broke' },
  { status: 'exempt', label: 'Exempt' },
];

export default function FastingMonthGrid({
  dates,
  fastingLog,
}: {
  dates: Date[];
  fastingLog: UseFastingLog;
}) {
  const today = dayKey();
  const tally = fastingLog.tally(dates);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headLeft}>
          <CalendarCheck size={16} color={colors.primary} strokeWidth={2.2} />
          <Text style={styles.title}>Ramadan log</Text>
        </View>
        <Text style={styles.tally}>
          {tally.fasted}/{tally.total} fasted
        </Text>
      </View>

      <View style={styles.grid}>
        {dates.map((d, i) => {
          const key = dayKey(d);
          const status = fastingLog.entry(key).status;
          const c = cellColors(status);
          const isToday = key === today;
          return (
            <Pressable
              key={key}
              onPress={() => fastingLog.cycle(key)}
              style={({ pressed }) => [
                styles.cell,
                { backgroundColor: c.bg, borderColor: isToday ? colors.primary : c.border },
                isToday && styles.cellToday,
                pressed && styles.cellPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Ramadan day ${i + 1}, ${status}`}
            >
              <Text style={[styles.cellText, { color: c.text }]}>{i + 1}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legend}>
        {LEGEND.map((l) => {
          const c = cellColors(l.status);
          return (
            <View key={l.status} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: c.bg, borderColor: c.border }]} />
              <Text style={styles.legendText}>{l.label}</Text>
            </View>
          );
        })}
        <Text style={styles.hint}>Tap a day to log</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.lg,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { ...typography.button, color: colors.foreground },
  tally: { ...typography.caption, fontSize: 13, fontWeight: '700', color: colors.primary, fontVariant: ['tabular-nums'] },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellToday: { borderWidth: 2 },
  cellPressed: { opacity: 0.7 },
  cellText: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },

  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexWrap: 'wrap',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 4, borderWidth: 1 },
  legendText: { ...typography.caption, fontSize: 12, color: colors.mutedForeground },
  hint: { ...typography.caption, fontSize: 11, color: colors.subtleForeground, marginLeft: 'auto' },
});
