/**
 * SirahEvidence — the tappable evidence row on a Sīrah event (F20): the Qurʾān
 * verses and hadith that establish it, each deep-linking into the reader (F7)
 * and the hadith library (F18).
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BookOpen, ScrollText } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { typography } from '../../theme/tokens';
import type { AyahRef, HadithRef } from '../../content/sirah';

const HADITH_NAMES: Record<string, string> = {
  bukhari: 'Bukhārī',
  muslim: 'Muslim',
  tirmidhi: 'Tirmidhī',
  abudawud: 'Abū Dāwūd',
  nasai: 'al-Nasāʾī',
  ibnmajah: 'Ibn Mājah',
  malik: 'Muwaṭṭaʾ',
};

export default function SirahEvidence({
  quranRefs,
  hadithRefs,
  onOpenQuran,
  onOpenHadith,
}: {
  quranRefs?: AyahRef[];
  hadithRefs?: HadithRef[];
  onOpenQuran?: (ref: AyahRef) => void;
  onOpenHadith?: (ref: HadithRef) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const hasQuran = (quranRefs?.length ?? 0) > 0;
  const hasHadith = (hadithRefs?.length ?? 0) > 0;
  if (!hasQuran && !hasHadith) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Evidence</Text>
      <View style={styles.row}>
        {quranRefs?.map((r) => (
          <Pressable
            key={`q-${r.surah}-${r.ayah}`}
            onPress={() => onOpenQuran?.(r)}
            style={({ pressed }) => [styles.chip, styles.quran, pressed && styles.pressed]}
            accessibilityRole="link"
            accessibilityLabel={`Qurʾān ${r.surah}:${r.ayah}`}
          >
            <BookOpen size={12} color={colors.primary} strokeWidth={2.4} />
            <Text style={[styles.chipText, { color: colors.primary }]}>{r.label ?? `${r.surah}:${r.ayah}`}</Text>
          </Pressable>
        ))}
        {hadithRefs?.map((r) => (
          <Pressable
            key={`h-${r.collectionId}-${r.number}`}
            onPress={() => onOpenHadith?.(r)}
            style={({ pressed }) => [styles.chip, styles.hadith, pressed && styles.pressed]}
            accessibilityRole="link"
            accessibilityLabel={`${HADITH_NAMES[r.collectionId] ?? r.collectionId} ${r.number}`}
          >
            <ScrollText size={12} color={colors.success} strokeWidth={2.4} />
            <Text style={[styles.chipText, { color: colors.success }]}>
              {r.label ?? `${HADITH_NAMES[r.collectionId] ?? r.collectionId} ${r.number}`}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: { gap: 6 },
    label: { ...typography.caption, fontSize: 11, fontWeight: '700', color: colors.subtleForeground, textTransform: 'uppercase', letterSpacing: 0.5 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1 },
    quran: { backgroundColor: `${colors.primary}14`, borderColor: `${colors.primary}44` },
    hadith: { backgroundColor: `${colors.success}14`, borderColor: `${colors.success}44` },
    pressed: { opacity: 0.7 },
    chipText: { ...typography.caption, fontSize: 12, fontWeight: '700' },
  });
