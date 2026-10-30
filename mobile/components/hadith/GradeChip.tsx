/**
 * GradeChip — the authenticity signal on every narration (F18).
 *
 * A compact, colour-coded pill: green for ṣaḥīḥ, gold for ḥasan, muted for
 * weak, red for fabricated — with the grader when there is room. This is the
 * feature's trust marker and is never omitted.
 */
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { gradeMeta, type Grade } from '../../lib/hadith';
import { fontFamily, radius } from '../../theme/tokens';

export default function GradeChip({
  grade,
  showGrader = false,
}: {
  grade: Grade;
  showGrader?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const meta = gradeMeta(grade.ruling);

  const tone =
    meta.tone === 'authentic'
      ? colors.success
      : meta.tone === 'good'
        ? colors.primary
        : meta.tone === 'weak'
          ? colors.mutedForeground
          : colors.destructive;

  return (
    <View style={[styles.chip, { backgroundColor: `${tone}1A`, borderColor: `${tone}55` }]}>
      <View style={[styles.dot, { backgroundColor: tone }]} />
      <Text style={[styles.label, { color: tone }]} numberOfLines={1}>
        {meta.short}
        {showGrader && grade.grader ? ` · ${grade.grader}` : ''}
      </Text>
    </View>
  );
}

const makeStyles = (_colors: ThemeColors) =>
  StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: radius.full,
      borderWidth: 1,
      alignSelf: 'flex-start',
      maxWidth: '100%',
    },
    dot: { width: 6, height: 6, borderRadius: 3 },
    label: {
      fontFamily,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.2,
      flexShrink: 1,
    },
  });
