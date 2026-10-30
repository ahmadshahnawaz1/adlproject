/**
 * IhramGuideCard — the practical guide to entering and keeping iḥrām: the two
 * garments, the five mawāqīt (with the note for those arriving by air), what
 * iḥrām forbids (the maḥdhūrāt, each with its evidence and expiation), and the
 * reassurances of what it permits. Gender-scoped prohibitions are filtered to
 * the pilgrim, with the others available on a tap.
 */
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  IHRAM_GARMENTS,
  IHRAM_PERMITTED,
  MAHDHURAT,
  MAWAQIT,
  MIQAT_BY_AIR,
} from '../content/pilgrimage';
import type { Gender } from '../content/pilgrimage';
import { arabicFont, colors, fontFamily, radius, spacing, typography } from '../theme/tokens';
import DaleelBlock from './DaleelBlock';

export default function IhramGuideCard({ gender = 'male' }: { gender?: Gender }) {
  const [showAllProhibitions, setShowAllProhibitions] = useState(false);

  const prohibitions = useMemo(() => {
    if (showAllProhibitions) return MAHDHURAT;
    return MAHDHURAT.filter((m) => !m.gender || m.gender === gender);
  }, [showAllProhibitions, gender]);

  return (
    <View style={styles.wrap}>
      {/* garments */}
      <Section title="The garments of iḥrām">
        <Bullet text={IHRAM_GARMENTS.izar} />
        <Bullet text={IHRAM_GARMENTS.rida} />
        <Text style={styles.aside}>
          Women have no special dress — any modest clothing, in any colour, that is not a fitted niqāb or gloves.
        </Text>
      </Section>

      {/* mawaqit */}
      <Section title="The mawāqīt — stations of iḥrām">
        {MAWAQIT.map((m) => (
          <View key={m.id} style={styles.miqat}>
            <View style={styles.miqatHead}>
              <Text style={styles.miqatName}>{m.name}</Text>
              <Text style={styles.miqatArabic}>{m.arabicName}</Text>
            </View>
            <Text style={styles.miqatFor}>{m.forText}</Text>
            <Text style={styles.miqatDist}>≈ {m.approxKmFromMakkah} km from Makkah</Text>
          </View>
        ))}
        <View style={styles.airNote}>
          <Text style={styles.airNoteTitle}>Arriving by air</Text>
          <Text style={styles.airNoteText}>{MIQAT_BY_AIR}</Text>
        </View>
      </Section>

      {/* prohibitions */}
      <Section title="What iḥrām forbids (maḥdhūrāt)">
        {prohibitions.map((m) => (
          <View key={m.id} style={styles.prohibition}>
            <Text style={styles.prohibitionText}>{m.text}</Text>
            {m.fidya ? (
              <View style={styles.fidya}>
                <Text style={styles.fidyaLabel}>Expiation</Text>
                <Text style={styles.fidyaText}>{m.fidya}</Text>
              </View>
            ) : null}
            {m.daleel ? (
              <View style={styles.prohibitionDaleel}>
                <DaleelBlock daleel={m.daleel} />
              </View>
            ) : null}
          </View>
        ))}
        <Pressable onPress={() => setShowAllProhibitions((v) => !v)} hitSlop={8} style={styles.toggle}>
          <Text style={styles.toggleText}>
            {showAllProhibitions ? 'Show only mine' : 'Show all (men & women)'}
          </Text>
        </Pressable>
      </Section>

      {/* permitted */}
      <Section title="What iḥrām still permits">
        {IHRAM_PERMITTED.map((p, i) => (
          <Bullet key={i} text={p} tone="success" />
        ))}
      </Section>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={{ gap: spacing.sm }}>{children}</View>
    </View>
  );
}

function Bullet({ text, tone = 'default' }: { text: string; tone?: 'default' | 'success' }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={[styles.bulletMark, tone === 'success' && styles.bulletMarkSuccess]}>{tone === 'success' ? '✓' : '•'}</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xl },
  section: { gap: spacing.sm },
  sectionTitle: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  aside: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 19, color: colors.subtleForeground, fontStyle: 'italic' },
  miqat: { backgroundColor: colors.cardElevated, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: 2 },
  miqatHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  miqatName: { flex: 1, fontFamily, fontSize: typography.body.fontSize, fontWeight: '600', color: colors.foreground },
  miqatArabic: { fontFamily: arabicFont, fontSize: 16, color: colors.primary, writingDirection: 'rtl' },
  miqatFor: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 19, color: colors.mutedForeground },
  miqatDist: { fontFamily, fontSize: typography.caption.fontSize, color: colors.subtleForeground },
  airNote: { backgroundColor: 'rgba(255,214,10,0.08)', borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(255,214,10,0.25)', padding: spacing.md, gap: 4 },
  airNoteTitle: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '700', color: colors.primary },
  airNoteText: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.mutedForeground },
  prohibition: { backgroundColor: colors.cardElevated, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm },
  prohibitionText: { fontFamily, fontSize: typography.body.fontSize, lineHeight: 21, color: colors.foreground },
  fidya: { backgroundColor: colors.input, borderRadius: radius.sm, padding: spacing.sm, gap: 2 },
  fidyaLabel: { fontFamily, fontSize: 11, fontWeight: '700', color: colors.subtleForeground, textTransform: 'uppercase', letterSpacing: 0.5 },
  fidyaText: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 19, color: colors.mutedForeground },
  prohibitionDaleel: { marginTop: 2 },
  toggle: { alignSelf: 'flex-start', paddingVertical: spacing.xs },
  toggleText: { fontFamily, fontSize: typography.caption.fontSize, fontWeight: '600', color: colors.primary },
  bulletRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  bulletMark: { fontFamily, fontSize: typography.body.fontSize, color: colors.mutedForeground, lineHeight: 21 },
  bulletMarkSuccess: { color: colors.success },
  bulletText: { flex: 1, fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.mutedForeground },
});
