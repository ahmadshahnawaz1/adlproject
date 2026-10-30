/**
 * ZakatNisabGauge — an animated arc that shows how the user's net wealth sits
 * against the niṣāb threshold. Below niṣāb it fills toward the line; once met,
 * it glows full in the accent colour. Drawn with react-native-svg and the
 * built-in Animated API so it runs everywhere, including Expo Go.
 */
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Geometry: a 270° arc on a 100×100 canvas, with the gap at the bottom.
const R = 40;
const CX = 50;
const CY = 50;
const SWEEP = 270;
const START_ANGLE = 135; // bottom-left, sweeping clockwise to bottom-right
const ARC_LENGTH = 2 * Math.PI * R * (SWEEP / 360);

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(): string {
  const start = polar(CX, CY, R, START_ANGLE);
  const end = polar(CX, CY, R, START_ANGLE + SWEEP);
  const largeArc = SWEEP > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function ZakatNisabGauge({
  ratio,
  meetsNisab,
  centerTop,
  centerMain,
  centerSub,
  size = 220,
}: {
  /** net wealth ÷ niṣāb (0..∞); the arc caps its fill at 1. */
  ratio: number;
  meetsNisab: boolean;
  centerTop?: string;
  centerMain: string;
  centerSub?: string;
  size?: number;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const fill = Math.min(1, Math.max(0, isFinite(ratio) ? ratio : 0));
  const progress = useRef(new Animated.Value(0)).current;
  const accent = meetsNisab ? colors.primary : colors.mutedForeground;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: fill,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [fill, progress]);

  const dashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [ARC_LENGTH, 0],
  });

  const path = arcPath();

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* track */}
        <Path
          d={path}
          fill="none"
          stroke={colors.cardElevated}
          strokeWidth={9}
          strokeLinecap="round"
        />
        {/* animated fill */}
        <AnimatedPath
          d={path}
          fill="none"
          stroke={accent}
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          strokeDashoffset={dashoffset}
        />
        {/* niṣāb marker dot at the top */}
        <Circle cx={CX} cy={CY - R} r={2.6} fill={meetsNisab ? colors.primary : colors.border} />
      </Svg>

      <View style={styles.center} pointerEvents="none">
        {centerTop ? <Text style={styles.top}>{centerTop}</Text> : null}
        <Text style={[styles.main, { color: meetsNisab ? colors.foreground : colors.mutedForeground }]}>
          {centerMain}
        </Text>
        {centerSub ? <Text style={styles.sub}>{centerSub}</Text> : null}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  top: {
    ...typography.label,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.subtleForeground,
    marginBottom: 2,
  },
  main: { ...typography.display, fontSize: 26, textAlign: 'center' },
  sub: { ...typography.caption, fontSize: 12, color: colors.subtleForeground, marginTop: 2, textAlign: 'center' },
});
