/**
 * AyahActionsSheet — the actions shown when an ayah is tapped or long-pressed:
 * a reference header with an Arabic preview, a bookmark toggle, tafsīr, copy,
 * and native share. Copy and share render the Arabic plus every selected
 * translation, labelled when more than one is stacked.
 */
import { useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Bookmark,
  BookmarkCheck,
  BookText,
  Check,
  Copy,
  Pause,
  Play,
  Share2,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import type { Ayah } from '../../content/quran/types';
import { colors, fontFamily, radius, spacing } from '../../theme/tokens';

export default function AyahActionsSheet({
  visible,
  ayah,
  surahName,
  bookmarked,
  translationIds,
  translationLabels,
  arabicFont,
  playing = false,
  onToggleBookmark,
  onOpenTafsir,
  onPlay,
  onClose,
}: {
  visible: boolean;
  ayah: Ayah | null;
  surahName: string;
  bookmarked: boolean;
  translationIds: string[];
  translationLabels?: Record<string, string>;
  /** Resolved Arabic font-family name. */
  arabicFont: string;
  /** Whether this ayah is currently being recited. */
  playing?: boolean;
  onToggleBookmark: () => void;
  onOpenTafsir: () => void;
  /** Toggle recitation for this ayah; closes the sheet. */
  onPlay?: () => void;
  onClose: () => void;
}) {
  const ref = ayah ? `${surahName} ${ayah.surah}:${ayah.number}` : '';
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildText = (): string => {
    if (!ayah) return '';
    const multi = translationIds.length > 1;
    const parts = translationIds
      .map((id) => {
        const text = ayah.translations[id];
        if (!text) return '';
        const label = multi ? translationLabels?.[id] : undefined;
        return label ? `${label}:\n${text}` : text;
      })
      .filter((t) => !!t);
    const body = parts.length ? `\n\n${parts.join('\n\n')}` : '';
    return `${ayah.arabic}${body}\n\n— ${ref}\nRead on Adl`;
  };

  const onShare = async () => {
    if (!ayah) return;
    try {
      await Share.share({ message: buildText() });
    } catch {
      // User dismissed or share failed — nothing to do.
    }
    onClose();
  };

  const onCopy = async () => {
    if (!ayah) return;
    try {
      await Clipboard.setStringAsync(buildText());
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard unavailable — silently ignore.
    }
  };

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

          {ayah ? (
            <>
              <Text style={styles.ref}>{ref}</Text>
              <Text
                style={[styles.preview, { fontFamily: arabicFont }]}
                numberOfLines={2}
                allowFontScaling={false}
              >
                {ayah.arabic}
              </Text>

              <View style={styles.actions}>
                {onPlay ? (
                  <Pressable
                    onPress={() => {
                      onPlay();
                      onClose();
                    }}
                    style={({ pressed }) => [
                      styles.action,
                      pressed && styles.pressed,
                    ]}
                  >
                    {playing ? (
                      <Pause size={20} color={colors.primary} fill={colors.primary} />
                    ) : (
                      <Play size={20} color={colors.foreground} />
                    )}
                    <Text
                      style={[
                        styles.actionLabel,
                        playing && styles.actionLabelActive,
                      ]}
                    >
                      {playing ? 'Pause recitation' : 'Play recitation'}
                    </Text>
                  </Pressable>
                ) : null}

                <Pressable
                  onPress={onToggleBookmark}
                  style={({ pressed }) => [
                    styles.action,
                    pressed && styles.pressed,
                  ]}
                >
                  {bookmarked ? (
                    <BookmarkCheck size={20} color={colors.primary} />
                  ) : (
                    <Bookmark size={20} color={colors.foreground} />
                  )}
                  <Text
                    style={[
                      styles.actionLabel,
                      bookmarked && styles.actionLabelActive,
                    ]}
                  >
                    {bookmarked ? 'Saved' : 'Bookmark'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={onOpenTafsir}
                  style={({ pressed }) => [
                    styles.action,
                    pressed && styles.pressed,
                  ]}
                >
                  <BookText size={20} color={colors.foreground} />
                  <Text style={styles.actionLabel}>Tafsīr</Text>
                </Pressable>

                <Pressable
                  onPress={onCopy}
                  style={({ pressed }) => [
                    styles.action,
                    pressed && styles.pressed,
                  ]}
                >
                  {copied ? (
                    <Check size={20} color={colors.success} />
                  ) : (
                    <Copy size={20} color={colors.foreground} />
                  )}
                  <Text
                    style={[
                      styles.actionLabel,
                      copied && styles.actionLabelSuccess,
                    ]}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={onShare}
                  style={({ pressed }) => [
                    styles.action,
                    pressed && styles.pressed,
                  ]}
                >
                  <Share2 size={20} color={colors.foreground} />
                  <Text style={styles.actionLabel}>Share</Text>
                </Pressable>
              </View>
            </>
          ) : null}
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
    marginBottom: spacing.lg,
  },
  ref: {
    fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  preview: {
    fontSize: 22,
    lineHeight: 40,
    color: colors.foreground,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: spacing.lg,
  },
  actions: { gap: spacing.sm },
  action: {
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
  pressed: { opacity: 0.7 },
  actionLabel: {
    fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  actionLabelActive: { color: colors.primary },
  actionLabelSuccess: { color: colors.success },
});
