/**
 * CitationChip — renders a [[quran:S:A]] / [[hadith:coll:num]] citation as a
 * small, tappable pill that deep-links into the reader or hadith library (F19).
 */
import { Pressable, StyleSheet, Text } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { typography } from '../../theme/tokens';

export type Citation =
  | { kind: 'quran'; surah: number; ayah: number; label: string }
  | { kind: 'hadith'; collectionId: string; number: number; label: string };

const HADITH_NAMES: Record<string, string> = {
  nawawi40: 'Nawawī 40',
  qudsi40: 'Ḥadīth Qudsī',
  bukhari: 'Bukhārī',
  muslim: 'Muslim',
  abudawud: 'Abū Dāwūd',
  tirmidhi: 'Tirmidhī',
  nasai: 'al-Nasāʾī',
  ibnmajah: 'Ibn Mājah',
  malik: 'Muwaṭṭaʾ',
  riyadussalihin: 'Riyāḍ al-Ṣāliḥīn',
};

/** Parse a raw citation token (without the brackets), or null if unrecognised. */
export function parseCitation(raw: string): Citation | null {
  const parts = raw.split(':').map((p) => p.trim());
  if (parts[0] === 'quran' && parts.length === 3) {
    const surah = Number(parts[1]);
    const ayah = Number(parts[2]);
    if (surah >= 1 && surah <= 114 && ayah >= 1) {
      return { kind: 'quran', surah, ayah, label: `Qurʾān ${surah}:${ayah}` };
    }
  }
  if (parts[0] === 'hadith' && parts.length === 3) {
    const number = Number(parts[2]);
    if (parts[1] && number >= 1) {
      const name = HADITH_NAMES[parts[1]] ?? parts[1];
      return { kind: 'hadith', collectionId: parts[1], number, label: `${name} ${number}` };
    }
  }
  return null;
}

export default function CitationChip({
  citation,
  onPress,
}: {
  citation: Citation;
  onPress: (c: Citation) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={() => onPress(citation)}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
      accessibilityRole="link"
      accessibilityLabel={citation.label}
    >
      <BookOpen size={11} color={colors.primary} strokeWidth={2.4} />
      <Text style={styles.text}>{citation.label}</Text>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingVertical: 1,
      paddingHorizontal: 6,
      borderRadius: 6,
      backgroundColor: `${colors.primary}1A`,
      borderWidth: 1,
      borderColor: `${colors.primary}44`,
    },
    pressed: { opacity: 0.7 },
    text: { ...typography.caption, fontSize: 11, fontWeight: '700', color: colors.primary },
  });
