/**
 * FaraidScreen — the inheritance calculator (F26).
 *
 * Enter the estate and who survived; the shares are computed as exact
 * fractions. Where the schools genuinely differ the result is withheld and the
 * disagreement is named, because a wrong share here divides a real estate
 * wrongly. Fully offline.
 */
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Info, RotateCcw, Scale, TriangleAlert, X } from 'lucide-react-native';
import AppText from '../components/ui/AppText';
import HeirStepper from '../components/faraid/HeirStepper';
import ShareTable from '../components/faraid/ShareTable';
import FaraidInfoSheet from '../components/faraid/FaraidInfoSheet';
import { haptics } from '../lib/haptics';
import { breakdown } from '../lib/faraid/estate';
import { distribute } from '../lib/faraid/distribute';
import { format } from '../lib/faraid/fraction';
import { clampCount, GROUP_LABELS, HEIRS, type HeirCounts, type HeirGroup, type HeirId } from '../lib/faraid/heirs';
import { FARAID_DISCLAIMER } from '../content/faraid';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const GROUPS: HeirGroup[] = ['spouse', 'descendants', 'ascendants', 'siblings'];

const MONEY_FIELDS: { key: 'gross' | 'funeral' | 'debts' | 'bequest'; label: string; hint: string }[] = [
  { key: 'gross', label: 'Estate value', hint: 'Everything the deceased owned' },
  { key: 'funeral', label: 'Burial costs', hint: 'Taken out first' },
  { key: 'debts', label: 'Debts', hint: 'Paid in full before any heir' },
  { key: 'bequest', label: 'Bequest', hint: 'Capped at a third' },
];

