import React, { useState } from 'react';
import {
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  View,
} from 'react-native';
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
    ...props
  },
  ref,
) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(isPassword);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
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
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.subtleForeground}
          secureTextEntry={hidden}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor={colors.primary}
          {...props}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            style={styles.trailingIcon}
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
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
    height: 52,
    borderWidth: 1,
    borderRadius: radius.md,
    backgroundColor: colors.input,
    paddingHorizontal: spacing.md,
  },
  fieldFocused: {
    backgroundColor: colors.cardElevated,
  },
  leadingIcon: { marginRight: spacing.sm },
  trailingIcon: { paddingLeft: spacing.sm },
  input: {
    flex: 1,
    height: '100%',
    color: colors.foreground,
    ...typography.body,
  },
  error: {
    ...typography.caption,
    color: colors.destructive,
    marginTop: spacing.xs + 2,
  },
});
