/**
 * TasbihBead — the tactile heart of the counter. A single large, tappable disc:
 * a gold arc fills as the current round is counted, the number rests at the
 * centre, and the disc gives a gentle pop on every bead. A reusable, purely
 * presentational primitive — it renders `count` of `target` and calls `onTap`;
 * the parent owns the numbers and the haptics.
 *
 * Driver rules: the progress arc is an SVG node, so its animation uses the JS
 * driver (useNativeDriver:false); the pop is a React Native View transform and
 * uses the native driver.
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { fontFamily, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const R = 42;
const C = 2 * Math.PI * R;

export default function TasbihBead({
  count,
  target,
  rounds,
  onTap,
  size = 264,
  accent: accentProp,
}: {
  count: number;
  target: number;
  rounds: number;
  onTap?: () => void;
  size?: number;
  accent?: string;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const accent = accentProp ?? colors.primary;
  const counted = target > 0;
  const frac = counted ? Math.max(0, Math.min(1, count / target)) : 0;
  const complete = counted && count >= target;

  // Progress arc (SVG → JS driver).
  const prog = useRef(new Animated.Value(frac)).current;
  useEffect(() => {
    Animated.timing(prog, {
      toValue: frac,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [frac, prog]);
  const dashoffset = prog.interpolate({ inputRange: [0, 1], outputRange: [C, 0] });

  // Tap pop (RN View transform → native driver).
  const pop = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (count === 0) return;
    pop.setValue(0.94);
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 140, useNativeDriver: true }).start();
  }, [count, pop]);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onTap}
        style={({ pressed }) => [{ width: size, height: size }, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={
          counted
            ? `Tasbīḥ, ${count} of ${target}. Tap to count.`
            : `Tasbīḥ, ${count} counted. Tap to count.`
        }
      >
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: pop }] }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
            {/* soft halo */}
            <Circle cx={50} cy={50} r={48} fill={accent} opacity={complete ? 0.1 : 0.04} />
            {/* the bead body */}
            <Circle cx={50} cy={50} r={R} fill={colors.card} stroke={colors.border} strokeWidth={1} />
            {/* track */}
            <Circle
              cx={50}
              cy={50}
              r={R}
              stroke={colors.border}
              strokeWidth={2.6}
              fill="none"
              strokeDasharray={counted ? undefined : '0.4 4'}
              opacity={counted ? 0.5 : 0.8}
            />
            {/* progress arc */}
            {counted ? (
              <AnimatedCircle
                cx={50}
                cy={50}
                r={R}
                stroke={accent}
                strokeWidth={2.8}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={dashoffset}
                rotation={-90}
                originX={50}
                originY={50}
              />
            ) : null}
          </Svg>
        </Animated.View>

        {/* centre readout */}
        <View pointerEvents="none" style={styles.center}>
          {rounds > 0 ? (
            <View style={styles.roundPill}>
              <Text style={styles.roundText}>{`Round ${rounds + (complete ? 0 : 1)}`}</Text>
            </View>
          ) : null}
          <Text style={[styles.count, complete && { color: accent }]}>{count}</Text>
          <Text style={styles.total}>{counted ? `of ${target}` : 'dhikr'}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.94 },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  roundPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
    marginBottom: spacing.xs,
  },
  roundText: { fontFamily, fontSize: 11, fontWeight: '600', color: colors.mutedForeground },
  count: { fontFamily, fontSize: 60, fontWeight: '700', color: colors.foreground, letterSpacing: -1.5 },
  total: { fontFamily, fontSize: typography.label.fontSize, color: colors.mutedForeground, marginTop: -4 },
});
