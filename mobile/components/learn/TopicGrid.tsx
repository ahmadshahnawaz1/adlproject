/**
 * TopicGrid — the board of the Learning Hub's four sections: the New Muslim
 * path, the Sīrah timeline, ʿAqīdah, and Fiqh. Each tile shows its icon, its
 * English and Arabic names, a one-line blurb, and a small progress hint (steps
 * done on the path, or lessons read in a section). The icon name on each topic
 * (a lucide-react-native export) is resolved here.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BookOpen,
  ChevronRight,
  Footprints,
  Gem,
  Scale,
  Sprout,
  type LucideIcon,
} from 'lucide-react-native';
import type { LearnTopic, LearnTopicId } from '../../content/learn';
import { arabicFont, fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

const ICONS: Record<string, LucideIcon> = { Sprout, Footprints, Gem, Scale };

export default function TopicGrid({
  topics,
  hint,
  onSelect,
}: {
  topics: LearnTopic[];
  /** A short progress hint shown under each topic (e.g. "3 / 9 read"). */
  hint: (id: LearnTopicId) => string;
  onSelect: (id: LearnTopicId) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.grid}>
      {topics.map((topic) => {
        const Icon = ICONS[topic.icon] ?? BookOpen;
        const isStart = topic.id === 'new-muslim';
        return (
          <Pressable
            key={topic.id}
            onPress={() => onSelect(topic.id)}
            style={({ pressed }) => [
              styles.card,
              isStart && styles.cardStart,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${topic.title}. ${topic.blurb}`}
          >
            <View style={styles.head}>
              <View style={[styles.iconWrap, isStart && styles.iconWrapStart]}>
                <Icon size={20} color={isStart ? colors.primaryForeground : colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.titles}>
                <Text style={styles.title} numberOfLines={1}>
                  {topic.title}
                </Text>
                <Text style={styles.arabic} numberOfLines={1}>
                  {topic.arabic}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
            </View>
            <Text style={styles.blurb} numberOfLines={2}>
              {topic.blurb}
            </Text>
            <Text style={styles.hint}>{hint(topic.id)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  grid: { gap: spacing.md },
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: spacing.sm,
  },
  cardStart: { borderColor: `${colors.primary}55`, backgroundColor: colors.cardElevated },
  pressed: { opacity: 0.85, borderColor: colors.borderFocus },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapStart: { backgroundColor: colors.primary },
  titles: { flex: 1, minWidth: 0, gap: 2 },
  title: { ...typography.button, fontSize: 16, color: colors.foreground },
  arabic: { fontFamily: arabicFont, fontSize: 14, color: colors.primary, writingDirection: 'rtl' },
  blurb: { fontFamily, fontSize: 13, lineHeight: 19, color: colors.mutedForeground },
  hint: { fontFamily, fontSize: 11, fontWeight: '600', color: colors.subtleForeground },
});
