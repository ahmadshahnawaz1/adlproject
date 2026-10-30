/**
 * SaiTrack — the saʿy between Ṣafā and Marwah. A pilgrim-light walks the masʿā
 * back and forth; the green hastening zone (between the two green lights) glows
 * at the centre; seven pips track the trips. Trip one runs Ṣafā → Marwah, and
 * the seventh ends at Marwah. Tap to count a completed trip.
 *
 * Presentational only: renders `count` of `total`, calls `onTap`.
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { fontFamily, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const LEFT = 14;
const RIGHT = 86;
const TRACK_Y = 30;

export default function SaiTrack({
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
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const complete = count >= total;
  const atMarwah = count % 2 === 1; // trip 1 ends at Marwah
  const target = atMarwah ? 1 : 0;

  const pos = useRef(new Animated.Value(target)).current;
  useEffect(() => {
    Animated.timing(pos, { toValue: target, duration: 720, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }).start();
  }, [target, pos]);
  const cx = pos.interpolate({ inputRange: [0, 1], outputRange: [LEFT, RIGHT] });

  const height = width * 0.42;
  const pips = Array.from({ length: total }, (_, i) => i < count);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onTap}
        style={({ pressed }) => [{ width, height }, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`Saʿy, ${count} of ${total} trips. Tap to count one.`}
      >
        <Svg width="100%" height="100%" viewBox="0 0 100 44">
          {/* hastening (ramal) zone */}
          <Rect x={40} y={18} width={20} height={18} fill={colors.success} opacity={0.12} rx={1} />
          <Line x1={40} y1={16} x2={40} y2={36} stroke={colors.success} strokeWidth={1} opacity={0.7} />
          <Line x1={60} y1={16} x2={60} y2={36} stroke={colors.success} strokeWidth={1} opacity={0.7} />

          {/* the masʿā track */}
          <Line x1={LEFT} y1={TRACK_Y} x2={RIGHT} y2={TRACK_Y} stroke={colors.border} strokeWidth={1} strokeLinecap="round" />

          {/* Ṣafā & Marwah mounds */}
          <Path d={`M6 ${TRACK_Y} Q14 14 22 ${TRACK_Y} Z`} fill={colors.cardElevated} stroke={colors.border} strokeWidth={0.7} />
          <Path d={`M78 ${TRACK_Y} Q86 14 94 ${TRACK_Y} Z`} fill={colors.cardElevated} stroke={colors.border} strokeWidth={0.7} />
          <SvgText x={14} y={41} fill={colors.mutedForeground} fontSize={4.4} textAnchor="middle">Ṣafā</SvgText>
          <SvgText x={86} y={41} fill={colors.mutedForeground} fontSize={4.4} textAnchor="middle">Marwah</SvgText>

          {/* the walking pilgrim-light */}
          <AnimatedCircle cx={cx} cy={TRACK_Y} r={5} fill={colors.primary} opacity={0.18} />
          <AnimatedCircle cx={cx} cy={TRACK_Y} r={2.6} fill={colors.primary} />
        </Svg>
      </Pressable>

      <View style={styles.pipRow}>
        {pips.map((done, i) => (
          <View key={i} style={[styles.pip, done && styles.pipDone]} />
        ))}
      </View>
      <Text style={styles.readout}>
        {complete ? 'Seven trips complete' : caption ?? `Trip ${Math.min(count + 1, total)} of ${total}`}
      </Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.92 },
  pipRow: { flexDirection: 'row', gap: 6, marginTop: spacing.sm },
  pip: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.cardElevated, borderWidth: 1, borderColor: colors.border },
  pipDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  readout: { fontFamily, fontSize: typography.caption.fontSize, color: colors.subtleForeground, marginTop: spacing.sm, textAlign: 'center' },
});
