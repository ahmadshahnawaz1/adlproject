/**
 * DhikrHubScreen — the home of daily remembrance goals (F10).
 *
 * It gathers the day's tasbīḥ tally (from useDhikrGoals) and which adhkār sets
 * were completed (from useAdhkarProgress), measures them against the user's
 * chosen goals, and shows a unified streak, today's progress per goal, and a
 * fortnight trend. The maths lives in lib/dhikrGoals; this screen only composes
 * and presents. Quick links open the tasbīḥ beads and the adhkār sets; a sheet
 * tunes the goals.
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
import {
  Info,
  Repeat,
  SlidersHorizontal,
  Sunrise,
  Sunset,
  X,
} from 'lucide-react-native';
import useDhikrGoals from '../hooks/useDhikrGoals';
import useAdhkarProgress from '../hooks/useAdhkarProgress';
import StreakHero from '../components/dhikr/StreakHero';
import DhikrTrendChart from '../components/dhikr/DhikrTrendChart';
import DhikrGoalCard from '../components/dhikr/DhikrGoalCard';
import DhikrGoalsSheet from '../components/dhikr/DhikrGoalsSheet';
import {
  dhikrBestStreak,
  dhikrStreak,
  dhikrTrend,
  EVENING_SET_ID,
  goalProgress,
  MORNING_SET_ID,
  type DhikrDayInputs,
} from '../lib/dhikrGoals';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function DhikrHubScreen({
  onClose,
  onOpenTasbih,
  onOpenAdhkar,
}: {
  onClose?: () => void;
  onOpenTasbih?: () => void;
  onOpenAdhkar?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const goals = useDhikrGoals();
  const adhkar = useAdhkarProgress();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const ready = goals.ready && adhkar.ready;
  const { config } = goals;

  const todayInputs: DhikrDayInputs = useMemo(
    () => ({
      tasbih: goals.todayRecord.tasbih,
      morningDone: adhkar.completedToday.includes(MORNING_SET_ID),
      eveningDone: adhkar.completedToday.includes(EVENING_SET_ID),
    }),
    [goals.todayRecord.tasbih, adhkar.completedToday],
  );

  const progress = useMemo(
    () => goalProgress(todayInputs, config),
    [todayInputs, config],
  );

  const streak = useMemo(
    () => dhikrStreak(goals.ledger, adhkar.history, config),
    [goals.ledger, adhkar.history, config],
  );
  const best = useMemo(
    () => dhikrBestStreak(goals.ledger, adhkar.history, config),
    [goals.ledger, adhkar.history, config],
  );
  const trend = useMemo(
    () => dhikrTrend(goals.ledger, adhkar.history, config, 14),
    [goals.ledger, adhkar.history, config],
  );

  const todayLabel =
    progress.totalGoals > 0
      ? `${progress.metGoals}/${progress.totalGoals} today`
      : undefined;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Dhikr Goals</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            Remembrance, day by day
          </Text>
        </View>
        <Pressable
          onPress={() => setSettingsOpen(true)}
          hitSlop={12}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Edit goals"
        >
          <SlidersHorizontal size={18} color={colors.primary} strokeWidth={2.25} />
        </Pressable>
      </View>

      {!ready ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <StreakHero streak={streak} best={best} todayLabel={todayLabel} />

          <Text style={styles.section}>TODAY</Text>
          {progress.totalGoals === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                No goals are active. Open settings to choose what to track.
              </Text>
              <Pressable
                onPress={() => setSettingsOpen(true)}
                style={({ pressed }) => [
                  styles.emptyBtn,
                  pressed && styles.pressed,
                ]}
              >
                <SlidersHorizontal size={16} color={colors.primaryForeground} />
                <Text style={styles.emptyBtnText}>Set goals</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.cards}>
              {config.morningAdhkar ? (
                <DhikrGoalCard
                  icon={<Sunrise size={20} color={colors.primary} />}
                  title="Morning adhkār"
                  detail={progress.morningDone ? 'Completed today' : 'Not yet today'}
                  fraction={progress.morningDone ? 1 : 0}
                  complete={progress.morningDone}
                  onPress={onOpenAdhkar}
                />
              ) : null}
              {config.eveningAdhkar ? (
                <DhikrGoalCard
                  icon={<Sunset size={20} color={colors.primary} />}
                  title="Evening adhkār"
                  detail={progress.eveningDone ? 'Completed today' : 'Not yet today'}
                  fraction={progress.eveningDone ? 1 : 0}
                  complete={progress.eveningDone}
                  onPress={onOpenAdhkar}
                />
              ) : null}
              {progress.tasbihActive ? (
                <DhikrGoalCard
                  icon={<Repeat size={20} color={colors.primary} />}
                  title="Tasbīḥ"
                  detail={`${progress.tasbihCount} / ${progress.tasbihTarget}`}
                  fraction={progress.tasbihPct}
                  complete={progress.tasbihMet}
                  onPress={onOpenTasbih}
                />
              ) : null}
            </View>
          )}

          <Text style={styles.section}>LAST 14 DAYS</Text>
          <View style={styles.trendCard}>
            <DhikrTrendChart data={trend} />
          </View>

          <View style={styles.note}>
            <Info size={15} color={colors.subtleForeground} />
            <Text style={styles.noteText}>
              These goals are a gentle aid to consistency, not a measure of
              whether worship is accepted — that rests with Allah alone. Renew
              your intention and proceed at an even pace.
            </Text>
          </View>
        </ScrollView>
      )}

      <DhikrGoalsSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        config={config}
        onChange={goals.setConfig}
      />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
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
  headerSub: {
    ...typography.caption,
    fontSize: 12,
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
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
    paddingTop: spacing.xs,
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
  cards: { gap: spacing.sm },
  trendCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  emptyText: {
    ...typography.body,
    fontFamily,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  emptyBtnText: {
    ...typography.button,
    fontFamily,
    color: colors.primaryForeground,
  },
  pressed: { opacity: 0.7 },
  note: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  noteText: {
    flex: 1,
    ...typography.caption,
    fontFamily,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.subtleForeground,
  },
});
