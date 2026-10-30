/**
 * AshraCard — the theme of the current ten days of Ramadan (Mercy, Forgiveness,
 * or Refuge from the Fire) with its description and the duʿā traditionally
 * recited within it. A calm, focused panel that changes as the month turns.
 */
import { StyleSheet, Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import type { Ashra } from '../content/fasting';
import { arabicFont, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function AshraCard({ ashra, showArabic = true }: { ashra: Ashra; showArabic?: boolean }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Sparkles size={16} color={colors.primary} strokeWidth={2.2} />
        <Text style={styles.kicker}>
          Days {ashra.from}–{ashra.to} · {ashra.theme}
        </Text>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>{ashra.title}</Text>
        {showArabic ? <Text style={styles.titleArabic}>{ashra.arabic}</Text> : null}
      </View>
      <Text style={styles.description}>{ashra.description}</Text>

      <View style={styles.dua}>
        {showArabic ? <Text style={styles.arabic}>{ashra.dua.arabic}</Text> : null}
        <Text style={styles.translit}>{ashra.dua.transliteration}</Text>
        <Text style={styles.translation}>{ashra.dua.translation}</Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.lg,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  kicker: {
    ...typography.label,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  title: { ...typography.title, color: colors.foreground, flex: 1 },
  titleArabic: { fontSize: 18, color: colors.mutedForeground, fontFamily: arabicFont },
  description: { ...typography.body, fontSize: 14, color: colors.mutedForeground, lineHeight: 21, marginTop: spacing.xs },

  dua: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  arabic: {
    fontSize: 22,
    lineHeight: 40,
    color: colors.foreground,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: arabicFont,
    marginBottom: spacing.sm,
  },
  translit: { ...typography.body, fontSize: 14, fontStyle: 'italic', color: colors.primary, lineHeight: 21, marginBottom: 4 },
  translation: { ...typography.body, fontSize: 14, color: colors.mutedForeground, lineHeight: 21 },
});
