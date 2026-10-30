/**
 * SalahInfoSheet — the surrounding fiqh of the prayer that doesn't belong to any
 * single posture: its conditions, the heart's presence (khushūʿ), common
 * mistakes, the prostration of forgetfulness (sujūd al-sahw), the sutrah,
 * specific notes for women, and praying in congregation. Each point can carry
 * its evidence, and the sheet closes with the standing review disclaimer.
 */
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { SALAH_GUIDANCE, SALAH_DISCLAIMER } from '../content/salah';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function SalahInfoSheet({
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
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>About the prayer</Text>
          <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
            <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {SALAH_GUIDANCE.map((section) => (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.intro ? <Text style={styles.intro}>{section.intro}</Text> : null}
              {section.points.map((point) => (
                <View key={point.id} style={styles.point}>
                  {point.title ? <Text style={styles.pointTitle}>{point.title}</Text> : null}
                  <Text style={styles.pointText}>{point.text}</Text>
                  {point.daleel ? (
                    <Text style={styles.pointRef}>
                      {point.daleel.reference}
                      {point.daleel.narrator ? `  ·  ${point.daleel.narrator}` : ''}
                      {point.daleel.grade ? `  ·  ${point.daleel.grade}` : ''}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ))}

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>{SALAH_DISCLAIMER}</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '80%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: { ...typography.title, color: colors.foreground },
  close: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.cardElevated,
  },
  content: { paddingBottom: spacing.lg },
  section: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontFamily, fontSize: typography.body.fontSize, fontWeight: '700', color: colors.foreground },
  intro: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.mutedForeground },
  point: {
    gap: 3,
    paddingLeft: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  pointTitle: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '600', color: colors.foreground },
  pointText: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.mutedForeground },
  pointRef: { fontFamily, fontSize: 12, color: colors.subtleForeground },
  disclaimer: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
  },
  disclaimerText: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.subtleForeground },
});
