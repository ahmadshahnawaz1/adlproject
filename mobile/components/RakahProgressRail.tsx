/**
 * RakahProgressRail — the quiet sense of place within the prayer. A title names
 * where you are ("Rakʿah 2 of 4"), a caption tracks the step, and a row of pills
 * marks each rakʿah: those completed are filled, the current one glows, those
 * to come are empty. For the funeral prayer (which has no rakaʿāt) the pills are
 * omitted and only the labels show. Purely presentational.
 */
import { StyleSheet, Text, View } from 'react-native';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function RakahProgressRail({
  rakahs,
  currentRakah,
  title,
  rightLabel,
}: {
  rakahs: number[];
  currentRakah: number;
  title: string;
  rightLabel: string;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.right}>{rightLabel}</Text>
      </View>
      {rakahs.length > 0 ? (
        <View style={styles.pills}>
          {rakahs.map((r) => {
            const done = r < currentRakah;
            const active = r === currentRakah;
            return (
              <View
                key={r}
                style={[styles.pill, done && styles.pillDone, active && styles.pillActive]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: { gap: spacing.sm },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '700', color: colors.foreground },
  right: { fontFamily, fontSize: typography.caption.fontSize, color: colors.subtleForeground },
  pills: { flexDirection: 'row', gap: spacing.xs },
  pill: {
    flex: 1,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.cardElevated,
  },
  pillDone: { backgroundColor: `${colors.primary}66` },
  pillActive: { backgroundColor: colors.primary },
});
