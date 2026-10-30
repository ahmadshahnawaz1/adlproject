/**
 * TrackerScreen — the prayer-tracking dashboard.
 *
 * A shadcn/ui-inspired board: a glowing streak hero, today's five obligations
 * as tap-to-log pills (with a satisfying tick pop), a 14-day completion trend,
 * headline stats (consistency, congregation, best streak), and a calm qaza
 * panel that both counts the outstanding debt and gently coaches how to repay
 * it. Everything is local and offline.
 */
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Flame, TrendingUp, Users, BookOpen, SlidersHorizontal, Sparkles } from 'lucide-react-native';
import useBreathing from '../hooks/useBreathing';
import usePrayerLog from '../hooks/usePrayerLog';
import useQazaLedger from '../hooks/useQazaLedger';
import useTrackerPrefs from '../hooks/useTrackerPrefs';
import PrayerStatusPill from '../components/PrayerStatusPill';
import TrendChart from '../components/TrendChart';
import QazaLedgerCard from '../components/QazaLedgerCard';
import TrackerSettingsSheet from '../components/TrackerSettingsSheet';
import EmptyState from '../components/EmptyState';
import { Animated as RNAnimated } from 'react-native';
import { OBLIGATORY, STRICT_KEPT, type ObligatoryName } from '../lib/prayerLog';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const ARABIC: Record<ObligatoryName, string> = {
  fajr: '\u0627\u0644\u0641\u062c\u0631',
  dhuhr: '\u0627\u0644\u0638\u0647\u0631',
  asr: '\u0627\u0644\u0639\u0635\u0631',
  maghrib: '\u0627\u0644\u0645\u063a\u0631\u0628',
  isha: '\u0627\u0644\u0639\u0634\u0627\u0621',
};

function streakWord(n: number): string {
  if (n === 0) return 'Begin today';
  return `${n} day${n === 1 ? '' : 's'} strong`;
}

