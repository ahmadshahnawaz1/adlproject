/**
 * QuranKhatmCard — a gentle plan to complete the Qurʾān across the month. A
 * progress ring tracks pages read against the goal, a pace badge says whether
 * you are ahead or behind, and quick steppers record reading. Before it is
 * enabled, a single tap starts a thirty-day plan. All offline; the maths lives
 * in lib/quranKhatm.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { BookOpenText, ChevronRight, Minus, Plus } from 'lucide-react-native';
import type { KhatmStatus } from '../lib/quranKhatm';
import { pageToJuz } from '../lib/quranKhatm';
import type { UseQuranKhatm } from '../hooks/useQuranKhatm';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import Button from './ui/Button';

const R = 42;
const C = 2 * Math.PI * R;

function statusMeta(status: KhatmStatus, colors: ThemeColors): { label: string; color: string } {
  switch (status) {
    case 'done':
      return { label: 'Complete', color: colors.success };
    case 'ahead':
      return { label: 'Ahead', color: colors.success };
    case 'onPace':
      return { label: 'On pace', color: colors.primary };
    case 'behind':
      return { label: 'Behind', color: colors.destructive };
    default:
      return { label: 'Not started', color: colors.mutedForeground };
  }
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function Ring({ pct, color }: { pct: number; color: string }) {
  const { colors } = useTheme();
  const dash = C * Math.max(0, Math.min(1, pct));
  return (
    <Svg width={120} height={120} viewBox="0 0 100 100">
      <Circle cx={50} cy={50} r={R} stroke={colors.cardElevated} strokeWidth={8} fill="none" />
      <Circle
        cx={50}
        cy={50}
        r={R}
        stroke={color}
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${C}`}
        transform="rotate(-90 50 50)"
      />
    </Svg>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function QuranKhatmCard({
  khatm,
  now,
  onOpenReader,
}: {
  khatm: UseQuranKhatm;
  now: Date;
  onOpenReader?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { state } = khatm;

  const openLink = onOpenReader ? (
    <Pressable
      onPress={onOpenReader}
      style={({ pressed }) => [styles.openLink, pressed && styles.ctrlPressed]}
      accessibilityRole="button"
      accessibilityLabel="Open the muṣḥaf to read"
    >
      <BookOpenText size={15} color={colors.primary} strokeWidth={2.2} />
      <Text style={styles.openLinkText}>Open the muṣḥaf to read</Text>
      <ChevronRight size={15} color={colors.primary} strokeWidth={2.4} />
    </Pressable>
  ) : null;

  if (!state.enabled) {
    return (
      <View style={styles.card}>
        <View style={styles.head}>
          <BookOpenText size={16} color={colors.primary} strokeWidth={2.2} />
          <Text style={styles.title}>Qurʾān khatm</Text>
        </View>
        <Text style={styles.intro}>
          Complete a reading of the Qurʾān this month. Set a goal and track a page a day with a
          gentle pace guide.
        </Text>
        <Button label="Start a khatm plan" onPress={() => khatm.setEnabled(true)} style={styles.startBtn} />
        {openLink}
      </View>
    );
  }

  const pace = khatm.pace(now);
  const meta = statusMeta(pace.status, colors);
  const juz = pageToJuz(state.currentPage);
  const finishISO = state.endISO || pace.projectedFinishISO;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headLeft}>
          <BookOpenText size={16} color={colors.primary} strokeWidth={2.2} />
          <Text style={styles.title}>Qurʾān khatm</Text>
        </View>
        <View style={[styles.badge, { borderColor: `${meta.color}66`, backgroundColor: `${meta.color}1A` }]}>
          <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      <View style={styles.ringRow}>
        <View style={styles.ringWrap}>
          <Ring pct={pace.pctDone} color={meta.color} />
          <View style={styles.ringCenter}>
            <Text style={styles.ringPct}>{Math.round(pace.pctDone * 100)}%</Text>
            <Text style={styles.ringJuz}>Juzʾ {juz}</Text>
          </View>
        </View>
        <View style={styles.ringSide}>
          <Text style={styles.pageBig}>
            {state.currentPage}
            <Text style={styles.pageTotal}> / {state.totalPages}</Text>
          </Text>
          <Text style={styles.pageUnit}>pages read</Text>
          <Text style={styles.goal}>
            {pace.status === 'done'
              ? 'Khatm complete — mā shāʾ Allāh'
              : `Read ${pace.neededPerDay} ${pace.neededPerDay === 1 ? 'page' : 'pages'} today to stay on time`}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Stat label="even pace" value={`${pace.targetPerDay}/day`} />
        <Stat label="pages left" value={`${pace.pagesRemaining}`} />
        <Stat label="days left" value={`${pace.daysRemaining}`} />
        <Stat label="finish by" value={fmtDate(finishISO)} />
      </View>

      <View style={styles.controls}>
        <Pressable
          onPress={() => khatm.addPages(-1)}
          hitSlop={6}
          disabled={state.currentPage === 0}
          style={({ pressed }) => [
            styles.ctrl,
            state.currentPage === 0 && styles.ctrlDisabled,
            pressed && state.currentPage > 0 && styles.ctrlPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="One fewer page"
        >
          <Minus size={16} color={state.currentPage === 0 ? colors.subtleForeground : colors.foreground} strokeWidth={2.6} />
        </Pressable>
        <Pressable
          onPress={() => khatm.addPages(1)}
          style={({ pressed }) => [styles.addBtn, pressed && styles.ctrlPressed]}
          accessibilityRole="button"
          accessibilityLabel="Add one page"
        >
          <Plus size={15} color={colors.primaryForeground} strokeWidth={2.8} />
          <Text style={styles.addText}>1 page</Text>
        </Pressable>
        <Pressable
          onPress={() => khatm.addPages(20)}
          style={({ pressed }) => [styles.addBtnAlt, pressed && styles.ctrlPressed]}
          accessibilityRole="button"
          accessibilityLabel="Add one juz"
        >
          <Plus size={15} color={colors.primary} strokeWidth={2.8} />
          <Text style={styles.addTextAlt}>1 juzʾ</Text>
        </Pressable>
      </View>
      {openLink}
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
    marginBottom: spacing.lg,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { ...typography.button, color: colors.foreground },
  intro: { ...typography.body, fontSize: 14, color: colors.mutedForeground, lineHeight: 21, marginBottom: spacing.lg },
  startBtn: { height: 48 },

  badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full, borderWidth: 1 },
  badgeText: { ...typography.caption, fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  ringRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.lg },
  ringWrap: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringPct: { fontSize: 26, fontWeight: '800', color: colors.foreground, fontVariant: ['tabular-nums'] },
  ringJuz: { ...typography.caption, fontSize: 12, color: colors.mutedForeground, marginTop: 1 },
  ringSide: { flex: 1 },
  pageBig: { fontSize: 30, fontWeight: '800', color: colors.foreground, fontVariant: ['tabular-nums'] },
  pageTotal: { fontSize: 17, fontWeight: '600', color: colors.subtleForeground },
  pageUnit: { ...typography.caption, color: colors.mutedForeground, marginTop: 1 },
  goal: { ...typography.caption, fontSize: 13, color: colors.primary, marginTop: spacing.sm, lineHeight: 18 },

  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
    marginBottom: spacing.lg,
  },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { ...typography.body, fontSize: 15, fontWeight: '700', color: colors.foreground, fontVariant: ['tabular-nums'] },
  statLabel: { ...typography.caption, fontSize: 10, color: colors.subtleForeground, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },

  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ctrl: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlDisabled: { opacity: 0.4 },
  ctrlPressed: { opacity: 0.7 },
  addBtn: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  addText: { ...typography.button, fontSize: 14, color: colors.primaryForeground },
  addBtnAlt: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${colors.primary}66`,
    backgroundColor: `${colors.primary}14`,
  },
  addTextAlt: { ...typography.button, fontSize: 14, color: colors.primary },
  openLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  openLinkText: { ...typography.button, fontSize: 13.5, color: colors.primary },
});
