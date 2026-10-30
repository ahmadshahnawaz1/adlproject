/**
 * SirahScreen — the life of the Prophet ﷺ as a vertical, chronological rail.
 *
 * Opened from the Learning Hub. It shows the whole timeline (before revelation
 * to the farewell) and opens each event in a reader sheet, where it can be
 * marked as read. Reading progress is owned by the hub's useLearnProgress hook.
 */
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import SirahTimeline from '../components/learn/SirahTimeline';
import LessonSheet from '../components/learn/LessonSheet';
import { SIRAH_EVENTS, type SirahEvent } from '../content/learn';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function SirahScreen({
  isRead,
  onToggleRead,
  onClose,
}: {
  isRead: (id: string) => boolean;
  onToggleRead: (id: string, read: boolean) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [active, setActive] = useState<SirahEvent | null>(null);
  const readCount = SIRAH_EVENTS.filter((e) => isRead(e.id)).length;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
          <ChevronLeft size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>The Life of the Prophet ﷺ</Text>
          <Text style={styles.headerSub}>
            {readCount} / {SIRAH_EVENTS.length} read
          </Text>
        </View>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <SirahTimeline events={SIRAH_EVENTS} isRead={isRead} onSelect={setActive} />
      </ScrollView>

      <LessonSheet
        visible={active != null}
        onClose={() => setActive(null)}
        title={active?.title ?? ''}
        arabic={active?.arabic}
        meta={active ? `${active.year} · ${active.place}` : undefined}
        body={active?.body ?? []}
        complete={active ? isRead(active.id) : false}
        onToggleComplete={(c) => {
          if (active) onToggleRead(active.id, c);
        }}
      />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing['3xl'] + spacing.md,
    paddingBottom: spacing.lg,
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
  scroll: { paddingBottom: spacing['2xl'] },
});
