/**
 * LessonView — the renderer for a lesson or Sīrah event body.
 *
 * It walks the ordered `LessonBlock[]` vocabulary and renders each block in the
 * app's palette: flowing prose, sub-headings, bulleted and numbered lists,
 * Qurʾānic āyāt (Arabic + translation), cited ḥadīth through the shared
 * DaleelBlock, gently toned callouts, and short duʿās. One renderer serves every
 * teaching surface in the Learning Hub.
 */
import { StyleSheet, Text, View } from 'react-native';
import { Lightbulb, Quote, Sparkles, TriangleAlert } from 'lucide-react-native';
import type { CalloutTone, LessonBlock } from '../../content/learn';
import DaleelBlock from '../DaleelBlock';
import { arabicFont, fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

type ColorKey = 'primary' | 'success' | 'destructive';

const TONE: Record<CalloutTone, { colorKey: ColorKey; Icon: typeof Lightbulb; label: string }> = {
  note: { colorKey: 'primary', Icon: Quote, label: 'Note' },
  tip: { colorKey: 'success', Icon: Lightbulb, label: 'Tip' },
  wisdom: { colorKey: 'primary', Icon: Sparkles, label: 'Wisdom' },
  caution: { colorKey: 'destructive', Icon: TriangleAlert, label: 'Take care' },
};

function Block({ block }: { block: LessonBlock }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  switch (block.kind) {
    case 'para':
      return <Text style={styles.para}>{block.text}</Text>;

    case 'heading':
      return <Text style={styles.heading}>{block.text}</Text>;

    case 'point':
      return (
        <View style={styles.list}>
          {block.items.map((item, i) => (
            <View key={i} style={styles.listRow}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );

    case 'steps':
      return (
        <View style={styles.list}>
          {block.items.map((item, i) => (
            <View key={i} style={styles.listRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );

    case 'ayah':
      return (
        <View style={styles.ayah}>
          <Text style={styles.ayahArabic}>{block.arabic}</Text>
          <Text style={styles.ayahTranslation}>“{block.translation}”</Text>
          <Text style={styles.ayahRef}>{block.reference}</Text>
        </View>
      );

    case 'hadith':
      return <DaleelBlock daleel={block.daleel} />;

    case 'callout': {
      const tone = TONE[block.tone];
      const Icon = tone.Icon;
      const toneColor = colors[tone.colorKey];
      return (
        <View style={[styles.callout, { borderLeftColor: toneColor, backgroundColor: `${toneColor}14` }]}>
          <View style={styles.calloutHead}>
            <Icon size={13} color={toneColor} strokeWidth={2.4} />
            <Text style={[styles.calloutLabel, { color: toneColor }]}>
              {block.title ?? tone.label}
            </Text>
          </View>
          <Text style={styles.calloutText}>{block.text}</Text>
        </View>
      );
    }

    case 'dua':
      return (
        <View style={styles.dua}>
          <Text style={styles.duaArabic}>{block.arabic}</Text>
          {block.transliteration ? (
            <Text style={styles.duaTranslit}>{block.transliteration}</Text>
          ) : null}
          <Text style={styles.duaTranslation}>{block.translation}</Text>
          {block.reference ? <Text style={styles.duaRef}>{block.reference}</Text> : null}
        </View>
      );

    default:
      return null;
  }
}

export default function LessonView({ body }: { body: LessonBlock[] }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.wrap}>
      {body.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: { gap: spacing.md },
  para: { fontFamily, fontSize: 15, lineHeight: 24, color: colors.foreground },
  heading: {
    ...typography.button,
    fontSize: 13,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.xs,
  },
  list: { gap: spacing.sm },
  listRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 9,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumText: { fontFamily, fontSize: 11, fontWeight: '700', color: colors.primary },
  listText: { flex: 1, fontFamily, fontSize: 15, lineHeight: 23, color: colors.foreground },
  ayah: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  ayahArabic: {
    fontFamily: arabicFont,
    fontSize: 22,
    lineHeight: 40,
    color: colors.foreground,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  ayahTranslation: { fontFamily, fontSize: 14, lineHeight: 22, color: colors.mutedForeground, fontStyle: 'italic' },
  ayahRef: { ...typography.caption, fontSize: 12, fontWeight: '600', color: colors.primary },
  callout: {
    borderLeftWidth: 2,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 4,
  },
  calloutHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  calloutLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  calloutText: { fontFamily, fontSize: 14, lineHeight: 21, color: colors.foreground },
  dua: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  duaArabic: {
    fontFamily: arabicFont,
    fontSize: 22,
    lineHeight: 40,
    color: colors.foreground,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  duaTranslit: { fontFamily, fontSize: 13, lineHeight: 20, color: colors.primary },
  duaTranslation: { fontFamily, fontSize: 14, lineHeight: 22, color: colors.mutedForeground },
  duaRef: { ...typography.caption, fontSize: 12, fontWeight: '600', color: colors.subtleForeground },
});
