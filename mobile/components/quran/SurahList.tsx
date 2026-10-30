/**
 * SurahList — a performant FlatList of surahs.
 *
 * Presentational: the parent supplies the (possibly filtered) data, the select
 * handler, and an optional header (search bar, resume card, tabs). Fixed row
 * height enables getItemLayout for smooth scrolling across all 114 entries.
 */
import { type ReactElement } from 'react';
import { FlatList } from 'react-native';
import type { SurahMeta } from '../../content/quran/types';
import SurahListItem, { SURAH_ITEM_HEIGHT } from './SurahListItem';
import { spacing } from '../../theme/tokens';

export default function SurahList({
  data,
  onSelect,
  ListHeaderComponent,
  ListEmptyComponent,
}: {
  data: SurahMeta[];
  onSelect: (surah: number) => void;
  ListHeaderComponent?: ReactElement | null;
  ListEmptyComponent?: ReactElement | null;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.number)}
      renderItem={({ item }) => <SurahListItem meta={item} onPress={onSelect} />}
      getItemLayout={(_, index) => ({
        length: SURAH_ITEM_HEIGHT,
        offset: SURAH_ITEM_HEIGHT * index,
        index,
      })}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      initialNumToRender={12}
      windowSize={11}
      removeClippedSubviews
      contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
      showsVerticalScrollIndicator={false}
    />
  );
}
