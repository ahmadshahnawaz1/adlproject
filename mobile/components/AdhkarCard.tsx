/**
 * AdhkarCard — one remembrance, counted by touch. The card shows its order in
 * the set, a ring tracking the repetitions owed, the Arabic in a calm serif,
 * its transliteration and translation, and an optional practical note. Tapping
 * the body counts one repetition (the parent owns the numbers and the haptics);
 * a small footer lets you ease a miscount or reveal the virtue and evidence.
 * When the repetitions are complete the card settles into a soft gold rest.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BookOpen, Check, RotateCcw, Sparkles } from 'lucide-react-native';
import type { Dhikr } from '../content/adhkar';
import { arabicFont, fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import DaleelBlock from './DaleelBlock';
import ProgressRing from './ProgressRing';

export default function AdhkarCard({
  dhikr,
  order,
  count,
  onTap,
  onUndo,
  showArabic = true,
}: {
  dhikr: Dhikr;
  order: number;
  count: number;
  onTap: () => void;
  onUndo: () => void;
  showArabic?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [showEvidence, setShowEvidence] = useState(false);
  const complete = count >= dhikr.repeat;
  const fraction = dhikr.repeat > 0 ? Math.min(1, count / dhikr.repeat) : 0;
  const multi = dhikr.repeat > 1;
  const hasEvidence = Boolean(dhikr.daleel || dhikr.virtue);

  return (
    <View style={[styles.card, complete && styles.cardComplete]}>
      {/* header — order + progress */}
      <View style={styles.head}>
        <View style={[styles.order, complete && styles.orderComplete]}>
          {complete ? (
            <Check size={14} color={colors.primaryForeground} strokeWidth={2.8} />
          ) : (
            <Text style={styles.orderText}>{order}</Text>
          )}
        </View>
        <View style={styles.headSpacer} />
        {multi ? (
          <ProgressRing
            fraction={fraction}
            size={44}
            stroke={3.5}
            complete={complete}
            label={String(count)}
            sublabel={`/${dhikr.repeat}`}
          />
        ) : (
          <View style={[styles.oncePill, complete && styles.oncePillDone]}>
            <Text style={[styles.onceText, complete && styles.onceTextDone]}>
              {complete ? 'Done' : 'Once'}
            </Text>
          </View>
        )}
      </View>

      {/* count zone — tap to advance */}
      <Pressable
        onPress={complete ? undefined : onTap}
        style={({ pressed }) => [styles.zone, pressed && !complete && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={
          multi
            ? `${dhikr.transliteration}. ${count} of ${dhikr.repeat}. Tap to count.`
            : `${dhikr.transliteration}. Tap when done.`
        }
      >
        {showArabic ? <Text style={styles.arabic}>{dhikr.arabic}</Text> : null}
        <Text style={styles.translit}>{dhikr.transliteration}</Text>
        <Text style={styles.translation}>{dhikr.translation}</Text>
        {!complete ? (
          <Text style={styles.tapHint}>
            {multi ? `Tap to count · ${dhikr.repeat - count} left` : 'Tap when done'}
          </Text>
        ) : null}
      </Pressable>

      {dhikr.note ? (
        <View style={styles.note}>
          <Text style={styles.noteText}>{dhikr.note}</Text>
        </View>
      ) : null}

      {/* footer controls */}
      {count > 0 || hasEvidence ? (
        <View style={styles.footer}>
          {count > 0 ? (
            <Pressable onPress={onUndo} hitSlop={8} style={styles.ctrl}>
              <RotateCcw size={14} color={colors.subtleForeground} strokeWidth={2.2} />
              <Text style={styles.ctrlText}>Undo</Text>
            </Pressable>
          ) : (
            <View />
          )}
          {hasEvidence ? (
            <Pressable onPress={() => setShowEvidence((v) => !v)} hitSlop={8} style={styles.ctrl}>
              <BookOpen size={14} color={colors.primary} strokeWidth={2.2} />
              <Text style={[styles.ctrlText, { color: colors.primary }]}>
                {showEvidence ? 'Hide evidence' : 'Evidence'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {showEvidence ? (
        <View style={styles.evidence}>
          {dhikr.virtue ? (
            <View style={styles.virtue}>
              <Sparkles size={14} color={colors.primary} strokeWidth={2.2} />
              <Text style={styles.virtueText}>{dhikr.virtue}</Text>
            </View>
          ) : null}
          {dhikr.daleel ? <DaleelBlock daleel={dhikr.daleel} /> : null}
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardComplete: { borderColor: `${colors.primary}55`, backgroundColor: `${colors.primary}0A` },
  head: { flexDirection: 'row', alignItems: 'center' },
  order: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderComplete: { borderColor: colors.primary, backgroundColor: colors.primary },
  orderText: { fontFamily, fontSize: 12, fontWeight: '700', color: colors.mutedForeground },
  headSpacer: { flex: 1 },
  oncePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
  },
  oncePillDone: { borderColor: `${colors.primary}55`, backgroundColor: `${colors.primary}1A` },
  onceText: { fontFamily, fontSize: 12, fontWeight: '600', color: colors.mutedForeground },
  onceTextDone: { color: colors.primary },
  zone: { gap: 6 },
  pressed: { opacity: 0.6 },
  arabic: {
    fontFamily: arabicFont,
    fontSize: 26,
    lineHeight: 48,
    color: colors.foreground,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  translit: { fontFamily, fontSize: 14, fontStyle: 'italic', color: colors.primary, lineHeight: 21 },
  translation: { fontFamily, fontSize: 14, color: colors.mutedForeground, lineHeight: 21 },
  tapHint: { fontFamily, fontSize: typography.caption.fontSize, color: colors.subtleForeground, marginTop: 2 },
  note: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  noteText: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 19, color: colors.mutedForeground },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  ctrl: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 2 },
  ctrlText: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '600', color: colors.subtleForeground },
  evidence: { gap: spacing.sm },
  virtue: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.cardElevated,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  virtueText: { flex: 1, fontFamily, fontSize: typography.caption.fontSize, fontStyle: 'italic', lineHeight: 19, color: colors.mutedForeground },
});
