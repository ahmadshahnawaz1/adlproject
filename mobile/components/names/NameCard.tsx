/**
 * NameCard — one of the Beautiful Names as a browsable row: the Arabic in the
 * calligraphic face, its transliteration and meaning, and the marks for
 * memorised and favourited.
 */
import { Pressable, StyleSheet, View } from 'react-native';
import { CircleCheck, Heart } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { arabicFont, fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import type { DivineName } from '../../lib/names';

export default function NameCard({
  name,
  memorised,
  favourite,
  onPress,
}: {
  name: DivineName;
  memorised: boolean;
  favourite: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${name.transliteration}, ${name.meaning}${memorised ? ', memorised' : ''}`}
    >
      <View style={styles.numberWrap}>
        <AppText style={styles.number}>{name.number}</AppText>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText style={styles.translit} numberOfLines={1}>
            {name.transliteration}
          </AppText>
          {favourite ? <Heart size={13} color={colors.primary} strokeWidth={2.4} fill={colors.primary} /> : null}
          {memorised ? <CircleCheck size={14} color={colors.success} strokeWidth={2.4} /> : null}
        </View>
        <AppText style={styles.meaning} numberOfLines={1}>
          {name.meaning}
        </AppText>
      </View>

      <AppText style={styles.arabic} numberOfLines={1}>
        {name.arabic}
      </AppText>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      minHeight: 62,
    },
    pressed: { opacity: 0.85, backgroundColor: colors.cardElevated },
    numberWrap: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.primary}1A`,
    },
    number: { ...typography.caption, fontSize: 12, fontWeight: '700', color: colors.primary },
    body: { flex: 1, minWidth: 0, gap: 2 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    translit: { fontFamily, fontSize: 15, fontWeight: '600', color: colors.foreground, flexShrink: 1 },
    meaning: { fontFamily, fontSize: 13, color: colors.mutedForeground },
    arabic: { fontFamily: arabicFont, fontSize: 22, color: colors.primary, textAlign: 'right' },
  });
