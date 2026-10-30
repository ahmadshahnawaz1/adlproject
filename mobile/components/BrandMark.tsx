import React from 'react';
import { StyleSheet, View } from 'react-native';
import AdlLogo from './AdlLogo';
import Crescent from './Crescent';
import useBreathing from '../hooks/useBreathing';
import { spacing } from '../theme/tokens';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  /** Wordmark font size; crescent scales relative to it. */
  size?: number;
  /** 'row' = crescent beside wordmark; 'stack' = crescent above wordmark. */
  layout?: 'row' | 'stack';
};

/**
 * BrandMark — the عدل + crescent lockup. CARDINAL PRINCIPLE: it is ALWAYS
 * glowing, everywhere it appears. Centered by default. Never render a static
 * logo anywhere in the app — always use this component.
 */
export default function BrandMark({ size = 120, layout = 'stack' }: Props) {
  const { colors } = useTheme();
  const { opacity, scale } = useBreathing();
  const isRow = layout === 'row';
  // Crescent is sized to read as visually equal to the عدل glyph height in
  // Geeza Pro. Row keeps it compact; stack keeps it tight and aligned on top.
  // No rounding — keeps the crescent↔wordmark gap EXACTLY proportional at any
  // size, so the splash matches the auth headers pixel-for-pixel by ratio.
  const crescentSize = size * (isRow ? 0.5 : 0.58);
  // Minimal, intentional breathing room — never too much.
  const gap = isRow ? spacing.md : size * 0.08;

  return (
    <View style={[styles.container, isRow ? styles.row : styles.stack]}>
      <Crescent size={crescentSize} color={colors.primary} opacity={opacity} scale={scale} />
      <View style={isRow ? { width: gap } : { height: gap }} />
      <AdlLogo size={size} opacity={opacity} scale={scale} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  stack: { flexDirection: 'column' },
  row: { flexDirection: 'row' },
});
