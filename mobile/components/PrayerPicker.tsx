/**
 * PrayerPicker — the horizontal rail of prayers. Each chip names a prayer and
 * its rakʿah count; the chosen one glows gold. Tapping a chip rebuilds the
 * guide for that prayer. Presentational: it renders the prayers and reports the
 * selection.
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Prayer } from '../content/salah';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function PrayerPicker({
  prayers,
  selectedId,
  onSelect,
}: {
  prayers: Prayer[];
  selectedId: string;
  onSelect: (id: Prayer['id']) => void;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {prayers.map((p) => {
        const active = p.id === selectedId;
        const badge = p.kind === 'janazah' ? '4' : String(p.rakahCount);
        return (
          <Pressable
            key={p.id}
            onPress={() => onSelect(p.id)}
            style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${p.name}, ${p.kind === 'janazah' ? 'four takbīrs' : `${p.rakahCount} rakʿah`}`}
          >
            <Text style={[styles.chipTitle, active && styles.chipTitleActive]} numberOfLines={1}>
              {p.name}
            </Text>
            <View style={[styles.badge, active && styles.badgeActive]}>
              <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{badge}</Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  row: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  pressed: { opacity: 0.85 },
  chipTitle: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '600', color: colors.mutedForeground },
  chipTitleActive: { color: colors.primaryForeground },
  badge: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: { backgroundColor: 'rgba(0,0,0,0.18)' },
  badgeText: { fontFamily, fontSize: 11, fontWeight: '700', color: colors.subtleForeground },
  badgeTextActive: { color: colors.primaryForeground },
});
