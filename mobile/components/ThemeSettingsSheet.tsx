/**
 * ThemeSettingsSheet — the appearance & accessibility controls (F17).
 *
 * Lets the reader choose the colour scheme (follow the system, or force light
 * or dark), turn on a higher-contrast palette, and scale the interface text for
 * legibility with a live preview. Everything is applied instantly and persisted
 * by the theme provider.
 */
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Contrast, Minus, Monitor, Moon, Plus, Sun, Type, X } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors, type ThemeMode } from '../theme/ThemeContext';
import { useT } from '../i18n/LocaleContext';
import type { MessageKey } from '../i18n';
import {
  TEXT_SCALE_MAX,
  TEXT_SCALE_MIN,
  TEXT_SCALE_STEP,
  textScaleLabel,
} from '../theme/typeScale';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';

const MODES: { key: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { key: 'system', label: 'System', Icon: Monitor },
  { key: 'light', label: 'Light', Icon: Sun },
  { key: 'dark', label: 'Dark', Icon: Moon },
];

export default function ThemeSettingsSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { colors, mode, setMode, highContrast, setHighContrast, textScale, setTextScale, scaleFont } =
    useTheme();
  const styles = useThemedStyles(makeStyles);
  const t = useT();

  const atMin = textScale <= TEXT_SCALE_MIN + 0.001;
  const atMax = textScale >= TEXT_SCALE_MAX - 0.001;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{t('appearance.title')}</Text>
            <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
              <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Colour scheme */}
            <Text style={styles.sectionLabel}>{t('appearance.theme')}</Text>
            <View style={styles.modeRow}>
              {MODES.map(({ key, Icon }) => {
                const active = mode === key;
                const modeLabel = t(`appearance.${key}` as MessageKey);
                return (
                  <Pressable
                    key={key}
                    onPress={() => setMode(key)}
                    style={({ pressed }) => [styles.modeCard, active && styles.modeCardActive, pressed && styles.pressed]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={modeLabel}
                  >
                    <Icon
                      size={22}
                      color={active ? colors.primary : colors.mutedForeground}
                      strokeWidth={2}
                    />
                    <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>{modeLabel}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* High contrast */}
            <View style={styles.switchRow}>
              <View style={styles.switchIcon}>
                <Contrast size={18} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.switchText}>
                <Text style={styles.switchTitle}>{t('appearance.contrast.title')}</Text>
                <Text style={styles.switchSub}>{t('appearance.contrast.sub')}</Text>
              </View>
              <Switch
                value={highContrast}
                onValueChange={setHighContrast}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
                ios_backgroundColor={colors.border}
              />
            </View>

            {/* Text size */}
            <Text style={styles.sectionLabel}>{t('appearance.textSize')}</Text>
            <View style={styles.sizeRow}>
              <View style={styles.switchIcon}>
                <Type size={18} color={colors.primary} strokeWidth={2} />
              </View>
              <Pressable
                onPress={() => setTextScale(textScale - TEXT_SCALE_STEP)}
                disabled={atMin}
                style={({ pressed }) => [styles.stepBtn, atMin && styles.stepDisabled, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Decrease text size"
              >
                <Minus size={16} color={atMin ? colors.subtleForeground : colors.foreground} strokeWidth={2.4} />
              </Pressable>
              <Text style={styles.sizeValue}>{textScaleLabel(textScale)}</Text>
              <Pressable
                onPress={() => setTextScale(textScale + TEXT_SCALE_STEP)}
                disabled={atMax}
                style={({ pressed }) => [styles.stepBtn, atMax && styles.stepDisabled, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Increase text size"
              >
                <Plus size={16} color={atMax ? colors.subtleForeground : colors.foreground} strokeWidth={2.4} />
              </Pressable>
            </View>

            {/* Live preview */}
            <View style={styles.preview}>
              <Text style={[styles.previewTitle, { fontSize: scaleFont(17) }]}>{t('appearance.preview.title')}</Text>
              <Text style={[styles.previewBody, { fontSize: scaleFont(14) }]}>
                {t('appearance.preview.body')}
              </Text>
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
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
    content: { gap: spacing.md, paddingBottom: spacing.lg },
    sectionLabel: {
      ...typography.button,
      fontSize: 12,
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginTop: spacing.xs,
    },
    modeRow: { flexDirection: 'row', gap: spacing.md },
    modeCard: {
      flex: 1,
      gap: spacing.sm,
      alignItems: 'center',
      paddingVertical: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    modeCardActive: { borderColor: colors.primary, backgroundColor: colors.cardElevated },
    pressed: { opacity: 0.85 },
    modeLabel: { ...typography.button, fontSize: 13, color: colors.mutedForeground },
    modeLabelActive: { color: colors.foreground },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    switchIcon: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}1A`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    switchText: { flex: 1, gap: 2 },
    switchTitle: { ...typography.button, fontSize: 14, color: colors.foreground },
    switchSub: { fontFamily, fontSize: 12, lineHeight: 17, color: colors.subtleForeground },
    sizeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    stepBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepDisabled: { opacity: 0.5 },
    sizeValue: { flex: 1, textAlign: 'center', ...typography.button, fontSize: 15, color: colors.foreground },
    preview: {
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardElevated,
      gap: 4,
    },
    previewTitle: { fontFamily, fontWeight: '700', color: colors.foreground },
    previewBody: { fontFamily, lineHeight: 21, color: colors.mutedForeground },
  });
