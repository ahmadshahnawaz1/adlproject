/**
 * TalbiyahCard — the call of the pilgrim, given its own breathing presence. The
 * Arabic sits over a softly pulsing gold halo (the breathing glow used across
 * the app), with its transliteration, translation and evidence. The pilgrim
 * raises it aloud from iḥrām and repeats it often, especially on ascending and
 * descending and when meeting others.
 */
import { Animated, StyleSheet, Text, View } from 'react-native';
import { TALBIYAH } from '../content/pilgrimage';
import useBreathing from '../hooks/useBreathing';
import { arabicFont, fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import DaleelBlock from './DaleelBlock';

export default function TalbiyahCard({ showArabic = true }: { showArabic?: boolean }) {
  const styles = useThemedStyles(makeStyles);
  const { opacity } = useBreathing({ min: 0.25, max: 0.7, duration: 2000 });

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>The Talbiyah · {TALBIYAH.when}</Text>

      <View style={styles.arabicWrap}>
        <Animated.View pointerEvents="none" style={[styles.halo, { opacity }]} />
        {showArabic ? <Text style={styles.arabic}>{TALBIYAH.arabic}</Text> : null}
      </View>

      <Text style={styles.translit}>{TALBIYAH.transliteration}</Text>
      <Text style={styles.translation}>{TALBIYAH.translation}</Text>

      <View style={styles.reminder}>
        <Text style={styles.reminderText}>
          Raise it aloud (men) and repeat it often — on rising and descending, after each prayer, and when meeting others. Cease it for ʿUmrah on beginning Ṭawāf, and for Ḥajj on stoning Jamratu-l-ʿAqaba.
        </Text>
      </View>

      {TALBIYAH.daleel ? (
        <View style={styles.daleel}>
          <DaleelBlock daleel={TALBIYAH.daleel} />
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md },
  kicker: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '600', color: colors.primary, letterSpacing: 0.3 },
  arabicWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg, position: 'relative' },
  halo: { position: 'absolute', width: 220, height: 120, borderRadius: 110, backgroundColor: colors.primary, opacity: 0.4 },
  arabic: { fontFamily: arabicFont, fontSize: 26, lineHeight: 48, color: colors.foreground, textAlign: 'center', writingDirection: 'rtl' },
  translit: { fontFamily, fontSize: typography.body.fontSize, lineHeight: 23, color: colors.foreground, fontStyle: 'italic', textAlign: 'center' },
  translation: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 21, color: colors.mutedForeground, textAlign: 'center' },
  reminder: { backgroundColor: colors.cardElevated, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  reminderText: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.mutedForeground },
  daleel: { marginTop: 2 },
});
