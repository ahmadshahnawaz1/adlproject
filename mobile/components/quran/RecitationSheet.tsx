/**
 * RecitationSheet — choose the reciter and manage offline audio for a surah.
 *
 * The reciter list drives playback everywhere in the reader. Below it, a single
 * card downloads (or removes) the whole surah in the selected voice so it plays
 * with no network; un-downloaded surahs stream from the CDN on demand. Download
 * progress is shown live. Purely presentational — state lives in the player and
 * the recitation-downloads hook passed in.
 */
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Check,
  Download,
  Loader,
  Trash2,
  X,
} from 'lucide-react-native';
import {
  RECITERS,
  estimateSurahBytes,
  formatBytes,
} from '../../lib/quranRecitations';
import type { UseQuranRecitationDownloads } from '../../hooks/useQuranRecitationDownloads';
import { colors, fontFamily, radius, spacing } from '../../theme/tokens';

export default function RecitationSheet({
  visible,
  onClose,
  surah,
  ayahCount,
  surahName,
  reciterId,
  onSelectReciter,
  downloads,
}: {
  visible: boolean;
  onClose: () => void;
  surah: number;
  ayahCount: number;
  surahName: string;
  reciterId: string;
  onSelectReciter: (id: string) => void;
  downloads: UseQuranRecitationDownloads;
}) {
  const downloaded = downloads.isDownloaded(reciterId, surah);
  const busy = downloads.isBusy(reciterId, surah);
  const pct = downloads.progressFor(reciterId, surah);
  const record = downloads.records.find(
    (r) => r.reciterId === reciterId && r.surah === surah,
  );
  const estimate = estimateSurahBytes(reciterId, ayahCount);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.titleRow}>
            <Text style={styles.title}>Recitation</Text>
            <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
              <X size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Text style={styles.section}>RECITER</Text>
            {RECITERS.map((r) => {
              const active = r.id === reciterId;
              const savedForReciter = downloads.isDownloaded(r.id, surah);
              return (
                <Pressable
                  key={r.id}
                  onPress={() => onSelectReciter(r.id)}
                  style={[styles.reciterRow, active && styles.reciterRowActive]}
                >
                  <View style={styles.reciterText}>
                    <Text style={styles.reciterName}>{r.name}</Text>
                    <Text style={styles.reciterMeta}>
                      {r.style} · {r.bitrate} kbps
                      {savedForReciter ? ' · saved' : ''}
                    </Text>
                  </View>
                  <Text
                    style={styles.reciterArabic}
                    allowFontScaling={false}
                    numberOfLines={1}
                  >
                    {r.arabicName}
                  </Text>
                  {active ? (
                    <Check size={18} color={colors.primary} />
                  ) : (
                    <View style={styles.checkSpacer} />
                  )}
                </Pressable>
              );
            })}

            <Text style={styles.section}>OFFLINE AUDIO</Text>
            <View style={styles.audioCard}>
              <Text style={styles.audioTitle}>{surahName}</Text>
              <Text style={styles.audioMeta}>
                {ayahCount} ayahs ·{' '}
                {downloaded && record
                  ? `${formatBytes(record.bytes)} saved`
                  : `~${formatBytes(estimate)}`}
              </Text>

              {busy ? (
                <View style={styles.progressWrap}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[styles.progressFill, { width: `${pct * 100}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    Downloading… {Math.round(pct * 100)}%
                  </Text>
                </View>
              ) : downloaded ? (
                <Pressable
                  onPress={() => downloads.remove(reciterId, surah)}
                  style={({ pressed }) => [
                    styles.audioBtn,
                    styles.audioBtnDanger,
                    pressed && styles.pressed,
                  ]}
                >
                  <Trash2 size={17} color={colors.destructive} />
                  <Text style={[styles.audioBtnText, styles.audioBtnTextDanger]}>
                    Remove download
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => downloads.download(reciterId, surah, ayahCount)}
                  style={({ pressed }) => [
                    styles.audioBtn,
                    pressed && styles.pressed,
                  ]}
                >
                  <Download size={17} color={colors.primaryForeground} />
                  <Text style={styles.audioBtnText}>Download this surah</Text>
                </Pressable>
              )}

              {downloads.errorKey === `${reciterId}:${surah}` && !busy ? (
                <Text style={styles.errorText}>
                  Download failed. Check your connection and try again.
                </Text>
              ) : null}
            </View>

            <View style={styles.noteRow}>
              <Loader size={14} color={colors.subtleForeground} />
              <Text style={styles.note}>
                Un-downloaded surahs stream over the network. Download to recite
                fully offline.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    maxHeight: '85%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  close: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardElevated,
  },
  content: { paddingBottom: spacing.lg, gap: spacing.sm },
  section: {
    fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.subtleForeground,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  reciterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
  },
  reciterRowActive: { borderColor: colors.primary },
  reciterText: { flex: 1, gap: 2 },
  reciterName: {
    fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  reciterMeta: { fontFamily, fontSize: 12.5, color: colors.subtleForeground },
  reciterArabic: {
    fontSize: 18,
    color: colors.mutedForeground,
    writingDirection: 'rtl',
    maxWidth: 130,
  },
  checkSpacer: { width: 18 },
  audioCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
  },
  audioTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: colors.foreground,
  },
  audioMeta: { fontFamily, fontSize: 13, color: colors.subtleForeground },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    marginTop: spacing.xs,
  },
  audioBtnDanger: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.destructive,
  },
  audioBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryForeground,
  },
  audioBtnTextDanger: { color: colors.destructive },
  pressed: { opacity: 0.7 },
  progressWrap: { gap: spacing.xs, marginTop: spacing.xs },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  progressText: { fontFamily, fontSize: 12.5, color: colors.mutedForeground },
  errorText: {
    fontFamily,
    fontSize: 12.5,
    color: colors.destructive,
    marginTop: spacing.xs,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  note: {
    flex: 1,
    fontFamily,
    fontSize: 12.5,
    color: colors.subtleForeground,
    lineHeight: 18,
  },
});
