/**
 * AdditiveSheet — what one ingredient is, where it comes from, and which
 * scholarly question decides it.
 */
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { X } from 'lucide-react-native';
import AppText from '../ui/AppText';
import {
  CATEGORY_LABEL,
  RULING_BY_AXIS,
  STATUS_LABEL,
  type Additive,
} from '../../content/halal';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

export default function AdditiveSheet({
  additive,
  onClose,
}: {
  additive: Additive | null;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  if (!additive) return null;

  const tone =
    additive.status === 'prohibited'
      ? colors.destructive
      : additive.status === 'clear'
        ? colors.mutedForeground
        : colors.primary;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <View style={styles.headText}>
              <AppText style={styles.code}>{additive.code}</AppText>
              <AppText style={styles.title}>{additive.name}</AppText>
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Close">
              <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.chips}>
              <AppText style={[styles.chip, { color: tone, backgroundColor: `${tone}14` }]}>
                {STATUS_LABEL[additive.status]}
              </AppText>
              <AppText style={styles.chipMuted}>{CATEGORY_LABEL[additive.category]}</AppText>
            </View>

            {additive.concern ? (
              <>
                <AppText style={styles.label}>WHY IT IS FLAGGED</AppText>
                <AppText style={styles.body}>{additive.concern}</AppText>
              </>
            ) : (
              <AppText style={styles.body}>
                Nothing about this one is contested on any production route we know of.
              </AppText>
            )}

            {additive.sources?.length ? (
              <>
                <AppText style={styles.label}>MADE FROM</AppText>
                {additive.sources.map((s) => (
                  <View key={s} style={styles.bulletRow}>
                    <AppText style={styles.bullet}>•</AppText>
                    <AppText style={styles.body}>{s}</AppText>
                  </View>
                ))}
              </>
            ) : null}

            {additive.note ? (
              <>
                <AppText style={styles.label}>NOTE</AppText>
                <AppText style={styles.body}>{additive.note}</AppText>
              </>
            ) : null}

            {additive.dependsOn?.length ? (
              <>
                <AppText style={styles.label}>WHAT DECIDES IT</AppText>
                {additive.dependsOn.map((axis) => {
                  const ruling = RULING_BY_AXIS[axis];
                  return (
                    <View key={axis} style={styles.ruling}>
                      <View style={styles.rulingHead}>
                        <AppText style={styles.rulingTitle}>{ruling.title}</AppText>
                        <AppText style={styles.rulingArabic}>{ruling.arabic}</AppText>
                      </View>
                      <AppText style={styles.body}>{ruling.question}</AppText>
                    </View>
                  );
                })}
                <AppText style={styles.hint}>
                  Set the position you follow under Your standard, and results adjust to it.
                </AppText>
              </>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
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
    head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
    headText: { flex: 1, gap: 2 },
    code: { ...typography.caption, fontSize: 11, color: colors.primary, fontWeight: '700' },
    title: { ...typography.title, fontSize: 18, color: colors.foreground },
    iconBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    content: { paddingVertical: spacing.md, gap: spacing.sm },
    chips: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
    chip: {
      ...typography.caption,
      fontSize: 11,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.full,
      overflow: 'hidden',
    },
    chipMuted: {
      ...typography.caption,
      fontSize: 11,
      color: colors.subtleForeground,
      backgroundColor: colors.card,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.full,
      overflow: 'hidden',
    },
    label: {
      ...typography.caption,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.primary,
      marginTop: spacing.md,
    },
    body: { flex: 1, fontFamily, fontSize: 13, lineHeight: 21, color: colors.mutedForeground },
    bulletRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
    bullet: { fontFamily, fontSize: 15, color: colors.primary, lineHeight: 21 },
    ruling: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.md,
      gap: 4,
    },
    rulingHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    rulingTitle: { ...typography.title, fontSize: 15, color: colors.foreground },
    rulingArabic: { fontFamily, fontSize: 14, color: colors.primary },
    hint: { ...typography.caption, fontSize: 11, color: colors.subtleForeground, fontStyle: 'italic' },
  });
