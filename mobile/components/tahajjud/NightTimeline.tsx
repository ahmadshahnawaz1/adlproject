/**
 * NightTimeline — the night as a glowing arc. The dome sweeps from Maghrib on
 * the left to Fajr on the right; the last third (the hour of the divine descent)
 * is drawn in breathing gold, the Islamic midnight marks the crown, and a small
 * moon rides the arc at the present moment. Purely presentational over the
 * NightWindow the engine computes.
 *
 * Driver rule: the gold band is an SVG node, so its glow animates on the JS
 * driver (useNativeDriver:false).
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import type { NightWindow } from '../../lib/nightPrayer';
import { colors, fontFamily, spacing, typography } from '../../theme/tokens';

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

const VB_W = 300;
const VB_H = 168;
const CX = VB_W / 2;
const CY = 150;
const R = 132;
const N = 64; // points sampled along the arc

/** A point on the dome at progress p∈[0,1] (Maghrib → Fajr). */
function arcPoint(p: number): { x: number; y: number } {
  const theta = Math.PI * (1 - p); // π at Maghrib (left) → 0 at Fajr (right)
  return { x: CX + R * Math.cos(theta), y: CY - R * Math.sin(theta) };
}

function pointsBetween(from: number, to: number, steps: number): string {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const p = from + ((to - from) * i) / steps;
    const { x, y } = arcPoint(p);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

// A few fixed stars scattered under the dome.
const STARS = [
  { x: 70, y: 70, r: 1.4 },
  { x: 120, y: 48, r: 1.1 },
  { x: 186, y: 52, r: 1.5 },
  { x: 232, y: 74, r: 1.2 },
  { x: 150, y: 38, r: 1.3 },
];

export default function NightTimeline({
  window,
  now,
  formatTime,
}: {
  window: NightWindow;
  now: Date;
  /** Format a moment in the location's wall-clock zone. */
  formatTime: (date: Date) => string;
}) {
  const glow = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0.45,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);

  const span = window.fajr.getTime() - window.maghrib.getTime();
  const rawP = span > 0 ? (now.getTime() - window.maghrib.getTime()) / span : -1;
  const withinNight = rawP >= 0 && rawP <= 1;
  const moon = withinNight ? arcPoint(rawP) : null;
  const crown = arcPoint(0.5); // Islamic midnight, top of the dome

  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={VB_H} viewBox={`0 0 ${VB_W} ${VB_H}`}>
        {STARS.map((s, i) => (
          <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill={`${colors.foreground}55`} />
        ))}

        {/* The full night arc, faint. */}
        <Polyline
          points={pointsBetween(0, 1, N)}
          fill="none"
          stroke={colors.border}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* The last third, breathing gold. */}
        <AnimatedPolyline
          points={pointsBetween(2 / 3, 1, Math.round(N / 3))}
          fill="none"
          stroke={colors.primary}
          strokeWidth={5}
          strokeLinecap="round"
          opacity={glow}
        />

        {/* Islamic midnight tick at the crown. */}
        <Line
          x1={crown.x}
          y1={crown.y - 9}
          x2={crown.x}
          y2={crown.y + 3}
          stroke={colors.mutedForeground}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Endpoint dots. */}
        <Circle cx={arcPoint(0).x} cy={arcPoint(0).y} r={4.5} fill={colors.mutedForeground} />
        <Circle cx={arcPoint(1).x} cy={arcPoint(1).y} r={4.5} fill={colors.primary} />

        {/* The moon at the present moment. */}
        {moon ? (
          <>
            <Circle cx={moon.x} cy={moon.y} r={11} fill={`${colors.primary}33`} />
            <Circle cx={moon.x} cy={moon.y} r={6} fill={colors.primary} />
          </>
        ) : null}
      </Svg>

      <View style={styles.labels}>
        <View style={styles.labelCol}>
          <Text style={styles.labelTime}>{formatTime(window.maghrib)}</Text>
          <Text style={styles.labelName}>Maghrib</Text>
        </View>
        <View style={[styles.labelCol, styles.labelCenter]}>
          <Text style={styles.labelTime}>{formatTime(window.islamicMidnight)}</Text>
          <Text style={styles.labelName}>Midnight</Text>
        </View>
        <View style={[styles.labelCol, styles.labelRight]}>
          <Text style={styles.labelTime}>{formatTime(window.fajr)}</Text>
          <Text style={styles.labelName}>Fajr</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  labelCol: { alignItems: 'flex-start', flex: 1 },
  labelCenter: { alignItems: 'center' },
  labelRight: { alignItems: 'flex-end' },
  labelTime: {
    ...typography.label,
    fontFamily,
    color: colors.foreground,
    fontWeight: '700',
  },
  labelName: {
    ...typography.caption,
    fontFamily,
    fontSize: 11,
    color: colors.subtleForeground,
    marginTop: 1,
  },
});
