/**
 * LearnPathRunner — the guided runner for the "New Muslim" path.
 *
 * It walks the track one step at a time: a slim progress rail of dots at the
 * top, the current step's title and content (rendered through LessonView), an
 * optional jump into a feature of the app (Wudū, How to Pray, the Qurʾān …), a
 * "mark complete" control, and previous / next navigation. Completion state is
 * owned by the caller and reflected on the rail.
 */
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowRight, Check, ChevronLeft, ChevronRight } from 'lucide-react-native';
import type { Track } from '../../content/learn';
import LessonView from './LessonView';
import { arabicFont, fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

export default function LearnPathRunner({
  track,
  isStepComplete,
  onToggleComplete,
  onAction,
}: {
  track: Track;
  isStepComplete: (id: string) => boolean;
  onToggleComplete: (id: string, complete: boolean) => void;
  /** Jump into another feature (e.g. 'wudu', 'salah', 'quran'). */
  onAction?: (target: string) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [index, setIndex] = useState(0);
  const total = track.steps.length;
  const step = track.steps[index];
  const done = isStepComplete(step.id);
  const atFirst = index === 0;
  const atLast = index === total - 1;

  const go = (next: number) => setIndex(Math.max(0, Math.min(total - 1, next)));

  return (
    <View style={styles.wrap}>
      {/* Progress rail */}
      <View style={styles.rail}>
        {track.steps.map((s, i) => {
          const complete = isStepComplete(s.id);
          const current = i === index;
          return (
            <Pressable
              key={s.id}
              onPress={() => go(i)}
              style={styles.railTap}
              accessibilityRole="button"
              accessibilityLabel={`Step ${i + 1}: ${s.title}`}
            >
              <View
                style={[
                  styles.pip,
                  complete && styles.pipDone,
                  current && styles.pipCurrent,
                ]}
              />
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.counter}>
        Step {index + 1} of {total}
      </Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>{step.title}</Text>
          {step.arabic ? <Text style={styles.arabic}>{step.arabic}</Text> : null}
        </View>
        <Text style={styles.summary}>{step.summary}</Text>

        <LessonView body={step.body} />

        {step.action && onAction ? (
          <Pressable
            onPress={() => onAction(step.action!.target)}
            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionPressed]}
            accessibilityRole="button"
            accessibilityLabel={step.action.label}
          >
            <Text style={styles.actionText}>{step.action.label}</Text>
            <ArrowRight size={16} color={colors.primaryForeground} strokeWidth={2.4} />
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => onToggleComplete(step.id, !done)}
          style={({ pressed }) => [styles.markBtn, done && styles.markBtnDone, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={done ? 'Mark this step as not done' : 'Mark this step complete'}
        >
          <View style={[styles.markTick, done && styles.markTickDone]}>
            {done ? <Check size={13} color={colors.primaryForeground} strokeWidth={3} /> : null}
          </View>
          <Text style={[styles.markText, done && styles.markTextDone]}>
            {done ? 'Completed' : 'Mark complete'}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Footer navigation */}
      <View style={styles.footer}>
        <Pressable
          onPress={() => go(index - 1)}
          disabled={atFirst}
          style={({ pressed }) => [styles.navBtn, atFirst && styles.navDisabled, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Previous step"
        >
          <ChevronLeft size={18} color={atFirst ? colors.subtleForeground : colors.foreground} strokeWidth={2.2} />
          <Text style={[styles.navText, atFirst && styles.navTextDisabled]}>Back</Text>
        </Pressable>

        <Pressable
          onPress={() => go(index + 1)}
          disabled={atLast}
          style={({ pressed }) => [styles.navBtn, styles.navNext, atLast && styles.navDisabled, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Next step"
        >
          <Text style={[styles.navText, styles.navNextText, atLast && styles.navTextDisabled]}>Next</Text>
          <ChevronRight size={18} color={atLast ? colors.subtleForeground : colors.primary} strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: { flex: 1 },
  rail: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingHorizontal: spacing.xs },
  railTap: { flex: 1, paddingVertical: spacing.sm },
  pip: { height: 4, borderRadius: 2, backgroundColor: colors.border },
  pipDone: { backgroundColor: `${colors.primary}99` },
  pipCurrent: { backgroundColor: colors.primary, height: 5 },
  counter: { fontFamily, fontSize: 11, fontWeight: '600', color: colors.subtleForeground, marginTop: 2, marginBottom: spacing.sm },
  scroll: { flex: 1 },
  scrollBody: { gap: spacing.md, paddingBottom: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { ...typography.title, fontSize: 20, color: colors.foreground, flexShrink: 1 },
  arabic: { fontFamily: arabicFont, fontSize: 18, color: colors.primary, writingDirection: 'rtl' },
  summary: { fontFamily, fontSize: 14, lineHeight: 21, color: colors.mutedForeground, fontStyle: 'italic' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  actionPressed: { opacity: 0.9 },
  actionText: { ...typography.button, color: colors.primaryForeground },
  markBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  markBtnDone: { borderColor: `${colors.primary}55`, backgroundColor: colors.cardElevated },
  pressed: { opacity: 0.85 },
  markTick: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markTickDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  markText: { ...typography.button, fontSize: 14, color: colors.foreground },
  markTextDone: { color: colors.primary },
  footer: { flexDirection: 'row', gap: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  navNext: { backgroundColor: colors.cardElevated, borderColor: `${colors.primary}55` },
  navDisabled: { opacity: 0.5 },
  navText: { ...typography.button, fontSize: 14, color: colors.foreground },
  navNextText: { color: colors.primary },
  navTextDisabled: { color: colors.subtleForeground },
});
