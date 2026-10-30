/**
 * QadrNightsCard — the last ten nights laid out as real dates, with the odd
 * nights emphasised and each night markable as revived. Makes plain that a
 * night begins at sunset on the preceding evening.
 */
import { Pressable, StyleSheet, View } from 'react-native';
import { CircleCheck, Sparkles } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { haptics } from '../../lib/haptics';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { nightKey, type QadrNight } from '../../lib/ramadan';

function evening(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function QadrNightsCard({
  nights,
  revived,
  onToggle,
}: {
  nights: QadrNight[];
  revived: Set<string>;
  onToggle: (key: string) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  if (nights.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Sparkles size={15} color={colors.primary} strokeWidth={2.2} />
        <AppText style={styles.kicker}>THE LAST TEN NIGHTS</AppText>
      </View>
      <AppText style={styles.note}>
        A night begins at sunset — the night of the 27th starts on the evening before.
      </AppText>

      <View style={styles.grid}>
        {nights.map((night) => {
          const key = nightKey(night.startsEvening);
          const done = revived.has(key);
          return (
            <Pressable
              key={night.hijriDay}
              onPress={() => {
                haptics.selection();
                onToggle(key);
              }}
              style={({ pressed }) => [
                styles.night,
                night.odd && styles.nightOdd,
                done && styles.nightDone,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: done }}
              accessibilityLabel={`Night of Ramaḍān ${night.hijriDay}${night.odd ? ', an odd night' : ''}, beginning the evening of ${evening(night.startsEvening)}${done ? ', revived' : ''}`}
            >
              <View style={styles.nightTop}>
                <AppText style={[styles.nightNum, night.odd && styles.nightNumOdd]}>
                  {night.hijriDay}
                </AppText>
                {done ? <CircleCheck size={13} color={colors.success} strokeWidth={2.6} /> : null}
              </View>
              <AppText style={styles.nightDate} numberOfLines={1}>
                {evening(night.startsEvening)}
              </AppText>
              {night.odd ? <AppText style={styles.oddTag}>odd</AppText> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    head: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    kicker: {
      ...typography.caption,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.primary,
    },
    note: { fontFamily, fontSize: 12, lineHeight: 18, color: colors.subtleForeground },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
    night: {
      width: '18%',
      minWidth: 62,
      flexGrow: 1,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      paddingVertical: spacing.sm,
      paddingHorizontal: 6,
      gap: 2,
      minHeight: 62,
    },
    nightOdd: { borderColor: `${colors.primary}66` },
    nightDone: { backgroundColor: `${colors.success}14`, borderColor: colors.success },
    nightTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    nightNum: { ...typography.title, fontSize: 16, color: colors.foreground },
    nightNumOdd: { color: colors.primary },
    nightDate: { fontFamily, fontSize: 10, color: colors.subtleForeground },
    oddTag: { ...typography.caption, fontSize: 9, color: colors.primary },
    pressed: { opacity: 0.85 },
  });
