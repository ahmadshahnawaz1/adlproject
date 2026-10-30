/**
 * PromptStarters — Islamic suggestion chips shown on an empty ADL AI thread.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { fontFamily, radius, spacing } from '../../theme/tokens';

const STARTERS = [
  'Explain the meaning of Āyat al-Kursī',
  'A duʿāʾ for anxiety and worry',
  'How do I perform wuḍūʾ, step by step?',
  'Summarise the lessons of Sūrat al-Kahf',
  'What breaks the fast in Ramaḍān?',
  'Tell me about the character of the Prophet ﷺ',
];

export default function PromptStarters({ onPick }: { onPick: (text: string) => void }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.wrap}>
      {STARTERS.map((s) => (
        <Pressable
          key={s}
          onPress={() => onPick(s)}
          style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <Text style={styles.text}>{s}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: { gap: spacing.sm },
    chip: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    pressed: { opacity: 0.85, borderColor: colors.borderFocus },
    text: { fontFamily, fontSize: 14, color: colors.foreground },
  });
