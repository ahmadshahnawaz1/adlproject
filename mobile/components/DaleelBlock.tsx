/**
 * DaleelBlock — a single proof-text (Qurʾān or Sunnah), rendered consistently
 * across the Fasting & Ramadan hub. A quiet, bordered block with a source chip,
 * the reference, an optional authenticity grade, the narrator, and the text —
 * so every ruling shown in the app carries its evidence with it.
 */
import { StyleSheet, Text, View } from 'react-native';
import { BookOpen, ScrollText } from 'lucide-react-native';
import type { Daleel } from '../content/fasting';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function DaleelBlock({ daleel }: { daleel: Daleel }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isQuran = daleel.source === 'quran';
  const Icon = isQuran ? BookOpen : ScrollText;
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={styles.chip}>
          <Icon size={12} color={colors.primary} strokeWidth={2.4} />
          <Text style={styles.chipText}>{isQuran ? 'Qurʾān' : 'Ḥadīth'}</Text>
        </View>
        <Text style={styles.reference}>{daleel.reference}</Text>
        {daleel.grade ? <Text style={styles.grade}>{daleel.grade}</Text> : null}
      </View>
      <Text style={styles.text}>{daleel.text}</Text>
      {daleel.narrator ? <Text style={styles.narrator}>— {daleel.narrator}</Text> : null}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: {
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
    backgroundColor: colors.cardElevated,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 4,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radius.sm,
    backgroundColor: `${colors.primary}1A`,
  },
  chipText: { ...typography.caption, fontSize: 11, fontWeight: '700', color: colors.primary },
  reference: { ...typography.caption, fontSize: 12, fontWeight: '600', color: colors.mutedForeground },
  grade: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  text: { ...typography.caption, fontSize: 13, lineHeight: 19, color: colors.foreground },
  narrator: { ...typography.caption, fontSize: 11, color: colors.subtleForeground, fontStyle: 'italic' },
});
