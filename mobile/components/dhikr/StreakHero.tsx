/**
 * StreakHero — the calm centrepiece of the Dhikr hub. A breathing gold flame
 * over the current streak, the longest run, and an optional "today" tally.
 * Self-contained presentation; the parent owns the numbers.
 *
 * Driver rule: only opacity breathes here, so the halo uses the native driver.
 */
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Flame } from 'lucide-react-native';
import useBreathing from '../../hooks/useBreathing';
import { radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

function streakWord(n: number): string {
  if (n <= 0) return 'Begin today';
  return n === 1 ? '1 day strong' : `${n} days strong`;
}

export default function StreakHero({
  streak,
  best,
  todayLabel,
}: {
  streak: number;
  best: number;
  todayLabel?: string;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { opacity } = useBreathing({ min: 0.28, max: 0.7, duration: 2200 });

  return (
    <View style={styles.hero}>
      <View style={styles.flameWrap}>
        <Animated.View
          pointerEvents="none"
          style={[styles.halo, { opacity }]}
        />
        <View style={styles.flame}>
          <Flame size={26} color={colors.primary} strokeWidth={2.2} />
        </View>
      </View>

      <Text style={styles.number}>{streak}</Text>
      <Text style={styles.label}>{streakWord(streak)}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>Best {best}</Text>
        {todayLabel ? (
          <>
            <View style={styles.dot} />
            <Text style={styles.meta}>{todayLabel}</Text>
          </>
        ) : null}
      </View>
    </View>
  );
}

const FLAME = 56;

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  flameWrap: {
    width: FLAME,
    height: FLAME,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  halo: {
    ...StyleSheet.absoluteFill,
    borderRadius: 999,
    backgroundColor: `${colors.primary}33`,
  },
  flame: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  label: {
    ...typography.title,
    fontSize: 18,
    color: colors.foreground,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  meta: { ...typography.caption, color: colors.mutedForeground },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.subtleForeground,
  },
});
