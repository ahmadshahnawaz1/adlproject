/**
 * SadaqahLogCard — the giving companion to the Zakat calculator. Where the
 * calculator says what is *due*, this shows what has been *given*: the amount
 * contributed within the current ḥawl set against the zakat owed, a lifetime
 * total, a giving sparkline, the per-category split and the most recent gifts.
 * Self-contained; all state lives in useCharityLog. Offline.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { ChevronRight, HandCoins, Plus } from 'lucide-react-native';

import type { UseCharityLog } from '../../hooks/useCharityLog';
import {
  categoryLabel,
  formatMoney,
  type CharityEntry,
} from '../../lib/charity';
import { radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { CATEGORY_ICONS } from './categoryIcons';

function Sparkline({ data }: { data: number[] }) {
  const { colors } = useTheme();
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
        stroke={colors.primary}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
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

export default function SadaqahLogCard({
  charity,
  currency,
  zakatDue,
  hawlStartISO,
  onAddPayment,
  onOpenAll,
}: {
  charity: UseCharityLog;
  currency: string;
  zakatDue: number;
  hawlStartISO: string | null;
  onAddPayment: () => void;
  onOpenAll: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const given = charity.givenThisHawl(hawlStartISO);
  const pct = zakatDue > 0 ? Math.min(1, given / zakatDue) : null;
  const pctLabel = pct === null ? null : Math.round(pct * 100);
  const recent: CharityEntry[] = charity.rows.slice(0, 3);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headLeft}>
          <HandCoins size={16} color={colors.primary} strokeWidth={2.2} />
          <Text style={styles.title}>Ṣadaqah & zakat given</Text>
        </View>
        {charity.series.length > 1 ? <Sparkline data={charity.series} /> : null}
      </View>

      <View style={styles.headline}>
        <View>
          <Text style={styles.total}>{formatMoney(given, currency)}</Text>
          <Text style={styles.totalUnit}>
            {hawlStartISO ? 'given this ḥawl' : 'given so far'}
          </Text>
        </View>
        <View style={styles.meta}>
          {zakatDue > 0 ? (
            <Text style={styles.metaLine}>Zakat due · {formatMoney(zakatDue, currency)}</Text>
          ) : null}
          <Text style={styles.metaLine}>
            Lifetime · {formatMoney(charity.total, currency)}
          </Text>
          <Text style={styles.metaLine}>
            {charity.count} {charity.count === 1 ? 'gift' : 'gifts'}
          </Text>
        </View>
      </View>

      {pctLabel !== null ? (
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pctLabel}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {pctLabel}% of this year’s zakat given
          </Text>
        </View>
      ) : null}

      {charity.categories.length > 0 ? (
        <View style={styles.chips}>
          {charity.categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.category];
            return (
              <View key={c.category} style={styles.chip}>
                <Icon size={12} color={colors.mutedForeground} strokeWidth={2.2} />
                <Text style={styles.chipText}>
                  {categoryLabel(c.category)} · {formatMoney(c.total, currency)}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {recent.length > 0 ? (
        <View style={styles.recent}>
          {recent.map((e) => {
            const Icon = CATEGORY_ICONS[e.category];
            return (
              <View key={e.id} style={styles.recentRow}>
                <View style={styles.recentIcon}>
                  <Icon size={14} color={colors.primary} strokeWidth={2.2} />
                </View>
                <View style={styles.recentText}>
                  <Text style={styles.recentTitle}>
                    {formatMoney(e.amount, e.currency)} · {categoryLabel(e.category)}
                  </Text>
                  <Text style={styles.recentSub}>
                    {relTime(e.ts)}
                    {e.note ? ` · ${e.note}` : ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            No gifts logged yet. Record your ṣadaqah and zakat to track your giving
            across the year.
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <Pressable
          onPress={onAddPayment}
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Log a gift"
        >
          <Plus size={16} color={colors.primaryForeground} strokeWidth={2.6} />
          <Text style={styles.primaryText}>Log a gift</Text>
        </Pressable>
        {charity.count > 0 ? (
          <Pressable
            onPress={onOpenAll}
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="View all giving"
          >
            <Text style={styles.secondaryText}>View all</Text>
            <ChevronRight size={15} color={colors.foreground} strokeWidth={2.4} />
          </Pressable>
        ) : null}
      </View>
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
  total: { fontSize: 30, fontWeight: '800', color: colors.primary, fontVariant: ['tabular-nums'] },
  totalUnit: { ...typography.caption, color: colors.mutedForeground, marginTop: 1 },
  meta: { alignItems: 'flex-end', gap: 2 },
  metaLine: { ...typography.caption, color: colors.subtleForeground, fontVariant: ['tabular-nums'] },

  progressWrap: { gap: 4, marginBottom: spacing.md },
  progressTrack: { height: 6, borderRadius: 999, backgroundColor: colors.cardElevated, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 999, backgroundColor: colors.primary },
  progressText: { ...typography.caption, fontSize: 11, color: colors.subtleForeground },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { ...typography.caption, fontSize: 11, color: colors.mutedForeground },

  recent: { gap: spacing.sm, marginBottom: spacing.md },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  recentIcon: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardElevated,
  },
  recentText: { flex: 1, gap: 1 },
  recentTitle: { ...typography.body, fontSize: 14, color: colors.foreground, fontWeight: '600' },
  recentSub: { ...typography.caption, color: colors.subtleForeground },

  empty: { paddingVertical: spacing.sm, marginBottom: spacing.sm },
  emptyText: { ...typography.caption, color: colors.mutedForeground, lineHeight: 18 },

  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  primaryText: { ...typography.button, color: colors.primaryForeground },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
  },
  secondaryText: { ...typography.button, color: colors.foreground },
  pressed: { opacity: 0.7 },
});
