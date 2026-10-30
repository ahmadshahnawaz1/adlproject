/**
 * CategoryTabs — the horizontal rail of remembrance sets (morning, evening,
 * after ṣalāh, before sleep, on waking). The chosen set glows gold; a set
 * completed today wears a small check. Presentational — it renders the sets and
 * reports the selection.
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import type { AdhkarCategory, AdhkarCategoryId } from '../content/adhkar';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function CategoryTabs({
  categories,
  selectedId,
  completedIds,
  onSelect,
}: {
  categories: AdhkarCategory[];
  selectedId: string;
  completedIds: string[];
  onSelect: (id: AdhkarCategoryId) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {categories.map((c) => {
        const active = c.id === selectedId;
        const done = completedIds.includes(c.id);
        return (
          <Pressable
            key={c.id}
            onPress={() => onSelect(c.id)}
            style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${c.title}${done ? ', completed today' : ''}`}
          >
            {done ? (
              <Check size={13} color={active ? colors.primaryForeground : colors.success} strokeWidth={2.6} />
            ) : null}
            <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
              {c.title}
            </Text>
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
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  pressed: { opacity: 0.85 },
  chipText: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '600', color: colors.mutedForeground },
  chipTextActive: { color: colors.primaryForeground },
});
