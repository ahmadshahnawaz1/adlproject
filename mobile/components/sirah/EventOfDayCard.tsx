/**
 * EventOfDayCard — the daily "moment from the Sīrah" hero on the hub (F20).
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, Sun } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { arabicFont, fontFamily, radius, spacing, typography } from '../../theme/tokens';
import SirahGradeBadge from './SirahGradeBadge';
import type { SirahEvent } from '../../lib/sirah';

export default function EventOfDayCard({ event, onOpen }: { event: SirahEvent; onOpen: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable onPress={onOpen} style={({ pressed }) => [styles.card, pressed && styles.pressed]} accessibilityRole="button">
      <View style={styles.head}>
        <View style={styles.iconWrap}>
          <Sun size={16} color={colors.primary} strokeWidth={2.2} />
        </View>
        <Text style={styles.kicker}>A moment from the Sīrah</Text>
        <SirahGradeBadge grade={event.grade} size="sm" />
      </View>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{event.title}</Text>
        {event.arabic ? <Text style={styles.arabic}>{event.arabic}</Text> : null}
      </View>
      <Text style={styles.summary} numberOfLines={2}>{event.summary}</Text>
      <View style={styles.footer}>
        <Text style={styles.meta}>{event.yearLabel} · {event.place}</Text>
        <View style={styles.readMore}>
          <Text style={styles.readMoreText}>Read the account</Text>
          <ChevronRight size={15} color={colors.primary} strokeWidth={2.4} />
        </View>
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: `${colors.primary}44`, backgroundColor: colors.cardElevated, gap: spacing.sm },
    pressed: { opacity: 0.9 },
    head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    iconWrap: { width: 30, height: 30, borderRadius: radius.md, backgroundColor: `${colors.primary}1A`, alignItems: 'center', justifyContent: 'center' },
    kicker: { flex: 1, ...typography.caption, fontSize: 11, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.6 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
    title: { ...typography.title, fontSize: 18, color: colors.foreground, flexShrink: 1 },
    arabic: { fontFamily: arabicFont, fontSize: 16, color: colors.primary, writingDirection: 'rtl' },
    summary: { fontFamily, fontSize: 14, lineHeight: 21, color: colors.mutedForeground },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    meta: { fontFamily, fontSize: 11, color: colors.subtleForeground },
    readMore: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    readMoreText: { ...typography.caption, fontSize: 12, fontWeight: '700', color: colors.primary },
  });
