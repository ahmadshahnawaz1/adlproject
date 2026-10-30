/**
 * SirahGradeBadge — the authenticity chip on every Sīrah event (F20).
 *
 * Colour-codes the grade (established → weak → disputed) with an icon, so the
 * reader always knows how firmly a report is established. The trust signal that
 * distinguishes this Sīrah from folklore.
 */
import { StyleSheet, Text, View } from 'react-native';
import { BadgeCheck, CircleCheck, CircleDashed, ShieldCheck, TriangleAlert } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { gradeMeta, type SirahGrade } from '../../lib/sirah';
import { typography } from '../../theme/tokens';

const WARNING = '#F59E0B';

const ICON = {
  established: ShieldCheck,
  'well-supported': BadgeCheck,
  reported: CircleCheck,
  weak: TriangleAlert,
  disputed: CircleDashed,
} as const;

function toneColor(tone: string, colors: ThemeColors): string {
  switch (tone) {
    case 'success': return colors.success;
    case 'primary': return colors.primary;
    case 'warning': return WARNING;
    case 'subtle': return colors.subtleForeground;
    default: return colors.mutedForeground;
  }
}

export default function SirahGradeBadge({ grade, size = 'md' }: { grade: SirahGrade; size?: 'sm' | 'md' }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const meta = gradeMeta(grade);
  const color = toneColor(meta.tone, colors);
  const Icon = ICON[grade] ?? CircleCheck;
  const px = size === 'sm' ? 11 : 13;

  return (
    <View style={[styles.badge, { backgroundColor: `${color}1A`, borderColor: `${color}55` }]}>
      <Icon size={px} color={color} strokeWidth={2.4} />
      <Text style={[styles.text, { color, fontSize: size === 'sm' ? 10 : 11 }]}>{meta.short}</Text>
    </View>
  );
}

const makeStyles = (_colors: ThemeColors) =>
  StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 2,
      paddingHorizontal: 7,
      borderRadius: 7,
      borderWidth: 1,
      alignSelf: 'flex-start',
    },
    text: { ...typography.caption, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  });
