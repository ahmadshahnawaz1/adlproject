/**
 * WuduStepArt — a stylized, animated line-art illustration for each step of
 * the ablution. Water rises and recedes inside the silhouette of the limb,
 * droplets fall, and a soft aura breathes.
 *
 * Animated with React Native's built-in Animated API (no native animation
 * libraries) so it runs everywhere, including Expo Go. The forms are
 * deliberately abstract rather than anatomical: it keeps the art tasteful,
 * tiny, fully offline, and free of realistic human depiction, while still
 * reading instantly alongside each step's name and instruction.
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import { colors } from '../theme/tokens';
import type { WuduStep } from '../content/wudu/wudu';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Each silhouette to be water-filled, plus optional detail strokes on top. */
type Art = { body: string; details?: string[]; rotate?: number };

const ART: Record<WuduStep['art'], Art> = {
  heart: {
    body: 'M50 80 C 18 58 22 26 44 26 C 50 26 50 34 50 38 C 50 34 50 26 56 26 C 78 26 82 58 50 80 Z',
  },
  bismillah: {
    body: 'M50 16 C 66 42 76 54 76 64 A 26 26 0 1 1 24 64 C 24 54 34 42 50 16 Z',
    details: ['M38 64 a12 12 0 0 0 6 11'],
  },
  hands: {
    body: 'M32 50 a18 18 0 0 1 36 0 v16 a18 18 0 0 1 -36 0 Z',
    details: ['M41 36 v9', 'M50 33 v12', 'M59 36 v9'],
  },
  mouth: {
    body: 'M22 50 Q 36 36 50 44 Q 64 36 78 50 Q 64 66 50 58 Q 36 66 22 50 Z',
    details: ['M26 50 Q 50 53 74 50'],
  },
  nose: {
    body: 'M50 24 q-4 0 -4 7 l-7 26 q-7 4 -7 11 q0 8 10 8 q6 0 8 -4 q2 4 8 4 q10 0 10 -8 q0 -7 -7 -11 l-7 -26 q0 -7 -4 -7 Z',
    details: ['M40 64 q4 4 10 4 q6 0 10 -4'],
  },
  face: {
    body: 'M50 20 C 71 20 78 39 78 55 C 78 73 65 84 50 84 C 35 84 22 73 22 55 C 22 39 29 20 50 20 Z',
    details: ['M37 52 h9', 'M54 52 h9', 'M41 67 q9 7 18 0'],
  },
  arm: {
    body: 'M38 22 a12 12 0 0 1 24 0 l3 44 a15 15 0 0 1 -30 0 Z',
    details: ['M44 30 h12', 'M43 44 h14'],
  },
  head: {
    body: 'M50 24 a22 22 0 0 1 0 44 a22 22 0 0 1 0 -44 Z',
    details: ['M30 40 Q 50 26 70 40'],
  },
  ears: {
    body: 'M54 22 a22 22 0 0 1 4 44 q-12 2 -12 -10 q0 -8 -8 -8 q-12 0 -12 -14 a22 22 0 0 1 28 -12 Z',
    details: ['M50 38 a10 10 0 0 1 2 18'],
  },
  foot: {
    body: 'M40 20 a8 8 0 0 1 16 0 l3 34 q10 4 10 16 q0 12 -16 12 q-22 0 -22 -14 q0 -10 6 -14 Z',
    details: ['M37 70 h26'],
  },
  dua: {
    body: 'M28 54 q-2 -16 10 -20 q6 -2 12 2 q6 -4 12 -2 q12 4 10 20 q-2 18 -22 26 q-20 -8 -22 -26 Z',
    details: ['M50 38 v26'],
  },
};

function Droplet({ cx, r, delay, accent }: { cx: number; r: number; delay: number; accent: string }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, {
          toValue: 1,
          duration: 1300,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t, delay]);

  const cy = t.interpolate({ inputRange: [0, 1], outputRange: [12, 46] });
  const opacity = t.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 0.81, 0] });

  return <AnimatedCircle cx={cx} cy={cy} r={r} fill={accent} opacity={opacity} />;
}

export default function WuduStepArt({
  art,
  size = 168,
  accent = colors.primary,
}: {
  art: WuduStep['art'];
  size?: number;
  accent?: string;
}) {
  const shape = ART[art];
  const clipId = `clip-${art}`;

  // Water level, 0 (empty) → 1 (full), breathing up and down forever.
  const level = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(level, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(level, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [level]);

  // waterTop = 90 - level * 78  →  full water reaches y = 12.
  const waterY = level.interpolate({ inputRange: [0, 1], outputRange: [90, 12] });
  const waterH = level.interpolate({ inputRange: [0, 1], outputRange: [10, 88] });
  const surfaceY = level.interpolate({ inputRange: [0, 1], outputRange: [88.5, 10.5] });
  const auraR = level.interpolate({ inputRange: [0, 1], outputRange: [44, 48] });
  const auraOpacity = level.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.13] });

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id={clipId}>
          <Path d={shape.body} />
        </ClipPath>
      </Defs>

      {/* breathing aura */}
      <AnimatedCircle cx={50} cy={52} r={auraR} opacity={auraOpacity} fill={accent} />

      {/* falling droplets above the limb */}
      <Droplet cx={38} r={2.4} delay={0} accent={accent} />
      <Droplet cx={50} r={2.8} delay={450} accent={accent} />
      <Droplet cx={62} r={2.2} delay={900} accent={accent} />

      {/* water inside the silhouette */}
      <G clipPath={`url(#${clipId})`}>
        <AnimatedRect x={0} width={100} y={waterY} height={waterH} fill={accent} opacity={0.22} />
        <AnimatedRect x={0} width={100} y={surfaceY} height={3} fill={accent} opacity={0.85} />
      </G>

      {/* the limb outline */}
      <Path
        d={shape.body}
        fill="none"
        stroke={accent}
        strokeWidth={2.2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* detail strokes (fingers, features, etc.) */}
      {shape.details?.map((d, i) => (
        <Path
          key={i}
          d={d}
          fill="none"
          stroke={accent}
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.7}
        />
      ))}
    </Svg>
  );
}
