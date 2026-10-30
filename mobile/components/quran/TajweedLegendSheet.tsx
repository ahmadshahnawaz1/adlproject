/**
 * TajweedLegendSheet — what each colour means, with a live sample of the rule
 * drawn in its own colour, and an honest note on what is and is not marked.
 */
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { TAJWEED_RULES, TAJWEED_DISCLAIMER, TAJWEED_INTRO, TAJWEED_SCOPE_NOTE } from '../../content/tajweed';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import type { ReaderTheme } from '../../theme/quranReaderThemes';

export default function TajweedLegendSheet({
  visible,
  theme,
  onClose,
}: {
  visible: boolean;
  theme: ReaderTheme;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
        <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Tajwīd colours</Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={[styles.close, { backgroundColor: theme.bg, borderColor: theme.border }]}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={18} color={theme.muted} strokeWidth={2.25} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={[styles.intro, { color: theme.muted }]}>{TAJWEED_INTRO}</Text>

            {TAJWEED_RULES.map((rule) => (
              <View
                key={rule.id}
                style={[styles.row, { backgroundColor: theme.bg, borderColor: theme.border }]}
              >
                <View style={[styles.swatch, { backgroundColor: rule.color }]} />
                <View style={styles.rowBody}>
                  <View style={styles.rowTop}>
                    <Text style={[styles.ruleTitle, { color: rule.color }]}>{rule.title}</Text>
                    {rule.counts ? (
                      <Text style={[styles.counts, { color: theme.subtle }]}>{rule.counts}</Text>
                    ) : null}
                  </View>
                  <Text style={[styles.ruleArabic, { color: theme.text }]}>{rule.arabic}</Text>
                  <Text style={[styles.ruleDesc, { color: theme.muted }]}>{rule.description}</Text>
                </View>
              </View>
            ))}

            <View style={[styles.note, { borderColor: theme.border, backgroundColor: theme.bg }]}>
              <Text style={[styles.noteText, { color: theme.muted }]}>{TAJWEED_SCOPE_NOTE}</Text>
            </View>
            <View style={[styles.note, { borderColor: theme.border, backgroundColor: theme.bg }]}>
              <Text style={[styles.noteText, { color: theme.subtle }]}>{TAJWEED_DISCLAIMER}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...typography.title, fontSize: 18 },
  close: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  content: { paddingVertical: spacing.md, gap: spacing.sm },
  intro: { fontFamily, fontSize: 14, lineHeight: 22, marginBottom: spacing.xs },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  swatch: { width: 6, borderRadius: 3 },
  rowBody: { flex: 1, gap: 2 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ruleTitle: { fontFamily, fontSize: 15, fontWeight: '700' },
  counts: { ...typography.caption, fontSize: 10 },
  ruleArabic: { fontFamily, fontSize: 15 },
  ruleDesc: { fontFamily, fontSize: 13, lineHeight: 20 },
  note: { borderRadius: radius.md, borderWidth: 1, padding: spacing.md, marginTop: spacing.xs },
  noteText: { fontFamily, fontSize: 12, lineHeight: 19 },
});
