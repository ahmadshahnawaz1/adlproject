/**
 * ShareTable — the result of a division: each heir's exact fraction, what that
 * comes to per person, and the money amount when an estate value was entered.
 *
 * The fraction is always shown, because it is the ruling; the currency figure
 * is only ever a convenience rounded for display.
 */
import { StyleSheet, View } from 'react-native';
import { Ban } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { format, toNumber } from '../../lib/faraid/fraction';
import { HEIR_BY_ID } from '../../lib/faraid/heirs';
import type { HeirShare } from '../../lib/faraid/distribute';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

function money(amount: number): string {
  return amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function ShareTable({
  shares,
  excluded,
  net,
}: {
  shares: HeirShare[];
  excluded: HeirShare[];
  /** Divisible estate; when zero only fractions are shown. */
  net: number;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.wrap}>
      {shares.map((s) => {
        const meta = HEIR_BY_ID[s.id];
        const pct = toNumber(s.share) * 100;
        return (
          <View key={s.id} style={styles.row}>
            <View style={styles.left}>
              <AppText style={styles.name}>
                {s.count > 1 ? `${s.count} ${meta.plural.toLowerCase()}` : meta.label}
              </AppText>
              <AppText style={styles.reason}>{s.reason}</AppText>
              {s.count > 1 ? (
                <AppText style={styles.each}>
                  {format(s.perPerson)} each
                  {net > 0 ? ` · ${money(toNumber(s.perPerson) * net)}` : ''}
                </AppText>
              ) : null}
            </View>
            <View style={styles.right}>
              <AppText style={styles.fraction}>{format(s.share)}</AppText>
              <AppText style={styles.pct}>{pct.toFixed(pct % 1 === 0 ? 0 : 2)}%</AppText>
              {net > 0 ? (
                <AppText style={styles.amount}>{money(toNumber(s.share) * net)}</AppText>
              ) : null}
            </View>
          </View>
        );
      })}

      {excluded.length > 0 ? (
        <View style={styles.excludedWrap}>
          <AppText style={styles.excludedHead}>Inherit nothing in this case</AppText>
          {excluded.map((e) => (
            <View key={e.id} style={styles.excludedRow}>
              <Ban size={13} color={colors.subtleForeground} strokeWidth={2.25} />
              <AppText style={styles.excludedText}>
                {e.count > 1 ? `${e.count} ${HEIR_BY_ID[e.id].plural.toLowerCase()}` : HEIR_BY_ID[e.id].label}
                {' — '}
                {e.reason.replace(/^Excluded by /, 'excluded by ')}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: { gap: spacing.xs },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    left: { flex: 1, gap: 2 },
    name: { fontFamily, fontSize: 15, fontWeight: '600', color: colors.foreground },
    reason: { fontFamily, fontSize: 12, lineHeight: 18, color: colors.mutedForeground },
    each: { ...typography.caption, fontSize: 11, color: colors.subtleForeground },
    right: { alignItems: 'flex-end', gap: 1, minWidth: 74 },
    fraction: { ...typography.title, fontSize: 20, color: colors.primary },
    pct: { ...typography.caption, fontSize: 11, color: colors.subtleForeground },
    amount: { fontFamily, fontSize: 13, fontWeight: '600', color: colors.foreground },
    excludedWrap: {
      marginTop: spacing.sm,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.xs,
    },
    excludedHead: {
      ...typography.caption,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.subtleForeground,
      marginBottom: 2,
    },
    excludedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    excludedText: { flex: 1, fontFamily, fontSize: 12, lineHeight: 18, color: colors.mutedForeground },
  });
