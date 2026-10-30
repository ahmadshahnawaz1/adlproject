/**
 * EditionRow — one downloadable translation/transliteration in the library.
 *
 * Shows the edition name and a "language · kind" sub-line, with a trailing
 * control that reflects state: download, in-progress spinner, retry on error,
 * or a delete button once the edition is on disk. App-palette control chrome.
 */
import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, Download, RotateCw, Trash2 } from 'lucide-react-native';
import type { DownloadableEdition } from '../../content/quran/types';
import { formatBytes } from '../../lib/quranEditions';
import { colors, fontFamily, radius, spacing } from '../../theme/tokens';

function EditionRow({
  edition,
  downloaded,
  busy,
  errored,
  bytes,
  onDownload,
  onDelete,
}: {
  edition: DownloadableEdition;
  downloaded: boolean;
  busy: boolean;
  errored: boolean;
  bytes?: number;
  onDownload: (edition: DownloadableEdition) => void;
  onDelete: (id: string) => void;
}) {
  const kindLabel =
    edition.kind === 'transliteration' ? 'Transliteration' : 'Translation';
  const sub = downloaded && bytes ? `${kindLabel} · ${formatBytes(bytes)}` : kindLabel;

  return (
    <View style={styles.row}>
      <View style={styles.mid}>
        <Text style={styles.name} numberOfLines={2}>
          {edition.name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {sub}
        </Text>
      </View>

      {busy ? (
        <View style={styles.action}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : downloaded ? (
        <View style={styles.trailing}>
          <View style={styles.downloadedBadge}>
            <Check size={14} color={colors.success} />
          </View>
          <Pressable
            onPress={() => onDelete(edition.id)}
            hitSlop={8}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Trash2 size={18} color={colors.subtleForeground} />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={() => onDownload(edition)}
          hitSlop={8}
          style={({ pressed }) => [
            styles.action,
            styles.downloadBtn,
            errored && styles.errorBtn,
            pressed && styles.pressed,
          ]}
        >
          {errored ? (
            <RotateCw size={18} color={colors.destructive} />
          ) : (
            <Download size={18} color={colors.primary} />
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  mid: { flex: 1, gap: 3 },
  name: {
    fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
    letterSpacing: -0.2,
  },
  sub: { fontFamily, fontSize: 12.5, color: colors.subtleForeground },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  action: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
  },
  errorBtn: { borderColor: colors.destructive },
  downloadedBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  pressed: { opacity: 0.6 },
});

export default memo(EditionRow);
