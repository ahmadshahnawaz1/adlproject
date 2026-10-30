/**
 * SalahStepCard — one posture of the prayer, rendered in full: its cinematic
 * scene, its legal rank (rukn / wājib / sunnah), whether it is recited aloud or
 * silently, its names in English, Arabic and transliteration, the physical
 * instruction, a clarifying tip, and the recitations said within it — each with
 * its Arabic, transliteration, translation and (one tap away) its evidence,
 * along with the points on which the schools differ.
 *
 * The card is calm by default: the scholarship — every daleel and every note —
 * waits behind a single "Show evidence" reveal, so a learner is never
 * overwhelmed yet can always verify.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BookOpen, Volume2, VolumeX } from 'lucide-react-native';
import type { SalahRank, SalahStep } from '../content/salah';
import { rankLabel } from '../lib/salah';
import { arabicFont, fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import DaleelBlock from './DaleelBlock';
import PostureScene from './PostureScene';

const makeRankTone = (colors: ThemeColors) => (rank: SalahRank): { bg: string; fg: string } => {
  switch (rank) {
    case 'rukn':
      return { bg: 'rgba(255,214,10,0.12)', fg: colors.primary };
    case 'wajib':
      return { bg: 'rgba(161,161,170,0.12)', fg: colors.mutedForeground };
    default:
      return { bg: 'rgba(113,113,122,0.12)', fg: colors.subtleForeground };
  }
};

export default function SalahStepCard({
  step,
  showArabic = true,
  tiltEnabled = true,
}: {
  step: SalahStep;
  showArabic?: boolean;
  tiltEnabled?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [showEvidence, setShowEvidence] = useState(false);
  const tone = makeRankTone(colors)(step.rank);
  const hasEvidence =
    (step.daleel?.length ?? 0) > 0 ||
    (step.notes?.length ?? 0) > 0 ||
    step.recitations.some((r) => r.daleel);

  return (
    <View style={styles.wrap}>
      {/* the cinematic posture */}
      <View style={styles.scene}>
        <PostureScene art={step.art} tiltEnabled={tiltEnabled} />
        {step.rakah > 0 ? (
          <View style={styles.rakahChip}>
            <Text style={styles.rakahText}>
              Rakʿah {step.rakah} of {step.totalRakahs}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        {/* rank + audible */}
        <View style={styles.tagRow}>
          <View style={[styles.rankChip, { backgroundColor: tone.bg }]}>
            <Text style={[styles.rankText, { color: tone.fg }]}>{rankLabel(step.rank)}</Text>
          </View>
          {step.audible !== undefined ? (
            <View style={styles.audibleChip}>
              {step.audible ? (
                <Volume2 size={12} color={colors.mutedForeground} strokeWidth={2.2} />
              ) : (
                <VolumeX size={12} color={colors.mutedForeground} strokeWidth={2.2} />
              )}
              <Text style={styles.audibleText}>{step.audible ? 'Aloud · jahr' : 'Silent · sirr'}</Text>
            </View>
          ) : null}
        </View>

        {/* names */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>{step.name}</Text>
          {showArabic ? <Text style={styles.arabic}>{step.arabic}</Text> : null}
        </View>
        <Text style={styles.translit}>{step.transliteration}</Text>

        {/* instruction + tip */}
        <Text style={styles.instruction}>{step.instruction}</Text>
        {step.tip ? (
          <View style={styles.tip}>
            <Text style={styles.tipText}>{step.tip}</Text>
          </View>
        ) : null}

        {/* recitations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What you say</Text>
          <View style={{ gap: spacing.md }}>
            {step.recitations.map((r) => (
              <View key={r.id} style={styles.recitation}>
                {r.label || r.repeat ? (
                  <View style={styles.recLabelRow}>
                    {r.label ? <Text style={styles.recLabel}>{r.label}</Text> : <View />}
                    {r.repeat ? (
                      <View style={styles.repeatChip}>
                        <Text style={styles.repeatText}>×{r.repeat}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
                {showArabic ? <Text style={styles.recArabic}>{r.arabic}</Text> : null}
                <Text style={styles.recTranslit}>{r.transliteration}</Text>
                <Text style={styles.recTranslation}>{r.translation}</Text>
                {showEvidence && r.daleel ? (
                  <View style={styles.recDaleel}>
                    <DaleelBlock daleel={r.daleel} />
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        </View>

        {/* evidence + notes reveal */}
        {hasEvidence ? (
          <Pressable style={styles.evidenceToggle} onPress={() => setShowEvidence((v) => !v)}>
            <BookOpen size={15} color={colors.primary} strokeWidth={2.2} />
            <Text style={styles.evidenceToggleText}>
              {showEvidence ? 'Hide evidence' : 'Show evidence'}
            </Text>
          </Pressable>
        ) : null}

        {showEvidence ? (
          <View style={{ gap: spacing.md }}>
            {step.notes && step.notes.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Points of difference</Text>
                <View style={{ gap: spacing.sm }}>
                  {step.notes.map((n) => (
                    <View key={n.id} style={styles.note}>
                      <Text style={styles.noteText}>{n.text}</Text>
                      {n.daleel ? (
                        <View style={styles.noteDaleel}>
                          <DaleelBlock daleel={n.daleel} />
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {step.daleel && step.daleel.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Evidence</Text>
                <View style={{ gap: spacing.sm }}>
                  {step.daleel.map((d, i) => (
                    <DaleelBlock key={i} daleel={d} />
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: { backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  scene: { position: 'relative' },
  rakahChip: {
    position: 'absolute',
    left: spacing.md,
    bottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rakahText: { fontFamily, fontSize: typography.caption.fontSize, color: colors.foreground },
  body: { padding: spacing.lg, gap: spacing.md },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  rankChip: { borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 4 },
  rankText: { fontFamily, fontSize: typography.caption.fontSize, fontWeight: '600' },
  audibleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    backgroundColor: colors.cardElevated,
  },
  audibleText: { fontFamily, fontSize: typography.caption.fontSize, fontWeight: '600', color: colors.mutedForeground },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.md },
  title: { flex: 1, fontFamily, fontSize: typography.title.fontSize, fontWeight: '700', color: colors.foreground, letterSpacing: typography.title.letterSpacing },
  arabic: { fontFamily: arabicFont, fontSize: 20, color: colors.primary, writingDirection: 'rtl' },
  translit: { fontFamily, fontSize: typography.body.fontSize, fontStyle: 'italic', color: colors.primary, marginTop: -spacing.sm },
  instruction: { fontFamily, fontSize: typography.body.fontSize, lineHeight: 22, color: colors.mutedForeground },
  tip: { backgroundColor: colors.cardElevated, borderRadius: radius.md, borderLeftWidth: 2, borderLeftColor: colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  tipText: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 19, color: colors.mutedForeground },
  section: { gap: spacing.sm },
  sectionTitle: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '600', color: colors.subtleForeground, textTransform: 'uppercase', letterSpacing: 0.5 },
  recitation: { backgroundColor: colors.cardElevated, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: 4 },
  recLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, marginBottom: 2 },
  recLabel: { flex: 1, fontFamily, fontSize: typography.caption.fontSize, fontWeight: '600', color: colors.subtleForeground },
  repeatChip: { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 1, backgroundColor: `${colors.primary}1A` },
  repeatText: { fontFamily, fontSize: 11, fontWeight: '700', color: colors.primary },
  recArabic: { fontFamily: arabicFont, fontSize: 24, lineHeight: 44, color: colors.foreground, textAlign: 'right', writingDirection: 'rtl' },
  recTranslit: { fontFamily, fontSize: 14, fontStyle: 'italic', color: colors.primary, lineHeight: 21 },
  recTranslation: { fontFamily, fontSize: 14, color: colors.mutedForeground, lineHeight: 21 },
  recDaleel: { marginTop: spacing.sm },
  evidenceToggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'flex-start', paddingVertical: spacing.xs },
  evidenceToggleText: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '600', color: colors.primary },
  note: { backgroundColor: colors.cardElevated, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm },
  noteText: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.mutedForeground },
  noteDaleel: { marginTop: 2 },
});
