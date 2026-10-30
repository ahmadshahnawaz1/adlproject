/**
 * TawafRing — the circling of the House made tactile. A pilgrim-light orbits
 * the Kaʿbah anti-clockwise (the House on the left, as the Sunnah), seven tick
 * stones mark the circuits, and a gold arc fills as each ṭawāf is counted. Tap
 * the ring to register a completed circuit; the parent wires the count, the
 * clamp and the haptic.
 *
 * Presentational only: it renders `count` of `total` and calls `onTap`.
 */
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { colors, fontFamily, spacing, typography } from '../theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const R = 38;
const C = 2 * Math.PI * R;

export default function TawafRing({
  count,
  total = 7,
  onTap,
  size = 248,
  caption,
}: {
  count: number;
  total?: number;
  onTap?: () => void;
  size?: number;
  caption?: string;
}) {
  const complete = count >= total;
  const frac = Math.min(1, total > 0 ? count / total : 0);

  // Decorative continuous orbit (anti-clockwise).
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 7000, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });

  // Progress arc.
  const prog = useRef(new Animated.Value(frac)).current;
  useEffect(() => {
    Animated.timing(prog, { toValue: frac, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [frac, prog]);
  const dashoffset = prog.interpolate({ inputRange: [0, 1], outputRange: [C, 0] });

  const ticks = useMemo(() => {
    return Array.from({ length: total }, (_, i) => {
      const ang = ((-90 + (i * 360) / total) * Math.PI) / 180;
      return { x: 50 + R * Math.cos(ang), y: 50 + R * Math.sin(ang), done: i < count };
    });
  }, [total, count]);

  const orbitTop = size * (0.5 - R / 100) - 6;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onTap}
        style={({ pressed }) => [{ width: size, height: size }, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`Ṭawāf, ${count} of ${total} circuits. Tap to count one.`}
      >
        <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
          {/* halo */}
          <Circle cx={50} cy={50} r={46} fill={colors.primary} opacity={0.04} />
          {/* orbit track */}
          <Circle cx={50} cy={50} r={R} stroke={colors.border} strokeWidth={1} fill="none" strokeDasharray="1.2 3.4" />
          {/* progress arc (starts at top) */}
          <AnimatedCircle
            cx={50}
            cy={50}
            r={R}
            stroke={colors.primary}
            strokeWidth={2.6}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={dashoffset}
            rotation={-90}
            originX={50}
            originY={50}
          />
          {/* circuit tick stones */}
          {ticks.map((t, i) => (
            <Circle
              key={i}
              cx={t.x}
              cy={t.y}
              r={t.done ? 2.6 : 2}
              fill={t.done ? colors.primary : colors.cardElevated}
              stroke={t.done ? colors.primary : colors.border}
              strokeWidth={0.8}
            />
          ))}
          {/* the Kaʿbah at the centre */}
          <Rect x={42} y={41} width={16} height={20} rx={0.8} fill="#09090B" stroke={colors.border} strokeWidth={0.8} />
          <Rect x={42} y={46} width={16} height={2.2} fill={colors.primary} opacity={0.9} />
          <Rect x={48.4} y={50} width={3.2} height={11} rx={0.4} fill={colors.primary} opacity={0.18} stroke={colors.primary} strokeWidth={0.4} />
        </Svg>

        {/* orbiting pilgrim-light */}
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.orbitLayer, { transform: [{ rotate }] }]}>
          <View style={[styles.markerWrap, { top: orbitTop }]}>
            <View style={styles.markerHalo} />
            <View style={styles.markerDot} />
          </View>
        </Animated.View>

        {/* centre readout */}
        <View pointerEvents="none" style={styles.center}>
          <Text style={styles.count}>{count}</Text>
          <Text style={styles.total}>of {total}</Text>
        </View>
      </Pressable>

      <Text style={styles.hint}>{complete ? 'Seven circuits complete' : caption ?? 'Tap to count each circuit'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.92 },
  orbitLayer: { alignItems: 'center' },
  markerWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  markerHalo: { position: 'absolute', width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, opacity: 0.18 },
  markerDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.primary },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  count: { fontFamily, fontSize: 44, fontWeight: '700', color: colors.foreground, letterSpacing: -1 },
  total: { fontFamily, fontSize: typography.label.fontSize, color: colors.mutedForeground, marginTop: -2 },
  hint: { fontFamily, fontSize: typography.caption.fontSize, color: colors.subtleForeground, marginTop: spacing.md, textAlign: 'center' },
});
