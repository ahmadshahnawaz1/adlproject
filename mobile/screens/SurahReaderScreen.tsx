/**
 * SurahReaderScreen — the muṣḥaf reader for one surah.
 *
 * A toolbar sits above a virtualised list of ayahs (with the surah header and
 * Bismillah as the list header). Tapping an ayah opens its actions; the
 * typography button opens reader settings. The top visible ayah is remembered
 * for resume, and an optional initial ayah is scrolled into view on open.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import ReaderToolbar from '../components/quran/ReaderToolbar';
import SurahHeader from '../components/quran/SurahHeader';
import AyahRow from '../components/quran/AyahRow';
import ReaderSettingsSheet from '../components/quran/ReaderSettingsSheet';
import TajweedLegendSheet from '../components/quran/TajweedLegendSheet';
import AyahActionsSheet from '../components/quran/AyahActionsSheet';
import RecitationSheet from '../components/quran/RecitationSheet';
import WordDetailSheet from '../components/quran/WordDetailSheet';
import TafsirSheet from '../components/quran/TafsirSheet';
import useQuranContent from '../hooks/useQuranContent';
import useRecitationPlayer from '../hooks/useRecitationPlayer';
import useQuranRecitationDownloads from '../hooks/useQuranRecitationDownloads';
import type { UseQuranSettings } from '../hooks/useQuranSettings';
import type { UseQuranBookmarks } from '../hooks/useQuranBookmarks';
import type { UseQuranReader } from '../hooks/useQuranReader';
import type { UseQuranDownloads } from '../hooks/useQuranDownloads';
import { getSurah, juzOf } from '../lib/quran';
import { findEdition } from '../lib/quranEditions';
import { BUNDLED_TRANSLATIONS } from '../content/quran';
import type { Ayah, QuranWord } from '../content/quran/types';
import { getReaderTheme } from '../theme/quranReaderThemes';
import { colors, fontFamily, quranFontFamily, spacing } from '../theme/tokens';

export default function SurahReaderScreen({
  surah,
  initialAyah,
  settings,
  bookmarks,
  reader,
  downloads,
  onBack,
  onOpenLibrary,
}: {
  surah: number;
  initialAyah?: number;
  settings: UseQuranSettings;
  bookmarks: UseQuranBookmarks;
  reader: UseQuranReader;
  downloads: UseQuranDownloads;
  onBack: () => void;
  onOpenLibrary: () => void;
}) {
  const meta = getSurah(surah);
  const { settings: s } = settings;
  const theme = getReaderTheme(s.readerTheme);
  const bundledIds = useMemo(
    () => new Set(BUNDLED_TRANSLATIONS.map((e) => e.id)),
    [],
  );
  const downloadedEditionIds = useMemo(
    () => s.translationIds.filter((id) => !bundledIds.has(id)),
    [s.translationIds, bundledIds],
  );
  const { ayahs, loading } = useQuranContent(surah, {
    withWords: s.showWordByWord,
    editionIds: downloadedEditionIds,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [recitationOpen, setRecitationOpen] = useState(false);
  const [tajweedLegendOpen, setTajweedLegendOpen] = useState(false);
  const [selected, setSelected] = useState<Ayah | null>(null);
  const [word, setWord] = useState<QuranWord | null>(null);
  const [tafsirTarget, setTafsirTarget] = useState<Ayah | null>(null);
  const [topAyah, setTopAyah] = useState(initialAyah ?? 1);

  const listRef = useRef<FlatList<Ayah>>(null);
  const arabicFont = quranFontFamily(s.arabicFont);

  const recitation = useRecitationPlayer();
  const recitationDownloads = useQuranRecitationDownloads();
  const {
    playingSurah,
    playingAyah,
    isPlaying,
    isBuffering,
    toggle: toggleRecite,
    play: playRecite,
    stop: stopRecite,
  } = recitation;

  // Focus mode: the toolbar floats over the page and auto-hides while reading
  // forward, returning the instant the reader scrolls back up or nears the top.
  const chromeAnim = useRef(new Animated.Value(1)).current;
  const chromeShown = useRef(true);
  const lastOffset = useRef(0);
  const [toolbarH, setToolbarH] = useState(0);

  const setChrome = useCallback(
    (show: boolean) => {
      if (chromeShown.current === show) return;
      chromeShown.current = show;
      Animated.timing(chromeAnim, {
        toValue: show ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    },
    [chromeAnim],
  );

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const dy = y - lastOffset.current;
      lastOffset.current = y;
      if (y < (toolbarH || 96)) {
        setChrome(true);
        return;
      }
      if (Math.abs(dy) < 6) return;
      setChrome(dy < 0);
    },
    [setChrome, toolbarH],
  );

  // Keep the latest surah + setter in a ref so the viewability callback stays
  // stable (FlatList requires a non-changing onViewableItemsChanged).
  const posRef = useRef({ surah, setPosition: reader.setPosition });
  posRef.current = { surah, setPosition: reader.setPosition };
  const onViewRef = useRef((info: { viewableItems: ViewToken[] }) => {
    const top = info.viewableItems[0]?.item as Ayah | undefined;
    if (top) {
      setTopAyah(top.number);
      posRef.current.setPosition(posRef.current.surah, top.number);
    }
  });
  const viewConfigRef = useRef({ itemVisiblePercentThreshold: 50 });

  // Scroll to the requested ayah once content is ready.
  useEffect(() => {
    if (loading || !initialAyah || initialAyah <= 1 || ayahs.length === 0) {
      return;
    }
    const index = ayahs.findIndex((a) => a.number === initialAyah);
    if (index > 0) {
      const handle = requestAnimationFrame(() => {
        try {
          listRef.current?.scrollToIndex({ index, animated: false });
        } catch {
          // onScrollToIndexFailed will recover.
        }
      });
      return () => cancelAnimationFrame(handle);
    }
  }, [loading, ayahs, initialAyah]);

  const openActions = useCallback((ayah: Ayah) => {
    Haptics.selectionAsync().catch(() => {});
    setSelected(ayah);
  }, []);

  const playAyahRow = useCallback(
    (ayah: Ayah) => {
      Haptics.selectionAsync().catch(() => {});
      toggleRecite(ayah.surah, ayah.number);
    },
    [toggleRecite],
  );

  const onToggleSurahPlay = useCallback(() => {
    if (playingSurah === surah && playingAyah != null) {
      toggleRecite(surah, playingAyah);
    } else {
      playRecite(surah, topAyah);
    }
  }, [playingSurah, playingAyah, surah, topAyah, toggleRecite, playRecite]);

  // Keep the reciting ayah in view as recitation advances.
  useEffect(() => {
    if (playingSurah !== surah || playingAyah == null || ayahs.length === 0) {
      return;
    }
    const index = ayahs.findIndex((a) => a.number === playingAyah);
    if (index < 0) return;
    try {
      listRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.35,
      });
    } catch {
      // onScrollToIndexFailed will recover.
    }
  }, [playingSurah, playingAyah, surah, ayahs]);

  // Stop recitation when leaving the surah or unmounting the reader.
  useEffect(() => () => stopRecite(), [surah, stopRecite]);

  const toggleSelectedBookmark = useCallback(() => {
    if (selected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      bookmarks.toggle(selected.surah, selected.number);
    }
  }, [selected, bookmarks]);

  const onWordPress = useCallback((w: QuranWord) => {
    Haptics.selectionAsync().catch(() => {});
    setWord(w);
  }, []);

  const openTafsir = useCallback(() => {
    setSelected((current) => {
      if (current) setTafsirTarget(current);
      return null;
    });
  }, []);

  const translationLabels = useMemo(() => {
    const map: Record<string, string> = {};
    for (const ed of BUNDLED_TRANSLATIONS) map[ed.id] = ed.name;
    for (const id of s.translationIds) {
      if (map[id]) continue;
      const meta = findEdition(id);
      if (meta) map[id] = meta.name;
    }
    return map;
  }, [s.translationIds]);

  const renderItem = useCallback(
    ({ item }: { item: Ayah }) => (
      <AyahRow
        ayah={item}
        arabicFont={arabicFont}
        arabicFontSize={s.arabicFontSize}
        lineSpacing={s.lineSpacing}
        showTransliteration={s.showTransliteration}
        showTranslation={s.showTranslation}
        showWordByWord={s.showWordByWord}
        showTajweed={s.showTajweed}
        translationIds={s.translationIds}
        translationLabels={translationLabels}
        theme={theme}
        bookmarked={bookmarks.isBookmarked(item.surah, item.number)}
        selected={selected?.number === item.number}
        playing={playingSurah === item.surah && playingAyah === item.number}
        buffering={
          isBuffering &&
          playingSurah === item.surah &&
          playingAyah === item.number
        }
        onPress={openActions}
        onLongPress={openActions}
        onWordPress={onWordPress}
        onPlay={playAyahRow}
      />
    ),
    [
      arabicFont,
      s.arabicFontSize,
      s.lineSpacing,
      s.showTransliteration,
      s.showTranslation,
      s.showWordByWord,
      s.showTajweed,
      s.translationIds,
      translationLabels,
      theme,
      bookmarks,
      selected,
      playingSurah,
      playingAyah,
      isBuffering,
      openActions,
      onWordPress,
      playAyahRow,
    ],
  );

  const header = useMemo(
    () =>
      meta ? (
        <SurahHeader meta={meta} arabicFont={arabicFont} theme={theme} />
      ) : null,
    [meta, arabicFont, theme],
  );

  if (!meta) {
    return (
      <View style={[styles.root, { backgroundColor: theme.bg }]}>
        <ReaderToolbar
          surah={{
            number: surah,
            arabicName: '',
            name: `Surah ${surah}`,
            meaning: '',
            revelation: 'meccan',
            ayahCount: 0,
            hasBismillah: false,
            startPage: 1,
          }}
          theme={theme}
          onBack={onBack}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <View style={styles.center}>
          <Text style={[styles.muted, { color: theme.subtle }]}>
            Surah not found.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <Animated.View
        onLayout={(e) => setToolbarH(e.nativeEvent.layout.height)}
        style={[
          styles.floatingToolbar,
          {
            opacity: chromeAnim,
            transform: [
              {
                translateY: chromeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-(toolbarH || 120), 0],
                }),
              },
            ],
          },
        ]}
      >
        <ReaderToolbar
          surah={meta}
          juz={juzOf(surah, topAyah)}
          theme={theme}
          progress={meta.ayahCount > 0 ? topAyah / meta.ayahCount : 0}
          playing={playingSurah === surah && isPlaying}
          onBack={onBack}
          onOpenSettings={() => setSettingsOpen(true)}
          onTogglePlay={onToggleSurahPlay}
        />
      </Animated.View>

      {loading && ayahs.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.accent} />
          <Text style={[styles.muted, { color: theme.subtle }]}>
            Loading the muṣḥaf…
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={ayahs}
          keyExtractor={(item) => String(item.number)}
          renderItem={renderItem}
          ListHeaderComponent={header}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onScrollToIndexFailed={(info) => {
            listRef.current?.scrollToOffset({
              offset: info.averageItemLength * info.index,
              animated: false,
            });
            setTimeout(() => {
              try {
                listRef.current?.scrollToIndex({
                  index: info.index,
                  animated: false,
                });
              } catch {
                // Give up silently; the reader is still usable.
              }
            }, 60);
          }}
          initialNumToRender={8}
          windowSize={11}
          removeClippedSubviews
          contentContainerStyle={[
            styles.content,
            { paddingTop: toolbarH || spacing['3xl'] },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <ReaderSettingsSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        controls={settings}
        downloads={downloads}
        onOpenLibrary={() => {
          setSettingsOpen(false);
          onOpenLibrary();
        }}
        onOpenRecitation={() => {
          setSettingsOpen(false);
          setRecitationOpen(true);
        }}
        onOpenTajweedLegend={() => setTajweedLegendOpen(true)}
      />

      <TajweedLegendSheet
        visible={tajweedLegendOpen}
        theme={theme}
        onClose={() => setTajweedLegendOpen(false)}
      />

      <RecitationSheet
        visible={recitationOpen}
        onClose={() => setRecitationOpen(false)}
        surah={surah}
        ayahCount={meta.ayahCount}
        surahName={meta.name}
        reciterId={recitation.reciterId}
        onSelectReciter={recitation.setReciter}
        downloads={recitationDownloads}
      />

      <AyahActionsSheet
        visible={selected != null}
        ayah={selected}
        surahName={meta.name}
        bookmarked={
          selected
            ? bookmarks.isBookmarked(selected.surah, selected.number)
            : false
        }
        translationIds={s.translationIds}
        translationLabels={translationLabels}
        arabicFont={arabicFont}
        playing={
          selected
            ? playingSurah === selected.surah &&
              playingAyah === selected.number &&
              isPlaying
            : false
        }
        onToggleBookmark={toggleSelectedBookmark}
        onOpenTafsir={openTafsir}
        onPlay={() => {
          if (selected) toggleRecite(selected.surah, selected.number);
        }}
        onClose={() => setSelected(null)}
      />

      <WordDetailSheet
        visible={word != null}
        word={word}
        arabicFont={arabicFont}
        theme={theme}
        onClose={() => setWord(null)}
      />

      <TafsirSheet
        visible={tafsirTarget != null}
        surah={tafsirTarget?.surah ?? surah}
        ayah={tafsirTarget?.number ?? 1}
        surahName={meta.name}
        tafsirId={s.tafsirId}
        onSelectTafsir={settings.setTafsirId}
        theme={theme}
        onClose={() => setTafsirTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  floatingToolbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  muted: { fontFamily, fontSize: 14, color: colors.subtleForeground },
  content: { paddingBottom: spacing['3xl'] },
});
