/**
 * TahajjudScreen — the home of the night prayer (F11).
 *
 * It resolves tonight's window from the user's location and method (via
 * useTahajjud), draws the night as a glowing arc with a live countdown, lays
 * out the three thirds and marks where the present moment falls, and lets the
 * worshipper arrange a gentle wake. Beneath the clock sits the worship itself:
 * the cited virtues of Qiyām al-Layl, the supplications of the night and witr,
 * and notes on how it was prayed — every proof-text sourced. The night maths
 * lives in lib/nightPrayer; this screen composes and presents.
 */
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BellRing, ChevronRight, Info, MoonStar, X } from 'lucide-react-native';
import useTahajjud from '../hooks/useTahajjud';
import NightTimeline from '../components/tahajjud/NightTimeline';
import TahajjudReminderSheet from '../components/tahajjud/TahajjudReminderSheet';
import DuaCard from '../components/DuaCard';
import DaleelBlock from '../components/DaleelBlock';
import {
  TAHAJJUD_ARABIC,
  TAHAJJUD_DISCLAIMER,
  TAHAJJUD_DUAS,
  TAHAJJUD_INTRO,
  TAHAJJUD_NOTES,
  TAHAJJUD_VIRTUES,
} from '../content/tahajjud';
import { reminderTimeFor, type NightThirdKey } from '../lib/nightPrayer';
import { formatTime } from '../lib/clock';
import { sendTestTahajjud } from '../lib/notifications';
import {
  arabicFont,
  colors,
  fontFamily,
  radius,
  spacing,
  typography,
} from '../theme/tokens';

const PHASE_SUBTITLE: Record<string, string> = {
  evening: 'The night has not yet begun',
  firstThird: 'You are in the first third',
  middleThird: 'You are in the middle third',
  lastThird: 'The hour of the divine descent',
  day: 'The night has ended',
};

function currentThirdKey(phase: string): NightThirdKey | null {
  if (phase === 'firstThird') return 'first';
  if (phase === 'middleThird') return 'middle';
  if (phase === 'lastThird') return 'last';
  return null;
}

