import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import useReduceMotion from './useReduceMotion';

/**
 * useBreathing — the original, beautiful glow. A pure opacity fade from dim to
 * full and back, with React Native's default gentle easing. No scale, no tricks.
 * Returns `opacity` (and a static `scale` of 1 for component compatibility).
 * Holds a steady full-opacity glow when Reduce Motion is on.
 */
export default function useBreathing(opts: {
  min?: number;
  max?: number;
  duration?: number;
} = {}) {
  const { min = 0.15, max = 1, duration = 1600 } = opts;
  const reduceMotion = useReduceMotion();

  const opacity = useRef(new Animated.Value(min)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(max);
      return;
    }
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: max, duration, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: min, duration, useNativeDriver: true }),
      ]),
    );
    breathe.start();
    return () => breathe.stop();
  }, [opacity, min, max, duration, reduceMotion]);

  return { opacity, scale: 1 as const };
}
