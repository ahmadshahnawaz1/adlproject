/**
 * LessonSheet — the bottom-sheet reader for a single lesson or Sīrah event.
 *
 * It presents the title (with optional Arabic and a meta line), renders the
 * body through LessonView, and offers an optional "mark as read" control. Used
 * by both the ʿAqīdah/Fiqh lesson lists and the Sīrah timeline.
 */
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import type { LessonBlock } from '../../content/learn';
import LessonView from './LessonView';
import { arabicFont, colors, fontFamily, radius, spacing, typography } from '../../theme/tokens';

export default function LessonSheet({
  visible,
  onClose,
  title,
  arabic,
  meta,
  body,
  complete,
  onToggleComplete,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  arabic?: string;
  meta?: string;
  body: LessonBlock[];
  complete?: boolean;
  onToggleComplete?: (complete: boolean) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.titles}>
              <Text style={styles.title}>{title}</Text>
              {arabic ? <Text style={styles.arabic}>{arabic}</Text> : null}
              {meta ? <Text style={styles.meta}>{meta}</Text> : null}
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
              <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <LessonView body={body} />

            {onToggleComplete ? (
              <Pressable
                onPress={() => onToggleComplete(!complete)}
                style={({ pressed }) => [styles.markBtn, complete && styles.markBtnDone, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={complete ? 'Mark as not read' : 'Mark as read'}
              >
                <View style={[styles.tick, complete && styles.tickDone]}>
                  {complete ? <Check size={13} color={colors.primaryForeground} strokeWidth={3} /> : null}
                </View>
                <Text style={[styles.markText, complete && styles.markTextDone]}>
                  {complete ? 'Read' : 'Mark as read'}
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    maxHeight: '85%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },
  titles: { flex: 1, minWidth: 0, gap: 3 },
  title: { ...typography.title, fontSize: 20, color: colors.foreground },
  arabic: { fontFamily: arabicFont, fontSize: 18, color: colors.primary, writingDirection: 'rtl' },
  meta: { fontFamily, fontSize: 12, color: colors.subtleForeground },
  close: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: { gap: spacing.lg, paddingBottom: spacing.lg },
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
  tick: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  markText: { ...typography.button, fontSize: 14, color: colors.foreground },
  markTextDone: { color: colors.primary },
});
