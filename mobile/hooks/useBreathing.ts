import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * useBreathing — the original, beautiful glow. A pure opacity fade from dim to
 * full and back, with React Native's default gentle easing. No scale, no tricks.
 * Returns `opacity` (and a static `scale` of 1 for component compatibility).
 */
export default function useBreathing(opts: {
  min?: number;
  max?: number;
  duration?: number;
} = {}) {
  const { min = 0.15, max = 1, duration = 1600 } = opts;

  const opacity = useRef(new Animated.Value(min)).current;

  useEffect(() => {
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: max, duration, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: min, duration, useNativeDriver: true }),
      ]),
    );
    breathe.start();
    return () => breathe.stop();
  }, [opacity, min, max, duration]);

  return { opacity, scale: 1 as const };
}
