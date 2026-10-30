/**
 * HadithCollectionScreen — reading one collection (F18).
 *
 * Loads the narrations of a collection — bundled ones directly, downloaded ones
 * from disk — applies the authenticity filter, and lists them as cards. Used for
 * a book, a topic, the bookmarks, and search results via its flexible props.
 */
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, SlidersHorizontal } from 'lucide-react-native';
import HadithCard from '../components/hadith/HadithCard';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import {
  bundledHadithOf,
  collectionById,
  filterByGrade,
  type Hadith,
} from '../lib/hadith';
import { getCollectionHadith } from '../lib/hadithStore';
import type { UseHadithSettings } from '../hooks/useHadithSettings';
import type { UseHadithBookmarks } from '../hooks/useHadithBookmarks';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';

export default function HadithCollectionScreen({
  collectionId,
  settings,
  bookmarks,
  onOpenSettings,
  onClose,
}: {
  collectionId: string;
  settings: UseHadithSettings;
  bookmarks: UseHadithBookmarks;
  onOpenSettings: () => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const collection = collectionById(collectionId);
  const [all, setAll] = useState<Hadith[] | null>(collection?.availability === 'bundled' ? bundledHadithOf(collectionId) : null);
  const [loading, setLoading] = useState(collection?.availability !== 'bundled');

  useEffect(() => {
    if (collection?.availability === 'bundled') {
      setAll(bundledHadithOf(collectionId));
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    (async () => {
      const list = await getCollectionHadith(collectionId);
      if (alive) {
        setAll(list ?? []);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [collectionId, collection?.availability]);

  const list = useMemo(
    () => filterByGrade(all ?? [], settings.authenticOnly),
    [all, settings.authenticOnly],
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
          <ChevronLeft size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {collection?.name ?? 'Collection'}
          </Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {loading ? 'Loading…' : `${list.length.toLocaleString()} shown${settings.authenticOnly ? ' · authentic only' : ''}`}
          </Text>
        </View>
        <Pressable onPress={onOpenSettings} hitSlop={12} style={styles.iconBtn}>
          <SlidersHorizontal size={18} color={colors.mutedForeground} strokeWidth={2.2} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : list.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>
            {settings.authenticOnly
              ? 'No authentic narrations to show. Adjust the filter in settings.'
              : 'Nothing to show yet.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(h) => h.id}
          renderItem={({ item }) => (
            <HadithCard
              hadith={item}
              arabicFontSize={settings.arabicFontSize}
              showTranslation={settings.showTranslation}
              showIsnad={settings.showIsnad}
              isBookmarked={bookmarks.isBookmarked(item.id)}
              onToggleBookmark={() => bookmarks.toggle(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          windowSize={9}
        />
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingTop: spacing['3xl'] + spacing.md,
      paddingBottom: spacing.md,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
    headerTitle: { fontFamily, fontSize: 17, fontWeight: '700', color: colors.foreground },
    headerSub: { fontFamily, fontSize: typography.caption.fontSize, color: colors.subtleForeground },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: spacing['3xl'] },
    empty: { fontFamily, fontSize: 14, lineHeight: 21, color: colors.mutedForeground, textAlign: 'center', paddingHorizontal: spacing.xl },
    list: { gap: spacing.md, paddingBottom: spacing['2xl'] },
  });
