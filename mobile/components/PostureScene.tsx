/**
 * PostureScene — the cinematic backdrop for each posture of the prayer.
 *
 * A miḥrāb niche frames the scene; a prayer mat lies in perspective; and upon
 * it stands a single, deliberately abstract silhouette — a rounded head and a
 * flowing robe — that takes the shape of the current posture: standing,
 * bowing, prostrating, sitting, or giving salām. The form is geometric rather
 * than anatomical, keeping the art tasteful, tiny, fully offline, and free of
 * realistic human depiction while reading instantly.
 *
 * Three parallax depth-planes (niche far, lamp mid, mat + figure near) give the
 * flat SVG real depth as the hand tilts — the same engine as the pilgrimage
 * scenes. A soft halo breathes behind the worshipper, and each posture fades
 * and settles in as it appears. Pure react-native-svg + Animated, so it runs
 * untouched in Expo Go.
 *
 * Animation driver note: values bound to SVG props (the halo's opacity) use the
 * JS driver (useNativeDriver:false); the figure's entrance, applied to a plain
 * RN <Animated.View>, uses the native driver.
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';
import type { PostureArt } from '../content/salah';
import { colors } from '../theme/tokens';
import ParallaxScene, { ParallaxLayer, useTilt } from './ParallaxScene';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** One abstract posture silhouette, in a 0–100 square with the mat near y=84. */
type Figure = {
  /** The main robe / torso, filled. */
  body: string;
  /** The head. */
  head: { cx: number; cy: number; r: number };
  /** Extra filled forms (e.g. folded legs when seated). */
  fills?: string[];
  /** Thin strokes on top (arms, folded hands, the pointing finger). */
  strokes?: string[];
};

const FIGURE: Record<PostureArt, Figure> = {
  // The opening takbīr — upright, hands raised toward the ears.
  takbir: {
    body: 'M42 84 L44 50 Q44 44 50 44 Q56 44 56 50 L58 84 Z',
    head: { cx: 50, cy: 36, r: 7 },
    strokes: ['M45 50 Q40 40 44 33', 'M55 50 Q60 40 56 33'],
  },
  // Standing in recitation — hands folded over the chest.
  standing: {
    body: 'M42 84 L44 50 Q44 44 50 44 Q56 44 56 50 L58 84 Z',
    head: { cx: 50, cy: 36, r: 7 },
    strokes: ['M44 58 Q50 54 56 58'],
  },
  // Rising erect after the bow — arms at the sides.
  rising: {
    body: 'M42 84 L44 50 Q44 44 50 44 Q56 44 56 50 L58 84 Z',
    head: { cx: 50, cy: 36, r: 7 },
    strokes: ['M44 52 L42 70', 'M56 52 L58 70'],
  },
  // Bowing — back level, head forward, hands reaching the knees.
  bowing: {
    body: 'M47 61 Q47 53 55 52 L71 53 Q75 54 73 58 Q71 61 64 61 Z',
    head: { cx: 79, cy: 54, r: 6 },
    fills: ['M44 84 L45 60 L53 60 L52 84 Z'],
    strokes: ['M71 58 L53 74'],
  },
  // Prostration — low to the ground, the forehead near the mat.
  prostration: {
    body: 'M33 84 Q34 66 47 63 Q60 61 68 80 L70 84 Z',
    head: { cx: 72, cy: 80, r: 5 },
    strokes: ['M60 82 h9'],
  },
  // Sitting for the tashahhud — folded legs, the index finger raised.
  sitting: {
    body: 'M44 77 L45 56 Q45 50 50 50 Q55 50 55 56 L56 77 Z',
    head: { cx: 50, cy: 42, r: 6.5 },
    fills: ['M38 84 Q36 78 41 76 L59 76 Q64 78 62 84 Z'],
    strokes: ['M45 66 L41 74', 'M55 66 L59 72', 'M59 72 L60 66'],
  },
  // The closing salām — upright, the face turned to the side.
  salam: {
    body: 'M42 84 L44 50 Q44 44 50 44 Q56 44 56 50 L58 84 Z',
    head: { cx: 56, cy: 36, r: 7 },
    strokes: ['M44 52 L42 70', 'M56 52 L58 70', 'M63 33 Q67 36 63 40'],
  },
};

