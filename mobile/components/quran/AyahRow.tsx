/**
 * AyahRow — one ayah in the reader.
 *
 * A name-strip carries the ayah medallion (and a bookmark mark when saved); the
 * Arabic sits below in the reader's chosen typeface and size, followed by the
 * optional transliteration and translation layers. Purely presentational — the
 * parent owns settings and bookmark state. Memoised for long-list performance.
 */
import { memo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Bookmark, Pause, Play } from 'lucide-react-native';
import AyahMedallion from './AyahMedallion';
import WordByWord from './WordByWord';
import TranslationBlock from './TranslationBlock';
import type { Ayah, QuranWord } from '../../content/quran/types';
import type { ReaderTheme } from '../../theme/quranReaderThemes';
import { fontFamily, spacing } from '../../theme/tokens';

function AyahRow({
  ayah,
  arabicFont,
  arabicFontSize,
  lineSpacing,
  showTransliteration,
  showTranslation,
  showWordByWord,
  translationIds,
  translationLabels,
  theme,
  bookmarked,
  selected = false,
  playing = false,
  buffering = false,
  onPress,
  onLongPress,
  onWordPress,
  onPlay,
}: {
  ayah: Ayah;
  /** Resolved Arabic font-family name. */
  arabicFont: string;
  arabicFontSize: number;
  lineSpacing: number;
  showTransliteration: boolean;
  showTranslation: boolean;
  showWordByWord: boolean;
  translationIds: string[];
  /** Edition id → display name, for labelling stacked translations. */
  translationLabels?: Record<string, string>;
  theme: ReaderTheme;
  bookmarked: boolean;
  selected?: boolean;
  /** This ayah is the one currently being recited. */
  playing?: boolean;
  /** This ayah is loading/buffering its audio. */
  buffering?: boolean;
  onPress?: (ayah: Ayah) => void;
  onLongPress?: (ayah: Ayah) => void;
  onWordPress?: (word: QuranWord, index: number, ayah: Ayah) => void;
  /** Toggle recitation for this ayah. */
  onPlay?: (ayah: Ayah) => void;
}) {
  const arabicLineHeight = Math.round(arabicFontSize * 1.95 * lineSpacing);
  const translitSize = Math.max(13, Math.round(arabicFontSize * 0.5));
  const translationSize = Math.max(14, Math.round(arabicFontSize * 0.52));
  const wbw = showWordByWord && !!ayah.words && ayah.words.length > 0;
  const showMultiLabels = translationIds.length > 1;

  return (
    <Pressable
      onPress={() => onPress?.(ayah)}
      onLongPress={() => onLongPress?.(ayah)}
      delayLongPress={260}
      style={[
        styles.row,
        { borderBottomColor: theme.border },
        selected && { backgroundColor: theme.selection },
        playing && { backgroundColor: theme.selection },
      ]}
    >
      <View style={styles.strip}>
        <AyahMedallion
          number={ayah.number}
          size={30}
          color={theme.accent}
          textColor={theme.text}
          active={selected || playing}
        />
        <View style={styles.stripRight}>
          {bookmarked ? (
            <Bookmark size={15} color={theme.accent} fill={theme.accent} />
          ) : null}
          {onPlay ? (
            <Pressable
              onPress={() => onPlay(ayah)}
              hitSlop={10}
              style={[
                styles.playBtn,
                { borderColor: theme.border },
                playing && { backgroundColor: theme.accent, borderColor: theme.accent },
              ]}
              accessibilityRole="button"
              accessibilityLabel={playing ? 'Pause recitation' : 'Play recitation'}
            >
              {buffering ? (
                <ActivityIndicator size="small" color={playing ? theme.accentText : theme.accent} />
              ) : playing ? (
                <Pause size={15} color={theme.accentText} fill={theme.accentText} />
              ) : (
                <Play size={15} color={theme.accent} fill={theme.accent} />
              )}
            </Pressable>
          ) : null}
        </View>
      </View>

      {wbw ? (
        <WordByWord
          words={ayah.words ?? []}
          arabicFont={arabicFont}
          arabicFontSize={arabicFontSize}
          theme={theme}
          onWordPress={(word, index) => onWordPress?.(word, index, ayah)}
        />
      ) : (
        <Text
          style={[
            styles.arabic,
            {
              color: theme.text,
              fontFamily: arabicFont,
              fontSize: arabicFontSize,
              lineHeight: arabicLineHeight,
            },
          ]}
          allowFontScaling={false}
        >
          {ayah.arabic}
        </Text>
      )}

      {showTransliteration && !wbw && ayah.transliteration ? (
        <Text
          style={[
            styles.translit,
            {
              color: theme.subtle,
              fontSize: translitSize,
              lineHeight: Math.round(translitSize * 1.5),
            },
          ]}
        >
          {ayah.transliteration}
        </Text>
      ) : null}

      {showTranslation && translationIds.length > 0 ? (
        <View style={styles.translations}>
          {translationIds.map((id) => {
            const text = ayah.translations[id];
            if (!text) return null;
            return (
              <TranslationBlock
                key={id}
                text={text}
                label={
                  showMultiLabels
                    ? (translationLabels?.[id] ?? id)
                    : undefined
                }
                fontSize={translationSize}
                theme={theme}
              />
            );
          })}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stripRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  playBtn: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabic: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  translit: {
    fontFamily,
    fontStyle: 'italic',
  },
  translations: { gap: spacing.md },
});

export default memo(AyahRow);
