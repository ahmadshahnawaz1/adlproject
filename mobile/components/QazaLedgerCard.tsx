/**
 * QazaLedgerCard — the lifelong make-up (qaza) account.
 *
 * Beyond the day grid's "missed" flags, this is a standing ledger of prayers a
 * person owes from before they tracked — and every make-up chips it down. Each
 * prayer has a stepper (− made up · + owed), the card shows the total still due
 * with a sparkline of how the debt has moved over time, repayment progress, and
 * an expandable dated history so the journey is always reviewable. Offline.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { History, Minus, Plus, ChevronDown, ChevronUp, Trash2, CheckCircle2 } from 'lucide-react-native';
import { OBLIGATORY, type ObligatoryName } from '../lib/prayerLog';
import type { UseQazaLedger } from '../hooks/useQazaLedger';
import { radius, spacing, typography, arabicFont } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const BLUE = '#60A5FA';

const LABEL: Record<ObligatoryName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const w = 96;
  const h = 28;
  const max = Math.max(1, ...data);
  const step = w / (data.length - 1);
  const points = data
    .map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * (h - 2) - 1).toFixed(1)}`)
    .join(' ');
  return (
    <Svg width={w} height={h}>
      <Polyline
        points={points}
        fill="none"
        stroke={BLUE}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function relTime(ts: string): string {
  const then = new Date(ts).getTime();
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

export default function QazaLedgerCard({
  q,
  showArabic,
  arabic,
}: {
  q: UseQazaLedger;
  showArabic: boolean;
  arabic: Record<ObligatoryName, string>;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [open, setOpen] = useState(false);
  const progressPct = Math.round(q.progress * 100);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headLeft}>
          <History size={16} color={q.total > 0 ? BLUE : colors.success} strokeWidth={2.2} />
          <Text style={styles.title}>Qaza ledger</Text>
        </View>
        {q.series.length > 1 ? <Sparkline data={q.series} /> : null}
      </View>

      {/* Headline */}
      <View style={styles.headline}>
        <View>
          <Text style={[styles.total, q.total === 0 && styles.totalClear]}>{q.total}</Text>
          <Text style={styles.totalUnit}>prayers still owed</Text>
        </View>
        <View style={styles.ledgerMeta}>
          <Text style={styles.metaLine}>Owed lifetime · {q.added}</Text>
          <Text style={styles.metaLine}>Made up · {q.repaid}</Text>
        </View>
      </View>

      {/* Progress */}
      {q.added > 0 ? (
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.progressText}>{progressPct}% repaid</Text>
        </View>
      ) : null}

      {/* Per-prayer steppers */}
      <View style={styles.rows}>
        {OBLIGATORY.map((p) => {
          const owed = q.outstanding[p];
          return (
            <View key={p} style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowLabel}>{LABEL[p]}</Text>
                {showArabic ? <Text style={styles.rowArabic}>{arabic[p]}</Text> : null}
              </View>
              <View style={styles.controls}>
                <Pressable
                  onPress={() => q.repay(p, 1)}
                  hitSlop={8}
                  disabled={owed === 0}
                  style={({ pressed }) => [
                    styles.ctrl,
                    owed === 0 && styles.ctrlDisabled,
                    pressed && owed > 0 && styles.ctrlPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Make up one ${LABEL[p]}`}
                >
                  <Minus size={16} color={owed === 0 ? colors.subtleForeground : colors.success} strokeWidth={2.6} />
                </Pressable>
                <View style={styles.countWrap}>
                  <Text style={[styles.count, owed > 0 && styles.countOwed]}>{owed}</Text>
                </View>
                <Pressable
                  onPress={() => q.addDebt(p, 1)}
                  hitSlop={8}
                  style={({ pressed }) => [styles.ctrl, pressed && styles.ctrlPressed]}
                  accessibilityRole="button"
                  accessibilityLabel={`Add one owed ${LABEL[p]}`}
                >
                  <Plus size={16} color={BLUE} strokeWidth={2.6} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      {q.total === 0 ? (
        <View style={styles.clearBanner}>
          <CheckCircle2 size={16} color={colors.success} strokeWidth={2.3} />
          <Text style={styles.clearText}>
            Nothing outstanding. Tap + to record any prayers you owe from the past.
          </Text>
        </View>
      ) : null}

      {/* History */}
      {q.rows.length > 0 ? (
        <>
          <Pressable
            onPress={() => setOpen((s) => !s)}
            style={({ pressed }) => [styles.histToggle, pressed && styles.ctrlPressed]}
          >
            <Text style={styles.histToggleText}>
              {open ? 'Hide history' : `History · ${q.rows.length}`}
            </Text>
            {open ? (
              <ChevronUp size={16} color={colors.mutedForeground} strokeWidth={2.2} />
            ) : (
              <ChevronDown size={16} color={colors.mutedForeground} strokeWidth={2.2} />
            )}
          </Pressable>

          {open ? (
            <View style={styles.history}>
              {q.rows.slice(0, 40).map((r) => {
                const repaid = r.delta < 0;
                return (
                  <View key={r.id} style={styles.histRow}>
                    <View style={[styles.histDot, { backgroundColor: repaid ? colors.success : BLUE }]} />
                    <View style={styles.histText}>
                      <Text style={styles.histTitle}>
                        {repaid ? 'Made up' : 'Owed'} {Math.abs(r.delta)} {LABEL[r.prayer]}
                      </Text>
                      <Text style={styles.histSub}>
                        {relTime(r.ts)} · balance {r.balance}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => q.remove(r.id)}
                      hitSlop={8}
                      style={({ pressed }) => [styles.histDel, pressed && styles.ctrlPressed]}
                      accessibilityRole="button"
                      accessibilityLabel="Delete entry"
                    >
                      <Trash2 size={15} color={colors.subtleForeground} strokeWidth={2.1} />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ) : null}
        </>
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
    marginBottom: spacing.lg,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { ...typography.button, color: colors.foreground },

  headline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  total: { fontSize: 34, fontWeight: '800', color: BLUE, fontVariant: ['tabular-nums'] },
  totalClear: { color: colors.success },
  totalUnit: { ...typography.caption, color: colors.mutedForeground, marginTop: 1 },
  ledgerMeta: { alignItems: 'flex-end', gap: 2 },
  metaLine: { ...typography.caption, color: colors.subtleForeground, fontVariant: ['tabular-nums'] },

  progressWrap: { gap: 4, marginBottom: spacing.lg },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.cardElevated,
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 999, backgroundColor: colors.success },
  progressText: { ...typography.caption, fontSize: 11, color: colors.subtleForeground },

  rows: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  rowLabel: { ...typography.body, fontSize: 15, fontWeight: '600', color: colors.foreground },
  rowArabic: { fontSize: 12, color: colors.mutedForeground, fontFamily: arabicFont },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  ctrl: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlDisabled: { opacity: 0.4 },
  ctrlPressed: { backgroundColor: colors.border },
  countWrap: { minWidth: 26, alignItems: 'center' },
  count: { fontSize: 17, fontWeight: '800', color: colors.subtleForeground, fontVariant: ['tabular-nums'] },
  countOwed: { color: colors.foreground },

  clearBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  clearText: { flex: 1, ...typography.caption, color: colors.mutedForeground, lineHeight: 18 },

  histToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  histToggleText: { ...typography.label, color: colors.mutedForeground },
  history: { marginTop: spacing.md, gap: spacing.sm },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  histDot: { width: 7, height: 7, borderRadius: 999 },
  histText: { flex: 1 },
  histTitle: { ...typography.caption, fontSize: 13, color: colors.foreground, fontWeight: '600' },
  histSub: { ...typography.caption, fontSize: 11, color: colors.subtleForeground, marginTop: 1 },
  histDel: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
