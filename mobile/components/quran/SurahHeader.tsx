/**
 * SurahHeader — the title block shown at the start of a surah in the reader.
 *
 * Shows a name plate (Arabic name, transliteration · meaning, revelation place
 * and ayah count) and, when appropriate, the Bismillah in the reader's Arabic
 * typeface. al-Fātiḥah (1) and at-Tawbah (9) omit the standalone Bismillah.
 */
import { StyleSheet, Text, View } from 'react-native';
import { BISMILLAH } from '../../content/quran';
import type { SurahMeta } from '../../content/quran/types';
import type { ReaderTheme } from '../../theme/quranReaderThemes';
import { fontFamily, spacing } from '../../theme/tokens';

export default function SurahHeader({
  meta,
  arabicFont,
  theme,
  bismillahSize = 26,
}: {
  meta: SurahMeta;
  /** Resolved Arabic font-family name. */
  arabicFont: string;
  theme: ReaderTheme;
  bismillahSize?: number;
}) {
  const place = meta.revelation === 'medinan' ? 'Medinan' : 'Meccan';

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.plate,
          { borderColor: theme.border, backgroundColor: theme.surface },
        ]}
      >
        <Text
          style={[styles.arabicName, { fontFamily: arabicFont, color: theme.text }]}
        >
          {meta.arabicName}
        </Text>
        <Text style={[styles.latinName, { color: theme.text }]}>
          {meta.number}. {meta.name}
        </Text>
        <Text style={[styles.meaning, { color: theme.muted }]}>
          {meta.meaning}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.dotChip, { borderColor: theme.border }]}>
            <Text style={[styles.chipText, { color: theme.subtle }]}>
              {place}
            </Text>
          </View>
          <View style={[styles.dot, { backgroundColor: theme.subtle }]} />
          <Text style={[styles.metaText, { color: theme.subtle }]}>
            {meta.ayahCount} ayahs
          </Text>
        </View>
      </View>

      {meta.hasBismillah ? (
        <Text
          style={[
            styles.bismillah,
            {
              color: theme.accent,
              fontFamily: arabicFont,
              fontSize: bismillahSize,
              lineHeight: Math.round(bismillahSize * 2),
            },
          ]}
          allowFontScaling={false}
        >
          {BISMILLAH}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.lg,
  },
  plate: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'stretch',
  },
  arabicName: {
    fontSize: 34,
    textAlign: 'center',
    marginBottom: 2,
  },
  latinName: {
    fontFamily,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  meaning: {
    fontFamily,
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  dotChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontFamily,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 999,
  },
  metaText: {
    fontFamily,
    fontSize: 12,
  },
  bismillah: {
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
