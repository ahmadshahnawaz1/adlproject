/**
 * ParallaxScene — the cinematic "4D" engine of the pilgrimage hub.
 *
 * It reads the phone's orientation through expo-sensors' DeviceMotion and turns
 * the gentle tilt of the hand into depth: layers placed at different "depths"
 * shift by different amounts, so a flat SVG scene gains a living, three-
 * dimensional parallax. No GL, no three.js, no native modules beyond the
 * already-installed sensors — so it runs untouched in Expo Go.
 *
 * Exports:
 *  - useTilt(enabled)   the smoothed, normalised tilt (−1..1) on two axes;
 *  - <ParallaxLayer>     positions a child and shifts it by its depth;
 *  - <ParallaxScene>     a clipped, relative stage to stack layers in.
 *
 * Respects the user's tilt-parallax preference (and any device without a
 * motion sensor) by falling back to perfectly still layers.
 */
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { DeviceMotion } from 'expo-sensors';

/** A smoothed, normalised tilt on two axes, each roughly in [−1, 1]. */
export type Tilt = {
  x: Animated.Value;
  y: Animated.Value;
  available: boolean;
};

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/**
 * Subscribe to the device's tilt. Returns two Animated values (x = left/right,
 * y = front/back), low-pass-smoothed and normalised to about [−1, 1]. When
 * disabled or unavailable, the values rest at 0 (still scene).
 */
export function useTilt(enabled = true): Tilt {
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;
  const sx = useRef(0);
  const sy = useRef(0);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (!enabled) {
      x.setValue(0);
      y.setValue(0);
      setAvailable(false);
      return;
    }
    let cancelled = false;
    let sub: { remove: () => void } | undefined;

    (async () => {
      const ok = await DeviceMotion.isAvailableAsync().catch(() => false);
      if (cancelled) return;
      if (!ok) {
        setAvailable(false);
        return;
      }
      setAvailable(true);
      DeviceMotion.setUpdateInterval(60);
      sub = DeviceMotion.addListener((data) => {
        const r = data?.rotation;
        if (!r) return;
        // gamma → left/right tilt, beta → front/back tilt (radians).
        const gx = clamp(r.gamma ?? 0, -0.6, 0.6) / 0.6;
        const gy = clamp(r.beta ?? 0, -0.6, 0.6) / 0.6;
        // Low-pass smoothing for a calm, premium drift.
        sx.current += (gx - sx.current) * 0.14;
        sy.current += (gy - sy.current) * 0.14;
        x.setValue(sx.current);
        y.setValue(sy.current);
      });
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [enabled, x, y]);

  return { x, y, available };
}

/**
 * A single depth plane. `depth` 0 = far (barely moves), 1 = near (moves most).
 * `maxShift` is the travel in points at depth 1 and full tilt.
 */
export function ParallaxLayer({
  tilt,
  depth = 1,
  maxShift = 16,
  style,
  pointerEvents = 'none',
  children,
}: {
  tilt: Tilt;
  depth?: number;
  maxShift?: number;
  style?: StyleProp<ViewStyle>;
  pointerEvents?: 'none' | 'auto' | 'box-none';
  children?: React.ReactNode;
}) {
  const shift = maxShift * depth;
  const translateX = tilt.x.interpolate({
    inputRange: [-1, 1],
    outputRange: [shift, -shift],
  });
  const translateY = tilt.y.interpolate({
    inputRange: [-1, 1],
    outputRange: [shift, -shift],
  });
  return (
    <Animated.View
      pointerEvents={pointerEvents}
      style={[style, { transform: [{ translateX }, { translateY }] }]}
    >
      {children}
    </Animated.View>
  );
}

/** A clipped, relative stage to stack ParallaxLayers within. */
export default function ParallaxScene({
  height,
  style,
  children,
}: {
  height?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  return <View style={[styles.scene, height != null ? { height } : null, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  scene: {
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
