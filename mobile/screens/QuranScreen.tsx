/**
 * QuranScreen — the Qurʾān home: a resume card, a Surah/Juzʾ switch, forgiving
 * search, and the full muṣḥaf. Selecting a surah or juzʾ opens the reader. All
 * reader state (settings, bookmarks, last-read) lives here so it persists while
 * moving between the list and the reader. Fully offline.
 */
import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Info,
  Library,
  X,
} from 'lucide-react-native';
import DuaSearchBar from '../components/DuaSearchBar';
import SurahList from '../components/quran/SurahList';
import JuzList from '../components/quran/JuzList';
import SurahReaderScreen from './SurahReaderScreen';
import QuranLibraryScreen from './QuranLibraryScreen';
import useQuranSettings from '../hooks/useQuranSettings';
import useQuranBookmarks from '../hooks/useQuranBookmarks';
import useQuranReader from '../hooks/useQuranReader';
import useQuranDownloads from '../hooks/useQuranDownloads';
import { searchSurahs, getSurah } from '../lib/quran';
import {
  QURAN_DISCLAIMER,
  TOTAL_AYAHS,
  TOTAL_SURAHS,
} from '../content/quran';
import { colors, fontFamily, radius, spacing, typography } from '../theme/tokens';

type ReaderTarget = { surah: number; initialAyah: number };

export default function QuranScreen({ onClose }: { onClose?: () => void }) {
  const settings = useQuranSettings();
  const bookmarks = useQuranBookmarks();
  const reader = useQuranReader();
  const downloads = useQuranDownloads();

  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'surah' | 'juz'>('surah');
  const [target, setTarget] = useState<ReaderTarget | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const results = useMemo(() => searchSurahs(query), [query]);

  const openSurah = useCallback((surah: number, initialAyah = 1) => {
    setTarget({ surah, initialAyah });
  }, []);

  if (libraryOpen) {
    return (
      <QuranLibraryScreen
        settings={settings}
        downloads={downloads}
        onBack={() => setLibraryOpen(false)}
      />
    );
  }

  if (target) {
    return (
      <SurahReaderScreen
        surah={target.surah}
        initialAyah={target.initialAyah}
        settings={settings}
        bookmarks={bookmarks}
        reader={reader}
        downloads={downloads}
        onBack={() => setTarget(null)}
        onOpenLibrary={() => setLibraryOpen(true)}
      />
    );
  }

  const last = reader.last;
  const lastMeta = last ? getSurah(last.surah) : undefined;

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            accessibilityLabel="Back"
          >
            <ChevronLeft size={22} color={colors.foreground} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Qurʾān</Text>
            <Text style={styles.headerSub}>Read the muṣḥaf · fully offline</Text>
          </View>
          <Pressable
            onPress={() => setLibraryOpen(true)}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            accessibilityLabel="Translation library"
          >
            <Library size={20} color={colors.foreground} />
          </Pressable>
          <Pressable
            onPress={() => setInfoOpen(true)}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            accessibilityLabel="About"
          >
            <Info size={20} color={colors.foreground} />
          </Pressable>
        </View>

        {last && lastMeta ? (
          <Pressable
            onPress={() => openSurah(last.surah, last.ayah)}
            style={({ pressed }) => [styles.resume, pressed && styles.pressed]}
          >
            <View style={styles.resumeIcon}>
              <BookOpenText size={20} color={colors.primary} />
            </View>
            <View style={styles.resumeText}>
              <Text style={styles.resumeKicker}>CONTINUE READING</Text>
              <Text style={styles.resumeTitle} numberOfLines={1}>
                {lastMeta.name} · {last.surah}:{last.ayah}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.subtleForeground} />
          </Pressable>
        ) : null}

        <View style={styles.tabs}>
          {(['surah', 'juz'] as const).map((t) => {
            const active = tab === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {t === 'surah' ? 'Surah' : 'Juzʾ'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab === 'surah' ? (
          <View style={styles.searchWrap}>
            <DuaSearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search surah, meaning, or number…"
            />
          </View>
        ) : null}
      </View>

      <View style={styles.listWrap}>
        {tab === 'surah' ? (
          <SurahList
            data={results}
            onSelect={(n) => openSurah(n, 1)}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  No surah matches “{query.trim()}”.
                </Text>
              </View>
            }
          />
        ) : (
          <JuzList onSelect={(s, a) => openSurah(s, a)} />
        )}
      </View>

      <Modal
        visible={infoOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setInfoOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setInfoOpen(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.sheetTitleRow}>
              <Text style={styles.sheetTitle}>About</Text>
              <Pressable
                onPress={() => setInfoOpen(false)}
                hitSlop={10}
                style={styles.close}
              >
                <X size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.disclaimer}>{QURAN_DISCLAIMER}</Text>
              <View style={styles.statsRow}>
                <Text style={styles.statText}>
                  {TOTAL_SURAHS} surahs · {TOTAL_AYAHS} ayahs
                </Text>
              </View>
              <Text style={styles.credit}>
                Arabic: Uthmani (Ḥafṣ ʿan ʿĀṣim). Translation: Saheeh
                International. A Latin transliteration is included.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  top: { paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing['3xl'] + spacing.md,
    paddingBottom: spacing.lg,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  pressed: { opacity: 0.7 },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  headerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: -0.2,
  },
  headerSub: {
    fontFamily,
    fontSize: typography.caption.fontSize,
    color: colors.subtleForeground,
  },
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.md,
  },
  resumeIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeText: { flex: 1, gap: 2 },
  resumeKicker: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.subtleForeground,
  },
  resumeTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: colors.foreground,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  tabTextActive: { color: colors.primaryForeground },
  searchWrap: { marginBottom: spacing.md },
  listWrap: { flex: 1 },
  empty: { paddingHorizontal: spacing.lg, paddingVertical: spacing['2xl'] },
  emptyText: {
    fontFamily,
    fontSize: 14,
    color: colors.subtleForeground,
    textAlign: 'center',
  },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    maxHeight: '80%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  close: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardElevated,
  },
  disclaimer: {
    fontFamily,
    fontSize: 14,
    lineHeight: 22,
    color: colors.mutedForeground,
  },
  statsRow: { marginTop: spacing.lg },
  statText: {
    fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  credit: {
    fontFamily,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.subtleForeground,
    marginTop: spacing.sm,
  },
});
