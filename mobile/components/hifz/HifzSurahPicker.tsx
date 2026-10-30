/**
 * HifzSurahPicker — choose what to memorise.
 *
 * Defaults to the short surahs of the last juzʾ, which is where most memorisers
 * begin, with a search across the whole muṣḥaf and a progress bar per surah.
 */
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { X } from 'lucide-react-native';
import AppText from '../ui/AppText';
import DuaSearchBar from '../DuaSearchBar';
import { SURAHS } from '../../content/quran';
import { searchSurahs } from '../../lib/quran';
import { surahProgress, type ReviewMap } from '../../lib/hifz';
import { arabicFont, fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

/** Juzʾ ʿAmma begins at an-Nabaʾ (78) — where most memorisers start. */
const SHORT_SURAH_START = 78;

export default function HifzSurahPicker({
  visible,
  reviews,
  onSelect,
  onClose,
}: {
  visible: boolean;
  reviews: ReviewMap;
  onSelect: (surah: number) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const trimmed = query.trim();
  const list = useMemo(() => {
    if (trimmed) return searchSurahs(trimmed);
    const all = [...SURAHS];
    return showAll ? all : all.filter((s) => s.number >= SHORT_SURAH_START);
  }, [trimmed, showAll]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <AppText style={styles.title}>Choose a surah</AppText>
            <Pressable onPress={onClose} hitSlop={12} style={styles.close} accessibilityRole="button" accessibilityLabel="Close">
              <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
            </Pressable>
          </View>

          <DuaSearchBar value={query} onChangeText={setQuery} placeholder="Search surahs…" />

          {!trimmed ? (
            <Pressable
              onPress={() => setShowAll((v) => !v)}
              style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={showAll ? 'Show only the short surahs' : 'Show all 114 surahs'}
            >
              <AppText style={styles.toggleText}>
                {showAll ? 'Showing all 114 · show short surahs' : 'Showing Juzʾ ʿAmma · show all 114'}
              </AppText>
            </Pressable>
          ) : null}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {list.length === 0 ? (
              <AppText style={styles.empty}>No surah matches “{trimmed}”.</AppText>
            ) : (
              list.map((s) => {
                const p = surahProgress(reviews, s.number);
                const percent = Math.round(p.fraction * 100);
                return (
                  <Pressable
                    key={s.number}
                    onPress={() => {
                      onSelect(s.number);
                      onClose();
                    }}
                    style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                    accessibilityRole="button"
                    accessibilityLabel={`${s.name}, ${s.ayahCount} āyahs, ${percent} percent memorised`}
                  >
                    <View style={styles.numWrap}>
                      <AppText style={styles.num}>{s.number}</AppText>
                    </View>
                    <View style={styles.rowBody}>
                      <AppText style={styles.name} numberOfLines={1}>{s.name}</AppText>
                      <AppText style={styles.meta}>
                        {s.ayahCount} āyahs{percent > 0 ? ` · ${percent}% memorised` : ''}
                      </AppText>
                      {percent > 0 ? (
                        <View style={styles.rail}>
                          <View style={[styles.railFill, { width: `${percent}%` }]} />
                        </View>
                      ) : null}
                    </View>
                    <AppText style={styles.arabic} numberOfLines={1}>{s.arabicName}</AppText>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
    sheet: {
      maxHeight: '85%',
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.sm,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { ...typography.title, fontSize: 18, color: colors.foreground },
    close: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggle: { alignSelf: 'center', paddingVertical: spacing.xs },
    toggleText: { ...typography.caption, fontSize: 11, color: colors.primary },
    list: { gap: spacing.sm, paddingBottom: spacing.lg },
    empty: {
      fontFamily,
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: 'center',
      paddingVertical: spacing.xl,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      minHeight: 62,
    },
    numWrap: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.primary}1A`,
    },
    num: { ...typography.caption, fontSize: 12, fontWeight: '700', color: colors.primary },
    rowBody: { flex: 1, minWidth: 0, gap: 3 },
    name: { fontFamily, fontSize: 15, fontWeight: '600', color: colors.foreground },
    meta: { fontFamily, fontSize: 12, color: colors.mutedForeground },
    rail: { height: 4, borderRadius: 2, backgroundColor: colors.input, overflow: 'hidden' },
    railFill: { height: '100%', borderRadius: 2, backgroundColor: colors.primary },
    arabic: { fontFamily: arabicFont, fontSize: 19, color: colors.primary },
    pressed: { opacity: 0.85 },
  });
