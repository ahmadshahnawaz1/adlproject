/**
 * RamadanProgressStrip — the month at a glance: which day of Ramadan it is, the
 * current ʿashra, how many days remain, and a thirty-cell moon strip that fills
 * as the month passes. Shown at the top of the hub during Ramadan.
 */
import { StyleSheet, Text, View } from 'react-native';
import type { Ashra } from '../content/fasting';
import type { RamadanInfo } from '../lib/fasting';
import { arabicFont, radius, spacing, typography } from '../theme/tokens';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const CELLS = Array.from({ length: 30 }, (_, i) => i + 1);

export default function RamadanProgressStrip({
  info,
  ashra,
  showArabic = true,
}: {
  info: RamadanInfo;
  ashra: Ashra;
  showArabic?: boolean;
}) {
  const styles = useThemedStyles(makeStyles);
  const pct = Math.round((info.day / 30) * 100);
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View>
          <Text style={styles.kicker}>Ramaḍān · رمضان</Text>
          <Text style={styles.day}>
            Day {info.day} <Text style={styles.dayTotal}>of 30</Text>
          </Text>
        </View>
        <View style={styles.ashraChip}>
          <Text style={styles.ashraTitle}>{ashra.title}</Text>
          {showArabic ? <Text style={styles.ashraArabic}>{ashra.arabic}</Text> : null}
        </View>
      </View>

      <View style={styles.grid}>
        {CELLS.map((d) => {
          const past = d < info.day;
          const today = d === info.day;
          return (
            <View
              key={d}
              style={[styles.cell, past && styles.cellPast, today && styles.cellToday]}
            >
              <Text style={[styles.cellText, past && styles.cellTextPast, today && styles.cellTextToday]}>
                {d}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.left}>{info.daysLeft} days left</Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.primary}55`,
    backgroundColor: colors.card,
    marginBottom: spacing.lg,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  kicker: {
    ...typography.label,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: 2,
  },
  day: { ...typography.title, color: colors.foreground },
  dayTotal: { ...typography.body, fontSize: 15, color: colors.subtleForeground, fontWeight: '400' },
  ashraChip: {
    alignItems: 'flex-end',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ashraTitle: { ...typography.caption, fontSize: 12, fontWeight: '700', color: colors.foreground },
  ashraArabic: { fontSize: 11, color: colors.mutedForeground, fontFamily: arabicFont, marginTop: 1 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.lg },
  cell: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellPast: { backgroundColor: `${colors.primary}26`, borderColor: `${colors.primary}40` },
  cellToday: { backgroundColor: colors.primary, borderColor: colors.primary },
  cellText: { fontSize: 11, fontWeight: '600', color: colors.subtleForeground, fontVariant: ['tabular-nums'] },
  cellTextPast: { color: colors.primary },
  cellTextToday: { color: colors.primaryForeground, fontWeight: '800' },

  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  track: { flex: 1, height: 6, borderRadius: 999, backgroundColor: colors.cardElevated, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 999, backgroundColor: colors.primary },
  left: { ...typography.caption, fontSize: 12, color: colors.mutedForeground, fontVariant: ['tabular-nums'] },
});
