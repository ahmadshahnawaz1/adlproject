/**
 * useA11ySettings — the accessibility preferences that shape how controls and
 * text are rendered: heavier text, roomier touch targets, and the dynamic-type
 * multiplier from the theme. Components use this instead of reading the raw
 * settings so the rules stay in one place.
 */
import { useMemo } from 'react';
import type { TextStyle } from 'react-native';
import { useSettingsOptional } from '../contexts/SettingsContext';
import { useTheme } from '../theme/ThemeContext';

/** Apple's minimum comfortable target; the roomy variant clears it generously. */
const BASE_TOUCH = 44;
const ROOMY_TOUCH = 52;

export type A11ySettings = {
  boldText: boolean;
  largerTouchTargets: boolean;
  screenReaderHints: boolean;
  /** Minimum height/width for an interactive control. */
  minTouchSize: number;
  /** Extra tap area around small controls. */
  hitSlop: number;
  /** Text style overrides to spread onto a <Text>. */
  textStyle: TextStyle;
  /** Cap on the OS font-scale so layouts stay intact at extreme sizes. */
  maxFontSizeMultiplier: number;
  scaleFont: (size: number) => number;
};

export default function useA11ySettings(): A11ySettings {
  const { settings } = useSettingsOptional();
  const { scaleFont } = useTheme();
  const boldText = settings.appearance.boldText;
  const largerTouchTargets = settings.accessibility.largerTouchTargets;
  const screenReaderHints = settings.accessibility.screenReaderHints;

  return useMemo(
    () => ({
      boldText,
      largerTouchTargets,
      screenReaderHints,
      minTouchSize: largerTouchTargets ? ROOMY_TOUCH : BASE_TOUCH,
      hitSlop: largerTouchTargets ? 16 : 8,
      textStyle: boldText ? { fontWeight: '700' } : {},
      maxFontSizeMultiplier: 1.6,
      scaleFont,
    }),
    [boldText, largerTouchTargets, screenReaderHints, scaleFont],
  );
}
