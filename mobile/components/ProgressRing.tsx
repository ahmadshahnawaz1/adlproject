/**
 * ProgressRing — a small, calm SVG ring that fills to a fraction. A gold arc
 * sweeps clockwise over a faint track; the centre carries a short label (and an
 * optional sub-label), or a check when complete. Purely presentational — the
 * parent owns the numbers.
 *
 * Driver rule: the arc is an SVG node, so its animation uses the JS driver
 * (useNativeDriver:false).
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Check } from 'lucide-react-native';
import { fontFamily } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ProgressRing({
  fraction,
  size = 48,
  stroke = 4,
  accent: accentProp,
  track: trackProp,
  label,
  sublabel,
  complete = false,
}: {
  fraction: number;
  size?: number;
  stroke?: number;
  accent?: string;
  track?: string;
  label?: string;
  sublabel?: string;
  complete?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const accent = accentProp ?? colors.primary;
  const track = trackProp ?? colors.cardElevated;
  const frac = Math.max(0, Math.min(1, fraction));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const center = size / 2;

  const prog = useRef(new Animated.Value(frac)).current;
  useEffect(() => {
    Animated.timing(prog, {
      toValue: frac,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [frac, prog]);
  const dashoffset = prog.interpolate({ inputRange: [0, 1], outputRange: [c, 0] });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={r}
          stroke={accent}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dashoffset}
          rotation={-90}
          originX={center}
          originY={center}
        />
      </Svg>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
        {complete ? (
          <Check size={Math.round(size * 0.42)} color={accent} strokeWidth={2.6} />
        ) : (
          <>
            {label !== undefined ? (
              <Text style={[styles.label, { fontSize: Math.max(11, Math.round(size * 0.3)) }]}>
                {label}
              </Text>
            ) : null}
            {sublabel !== undefined ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
          </>
        )}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily, fontWeight: '700', color: colors.foreground, letterSpacing: -0.3 },
  sublabel: { fontFamily, fontSize: 9, fontWeight: '600', color: colors.subtleForeground, marginTop: -1 },
});
