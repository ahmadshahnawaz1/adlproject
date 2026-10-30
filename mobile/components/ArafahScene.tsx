/**
 * ArafahScene — the plain of ʿArafah on the ninth day: the wide standing-place
 * beneath the sun, with Jabal al-Raḥmah (the Mount of Mercy) rising at its
 * heart and hands of supplication raised. The sun pulses softly. Three
 * parallax planes (sun + sky far, the mount mid, the plain + duʿāʾ hands near).
 */
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { colors } from '../theme/tokens';
import ParallaxScene, { ParallaxLayer } from './ParallaxScene';
import type { Tilt } from './ParallaxScene';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function Hands({ x, y }: { x: number; y: number }) {
  return (
    <Path
      d={`M ${x - 2.6} ${y} q -1 -5 0.6 -7 M ${x + 2.6} ${y} q 1 -5 -0.6 -7`}
      stroke={colors.mutedForeground}
      strokeWidth={1}
      strokeLinecap="round"
      fill="none"
    />
  );
}

export default function ArafahScene({ tilt, height = 210 }: { tilt: Tilt; height?: number }) {
  const sun = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sun, { toValue: 1, duration: 2600, useNativeDriver: false }),
        Animated.timing(sun, { toValue: 0.5, duration: 2600, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [sun]);

  return (
    <ParallaxScene height={height} style={styles.stage}>
      <ParallaxLayer tilt={tilt} depth={0.18} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <AnimatedCircle cx={72} cy={26} r={20} fill={colors.primary} opacity={sun.interpolate({ inputRange: [0.5, 1], outputRange: [0.05, 0.1] })} />
          <Circle cx={72} cy={26} r={9} fill={colors.primary} opacity={0.18} />
          <Circle cx={72} cy={26} r={5} fill={colors.primary} opacity={0.5} />
        </Svg>
      </ParallaxLayer>

      <ParallaxLayer tilt={tilt} depth={0.5} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          {/* Jabal al-Raḥmah */}
          <Path d="M30 78 L48 40 L66 78 Z" fill={colors.cardElevated} stroke={colors.border} strokeWidth={0.6} />
          {/* the pillar atop the mount */}
          <Rect x={47} y={32} width={2} height={9} rx={0.6} fill={colors.card} stroke={colors.border} strokeWidth={0.4} />
        </Svg>
      </ParallaxLayer>

      <ParallaxLayer tilt={tilt} depth={1} maxShift={16} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Line x1={4} y1={80} x2={96} y2={80} stroke={colors.border} strokeWidth={0.9} strokeLinecap="round" />
          <Hands x={18} y={80} />
          <Hands x={30} y={80} />
          <Hands x={80} y={80} />
          <Hands x={90} y={80} />
        </Svg>
      </ParallaxLayer>
    </ParallaxScene>
  );
}

const styles = StyleSheet.create({ stage: { alignSelf: 'stretch' } });
