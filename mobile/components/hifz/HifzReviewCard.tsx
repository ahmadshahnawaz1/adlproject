/**
 * HifzReviewCard — one āyah under review.
 *
 * The reference is shown first and the text stays hidden, so the memoriser
 * recalls from memory rather than reading. Revealing shows the āyah, and then
 * the four honest grades schedule its return.
 */
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Eye, RotateCcw } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { haptics } from '../../lib/haptics';
import { arabicFont, fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import type { ReviewGrade } from '../../lib/hifz';

const GRADES: { key: ReviewGrade; label: string; hint: string }[] = [
  { key: 'again', label: 'Again', hint: 'Forgot' },
  { key: 'hard', label: 'Hard', hint: 'Struggled' },
  { key: 'good', label: 'Good', hint: 'Recalled' },
  { key: 'easy', label: 'Easy', hint: 'Effortless' },
];

export default function HifzReviewCard({
  reference,
  arabic,
  translation,
  revealed,
  onReveal,
  onGrade,
}: {
  reference: string;
  arabic: string;
  translation?: string;
  revealed: boolean;
  onReveal: () => void;
  onGrade: (grade: ReviewGrade) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.card}>
      <AppText style={styles.reference}>{reference}</AppText>

      {revealed ? (
        <ScrollView style={styles.textWrap} showsVerticalScrollIndicator={false}>
          <AppText style={styles.arabic}>{arabic}</AppText>
          {translation ? <AppText style={styles.translation}>{translation}</AppText> : null}
        </ScrollView>
      ) : (
        <Pressable
          onPress={() => {
            haptics.selection();
            onReveal();
          }}
          style={({ pressed }) => [styles.hidden, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Recite ${reference} from memory, then tap to reveal`}
        >
          <View style={styles.eye}>
            <Eye size={22} color={colors.primary} strokeWidth={2} />
          </View>
          <AppText style={styles.hiddenTitle}>Recite it from memory</AppText>
          <AppText style={styles.hiddenHint}>Tap to reveal the āyah</AppText>
        </Pressable>
      )}

      {revealed ? (
        <View style={styles.grades}>
          {GRADES.map((g) => (
            <Pressable
              key={g.key}
              onPress={() => {
                if (g.key === 'again') haptics.warning();
                else haptics.success();
                onGrade(g.key);
              }}
              style={({ pressed }) => [
                styles.grade,
                g.key === 'again' && styles.gradeAgain,
                g.key === 'easy' && styles.gradeEasy,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${g.label} — ${g.hint}`}
            >
              <AppText
                style={[
                  styles.gradeLabel,
                  g.key === 'again' && { color: colors.destructive },
                  g.key === 'easy' && { color: colors.success },
                ]}
              >
                {g.label}
              </AppText>
              <AppText style={styles.gradeHint}>{g.hint}</AppText>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.footerHint}>
          <RotateCcw size={13} color={colors.subtleForeground} strokeWidth={2} />
          <AppText style={styles.footerHintText}>
            Grading yourself honestly is what makes the schedule work.
          </AppText>
        </View>
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.lg,
      gap: spacing.md,
    },
    reference: {
      ...typography.caption,
      fontSize: 12,
      letterSpacing: 0.5,
      color: colors.primary,
      textAlign: 'center',
    },
    hidden: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing['2xl'],
      borderRadius: radius.md,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border,
      backgroundColor: colors.background,
      minHeight: 180,
    },
    eye: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.primary}14`,
      marginBottom: spacing.xs,
    },
    hiddenTitle: { ...typography.title, fontSize: 16, color: colors.foreground },
    hiddenHint: { fontFamily, fontSize: 12, color: colors.subtleForeground },
    textWrap: { maxHeight: 260 },
    arabic: {
      fontFamily: arabicFont,
      fontSize: 28,
      lineHeight: 56,
      color: colors.foreground,
      textAlign: 'center',
      writingDirection: 'rtl',
    },
    translation: {
      fontFamily,
      fontSize: 14,
      lineHeight: 22,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    grades: { flexDirection: 'row', gap: spacing.xs },
    grade: {
      flex: 1,
      alignItems: 'center',
      gap: 1,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      minHeight: 52,
      justifyContent: 'center',
    },
    gradeAgain: { borderColor: `${colors.destructive}55` },
    gradeEasy: { borderColor: `${colors.success}55` },
    gradeLabel: { fontFamily, fontSize: 13, fontWeight: '600', color: colors.foreground },
    gradeHint: { ...typography.caption, fontSize: 9, color: colors.subtleForeground },
    footerHint: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
    footerHintText: { ...typography.caption, fontSize: 11, color: colors.subtleForeground },
    pressed: { opacity: 0.85 },
  });
