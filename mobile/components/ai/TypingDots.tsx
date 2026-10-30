/**
 * TypingDots — the three-dot "thinking" indicator shown while ADL AI streams.
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import useReduceMotion from '../../hooks/useReduceMotion';

export default function TypingDots() {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const dots = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current];

  useEffect(() => {
    if (reduceMotion) {
      dots.forEach((d) => d.setValue(0.6));
      return;
    }
    const anims = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(d, { toValue: 1, duration: 380, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.3, duration: 380, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ),
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  return (
    <View style={styles.row}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={[styles.dot, { backgroundColor: colors.mutedForeground, opacity: d }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5, paddingVertical: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
