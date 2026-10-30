import React from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';

type Props = {
  size?: number;
  opacity?: Animated.AnimatedInterpolation<number> | number;
  scale?: Animated.AnimatedInterpolation<number> | number;
};

/**
 * AdlLogo — the ADL wordmark ("عدل") rendered in Geeza Pro,
 * gently breathing in and out. Calm, beautiful, hypnotic.
 */
export default function AdlLogo({ size = 120, opacity = 1, scale = 1 }: Props) {
  return (
    <Animated.Text
      allowFontScaling={false}
      style={[
        styles.logo,
        { fontSize: size, lineHeight: size * 1.18, opacity, transform: [{ scale }] },
      ]}
    >
      عدل
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  logo: {
    color: '#FFFFFF',
    fontWeight: '300',
    letterSpacing: 2,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Geeza Pro',
      default: undefined,
    }),
  },
});
