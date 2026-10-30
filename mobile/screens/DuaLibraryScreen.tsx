/**
 * DuaLibraryScreen — a quiet library of authentic supplications for the whole
 * of a day and a life: from waking, eating and leaving home, through travel,
 * rain and distress, to forgiveness, protection, guidance, health, provision,
 * and the duʿās of the Qurʾān and the Prophet ﷺ.
 *
 * Browse opens onto themed sections; tap one to read its supplications — Arabic,
 * transliteration, meaning, the times it is said, its virtue, and (always) the
 * evidence. Search is forgiving of diacritics and case, so “dua yunus”, “rain”
 * or “istikhara” all land. Star any duʿāʾ to keep it in Favourites. Fully
 * offline; every supplication is sourced.
 */
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BookOpen, ChevronLeft, ChevronRight, Heart, Info, ShieldCheck, Sparkles, X } from 'lucide-react-native';
import DuaCard from '../components/DuaCard';
import DuaCategoryGrid from '../components/DuaCategoryGrid';
import DuaSearchBar from '../components/DuaSearchBar';
import useDuaFavorites from '../hooks/useDuaFavorites';
import {
  DUA_CATEGORIES,
  categoryById,
  categoryCount,
  duasInCategory,
  matchesQuery,
  searchDuas,
  type Dua,
  type DuaCategoryId,
} from '../lib/duaSearch';
import { DUA_LIBRARY_DISCLAIMER } from '../content/duas-library';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function DuaLibraryScreen({ onClose }: { onClose?: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { ready, favorites, count, isFavorite, toggle } = useDuaFavorites();
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<DuaCategoryId | null>(null);
  const [view, setView] = useState<'browse' | 'favorites'>('browse');
  const [infoOpen, setInfoOpen] = useState(false);

  const trimmed = query.trim();

  // What the body shows. `null` means the browse board (the category grid);
  // anything else is a list of supplications — a category, the favourites, or
  // a search across the catalogue (optionally narrowed to a category).
  const results = useMemo<Dua[] | null>(() => {
    if (view === 'favorites') {
      return trimmed ? favorites.filter((d) => matchesQuery(d, query)) : favorites;
    }
    if (trimmed) return searchDuas(query, categoryId ?? undefined);
    if (categoryId) return duasInCategory(categoryId);
    return null;
  }, [view, trimmed, query, categoryId, favorites]);

  const showGrid = results === null;
  const activeCategory = categoryId ? categoryById(categoryId) : undefined;

  const title = view === 'favorites' ? 'Favourites' : activeCategory ? activeCategory.title : 'Duʿāʾ';
  const subtitle =
    view === 'favorites'
      ? 'Your starred supplications'
      : activeCategory
        ? activeCategory.arabic
        : 'Supplications for every moment';

  function goBrowse() {
    setView('browse');
    setCategoryId(null);
    setQuery('');
  }

  function openCategory(id: DuaCategoryId) {
    setCategoryId(id);
    setView('browse');
    setQuery('');
  }

  function openFavorites() {
    setView('favorites');
    setCategoryId(null);
    setQuery('');
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <Pressable onPress={() => setInfoOpen(true)} hitSlop={12} style={styles.iconBtn}>
          <Info size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <DuaSearchBar value={query} onChangeText={setQuery} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {!showGrid ? (
          <Pressable onPress={goBrowse} hitSlop={6} style={styles.backRow}>
            <ChevronLeft size={16} color={colors.mutedForeground} strokeWidth={2.25} />
            <Text style={styles.backText}>All supplications</Text>
          </Pressable>
        ) : null}

        {showGrid ? (
          <>
            {ready && count > 0 ? (
              <Pressable
                onPress={openFavorites}
                style={({ pressed }) => [styles.favRow, pressed && styles.favRowPressed]}
              >
                <View style={styles.favIcon}>
                  <Heart size={18} color={colors.primary} fill={colors.primary} strokeWidth={2} />
                </View>
                <View style={styles.favText}>
                  <Text style={styles.favTitle}>Favourites</Text>
                  <Text style={styles.favSub}>
                    {count} saved {count === 1 ? 'supplication' : 'supplications'}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2.25} />
              </Pressable>
            ) : null}

            <DuaCategoryGrid categories={DUA_CATEGORIES} count={categoryCount} onSelect={openCategory} />
          </>
        ) : results && results.length > 0 ? (
          <>
            <Text style={styles.resultCount}>
              {results.length} {results.length === 1 ? 'supplication' : 'supplications'}
            </Text>
            {results.map((d) => (
              <DuaCard
                key={d.id}
                dua={d}
                isFavorite={isFavorite(d.id)}
                onToggleFavorite={() => toggle(d.id)}
              />
            ))}
          </>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              {view === 'favorites' ? (
                <Heart size={22} color={colors.subtleForeground} strokeWidth={2} />
              ) : (
                <BookOpen size={22} color={colors.subtleForeground} strokeWidth={2} />
              )}
            </View>
            <Text style={styles.emptyText}>
              {view === 'favorites'
                ? 'No favourites yet. Tap the heart on any supplication to keep it here.'
                : `Nothing matches “${trimmed}”. Try another word.`}
            </Text>
          </View>
        )}

        <Text style={styles.disclaimer}>{DUA_LIBRARY_DISCLAIMER}</Text>
      </ScrollView>

      {/* Info sheet */}
      <Modal visible={infoOpen} transparent animationType="slide" onRequestClose={() => setInfoOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setInfoOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>About the library</Text>
            <Pressable onPress={() => setInfoOpen(false)} hitSlop={12} style={styles.close}>
              <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            <Text style={styles.sheetLead}>
              A collection of authentic supplications drawn from the Qurʾān and the Sunnah, arranged
              by the moments of a day and the states of a heart.
            </Text>
            <View style={styles.sheetRow}>
              <View style={styles.sheetDot}>
                <Sparkles size={14} color={colors.primary} strokeWidth={2.4} />
              </View>
              <Text style={styles.sheetRowText}>
                Each supplication carries its Arabic, transliteration, meaning, when it is said, and
                the evidence behind it.
              </Text>
            </View>
            <View style={styles.sheetRow}>
              <View style={styles.sheetDot}>
                <Heart size={14} color={colors.primary} strokeWidth={2.4} />
              </View>
              <Text style={styles.sheetRowText}>
                Tap the heart on any duʿāʾ to keep it in Favourites; search is forgiving of
                diacritics and case.
              </Text>
            </View>
            <View style={styles.sheetRow}>
              <View style={styles.sheetDot}>
                <ShieldCheck size={14} color={colors.primary} strokeWidth={2.4} />
              </View>
              <Text style={styles.sheetRowText}>
                Everything works fully offline — no account, no network, nothing tracked.
              </Text>
            </View>
            <View style={styles.sheetDisclaimer}>
              <Text style={styles.sheetDisclaimerText}>{DUA_LIBRARY_DISCLAIMER}</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
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
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  headerTitle: { fontFamily, fontSize: 17, fontWeight: '700', color: colors.foreground },
  headerSub: { fontFamily, fontSize: typography.caption.fontSize, color: colors.subtleForeground },

  searchWrap: { marginBottom: spacing.md },

  scroll: { paddingBottom: spacing.xl, gap: spacing.md },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 2 },
  backText: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '600', color: colors.mutedForeground },

  favRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.primary}55`,
    backgroundColor: `${colors.primary}14`,
  },
  favRowPressed: { opacity: 0.85 },
  favIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favText: { flex: 1, gap: 2 },
  favTitle: { fontFamily, fontSize: 15, fontWeight: '700', color: colors.foreground },
  favSub: { fontFamily, fontSize: typography.caption.fontSize, color: colors.mutedForeground },

  resultCount: { fontFamily, fontSize: typography.caption.fontSize, color: colors.subtleForeground },

  empty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing['2xl'] },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily,
    fontSize: typography.body.fontSize,
    lineHeight: 21,
    color: colors.mutedForeground,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },

  disclaimer: { fontFamily, fontSize: 12, lineHeight: 18, color: colors.subtleForeground, textAlign: 'center', marginTop: spacing.sm },

  // info sheet
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sheetTitle: { ...typography.title, color: colors.foreground },
  close: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.cardElevated,
  },
  sheetContent: { paddingBottom: spacing.lg, gap: spacing.md },
  sheetLead: { fontFamily, fontSize: typography.body.fontSize, lineHeight: 22, color: colors.mutedForeground },
  sheetRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  sheetDot: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  sheetRowText: { flex: 1, fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.mutedForeground },
  sheetDisclaimer: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
  },
  sheetDisclaimerText: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.subtleForeground },
});
