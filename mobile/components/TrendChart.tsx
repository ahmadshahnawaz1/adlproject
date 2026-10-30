/**
 * TrendChart — a compact bar chart of recent daily completion.
 *
 * Each bar is one day; its height reflects how many of the five obligations
 * were prayed, and complete days glow Adl gold. Today is gently outlined. Pure
 * presentation over the stats the engine computes.
 */
import { StyleSheet, Text, View } from 'react-native';
import type { RangeStat } from '../lib/prayerLog';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const WEEKDAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function TrendChart({
  data,
  height = 96,
}: {
  data: RangeStat[];
  height?: number;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const todayKey = new Date().toLocaleDateString('en-CA');

  return (
    <View style={styles.wrap}>
      <View style={[styles.bars, { height }]}>
        {data.map((d) => {
          const ratio = d.prayed / 5;
          const isToday = d.key === todayKey;
          const color = d.complete
            ? colors.primary
            : d.prayed === 0
              ? colors.cardElevated
              : `${colors.primary}66`;
          return (
            <View key={d.key} style={styles.col}>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      height: `${Math.max(ratio * 100, d.prayed > 0 ? 8 : 0)}%`,
                      backgroundColor: color,
                    },
                    isToday && styles.fillToday,
                  ]}
                />
              </View>
              <Text style={[styles.tick, isToday && styles.tickToday]}>
                {WEEKDAY[d.date.getDay()]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: { width: '100%' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  col: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  track: {
    width: '100%',
    flex: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.cardElevated,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  fill: { width: '100%', borderRadius: radius.sm, minHeight: 3 },
  fillToday: { borderWidth: 1.5, borderColor: colors.foreground },
  tick: {
    ...typography.caption,
    fontSize: 10,
    color: colors.subtleForeground,
    marginTop: spacing.xs,
  },
  tickToday: { color: colors.foreground, fontWeight: '700' },
});
