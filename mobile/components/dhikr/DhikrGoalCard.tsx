/**
 * DhikrGoalCard — one row for a single daily goal: an icon, a title and detail,
 * and a small ProgressRing that fills toward completion (a check when met). The
 * whole row may be pressable to jump to the matching tool. Pure presentation.
 */
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import ProgressRing from '../ProgressRing';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

export default function DhikrGoalCard({
  icon,
  title,
  detail,
  fraction,
  complete,
  onPress,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  fraction: number;
  complete: boolean;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}
    >
      <View style={styles.iconWrap}>{icon}</View>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
      <ProgressRing fraction={fraction} complete={complete} size={44} stroke={4} />
      {onPress ? (
        <ChevronRight size={18} color={colors.subtleForeground} />
      ) : null}
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  pressed: { opacity: 0.7 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardElevated,
  },
  text: { flex: 1, gap: 2 },
  title: { ...typography.body, fontFamily, color: colors.foreground, fontWeight: '600' },
  detail: { ...typography.caption, fontFamily, color: colors.mutedForeground },
});
