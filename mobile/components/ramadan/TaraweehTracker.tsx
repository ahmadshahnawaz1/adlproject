/**
 * TaraweehTracker — tonight's standing in prayer: a stepper for the rakʿahs
 * prayed, the two recognised counts as quick presets, and the month's tally.
 */
import { Pressable, StyleSheet, View } from 'react-native';
import { Minus, Moon, Plus } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { haptics } from '../../lib/haptics';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { TARAWEEH_OPINIONS } from '../../lib/ramadan';

export default function TaraweehTracker({
  tonight,
  nightsStood,
  total,
  average,
  onChange,
}: {
  tonight: number;
  nightsStood: number;
  total: number;
  average: number;
  onChange: (rakahs: number) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const step = (delta: number) => {
    const next = Math.max(0, tonight + delta);
    haptics.selection();
    onChange(next);
  };

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Moon size={15} color={colors.primary} strokeWidth={2.2} />
        <AppText style={styles.kicker}>TARĀWĪḤ TONIGHT</AppText>
      </View>

      <View style={styles.stepper}>
        <Pressable
          onPress={() => step(-2)}
          disabled={tonight === 0}
          style={({ pressed }) => [styles.stepBtn, tonight === 0 && styles.stepDisabled, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Remove two rakʿahs"
        >
          <Minus size={18} color={colors.foreground} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.readout}>
          <AppText style={styles.count}>{tonight}</AppText>
          <AppText style={styles.countLabel}>rakʿahs</AppText>
        </View>

        <Pressable
          onPress={() => step(2)}
          style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Add two rakʿahs"
        >
          <Plus size={18} color={colors.foreground} strokeWidth={2.4} />
        </Pressable>
      </View>

      <View style={styles.presets}>
        {TARAWEEH_OPINIONS.map((o) => (
          <Pressable
            key={o.rakahs}
            onPress={() => {
              haptics.success();
              onChange(o.rakahs);
            }}
            style={({ pressed }) => [
              styles.preset,
              tonight === o.rakahs && styles.presetOn,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: tonight === o.rakahs }}
            accessibilityLabel={o.label}
          >
            <AppText style={[styles.presetText, tonight === o.rakahs && styles.presetTextOn]}>
              {o.label}
            </AppText>
          </Pressable>
        ))}
      </View>

      <View style={styles.stats}>
        <Stat label="Nights" value={String(nightsStood)} />
        <Stat label="Rakʿahs" value={String(total)} />
        <Stat label="Average" value={average > 0 ? String(average) : '—'} />
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.stat}>
      <AppText style={styles.statValue}>{value}</AppText>
      <AppText style={styles.statLabel}>{label}</AppText>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.lg,
      gap: spacing.md,
    },
    head: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    kicker: {
      ...typography.caption,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.primary,
    },
    stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    stepBtn: {
      width: 48,
      height: 48,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cardElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stepDisabled: { opacity: 0.4 },
    readout: { alignItems: 'center', gap: 2 },
    count: { ...typography.display, fontSize: 40, color: colors.foreground },
    countLabel: { ...typography.caption, fontSize: 11, color: colors.subtleForeground },
    presets: { flexDirection: 'row', gap: spacing.sm },
    preset: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      minHeight: 40,
      justifyContent: 'center',
    },
    presetOn: { borderColor: colors.primary, backgroundColor: `${colors.primary}14` },
    presetText: { fontFamily, fontSize: 12, color: colors.mutedForeground },
    presetTextOn: { color: colors.primary, fontWeight: '600' },
    stats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.md,
    },
    stat: { alignItems: 'center', gap: 2 },
    statValue: { ...typography.title, fontSize: 17, color: colors.foreground },
    statLabel: { ...typography.caption, fontSize: 10, color: colors.subtleForeground },
    pressed: { opacity: 0.85 },
  });