export default function PostureScene({
  art,
  height = 210,
  tiltEnabled = true,
  accent = colors.primary,
}: {
  art: PostureArt;
  height?: number;
  tiltEnabled?: boolean;
  accent?: string;
}) {
  const tilt = useTilt(tiltEnabled);

  // Breathing halo behind the worshipper — SVG opacity, so JS-driven.
  const halo = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(halo, { toValue: 1, duration: 2400, useNativeDriver: false }),
        Animated.timing(halo, { toValue: 0.45, duration: 2400, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [halo]);

  // Each posture fades and rises into place — a plain View, so native-driven.
  const enter = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [art, enter]);

  const figure = FIGURE[art];
  const figureStyle = {
    opacity: enter,
    transform: [
      { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
      { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
    ],
  };

  return (
    <ParallaxScene height={height} style={styles.stage}>
      {/* far — the miḥrāb niche and a breathing halo */}
      <ParallaxLayer tilt={tilt} depth={0.18} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <AnimatedCircle cx={50} cy={52} r={30} fill={accent} opacity={halo.interpolate({ inputRange: [0.45, 1], outputRange: [0.05, 0.09] })} />
          <AnimatedCircle cx={50} cy={52} r={18} fill={accent} opacity={halo.interpolate({ inputRange: [0.45, 1], outputRange: [0.06, 0.11] })} />
          {/* the niche arch */}
          <Path d="M30 84 L30 40 Q30 20 50 14 Q70 20 70 40 L70 84" fill={colors.card} opacity={0.5} />
          <Path d="M30 84 L30 40 Q30 20 50 14 Q70 20 70 40 L70 84" fill="none" stroke={colors.border} strokeWidth={1} />
        </Svg>
      </ParallaxLayer>

      {/* mid — the hanging lamp of the niche */}
      <ParallaxLayer tilt={tilt} depth={0.45} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Line x1={50} y1={15} x2={50} y2={26} stroke={colors.border} strokeWidth={0.7} />
          <Circle cx={50} cy={29} r={3} fill={accent} opacity={0.18} stroke={accent} strokeWidth={0.8} />
          <Circle cx={50} cy={29} r={1} fill={accent} opacity={0.9} />
        </Svg>
      </ParallaxLayer>

      {/* near — the prayer mat and the posture silhouette */}
      <ParallaxLayer tilt={tilt} depth={1} maxShift={16} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          {/* mat, in perspective */}
          <Path d="M22 86 L78 86 L70 74 L30 74 Z" fill={colors.cardElevated} stroke={colors.border} strokeWidth={0.7} />
          <Path d="M46 74 L54 74 L53 80 Q50 78 47 80 Z" fill={accent} opacity={0.16} />
          <Line x1={30} y1={80} x2={70} y2={80} stroke={colors.border} strokeWidth={0.5} opacity={0.7} />
        </Svg>
        <Animated.View style={[StyleSheet.absoluteFill, figureStyle]}>
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
            {figure.fills?.map((d, i) => (
              <Path key={`f${i}`} d={d} fill={accent} opacity={0.18} stroke={accent} strokeWidth={1.8} strokeLinejoin="round" />
            ))}
            <Path d={figure.body} fill={accent} opacity={0.2} stroke={accent} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            <Circle cx={figure.head.cx} cy={figure.head.cy} r={figure.head.r} fill={accent} opacity={0.18} stroke={accent} strokeWidth={2} />
            {figure.strokes?.map((d, i) => (
              <Path key={`s${i}`} d={d} fill="none" stroke={accent} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
            ))}
          </Svg>
        </Animated.View>
      </ParallaxLayer>
    </ParallaxScene>
  );
}

const styles = StyleSheet.create({
  stage: { alignSelf: 'stretch', borderRadius: 0 },
});
