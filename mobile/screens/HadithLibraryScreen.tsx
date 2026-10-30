/**
 * HadithLibraryScreen — manage downloadable collections (F18).
 *
 * Lists the major books, streams a chosen one (Arabic + English, merged and
 * graded) to disk, shows progress and any error, allows deletion, and reports
 * total storage used. Data comes from the open, keyless hadith CDN.
 */
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, Download, RotateCw, Trash2 } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import { HADITH_COLLECTIONS } from '../lib/hadith';
import { formatBytes } from '../lib/quranEditions';
import type { UseHadithLibrary } from '../hooks/useHadithLibrary';
import { arabicFont, fontFamily, radius, spacing, typography } from '../theme/tokens';

export default function HadithLibraryScreen({
  library,
  onClose,
}: {
  library: UseHadithLibrary;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const books = HADITH_COLLECTIONS.filter((c) => c.availability === 'download');

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
          <ChevronLeft size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Hadith Library</Text>
          <Text style={styles.headerSub}>
            {library.totalBytes > 0 ? `${formatBytes(library.totalBytes)} downloaded` : 'Download full collections'}
          </Text>
        </View>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {books.map((c) => {
          const downloaded = library.isDownloaded(c.id);
          const busy = library.isBusy(c.id);
          const errored = library.errorId === c.id;
          return (
            <View key={c.id} style={styles.row}>
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {c.name}
                  </Text>
                  <Text style={styles.arabic} numberOfLines={1}>
                    {c.arabicName}
                  </Text>
                </View>
                <Text style={styles.meta} numberOfLines={1}>
                  {c.total.toLocaleString()} narrations{c.grader ? ` · graded by ${c.grader}` : ''}
                </Text>
                {errored ? (
                  <Text style={styles.error}>Couldn’t download. Check your connection and try again.</Text>
                ) : null}
              </View>

              {busy ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : downloaded ? (
                <Pressable
                  onPress={() => library.remove(c.id)}
                  hitSlop={10}
                  style={({ pressed }) => [styles.ctrl, styles.ctrlDanger, pressed && styles.pressed]}
                  accessibilityLabel={`Delete ${c.name}`}
                >
                  <Trash2 size={17} color={colors.destructive} strokeWidth={2} />
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => library.download(c)}
                  hitSlop={10}
                  style={({ pressed }) => [styles.ctrl, pressed && styles.pressed]}
                  accessibilityLabel={`Download ${c.name}`}
                >
                  {errored ? (
                    <RotateCw size={17} color={colors.primary} strokeWidth={2.2} />
                  ) : (
                    <Download size={18} color={colors.primary} strokeWidth={2.2} />
                  )}
                </Pressable>
              )}
            </View>
          );
        })}

        <Text style={styles.note}>
          Collections are downloaded from an open, community-maintained hadith dataset with Arabic and
          English. Authenticity gradings follow the cited scholars; where a narration is weak or
          fabricated, its grade is shown — always heed it.
        </Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingTop: spacing['3xl'] + spacing.md,
      paddingBottom: spacing.md,
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
    list: { gap: spacing.sm, paddingBottom: spacing['2xl'] },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    body: { flex: 1, minWidth: 0, gap: 3 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'space-between' },
    name: { ...typography.button, fontSize: 15, color: colors.foreground, flexShrink: 1 },
    arabic: { fontFamily: arabicFont, fontSize: 14, color: colors.mutedForeground, writingDirection: 'rtl' },
    meta: { fontFamily, fontSize: 12, color: colors.subtleForeground },
    error: { fontFamily, fontSize: 12, color: colors.destructive, marginTop: 2 },
    ctrl: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}14`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctrlDanger: { backgroundColor: `${colors.destructive}14` },
    pressed: { opacity: 0.85 },
    note: {
      fontFamily,
      fontSize: 12,
      lineHeight: 18,
      color: colors.subtleForeground,
      paddingTop: spacing.md,
    },
  });
