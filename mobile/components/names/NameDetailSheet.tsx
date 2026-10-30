/**
 * NameDetailSheet — one name in full: the calligraphy, its meaning, the
 * reflection, its theme, a deep-link to where it appears in the muṣḥaf, and the
 * controls to favourite it or mark it memorised.
 */
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { BookOpen, Check, CircleCheck, Heart, X } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { arabicFont, fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { themeMeta, type DivineName } from '../../lib/names';

export default function NameDetailSheet({
  name,
  memorised,
  favourite,
  onToggleMemorised,
  onToggleFavourite,
  onOpenQuran,
  onClose,
}: {
  name: DivineName | null;
  memorised: boolean;
  favourite: boolean;
  onToggleMemorised: () => void;
  onToggleFavourite: () => void;
  onOpenQuran?: () => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const meta = name ? themeMeta(name.theme) : undefined;

  return (
    <Modal visible={name != null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {name ? (
            <>
              <View style={styles.header}>
                <AppText style={styles.number}>{name.number} of 99</AppText>
                <Pressable onPress={onClose} hitSlop={12} style={styles.close} accessibilityRole="button" accessibilityLabel="Close">
                  <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <AppText style={styles.arabic}>{name.arabic}</AppText>
                <AppText style={styles.translit}>{name.transliteration}</AppText>
                <AppText style={styles.meaning}>{name.meaning}</AppText>

                {meta ? (
                  <View style={styles.themeChip}>
                    <AppText style={styles.themeText}>{meta.title}</AppText>
                  </View>
                ) : null}

                <AppText style={styles.explanation}>{name.explanation}</AppText>

                {name.quranRef && onOpenQuran ? (
                  <Pressable
                    onPress={onOpenQuran}
                    style={({ pressed }) => [styles.quranBtn, pressed && styles.pressed]}
                    accessibilityRole="button"
                    accessibilityLabel={`Read Qurʾān ${name.quranRef.surah}:${name.quranRef.ayah}`}
                  >
                    <BookOpen size={15} color={colors.primary} strokeWidth={2.2} />
                    <AppText style={styles.quranText}>
                      Qurʾān {name.quranRef.surah}:{name.quranRef.ayah}
                    </AppText>
                  </Pressable>
                ) : null}

                <View style={styles.actions}>
                  <Pressable
                    onPress={onToggleMemorised}
                    style={({ pressed }) => [
                      styles.action,
                      memorised && styles.actionOn,
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: memorised }}
                    accessibilityLabel={memorised ? 'Marked as memorised' : 'Mark as memorised'}
                  >
                    {memorised ? (
                      <CircleCheck size={16} color={colors.success} strokeWidth={2.4} />
                    ) : (
                      <Check size={16} color={colors.mutedForeground} strokeWidth={2.2} />
                    )}
                    <AppText style={[styles.actionText, memorised && { color: colors.success }]}>
                      {memorised ? 'Memorised' : 'Mark memorised'}
                    </AppText>
                  </Pressable>

                  <Pressable
                    onPress={onToggleFavourite}
                    style={({ pressed }) => [
                      styles.action,
                      favourite && styles.actionOn,
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: favourite }}
                    accessibilityLabel={favourite ? 'Remove from favourites' : 'Add to favourites'}
                  >
                    <Heart
                      size={16}
                      color={favourite ? colors.primary : colors.mutedForeground}
                      strokeWidth={2.2}
                      fill={favourite ? colors.primary : 'none'}
                    />
                    <AppText style={[styles.actionText, favourite && { color: colors.primary }]}>
                      {favourite ? 'Favourited' : 'Favourite'}
                    </AppText>
                  </Pressable>
                </View>
              </ScrollView>
            </>
          ) : null}
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    number: { ...typography.caption, fontSize: 11, letterSpacing: 0.5, color: colors.subtleForeground },
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
    content: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm },
    arabic: { fontFamily: arabicFont, fontSize: 52, lineHeight: 84, color: colors.foreground, textAlign: 'center' },
    translit: { ...typography.title, fontSize: 22, color: colors.foreground, textAlign: 'center' },
    meaning: { fontFamily, fontSize: 15, color: colors.primary, textAlign: 'center' },
    themeChip: {
      paddingVertical: 4,
      paddingHorizontal: spacing.md,
      borderRadius: radius.full,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: spacing.xs,
    },
    themeText: { ...typography.caption, fontSize: 11, color: colors.mutedForeground },
    explanation: {
      fontFamily,
      fontSize: 15,
      lineHeight: 24,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    quranBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}14`,
      borderWidth: 1,
      borderColor: `${colors.primary}44`,
      marginTop: spacing.sm,
    },
    quranText: { fontFamily, fontSize: 13, color: colors.primary },
    actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      minHeight: 44,
    },
    actionOn: { backgroundColor: colors.cardElevated },
    actionText: { fontFamily, fontSize: 13, color: colors.mutedForeground },
    pressed: { opacity: 0.85 },
  });
