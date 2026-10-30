/**
 * AmbientScenes — the quieter backdrops of the journey, each a small layered
 * parallax vignette: the mīqāt gateway, the Maqām Ibrāhīm, the well of Zamzam,
 * the shaving/shortening (ḥalq), the night of Muzdalifah, and the farewell
 * ṭawāf. Kept together because each is a few SVG strokes; the busier scenes
 * (Kaʿbah, Minā, ʿArafah, maps, counters) live in their own files.
 */
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import { colors } from '../theme/tokens';
import ParallaxScene, { ParallaxLayer } from './ParallaxScene';
import type { Tilt } from './ParallaxScene';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function Stage({ children, height }: { children: React.ReactNode; height: number }) {
  return (
    <ParallaxScene height={height} style={styles.stage}>
      {children}
    </ParallaxScene>
  );
}

function usePulse(from = 0.4, to = 1, duration = 2200) {
  const v = useRef(new Animated.Value(from)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: to, duration, useNativeDriver: false }),
        Animated.timing(v, { toValue: from, duration, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, from, to, duration]);
  return v;
}

/* ----------------------------- mīqāt ----------------------------- */
export function MiqatScene({ tilt, height = 210 }: { tilt: Tilt; height?: number }) {
  return (
    <Stage height={height}>
      <ParallaxLayer tilt={tilt} depth={0.2} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Path d="M0 70 Q30 56 60 68 T100 64 V100 H0 Z" fill={colors.card} opacity={0.6} />
          <Circle cx={20} cy={20} r={0.6} fill={colors.foreground} opacity={0.4} />
          <Circle cx={80} cy={16} r={0.6} fill={colors.foreground} opacity={0.4} />
        </Svg>
      </ParallaxLayer>
      <ParallaxLayer tilt={tilt} depth={1} maxShift={18} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          {/* a gateway arch — crossing the boundary into iḥrām */}
          <Line x1={32} y1={80} x2={32} y2={40} stroke={colors.border} strokeWidth={1.4} />
          <Line x1={68} y1={80} x2={68} y2={40} stroke={colors.border} strokeWidth={1.4} />
          <Path d="M30 40 Q50 22 70 40" stroke={colors.primary} strokeWidth={1.6} fill="none" opacity={0.85} />
          <Line x1={4} y1={80} x2={96} y2={80} stroke={colors.border} strokeWidth={0.9} strokeLinecap="round" />
          {/* two pilgrims in white, passing through */}
          <Rect x={46} y={64} width={3.4} height={14} rx={1.4} fill={colors.cardElevated} stroke={colors.border} strokeWidth={0.5} />
          <Rect x={51} y={66} width={3} height={12} rx={1.2} fill={colors.cardElevated} stroke={colors.border} strokeWidth={0.5} />
        </Svg>
      </ParallaxLayer>
    </Stage>
  );
}

/* ----------------------------- maqām ----------------------------- */
export function MaqamScene({ tilt, height = 210 }: { tilt: Tilt; height?: number }) {
  const glow = usePulse(0.4, 1, 2400);
  return (
    <Stage height={height}>
      <ParallaxLayer tilt={tilt} depth={0.2} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <AnimatedCircle cx={50} cy={52} r={24} fill={colors.primary} opacity={glow.interpolate({ inputRange: [0.4, 1], outputRange: [0.04, 0.09] })} />
        </Svg>
      </ParallaxLayer>
      <ParallaxLayer tilt={tilt} depth={1} maxShift={16} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          {/* the golden domed enclosure of Maqām Ibrāhīm */}
          <Rect x={40} y={50} width={20} height={26} rx={1} fill="#09090B" stroke={colors.border} strokeWidth={0.7} />
          <Path d="M40 50 Q50 36 60 50 Z" fill={colors.primary} opacity={0.55} />
          <Line x1={50} y1={34} x2={50} y2={30} stroke={colors.primary} strokeWidth={1} />
          <Circle cx={50} cy={29} r={1.2} fill={colors.primary} />
          {/* lattice */}
          <Line x1={45} y1={52} x2={45} y2={76} stroke={colors.border} strokeWidth={0.5} />
          <Line x1={50} y1={52} x2={50} y2={76} stroke={colors.border} strokeWidth={0.5} />
          <Line x1={55} y1={52} x2={55} y2={76} stroke={colors.border} strokeWidth={0.5} />
          <Line x1={4} y1={80} x2={96} y2={80} stroke={colors.border} strokeWidth={0.9} strokeLinecap="round" />
        </Svg>
      </ParallaxLayer>
    </Stage>
  );
}

