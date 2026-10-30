/**
 * HadithScreen — the Sunnah hub (F18).
 *
 * Hadith of the Day, the collections (bundled + downloadable), browse-by-theme,
 * a forgiving search over the bundled core, saved narrations, and the download
 * library — with the authenticity filter respected throughout. Fully offline for
 * the bundled collections; downloaded books then read offline too.
 */
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  BookOpenText,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Feather,
  Gem,
  GraduationCap,
  HandCoins,
  Heart,
  Info,
  Library,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Smile,
  Sparkles,
  Sun,
  Target,
  Trees,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import DuaSearchBar from '../components/DuaSearchBar';
import HadithCard from '../components/hadith/HadithCard';
import HadithOfTheDayCard from '../components/hadith/HadithOfTheDayCard';
import CollectionCard from '../components/hadith/CollectionCard';
import HadithSettingsSheet from '../components/hadith/HadithSettingsSheet';
import HadithCollectionScreen from './HadithCollectionScreen';
import HadithLibraryScreen from './HadithLibraryScreen';
import useHadithSettings from '../hooks/useHadithSettings';
import useHadithBookmarks from '../hooks/useHadithBookmarks';
import useHadithLibrary from '../hooks/useHadithLibrary';
import {
  BUNDLED_HADITH,
  HADITH_COLLECTIONS,
  HADITH_TOPICS,
  filterByGrade,
  hadithById,
  hadithInTopic,
  hadithOfDay,
  searchHadith,
  topicById,
  topicCount,
  type Hadith,
} from '../lib/hadith';
import { HADITH_DISCLAIMER } from '../content/hadith';
import { arabicFont, fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const TOPIC_ICONS: Record<string, LucideIcon> = {
  Target, Gem, Sparkles, Smile, Heart, Users, ShieldCheck, HandCoins,
  GraduationCap, BookOpenText, Sun, Feather, Scale, Trees,
};

export default function HadithScreen({ onClose }: { onClose?: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const settings = useHadithSettings();
  const bookmarks = useHadithBookmarks();
  const library = useHadithLibrary();

  const [query, setQuery] = useState('');
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [view, setView] = useState<'hub' | 'bookmarks'>('hub');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [focused, setFocused] = useState<Hadith | null>(null);

  const daily = useMemo(() => hadithOfDay(), []);
  const trimmed = query.trim();
  const results = useMemo(
    () => (trimmed ? filterByGrade(searchHadith(trimmed), settings.authenticOnly) : []),
    [trimmed, settings.authenticOnly],
  );
  const topicList = useMemo(
    () => (topicId ? filterByGrade(hadithInTopic(topicId), settings.authenticOnly) : []),
    [topicId, settings.authenticOnly],
  );
  const bookmarked = useMemo(
    () => bookmarks.ids.map((id) => hadithById(id)).filter((h): h is Hadith => !!h),
    [bookmarks.ids],
  );

  // Full-screen overlays.
  if (collectionId) {
    return (
      <HadithCollectionScreen
        collectionId={collectionId}
        settings={settings}
        bookmarks={bookmarks}
        onOpenSettings={() => setSettingsOpen(true)}
        onClose={() => setCollectionId(null)}
      />
    );
  }
  if (libraryOpen) {
    return <HadithLibraryScreen library={library} onClose={() => setLibraryOpen(false)} />;
  }

  const card = (h: Hadith) => (
    <HadithCard
      key={h.id}
      hadith={h}
      arabicFontSize={settings.arabicFontSize}
      showTranslation={settings.showTranslation}
      showIsnad={settings.showIsnad}
      isBookmarked={bookmarks.isBookmarked(h.id)}
      onToggleBookmark={() => bookmarks.toggle(h.id)}
    />
  );

  const inTopic = topicId ? topicById(topicId) : null;
  const showingList = !!trimmed || !!topicId || view === 'bookmarks';
  const headerTitle = inTopic ? inTopic.title : view === 'bookmarks' ? 'Bookmarks' : 'Hadith';

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        {topicId || view === 'bookmarks' ? (
          <Pressable
            onPress={() => {
              setTopicId(null);
              setView('hub');
            }}
            hitSlop={12}
            style={styles.iconBtn}
          >
            <ChevronLeft size={20} color={colors.mutedForeground} strokeWidth={2.25} />
          </Pressable>
        ) : (
          <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
            <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
          </Pressable>
        )}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {inTopic ? inTopic.arabic : 'The Sunnah of the Prophet ﷺ'}
          </Text>
        </View>
        <Pressable onPress={() => setSettingsOpen(true)} hitSlop={12} style={styles.iconBtn}>
          <SlidersHorizontal size={18} color={colors.mutedForeground} strokeWidth={2.2} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Search (hub only) */}
        {!showingList ? (
          <DuaSearchBar value={query} onChangeText={setQuery} placeholder="Search the Sunnah…" />
        ) : null}

        {/* Search results */}
        {trimmed ? (
          results.length ? (
            results.map(card)
          ) : (
            <Text style={styles.empty}>No narrations match “{trimmed}”.</Text>
          )
        ) : null}

        {/* Topic list */}
        {topicId && !trimmed ? (topicList.length ? topicList.map(card) : <Text style={styles.empty}>Nothing here yet.</Text>) : null}

        {/* Bookmarks list */}
        {view === 'bookmarks' && !trimmed ? (
          bookmarked.length ? (
            bookmarked.map(card)
          ) : (
            <Text style={styles.empty}>No saved narrations yet. Tap the bookmark on any hadith.</Text>
          )
        ) : null}

        {/* Hub */}
        {!showingList ? (
          <>
            <HadithOfTheDayCard hadith={daily} onOpen={() => setFocused(daily)} />

            <Text style={styles.sectionLabel}>Collections</Text>
            <View style={styles.group}>
              {HADITH_COLLECTIONS.map((c) => (
                <CollectionCard
                  key={c.id}
                  collection={c}
                  downloaded={library.isDownloaded(c.id)}
                  busy={library.isBusy(c.id)}
                  onOpen={() => {
                    if (c.availability === 'bundled' || library.isDownloaded(c.id)) setCollectionId(c.id);
                    else setLibraryOpen(true);
                  }}
                  onDownload={() => library.download(c)}
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>Browse by theme</Text>
            <View style={styles.topics}>
              {HADITH_TOPICS.map((t) => {
                const Icon = TOPIC_ICONS[t.icon] ?? Sparkles;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => setTopicId(t.id)}
                    style={({ pressed }) => [styles.topic, pressed && styles.pressed]}
                    accessibilityRole="button"
                    accessibilityLabel={t.title}
                  >
                    <Icon size={18} color={colors.primary} strokeWidth={2} />
                    <Text style={styles.topicTitle} numberOfLines={1}>
                      {t.title}
                    </Text>
                    <Text style={styles.topicCount}>{topicCount(t.id)}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable onPress={() => setView('bookmarks')} style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}>
              <Bookmark size={18} color={colors.primary} strokeWidth={2} />
              <Text style={styles.linkText}>Bookmarks</Text>
              <Text style={styles.linkCount}>{bookmarks.ids.length}</Text>
              <ChevronRight size={16} color={colors.subtleForeground} strokeWidth={2} />
            </Pressable>
            <Pressable onPress={() => setLibraryOpen(true)} style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}>
              <Library size={18} color={colors.primary} strokeWidth={2} />
              <Text style={styles.linkText}>Manage library</Text>
              <ChevronRight size={16} color={colors.subtleForeground} strokeWidth={2} />
            </Pressable>

            <Pressable onPress={() => setInfoOpen(true)} style={styles.aboutRow}>
              <Info size={13} color={colors.subtleForeground} strokeWidth={2} />
              <Text style={styles.aboutText}>About the gradings</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>

      {/* Focused (daily) hadith */}
      <Modal visible={focused != null} transparent animationType="slide" onRequestClose={() => setFocused(null)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setFocused(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.handle} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              {focused ? card(focused) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <HadithSettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} />

      {/* About / disclaimer */}
      <Modal visible={infoOpen} transparent animationType="slide" onRequestClose={() => setInfoOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setInfoOpen(false)} />
          <View style={styles.infoSheet}>
            <View style={styles.handle} />
            <View style={styles.infoHead}>
              <Text style={styles.infoTitle}>About the gradings</Text>
              <Pressable onPress={() => setInfoOpen(false)} hitSlop={12} style={styles.close}>
                <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
              </Pressable>
            </View>
            <Text style={styles.infoText}>{HADITH_DISCLAIMER}</Text>
          </View>
        </View>
      </Modal>
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
    scroll: { paddingBottom: spacing['2xl'], gap: spacing.md },
    empty: { fontFamily, fontSize: 14, color: colors.mutedForeground, textAlign: 'center', paddingVertical: spacing['2xl'] },
    sectionLabel: {
      ...typography.button,
      fontSize: 12,
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginTop: spacing.xs,
    },
    group: { gap: spacing.sm },
    topics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    topic: {
      flexGrow: 1,
      flexBasis: '46%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    topicTitle: { flex: 1, minWidth: 0, fontFamily, fontSize: 13, fontWeight: '600', color: colors.foreground },
    topicCount: { fontFamily, fontSize: 12, fontWeight: '700', color: colors.subtleForeground },
    pressed: { opacity: 0.85 },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    linkText: { flex: 1, ...typography.button, fontSize: 14, color: colors.foreground },
    linkCount: { fontFamily, fontSize: 13, fontWeight: '700', color: colors.primary },
    aboutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: spacing.sm },
    aboutText: { fontFamily, fontSize: 12, color: colors.subtleForeground },
    modalRoot: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
    modalSheet: {
      maxHeight: '88%',
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
    modalContent: { paddingBottom: spacing.lg },
    infoSheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    infoHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
    infoTitle: { ...typography.title, fontSize: 18, color: colors.foreground },
    close: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    infoText: { fontFamily, fontSize: 13, lineHeight: 20, color: colors.mutedForeground },
  });
