/**
 * SirahTimeline — a vertical, chronological rail of the Prophet's ﷺ life.
 *
 * Events run top to bottom along a continuous gold rail, grouped under their
 * era (before revelation, Makkah, the Hijrah, Madīnah, the conquest, the
 * farewell). Each node shows the period, the title, its place, and a one-line
 * summary; a filled node marks an event already read. Tapping a node opens the
 * full account.
 */
import { Fragment } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SirahEra, SirahEvent } from '../../content/learn';
import { arabicFont, fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

const ERA_LABEL: Record<SirahEra, string> = {
  'before-revelation': 'Before Revelation',
  makkah: 'The Makkan Years',
  hijrah: 'The Hijrah',
  madinah: 'The Madinan Years',
  conquest: 'The Opening of Makkah',
  farewell: 'The Farewell',
};

export default function SirahTimeline({
  events,
  isRead,
  onSelect,
}: {
  events: SirahEvent[];
  isRead: (id: string) => boolean;
  onSelect: (event: SirahEvent) => void;
}) {
  const styles = useThemedStyles(makeStyles);
  let lastEra: SirahEra | null = null;

  return (
    <View style={styles.wrap}>
      {events.map((event, idx) => {
        const showEra = event.era !== lastEra;
        lastEra = event.era;
        const read = isRead(event.id);
        const isLast = idx === events.length - 1;

        return (
          <Fragment key={event.id}>
            {showEra ? (
              <View style={styles.eraRow}>
                <View style={styles.eraLine} />
                <Text style={styles.eraLabel}>{ERA_LABEL[event.era]}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={() => onSelect(event)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={`${event.title}, ${event.year}. ${read ? 'Read.' : ''}`}
            >
              <View style={styles.rail}>
                <View style={[styles.node, read && styles.nodeRead]}>
                  <View style={[styles.nodeDot, read && styles.nodeDotRead]} />
                </View>
                {!isLast ? <View style={styles.railLine} /> : null}
              </View>

              <View style={styles.card}>
                <Text style={styles.year}>{event.year}</Text>
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

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: { paddingVertical: spacing.sm },
  eraRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.xs, marginLeft: RAIL_W },
  eraLine: { width: 14, height: 2, borderRadius: 1, backgroundColor: colors.primary },
  eraLabel: {
    ...typography.button,
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  pressed: { opacity: 0.8 },
  rail: { width: RAIL_W, alignItems: 'center' },
  node: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  nodeRead: { borderColor: colors.primary },
  nodeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.subtleForeground },
  nodeDotRead: { backgroundColor: colors.primary },
  railLine: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 2 },
  card: {
    flex: 1,
    minWidth: 0,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: 3,
  },
  year: { ...typography.caption, fontSize: 11, fontWeight: '700', color: colors.primary, letterSpacing: 0.3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { ...typography.button, fontSize: 15, color: colors.foreground, flexShrink: 1 },
  arabic: { fontFamily: arabicFont, fontSize: 14, color: colors.mutedForeground, writingDirection: 'rtl' },
  place: { fontFamily, fontSize: 11, color: colors.subtleForeground },
  summary: { fontFamily, fontSize: 13, lineHeight: 19, color: colors.mutedForeground, marginTop: 2 },
});
