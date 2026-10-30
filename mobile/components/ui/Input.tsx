import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  type TextInput,
  TextInputProps,
  View,
} from 'react-native';
import Text from './AppText';
import AppTextInput from './AppTextInput';
import useA11ySettings from '../../hooks/useA11ySettings';
import { Eye, EyeOff } from 'lucide-react-native';
import { radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

type Props = TextInputProps & {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  isPassword?: boolean;
};

/**
 * Input — shadcn/ui-inspired field with a floating label, leading icon,
 * animated focus ring, error state, and built-in password reveal toggle.
 */
const Input = React.forwardRef<TextInput, Props>(function Input(
  {
    label,
    icon,
    error,
    isPassword = false,
    onFocus,
    onBlur,
    style,
    ...props
  },
  ref,
) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { minTouchSize } = useA11ySettings();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(isPassword);

  const handleFocus: NonNullable<TextInputProps['onFocus']> = (e) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur: NonNullable<TextInputProps['onBlur']> = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  const borderColor = error
    ? colors.destructive
    : focused
      ? colors.ring
      : colors.border;

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, { borderColor }, focused && styles.fieldFocused]}>
        {icon ? <View style={styles.leadingIcon}>{icon}</View> : null}
        <AppTextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={colors.subtleForeground}
          secureTextEntry={hidden}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor={colors.primary}
          accessibilityLabel={label}
          {...props}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            style={[styles.trailingIcon, { minWidth: minTouchSize, minHeight: minTouchSize }]}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            {hidden ? (
              <EyeOff size={18} color={colors.mutedForeground} />
            ) : (
              <Eye size={18} color={colors.mutedForeground} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text> : null}
    </View>
  );
});

export default Input;

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrapper: { width: '100%' },
  label: {
    ...typography.label,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.md,
    backgroundColor: colors.input,
    paddingHorizontal: spacing.md,
  },
  fieldFocused: {
    backgroundColor: colors.cardElevated,
  },
  leadingIcon: { marginRight: spacing.sm },
  trailingIcon: { alignItems: 'center', justifyContent: 'center', marginEnd: -spacing.sm },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    paddingVertical: spacing.md,
    color: colors.foreground,
    ...typography.body,
  },
  error: {
    ...typography.caption,
    color: colors.destructive,
    marginTop: spacing.xs + 2,
  },
});
