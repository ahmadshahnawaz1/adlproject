/**
 * LanguageSheet — choose the interface language (F14).
 *
 * Lists every shipped language by its endonym, marks the active one, and
 * switches instantly on tap. The choice is persisted by the locale provider.
 */
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';

export default function LanguageSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { code, locales, setLocale, t } = useLocale();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.titles}>
              <Text style={styles.title}>{t('language.title')}</Text>
              <Text style={styles.sub}>{t('language.sub')}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
              <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {locales.map((loc) => {
              const active = loc.code === code;
              return (
                <Pressable
                  key={loc.code}
                  onPress={() => {
                    setLocale(loc.code);
                    onClose();
                  }}
                  style={({ pressed }) => [styles.row, active && styles.rowActive, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={loc.label}
                >
                  <View style={styles.rowText}>
                    <Text style={styles.native}>{loc.nativeLabel}</Text>
                    <Text style={styles.english}>{loc.label}</Text>
                  </View>
                  {active ? <Check size={18} color={colors.primary} strokeWidth={2.6} /> : null}
                </Pressable>
              );
            })}
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
    header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.md },
    titles: { flex: 1, minWidth: 0, gap: 2 },
    title: { ...typography.title, fontSize: 18, color: colors.foreground },
    sub: { fontFamily, fontSize: 12, color: colors.subtleForeground },
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
    content: { gap: spacing.sm, paddingBottom: spacing.lg },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    rowActive: { borderColor: colors.primary, backgroundColor: colors.cardElevated },
    pressed: { opacity: 0.85 },
    rowText: { gap: 2 },
    native: { ...typography.button, fontSize: 16, color: colors.foreground },
    english: { fontFamily, fontSize: 12, color: colors.subtleForeground },
  });
