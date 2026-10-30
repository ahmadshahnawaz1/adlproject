/**
 * DuaCategoryGrid — the two-column board of the library's themed sections. Each
 * card shows the section's icon, its English and Arabic names, a one-line
 * description and how many supplications it holds. The icon name on each
 * category (a lucide-react-native export) is resolved here.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BookOpen,
  CloudSun,
  Coins,
  Compass,
  HeartPulse,
  Home,
  Landmark,
  Plane,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react-native';
import type { DuaCategory, DuaCategoryId } from '../content/duas-library';
import { arabicFont, fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const ICONS: Record<string, LucideIcon> = {
  Home,
  Landmark,
  Plane,
  CloudSun,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  Compass,
  Coins,
  Stethoscope,
  BookOpen,
  ScrollText,
};

export default function DuaCategoryGrid({
  categories,
  count,
  onSelect,
}: {
  categories: DuaCategory[];
  /** How many supplications a category holds. */
  count: (id: DuaCategoryId) => number;
  onSelect: (id: DuaCategoryId) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.grid}>
      {categories.map((cat) => {
        const Icon = ICONS[cat.icon] ?? BookOpen;
        const n = count(cat.id);
        return (
          <Pressable
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.iconWrap}>
              <Icon size={20} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {cat.title}
            </Text>
            <Text style={styles.arabic} numberOfLines={1}>
              {cat.arabic}
            </Text>
            <Text style={styles.sub} numberOfLines={2}>
              {cat.subtitle}
            </Text>
            <Text style={styles.count}>
              {n} {n === 1 ? 'duʿāʾ' : 'duʿās'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: 0,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: 4,
  },
  pressed: { opacity: 0.85, borderColor: colors.borderFocus },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { ...typography.button, fontSize: 14, color: colors.foreground },
  arabic: { fontFamily: arabicFont, fontSize: 14, color: colors.primary, writingDirection: 'rtl' },
  sub: {
    fontFamily,
    fontSize: typography.caption.fontSize,
    lineHeight: 18,
    color: colors.mutedForeground,
  },
  count: {
    fontFamily,
    fontSize: 11,
    color: colors.subtleForeground,
    marginTop: 2,
  },
});
