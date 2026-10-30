/**
 * NameOfDayCard — the day's name to sit with: large Arabic, its meaning, and a
 * line of reflection. Stable for the whole day.
 */
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight, Sun } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { arabicFont, fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import type { DivineName } from '../../lib/names';

export default function NameOfDayCard({
  name,
  onOpen,
}: {
  name: DivineName;
  onOpen: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Name of the day: ${name.transliteration}, ${name.meaning}`}
    >
      <View style={styles.head}>
        <Sun size={14} color={colors.primary} strokeWidth={2.2} />
        <AppText style={styles.kicker}>NAME OF THE DAY</AppText>
      </View>

      <AppText style={styles.arabic}>{name.arabic}</AppText>
      <AppText style={styles.translit}>{name.transliteration}</AppText>
      <AppText style={styles.meaning}>{name.meaning}</AppText>
      <AppText style={styles.explanation} numberOfLines={3}>
        {name.explanation}
      </AppText>

      <View style={styles.footer}>
        <AppText style={styles.more}>Reflect on this name</AppText>
        <ChevronRight size={16} color={colors.subtleForeground} strokeWidth={2} />
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: `${colors.primary}44`,
      backgroundColor: colors.card,
      padding: spacing.lg,
      gap: spacing.xs,
      alignItems: 'center',
    },
    pressed: { opacity: 0.9 },
    head: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs },
    kicker: {
      ...typography.caption,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.primary,
    },
    arabic: { fontFamily: arabicFont, fontSize: 42, lineHeight: 68, color: colors.foreground, textAlign: 'center' },
    translit: { ...typography.title, fontSize: 19, color: colors.foreground, textAlign: 'center' },
    meaning: { fontFamily, fontSize: 14, color: colors.primary, textAlign: 'center' },
    explanation: {
      fontFamily,
      fontSize: 13,
      lineHeight: 20,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    footer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
    more: { ...typography.caption, fontSize: 12, color: colors.subtleForeground },
  });
