/**
 * WuduInfoSheet — the honest companion to the guided ablution: what invalidates
 * wudū (so the user knows when to renew it), each with its evidence, and a
 * plain disclaimer that the content is pending scholarly review.
 */
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { X, AlertTriangle } from 'lucide-react-native';
import { WUDU_NULLIFIERS, WUDU_DISCLAIMER } from '../content/wudu/wudu';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function WuduInfoSheet({
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
          <Text style={styles.title}>What breaks wudū</Text>
          <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
            <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={styles.lead}>
            If any of these occur, wudū must be renewed before prayer.
          </Text>

          {WUDU_NULLIFIERS.map((n, i) => (
            <View key={i} style={styles.row}>
              <View style={styles.dotWrap}>
                <AlertTriangle size={15} color={colors.primary} strokeWidth={2.2} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowText}>{n.text}</Text>
                {n.daleel ? (
                  <Text style={styles.rowRef}>
                    {n.daleel.reference}
                    {n.daleel.narrator ? `  ·  ${n.daleel.narrator}` : ''}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>{WUDU_DISCLAIMER}</Text>
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
  lead: { ...typography.body, color: colors.mutedForeground, marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dotWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  rowBody: { flex: 1, gap: 3 },
  rowText: { ...typography.body, color: colors.foreground, lineHeight: 21 },
  rowRef: { ...typography.caption, fontSize: 12, color: colors.subtleForeground },
  disclaimer: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
  },
  disclaimerText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.subtleForeground,
    lineHeight: 18,
  },
});
