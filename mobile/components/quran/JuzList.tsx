/**
 * JuzList — the 30-juzʾ browser. Each row opens the reader at the juzʾ's first
 * ayah. Presentational; the parent owns navigation.
 */
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { JUZ } from '../../content/quran';
import { getSurah } from '../../lib/quran';
import { colors, fontFamily, spacing } from '../../theme/tokens';

const JUZ_ITEM_HEIGHT = 64;

export default function JuzList({
  onSelect,
}: {
  onSelect: (surah: number, ayah: number, juz: number) => void;
}) {
  return (
    <FlatList
      data={JUZ}
      keyExtractor={(j) => String(j.juz)}
      getItemLayout={(_, index) => ({
        length: JUZ_ITEM_HEIGHT,
        offset: JUZ_ITEM_HEIGHT * index,
        index,
      })}
      renderItem={({ item }) => {
        const meta = getSurah(item.surah);
        return (
          <Pressable
            onPress={() => onSelect(item.surah, item.ayah, item.juz)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeNum}>{item.juz}</Text>
            </View>
            <View style={styles.mid}>
              <Text style={styles.name}>Juzʾ {item.juz}</Text>
              <Text style={styles.sub} numberOfLines={1}>
                Begins at {meta ? meta.name : `Surah ${item.surah}`} {item.surah}
                :{item.ayah}
              </Text>
            </View>
            <Text style={styles.arabic} numberOfLines={1}>
              {meta?.arabicName}
            </Text>
          </Pressable>
        );
      }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing['2xl'] },
  row: {
    height: JUZ_ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  pressed: { backgroundColor: colors.card },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeNum: {
    fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  mid: { flex: 1, gap: 2 },
  name: {
    fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: -0.2,
  },
  sub: { fontFamily, fontSize: 12.5, color: colors.subtleForeground },
  arabic: {
    fontSize: 19,
    color: colors.mutedForeground,
    writingDirection: 'rtl',
    maxWidth: 120,
    textAlign: 'right',
  },
});
