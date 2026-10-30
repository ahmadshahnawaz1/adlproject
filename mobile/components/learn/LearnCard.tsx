/**
 * LearnCard — a single lesson in a section list. It shows the lesson's title,
 * optional Arabic, a short summary, a reading-time hint, and a completion tick.
 * Tapping it opens the full lesson; the tick reflects whether it has been read.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, ChevronRight, Clock } from 'lucide-react-native';
import type { Lesson } from '../../content/learn';
import { arabicFont, fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

export default function LearnCard({
  lesson,
  complete,
  onPress,
}: {
  lesson: Lesson;
  complete: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${lesson.title}. ${complete ? 'Read.' : 'Not read yet.'}`}
    >
      <View style={[styles.tick, complete && styles.tickDone]}>
        {complete ? <Check size={13} color={colors.primaryForeground} strokeWidth={3} /> : null}
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {lesson.title}
          </Text>
          {lesson.arabic ? (
            <Text style={styles.arabic} numberOfLines={1}>
              {lesson.arabic}
            </Text>
          ) : null}
        </View>
        <Text style={styles.summary} numberOfLines={2}>
          {lesson.summary}
        </Text>
        <View style={styles.metaRow}>
          <Clock size={11} color={colors.subtleForeground} strokeWidth={2.2} />
          <Text style={styles.meta}>{lesson.minutes} min read</Text>
        </View>
      </View>
      <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  pressed: { opacity: 0.85, borderColor: colors.borderFocus },
  tick: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  body: { flex: 1, minWidth: 0, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'space-between' },
  title: { ...typography.button, fontSize: 15, color: colors.foreground, flexShrink: 1 },
  arabic: { fontFamily: arabicFont, fontSize: 14, color: colors.primary, writingDirection: 'rtl' },
  summary: { fontFamily, fontSize: 13, lineHeight: 19, color: colors.mutedForeground },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  meta: { fontFamily, fontSize: 11, color: colors.subtleForeground },
});
