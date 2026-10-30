/**
 * SirahEventScreen — the full account of one Sīrah event (F20).
 *
 * The narrative (via the shared LessonView), the tappable evidence that
 * establishes it (Qurʾān + hadith deep-links), the people involved, the lessons
 * (ʿibrah), and a footer stating its grade and cited sources — the authenticity
 * always visible. Opening an event marks it read.
 */
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Users } from 'lucide-react-native';
import LessonView from '../components/learn/LessonView';
import SirahGradeBadge from '../components/sirah/SirahGradeBadge';
import SirahEvidence from '../components/sirah/SirahEvidence';
import { personById, gradeMeta } from '../lib/sirah';
import type { AyahRef, HadithRef, SirahEvent, SirahPerson } from '../lib/sirah';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import { arabicFont, fontFamily, radius, spacing, typography } from '../theme/tokens';

export default function SirahEventScreen({
  event,
  isBookmarked,
  onToggleBookmark,
  onMarkRead,
  onOpenPerson,
  onOpenQuran,
  onOpenHadith,
  onClose,
  onPrev,
  onNext,
}: {
  event: SirahEvent;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onMarkRead: (id: string) => void;
  onOpenPerson: (p: SirahPerson) => void;
  onOpenQuran?: (ref: AyahRef) => void;
  onOpenHadith?: (ref: HadithRef) => void;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  useEffect(() => {
    onMarkRead(event.id);
  }, [event.id, onMarkRead]);

  const people = (event.people ?? []).map(personById).filter(Boolean) as SirahPerson[];

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
          <ChevronLeft size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <Text style={styles.headerYear}>{event.yearLabel}</Text>
        <Pressable onPress={onToggleBookmark} hitSlop={12} style={styles.iconBtn} accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark'}>
          {isBookmarked ? <BookmarkCheck size={19} color={colors.primary} strokeWidth={2.2} /> : <Bookmark size={19} color={colors.mutedForeground} strokeWidth={2.2} />}
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.titleBlock}>
          <SirahGradeBadge grade={event.grade} />
          <Text style={styles.title}>{event.title}</Text>
          {event.arabic ? <Text style={styles.arabic}>{event.arabic}</Text> : null}
          <Text style={styles.place}>{event.place}</Text>
        </View>

        <LessonView body={event.body} />

        <SirahEvidence
          quranRefs={event.quranRefs}
          hadithRefs={event.hadithRefs}
          onOpenQuran={onOpenQuran}
          onOpenHadith={onOpenHadith}
        />

        {people.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Users size={13} color={colors.subtleForeground} strokeWidth={2.2} />
              <Text style={styles.sectionLabel}>People</Text>
            </View>
            <View style={styles.peopleRow}>
              {people.map((p) => (
                <Pressable key={p.id} onPress={() => onOpenPerson(p)} style={({ pressed }) => [styles.personChip, pressed && styles.pressed]}>
                  <Text style={styles.personName}>{p.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {event.lessons && event.lessons.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Lessons (ʿibrah)</Text>
            <View style={styles.lessons}>
              {event.lessons.map((l, i) => (
                <View key={i} style={styles.lessonRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.lessonText}>{l}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Grade & sources footer — authenticity, always stated. */}
        <View style={styles.gradeFooter}>
          <View style={styles.gradeFooterHead}>
            <SirahGradeBadge grade={event.grade} size="sm" />
            <Text style={styles.gradeLabel}>{gradeMeta(event.grade).label}</Text>
          </View>
          {event.gradeNote ? <Text style={styles.gradeNote}>{event.gradeNote}</Text> : null}
          <Text style={styles.sourcesLabel}>Sources</Text>
          {event.sources.map((s, i) => (
            <Text key={i} style={styles.sourceText}>• {s.work}{s.location ? ` — ${s.location}` : ''}</Text>
          ))}
        </View>

        <View style={styles.nav}>
          <Pressable onPress={onPrev} disabled={!onPrev} style={({ pressed }) => [styles.navBtn, !onPrev && styles.navDisabled, pressed && styles.pressed]}>
            <ChevronLeft size={17} color={onPrev ? colors.foreground : colors.subtleForeground} strokeWidth={2.2} />
            <Text style={[styles.navText, !onPrev && styles.navTextOff]}>Previous</Text>
          </Pressable>
          <Pressable onPress={onNext} disabled={!onNext} style={({ pressed }) => [styles.navBtn, styles.navNext, !onNext && styles.navDisabled, pressed && styles.pressed]}>
            <Text style={[styles.navText, styles.navNextText, !onNext && styles.navTextOff]}>Next</Text>
            <ChevronRight size={17} color={onNext ? colors.primary : colors.subtleForeground} strokeWidth={2.2} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing['3xl'] + spacing.md, paddingBottom: spacing.md },
    iconBtn: { width: 40, height: 40, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
    headerYear: { ...typography.caption, fontSize: 12, fontWeight: '700', color: colors.primary },
    scroll: { paddingBottom: spacing['2xl'], gap: spacing.lg },
    titleBlock: { gap: spacing.sm },
    title: { ...typography.title, fontSize: 24, lineHeight: 30, color: colors.foreground },
    arabic: { fontFamily: arabicFont, fontSize: 20, color: colors.primary, writingDirection: 'rtl' },
    place: { fontFamily, fontSize: 13, color: colors.subtleForeground },
    section: { gap: spacing.sm },
    sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    sectionLabel: { ...typography.caption, fontSize: 11, fontWeight: '700', color: colors.subtleForeground, textTransform: 'uppercase', letterSpacing: 0.5 },
    peopleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    personChip: { paddingVertical: 6, paddingHorizontal: spacing.md, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    pressed: { opacity: 0.8 },
    personName: { fontFamily, fontSize: 13, fontWeight: '600', color: colors.foreground },
    lessons: { gap: spacing.sm },
    lessonRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
    bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 8 },
    lessonText: { flex: 1, fontFamily, fontSize: 14, lineHeight: 22, color: colors.foreground },
    gradeFooter: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardElevated, gap: 5 },
    gradeFooterHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    gradeLabel: { ...typography.button, fontSize: 13, color: colors.foreground },
    gradeNote: { fontFamily, fontSize: 12, lineHeight: 18, color: colors.mutedForeground, fontStyle: 'italic' },
    sourcesLabel: { ...typography.caption, fontSize: 10, fontWeight: '700', color: colors.subtleForeground, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
    sourceText: { fontFamily, fontSize: 12, lineHeight: 18, color: colors.mutedForeground },
    nav: { flexDirection: 'row', gap: spacing.md, paddingTop: spacing.sm },
    navBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.md },
    navNext: { backgroundColor: colors.cardElevated, borderColor: `${colors.primary}55` },
    navDisabled: { opacity: 0.45 },
    navText: { ...typography.button, fontSize: 14, color: colors.foreground },
    navNextText: { color: colors.primary },
    navTextOff: { color: colors.subtleForeground },
  });