export default function TahajjudScreen({ onClose }: { onClose?: () => void }) {
  const t = useTahajjud();
  const [reminderOpen, setReminderOpen] = useState(false);

  const tz = t.timeZone;
  const fmt = useMemo(() => (date: Date) => formatTime(date, tz), [tz]);

  const reminderAt = useMemo(
    () => reminderTimeFor(t.window, t.prefs.mode, t.prefs.beforeFajrMinutes),
    [t.window, t.prefs.mode, t.prefs.beforeFajrMinutes],
  );
  const reminderPreview = fmt(reminderAt);
  const reminderStatus = t.prefs.reminderEnabled
    ? `On · tonight at about ${reminderPreview}`
    : 'Off · tap to set a gentle wake';

  const phase = t.countdown.phase;
  const nowKey = currentThirdKey(phase);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Tahajjud</Text>
          <Text style={styles.headerArabic} numberOfLines={1}>
            {TAHAJJUD_ARABIC}
          </Text>
        </View>
        <Pressable
          onPress={() => setReminderOpen(true)}
          hitSlop={12}
          style={[styles.iconBtn, t.prefs.reminderEnabled && styles.iconBtnOn]}
          accessibilityRole="button"
          accessibilityLabel="Tahajjud reminder"
        >
          <BellRing
            size={18}
            color={t.prefs.reminderEnabled ? colors.primary : colors.mutedForeground}
            strokeWidth={2.25}
          />
        </Pressable>
      </View>

      {!t.ready ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.intro}>{TAHAJJUD_INTRO}</Text>

          <View style={styles.hero}>
            <NightTimeline window={t.window} now={t.now} formatTime={fmt} />
            <View style={styles.countdownWrap}>
              <Text style={styles.countdown}>{t.countdown.label}</Text>
              <Text style={styles.phaseSub}>{PHASE_SUBTITLE[phase] ?? ''}</Text>
            </View>
          </View>

          <Text style={styles.section}>THE NIGHT IN THIRDS</Text>
          <View style={styles.card}>
            {t.window.thirds.map((third, i) => {
              const isNow = nowKey === third.key;
              const isLast = third.key === 'last';
              return (
                <View
                  key={third.key}
                  style={[
                    styles.thirdRow,
                    i > 0 && styles.thirdDivider,
                    isNow && styles.thirdRowNow,
                  ]}
                >
                  <View
                    style={[
                      styles.thirdDot,
                      isLast && styles.thirdDotLast,
                      isNow && styles.thirdDotNow,
                    ]}
                  />
                  <View style={styles.thirdText}>
                    <Text style={[styles.thirdLabel, isNow && styles.thirdLabelNow]}>
                      {third.label}
                      {isLast ? ' · the descent' : ''}
                    </Text>
                    <Text style={styles.thirdTime}>
                      {fmt(third.start)} – {fmt(third.end)}
                    </Text>
                  </View>
                  {isNow ? (
                    <View style={styles.nowPill}>
                      <Text style={styles.nowPillText}>Now</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>

          <Text style={styles.section}>WAKE FOR THE NIGHT</Text>
          <Pressable
            onPress={() => setReminderOpen(true)}
            style={({ pressed }) => [styles.reminderCard, pressed && styles.pressed]}
          >
            <View style={styles.reminderIcon}>
              <BellRing
                size={18}
                color={t.prefs.reminderEnabled ? colors.primary : colors.mutedForeground}
                strokeWidth={2}
              />
            </View>
            <View style={styles.reminderText}>
              <Text style={styles.reminderTitle}>Wake me for the night prayer</Text>
              <Text style={styles.reminderStatus} numberOfLines={1}>
                {reminderStatus}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
          </Pressable>

          <Text style={styles.section}>VIRTUES OF THE NIGHT PRAYER</Text>
          <View style={styles.stack}>
            {TAHAJJUD_VIRTUES.map((virtue) => (
              <View key={virtue.id} style={styles.virtueCard}>
                <View style={styles.virtueHead}>
                  <MoonStar size={15} color={colors.primary} strokeWidth={2} />
                  <Text style={styles.virtueTitle}>{virtue.title}</Text>
                </View>
                {virtue.arabic ? (
                  <Text style={styles.virtueArabic}>{virtue.arabic}</Text>
                ) : null}
                <DaleelBlock daleel={virtue.daleel} />
              </View>
            ))}
          </View>

          <Text style={styles.section}>SUPPLICATIONS OF THE NIGHT</Text>
          <View style={styles.stack}>
            {TAHAJJUD_DUAS.map((dua) => (
              <DuaCard key={dua.id} dua={dua} />
            ))}
          </View>

          <Text style={styles.section}>HOW IT WAS PRAYED</Text>
          <View style={styles.stack}>
            {TAHAJJUD_NOTES.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <Text style={styles.noteTitle}>{note.title}</Text>
                <Text style={styles.noteBody}>{note.body}</Text>
              </View>
            ))}
          </View>

          <View style={styles.disclaimer}>
            <Info size={15} color={colors.subtleForeground} strokeWidth={2} />
            <Text style={styles.disclaimerText}>{TAHAJJUD_DISCLAIMER}</Text>
          </View>
        </ScrollView>
      )}

      <TahajjudReminderSheet
        visible={reminderOpen}
        onClose={() => setReminderOpen(false)}
        prefs={t.prefs}
        onSetEnabled={t.setReminderEnabled}
        onSetMode={t.setMode}
        onSetBeforeFajrMinutes={t.setBeforeFajrMinutes}
        reminderPreview={reminderPreview}
        onTest={() => {
          sendTestTahajjud().catch(() => {});
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'] + spacing.md,
    paddingBottom: spacing.md,
  },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.sm },
  headerTitle: { ...typography.title, color: colors.foreground },
  headerArabic: {
    fontFamily: arabicFont,
    fontSize: 15,
    color: colors.mutedForeground,
    marginTop: 1,
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
  iconBtnOn: { borderColor: colors.primary, backgroundColor: colors.cardElevated },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
    paddingTop: spacing.xs,
  },
  intro: {
    ...typography.body,
    fontFamily,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  hero: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  countdownWrap: { alignItems: 'center', marginTop: spacing.md },
  countdown: {
    fontFamily,
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.2,
  },
  phaseSub: {
    ...typography.caption,
    fontFamily,
    color: colors.mutedForeground,
    marginTop: 3,
  },
  section: {
    fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.subtleForeground,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
  },
  thirdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  thirdDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  thirdRowNow: {},
  thirdDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  thirdDotLast: { backgroundColor: `${colors.primary}66` },
  thirdDotNow: { backgroundColor: colors.primary },
  thirdText: { flex: 1, gap: 2 },
  thirdLabel: { ...typography.body, fontFamily, color: colors.foreground, fontWeight: '500' },
  thirdLabelNow: { fontWeight: '700' },
  thirdTime: {
    ...typography.caption,
    fontFamily,
    color: colors.mutedForeground,
    fontVariant: ['tabular-nums'],
  },
  nowPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  nowPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryForeground,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  reminderIcon: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardElevated,
  },
  reminderText: { flex: 1, gap: 2 },
  reminderTitle: { ...typography.body, fontFamily, color: colors.foreground, fontWeight: '600' },
  reminderStatus: { ...typography.caption, fontFamily, color: colors.mutedForeground },
  stack: { gap: spacing.md },
  virtueCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: spacing.md,
  },
  virtueHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  virtueTitle: {
    ...typography.body,
    fontFamily,
    color: colors.foreground,
    fontWeight: '700',
    flex: 1,
  },
  virtueArabic: {
    fontFamily: arabicFont,
    fontSize: 22,
    lineHeight: 40,
    color: colors.foreground,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  noteCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: spacing.sm,
  },
  noteTitle: { ...typography.body, fontFamily, color: colors.foreground, fontWeight: '700' },
  noteBody: {
    ...typography.body,
    fontFamily,
    fontSize: 14,
    lineHeight: 21,
    color: colors.mutedForeground,
  },
  disclaimer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  disclaimerText: {
    flex: 1,
    ...typography.caption,
    fontFamily,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.subtleForeground,
  },
  pressed: { opacity: 0.7 },
});
