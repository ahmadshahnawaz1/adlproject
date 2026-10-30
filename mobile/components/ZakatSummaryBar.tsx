/**
 * ZakatSummaryBar — a sticky footer that keeps the running total and the zakat
 * due in view as the user fills the worksheet, with a call-to-action to open
 * the full result. Shared by the worksheet and the guided wizard.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { formatMoney } from '../lib/zakat';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function ZakatSummaryBar({
  netZakatable,
  zakatDue,
  currency,
  meetsNisab,
  ctaLabel = 'See result',
  onPress,
}: {
  netZakatable: number;
  zakatDue: number;
  currency: string;
  meetsNisab: boolean;
  ctaLabel?: string;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.bar}>
      <View style={styles.figures}>
        <Text style={styles.label}>Net zakatable</Text>
        <Text style={styles.net}>{formatMoney(netZakatable, currency)}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.figures}>
        <Text style={styles.label}>Zakat due</Text>
        <Text style={[styles.due, { color: meetsNisab ? colors.primary : colors.subtleForeground }]}>
          {formatMoney(zakatDue, currency)}
        </Text>
      </View>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
        accessibilityRole="button"
      >
        <Text style={styles.ctaText}>{ctaLabel}</Text>
        <ArrowRight size={16} color={colors.primaryForeground} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  figures: { gap: 2 },
  label: {
    ...typography.label,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.subtleForeground,
  },
  net: { ...typography.button, color: colors.foreground, fontVariant: ['tabular-nums'] },
  due: { ...typography.title, fontSize: 18, fontVariant: ['tabular-nums'] },
  divider: { width: 1, height: 28, backgroundColor: colors.border },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: 'auto',
    paddingHorizontal: spacing.lg,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  ctaText: { ...typography.button, color: colors.primaryForeground, fontWeight: '700' },
});
