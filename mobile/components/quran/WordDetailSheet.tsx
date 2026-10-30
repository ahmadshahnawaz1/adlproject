/**
 * WordDetailSheet — a compact bottom sheet showing one tapped word's full
 * breakdown: large Uthmani Arabic, its transliteration, and the English gloss.
 * Themed to match the reader surface.
 */
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import type { QuranWord } from '../../content/quran/types';
import type { ReaderTheme } from '../../theme/quranReaderThemes';
import { fontFamily, radius, spacing } from '../../theme/tokens';

export default function WordDetailSheet({
  visible,
  word,
  arabicFont,
  theme,
  onClose,
}: {
  visible: boolean;
  word: QuranWord | null;
  /** Resolved Arabic font-family name. */
  arabicFont: string;
  theme: ReaderTheme;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible && word !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.border }]} />

          <View style={styles.titleRow}>
            <Text style={[styles.kicker, { color: theme.subtle }]}>WORD</Text>
            <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
              <X size={18} color={theme.muted} />
            </Pressable>
          </View>

          {word ? (
            <View style={styles.body}>
              <Text
                style={[styles.arabic, { fontFamily: arabicFont, color: theme.text }]}
                allowFontScaling={false}
              >
                {word.arabic}
              </Text>
              {word.transliteration ? (
                <Text style={[styles.translit, { color: theme.accent }]}>
                  {word.transliteration}
                </Text>
              ) : null}
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Text style={[styles.gloss, { color: theme.text }]}>
                {word.gloss}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  close: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  arabic: {
    fontSize: 44,
    lineHeight: 72,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  translit: {
    fontFamily,
    fontSize: 17,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    alignSelf: 'stretch',
    marginVertical: spacing.sm,
  },
  gloss: {
    fontFamily,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
