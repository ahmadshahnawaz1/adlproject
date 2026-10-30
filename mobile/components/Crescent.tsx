import React from 'react';
import { Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Anim = Animated.AnimatedInterpolation<number> | Animated.Value | number;

type Props = {
  size?: number;
  color?: string;
  opacity?: Anim;
  scale?: Anim;
  /** Counter-clockwise tilt in degrees for the classic Islamic hilāl posture. */
  rotation?: number;
};

/**
 * Crescent — a bespoke, finely-tuned waxing crescent moon.
 * Drawn as the difference of two circles for a clean, elegant arc.
 * Opacity is applied on an Animated.View so it glows EXACTLY like the wordmark.
 * Rotated counter-clockwise so the cusps point up-right — the traditional
 * Islamic hilāl (as on the flags of Turkey, Pakistan, etc.).
 */
export default function Crescent({
  size = 64,
  color = '#FFFFFF',
  opacity = 1,
  scale = 1,
  rotation = -30,
}: Props) {
  return (
    <Animated.View
      style={{ opacity, transform: [{ rotate: `${rotation}deg` }, { scale }] }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Path
          d="M70 8
             a46 46 0 1 0 0 84
             a36 36 0 1 1 0 -84 Z"
          fill={color}
        />
      </Svg>
    </Animated.View>
  );
}
