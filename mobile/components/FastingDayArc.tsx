/**
 * FastingDayArc — the hero of the hub. A celestial dome traces the sun's
 * journey from Fajr to Maghrib; the fill advances with the fast, a sun rides
 * the arc by day and a crescent rests in the dome before dawn and after sunset.
 * The live countdown to the next moment sits at its heart. Drawn with
 * react-native-svg and the built-in Animated API, so it runs in Expo Go.
 */
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import type { FastPhase } from '../lib/fasting';
import { typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Geometry on a 100×60 canvas: a top semicircle, horizon along the bottom.
const CX = 50;
const CY = 55;
const R = 40;
const ARC_LENGTH = Math.PI * R; // length of a semicircle
const DOME = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

/** Point on the dome for t in [0,1] — t=0 at Fajr (left), t=1 at Maghrib. */
function sunAt(t: number): { x: number; y: number } {
  const angle = Math.PI - Math.min(1, Math.max(0, t)) * Math.PI; // π → 0
  return { x: CX + R * Math.cos(angle), y: CY - R * Math.sin(angle) };
}

export default function FastingDayArc({
  phase,
  progress,
  countdownLabel,
  countdownText,
  fajrText,
  maghribText,
  durationText,
  size = 300,
}: {
  phase: FastPhase;
  /** 0..1 through the fast (Fajr → Maghrib). */
  progress: number;
  countdownLabel: string;
  countdownText: string;
  fajrText: string;
  maghribText: string;
  durationText?: string;
  size?: number;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const fill = Math.min(1, Math.max(0, isFinite(progress) ? progress : 0));
  const anim = useRef(new Animated.Value(0)).current;
  const isDay = phase === 'fasting';

  useEffect(() => {
    Animated.timing(anim, { toValue: fill, duration: 600, useNativeDriver: false }).start();
  }, [fill, anim]);

  const dashoffset = anim.interpolate({ inputRange: [0, 1], outputRange: [ARC_LENGTH, 0] });
  const sun = sunAt(fill);
  const height = size * 0.66;

  return (
    <View style={[styles.wrap, { width: size, height }]}>
      <Svg width={size} height={height} viewBox="0 0 100 60">
        {/* sky dome */}
        <Path d={`${DOME} Z`} fill={colors.cardElevated} />
        {/* horizon */}
        <Path d={`M 6 ${CY} L 94 ${CY}`} stroke={colors.border} strokeWidth={1} strokeLinecap="round" />
        {/* track */}
        <Path d={DOME} fill="none" stroke={colors.border} strokeWidth={3} strokeLinecap="round" />
        {/* progress */}
        <AnimatedPath
          d={DOME}
          fill="none"
          stroke={colors.primary}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          strokeDashoffset={dashoffset}
        />

        {isDay ? (
          <>
            {/* sun + glow */}
            <Circle cx={sun.x} cy={sun.y} r={7} fill={colors.primary} opacity={0.18} />
            <Circle cx={sun.x} cy={sun.y} r={3.6} fill={colors.primary} />
          </>
        ) : (
          <>
            {/* crescent resting in the dome */}
            <Circle cx={CX} cy={20} r={6} fill="#E5E7EB" />
            <Circle cx={CX + 2.6} cy={18.6} r={5} fill={colors.cardElevated} />
          </>
        )}
      </Svg>

      {/* live countdown at the heart of the dome */}
      <View style={[styles.center, { paddingTop: height * 0.2 }]} pointerEvents="none">
        <Text style={styles.label}>{countdownLabel}</Text>
        <Text style={styles.countdown}>{countdownText}</Text>
        {durationText ? <Text style={styles.duration}>{durationText} fast</Text> : null}
      </View>

      {/* end labels under the horizon */}
      <View style={styles.ends} pointerEvents="none">
        <View style={styles.end}>
          <Text style={styles.endTime}>{fajrText}</Text>
          <Text style={styles.endName}>Fajr</Text>
        </View>
        <View style={[styles.end, styles.endRight]}>
          <Text style={styles.endTime}>{maghribText}</Text>
          <Text style={styles.endName}>Maghrib</Text>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: { alignSelf: 'center', justifyContent: 'flex-start' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  label: {
    ...typography.label,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.subtleForeground,
    marginBottom: 2,
  },
  countdown: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.foreground,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  duration: { ...typography.caption, fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  ends: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between' },
  end: { alignItems: 'flex-start' },
  endRight: { alignItems: 'flex-end' },
  endTime: { ...typography.caption, fontSize: 13, fontWeight: '700', color: colors.foreground },
  endName: { ...typography.caption, fontSize: 11, color: colors.subtleForeground },
});
