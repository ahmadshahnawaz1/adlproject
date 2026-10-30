/**
 * HajjTypeCard — choosing how the Ḥajj is performed. The three types are laid
 * out side by side so the pilgrim sees the whole picture: Tamattuʿ (ʿUmrah,
 * release, then Ḥajj — with a hady), Qirān (ʿUmrah and Ḥajj together in one
 * iḥrām — with a hady), and Ifrād (Ḥajj alone — no hady). Selecting one tells
 * the journey, which then dims the steps that do not apply to it.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { HajjType } from '../content/pilgrimage';
import { arabicFont, colors, fontFamily, radius, spacing, typography } from '../theme/tokens';
import DaleelBlock from './DaleelBlock';

type Option = {
  key: HajjType;
  name: string;
  arabic: string;
  oneLiner: string;
  detail: string;
  hady: boolean;
};

const OPTIONS: Option[] = [
  {
    key: 'tamattu',
    name: 'Tamattuʿ',
    arabic: 'التَّمَتُّع',
    oneLiner: 'ʿUmrah → release → Ḥajj',
    detail:
      'Enter iḥrām for ʿUmrah, complete it (Ṭawāf, Saʿī, taqṣīr) and leave iḥrām — enjoying its release until you enter iḥrām again for Ḥajj on the 8th. The most common today, and what the Prophet ﷺ urged his Companions to do. A hady (sacrifice) is due.',
    hady: true,
  },
  {
    key: 'qiran',
    name: 'Qirān',
    arabic: 'الْقِرَان',
    oneLiner: 'ʿUmrah + Ḥajj together',
    detail:
      'Enter iḥrām for ʿUmrah and Ḥajj at once and remain in iḥrām throughout, performing one Ṭawāf and Saʿī of arrival that serves both. You do not leave iḥrām between them. A hady is due.',
    hady: true,
  },
  {
    key: 'ifrad',
    name: 'Ifrād',
    arabic: 'الْإِفْرَاد',
    oneLiner: 'Ḥajj alone',
    detail:
      'Enter iḥrām for Ḥajj only, with no ʿUmrah joined to it. You remain in iḥrām until the Day of Naḥr. No hady is due (though sacrifice remains recommended).',
    hady: false,
  },
];

export default function HajjTypeCard({
  selected,
  haptics = true,
  onSelect,
}: {
  selected: HajjType | null;
  haptics?: boolean;
  onSelect: (type: HajjType) => void;
}) {
  const pick = (t: HajjType) => {
    if (haptics) Haptics.selectionAsync().catch(() => {});
    onSelect(t);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>Choose your type of Ḥajj</Text>
      <Text style={styles.lede}>
        All three are valid and were performed in the Prophet’s ﷺ time. Pick the one that matches your plan — the journey then highlights what applies to you.
      </Text>

      {OPTIONS.map((o) => {
        const active = selected === o.key;
        return (
          <Pressable
            key={o.key}
            onPress={() => pick(o.key)}
            style={[styles.option, active && styles.optionActive]}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
          >
            <View style={styles.optionHead}>
              <View style={styles.radio}>
                <View style={[styles.radioDot, active && styles.radioDotActive]} />
              </View>
              <Text style={[styles.optionName, active && styles.optionNameActive]}>{o.name}</Text>
              <Text style={styles.optionArabic}>{o.arabic}</Text>
              <View style={{ flex: 1 }} />
              <View style={[styles.hadyChip, o.hady ? styles.hadyDue : styles.hadyNone]}>
                <Text style={[styles.hadyText, o.hady ? styles.hadyTextDue : styles.hadyTextNone]}>{o.hady ? 'Hady due' : 'No hady'}</Text>
              </View>
            </View>
            <Text style={styles.oneLiner}>{o.oneLiner}</Text>
            <Text style={styles.detail}>{o.detail}</Text>
          </Pressable>
        );
      })}

      <View style={styles.daleel}>
        <DaleelBlock
          daleel={{
            source: 'hadith',
            reference: 'Ṣaḥīḥ al-Bukhārī 1568, Muslim 1216',
            narrator: 'Jābir ibn ʿAbdillāh',
            grade: 'Ṣaḥīḥ',
            text: 'The Prophet ﷺ commanded those who had not brought a hady to make their iḥrām an ʿUmrah, circle the House, walk between Ṣafā and Marwah, shorten their hair, and leave iḥrām — i.e. to perform tamattuʿ.',
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  kicker: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  lede: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.mutedForeground },
  option: { backgroundColor: colors.cardElevated, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm },
  optionActive: { borderColor: colors.primary, backgroundColor: 'rgba(255,214,10,0.06)' },
  optionHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'transparent' },
  radioDotActive: { backgroundColor: colors.primary },
  optionName: { fontFamily, fontSize: typography.body.fontSize, fontWeight: '700', color: colors.foreground },
  optionNameActive: { color: colors.primary },
  optionArabic: { fontFamily: arabicFont, fontSize: 16, color: colors.mutedForeground, writingDirection: 'rtl' },
  hadyChip: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  hadyDue: { backgroundColor: 'rgba(255,214,10,0.12)' },
  hadyNone: { backgroundColor: 'rgba(113,113,122,0.14)' },
  hadyText: { fontFamily, fontSize: 11, fontWeight: '700' },
  hadyTextDue: { color: colors.primary },
  hadyTextNone: { color: colors.subtleForeground },
  oneLiner: { fontFamily, fontSize: typography.caption.fontSize, fontWeight: '600', color: colors.foreground },
  detail: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.mutedForeground },
  daleel: { marginTop: spacing.xs },
});
