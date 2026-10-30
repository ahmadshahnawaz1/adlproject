/**
 * ReaderToolbar — the top bar inside the surah reader.
 *
 * Back button, a centred title (surah name + Arabic name · current juzʾ), and a
 * typography button that opens the reader settings sheet. A hairline reading
 * progress bar runs along the bottom edge. Fully themeable.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ALargeSmall, Pause, Play } from 'lucide-react-native';
import type { SurahMeta } from '../../content/quran/types';
import type { ReaderTheme } from '../../theme/quranReaderThemes';
import { fontFamily, spacing, typography } from '../../theme/tokens';

export default function ReaderToolbar({
  surah,
  juz,
  theme,
  progress,
  playing = false,
  onBack,
  onOpenSettings,
  onTogglePlay,
}: {
  surah: SurahMeta;
  juz?: number;
  theme: ReaderTheme;
  /** Reading progress through the surah, 0–1. */
  progress?: number;
  /** Whether the surah is currently being recited. */
  playing?: boolean;
  onBack: () => void;
  onOpenSettings: () => void;
  /** Toggle continuous recitation of the surah. */
  onTogglePlay?: () => void;
}) {
  const pct = Math.max(0, Math.min(1, progress ?? 0));

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: theme.surface, borderBottomColor: theme.border },
      ]}
    >
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [
          styles.iconBtn,
          { backgroundColor: theme.bg, borderColor: theme.border },
          pressed && styles.pressed,
        ]}
        accessibilityLabel="Back"
      >
        <ChevronLeft size={22} color={theme.text} />
      </Pressable>

      <View style={styles.center}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {surah.name}
        </Text>
        <Text style={[styles.sub, { color: theme.subtle }]} numberOfLines={1}>
          {surah.arabicName}
          {juz ? ` · Juzʾ ${juz}` : ''}
        </Text>
      </View>

      <Pressable
        onPress={onOpenSettings}
        style={({ pressed }) => [
          styles.iconBtn,
          { backgroundColor: theme.bg, borderColor: theme.border },
          pressed && styles.pressed,
        ]}
        accessibilityLabel="Reader settings"
      >
        <ALargeSmall size={22} color={theme.text} />
      </Pressable>

      {onTogglePlay ? (
        <Pressable
          onPress={onTogglePlay}
          style={({ pressed }) => [
            styles.iconBtn,
            { backgroundColor: theme.bg, borderColor: theme.border },
            playing && { backgroundColor: theme.accent, borderColor: theme.accent },
            pressed && styles.pressed,
          ]}
          accessibilityLabel={playing ? 'Pause recitation' : 'Play surah'}
        >
          {playing ? (
            <Pause size={20} color={theme.accentText} fill={theme.accentText} />
          ) : (
            <Play size={20} color={theme.text} fill={theme.text} />
          )}
        </Pressable>
      ) : null}

      {pct > 0 ? (
        <View
          style={[
            styles.progress,
            { width: `${pct * 100}%`, backgroundColor: theme.accent },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'] + spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  center: { flex: 1, alignItems: 'center', gap: 2 },
  title: {
    fontFamily,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sub: {
    fontFamily,
    fontSize: typography.caption.fontSize,
  },
  progress: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 2,
  },
});
