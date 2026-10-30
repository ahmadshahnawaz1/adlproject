/**
 * HadithSettingsSheet — the reader's display controls (F18).
 *
 * The authenticity filter (on by default, the safe stance), the translation and
 * isnād toggles, and an Arabic text-size stepper.
 */
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Minus, Plus, ShieldCheck, X } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import type { UseHadithSettings } from '../../hooks/useHadithSettings';
import { fontFamily, quranFonts, radius, spacing, typography } from '../../theme/tokens';

export default function HadithSettingsSheet({
  visible,
  onClose,
  settings,
}: {
  visible: boolean;
  onClose: () => void;
  settings: UseHadithSettings;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const Row = ({
    title,
    sub,
    value,
    onValueChange,
  }: {
    title: string;
    sub?: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
  }) => (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.border}
      />
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Reading settings</Text>
            <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
              <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
            </Pressable>
          </View>

          <View style={[styles.authCard, settings.authenticOnly && styles.authCardOn]}>
            <View style={styles.authHead}>
              <ShieldCheck
                size={18}
                color={settings.authenticOnly ? colors.success : colors.mutedForeground}
                strokeWidth={2.2}
              />
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Authentic only</Text>
                <Text style={styles.rowSub}>
                  {settings.authenticOnly
                    ? 'Showing ṣaḥīḥ and ḥasan narrations only.'
                    : 'Weak and fabricated narrations are shown — always heed the grade.'}
                </Text>
              </View>
              <Switch
                value={settings.authenticOnly}
                onValueChange={settings.setAuthenticOnly}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor={colors.white}
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>

          <Row title="Show translation" value={settings.showTranslation} onValueChange={settings.toggleTranslation} />
          <Row title="Show chain of narration (isnād)" value={settings.showIsnad} onValueChange={settings.toggleIsnad} />

          <View style={styles.sizeRow}>
            <Text style={styles.rowTitle}>Arabic text size</Text>
            <View style={styles.stepper}>
              <Pressable onPress={settings.decreaseFont} hitSlop={8} style={styles.stepBtn} accessibilityLabel="Decrease Arabic size">
                <Minus size={16} color={colors.foreground} strokeWidth={2.4} />
              </Pressable>
              <Text style={styles.sizeValue}>{settings.arabicFontSize}</Text>
              <Pressable onPress={settings.increaseFont} hitSlop={8} style={styles.stepBtn} accessibilityLabel="Increase Arabic size">
                <Plus size={16} color={colors.foreground} strokeWidth={2.4} />
              </Pressable>
            </View>
          </View>

          <Text style={[styles.preview, { fontSize: settings.arabicFontSize, lineHeight: settings.arabicFontSize * 1.9 }]}>
            إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ
          </Text>
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
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.md,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginTop: spacing.sm,
    },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { ...typography.title, fontSize: 18, color: colors.foreground },
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
    authCard: {
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    authCardOn: { borderColor: `${colors.success}55`, backgroundColor: colors.cardElevated },
    authHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.sm,
    },
    rowText: { flex: 1, minWidth: 0, gap: 2 },
    rowTitle: { ...typography.button, fontSize: 14, color: colors.foreground },
    rowSub: { fontFamily, fontSize: 12, lineHeight: 17, color: colors.subtleForeground },
    sizeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    stepBtn: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sizeValue: { fontFamily, fontSize: 15, fontWeight: '700', color: colors.foreground, minWidth: 28, textAlign: 'center' },
    preview: {
      fontFamily: quranFonts.scheherazade,
      color: colors.foreground,
      textAlign: 'right',
      writingDirection: 'rtl',
      paddingTop: spacing.xs,
    },
  });
