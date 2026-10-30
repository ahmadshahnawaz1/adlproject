/**
 * JamaratView — the stoning of the pillars (ramy al-jamarāt). On the Day of
 * Naḥr only Jamratu-l-ʿAqaba is pelted (seven); on the days of Tashrīq all
 * three are pelted in turn (seven each). A pebble arcs from the pilgrim to the
 * active jamrah on every tap, and each pillar fills with gold as its seven
 * land. The number of pillars is derived from `total` (7 → one, 21 → three).
 *
 * Presentational only: renders `count` of `total`, calls `onTap`.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Rect, Text as SvgText } from 'react-native-svg';
import { colors, fontFamily, spacing, typography } from '../theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const GROUND_Y = 50;
const TOP_Y = 24;
const PW = 9; // pillar width
const LAUNCH = { x: 50, y: 56 };

const NAMES_3 = ['Ṣughrā', 'Wusṭā', 'ʿAqaba'];

export default function JamaratView({
  count,
  total = 7,
  onTap,
  width = 320,
  caption,
}: {
  count: number;
  total?: number;
  onTap?: () => void;
  width?: number;
  caption?: string;
}) {
  const pillars = Math.max(1, Math.round(total / 7));
  const perPillar = Math.round(total / pillars);
  const complete = count >= total;

  const xs = useMemo(() => (pillars === 1 ? [50] : pillars === 3 ? [24, 50, 76] : Array.from({ length: pillars }, (_, i) => 18 + (i * 64) / (pillars - 1))), [pillars]);
  const names = pillars === 3 ? NAMES_3 : pillars === 1 ? ['ʿAqaba'] : xs.map((_, i) => `${i + 1}`);

  const activeIdx = Math.min(pillars - 1, Math.floor(count / perPillar));
  const [throwIdx, setThrowIdx] = useState(activeIdx);

  // Flying pebble.
  const t = useRef(new Animated.Value(1)).current;
  const targetX = xs[throwIdx] ?? 50;
  const px = t.interpolate({ inputRange: [0, 1], outputRange: [LAUNCH.x, targetX] });
  const py = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [LAUNCH.y, 8, TOP_Y + 1] });
  const pOpacity = t.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] });

  const onPress = () => {
    if (complete) {
      onTap?.();
      return;
    }
    const idx = Math.min(pillars - 1, Math.floor(count / perPillar));
    setThrowIdx(idx);
    t.setValue(0);
    Animated.timing(t, { toValue: 1, duration: 460, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
    onTap?.();
  };

  useEffect(() => {
    setThrowIdx(activeIdx);
  }, [activeIdx]);

  const height = width * 0.62;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ width, height }, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`Stoning, ${count} of ${total} pebbles. Tap to throw one.`}
      >
        <Svg width="100%" height="100%" viewBox="0 0 100 62">
          <Line x1={6} y1={GROUND_Y} x2={94} y2={GROUND_Y} stroke={colors.border} strokeWidth={0.8} strokeLinecap="round" />
          {xs.map((x, i) => {
            const done = Math.max(0, Math.min(perPillar, count - i * perPillar));
            const frac = done / perPillar;
            const fillH = (GROUND_Y - TOP_Y) * frac;
            const active = i === activeIdx && !complete;
            return (
              <G key={i}>
                {/* basin */}
                <Rect x={x - PW / 2 - 2} y={GROUND_Y - 2} width={PW + 4} height={4} rx={1} fill={colors.cardElevated} stroke={colors.border} strokeWidth={0.5} />
                {/* pillar */}
                <Rect x={x - PW / 2} y={TOP_Y} width={PW} height={GROUND_Y - TOP_Y} rx={1.6} fill="#09090B" stroke={active ? colors.primary : colors.border} strokeWidth={active ? 1.1 : 0.7} />
                {/* gold fill */}
                {fillH > 0 ? <Rect x={x - PW / 2 + 0.8} y={GROUND_Y - fillH} width={PW - 1.6} height={fillH} rx={1} fill={colors.primary} opacity={0.45} /> : null}
                {/* count + name */}
                <SvgText x={x} y={TOP_Y - 3} fill={done > 0 ? colors.primary : colors.subtleForeground} fontSize={5} fontWeight="700" textAnchor="middle">{done}</SvgText>
                <SvgText x={x} y={GROUND_Y + 8} fill={colors.mutedForeground} fontSize={4} textAnchor="middle">{names[i]}</SvgText>
              </G>
            );
          })}
          {/* flying pebble */}
          <AnimatedCircle cx={px} cy={py} r={2.2} fill={colors.foreground} opacity={pOpacity} />
        </Svg>
      </Pressable>

      <Text style={styles.readout}>
        {complete ? 'Stoning complete' : caption ?? `${count} of ${total} pebbles`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.92 },
  readout: { fontFamily, fontSize: typography.caption.fontSize, color: colors.subtleForeground, marginTop: spacing.sm, textAlign: 'center' },
});
