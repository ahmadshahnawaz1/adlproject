/**
 * StepNavigator — the control bar beneath a rite: previous / next, the position
 * within the journey, and a gating rule in Perform mode (a pillar or counted
 * rite must be completed before "Next" advances). Learn mode never gates.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function StepNavigator({
  index,
  total,
  hasPrev,
  hasNext,
  canAdvance = true,
  blockedHint,
  haptics = true,
  onPrev,
  onNext,
}: {
  index: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  canAdvance?: boolean;
  blockedHint?: string;
  haptics?: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  const buzz = () => {
    if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };
  const press = (fn: () => void) => () => {
    buzz();
    fn();
  };

  const nextDisabled = !canAdvance;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <NavButton label="Back" arrow="←" side="left" disabled={!hasPrev} onPress={press(onPrev)} />
        <View style={styles.counter}>
          <Text style={styles.counterText}>{index + 1}</Text>
          <Text style={styles.counterTotal}> / {total}</Text>
        </View>
        <NavButton label={hasNext ? 'Next' : 'Done'} arrow={hasNext ? '→' : '✓'} side="right" primary disabled={nextDisabled} onPress={press(onNext)} />
      </View>
      {nextDisabled && blockedHint ? <Text style={styles.hint}>{blockedHint}</Text> : null}
    </View>
  );
}

function NavButton({
  label,
  arrow,
  side,
  primary = false,
  disabled = false,
  onPress,
}: {
  label: string;
  arrow: string;
  side: 'left' | 'right';
  primary?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.btn, primary && styles.btnPrimary, disabled && styles.btnDisabled, pressed && !disabled && styles.btnPressed]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {side === 'left' ? <Text style={[styles.arrow, primary && styles.arrowPrimary, disabled && styles.txtDisabled]}>{arrow}</Text> : null}
      <Text style={[styles.btnText, primary && styles.btnTextPrimary, disabled && styles.txtDisabled]}>{label}</Text>
      {side === 'right' ? <Text style={[styles.arrow, primary && styles.arrowPrimary, disabled && styles.txtDisabled]}>{arrow}</Text> : null}
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  counter: { flexDirection: 'row', alignItems: 'baseline' },
  counterText: { fontFamily, fontSize: typography.body.fontSize, fontWeight: '700', color: colors.foreground },
  counterTotal: { fontFamily, fontSize: typography.caption.fontSize, color: colors.subtleForeground },
  btn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 46, paddingHorizontal: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardElevated },
  btnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  btnDisabled: { opacity: 0.4 },
  btnPressed: { opacity: 0.85 },
  btnText: { fontFamily, fontSize: typography.button.fontSize, fontWeight: '600', color: colors.foreground },
  btnTextPrimary: { color: colors.primaryForeground },
  arrow: { fontFamily, fontSize: typography.button.fontSize, color: colors.foreground },
  arrowPrimary: { color: colors.primaryForeground },
  txtDisabled: { color: colors.subtleForeground },
  hint: { fontFamily, fontSize: typography.caption.fontSize, color: colors.subtleForeground, textAlign: 'center' },
});
