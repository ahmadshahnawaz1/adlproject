/**
 * LearnPathScreen — the guided "New Muslim" path.
 *
 * Opened from the Learning Hub. A thin wrapper around LearnPathRunner that adds
 * the screen header (with a live completion readout) and forwards step actions
 * up to the app's navigator, so a step can jump into the Wudū guide, How to
 * Pray, the Qurʾān, Adhkār, or the Mosque finder. Progress is owned by the hub.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import LearnPathRunner from '../components/learn/LearnPathRunner';
import { NEW_MUSLIM_TRACK } from '../content/learn';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function LearnPathScreen({
  isStepComplete,
  onToggleStep,
  onAction,
  onClose,
}: {
  isStepComplete: (id: string) => boolean;
  onToggleStep: (id: string, complete: boolean) => void;
  onAction?: (target: string) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const doneCount = NEW_MUSLIM_TRACK.steps.filter((s) => isStepComplete(s.id)).length;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
          <ChevronLeft size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Your First Steps</Text>
          <Text style={styles.headerSub}>
            {doneCount} / {NEW_MUSLIM_TRACK.steps.length} complete
          </Text>
        </View>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.body}>
        <LearnPathRunner
          track={NEW_MUSLIM_TRACK}
          isStepComplete={isStepComplete}
          onToggleComplete={onToggleStep}
          onAction={onAction}
        />
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing['3xl'] + spacing.md,
    paddingBottom: spacing.lg,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  headerTitle: { fontFamily, fontSize: 17, fontWeight: '700', color: colors.foreground },
  headerSub: { fontFamily, fontSize: typography.caption.fontSize, color: colors.subtleForeground },
  body: { flex: 1, paddingBottom: spacing.lg },
});
