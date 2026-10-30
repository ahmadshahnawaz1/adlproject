/**
 * FastingLedgerCard — the make-up (qaḍāʾ) fasting account. A standing ledger of
 * fasts owed from broken or exempt days, with a stepper (− made up · + owed),
 * the total still due, a sparkline of how it has moved, repayment progress, and
 * an expandable dated history. Mirrors the qaza prayer ledger. Offline.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  History,
  Minus,
  Plus,
  Trash2,
} from 'lucide-react-native';
import type { UseFastingLedger } from '../hooks/useFastingLedger';
import { colors, radius, spacing, typography } from '../theme/tokens';

const BLUE = '#60A5FA';

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
      <Polyline points={points} fill="none" stroke={BLUE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}

function relTime(ts: string): string {
  const mins = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

export default function FastingLedgerCard({ ledger }: { ledger: UseFastingLedger }) {
  const [open, setOpen] = useState(false);
  const progressPct = Math.round(ledger.progress * 100);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headLeft}>
          <History size={16} color={ledger.total > 0 ? BLUE : colors.success} strokeWidth={2.2} />
          <Text style={styles.title}>Qaḍāʾ fasts</Text>
        </View>
        {ledger.series.length > 1 ? <Sparkline data={ledger.series} /> : null}
      </View>

      <View style={styles.headline}>
        <View>
          <Text style={[styles.total, ledger.total === 0 && styles.totalClear]}>{ledger.total}</Text>
          <Text style={styles.totalUnit}>fasts still owed</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.metaLine}>Owed lifetime · {ledger.added}</Text>
          <Text style={styles.metaLine}>Made up · {ledger.repaid}</Text>
        </View>
      </View>

      {ledger.added > 0 ? (
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.progressText}>{progressPct}% made up</Text>
        </View>
      ) : null}

      <View style={styles.stepper}>
        <Text style={styles.stepperLabel}>Adjust</Text>
        <View style={styles.controls}>
          <Pressable
            onPress={() => ledger.repay(1)}
            hitSlop={8}
            disabled={ledger.total === 0}
            style={({ pressed }) => [
              styles.ctrl,
              ledger.total === 0 && styles.ctrlDisabled,
              pressed && ledger.total > 0 && styles.ctrlPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Make up one fast"
          >
            <Minus size={16} color={ledger.total === 0 ? colors.subtleForeground : colors.success} strokeWidth={2.6} />
          </Pressable>
          <View style={styles.countWrap}>
            <Text style={[styles.count, ledger.total > 0 && styles.countOwed]}>{ledger.total}</Text>
          </View>
          <Pressable
            onPress={() => ledger.addDebt(1)}
            hitSlop={8}
            style={({ pressed }) => [styles.ctrl, pressed && styles.ctrlPressed]}
            accessibilityRole="button"
            accessibilityLabel="Add one owed fast"
          >
            <Plus size={16} color={BLUE} strokeWidth={2.6} />
          </Pressable>
        </View>
      </View>

      {ledger.total === 0 ? (
        <View style={styles.clearBanner}>
          <CheckCircle2 size={16} color={colors.success} strokeWidth={2.3} />
          <Text style={styles.clearText}>
            Nothing outstanding. Tap + to record fasts you owe from past Ramadans.
          </Text>
        </View>
      ) : null}

      {ledger.rows.length > 0 ? (
        <>
          <Pressable
            onPress={() => setOpen((s) => !s)}
            style={({ pressed }) => [styles.histToggle, pressed && styles.ctrlPressed]}
          >
            <Text style={styles.histToggleText}>{open ? 'Hide history' : `History · ${ledger.rows.length}`}</Text>
            {open ? (
              <ChevronUp size={16} color={colors.mutedForeground} strokeWidth={2.2} />
            ) : (
              <ChevronDown size={16} color={colors.mutedForeground} strokeWidth={2.2} />
            )}
          </Pressable>

          {open ? (
            <View style={styles.history}>
              {ledger.rows.slice(0, 40).map((r) => {
                const repaid = r.delta < 0;
                return (
                  <View key={r.id} style={styles.histRow}>
                    <View style={[styles.histDot, { backgroundColor: repaid ? colors.success : BLUE }]} />
                    <View style={styles.histText}>
                      <Text style={styles.histTitle}>
                        {repaid ? 'Made up' : 'Owed'} {Math.abs(r.delta)} {Math.abs(r.delta) === 1 ? 'fast' : 'fasts'}
                      </Text>
                      <Text style={styles.histSub}>
                        {relTime(r.ts)} · balance {r.balance}
                        {r.note ? ` · ${r.note}` : ''}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => ledger.remove(r.id)}
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

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.lg,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { ...typography.button, color: colors.foreground },

  headline: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: spacing.md },
  total: { fontSize: 34, fontWeight: '800', color: BLUE, fontVariant: ['tabular-nums'] },
  totalClear: { color: colors.success },
  totalUnit: { ...typography.caption, color: colors.mutedForeground, marginTop: 1 },
  meta: { alignItems: 'flex-end', gap: 2 },
  metaLine: { ...typography.caption, color: colors.subtleForeground, fontVariant: ['tabular-nums'] },

  progressWrap: { gap: 4, marginBottom: spacing.lg },
  progressTrack: { height: 6, borderRadius: 999, backgroundColor: colors.cardElevated, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 999, backgroundColor: colors.success },
  progressText: { ...typography.caption, fontSize: 11, color: colors.subtleForeground },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
  },
  stepperLabel: { ...typography.body, fontSize: 15, fontWeight: '600', color: colors.foreground },
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

  clearBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
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
  histDel: { width: 28, height: 28, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});
