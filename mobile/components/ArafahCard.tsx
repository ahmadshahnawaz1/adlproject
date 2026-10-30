/**
 * ArafahCard — the standing-place of ʿArafah, the greatest day of Ḥajj ("Ḥajj
 * is ʿArafah"). It reads the offline calendar: on the ninth it announces the
 * Day of ʿArafah; otherwise it counts the days to it. The best duʿāʾ of the day
 * is given, with the practical guidance of the wuqūf and its evidence.
 */
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Dua as FastingDua } from '../content/fasting';
import { DUA_ARAFAH } from '../content/pilgrimage';
import { daysUntilArafah, dhulHijjahInfo } from '../lib/pilgrimageDates';
import { colors, fontFamily, radius, spacing, typography } from '../theme/tokens';
import DaleelBlock from './DaleelBlock';
import DuaCard from './DuaCard';

export default function ArafahCard({ showArabic = true, now = new Date() }: { showArabic?: boolean; now?: Date }) {
  const info = useMemo(() => dhulHijjahInfo(now), [now]);
  const until = useMemo(() => daysUntilArafah(now), [now]);

  const banner = info.phase === 'arafah'
    ? { tone: 'today' as const, text: 'Today is the Day of ʿArafah' }
    : until != null && until > 0
      ? { tone: 'soon' as const, text: until === 1 ? 'ʿArafah is tomorrow, in shāʾ Allāh' : `ʿArafah is in about ${until} days` }
      : { tone: 'soon' as const, text: 'The plain of standing' };

  return (
    <View style={styles.wrap}>
      <View style={[styles.banner, banner.tone === 'today' && styles.bannerToday]}>
        <Text style={[styles.bannerText, banner.tone === 'today' && styles.bannerTextToday]}>{banner.text}</Text>
      </View>

      <Text style={styles.lede}>
        From past noon until sunset the pilgrims stand on ʿArafah — facing the qiblah, hands raised, in earnest supplication, repentance and remembrance. To miss it is to miss the Ḥajj. Combine and shorten Ẓuhr and ʿAṣr at Namira, then give the day to duʿāʾ.
      </Text>

      <DuaCard dua={DUA_ARAFAH as unknown as FastingDua} showArabic={showArabic} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Make the most of it</Text>
        <Bullet text="Stand (or sit) within the boundary of ʿArafah — all of it is a standing-place except the valley of ʿUranah." />
        <Bullet text="Face the qiblah, raise your hands, and persist in duʿāʾ until sunset — do not leave before the sun sets." />
        <Bullet text="Repeat the best remembrance of the day, seek forgiveness, and pray for yourself, your family and the Ummah." />
        <Bullet text="For non-pilgrims: fasting the Day of ʿArafah expiates two years (Muslim 1162)." />
      </View>

      <DaleelBlock
        daleel={{
          source: 'hadith',
          reference: 'Sunan al-Tirmidhī 889, al-Nasāʾī 3016',
          narrator: 'ʿAbd al-Raḥmān ibn Yaʿmar',
          grade: 'Ṣaḥīḥ',
          text: 'The Prophet ﷺ said: "Ḥajj is ʿArafah. Whoever reaches ʿArafah before dawn (of the 10th) has caught the Ḥajj."',
        }}
      />
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletMark}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  banner: { backgroundColor: colors.cardElevated, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  bannerToday: { backgroundColor: 'rgba(255,214,10,0.12)', borderColor: colors.primary },
  bannerText: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '600', color: colors.mutedForeground, textAlign: 'center' },
  bannerTextToday: { color: colors.primary, fontWeight: '700' },
  lede: { fontFamily, fontSize: typography.body.fontSize, lineHeight: 22, color: colors.mutedForeground },
  section: { gap: spacing.sm },
  sectionTitle: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '600', color: colors.subtleForeground, textTransform: 'uppercase', letterSpacing: 0.5 },
  bulletRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  bulletMark: { fontFamily, fontSize: typography.body.fontSize, color: colors.primary, lineHeight: 21 },
  bulletText: { flex: 1, fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.mutedForeground },
});
