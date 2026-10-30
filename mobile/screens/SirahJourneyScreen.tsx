/**
 * SirahJourneyScreen — the flagship Sīrah hub (F20).
 *
 * A daily moment from the Sīrah, a forgiving search, an era switcher, and the
 * graded vertical timeline of the Prophet's ﷺ whole life. Tapping an event opens
 * its full, evidence-cited account; reading progress is remembered.
 */
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bookmark, Info, X } from 'lucide-react-native';
import DuaSearchBar from '../components/DuaSearchBar';
import SirahTimeline from '../components/sirah/SirahTimeline';
import EventOfDayCard from '../components/sirah/EventOfDayCard';
import SirahPersonSheet from '../components/sirah/SirahPersonSheet';
import SirahEventScreen from './SirahEventScreen';
import useSirahProgress from '../hooks/useSirahProgress';
import {
  SIRAH_EVENTS,
  SIRAH_ERAS,
  SIRAH_DISCLAIMER,
  SIRAH_SOURCES,
  searchSirah,
  sirahOfDay,
  eventsByEra,
  type SirahEvent,
  type SirahPerson,
} from '../lib/sirah';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';

export default function SirahJourneyScreen({
  onNavigate,
  onClose,
}: {
  onNavigate?: (key: string) => void;
  onClose?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const progress = useSirahProgress();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [era, setEra] = useState<string>('all');
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [person, setPerson] = useState<SirahPerson | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const eventOfDay = useMemo(() => sirahOfDay(), []);
  const trimmed = query.trim();

  const events: SirahEvent[] = useMemo(() => {
    if (trimmed) return searchSirah(trimmed);
    if (showBookmarks) return SIRAH_EVENTS.filter((e) => progress.isBookmarked(e.id));
    if (era !== 'all') return eventsByEra(era);
    return SIRAH_EVENTS;
  }, [trimmed, showBookmarks, era, progress]);

  const active = activeId ? SIRAH_EVENTS.find((e) => e.id === activeId) ?? null : null;

  // The full account replaces the hub when an event is open.
  if (active) {
    const idx = SIRAH_EVENTS.findIndex((e) => e.id === active.id);
    const prev = idx > 0 ? SIRAH_EVENTS[idx - 1] : null;
    const next = idx < SIRAH_EVENTS.length - 1 ? SIRAH_EVENTS[idx + 1] : null;
    return (
      <>
        <SirahEventScreen
          event={active}
          isBookmarked={progress.isBookmarked(active.id)}
          onToggleBookmark={() => progress.toggleBookmark(active.id)}
          onMarkRead={progress.markRead}
          onOpenPerson={setPerson}
          onOpenQuran={() => onNavigate?.('quran')}
          onOpenHadith={() => onNavigate?.('hadith')}
          onClose={() => setActiveId(null)}
          onPrev={prev ? () => setActiveId(prev.id) : undefined}
          onNext={next ? () => setActiveId(next.id) : undefined}
        />
        <SirahPersonSheet person={person} onClose={() => setPerson(null)} />
      </>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>The Sīrah</Text>
          <Text style={styles.headerSub}>The life of the Prophet ﷺ</Text>
        </View>
        <Pressable onPress={() => setInfoOpen(true)} hitSlop={12} style={styles.iconBtn}>
          <Info size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <DuaSearchBar value={query} onChangeText={setQuery} placeholder="Search the Sīrah…" />

        {!trimmed ? (
          <>
            <EventOfDayCard event={eventOfDay} onOpen={() => setActiveId(eventOfDay.id)} />

            {/* Era switcher */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eraBar}>
              <EraChip label="All" active={era === 'all' && !showBookmarks} onPress={() => { setEra('all'); setShowBookmarks(false); }} styles={styles} />
              {SIRAH_ERAS.map((e) => (
                <EraChip key={e.id} label={e.title} active={era === e.id && !showBookmarks} onPress={() => { setEra(e.id); setShowBookmarks(false); }} styles={styles} />
              ))}
              <EraChip label="★ Saved" active={showBookmarks} onPress={() => setShowBookmarks((v) => !v)} styles={styles} />
            </ScrollView>
          </>
        ) : null}

        {events.length === 0 ? (
          <View style={styles.empty}>
            <Bookmark size={24} color={colors.subtleForeground} strokeWidth={1.8} />
            <Text style={styles.emptyText}>
              {showBookmarks ? 'No saved events yet — bookmark an account to find it here.' : `Nothing matches “${trimmed}”.`}
            </Text>
          </View>
        ) : (
          <SirahTimeline events={events} isRead={progress.isRead} onSelect={(e) => setActiveId(e.id)} />
        )}
      </ScrollView>

      {/* About / doctrine sheet */}
      <Modal visible={infoOpen} transparent animationType="slide" onRequestClose={() => setInfoOpen(false)}>
        <View style={styles.infoRoot}>
          <Pressable style={styles.backdrop} onPress={() => setInfoOpen(false)} />
          <View style={styles.infoSheet}>
            <View style={styles.handle} />
            <View style={styles.infoHeader}>
              <Text style={styles.infoTitle}>How this Sīrah is graded</Text>
              <Pressable onPress={() => setInfoOpen(false)} hitSlop={12} style={styles.close}>
                <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.infoContent}>
              {SIRAH_SOURCES.map((s) => (
                <View key={s.tier} style={styles.sourceRow}>
                  <Text style={styles.sourceTier}>{s.tier}</Text>
                  <Text style={styles.sourceDetail}>{s.detail}</Text>
                </View>
              ))}
              <View style={styles.disclaimer}>
                <Text style={styles.disclaimerText}>{SIRAH_DISCLAIMER}</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <SirahPersonSheet person={person} onClose={() => setPerson(null)} />
    </View>
  );
}

function EraChip({ label, active, onPress, styles }: { label: string; active: boolean; onPress: () => void; styles: ReturnType<typeof makeStyles> }) {
  return (
    <Pressable onPress={onPress} style={[styles.eraChip, active && styles.eraChipActive]}>
      <Text style={[styles.eraChipText, active && styles.eraChipTextActive]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
    header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingTop: spacing['3xl'] + spacing.md, paddingBottom: spacing.lg },
    iconBtn: { width: 40, height: 40, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
    headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
    headerTitle: { fontFamily, fontSize: 17, fontWeight: '700', color: colors.foreground },
    headerSub: { fontFamily, fontSize: typography.caption.fontSize, color: colors.subtleForeground },
    scroll: { paddingBottom: spacing['2xl'], gap: spacing.md },
    eraBar: { gap: spacing.sm, paddingVertical: 2, paddingRight: spacing.lg },
    eraChip: { paddingVertical: 7, paddingHorizontal: spacing.md, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    eraChipActive: { borderColor: colors.primary, backgroundColor: colors.cardElevated },
    eraChipText: { ...typography.label, color: colors.mutedForeground },
    eraChipTextActive: { color: colors.foreground },
    empty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing['3xl'] },
    emptyText: { fontFamily, fontSize: 14, lineHeight: 20, color: colors.mutedForeground, textAlign: 'center', paddingHorizontal: spacing.xl },
    infoRoot: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
    infoSheet: { maxHeight: '80%', backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
    infoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
    infoTitle: { ...typography.title, fontSize: 18, color: colors.foreground },
    close: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    infoContent: { gap: spacing.md, paddingBottom: spacing.lg },
    sourceRow: { gap: 2 },
    sourceTier: { ...typography.button, fontSize: 14, color: colors.primary },
    sourceDetail: { fontFamily, fontSize: 13, lineHeight: 19, color: colors.mutedForeground },
    disclaimer: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.cardElevated, borderWidth: 1, borderColor: colors.border, marginTop: spacing.sm },
    disclaimerText: { fontFamily, fontSize: 12, lineHeight: 18, color: colors.subtleForeground },
  });
