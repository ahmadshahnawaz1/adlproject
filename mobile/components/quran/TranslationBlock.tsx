/**
 * TranslationBlock — one translation under an ayah, with an optional source
 * label so stacked translations stay legible. Purely presentational.
 */
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReaderTheme } from '../../theme/quranReaderThemes';
import { fontFamily } from '../../theme/tokens';

function TranslationBlock({
  text,
  label,
  fontSize,
  theme,
}: {
  text: string;
  /** Source name, shown only when more than one translation is stacked. */
  label?: string;
  fontSize: number;
  theme: ReaderTheme;
}) {
  if (!text) return null;
  return (
    <View style={styles.block}>
      {label ? (
        <Text style={[styles.label, { color: theme.subtle }]}>{label}</Text>
      ) : null}
      <Text
        style={[
          styles.text,
          {
            color: theme.muted,
            fontSize,
            lineHeight: Math.round(fontSize * 1.55),
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 3 },
  label: {
    fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  text: { fontFamily },
});

export default memo(TranslationBlock);
