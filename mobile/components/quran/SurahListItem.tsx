/**
 * SurahListItem — one row in the surah browser.
 *
 * A diamond badge carries the surah number; the transliterated name and a
 * "meaning · n ayahs" sub-line sit beside it, with the Arabic name on the far
 * side. Memoised so the 114-row list scrolls smoothly.
 */
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SurahMeta } from '../../content/quran/types';
import { colors, fontFamily, spacing } from '../../theme/tokens';

export const SURAH_ITEM_HEIGHT = 72;

function SurahListItem({
  meta,
  onPress,
}: {
  meta: SurahMeta;
  onPress: (surah: number) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(meta.number)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeNum}>{meta.number}</Text>
      </View>

      <View style={styles.mid}>
        <Text style={styles.name} numberOfLines={1}>
          {meta.name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {meta.meaning} · {meta.ayahCount} ayahs
        </Text>
      </View>

      <Text style={styles.arabic} numberOfLines={1}>
        {meta.arabicName}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    height: SURAH_ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  pressed: { backgroundColor: colors.card },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  badgeNum: {
    fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    transform: [{ rotate: '-45deg' }],
  },
  mid: { flex: 1, gap: 2 },
  name: {
    fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: -0.2,
  },
  sub: {
    fontFamily,
    fontSize: 12.5,
    color: colors.subtleForeground,
  },
  arabic: {
    fontSize: 20,
    color: colors.mutedForeground,
    writingDirection: 'rtl',
    maxWidth: 130,
    textAlign: 'right',
  },
});

export default memo(SurahListItem);
