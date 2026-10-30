/**
 * HadithOfTheDayCard — the featured daily narration (F18).
 *
 * A gently accented card drawn from the authentic bundled pool, the same for a
 * given day. Tapping it opens the full narration.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Quote } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import GradeChip from './GradeChip';
import { quranFonts, fontFamily, radius, spacing, typography } from '../../theme/tokens';
import type { Hadith } from '../../lib/hadith';

export default function HadithOfTheDayCard({
  hadith,
  onOpen,
}: {
  hadith: Hadith;
  onOpen: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Hadith of the day"
    >
      <View style={styles.head}>
        <View style={styles.labelWrap}>
          <Quote size={13} color={colors.primary} strokeWidth={2.4} />
          <Text style={styles.label}>Hadith of the Day</Text>
        </View>
        <GradeChip grade={hadith.grade} />
      </View>

      <Text style={styles.arabic} numberOfLines={3}>
        {hadith.arabic}
      </Text>
      <Text style={styles.translation} numberOfLines={4}>
        {hadith.translation}
      </Text>
      {hadith.narrator ? <Text style={styles.narrator}>— {hadith.narrator}</Text> : null}
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: `${colors.primary}44`,
      backgroundColor: colors.cardElevated,
      gap: spacing.sm,
    },
    pressed: { opacity: 0.9 },
    head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
    labelWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    label: {
      ...typography.button,
      fontSize: 12,
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    arabic: {
      fontFamily: quranFonts.scheherazade,
      fontSize: 22,
      lineHeight: 40,
      color: colors.foreground,
      textAlign: 'right',
      writingDirection: 'rtl',
    },
    translation: { fontFamily, fontSize: 14, lineHeight: 22, color: colors.mutedForeground },
    narrator: { fontFamily, fontSize: 12, color: colors.subtleForeground, fontStyle: 'italic' },
  });
