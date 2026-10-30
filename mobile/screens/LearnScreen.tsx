/**
 * LearnScreen — the Learning Hub.
 *
 * The home of the app's teaching content: a board of four sections — the New
 * Muslim path, the Sīrah, ʿAqīdah, and Fiqh — plus a forgiving search across
 * every lesson. Opening the path hands off to its dedicated screen and the
 * Sīrah opens the graded journey; ʿAqīdah and Fiqh open inline as grouped
 * lesson lists, each lesson read in a sheet. Reading progress is remembered
 * between visits. Fully offline, evidence-cited.
 */
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, Info, X } from 'lucide-react-native';
import DuaSearchBar from '../components/DuaSearchBar';
import TopicGrid from '../components/learn/TopicGrid';
import LearnCard from '../components/learn/LearnCard';
import LessonSheet from '../components/learn/LessonSheet';
import LearnPathScreen from './LearnPathScreen';
import useLearnProgress from '../hooks/useLearnProgress';
import {
  LEARN_TOPICS,
  LEARN_DISCLAIMER,
  NEW_MUSLIM_TRACK,
  topicById,
  lessonsInTopic,
  type Lesson,
  type LearnTopicId,
} from '../content/learn';
import { groupedLessons, searchLessons } from '../lib/learn';
import { arabicFont, fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

type Sheet = { kind: 'lesson'; lesson: Lesson };

export default function LearnScreen({
  onNavigate,
  onClose,
}: {
  /** Jump into another feature, used by the New Muslim path steps. */
  onNavigate?: (key: string) => void;
  onClose?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const progress = useLearnProgress();
  const [topicId, setTopicId] = useState<LearnTopicId | null>(null);
  const [query, setQuery] = useState('');
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const trimmed = query.trim();
  const lessonHits = useMemo(() => (trimmed ? searchLessons(trimmed) : []), [trimmed]);

  // The New-Muslim path is a full, dedicated screen.
  if (topicId === 'new-muslim') {
    return (
      <LearnPathScreen
        isStepComplete={progress.isStepComplete}
        onToggleStep={progress.setStepComplete}
        onAction={(target) => onNavigate?.(target)}
        onClose={() => setTopicId(null)}
      />
    );
  }

  const topic = topicId ? topicById(topicId) : null;
  const groups = topic ? groupedLessons(topic.id) : [];

  const hint = (id: LearnTopicId): string => {
    if (id === 'new-muslim') {
      const done = NEW_MUSLIM_TRACK.steps.filter((s) => progress.isStepComplete(s.id)).length;
      return `${done} / ${NEW_MUSLIM_TRACK.steps.length} steps`;
    }
    if (id === 'sirah') {
      return 'Graded timeline';
    }
    const lessons = lessonsInTopic(id);
    const read = lessons.filter((l) => progress.isLessonComplete(l.id)).length;
    return `${read} / ${lessons.length} read`;
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        {topic ? (
          <Pressable onPress={() => setTopicId(null)} hitSlop={12} style={styles.iconBtn}>
            <ChevronLeft size={20} color={colors.mutedForeground} strokeWidth={2.25} />
          </Pressable>
        ) : (
          <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
            <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
          </Pressable>
        )}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{topic ? topic.title : 'Learn'}</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {topic ? topic.subtitle : 'Sīrah · belief · worship'}
          </Text>
        </View>
        <Pressable onPress={() => setInfoOpen(true)} hitSlop={12} style={styles.iconBtn}>
          <Info size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Search (hub level only) */}
        {!topic ? (
          <DuaSearchBar value={query} onChangeText={setQuery} placeholder="Search lessons…" />
        ) : null}

        {/* Search results */}
        {!topic && trimmed ? (
          <View style={styles.results}>
            {lessonHits.length === 0 ? (
              <Text style={styles.empty}>No lessons match “{trimmed}”.</Text>
            ) : null}
            {lessonHits.length > 0 ? (
              <Text style={styles.resultsLabel}>Lessons</Text>
            ) : null}
            {lessonHits.map((lesson) => (
              <LearnCard
                key={lesson.id}
                lesson={lesson}
                complete={progress.isLessonComplete(lesson.id)}
                onPress={() => setSheet({ kind: 'lesson', lesson })}
              />
            ))}
          </View>
        ) : null}

        {/* Topic grid (hub) */}
        {!topic && !trimmed ? (
          <View style={styles.gridWrap}>
            <TopicGrid
              topics={LEARN_TOPICS}
              hint={hint}
              onSelect={(id) => (id === 'sirah' ? onNavigate?.('sirah') : setTopicId(id))}
            />
            <Text style={styles.disclaimer}>{LEARN_DISCLAIMER}</Text>
          </View>
        ) : null}

        {/* Lessons within a topic (ʿAqīdah / Fiqh) */}
        {topic ? (
          <View style={styles.lessonsWrap}>
            <View style={styles.topicHead}>
              <Text style={styles.topicArabic}>{topic.arabic}</Text>
              <Text style={styles.topicBlurb}>{topic.blurb}</Text>
            </View>
            {groups.map((group) => (
              <View key={group.group} style={styles.group}>
                <Text style={styles.groupLabel}>{group.group}</Text>
                <View style={styles.groupList}>
                  {group.lessons.map((lesson) => (
                    <LearnCard
                      key={lesson.id}
                      lesson={lesson}
                      complete={progress.isLessonComplete(lesson.id)}
                      onPress={() => setSheet({ kind: 'lesson', lesson })}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {/* Lesson reader */}
      <LessonSheet
        visible={sheet != null}
        onClose={() => setSheet(null)}
        title={sheet ? sheet.lesson.title : ''}
        arabic={sheet ? sheet.lesson.arabic : undefined}
        meta={sheet ? `${sheet.lesson.group} · ${sheet.lesson.minutes} min` : undefined}
        body={sheet ? sheet.lesson.body : []}
        complete={sheet ? progress.isLessonComplete(sheet.lesson.id) : false}
        onToggleComplete={(c) => {
          if (!sheet) return;
          progress.setLessonComplete(sheet.lesson.id, c);
        }}
      />

      {/* Info sheet */}
      <Modal visible={infoOpen} transparent animationType="slide" onRequestClose={() => setInfoOpen(false)}>
        <View style={styles.infoRoot}>
          <Pressable style={styles.backdrop} onPress={() => setInfoOpen(false)} />
          <View style={styles.infoSheet}>
            <View style={styles.handle} />
            <View style={styles.infoHeader}>
              <Text style={styles.infoTitle}>About the Learning Hub</Text>
              <Pressable onPress={() => setInfoOpen(false)} hitSlop={12} style={styles.close}>
                <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
              </Pressable>
            </View>
            <Text style={styles.infoLead}>
              A growing library to learn the faith: a guided path for those new to Islam, the life
              of the Prophet ﷺ as a timeline, the foundations of belief, and the fiqh of worship.
            </Text>
            <View style={styles.infoDisclaimer}>
              <Text style={styles.infoDisclaimerText}>{LEARN_DISCLAIMER}</Text>
            </View>
          </View>
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
  scroll: { paddingBottom: spacing['2xl'], gap: spacing.md },

  gridWrap: { gap: spacing.lg },
  disclaimer: { fontFamily, fontSize: 12, lineHeight: 18, color: colors.subtleForeground, textAlign: 'center' },

  results: { gap: spacing.sm },
  resultsLabel: {
    ...typography.button,
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.sm,
  },
  empty: { fontFamily, fontSize: 14, color: colors.mutedForeground, textAlign: 'center', paddingVertical: spacing.xl },
  sirahRow: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: 3,
  },
  pressed: { opacity: 0.85 },
  sirahYear: { ...typography.caption, fontSize: 11, fontWeight: '700', color: colors.primary },
  sirahTitle: { ...typography.button, fontSize: 15, color: colors.foreground },
  sirahSummary: { fontFamily, fontSize: 13, lineHeight: 19, color: colors.mutedForeground },

  lessonsWrap: { gap: spacing.lg },
  topicHead: { gap: 4 },
  topicArabic: { fontFamily: arabicFont, fontSize: 20, color: colors.primary, writingDirection: 'rtl' },
  topicBlurb: { fontFamily, fontSize: 14, lineHeight: 21, color: colors.mutedForeground },
  group: { gap: spacing.sm },
  groupLabel: {
    ...typography.button,
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  groupList: { gap: spacing.sm },

  infoRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  infoSheet: {
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
  infoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  infoTitle: { ...typography.title, fontSize: 18, color: colors.foreground },
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
  infoLead: { fontFamily, fontSize: 14, lineHeight: 21, color: colors.mutedForeground, marginBottom: spacing.md },
  infoDisclaimer: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoDisclaimerText: { fontFamily, fontSize: 12, lineHeight: 18, color: colors.subtleForeground },
});
