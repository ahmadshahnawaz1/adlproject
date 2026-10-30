/**
 * HifzScreen — memorisation of the Qurʾān (F23).
 *
 * Today's review queue comes first: each due āyah is recalled from memory,
 * revealed, and graded, and the schedule places it where it is next needed.
 * Below that sit the surahs in progress and the method itself. The muṣḥaf text
 * is read from the bundled Qurʾān; nothing here is duplicated.
 */
import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { BookMarked, Brain, ChevronRight, Info, Plus, Trophy, X } from 'lucide-react-native';
import AppText from '../components/ui/AppText';
import HifzReviewCard from '../components/hifz/HifzReviewCard';
import HifzSurahPicker from '../components/hifz/HifzSurahPicker';
import useHifzProgress from '../hooks/useHifzProgress';
import { getAyah } from '../hooks/useQuranContent';
import { SURAHS, DEFAULT_TRANSLATION_ID } from '../content/quran';
import { ayahKey, formatRef } from '../lib/quran';
import {
  dueReviews,
  startedSurahs,
  totalMemorised,
  dueLabel,
  type ReviewGrade,
} from '../lib/hifz';
import {
  DALEEL_BEST,
  DALEEL_EASE,
  DALEEL_SLIPS_AWAY,
  HIFZ_ADAB,
  HIFZ_DISCLAIMER,
  HIFZ_INTRO,
  HIFZ_METHOD,
  HIFZ_REVIEW_NOTE,
} from '../content/hifz';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function HifzScreen({
  onNavigate,
  onClose,
}: {
  onNavigate?: (key: string) => void;
  onClose?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const hifz = useHifzProgress();
  const [revealed, setRevealed] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const due = useMemo(() => dueReviews(hifz.reviews), [hifz.reviews]);
  const started = useMemo(() => startedSurahs(hifz.reviews), [hifz.reviews]);
  const total = totalMemorised(hifz.reviews);
  const current = due[0];

  const ayah = useMemo(() => {
    if (!current) return null;
    const [s, a] = current.id.split(':').map(Number);
    if (!Number.isFinite(s) || !Number.isFinite(a)) return null;
    return getAyah(s, a) ?? null;
  }, [current]);

  const reference = useMemo(() => {
    if (!current) return '';
    const [s, a] = current.id.split(':').map(Number);
    return formatRef(s, a);
  }, [current]);

  const onGrade = useCallback(
    (grade: ReviewGrade) => {
      if (!current) return;
      hifz.grade(current.id, grade);
      setRevealed(false);
    },
    [current, hifz],
  );

  const addSurah = useCallback(
    (surah: number) => {
      const meta = SURAHS.find((s) => s.number === surah);
      if (!meta) return;
      const ids: string[] = [];
      for (let a = 1; a <= meta.ayahCount; a++) ids.push(ayahKey(surah, a));
      hifz.startRange(ids);
    },
    [hifz],
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Close">
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <AppText style={styles.headerTitle}>Ḥifẓ</AppText>
          <AppText style={styles.headerSub} numberOfLines={1}>
            {total > 0 ? `${total} āyahs · ${due.length} due today` : 'Memorise the Qurʾān'}
          </AppText>
        </View>
        <Pressable onPress={() => setInfoOpen(true)} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="About memorisation">
          <Info size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {current && ayah ? (
          <>
            <View style={styles.queueHead}>
              <AppText style={styles.queueLabel}>TODAY’S REVIEW</AppText>
              <AppText style={styles.queueCount}>{due.length} left</AppText>
            </View>
            <HifzReviewCard
              reference={reference}
              arabic={ayah.arabic}
              translation={ayah.translations?.[DEFAULT_TRANSLATION_ID]}
              revealed={revealed}
              onReveal={() => setRevealed(true)}
              onGrade={onGrade}
            />
          </>
        ) : total > 0 ? (
          <View style={styles.done}>
            <View style={styles.doneIcon}>
              <Trophy size={26} color={colors.primary} strokeWidth={2} />
            </View>
            <AppText style={styles.doneTitle}>Review complete</AppText>
            <AppText style={styles.doneNote}>
              Nothing is due today. Come back tomorrow — or add a new surah below and take fresh
              ground.
            </AppText>
          </View>
        ) : (
          <View style={styles.done}>
            <View style={styles.doneIcon}>
              <Brain size={26} color={colors.primary} strokeWidth={2} />
            </View>
            <AppText style={styles.doneTitle}>Begin your ḥifẓ</AppText>
            <AppText style={styles.doneNote}>{HIFZ_INTRO}</AppText>
          </View>
        )}

        <Pressable
          onPress={() => setPickerOpen(true)}
          style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Add a surah to memorise"
        >
          <Plus size={17} color={colors.primaryForeground} strokeWidth={2.4} />
          <AppText style={styles.addText}>Add a surah</AppText>
        </Pressable>

        {started.length > 0 ? (
          <View style={styles.section}>
            <AppText style={styles.sectionLabel}>IN PROGRESS</AppText>
            {started.map((p) => {
              const meta = SURAHS.find((s) => s.number === p.surah);
              const percent = Math.round(p.fraction * 100);
              return (
                <View key={p.surah} style={styles.progressRow}>
                  <View style={styles.progressBody}>
                    <AppText style={styles.progressName}>{meta?.name ?? `Surah ${p.surah}`}</AppText>
                    <AppText style={styles.progressMeta}>
                      {p.memorised} / {p.total} āyahs{p.due > 0 ? ` · ${p.due} due` : ''}
                    </AppText>
                    <View style={styles.rail}>
                      <View style={[styles.railFill, { width: `${percent}%` }]} />
                    </View>
                  </View>
                  <AppText style={styles.progressPct}>{percent}%</AppText>
                </View>
              );
            })}
          </View>
        ) : null}

        {due.length > 1 ? (
          <View style={styles.section}>
            <AppText style={styles.sectionLabel}>NEXT UP</AppText>
            {due.slice(1, 6).map((s) => {
              const [sn, an] = s.id.split(':').map(Number);
              return (
                <View key={s.id} style={styles.upNext}>
                  <AppText style={styles.upNextRef}>{formatRef(sn, an)}</AppText>
                  <AppText style={styles.upNextDue}>{dueLabel(s)}</AppText>
                </View>
              );
            })}
          </View>
        ) : null}

        <Pressable
          onPress={() => onNavigate?.('quran')}
          style={({ pressed }) => [styles.link, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Open the muṣḥaf to read"
        >
          <View style={styles.linkIcon}>
            <BookMarked size={18} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.linkText}>
            <AppText style={styles.linkTitle}>Open the muṣḥaf</AppText>
            <AppText style={styles.linkSub}>Read and listen before you memorise</AppText>
          </View>
          <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
        </Pressable>

        <AppText style={styles.disclaimer}>{HIFZ_DISCLAIMER}</AppText>
      </ScrollView>

      <HifzSurahPicker
        visible={pickerOpen}
        reviews={hifz.reviews}
        onSelect={addSurah}
        onClose={() => setPickerOpen(false)}
      />

      <Modal visible={infoOpen} transparent animationType="slide" onRequestClose={() => setInfoOpen(false)}>
        <View style={styles.infoRoot}>
          <Pressable style={styles.backdrop} onPress={() => setInfoOpen(false)} accessibilityLabel="Close" />
          <View style={styles.infoSheet}>
            <View style={styles.handle} />
            <View style={styles.header2}>
              <AppText style={styles.infoTitle}>How to memorise</AppText>
              <Pressable onPress={() => setInfoOpen(false)} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Close">
                <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.infoContent}>
              <Evidence daleel={DALEEL_EASE} />
              <AppText style={styles.infoBody}>{HIFZ_INTRO}</AppText>

              <AppText style={styles.infoLabel}>THE METHOD</AppText>
              {HIFZ_METHOD.map((step, i) => (
                <View key={step.id} style={styles.step}>
                  <View style={styles.stepNum}>
                    <AppText style={styles.stepNumText}>{i + 1}</AppText>
                  </View>
                  <View style={styles.stepBody}>
                    <AppText style={styles.stepTitle}>{step.title}</AppText>
                    <AppText style={styles.infoBody}>{step.detail}</AppText>
                  </View>
                </View>
              ))}

              <AppText style={styles.infoLabel}>WHY REVIEW MATTERS</AppText>
              <Evidence daleel={DALEEL_SLIPS_AWAY} />
              <AppText style={styles.infoBody}>{HIFZ_REVIEW_NOTE}</AppText>

              <AppText style={styles.infoLabel}>ETIQUETTE</AppText>
              {HIFZ_ADAB.map((line) => (
                <View key={line} style={styles.adabRow}>
                  <AppText style={styles.bullet}>·</AppText>
                  <AppText style={styles.infoBody}>{line}</AppText>
                </View>
              ))}

              <Evidence daleel={DALEEL_BEST} />

              <View style={styles.infoDisclaimer}>
                <AppText style={styles.infoDisclaimerText}>{HIFZ_DISCLAIMER}</AppText>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Evidence({
  daleel,
}: {
  daleel: { reference: string; narrator?: string; grade?: string; text: string };
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.evidence}>
      <AppText style={styles.evidenceText}>“{daleel.text}”</AppText>
      <AppText style={styles.evidenceRef}>
        {daleel.reference}
        {daleel.narrator ? ` · ${daleel.narrator}` : ''}
        {daleel.grade ? ` · ${daleel.grade}` : ''}
      </AppText>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingTop: spacing['3xl'] + spacing.md,
      paddingBottom: spacing.md,
    },
    header2: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    iconBtn: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerCenter: { flex: 1, alignItems: 'center', gap: 1 },
    headerTitle: { fontFamily, fontSize: 16, fontWeight: '700', color: colors.foreground },
    headerSub: { fontFamily, fontSize: 11, color: colors.subtleForeground },
    scroll: { paddingBottom: spacing['3xl'], gap: spacing.lg },
    queueHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    queueLabel: {
      ...typography.caption,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.primary,
    },
    queueCount: { ...typography.caption, fontSize: 11, color: colors.subtleForeground },
    done: {
      alignItems: 'center',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.xl,
      gap: spacing.sm,
    },
    doneIcon: {
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.primary}1A`,
    },
    doneTitle: { ...typography.title, fontSize: 19, color: colors.foreground, textAlign: 'center' },
    doneNote: {
      fontFamily,
      fontSize: 14,
      lineHeight: 22,
      color: colors.mutedForeground,
      textAlign: 'center',
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      minHeight: 48,
    },
    addText: { ...typography.button, color: colors.primaryForeground },
    section: { gap: spacing.sm },
    sectionLabel: {
      ...typography.caption,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.subtleForeground,
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    progressBody: { flex: 1, gap: 3 },
    progressName: { fontFamily, fontSize: 15, fontWeight: '600', color: colors.foreground },
    progressMeta: { fontFamily, fontSize: 12, color: colors.mutedForeground },
    rail: { height: 4, borderRadius: 2, backgroundColor: colors.input, overflow: 'hidden' },
    railFill: { height: '100%', borderRadius: 2, backgroundColor: colors.primary },
    progressPct: { ...typography.title, fontSize: 15, color: colors.primary },
    upNext: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      minHeight: 44,
    },
    upNextRef: { fontFamily, fontSize: 14, color: colors.foreground },
    upNextDue: { ...typography.caption, fontSize: 11, color: colors.subtleForeground },
    link: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.md,
      minHeight: 60,
    },
    linkIcon: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.primary}14`,
    },
    linkText: { flex: 1, gap: 1 },
    linkTitle: { fontFamily, fontSize: 15, fontWeight: '600', color: colors.foreground },
    linkSub: { fontFamily, fontSize: 12, color: colors.mutedForeground },
    disclaimer: {
      fontFamily,
      fontSize: 12,
      lineHeight: 18,
      color: colors.subtleForeground,
      textAlign: 'center',
    },
    infoRoot: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
    infoSheet: {
      maxHeight: '85%',
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    infoTitle: { ...typography.title, fontSize: 18, color: colors.foreground },
    infoContent: { paddingVertical: spacing.md, gap: spacing.sm },
    infoLabel: {
      ...typography.caption,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.primary,
      marginTop: spacing.md,
    },
    infoBody: { fontFamily, fontSize: 14, lineHeight: 22, color: colors.mutedForeground },
    step: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
    stepNum: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.primary}1A`,
      marginTop: 2,
    },
    stepNumText: { ...typography.caption, fontSize: 11, fontWeight: '700', color: colors.primary },
    stepBody: { flex: 1, gap: 2 },
    stepTitle: { fontFamily, fontSize: 15, fontWeight: '600', color: colors.foreground },
    adabRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
    bullet: { fontFamily, fontSize: 16, color: colors.primary, lineHeight: 22 },
    evidence: {
      borderRadius: radius.md,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      backgroundColor: colors.card,
      padding: spacing.md,
      gap: 4,
    },
    evidenceText: { fontFamily, fontSize: 14, lineHeight: 22, color: colors.foreground },
    evidenceRef: { ...typography.caption, fontSize: 11, color: colors.primary },
    infoDisclaimer: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    infoDisclaimerText: { fontFamily, fontSize: 12, lineHeight: 19, color: colors.subtleForeground },
    pressed: { opacity: 0.85 },
  });
