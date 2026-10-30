/**
 * MinaScene — the tent-city of Minā at night: rows of white tents under the
 * hills, the pilgrim's resting place between the rites. Three parallax planes
 * (stars + hills far, far tents mid, near tents + path near).
 */
import { StyleSheet } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme/tokens';
import ParallaxScene, { ParallaxLayer } from './ParallaxScene';
import type { Tilt } from './ParallaxScene';

function Tent({ x, y, s = 1, dim = false }: { x: number; y: number; s?: number; dim?: boolean }) {
  const w = 6 * s;
  const h = 4.4 * s;
  return (
    <Path
      d={`M ${x - w} ${y} L ${x} ${y - h} L ${x + w} ${y} Z`}
      fill={dim ? colors.card : colors.cardElevated}
      stroke={colors.border}
      strokeWidth={0.5}
      opacity={dim ? 0.7 : 1}
    />
  );
}

const STARS = [
  { x: 14, y: 12 }, { x: 30, y: 8 }, { x: 50, y: 14 }, { x: 70, y: 9 }, { x: 86, y: 16 },
];

export default function MinaScene({ tilt, height = 210 }: { tilt: Tilt; height?: number }) {
  return (
    <ParallaxScene height={height} style={styles.stage}>
      <ParallaxLayer tilt={tilt} depth={0.18} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          {STARS.map((s, i) => (
            <Circle key={i} cx={s.x} cy={s.y} r={0.6} fill={colors.foreground} opacity={0.45} />
          ))}
          <Path d="M0 64 Q24 46 48 60 T100 56 V100 H0 Z" fill={colors.card} opacity={0.5} />
        </Svg>
      </ParallaxLayer>

      <ParallaxLayer tilt={tilt} depth={0.5} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          {[18, 34, 50, 66, 82].map((x, i) => (
            <Tent key={i} x={x} y={66} s={0.85} dim />
          ))}
        </Svg>
      </ParallaxLayer>

      <ParallaxLayer tilt={tilt} depth={1} maxShift={18} style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Rect x={4} y={80} width={92} height={0.8} fill={colors.border} opacity={0.6} />
          {[14, 30, 46, 62, 78, 92].map((x, i) => (
            <Tent key={i} x={x} y={80} s={1.05} />
          ))}
          {/* lantern glow */}
          <Circle cx={50} cy={74} r={3} fill={colors.primary} opacity={0.16} />
        </Svg>
      </ParallaxLayer>
    </ParallaxScene>
  );
}

const styles = StyleSheet.create({ stage: { alignSelf: 'stretch' } });
