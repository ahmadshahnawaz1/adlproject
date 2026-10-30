/**
 * AdhkarScreen — the daily remembrances, counted by touch (Ḥiṣn al-Muslim).
 *
 * Choose a moment of the day — morning, evening, after ṣalāh, before sleep or
 * on waking — and move through its remembrances one card at a time: the Arabic,
 * its transliteration and meaning, the repetitions owed, and (one tap away) the
 * virtue and evidence. A live summary tracks the set's progress and the
 * day-by-day streak; the counts renew each day. Fully offline, evidence-cited.
 */
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Check, Flame, Info, RotateCcw, X } from 'lucide-react-native';
import AdhkarCard from '../components/AdhkarCard';
import CategoryTabs from '../components/CategoryTabs';
import ProgressRing from '../components/ProgressRing';
import useAdhkarProgress from '../hooks/useAdhkarProgress';
import {
  ADHKAR_CATEGORIES,
  ADHKAR_DISCLAIMER,
  categoryById,
  categoryProgress,
  completedDhikrCount,
  DEFAULT_CATEGORY_ID,
  isCategoryComplete,
} from '../lib/adhkar';
import type { AdhkarCategoryId } from '../content/adhkar';
import { arabicFont, fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function AdhkarScreen({ onClose }: { onClose?: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { ready, countsFor, tap, undo, resetCategory, streak, completedToday } =
    useAdhkarProgress();
  const [categoryId, setCategoryId] = useState<AdhkarCategoryId>(DEFAULT_CATEGORY_ID);
  const [infoOpen, setInfoOpen] = useState(false);

  const category = categoryById(categoryId) ?? ADHKAR_CATEGORIES[0];
  const counts = countsFor(category.id);

  const progress = useMemo(() => categoryProgress(counts, category), [counts, category]);
  const doneCount = useMemo(() => completedDhikrCount(counts, category), [counts, category]);
  const complete = useMemo(() => isCategoryComplete(counts, category), [counts, category]);
  const total = category.dhikr.length;
  const pct = Math.round(progress * 100);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Adhkār</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {category.timeHint}
          </Text>
        </View>
        <Pressable onPress={() => setInfoOpen(true)} hitSlop={12} style={styles.iconBtn}>
          <Info size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
      </View>

      {/* Category chooser (full-bleed) */}
      <View style={styles.tabsWrap}>
        <CategoryTabs
          categories={ADHKAR_CATEGORIES}
          selectedId={category.id}
          completedIds={completedToday}
          onSelect={setCategoryId}
        />
      </View>

      {/* Live summary */}
      <View style={styles.summary}>
        <ProgressRing
          fraction={progress}
          size={56}
          stroke={4.5}
          complete={complete}
          label={`${pct}`}
          sublabel="%"
        />
        <View style={styles.summaryText}>
          <Text style={styles.summaryArabic}>{category.arabic}</Text>
          <Text style={styles.summaryCount}>
            {complete ? 'Set complete — māshāʾAllāh' : `${doneCount} of ${total} remembrances`}
          </Text>
        </View>
        {streak > 0 ? (
          <View style={styles.streakPill}>
            <Flame size={14} color={colors.primary} strokeWidth={2.4} />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        ) : null}
      </View>

      {/* The remembrances */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {ready
          ? category.dhikr.map((d, i) => (
              <AdhkarCard
                key={d.id}
                dhikr={d}
                order={i + 1}
                count={counts[d.id] ?? 0}
                onTap={() => tap(category, d)}
                onUndo={() => undo(category, d)}
              />
            ))
          : null}

        <View style={styles.footer}>
          <Pressable onPress={() => resetCategory(category.id)} hitSlop={8} style={styles.resetBtn}>
            <RotateCcw size={14} color={colors.subtleForeground} strokeWidth={2.2} />
            <Text style={styles.resetText}>Reset this set</Text>
          </Pressable>
          <Text style={styles.disclaimer}>{ADHKAR_DISCLAIMER}</Text>
        </View>
      </ScrollView>

      {/* Info sheet */}
      <Modal visible={infoOpen} transparent animationType="slide" onRequestClose={() => setInfoOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setInfoOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>About adhkār</Text>
            <Pressable onPress={() => setInfoOpen(false)} hitSlop={12} style={styles.close}>
              <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            <Text style={styles.sheetLead}>
              The remembrances of the morning and evening are a fortress (ḥiṣn) for the believer —
              said each day, they guard the heart and the limbs.
            </Text>
            <View style={styles.sheetRow}>
              <View style={styles.sheetDot}>
                <Check size={14} color={colors.primary} strokeWidth={2.4} />
              </View>
              <Text style={styles.sheetRowText}>
                Tap a card to count each repetition; a soft buzz marks a finished dhikr, and a warm
                one marks a completed set.
              </Text>
            </View>
            <View style={styles.sheetRow}>
              <View style={styles.sheetDot}>
                <Flame size={14} color={colors.primary} strokeWidth={2.4} />
              </View>
              <Text style={styles.sheetRowText}>
                Complete at least one set a day to build your streak. Progress renews each day; the
                streak is kept.
              </Text>
            </View>
            <View style={styles.sheetDisclaimer}>
              <Text style={styles.sheetDisclaimerText}>{ADHKAR_DISCLAIMER}</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing['3xl'] + spacing.md,
    paddingBottom: spacing.lg,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  headerTitle: { fontFamily, fontSize: 17, fontWeight: '700', color: colors.foreground },
  headerSub: { fontFamily, fontSize: typography.caption.fontSize, color: colors.subtleForeground },

  tabsWrap: { marginHorizontal: -spacing.lg, marginBottom: spacing.md },

  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.md,
  },
  summaryText: { flex: 1, gap: 2 },
  summaryArabic: { fontFamily: arabicFont, fontSize: 18, color: colors.foreground, writingDirection: 'rtl' },
  summaryCount: { fontFamily, fontSize: typography.caption.fontSize, color: colors.mutedForeground },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: `${colors.primary}55`,
    backgroundColor: `${colors.primary}1A`,
  },
  streakText: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '700', color: colors.primary },

  scroll: { paddingBottom: spacing.xl, gap: spacing.md },
  footer: { gap: spacing.md, paddingTop: spacing.sm },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  resetText: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '600', color: colors.subtleForeground },
  disclaimer: { fontFamily, fontSize: 12, lineHeight: 18, color: colors.subtleForeground, textAlign: 'center' },

  // info sheet
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '80%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sheetTitle: { ...typography.title, color: colors.foreground },
  close: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.cardElevated,
  },
  sheetContent: { paddingBottom: spacing.lg, gap: spacing.md },
  sheetLead: { fontFamily, fontSize: typography.body.fontSize, lineHeight: 22, color: colors.mutedForeground },
  sheetRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  sheetDot: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  sheetRowText: { flex: 1, fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.mutedForeground },
  sheetDisclaimer: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
  },
  sheetDisclaimerText: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.subtleForeground },
});
