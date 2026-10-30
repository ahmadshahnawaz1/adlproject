/**
 * NamesScreen — al-Asmāʾ al-Ḥusnā, the ninety-nine Beautiful Names (F21).
 *
 * A day's name to sit with, a memorisation drill, forgiving search, and the
 * full list browsable either in order or grouped by theme. Progress (memorised
 * and favourited) is remembered. Fully offline.
 */
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Brain, Heart, Info, Layers, List, X } from 'lucide-react-native';
import AppText from '../components/ui/AppText';
import DuaSearchBar from '../components/DuaSearchBar';
import NameCard from '../components/names/NameCard';
import NameOfDayCard from '../components/names/NameOfDayCard';
import NameDetailSheet from '../components/names/NameDetailSheet';
import NameQuizSheet from '../components/names/NameQuizSheet';
import useNamesProgress from '../hooks/useNamesProgress';
import {
  DIVINE_NAMES,
  TOTAL_NAMES,
  groupedByTheme,
  memorisedFraction,
  nameOfDay,
  searchNames,
  type DivineName,
} from '../lib/names';
import { NAMES_DISCLAIMER, NAMES_SOURCE_NOTE, NAMES_VIRTUE } from '../content/names';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

type Mode = 'list' | 'themes' | 'saved';

export default function NamesScreen({
  onNavigate,
  onClose,
}: {
  onNavigate?: (key: string) => void;
  onClose?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const progress = useNamesProgress();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<Mode>('list');
  const [active, setActive] = useState<DivineName | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const trimmed = query.trim();
  const today = useMemo(() => nameOfDay(), []);
  const hits = useMemo(() => (trimmed ? searchNames(trimmed) : []), [trimmed]);
  const groups = useMemo(() => groupedByTheme(), []);
  const saved = useMemo(
    () => DIVINE_NAMES.filter((n) => progress.favourites.has(n.id)),
    [progress.favourites],
  );

  const memorisedCount = progress.memorised.size;
  const percent = Math.round(memorisedFraction(memorisedCount) * 100);

  // Drill the names not yet memorised; once all are done, drill everything.
  const quizPool = useMemo(() => {
    const remaining = DIVINE_NAMES.filter((n) => !progress.memorised.has(n.id));
    return remaining.length >= 4 ? remaining : DIVINE_NAMES;
  }, [progress.memorised]);

  const renderCard = (name: DivineName) => (
    <NameCard
      key={name.id}
      name={name}
      memorised={progress.memorised.has(name.id)}
      favourite={progress.favourites.has(name.id)}
      onPress={() => setActive(name)}
    />
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Close">
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <AppText style={styles.headerTitle}>The 99 Names</AppText>
          <AppText style={styles.headerSub} numberOfLines={1}>
            {memorisedCount} / {TOTAL_NAMES} memorised · {percent}%
          </AppText>
        </View>
        <Pressable onPress={() => setInfoOpen(true)} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="About the names">
          <Info size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <DuaSearchBar value={query} onChangeText={setQuery} placeholder="Search the names…" />

        {trimmed ? (
          <View style={styles.list}>
            {hits.length === 0 ? (
              <AppText style={styles.empty}>No name matches “{trimmed}”.</AppText>
            ) : (
              hits.map(renderCard)
            )}
          </View>
        ) : (
          <>
            <NameOfDayCard name={today} onOpen={() => setActive(today)} />

            <View style={styles.progressCard}>
              <View style={styles.progressTop}>
                <AppText style={styles.progressLabel}>Memorisation</AppText>
                <AppText style={styles.progressValue}>{percent}%</AppText>
              </View>
              <View style={styles.rail}>
                <View style={[styles.railFill, { width: `${percent}%` }]} />
              </View>
              <Pressable
                onPress={() => setQuizOpen(true)}
                style={({ pressed }) => [styles.quizBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Start memorisation practice"
              >
                <Brain size={16} color={colors.primaryForeground} strokeWidth={2.2} />
                <AppText style={styles.quizText}>Practise</AppText>
              </Pressable>
            </View>

            <View style={styles.tabs}>
              <ModeTab icon={<List size={15} color={mode === 'list' ? colors.primaryForeground : colors.mutedForeground} strokeWidth={2.2} />} label="In order" active={mode === 'list'} onPress={() => setMode('list')} />
              <ModeTab icon={<Layers size={15} color={mode === 'themes' ? colors.primaryForeground : colors.mutedForeground} strokeWidth={2.2} />} label="Themes" active={mode === 'themes'} onPress={() => setMode('themes')} />
              <ModeTab icon={<Heart size={15} color={mode === 'saved' ? colors.primaryForeground : colors.mutedForeground} strokeWidth={2.2} />} label="Saved" active={mode === 'saved'} onPress={() => setMode('saved')} />
            </View>

            {mode === 'list' ? (
              <View style={styles.list}>{DIVINE_NAMES.map(renderCard)}</View>
            ) : mode === 'themes' ? (
              <View style={styles.groups}>
                {groups.map((group) => (
                  <View key={group.theme.id} style={styles.group}>
                    <View style={styles.groupHead}>
                      <AppText style={styles.groupTitle}>{group.theme.title}</AppText>
                      <AppText style={styles.groupArabic}>{group.theme.arabic}</AppText>
                    </View>
                    <AppText style={styles.groupBlurb}>{group.theme.blurb}</AppText>
                    <View style={styles.list}>{group.names.map(renderCard)}</View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.list}>
                {saved.length === 0 ? (
                  <AppText style={styles.empty}>
                    No saved names yet. Open a name and tap the heart to keep it here.
                  </AppText>
                ) : (
                  saved.map(renderCard)
                )}
              </View>
            )}

            <AppText style={styles.disclaimer}>{NAMES_DISCLAIMER}</AppText>
          </>
        )}
      </ScrollView>

      <NameDetailSheet
        name={active}
        memorised={active ? progress.memorised.has(active.id) : false}
        favourite={active ? progress.favourites.has(active.id) : false}
        onToggleMemorised={() => active && progress.toggleMemorised(active.id)}
        onToggleFavourite={() => active && progress.toggleFavourite(active.id)}
        onOpenQuran={active?.quranRef && onNavigate ? () => { setActive(null); onNavigate('quran'); } : undefined}
        onClose={() => setActive(null)}
      />

      <NameQuizSheet
        visible={quizOpen}
        pool={quizPool}
        onClose={() => setQuizOpen(false)}
        onCorrect={(id) => {
          if (!progress.memorised.has(id)) progress.toggleMemorised(id);
        }}
      />

      <Modal visible={infoOpen} transparent animationType="slide" onRequestClose={() => setInfoOpen(false)}>
        <View style={styles.infoRoot}>
          <Pressable style={styles.backdrop} onPress={() => setInfoOpen(false)} accessibilityLabel="Close" />
          <View style={styles.infoSheet}>
            <View style={styles.handle} />
            <View style={styles.infoHeader}>
              <AppText style={styles.infoTitle}>About the Names</AppText>
              <Pressable onPress={() => setInfoOpen(false)} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Close">
                <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.infoContent}>
              <View style={styles.virtue}>
                <AppText style={styles.virtueText}>“{NAMES_VIRTUE.text}”</AppText>
                <AppText style={styles.virtueRef}>{NAMES_VIRTUE.reference}</AppText>
              </View>
              <AppText style={styles.infoBody}>{NAMES_VIRTUE.note}</AppText>
              <AppText style={styles.infoLabel}>ON THE ENUMERATION</AppText>
              <AppText style={styles.infoBody}>{NAMES_SOURCE_NOTE}</AppText>
              <View style={styles.infoDisclaimer}>
                <AppText style={styles.infoDisclaimerText}>{NAMES_DISCLAIMER}</AppText>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ModeTab({
  icon,
  label,
  active,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tab, active && styles.tabActive, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      {icon}
      <AppText style={[styles.tabText, active && styles.tabTextActive]}>{label}</AppText>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingTop: spacing['3xl'] + spacing.md,
      paddingBottom: spacing.md,
    },
    iconBtn: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerCenter: { flex: 1, alignItems: 'center', gap: 1 },
    headerTitle: { fontFamily, fontSize: 16, fontWeight: '700', color: colors.foreground },
    headerSub: { fontFamily, fontSize: 11, color: colors.subtleForeground },
    scroll: { paddingBottom: spacing['3xl'], gap: spacing.lg },
    list: { gap: spacing.sm },
    empty: {
      fontFamily,
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: 'center',
      paddingVertical: spacing.xl,
    },
    progressCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    progressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    progressLabel: { ...typography.label, color: colors.foreground },
    progressValue: { ...typography.label, color: colors.primary },
    rail: { height: 6, borderRadius: 3, backgroundColor: colors.input, overflow: 'hidden' },
    railFill: { height: '100%', borderRadius: 3, backgroundColor: colors.primary },
    quizBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      marginTop: spacing.xs,
      minHeight: 44,
    },
    quizText: { ...typography.button, color: colors.primaryForeground },
    tabs: { flexDirection: 'row', gap: spacing.sm },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      minHeight: 42,
    },
    tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    tabText: { fontFamily, fontSize: 13, color: colors.mutedForeground },
    tabTextActive: { color: colors.primaryForeground, fontWeight: '600' },
    groups: { gap: spacing.xl },
    group: { gap: spacing.sm },
    groupHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    groupTitle: { ...typography.title, fontSize: 16, color: colors.foreground },
    groupArabic: { fontFamily, fontSize: 15, color: colors.primary },
    groupBlurb: { fontFamily, fontSize: 13, color: colors.mutedForeground, marginBottom: spacing.xs },
    disclaimer: {
      fontFamily,
      fontSize: 12,
      lineHeight: 18,
      color: colors.subtleForeground,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    infoRoot: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
    infoSheet: {
      maxHeight: '85%',
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    infoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    infoTitle: { ...typography.title, fontSize: 18, color: colors.foreground },
    infoContent: { paddingVertical: spacing.md, gap: spacing.md },
    virtue: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: `${colors.primary}44`,
      backgroundColor: `${colors.primary}0F`,
      padding: spacing.md,
      gap: 6,
    },
    virtueText: { fontFamily, fontSize: 15, lineHeight: 23, color: colors.foreground },
    virtueRef: { ...typography.caption, fontSize: 11, color: colors.primary },
    infoLabel: {
      ...typography.caption,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.subtleForeground,
    },
    infoBody: { fontFamily, fontSize: 14, lineHeight: 22, color: colors.mutedForeground },
    infoDisclaimer: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.md,
    },
    infoDisclaimerText: { fontFamily, fontSize: 12, lineHeight: 19, color: colors.subtleForeground },
    pressed: { opacity: 0.85 },
  });
