/**
 * HeirStepper — one row of the "who survived" form. Heirs that can only ever
 * be one person (a father, a husband) toggle; the rest step up and down.
 */
import { Pressable, StyleSheet, View } from 'react-native';
import { Check, Minus, Plus } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { haptics } from '../../lib/haptics';
import type { HeirMeta } from '../../lib/faraid/heirs';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

export default function HeirStepper({
  meta,
  value,
  onChange,
}: {
  meta: HeirMeta;
  value: number;
  onChange: (next: number) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const single = meta.max === 1;
  const active = value > 0;

  const set = (next: number) => {
    if (next === value) return;
    haptics.selection();
    onChange(next);
  };

  return (
    <View style={[styles.row, active && styles.rowActive]}>
      <View style={styles.text}>
        <AppText style={[styles.label, active && styles.labelActive]}>
          {value > 1 ? meta.plural : meta.label}
        </AppText>
        <AppText style={styles.arabic}>{meta.arabic}</AppText>
      </View>

      {single ? (
        <Pressable
          onPress={() => set(active ? 0 : 1)}
          style={[styles.check, active && styles.checkOn]}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: active }}
          accessibilityLabel={meta.label}
          hitSlop={8}
        >
          {active ? <Check size={16} color={colors.primaryForeground} strokeWidth={3} /> : null}
        </Pressable>
      ) : (
        <View style={styles.stepper}>
          <Pressable
            onPress={() => set(Math.max(0, value - 1))}
            disabled={value === 0}
            style={[styles.stepBtn, value === 0 && styles.stepDisabled]}
            accessibilityRole="button"
            accessibilityLabel={`One fewer ${meta.label}`}
            hitSlop={6}
          >
            <Minus size={15} color={value === 0 ? colors.subtleForeground : colors.foreground} strokeWidth={2.5} />
          </Pressable>
          <AppText style={[styles.count, active && styles.countOn]}>{value}</AppText>
          <Pressable
            onPress={() => set(Math.min(meta.max, value + 1))}
            disabled={value >= meta.max}
            style={[styles.stepBtn, value >= meta.max && styles.stepDisabled]}
            accessibilityRole="button"
            accessibilityLabel={`One more ${meta.label}`}
            hitSlop={6}
          >
            <Plus size={15} color={value >= meta.max ? colors.subtleForeground : colors.foreground} strokeWidth={2.5} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: 'transparent',
      minHeight: 52,
    },
    rowActive: { backgroundColor: `${colors.primary}0F`, borderColor: `${colors.primary}33` },
    text: { flex: 1, gap: 1 },
    label: { fontFamily, fontSize: 14, color: colors.foreground },
    labelActive: { fontWeight: '600' },
    arabic: { fontFamily, fontSize: 12, color: colors.subtleForeground },
    check: {
      width: 26,
      height: 26,
      borderRadius: radius.sm,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    stepBtn: {
      width: 30,
      height: 30,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stepDisabled: { opacity: 0.4 },
    count: { ...typography.label, minWidth: 20, textAlign: 'center', color: colors.mutedForeground },
    countOn: { color: colors.primary, fontWeight: '700' },
  });
