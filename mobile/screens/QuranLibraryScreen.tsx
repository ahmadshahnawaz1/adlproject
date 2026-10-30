/**
 * QuranLibraryScreen — browse and download the full translation catalog.
 *
 * The 490+ editions are grouped by language with forgiving search and a
 * translation / transliteration filter. Each edition downloads to disk for
 * fully-offline reading and can be removed to reclaim storage. Deleting an
 * edition that is currently shown in the reader also drops it from the display
 * selection. App-palette control chrome.
 */
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ChevronLeft, HardDrive } from 'lucide-react-native';
import DuaSearchBar from '../components/DuaSearchBar';
import EditionRow from '../components/quran/EditionRow';
import type { UseQuranSettings } from '../hooks/useQuranSettings';
import type { UseQuranDownloads } from '../hooks/useQuranDownloads';
import {
  EDITION_CATALOG,
  TOTAL_DOWNLOADABLE_EDITIONS,
  TOTAL_EDITION_LANGUAGES,
} from '../content/quran';
import type {
  DownloadableEdition,
  DownloadableKind,
} from '../content/quran/types';
import {
  filterEditionsByKind,
  formatBytes,
  groupEditionsByLanguage,
  searchEditions,
} from '../lib/quranEditions';
import { colors, fontFamily, radius, spacing } from '../theme/tokens';

type KindFilter = DownloadableKind | 'all';

const FILTERS: { key: KindFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'translation', label: 'Translations' },
  { key: 'transliteration', label: 'Transliterations' },
];

export default function QuranLibraryScreen({
  settings,
  downloads,
  onBack,
}: {
  settings: UseQuranSettings;
  downloads: UseQuranDownloads;
  onBack: () => void;
}) {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<KindFilter>('all');

  const bytesById = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of downloads.records) map.set(r.id, r.bytes);
    return map;
  }, [downloads.records]);

  const sections = useMemo(() => {
    const byKind = filterEditionsByKind(EDITION_CATALOG, kind);
    const matched = searchEditions(byKind, query);
    return groupEditionsByLanguage(matched).map((g) => ({
      title: g.language,
      data: g.editions,
    }));
  }, [kind, query]);

  const matchCount = useMemo(
    () => sections.reduce((n, s) => n + s.data.length, 0),
    [sections],
  );

  const onDownload = useCallback(
    (edition: DownloadableEdition) => {
      downloads.download(edition);
    },
    [downloads],
  );

  const onDelete = useCallback(
    (id: string) => {
      downloads.remove(id);
      if (settings.settings.translationIds.includes(id)) {
        settings.toggleTranslationId(id);
      }
    },
    [downloads, settings],
  );

  const renderItem = useCallback(
    ({ item }: { item: DownloadableEdition }) => (
      <EditionRow
        edition={item}
        downloaded={downloads.isDownloaded(item.id)}
        busy={downloads.isBusy(item.id)}
        errored={downloads.errorId === item.id}
        bytes={bytesById.get(item.id)}
        onDownload={onDownload}
        onDelete={onDelete}
      />
    ),
    [downloads, bytesById, onDownload, onDelete],
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          accessibilityLabel="Back"
        >
          <ChevronLeft size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Translations</Text>
          <Text style={styles.headerSub}>
            {TOTAL_DOWNLOADABLE_EDITIONS} editions · {TOTAL_EDITION_LANGUAGES}{' '}
            languages
          </Text>
        </View>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.controls}>
        <DuaSearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search translations…"
        />
        <View style={styles.filters}>
          {FILTERS.map((f) => {
            const active = kind === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setKind(f.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.storage}>
          <HardDrive size={14} color={colors.subtleForeground} />
          <Text style={styles.storageText}>
            {downloads.records.length} downloaded ·{' '}
            {formatBytes(downloads.totalBytes)}
          </Text>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length}</Text>
          </View>
        )}
        stickySectionHeadersEnabled
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No translations match “{query.trim()}”.
            </Text>
          </View>
        }
        ListFooterComponent={
          matchCount > 0 ? (
            <Text style={styles.footer}>
              {matchCount} edition{matchCount === 1 ? '' : 's'} · downloads stay
              offline on this device
            </Text>
          ) : null
        }
        initialNumToRender={14}
        windowSize={11}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing['3xl'] + spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontFamily,
    fontSize: 12,
    color: colors.subtleForeground,
    marginTop: 1,
  },
  controls: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  filters: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  chipText: { fontFamily, fontSize: 13, color: colors.mutedForeground },
  chipTextActive: { color: colors.primaryForeground, fontWeight: '600' },
  storage: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  storageText: { fontFamily, fontSize: 12.5, color: colors.subtleForeground },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.mutedForeground,
  },
  sectionCount: { fontFamily, fontSize: 12, color: colors.subtleForeground },
  listContent: { paddingBottom: spacing['3xl'] },
  empty: { padding: spacing['2xl'], alignItems: 'center' },
  emptyText: {
    fontFamily,
    fontSize: 14,
    color: colors.subtleForeground,
    textAlign: 'center',
  },
  footer: {
    fontFamily,
    fontSize: 12,
    color: colors.subtleForeground,
    textAlign: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
