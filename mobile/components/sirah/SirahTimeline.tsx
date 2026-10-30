/**
 * SirahTimeline — the vertical, era-grouped rail of the Prophet's ﷺ life (F20).
 *
 * Events run top to bottom along a gold rail, grouped under their era, each node
 * carrying its period, place, an authenticity grade badge, and a read marker.
 */
import { Fragment } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { eraMeta } from '../../content/sirah';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { arabicFont, fontFamily, radius, spacing, typography } from '../../theme/tokens';
import SirahGradeBadge from './SirahGradeBadge';
import type { SirahEvent } from '../../lib/sirah';

export default function SirahTimeline({
  events,
  isRead,
  onSelect,
}: {
  events: SirahEvent[];
  isRead: (id: string) => boolean;
  onSelect: (event: SirahEvent) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  let lastEra: string | null = null;

  return (
    <View style={styles.wrap}>
      {events.map((event, idx) => {
        const showEra = event.era !== lastEra;
        lastEra = event.era;
        const read = isRead(event.id);
        const isLast = idx === events.length - 1;
        const era = eraMeta(event.era);

        return (
          <Fragment key={event.id}>
            {showEra ? (
              <View style={styles.eraRow}>
                <View style={styles.eraLine} />
                <Text style={styles.eraLabel}>{era?.title ?? event.era}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={() => onSelect(event)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={`${event.title}, ${event.yearLabel}. ${read ? 'Read.' : ''}`}
            >
              <View style={styles.rail}>
                <View style={[styles.node, read && styles.nodeRead]}>
                  <View style={[styles.dot, read && styles.dotRead]} />
                </View>
                {!isLast ? <View style={styles.railLine} /> : null}
              </View>

              <View style={styles.card}>
                <View style={styles.topRow}>
                  <Text style={styles.year}>{event.yearLabel}</Text>
                  <SirahGradeBadge grade={event.grade} size="sm" />
                </View>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{event.title}</Text>
                  {event.arabic ? <Text style={styles.arabic}>{event.arabic}</Text> : null}
                </View>
                <Text style={styles.place}>{event.place}</Text>
                <Text style={styles.summary}>{event.summary}</Text>
              </View>
            </Pressable>
          </Fragment>
        );
      })}
    </View>
  );
}

const RAIL_W = 34;

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: { paddingVertical: spacing.sm },
    eraRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.xs, marginLeft: RAIL_W },
    eraLine: { width: 14, height: 2, borderRadius: 1, backgroundColor: colors.primary },
    eraLabel: { ...typography.button, fontSize: 12, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.8 },
    row: { flexDirection: 'row', gap: spacing.sm },
    pressed: { opacity: 0.8 },
    rail: { width: RAIL_W, alignItems: 'center' },
    node: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md },
    nodeRead: { borderColor: colors.primary },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.subtleForeground },
    dotRead: { backgroundColor: colors.primary },
    railLine: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 2 },
    card: { flex: 1, minWidth: 0, marginBottom: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, gap: 4 },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
    year: { ...typography.caption, fontSize: 11, fontWeight: '700', color: colors.primary, letterSpacing: 0.3 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
    title: { ...typography.button, fontSize: 15, color: colors.foreground, flexShrink: 1 },
    arabic: { fontFamily: arabicFont, fontSize: 14, color: colors.mutedForeground, writingDirection: 'rtl' },
    place: { fontFamily, fontSize: 11, color: colors.subtleForeground },
    summary: { fontFamily, fontSize: 13, lineHeight: 19, color: colors.mutedForeground, marginTop: 2 },
  });
