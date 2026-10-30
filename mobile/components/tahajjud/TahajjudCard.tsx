/**
 * TahajjudCard — a glanceable doorway to the night prayer. A breathing crescent,
 * tonight's last-third window, and a live countdown; tapping it opens the full
 * Tahajjud screen. Self-contained: it reads the light window hook so a host
 * screen need only place it and handle onOpen.
 */
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, Moon } from 'lucide-react-native';
import { useTahajjudWindow } from '../../hooks/useTahajjud';
import useBreathing from '../../hooks/useBreathing';
import useFormattedTime from '../../hooks/useFormattedTime';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

export default function TahajjudCard({ onOpen }: { onOpen?: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const formatTime = useFormattedTime();
  const { window, countdown, timeZone } = useTahajjudWindow();
  const { opacity } = useBreathing({ min: 0.3, max: 0.7, duration: 2200 });

  const last = window.thirds[2];
  const range = `${formatTime(last.start, timeZone)} – ${formatTime(window.fajr, timeZone)}`;

  return (
    <Pressable
      onPress={onOpen}
      disabled={!onOpen}
      style={({ pressed }) => [styles.card, pressed && onOpen && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Animated.View pointerEvents="none" style={[styles.halo, { opacity }]} />
        <Moon size={20} color={colors.primary} strokeWidth={2} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>Tahajjud · the last third</Text>
        <Text style={styles.sub} numberOfLines={1}>
          {range}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.countdown} numberOfLines={1}>
          {countdown.label}
        </Text>
        {onOpen ? (
          <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
        ) : null}
      </View>
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
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardElevated,
  },
  halo: {
    ...StyleSheet.absoluteFill,
    borderRadius: 999,
    backgroundColor: `${colors.primary}26`,
  },
  text: { flex: 1, gap: 2 },
  title: { ...typography.body, fontFamily, color: colors.foreground, fontWeight: '600' },
  sub: { ...typography.caption, fontFamily, color: colors.mutedForeground },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  countdown: {
    ...typography.caption,
    fontFamily,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
});