export default function FaraidScreen({ onClose }: { onClose?: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [counts, setCounts] = useState<HeirCounts>({});
  const [money, setMoney] = useState({ gross: '', funeral: '', debts: '', bequest: '' });
  const [infoOpen, setInfoOpen] = useState(false);

  const estate = useMemo(
    () =>
      breakdown({
        gross: Number(money.gross) || 0,
        funeral: Number(money.funeral) || 0,
        debts: Number(money.debts) || 0,
        bequest: Number(money.bequest) || 0,
      }),
    [money],
  );

  const result = useMemo(() => distribute(counts), [counts]);
  const anyHeir = Object.values(counts).some((v) => (v ?? 0) > 0);

  const setHeir = (id: HeirId, next: number) =>
    setCounts((prev) => ({ ...prev, [id]: clampCount(id, next) }));

  const reset = () => {
    haptics.warning();
    setCounts({});
    setMoney({ gross: '', funeral: '', debts: '', bequest: '' });
  };

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Close">
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <AppText style={styles.headerTitle}>Inheritance</AppText>
          <AppText style={styles.headerSub} numberOfLines={1}>Farāʾiḍ · ٱلْفَرَائِض</AppText>
        </View>
        <Pressable onPress={() => setInfoOpen(true)} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="About farāʾiḍ">
          <Info size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* The estate */}
        <View style={styles.card}>
          <AppText style={styles.cardTitle}>The estate</AppText>
          <AppText style={styles.cardBody}>
            Optional — leave blank to see the shares as fractions only.
          </AppText>
          {MONEY_FIELDS.map((f) => (
            <View key={f.key} style={styles.moneyRow}>
              <View style={styles.moneyText}>
                <AppText style={styles.moneyLabel}>{f.label}</AppText>
                <AppText style={styles.moneyHint}>{f.hint}</AppText>
              </View>
              <TextInput
                value={money[f.key]}
                onChangeText={(t) => setMoney((p) => ({ ...p, [f.key]: t.replace(/[^0-9.]/g, '') }))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.subtleForeground}
                style={styles.input}
                accessibilityLabel={f.label}
              />
            </View>
          ))}

          {estate.bequestCapped ? (
            <View style={styles.warn}>
              <TriangleAlert size={14} color={colors.primary} strokeWidth={2.25} />
              <AppText style={styles.warnText}>
                A bequest may not exceed a third without the heirs’ consent. Capped at {fmt(estate.bequestCap)}.
              </AppText>
            </View>
          ) : null}

          {estate.insolvent && estate.gross > 0 ? (
            <View style={styles.warn}>
              <TriangleAlert size={14} color={colors.destructive} strokeWidth={2.25} />
              <AppText style={[styles.warnText, { color: colors.destructive }]}>
                Burial costs and debts take up the whole estate. Nothing passes to the heirs.
              </AppText>
            </View>
          ) : null}

          {estate.net > 0 ? (
            <View style={styles.netRow}>
              <AppText style={styles.netLabel}>To divide</AppText>
              <AppText style={styles.netValue}>{fmt(estate.net)}</AppText>
            </View>
          ) : null}
        </View>

        {/* Who survived */}
        {GROUPS.map((g) => (
          <View key={g} style={styles.card}>
            <AppText style={styles.cardTitle}>{GROUP_LABELS[g]}</AppText>
            {HEIRS.filter((h) => h.group === g).map((h) => (
              <View key={h.id}>
                <HeirStepper meta={h} value={counts[h.id] ?? 0} onChange={(n) => setHeir(h.id, n)} />
                {h.note && (counts[h.id] ?? 0) > 0 ? (
                  <AppText style={styles.heirNote}>{h.note}</AppText>
                ) : null}
              </View>
            ))}
          </View>
        ))}

        {/* Result */}
        {!anyHeir ? (
          <View style={styles.empty}>
            <Scale size={26} color={colors.subtleForeground} strokeWidth={1.75} />
            <AppText style={styles.emptyText}>
              Choose who survived the deceased and the division will appear here.
            </AppText>
          </View>
        ) : result.blocked ? (
          <View style={styles.blocked}>
            <View style={styles.blockedHead}>
              <TriangleAlert size={17} color={colors.destructive} strokeWidth={2.25} />
              <AppText style={styles.blockedTitle}>This case needs a scholar</AppText>
            </View>
            <AppText style={styles.blockedText}>{result.blocked}</AppText>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.resultHead}>
              <AppText style={styles.cardTitle}>The division</AppText>
              <View style={styles.badges}>
                {result.awl ? <AppText style={styles.badge}>ʿawl</AppText> : null}
                {result.radd ? <AppText style={styles.badge}>radd</AppText> : null}
                <AppText style={styles.base}>base {result.base}</AppText>
              </View>
            </View>

            <ShareTable shares={result.shares} excluded={result.excluded} net={estate.net} />

            <View style={styles.totalRow}>
              <AppText style={styles.totalLabel}>Total</AppText>
              <AppText style={styles.totalValue}>{format(result.total)}</AppText>
            </View>

            {result.notes.map((n) => (
              <View key={n} style={styles.note}>
                <AppText style={styles.noteText}>{n}</AppText>
              </View>
            ))}
          </View>
        )}

        {anyHeir ? (
          <Pressable onPress={reset} style={styles.resetBtn} accessibilityRole="button" accessibilityLabel="Clear all">
            <RotateCcw size={15} color={colors.mutedForeground} strokeWidth={2.25} />
            <AppText style={styles.resetText}>Start again</AppText>
          </Pressable>
        ) : null}

        <AppText style={styles.disclaimer}>{FARAID_DISCLAIMER}</AppText>
      </ScrollView>

      <FaraidInfoSheet visible={infoOpen} onClose={() => setInfoOpen(false)} />
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
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    cardTitle: { ...typography.title, fontSize: 16, color: colors.foreground },
    cardBody: { fontFamily, fontSize: 12, lineHeight: 18, color: colors.subtleForeground },
    moneyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      paddingVertical: spacing.xs,
      minHeight: 46,
    },
    moneyText: { flex: 1, gap: 1 },
    moneyLabel: { fontFamily, fontSize: 14, color: colors.foreground },
    moneyHint: { ...typography.caption, fontSize: 11, color: colors.subtleForeground },
    input: {
      minWidth: 96,
      textAlign: 'right',
      fontFamily,
      fontSize: 15,
      color: colors.foreground,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
    },
    warn: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', marginTop: spacing.xs },
    warnText: { flex: 1, fontFamily, fontSize: 12, lineHeight: 18, color: colors.mutedForeground },
    netRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    netLabel: { fontFamily, fontSize: 14, color: colors.mutedForeground },
    netValue: { ...typography.title, fontSize: 18, color: colors.primary },
    heirNote: {
      ...typography.caption,
      fontSize: 11,
      lineHeight: 17,
      color: colors.subtleForeground,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
    },
    empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing['2xl'] },
    emptyText: {
      fontFamily,
      fontSize: 13,
      lineHeight: 20,
      color: colors.subtleForeground,
      textAlign: 'center',
      maxWidth: 260,
    },
    blocked: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: `${colors.destructive}55`,
      backgroundColor: `${colors.destructive}0F`,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    blockedHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    blockedTitle: { ...typography.title, fontSize: 16, color: colors.destructive },
    blockedText: { fontFamily, fontSize: 13, lineHeight: 21, color: colors.mutedForeground },
    resultHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    badges: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    badge: {
      ...typography.caption,
      fontSize: 10,
      color: colors.primary,
      backgroundColor: `${colors.primary}14`,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: radius.full,
      overflow: 'hidden',
    },
    base: { ...typography.caption, fontSize: 10, color: colors.subtleForeground },
    totalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: spacing.md,
    },
    totalLabel: { fontFamily, fontSize: 13, color: colors.subtleForeground },
    totalValue: { ...typography.title, fontSize: 15, color: colors.foreground },
    note: {
      borderRadius: radius.md,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      backgroundColor: colors.cardElevated,
      padding: spacing.md,
      marginTop: spacing.xs,
    },
    noteText: { fontFamily, fontSize: 12, lineHeight: 19, color: colors.mutedForeground },
    resetBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 46,
    },
    resetText: { ...typography.button, fontSize: 14, color: colors.mutedForeground },
    disclaimer: {
      fontFamily,
      fontSize: 12,
      lineHeight: 18,
      color: colors.subtleForeground,
      textAlign: 'center',
    },
  });
