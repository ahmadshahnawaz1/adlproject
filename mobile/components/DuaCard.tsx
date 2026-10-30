/**
 * DuaCard — a supplication rendered beautifully: Arabic in a calm serif size,
 * its transliteration, the translation, and (when present) its evidence. Used
 * for the duʿās of fasting, the ʿashra invocations, the Qadr duʿā and the Eid
 * takbīr. A reusable building block — the screen passes the data.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Heart, Sparkles } from 'lucide-react-native';
import type { Dua } from '../content/fasting';
import { arabicFont, fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import DaleelBlock from './DaleelBlock';

/**
 * The Duʿāʾ Library's supplications carry an optional repeat count and a
 * one-line virtue; older callers (Fasting, Pilgrimage) pass a plain `Dua` and
 * so those extras simply don't render. The favourite control appears only when
 * the screen supplies `onToggleFavorite`.
 */
type DuaLike = Dua & { repeat?: number; virtue?: string };

export default function DuaCard({
  dua,
  showArabic = true,
  showDaleel = true,
  isFavorite = false,
  onToggleFavorite,
}: {
  dua: DuaLike;
  showArabic?: boolean;
  showDaleel?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const hasRepeat = typeof dua.repeat === 'number' && dua.repeat > 1;
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>{dua.title}</Text>
        {hasRepeat ? (
          <View style={styles.repeatPill}>
            <Text style={styles.repeatText}>×{dua.repeat}</Text>
          </View>
        ) : null}
        <Text style={styles.when} numberOfLines={2}>
          {dua.when}
        </Text>
        {onToggleFavorite ? (
          <Pressable onPress={onToggleFavorite} hitSlop={10} style={styles.fav}>
            <Heart
              size={18}
              color={isFavorite ? colors.primary : colors.subtleForeground}
              fill={isFavorite ? colors.primary : 'transparent'}
              strokeWidth={2}
            />
          </Pressable>
        ) : null}
      </View>

      {showArabic ? <Text style={styles.arabic}>{dua.arabic}</Text> : null}
      <Text style={styles.translit}>{dua.transliteration}</Text>
      <Text style={styles.translation}>{dua.translation}</Text>

      {dua.virtue ? (
        <View style={styles.virtue}>
          <Sparkles size={13} color={colors.primary} strokeWidth={2} />
          <Text style={styles.virtueText}>{dua.virtue}</Text>
        </View>
      ) : null}

      {showDaleel && dua.daleel ? (
        <View style={styles.daleel}>
          <DaleelBlock daleel={dua.daleel} />
        </View>
      ) : null}
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
    marginBottom: spacing.md,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  title: { ...typography.button, color: colors.foreground, flex: 1 },
  when: { ...typography.caption, fontSize: 11, color: colors.subtleForeground, textAlign: 'right' },
  arabic: {
    fontSize: 24,
    lineHeight: 44,
    color: colors.foreground,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: arabicFont,
    marginBottom: spacing.sm,
  },
  translit: {
    ...typography.body,
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.primary,
    lineHeight: 21,
    marginBottom: 4,
  },
  translation: { ...typography.body, fontSize: 14, color: colors.mutedForeground, lineHeight: 21 },
  repeatPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: `${colors.primary}1A`,
    borderWidth: 1,
    borderColor: `${colors.primary}55`,
  },
  repeatText: { fontFamily, fontSize: 11, fontWeight: '700', color: colors.primary },
  fav: { padding: 2 },
  virtue: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
  },
  virtueText: {
    flex: 1,
    fontFamily,
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 19,
    color: colors.mutedForeground,
  },
  daleel: { marginTop: spacing.md },
});