export default function TrackerScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { opacity: glow } = useBreathing();
  const { prefs, ready: prefsReady, setPref, reset } = useTrackerPrefs();
  const kept = useMemo(() => (prefs.strictStreak ? STRICT_KEPT : undefined), [prefs.strictStreak]);
  const { log, ready, day, cycle, clearDay, completeDay, range, stats } = usePrayerLog(
    prefs.statsWindowDays,
    kept,
  );
  const qaza = useQazaLedger();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const today = day();
  const trend = useMemo(() => range(prefs.trendDays), [range, prefs.trendDays]);
  const prayedToday = OBLIGATORY.reduce(
    (n, p) => n + (['jamaah', 'ontime', 'late', 'qaza'].includes(today[p]) ? 1 : 0),
    0,
  );
  const consistencyPct = Math.round(stats.consistency * 100);
  const hasHistory = Object.keys(log).length > 0;
  const goalPct =
    prefs.streakGoal > 0 ? Math.min(100, Math.round((stats.streak / prefs.streakGoal) * 100)) : 0;
  const showArabic = prefs.showArabic;

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Tracker</Text>
          <Pressable
            onPress={() => setSettingsOpen(true)}
            hitSlop={10}
            style={({ pressed }) => [styles.gear, pressed && styles.gearPressed]}
            accessibilityRole="button"
            accessibilityLabel="Tracker settings"
          >
            <SlidersHorizontal size={18} color={colors.mutedForeground} strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* Streak hero */}
        <RNAnimated.View style={[styles.hero, { opacity: glow }]}>
          <View style={styles.heroFlame}>
            <Flame size={26} color={colors.primary} strokeWidth={2.2} />
          </View>
          <Text style={styles.heroNumber}>{stats.streak}</Text>
          <Text style={styles.heroLabel}>{streakWord(stats.streak)}</Text>
          <View style={styles.heroMetaRow}>
            <Text style={styles.heroMeta}>Best {stats.best}</Text>
            <View style={styles.heroDot} />
            <Text style={styles.heroMeta}>{prayedToday}/5 today</Text>
            {prefs.strictStreak ? (
              <>
                <View style={styles.heroDot} />
                <Text style={styles.heroMeta}>Strict</Text>
              </>
            ) : null}
          </View>
          {prefs.streakGoal > 0 ? (
            <View style={styles.goalWrap}>
              <View style={styles.goalTrack}>
                <View style={[styles.goalFill, { width: `${goalPct}%` }]} />
              </View>
              <Text style={styles.goalText}>
                {stats.streak}/{prefs.streakGoal} day goal
              </Text>
            </View>
          ) : null}
        </RNAnimated.View>

        {/* First-run onboarding */}
        {prefsReady && ready && !hasHistory ? (
          <View style={styles.onboard}>
            <EmptyState
              icon={<Sparkles size={24} color={colors.primary} strokeWidth={2.2} />}
              title="Start your first day"
              message="Tap a prayer below as you complete it. Five in a day builds a streak — and your consistency, trends and qaza all grow from here."
            />
          </View>
        ) : null}

        {/* Today's prayers */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionLabel}>Today</Text>
          <Text
            style={styles.sectionAction}
            onPress={() => (prayedToday === 5 ? clearDay() : completeDay())}
          >
            {prayedToday === 5 ? 'Reset' : 'Mark all'}
          </Text>
        </View>
        <View style={styles.pills}>
          {OBLIGATORY.map((p) => (
            <PrayerStatusPill
              key={p}
              prayer={p}
              arabic={showArabic ? ARABIC[p] : ''}
              status={ready ? today[p] : 'none'}
              onCycle={cycle}
              onClear={clearDay ? () => clearDay() : () => {}}
              haptics={prefs.haptics}
            />
          ))}
        </View>
        <Text style={styles.hint}>
          Tap to cycle: Jamaʻah → On time → Late → Qaza → Missed.
          Long-press a row to clear the day.
        </Text>

        {/* Trend */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <TrendingUp size={16} color={colors.primary} strokeWidth={2.2} />
            <Text style={styles.cardTitle}>Last {prefs.trendDays} days</Text>
          </View>
          <TrendChart data={trend} />
        </View>

        {/* Stats row */}
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{consistencyPct}%</Text>
            <Text style={styles.statLabel}>Consistency</Text>
            <Text style={styles.statSub}>{prefs.statsWindowDays}-day complete</Text>
          </View>
          <View style={styles.stat}>
            <Users size={18} color={colors.primary} strokeWidth={2.2} />
            <Text style={[styles.statValue, styles.statValueSm]}>{stats.jamaah}</Text>
            <Text style={styles.statLabel}>In jama'ah</Text>
            <Text style={styles.statSub}>last {prefs.statsWindowDays} days</Text>
          </View>
          <View style={styles.stat}>
            <Flame size={18} color={colors.primary} strokeWidth={2.2} />
            <Text style={[styles.statValue, styles.statValueSm]}>{stats.best}</Text>
            <Text style={styles.statLabel}>Best streak</Text>
            <Text style={styles.statSub}>all time</Text>
          </View>
        </View>

        {/* This period's missed (from the day log) */}
        {stats.qazaDebt > 0 ? (
          <View style={styles.missedNote}>
            <BookOpen size={15} color="#60A5FA" strokeWidth={2.2} />
            <Text style={styles.missedText}>
              {stats.qazaDebt} prayer{stats.qazaDebt === 1 ? '' : 's'} marked missed in your day log.
              Make them up, then change the day's status to Qaza — or record them in the ledger below.
            </Text>
          </View>
        ) : null}

        {/* Qaza ledger */}
        <QazaLedgerCard q={qaza} showArabic={showArabic} arabic={ARABIC} />

        <Text style={styles.footnote}>
          Your tracking stays on this device. Mark prayers honestly — the streak
          is between you and Allah.
        </Text>
      </ScrollView>

      <TrackerSettingsSheet
        visible={settingsOpen}
        prefs={prefs}
        onClose={() => setSettingsOpen(false)}
        onSetPref={setPref}
        onReset={reset}
      />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing['3xl'],
  },
  title: {
    ...typography.display,
    color: colors.foreground,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  gear: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearPressed: { backgroundColor: colors.cardElevated },

  hero: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.xl,
  },
  heroFlame: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroNumber: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  heroLabel: { ...typography.title, fontSize: 18, color: colors.foreground, marginTop: 2 },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  heroMeta: { ...typography.caption, color: colors.mutedForeground },
  heroDot: { width: 3, height: 3, borderRadius: 999, backgroundColor: colors.subtleForeground },
  goalWrap: { alignSelf: 'stretch', marginTop: spacing.lg, gap: 4 },
  goalTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.cardElevated,
    overflow: 'hidden',
  },
  goalFill: { height: 6, borderRadius: 999, backgroundColor: colors.primary },
  goalText: { ...typography.caption, fontSize: 11, color: colors.subtleForeground, textAlign: 'center' },

  onboard: { marginBottom: spacing.xl },

  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.subtleForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionAction: { ...typography.label, color: colors.primary },
  pills: { gap: spacing.sm },
  hint: {
    ...typography.caption,
    color: colors.subtleForeground,
    lineHeight: 18,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },

  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.lg,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cardTitle: { ...typography.button, color: colors.foreground },

  statRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: 2,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.foreground,
    fontVariant: ['tabular-nums'],
  },
  statValueSm: { fontSize: 22, marginTop: 2 },
  statLabel: { ...typography.caption, color: colors.foreground, fontWeight: '600' },
  statSub: { ...typography.caption, fontSize: 10, color: colors.subtleForeground },

  missedNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
    marginBottom: spacing.lg,
  },
  missedText: { flex: 1, ...typography.caption, color: colors.mutedForeground, lineHeight: 18 },

  footnote: {
    ...typography.caption,
    color: colors.subtleForeground,
    lineHeight: 18,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
