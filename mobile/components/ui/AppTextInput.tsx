import { forwardRef } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';
import useA11ySettings from '../../hooks/useA11ySettings';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/tokens';
import { scaleTextMetrics } from '../../theme/typeScale';

const AppTextInput = forwardRef<TextInput, TextInputProps>(function AppTextInput(
  { style, maxFontSizeMultiplier, ...props },
  ref,
) {
  const { textScale } = useTheme();
  const { textStyle, maxFontSizeMultiplier: cap } = useA11ySettings();
  const metrics = scaleTextMetrics({ ...typography.body, ...StyleSheet.flatten(style) }, textScale);

  return (
    <TextInput
      {...props}
      ref={ref}
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? cap}
      style={[typography.body, style, metrics, textStyle]}
    />
  );
});

export default AppTextInput;