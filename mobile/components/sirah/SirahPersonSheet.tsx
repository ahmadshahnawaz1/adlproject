/**
 * SirahPersonSheet — a bottom sheet with a companion's or family member's short,
 * sourced biography, opened from a person chip on a Sīrah event (F20).
 */
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { arabicFont, fontFamily, radius, spacing, typography } from '../../theme/tokens';
import type { SirahPerson } from '../../lib/sirah';

export default function SirahPersonSheet({
  person,
  onClose,
}: {
  person: SirahPerson | null;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Modal visible={person != null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.titles}>
              <Text style={styles.name}>{person?.name}</Text>
              {person?.arabic ? <Text style={styles.arabic}>{person.arabic}</Text> : null}
              {person?.epithet ? <Text style={styles.epithet}>{person.epithet}</Text> : null}
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
              <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {person?.relation ? <Text style={styles.relation}>{person.relation}</Text> : null}
            {person?.bio ? <Text style={styles.bio}>{person.bio}</Text> : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
    sheet: { maxHeight: '80%', backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
    header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.sm },
    titles: { flex: 1, minWidth: 0, gap: 2 },
    name: { ...typography.title, fontSize: 20, color: colors.foreground },
    arabic: { fontFamily: arabicFont, fontSize: 18, color: colors.primary, writingDirection: 'rtl' },
    epithet: { ...typography.caption, fontSize: 12, fontWeight: '700', color: colors.primary },
    close: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    content: { gap: spacing.sm, paddingBottom: spacing.lg },
    relation: { fontFamily, fontSize: 14, fontWeight: '600', color: colors.mutedForeground, fontStyle: 'italic' },
    bio: { fontFamily, fontSize: 15, lineHeight: 24, color: colors.foreground },
  });
