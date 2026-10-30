/**
 * WordByWord — an ayah rendered as a wrapped, right-to-left flow of tappable
 * word chips. Each chip stacks the Uthmani Arabic over its English gloss;
 * tapping a chip surfaces the full breakdown (Arabic + transliteration + gloss)
 * in the WordDetailSheet. Memoised so it only re-renders when its inputs change.
 */
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { QuranWord } from '../../content/quran/types';
import type { ReaderTheme } from '../../theme/quranReaderThemes';
import { fontFamily, radius, spacing } from '../../theme/tokens';

function WordByWord({
  words,
  arabicFont,
  arabicFontSize,
  theme,
  onWordPress,
}: {
  words: QuranWord[];
  /** Resolved Arabic font-family name. */
  arabicFont: string;
  arabicFontSize: number;
  theme: ReaderTheme;
  onWordPress?: (word: QuranWord, index: number) => void;
}) {
  const wordArabicSize = Math.max(20, Math.round(arabicFontSize * 0.82));
  const glossSize = Math.max(11, Math.round(arabicFontSize * 0.4));

  return (
    <View style={styles.flow}>
      {words.map((w, i) => (
        <Pressable
          key={`${i}-${w.arabic}`}
          onPress={() => onWordPress?.(w, i)}
          style={({ pressed }) => [
            styles.chip,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
            pressed && { borderColor: theme.accent },
          ]}
        >
          <Text
            style={[
              styles.wordArabic,
              {
                fontFamily: arabicFont,
                fontSize: wordArabicSize,
                lineHeight: Math.round(wordArabicSize * 1.6),
                color: theme.text,
              },
            ]}
            allowFontScaling={false}
          >
            {w.arabic}
          </Text>
          <Text
            style={[styles.wordGloss, { fontSize: glossSize, color: theme.subtle }]}
            numberOfLines={2}
          >
            {w.gloss}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: spacing.sm,
  },
  chip: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    minWidth: 44,
  },
  wordArabic: {
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  wordGloss: {
    fontFamily,
    textAlign: 'center',
    maxWidth: 140,
  },
});

export default memo(WordByWord);
