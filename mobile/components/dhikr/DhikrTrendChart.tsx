/**
 * DhikrTrendChart — a compact bar chart of recent daily goal completion. Each
 * bar is one day; its height reflects how many active goals were met, and fully
 * complete days glow Adl gold. Today is gently outlined. Pure presentation over
 * the trend the engine computes.
 */
import { StyleSheet, Text, View } from 'react-native';
import type { DayTrend } from '../../lib/dhikrGoals';
import { dayKey } from '../../lib/streak';
import { radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

const WEEKDAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function DhikrTrendChart({
  data,
  height = 96,
}: {
  data: DayTrend[];
  height?: number;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const todayKey = dayKey();

  return (
    <View style={styles.wrap}>
      <View style={[styles.bars, { height }]}>
        {data.map((d) => {
          const ratio = d.totalGoals > 0 ? d.metGoals / d.totalGoals : 0;
          const isToday = d.key === todayKey;
          const color = d.complete
            ? colors.primary
            : d.metGoals === 0
              ? colors.cardElevated
              : `${colors.primary}66`;
          return (
            <View key={d.key} style={styles.col}>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      height: `${Math.max(ratio * 100, d.metGoals > 0 ? 8 : 0)}%`,
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
  col: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
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
