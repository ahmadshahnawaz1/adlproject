/**
 * AppText — a drop-in replacement for React Native's Text that honours the
 * accessibility settings and the active language's script: heavier weight when
 * Bold Text is on, a cap on the OS font-scale so large dynamic type never
 * shatters a layout, right-to-left text in Arabic and Urdu, and Nastaʿlīq with
 * the leading it needs in Urdu.
 */
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';
import useA11ySettings from '../../hooks/useA11ySettings';
import { useLocale } from '../../i18n/LocaleContext';
import { scriptFontFor, scriptLineHeight } from '../../lib/script';
import { useTheme } from '../../theme/ThemeContext';
import { scaleTextMetrics } from '../../theme/typeScale';

export default function AppText({ style, maxFontSizeMultiplier, ...rest }: TextProps) {
  const { textStyle, maxFontSizeMultiplier: cap } = useA11ySettings();
  const { code, isRTL } = useLocale();
  const { textScale } = useTheme();
  const flat = StyleSheet.flatten(style);
  const metrics = scaleTextMetrics(flat ?? {}, textScale);

  const scriptFont = flat?.fontFamily ? null : scriptFontFor(code);
  let scriptStyle: TextStyle | null = null;
  if (scriptFont) {
    const lineHeight = scriptLineHeight(code, metrics.fontSize);
    scriptStyle = {
      fontFamily: scriptFont,
      ...(lineHeight ? { lineHeight: Math.max(lineHeight, metrics.lineHeight ?? 0) } : null),
    };
  }

  return (
    <Text
      {...rest}
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? cap}
      style={[style, metrics, textStyle, isRTL ? { writingDirection: 'rtl' } : null, scriptStyle]}
    />
  );
}
