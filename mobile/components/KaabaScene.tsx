/**
 * KaabaScene — the hero scene of the Ḥaram: a black cube crowned with its gold
 * band, sitting in a glowing court beneath a field of stars and two distant
 * minarets. Built from three parallax depth-planes (glow+stars far, ground+
 * minarets mid, the Kaʿbah near) so a tilt of the hand gives it real depth.
 * A soft halo breathes behind the House. Pure react-native-svg + Animated.
 */
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import { colors } from '../theme/tokens';
import ParallaxScene, { ParallaxLayer } from './ParallaxScene';
import type { Tilt } from './ParallaxScene';

const AnimatedG = Animated.createAnimatedComponent(G);

const STARS: { cx: number; cy: number; r: number; o: number }[] = [
  { cx: 12, cy: 14, r: 0.6, o: 0.5 },
  { cx: 26, cy: 8, r: 0.5, o: 0.35 },
  { cx: 40, cy: 16, r: 0.7, o: 0.6 },
  { cx: 62, cy: 10, r: 0.5, o: 0.4 },
  { cx: 78, cy: 18, r: 0.8, o: 0.7 },
  { cx: 88, cy: 9, r: 0.5, o: 0.4 },
  { cx: 18, cy: 30, r: 0.5, o: 0.3 },
  { cx: 84, cy: 34, r: 0.6, o: 0.45 },
  { cx: 8, cy: 44, r: 0.5, o: 0.3 },
  { cx: 94, cy: 48, r: 0.5, o: 0.3 },
];

function Minaret({ x }: { x: number }) {
  return (
    <G>
      <Rect x={x - 1} y={50} width={2} height={28} rx={0.8} fill={colors.cardElevated} stroke={colors.border} strokeWidth={0.4} />
      <Rect x={x - 1.8} y={47} width={3.6} height={3} rx={0.8} fill={colors.cardElevated} stroke={colors.border} strokeWidth={0.4} />
      <Path d={`M ${x} 43 l 1.4 3 h -2.8 z`} fill={colors.primary} opacity={0.5} />
    </G>
  );
}

export default function KaabaScene({ tilt, height = 210 }: { tilt: Tilt; height?: number }) {
  const halo = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    // SVG opacity is a JS-driven prop — must not use the native driver.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(halo, { toValue: 1, duration: 2200, useNativeDriver: false }),
        Animated.timing(halo, { toValue: 0.45, duration: 2200, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [halo]);

  return (
    <ParallaxScene height={height} style={styles.stage}>
      {/* far — stars + breathing halo */}
      <ParallaxLayer tilt={tilt} depth={0.18} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <AnimatedG opacity={halo}>
            <Circle cx={50} cy={58} r={30} fill={colors.primary} opacity={0.06} />
            <Circle cx={50} cy={58} r={20} fill={colors.primary} opacity={0.08} />
            <Circle cx={50} cy={58} r={11} fill={colors.primary} opacity={0.1} />
          </AnimatedG>
          {STARS.map((s, i) => (
            <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={colors.foreground} opacity={s.o} />
          ))}
        </Svg>
      </ParallaxLayer>

      {/* mid — ground + minarets */}
      <ParallaxLayer tilt={tilt} depth={0.5} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Line x1={6} y1={78} x2={94} y2={78} stroke={colors.border} strokeWidth={0.8} strokeLinecap="round" />
          <Minaret x={14} />
          <Minaret x={86} />
        </Svg>
      </ParallaxLayer>

      {/* near — the Kaʿbah */}
      <ParallaxLayer tilt={tilt} depth={1} maxShift={20} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          {/* court glow on the ground */}
          <Ellipse cx={50} cy={79} rx={26} ry={4} fill={colors.primary} opacity={0.12} />
          {/* right side face (depth) */}
          <Path d="M 62 40 L 68 44 L 68 76 L 62 78 Z" fill="#050506" stroke={colors.border} strokeWidth={0.5} />
          {/* top face */}
          <Path d="M 38 40 L 44 36 L 68 40 L 62 40 Z" fill={colors.cardElevated} stroke={colors.border} strokeWidth={0.5} />
          {/* front face */}
          <Rect x={38} y={40} width={24} height={38} rx={1} fill="#09090B" stroke={colors.border} strokeWidth={0.7} />
          {/* gold band (ḥizām) */}
          <Rect x={38} y={49} width={24} height={3.2} fill={colors.primary} opacity={0.92} />
          <Rect x={62} y={49.6} width={6} height={2.6} fill={colors.primary} opacity={0.6} />
          {/* the door */}
          <Rect x={47} y={56} width={5.6} height={22} rx={0.6} fill={colors.primary} opacity={0.16} stroke={colors.primary} strokeWidth={0.5} />
        </Svg>
      </ParallaxLayer>
    </ParallaxScene>
  );
}

const styles = StyleSheet.create({
  stage: { alignSelf: 'stretch', borderRadius: 0 },
});