/* ----------------------------- zamzam ----------------------------- */
export function ZamzamScene({ tilt, height = 210 }: { tilt: Tilt; height?: number }) {
  const ripple = usePulse(0, 1, 2000);
  return (
    <Stage height={height}>
      <ParallaxLayer tilt={tilt} depth={0.25} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <AnimatedCircle cx={50} cy={60} r={ripple.interpolate({ inputRange: [0, 1], outputRange: [6, 26] })} stroke={colors.primary} strokeWidth={0.8} fill="none" opacity={ripple.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] })} />
        </Svg>
      </ParallaxLayer>
      <ParallaxLayer tilt={tilt} depth={1} maxShift={14} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          {/* a vessel of water */}
          <Path d="M40 44 L60 44 L57 70 Q50 74 43 70 Z" fill="#09090B" stroke={colors.border} strokeWidth={0.7} />
          <Path d="M42 58 Q50 62 58 58 L57 70 Q50 74 43 70 Z" fill={colors.primary} opacity={0.22} />
          <Ellipse cx={50} cy={44} rx={10} ry={2} fill={colors.primary} opacity={0.3} />
          {/* a drop */}
          <Circle cx={50} cy={36} r={1.4} fill={colors.primary} opacity={0.7} />
        </Svg>
      </ParallaxLayer>
    </Stage>
  );
}

/* ----------------------------- ḥalq ----------------------------- */
export function HalqScene({ tilt, height = 210 }: { tilt: Tilt; height?: number }) {
  return (
    <Stage height={height}>
      <ParallaxLayer tilt={tilt} depth={1} maxShift={14} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          {/* a head, freshly shaven, with a hint of scissors */}
          <Circle cx={50} cy={50} r={14} fill={colors.cardElevated} stroke={colors.border} strokeWidth={0.7} />
          <Path d="M40 46 Q50 38 60 46" stroke={colors.primary} strokeWidth={1} fill="none" opacity={0.6} />
          {/* scissors */}
          <Line x1={66} y1={40} x2={78} y2={50} stroke={colors.mutedForeground} strokeWidth={1.2} strokeLinecap="round" />
          <Line x1={66} y1={50} x2={78} y2={40} stroke={colors.mutedForeground} strokeWidth={1.2} strokeLinecap="round" />
          <Circle cx={66} cy={40} r={1.6} fill="none" stroke={colors.mutedForeground} strokeWidth={1} />
          <Circle cx={66} cy={50} r={1.6} fill="none" stroke={colors.mutedForeground} strokeWidth={1} />
        </Svg>
      </ParallaxLayer>
    </Stage>
  );
}

/* --------------------------- muzdalifah --------------------------- */
export function MuzdalifahScene({ tilt, height = 210 }: { tilt: Tilt; height?: number }) {
  const moon = usePulse(0.6, 1, 3000);
  return (
    <Stage height={height}>
      <ParallaxLayer tilt={tilt} depth={0.18} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          {[14, 30, 50, 70, 86, 60, 24].map((x, i) => (
            <Circle key={i} cx={x} cy={[12, 8, 16, 9, 14, 24, 30][i]} r={0.6} fill={colors.foreground} opacity={0.45} />
          ))}
          <AnimatedCircle cx={76} cy={22} r={6} fill={colors.foreground} opacity={moon} />
          <Circle cx={73} cy={20} r={5.4} fill={colors.background} />
        </Svg>
      </ParallaxLayer>
      <ParallaxLayer tilt={tilt} depth={1} maxShift={14} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Line x1={4} y1={80} x2={96} y2={80} stroke={colors.border} strokeWidth={0.9} strokeLinecap="round" />
          {/* gathered pebbles */}
          {[40, 46, 52, 58, 43, 55].map((x, i) => (
            <Circle key={i} cx={x} cy={[78, 77, 78, 77, 75, 75][i]} r={1.2} fill={colors.mutedForeground} opacity={0.8} />
          ))}
          {/* resting pilgrims */}
          <Ellipse cx={24} cy={78} rx={6} ry={2} fill={colors.cardElevated} stroke={colors.border} strokeWidth={0.5} />
          <Ellipse cx={78} cy={78} rx={6} ry={2} fill={colors.cardElevated} stroke={colors.border} strokeWidth={0.5} />
        </Svg>
      </ParallaxLayer>
    </Stage>
  );
}

/* ---------------------------- farewell ---------------------------- */
export function FarewellScene({ tilt, height = 210 }: { tilt: Tilt; height?: number }) {
  const glow = usePulse(0.4, 1, 2600);
  return (
    <Stage height={height}>
      <ParallaxLayer tilt={tilt} depth={0.2} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <AnimatedCircle cx={50} cy={54} r={26} fill={colors.primary} opacity={glow.interpolate({ inputRange: [0.4, 1], outputRange: [0.05, 0.1] })} />
        </Svg>
      </ParallaxLayer>
      <ParallaxLayer tilt={tilt} depth={1} maxShift={16} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          {/* the Kaʿbah, with a single figure turning back for a last look */}
          <Rect x={42} y={44} width={16} height={20} rx={0.8} fill="#09090B" stroke={colors.border} strokeWidth={0.7} />
          <Rect x={42} y={49} width={16} height={2.2} fill={colors.primary} opacity={0.9} />
          <Line x1={4} y1={80} x2={96} y2={80} stroke={colors.border} strokeWidth={0.9} strokeLinecap="round" />
          <Rect x={74} y={66} width={3.2} height={13} rx={1.4} fill={colors.cardElevated} stroke={colors.border} strokeWidth={0.5} />
        </Svg>
      </ParallaxLayer>
    </Stage>
  );
}

const styles = StyleSheet.create({ stage: { alignSelf: 'stretch' } });
