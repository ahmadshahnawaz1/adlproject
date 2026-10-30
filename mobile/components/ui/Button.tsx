import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import AppText from './AppText';
import useA11ySettings from '../../hooks/useA11ySettings';
import { radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
};

/** Button — shadcn/ui-inspired, with press feedback and variants. */
export default function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
}: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { minTouchSize } = useA11ySettings();
  const isDisabled = disabled || loading;
  const v = makeVariants(colors)[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { minHeight: Math.max(52, minTouchSize) },
        v.container,
        pressed && !isDisabled && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={v.label.color} size="small" />
      ) : (
        <View style={styles.row}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <AppText style={[styles.label, v.label]}>{label}</AppText>
        </View>
      )}
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
  icon: { flexShrink: 0 },
  label: { ...typography.button, flexShrink: 1, textAlign: 'center', letterSpacing: 0 },
  disabled: { opacity: 0.5 },
});

const makeVariants = (colors: ThemeColors): Record<Variant, { container: ViewStyle; label: { color: string } }> => ({
  primary: {
    container: { backgroundColor: colors.primary },
    label: { color: colors.primaryForeground },
  },
  secondary: {
    container: { backgroundColor: colors.cardElevated, borderWidth: 1, borderColor: colors.border },
    label: { color: colors.foreground },
  },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
    label: { color: colors.foreground },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    label: { color: colors.mutedForeground },
  },
});
