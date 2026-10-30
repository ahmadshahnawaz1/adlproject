/**
 * CollectionCard — one book in the library grid (F18).
 *
 * Shows the collection's name, Arabic, compiler and size, with an availability
 * badge (offline for bundled books, or the download state for the rest). Tapping
 * opens it; a download affordance appears for books not yet on the device.
 */
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BookMarked,
  BookText,
  ChevronRight,
  Download,
  Library,
  ScrollText,
  Sparkles,
  Check,
  type LucideIcon,
} from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import type { HadithCollection } from '../../lib/hadith';
import { arabicFont, fontFamily, radius, spacing, typography } from '../../theme/tokens';

const ICONS: Record<string, LucideIcon> = { BookMarked, BookText, Library, ScrollText, Sparkles };

export default function CollectionCard({
  collection,
  downloaded = false,
  busy = false,
  onOpen,
  onDownload,
}: {
  collection: HadithCollection;
  downloaded?: boolean;
  busy?: boolean;
  onOpen: () => void;
  onDownload?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const Icon = ICONS[collection.icon ?? 'BookText'] ?? BookText;
  const isOffline = collection.availability === 'bundled' || downloaded;
  const needsDownload = collection.availability === 'download' && !downloaded;

  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${collection.name}. ${collection.total} narrations.`}
    >
      <View style={styles.iconWrap}>
        <Icon size={20} color={colors.primary} strokeWidth={2} />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {collection.name}
          </Text>
          <Text style={styles.arabic} numberOfLines={1}>
            {collection.arabicName}
          </Text>
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {collection.author} · {collection.total.toLocaleString()} narrations
        </Text>
        <View style={styles.badges}>
          {isOffline ? (
            <View style={[styles.badge, { backgroundColor: `${colors.success}1A` }]}>
              <Check size={10} color={colors.success} strokeWidth={2.6} />
              <Text style={[styles.badgeText, { color: colors.success }]}>Offline</Text>
            </View>
          ) : null}
          {collection.authenticity === 'sahih' ? (
            <View style={[styles.badge, { backgroundColor: `${colors.primary}1A` }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>Ṣaḥīḥ</Text>
            </View>
          ) : null}
        </View>
      </View>

      {busy ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : needsDownload && onDownload ? (
        <Pressable
          onPress={onDownload}
          hitSlop={10}
          style={({ pressed }) => [styles.dl, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Download ${collection.name}`}
        >
          <Download size={18} color={colors.primary} strokeWidth={2.2} />
        </Pressable>
      ) : (
        <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
      )}
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    pressed: { opacity: 0.85 },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}1A`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: { flex: 1, minWidth: 0, gap: 3 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'space-between' },
    name: { ...typography.button, fontSize: 15, color: colors.foreground, flexShrink: 1 },
    arabic: { fontFamily: arabicFont, fontSize: 14, color: colors.mutedForeground, writingDirection: 'rtl' },
    meta: { fontFamily, fontSize: 12, color: colors.subtleForeground },
    badges: { flexDirection: 'row', gap: 6, marginTop: 2 },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: radius.sm,
    },
    badgeText: { fontFamily, fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },
    dl: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}14`,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
