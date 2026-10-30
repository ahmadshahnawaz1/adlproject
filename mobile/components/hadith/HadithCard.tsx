/**
 * HadithCard — one narration, presented with care (F18).
 *
 * The chapter and its grade sit at the top; the Arabic (in the bundled
 * Scheherazade) leads, then the translation, the narrator, an optional isnād,
 * cross-references, and a quiet actions row (bookmark, copy, share). The grade
 * is always visible so authenticity is never in doubt.
 */
import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Bookmark, ChevronDown, ChevronUp, Copy, Check, Share2 } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import GradeChip from './GradeChip';
import { gradeLabel, type Hadith } from '../../lib/hadith';
import { fontFamily, quranFonts, radius, spacing, typography } from '../../theme/tokens';

function buildShareText(h: Hadith): string {
  const lines = [h.arabic, '', h.translation];
  if (h.narrator) lines.push('', `— Narrated by ${h.narrator}`);
  lines.push(`Grade: ${gradeLabel(h.grade.ruling)}${h.grade.grader ? ` (${h.grade.grader})` : ''}`);
  if (h.references?.length) lines.push(h.references.join(' · '));
  return lines.join('\n');
}

export default function HadithCard({
  hadith,
  arabicFontSize = 26,
  showTranslation = true,
  showIsnad = false,
  isBookmarked = false,
  onToggleBookmark,
}: {
  hadith: Hadith;
  arabicFontSize?: number;
  showTranslation?: boolean;
  showIsnad?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [copied, setCopied] = useState(false);
  const [isnadOpen, setIsnadOpen] = useState(showIsnad);

  const copy = async () => {
    await Clipboard.setStringAsync(buildShareText(hadith));
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  const share = () => Share.share({ message: buildShareText(hadith) }).catch(() => {});

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.numWrap}>
          <Text style={styles.num}>{hadith.number}</Text>
        </View>
        <Text style={styles.chapter} numberOfLines={2}>
          {hadith.chapter ?? hadith.book ?? ''}
        </Text>
        <GradeChip grade={hadith.grade} />
      </View>

      <Text style={[styles.arabic, { fontSize: arabicFontSize, lineHeight: arabicFontSize * 1.9 }]}>
        {hadith.arabic}
      </Text>

      {showTranslation ? (
        <>
          <View style={styles.divider} />
          <Text style={styles.translation}>{hadith.translation}</Text>
        </>
      ) : null}

      {hadith.narrator ? (
        <Text style={styles.narrator}>— Narrated by {hadith.narrator}</Text>
      ) : null}

      {hadith.isnad ? (
        <Pressable
          onPress={() => setIsnadOpen((v) => !v)}
          style={styles.isnadToggle}
          accessibilityRole="button"
          accessibilityLabel={isnadOpen ? 'Hide chain of narration' : 'Show chain of narration'}
        >
          {isnadOpen ? (
            <ChevronUp size={14} color={colors.primary} strokeWidth={2.2} />
          ) : (
            <ChevronDown size={14} color={colors.primary} strokeWidth={2.2} />
          )}
          <Text style={styles.isnadToggleText}>{isnadOpen ? 'Hide chain (isnād)' : 'Show chain (isnād)'}</Text>
        </Pressable>
      ) : null}
      {hadith.isnad && isnadOpen ? <Text style={styles.isnad}>{hadith.isnad}</Text> : null}

      {hadith.references?.length ? (
        <View style={styles.refs}>
          {hadith.references.map((r) => (
            <Text key={r} style={styles.ref}>
              {r}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={onToggleBookmark}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <Bookmark
            size={17}
            color={isBookmarked ? colors.primary : colors.mutedForeground}
            fill={isBookmarked ? colors.primary : 'transparent'}
            strokeWidth={2}
          />
        </Pressable>
        <Pressable
          onPress={copy}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Copy"
        >
          {copied ? (
            <Check size={17} color={colors.success} strokeWidth={2.4} />
          ) : (
            <Copy size={17} color={colors.mutedForeground} strokeWidth={2} />
          )}
        </Pressable>
        <Pressable
          onPress={share}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Share"
        >
          <Share2 size={17} color={colors.mutedForeground} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      gap: spacing.md,
    },
    head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    numWrap: {
      width: 30,
      height: 30,
      borderRadius: radius.full,
      backgroundColor: `${colors.primary}1A`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    num: { fontFamily, fontSize: 13, fontWeight: '700', color: colors.primary },
    chapter: { flex: 1, minWidth: 0, ...typography.button, fontSize: 14, color: colors.foreground },
    arabic: {
      fontFamily: quranFonts.scheherazade,
      color: colors.foreground,
      textAlign: 'right',
      writingDirection: 'rtl',
    },
    divider: { height: 1, backgroundColor: colors.border },
    translation: { fontFamily, fontSize: 15, lineHeight: 24, color: colors.foreground },
    narrator: { fontFamily, fontSize: 13, color: colors.mutedForeground, fontStyle: 'italic' },
    isnadToggle: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    isnadToggleText: { fontFamily, fontSize: 12, fontWeight: '600', color: colors.primary },
    isnad: {
      fontFamily,
      fontSize: 13,
      lineHeight: 20,
      color: colors.mutedForeground,
      backgroundColor: colors.cardElevated,
      borderRadius: radius.md,
      padding: spacing.md,
    },
    refs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    ref: {
      fontFamily,
      fontSize: 11,
      fontWeight: '600',
      color: colors.subtleForeground,
      backgroundColor: colors.cardElevated,
      borderRadius: radius.sm,
      paddingVertical: 3,
      paddingHorizontal: 8,
      overflow: 'hidden',
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.lg,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    action: { padding: 2 },
    pressed: { opacity: 0.6 },
  });
