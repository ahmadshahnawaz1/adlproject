/**
 * RamadanScreen — Ramaḍān Mode (F22).
 *
 * The seasonal hub for the month: where you are in it, tonight's Tarāwīḥ, the
 * nightly checklist, the last ten nights with Laylat al-Qadr, and the ashra
 * duʿāʾ. The daytime fast, its times and its ledger stay in the Fasting screen —
 * this screen links there rather than repeating it. Fully offline.
 */
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { BookOpen, Check, ChevronRight, Circle, Info, Moon, Sparkles, Utensils, X } from 'lucide-react-native';
import AppText from '../components/ui/AppText';
import TaraweehTracker from '../components/ramadan/TaraweehTracker';
import QadrNightsCard from '../components/ramadan/QadrNightsCard';
import useRamadanLog from '../hooks/useRamadanLog';
import { haptics } from '../lib/haptics';
import { toHijri } from '../lib/hijriCalendar';
import { ramadanInfo, daysUntilRamadan } from '../lib/fasting';
import { ASHRAS } from '../content/fasting/fasting';
import {
  NIGHT_HABITS,
  RAMADAN_DAYS,
  averageRakahs,
  habitProgress,
  isHabitDone,
  lastTenNights,
  monthProgress,
  nightKey,
  nightsStood,
  taraweehOn,
  taraweehTotal,
} from '../lib/ramadan';
import {
  DALEEL_QADR_SEEK_ODD,
  DALEEL_TARAWEEH,
  ITIKAF_INTRO,
  QADR_DUA,
  QADR_INTRO,
  QADR_SIGNS,
  QADR_SIGNS_NOTE,
  RAMADAN_DISCLAIMER,
  TARAWEEH_INTRO,
  TARAWEEH_NOTE,
  TARAWEEH_OPINIONS,
} from '../content/ramadan';
import { arabicFont, fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function RamadanScreen({
  onNavigate,
  onClose,
}: {
  onNavigate?: (key: string) => void;
  onClose?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const log = useRamadanLog();
  const [infoOpen, setInfoOpen] = useState(false);

  const now = useMemo(() => new Date(), []);
  const info = useMemo(() => ramadanInfo(toHijri(now)), [now]);
  const untilRamadan = useMemo(() => daysUntilRamadan(now), [now]);
  const nights = useMemo(() => lastTenNights(now), [now]);
  const key = nightKey(now);

  const ashra = info.isRamadan ? ASHRAS[info.ashraIndex === -1 ? 0 : info.ashraIndex] : null;
  const tonight = taraweehOn(log.taraweeh, key);
  const percent = Math.round(monthProgress(info.day) * 100);
  const habitDone = Math.round(habitProgress(log.habits, key) * 100);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Close">
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <AppText style={styles.headerTitle}>Ramaḍān</AppText>
          <AppText style={styles.headerSub} numberOfLines={1}>
            {info.isRamadan
              ? `Day ${info.day} of ${RAMADAN_DAYS} · ${info.daysLeft} left`
              : untilRamadan != null
                ? `In ${untilRamadan} day${untilRamadan === 1 ? '' : 's'}, in shāʾ Allāh`
                : 'The month of the Qurʾān'}
          </AppText>
        </View>
        <Pressable onPress={() => setInfoOpen(true)} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="About Ramaḍān worship">
          <Info size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {info.isRamadan ? (
          <View style={styles.hero}>
            <AppText style={styles.heroDay}>{info.day}</AppText>
            <AppText style={styles.heroLabel}>of {RAMADAN_DAYS}</AppText>
            <View style={styles.rail}>
              <View style={[styles.railFill, { width: `${percent}%` }]} />
            </View>
            {ashra ? (
              <>
                <AppText style={styles.ashraTitle}>{ashra.title}</AppText>
                <AppText style={styles.ashraArabic}>{ashra.arabic}</AppText>
                <AppText style={styles.ashraDesc}>{ashra.description}</AppText>
                <View style={styles.duaBox}>
                  <AppText style={styles.duaArabic}>{ashra.dua.arabic}</AppText>
                  <AppText style={styles.duaTranslit}>{ashra.dua.transliteration}</AppText>
                  <AppText style={styles.duaTranslation}>{ashra.dua.translation}</AppText>
                </View>
              </>
            ) : null}
          </View>
        ) : (
          <View style={styles.waiting}>
            <View style={styles.waitingIcon}>
              <Moon size={26} color={colors.primary} strokeWidth={2} />
            </View>
            <AppText style={styles.waitingTitle}>
              {untilRamadan != null ? `${untilRamadan} days until Ramaḍān` : 'Ramaḍān'}
            </AppText>
            <AppText style={styles.waitingNote}>
              The tracker below is ready for the month. Dates follow the offline Umm al-Qurā
              calendar and are subject to the moon sighting where you are.
            </AppText>
          </View>
        )}

        <TaraweehTracker
          tonight={tonight}
          nightsStood={nightsStood(log.taraweeh)}
          total={taraweehTotal(log.taraweeh)}
          average={averageRakahs(log.taraweeh)}
          onChange={(r) => log.setTaraweeh(key, r)}
        />

        {/* Nightly checklist */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <AppText style={styles.cardTitle}>Tonight</AppText>
            <AppText style={styles.cardMeta}>{habitDone}%</AppText>
          </View>
          <View style={styles.habits}>
            {NIGHT_HABITS.map((habit) => {
              const done = isHabitDone(log.habits, key, habit.id);
              return (
                <Pressable
                  key={habit.id}
                  onPress={() => {
                    haptics.selection();
                    log.toggleHabit(key, habit.id);
                  }}
                  style={({ pressed }) => [styles.habit, pressed && styles.pressed]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: done }}
                  accessibilityLabel={`${habit.title}. ${habit.hint}`}
                >
                  {done ? (
                    <Check size={18} color={colors.success} strokeWidth={2.6} />
                  ) : (
                    <Circle size={18} color={colors.subtleForeground} strokeWidth={2} />
                  )}
                  <View style={styles.habitText}>
                    <AppText style={[styles.habitTitle, done && styles.habitTitleDone]}>
                      {habit.title}
                    </AppText>
                    <AppText style={styles.habitHint}>{habit.hint}</AppText>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <QadrNightsCard nights={nights} revived={log.revived} onToggle={log.toggleRevived} />

        {/* Jump-offs into the features that already own these */}
        <View style={styles.links}>
          <LinkRow
            icon={<Utensils size={18} color={colors.primary} strokeWidth={2} />}
            title="Fasting times & ledger"
            sub="Suhūr, ifṭār, and the month's record"
            onPress={() => onNavigate?.('fasting')}
          />
          <LinkRow
            icon={<BookOpen size={18} color={colors.primary} strokeWidth={2} />}
            title="Qurʾān & khatm pace"
            sub="Keep pace to complete the muṣḥaf"
            onPress={() => onNavigate?.('quran')}
          />
        </View>

        <AppText style={styles.disclaimer}>{RAMADAN_DISCLAIMER}</AppText>
      </ScrollView>

      <Modal visible={infoOpen} transparent animationType="slide" onRequestClose={() => setInfoOpen(false)}>
        <View style={styles.infoRoot}>
          <Pressable style={styles.backdrop} onPress={() => setInfoOpen(false)} accessibilityLabel="Close" />
          <View style={styles.infoSheet}>
            <View style={styles.handle} />
            <View style={styles.cardHead}>
              <AppText style={styles.infoTitle}>Night worship in Ramaḍān</AppText>
              <Pressable onPress={() => setInfoOpen(false)} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Close">
                <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.infoContent}>
              <AppText style={styles.infoLabel}>TARĀWĪḤ</AppText>
              <AppText style={styles.infoBody}>{TARAWEEH_INTRO}</AppText>
              <Evidence daleel={DALEEL_TARAWEEH} />
              {TARAWEEH_OPINIONS.map((o) => (
                <View key={o.rakahs} style={styles.opinion}>
                  <AppText style={styles.opinionLabel}>{o.label}</AppText>
                  <AppText style={styles.opinionHeld}>{o.held}</AppText>
                  <AppText style={styles.infoBody}>{o.note}</AppText>
                </View>
              ))}
              <AppText style={styles.infoBody}>{TARAWEEH_NOTE}</AppText>

              <AppText style={styles.infoLabel}>LAYLAT AL-QADR</AppText>
              <AppText style={styles.infoBody}>{QADR_INTRO}</AppText>
              <Evidence daleel={DALEEL_QADR_SEEK_ODD} />
              <View style={styles.duaBox}>
                <AppText style={styles.duaArabic}>{QADR_DUA.arabic}</AppText>
                <AppText style={styles.duaTranslit}>{QADR_DUA.transliteration}</AppText>
                <AppText style={styles.duaTranslation}>{QADR_DUA.translation}</AppText>
                <AppText style={styles.duaSource}>{QADR_DUA.source}</AppText>
              </View>
              {QADR_SIGNS.map((sign) => (
                <View key={sign} style={styles.signRow}>
                  <Sparkles size={13} color={colors.primary} strokeWidth={2.2} />
                  <AppText style={styles.infoBody}>{sign}</AppText>
                </View>
              ))}
              <AppText style={styles.infoNote}>{QADR_SIGNS_NOTE}</AppText>

              <AppText style={styles.infoLabel}>IʿTIKĀF</AppText>
              <AppText style={styles.infoBody}>{ITIKAF_INTRO}</AppText>

              <View style={styles.infoDisclaimer}>
                <AppText style={styles.infoDisclaimerText}>{RAMADAN_DISCLAIMER}</AppText>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Evidence({ daleel }: { daleel: { reference: string; narrator?: string; grade?: string; text: string } }) {
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

function LinkRow({
  icon,
  title,
  sub,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${sub}`}
    >
      <View style={styles.linkIcon}>{icon}</View>
      <View style={styles.linkText}>
        <AppText style={styles.linkTitle}>{title}</AppText>
        <AppText style={styles.linkSub}>{sub}</AppText>
      </View>
      <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
    </Pressable>
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
    hero: {
      alignItems: 'center',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: `${colors.primary}44`,
      backgroundColor: colors.card,
      padding: spacing.lg,
      gap: 2,
    },
    heroDay: { ...typography.display, fontSize: 52, color: colors.primary },
    heroLabel: { ...typography.caption, fontSize: 12, color: colors.subtleForeground },
    rail: {
      alignSelf: 'stretch',
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.input,
      overflow: 'hidden',
      marginVertical: spacing.md,
    },
    railFill: { height: '100%', borderRadius: 3, backgroundColor: colors.primary },
    ashraTitle: { ...typography.title, fontSize: 18, color: colors.foreground },
    ashraArabic: { fontFamily: arabicFont, fontSize: 22, color: colors.primary, marginTop: 2 },
    ashraDesc: {
      fontFamily,
      fontSize: 13,
      lineHeight: 20,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    duaBox: {
      alignSelf: 'stretch',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      padding: spacing.md,
      gap: 6,
      marginTop: spacing.md,
    },
    duaArabic: { fontFamily: arabicFont, fontSize: 24, lineHeight: 44, color: colors.foreground, textAlign: 'center' },
    duaTranslit: { fontFamily, fontSize: 12, color: colors.primary, textAlign: 'center', fontStyle: 'italic' },
    duaTranslation: { fontFamily, fontSize: 13, lineHeight: 20, color: colors.mutedForeground, textAlign: 'center' },
    duaSource: { ...typography.caption, fontSize: 10, color: colors.subtleForeground, textAlign: 'center' },
    waiting: {
      alignItems: 'center',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    waitingIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.primary}1A`,
    },
    waitingTitle: { ...typography.title, fontSize: 19, color: colors.foreground, textAlign: 'center' },
    waitingNote: {
      fontFamily,
      fontSize: 13,
      lineHeight: 20,
      color: colors.mutedForeground,
      textAlign: 'center',
    },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle: { ...typography.title, fontSize: 16, color: colors.foreground },
    cardMeta: { ...typography.label, color: colors.primary },
    habits: { gap: spacing.xs },
    habit: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 48,
    },
    habitText: { flex: 1, gap: 1 },
    habitTitle: { fontFamily, fontSize: 15, color: colors.foreground },
    habitTitleDone: { color: colors.success },
    habitHint: { fontFamily, fontSize: 12, color: colors.subtleForeground },
    links: { gap: spacing.sm },
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
    infoNote: { fontFamily, fontSize: 12, lineHeight: 19, color: colors.subtleForeground, fontStyle: 'italic' },
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
    opinion: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.md,
      gap: 3,
    },
    opinionLabel: { ...typography.title, fontSize: 15, color: colors.foreground },
    opinionHeld: { ...typography.caption, fontSize: 11, color: colors.primary },
    signRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
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
