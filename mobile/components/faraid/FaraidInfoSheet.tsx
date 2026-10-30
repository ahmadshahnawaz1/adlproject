/**
 * FaraidInfoSheet — the evidence the shares rest on, the order in which claims
 * are settled, the key terms, and a plain statement of what this tool will not
 * calculate.
 */
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { X } from 'lucide-react-native';
import AppText from '../ui/AppText';
import {
  FARAID_CONCEPTS,
  FARAID_DALEEL,
  FARAID_DISCLAIMER,
  FARAID_INTRO,
  FARAID_ORDER,
  FARAID_SCOPE,
  FARAID_WOMEN_NOTE,
} from '../../content/faraid';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

export default function FaraidInfoSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <AppText style={styles.title}>About farāʾiḍ</AppText>
            <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Close">
              <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <AppText style={styles.body}>{FARAID_INTRO}</AppText>

            <AppText style={styles.label}>BEFORE ANYTHING IS DIVIDED</AppText>
            {FARAID_ORDER.map((step, i) => (
              <View key={step.title} style={styles.step}>
                <View style={styles.stepNum}>
                  <AppText style={styles.stepNumText}>{i + 1}</AppText>
                </View>
                <View style={styles.stepText}>
                  <AppText style={styles.stepTitle}>{step.title}</AppText>
                  <AppText style={styles.stepDetail}>{step.detail}</AppText>
                </View>
              </View>
            ))}

            <AppText style={styles.label}>THE EVIDENCE</AppText>
            {FARAID_DALEEL.map((d) => (
              <View key={d.id} style={styles.evidence}>
                <AppText style={styles.arabic}>{d.arabic}</AppText>
                <AppText style={styles.meaning}>{d.meaning}</AppText>
                <AppText style={styles.ref}>{d.source}</AppText>
              </View>
            ))}

            <AppText style={styles.label}>KEY TERMS</AppText>
            {FARAID_CONCEPTS.map((c) => (
              <View key={c.term} style={styles.concept}>
                <View style={styles.conceptHead}>
                  <AppText style={styles.conceptTerm}>{c.term}</AppText>
                  <AppText style={styles.conceptArabic}>{c.arabic}</AppText>
                </View>
                <AppText style={styles.stepDetail}>{c.detail}</AppText>
              </View>
            ))}

            <AppText style={styles.label}>ON THE TWO-TO-ONE SHARE</AppText>
            <AppText style={styles.body}>{FARAID_WOMEN_NOTE}</AppText>

            <AppText style={styles.label}>WHAT THIS DOES NOT CALCULATE</AppText>
            {FARAID_SCOPE.map((s) => (
              <View key={s} style={styles.noteRow}>
                <AppText style={styles.bullet}>•</AppText>
                <AppText style={styles.stepDetail}>{s}</AppText>
              </View>
            ))}

            <View style={styles.disclaimer}>
              <AppText style={styles.disclaimerText}>{FARAID_DISCLAIMER}</AppText>
            </View>
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
    head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
    label: {
      ...typography.caption,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.primary,
      marginTop: spacing.md,
    },
    body: { fontFamily, fontSize: 14, lineHeight: 22, color: colors.mutedForeground },
    step: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
    stepNum: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.primary}1A`,
      marginTop: 2,
    },
    stepNumText: { ...typography.caption, fontSize: 11, fontWeight: '700', color: colors.primary },
    stepText: { flex: 1, gap: 2 },
    stepTitle: { fontFamily, fontSize: 14, fontWeight: '600', color: colors.foreground },
    stepDetail: { flex: 1, fontFamily, fontSize: 13, lineHeight: 20, color: colors.mutedForeground },
    evidence: {
      borderRadius: radius.md,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      backgroundColor: colors.card,
      padding: spacing.md,
      gap: 4,
    },
    arabic: { fontFamily, fontSize: 16, lineHeight: 30, color: colors.foreground, textAlign: 'right' },
    meaning: { fontFamily, fontSize: 13, lineHeight: 20, color: colors.mutedForeground },
    ref: { ...typography.caption, fontSize: 11, color: colors.primary },
    concept: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.md,
      gap: 3,
    },
    conceptHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    conceptTerm: { ...typography.title, fontSize: 15, color: colors.foreground },
    conceptArabic: { fontFamily, fontSize: 14, color: colors.primary },
    noteRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
    bullet: { fontFamily, fontSize: 16, color: colors.primary, lineHeight: 20 },
    disclaimer: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.md,
      marginTop: spacing.lg,
    },
    disclaimerText: { fontFamily, fontSize: 12, lineHeight: 19, color: colors.subtleForeground },
  });
