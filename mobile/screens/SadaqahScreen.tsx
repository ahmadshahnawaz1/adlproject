/**
 * SadaqahScreen — the full giving history. A standing record of every ṣadaqah
 * and zakat payment: a lifetime total, a short monthly trend, a per-category
 * filter, and a dated, editable list. Add or amend a gift through the entry
 * sheet; the whole summary can be shared as text. Reads from the lifted
 * useCharityLog so it stays in step with the Zakat screen. Offline.
 */
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Plus, Share2, Trash2, X } from 'lucide-react-native';

import type { UseCharityLog } from '../hooks/useCharityLog';
import { ASNAF } from '../content/zakat/recipients';
import {
  categoryLabel,
  formatMoney,
  type CharityCategory,
  type CharityEntry,
  type CharityInput,
} from '../lib/charity';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import { CATEGORY_ICONS } from '../components/sadaqah/categoryIcons';
import SadaqahEntrySheet from '../components/sadaqah/SadaqahEntrySheet';

const RECIPIENT_BY_ID = new Map(ASNAF.map((r) => [r.id, r] as const));

function fullDate(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

type Filter = CharityCategory | 'all';

export default function SadaqahScreen({
  charity,
  onClose,
}: {
  charity: UseCharityLog;
  onClose?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [filter, setFilter] = useState<Filter>('all');
  const [entryOpen, setEntryOpen] = useState(false);
  const [editing, setEditing] = useState<CharityEntry | null>(null);

  const currency = charity.rows[0]?.currency ?? 'USD';
  const months = useMemo(() => charity.months(6), [charity]);
  const monthMax = Math.max(1, ...months.map((m) => m.total));

  const rows = useMemo(
    () => (filter === 'all' ? charity.rows : charity.rows.filter((e) => e.category === filter)),
    [charity.rows, filter],
  );

  const openAdd = () => {
    setEditing(null);
    setEntryOpen(true);
  };

  const editRow = (e: CharityEntry) => {
    Haptics.selectionAsync().catch(() => {});
    setEditing(e);
    setEntryOpen(true);
  };

  const submit = (input: CharityInput) => {
    if (editing) charity.edit(editing.id, input);
    else charity.addPayment(input);
    Haptics.selectionAsync().catch(() => {});
  };

  const share = () => {
    const lines = [
      'My giving — tracked with Adl',
      '',
      `Total given: ${formatMoney(charity.total, currency)}`,
      `${charity.count} ${charity.count === 1 ? 'gift' : 'gifts'} recorded`,
      '',
      ...charity.categories.map(
        (c) => `${categoryLabel(c.category)}: ${formatMoney(c.total, currency)}`,
      ),
      '',
      'Recorded privately on my device.',
    ];
    Share.share({ message: lines.join('\n') }).catch(() => {});
  };

  const header = (
    <View>
      <View style={styles.totalsCard}>
        <Text style={styles.totalsValue}>{formatMoney(charity.total, currency)}</Text>
        <Text style={styles.totalsLabel}>
          given across {charity.count} {charity.count === 1 ? 'gift' : 'gifts'}
        </Text>

        {months.some((m) => m.total > 0) ? (
          <View style={styles.trend}>
            {months.map((m) => (
              <View key={m.key} style={styles.trendCol}>
                <View style={styles.trendBarTrack}>
                  <View
                    style={[
                      styles.trendBar,
                      { height: `${Math.max(4, Math.round((m.total / monthMax) * 100))}%` },
                    ]}
                  />
                </View>
                <Text style={styles.trendLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.filters}>
        <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
        {charity.categories.map((c) => (
          <FilterChip
            key={c.category}
            label={categoryLabel(c.category)}
            active={filter === c.category}
            onPress={() => setFilter(c.category)}
          />
        ))}
      </View>
    </View>
  );

  const footer =
    charity.count > 0 ? (
      <View style={styles.footer}>
        <Pressable
          onPress={share}
          style={({ pressed }) => [styles.shareBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Share giving summary"
        >
          <Share2 size={16} color={colors.foreground} strokeWidth={2.3} />
          <Text style={styles.shareText}>Share summary</Text>
        </Pressable>
        <Text style={styles.disclaimer}>
          Your giving is stored only on this device. Amounts are what you record —
          keep your own receipts for any official purpose.
        </Text>
      </View>
    ) : null;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <Text style={styles.headerTitle}>Ṣadaqah</Text>
        <Pressable onPress={openAdd} hitSlop={12} style={styles.iconBtn} accessibilityLabel="Log a gift">
          <Plus size={20} color={colors.primary} strokeWidth={2.4} />
        </Pressable>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(e) => e.id}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No gifts yet</Text>
            <Text style={styles.emptyText}>
              Tap + to record a ṣadaqah or zakat payment. Every gift you log builds
              your giving history across the year.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const Icon = CATEGORY_ICONS[item.category];
          const recipient = item.recipientId ? RECIPIENT_BY_ID.get(item.recipientId) : undefined;
          return (
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Icon size={16} color={colors.primary} strokeWidth={2.2} />
              </View>
              <Pressable style={styles.rowMain} onPress={() => editRow(item)}>
                <Text style={styles.rowAmount}>{formatMoney(item.amount, item.currency)}</Text>
                <Text style={styles.rowSub}>
                  {categoryLabel(item.category)}
                  {recipient ? ` · ${recipient.name}` : ''} · {fullDate(item.ts)}
                </Text>
                {item.note ? <Text style={styles.rowNote}>{item.note}</Text> : null}
              </Pressable>
              <Pressable
                onPress={() => charity.remove(item.id)}
                hitSlop={8}
                style={({ pressed }) => [styles.rowDel, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Delete gift"
              >
                <Trash2 size={15} color={colors.subtleForeground} strokeWidth={2.1} />
              </Pressable>
            </View>
          );
        }}
      />

      <SadaqahEntrySheet
        visible={entryOpen}
        onClose={() => setEntryOpen(false)}
        currency={currency}
        recipients={ASNAF}
        initial={editing}
        onSubmit={submit}
        onDelete={charity.remove}
      />
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, active && styles.chipOn, pressed && styles.pressed]}
    >
      <Text style={[styles.chipText, active && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'] + spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: { ...typography.title, color: colors.foreground },
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
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] },

  totalsCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.md,
  },
  totalsValue: { fontSize: 34, fontWeight: '800', color: colors.primary, fontVariant: ['tabular-nums'] },
  totalsLabel: { ...typography.caption, color: colors.mutedForeground, marginTop: 2 },
  trend: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, height: 64, marginTop: spacing.lg },
  trendCol: { flex: 1, alignItems: 'center', gap: 4 },
  trendBarTrack: { width: '100%', height: 44, justifyContent: 'flex-end' },
  trendBar: { width: '70%', alignSelf: 'center', borderRadius: 4, backgroundColor: colors.primary, minHeight: 3 },
  trendLabel: { fontSize: 10, color: colors.subtleForeground },

  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primary },
  chipText: { ...typography.label, color: colors.mutedForeground },
  chipTextOn: { color: colors.primaryForeground, fontWeight: '700' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardElevated,
  },
  rowMain: { flex: 1, gap: 2 },
  rowAmount: { ...typography.body, color: colors.foreground, fontWeight: '700', fontVariant: ['tabular-nums'] },
  rowSub: { ...typography.caption, color: colors.mutedForeground },
  rowNote: { ...typography.caption, color: colors.subtleForeground, fontStyle: 'italic' },
  rowDel: { width: 34, height: 34, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },

  empty: { paddingTop: spacing['2xl'], alignItems: 'center', gap: spacing.sm },
  emptyTitle: { ...typography.title, fontSize: 18, color: colors.foreground },
  emptyText: { ...typography.body, color: colors.mutedForeground, textAlign: 'center', lineHeight: 21 },

  footer: { marginTop: spacing.xl, gap: spacing.md },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  shareText: { ...typography.button, color: colors.foreground },
  disclaimer: { ...typography.caption, color: colors.subtleForeground, lineHeight: 17, textAlign: 'center' },
  pressed: { opacity: 0.7 },
});
