/**
 * StageTimeline — a horizontal rail of the journey's stages. A gold line fills
 * along the rail to the current stage; each node shows its short label and a
 * tick when its steps are all done. Tapping a stage jumps the journey to its
 * first step. The fill animates with the dashoffset technique.
 */
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Journey } from '../content/pilgrimage';
import { stageProgress } from '../lib/pilgrimage';
import { fontFamily, spacing, typography } from '../theme/tokens';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const NODE_GAP = 86;

export default function StageTimeline({
  journey,
  completed,
  activeStageIndex,
  onJumpToStage,
}: {
  journey: Journey;
  completed: ReadonlySet<string>;
  activeStageIndex: number;
  onJumpToStage?: (stageIndex: number) => void;
}) {
  const styles = useThemedStyles(makeStyles);
  const progress = useMemo(() => stageProgress(journey, completed), [journey, completed]);
  const count = progress.length;

  // Fill fraction up to (and including the partial of) the active stage.
  const targetFrac = useMemo(() => {
    if (count <= 1) return 0;
    const active = progress[activeStageIndex];
    const base = activeStageIndex / (count - 1);
    const within = active ? active.fraction / (count - 1) : 0;
    return Math.min(1, base + within);
  }, [progress, activeStageIndex, count]);

  const fill = useRef(new Animated.Value(targetFrac)).current;
  useEffect(() => {
    Animated.timing(fill, { toValue: targetFrac, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [targetFrac, fill]);
  const fillWidth = fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  const railWidth = Math.max(NODE_GAP * (count - 1) + NODE_GAP, NODE_GAP);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <View style={[styles.rail, { width: railWidth }]}>
        {/* base + animated fill line */}
        <View style={styles.line} />
        <Animated.View style={[styles.lineFill, { width: fillWidth }]} />

        <View style={styles.nodes}>
          {progress.map((p, i) => {
            const active = i === activeStageIndex;
            const reached = i <= activeStageIndex;
            return (
              <Pressable key={p.stage.id} onPress={() => onJumpToStage?.(i)} style={[styles.node, { width: NODE_GAP }]} accessibilityRole="button" accessibilityLabel={`Stage ${i + 1}: ${p.stage.title}`}>
                <View style={[styles.dot, reached && styles.dotReached, active && styles.dotActive]}>
                  <Text style={[styles.dotText, reached && styles.dotTextReached, active && styles.dotTextActive]}>{p.complete ? '✓' : i + 1}</Text>
                </View>
                <Text style={[styles.label, active && styles.labelActive]} numberOfLines={2}>
                  {p.stage.shortLabel}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const DOT = 30;
const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  rail: { position: 'relative', justifyContent: 'center' },
  line: { position: 'absolute', left: NODE_GAP / 2, right: NODE_GAP / 2, top: DOT / 2 - 1, height: 2, backgroundColor: colors.border, borderRadius: 1 },
  lineFill: { position: 'absolute', left: NODE_GAP / 2, top: DOT / 2 - 1, height: 2, backgroundColor: colors.primary, borderRadius: 1 },
  nodes: { flexDirection: 'row' },
  node: { alignItems: 'center', gap: spacing.xs },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  dotReached: { borderColor: colors.primary },
  dotActive: { backgroundColor: colors.primary },
  dotText: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '700', color: colors.subtleForeground },
  dotTextReached: { color: colors.primary },
  dotTextActive: { color: colors.primaryForeground },
  label: { fontFamily, fontSize: 11, lineHeight: 14, color: colors.subtleForeground, textAlign: 'center', maxWidth: NODE_GAP - 8 },
  labelActive: { color: colors.foreground, fontWeight: '600' },
});
