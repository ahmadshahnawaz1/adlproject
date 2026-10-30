import React from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import useBreathing from '../../hooks/useBreathing';
import { spacing } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeContext';

/**
 * BackButton — a minimal, borderless back chevron that GLOWS and breathes
 * exactly like the brand logo (same opacity rhythm). No circular border —
 * just a clean, generously-tappable arrow.
 */
export default function BackButton({ onPress }: { onPress?: () => void }) {
  const { colors } = useTheme();
  const { opacity } = useBreathing();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={16}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Animated.View style={{ opacity }}>
        <ChevronLeft size={28} color={colors.foreground} strokeWidth={2.25} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    marginLeft: -spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ scale: 0.92 }] },
});

