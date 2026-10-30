import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BackButton from '../components/ui/BackButton';
import BrandMark from '../components/BrandMark';
import type { LegalDocument } from '../content/legal/types';
import { radius, spacing, typography } from '../theme/tokens';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

/**
 * LegalScreen — a single, elegant renderer for any LegalDocument
 * (Terms of Service, Privacy Policy). Quiet, readable, premium.
 */
export default function LegalScreen({
  doc,
  onBack,
}: {
  doc: LegalDocument;
  onBack?: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.flex}>
      <View style={styles.topBar}>
        <BackButton onPress={onBack} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <BrandMark size={34} layout="stack" />
        </View>
        <Text style={styles.eyebrow}>{doc.eyebrow.toUpperCase()}</Text>
        <Text style={styles.title}>{doc.title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>Last updated {doc.updated}</Text>
          <View style={styles.dot} />
          <Text style={styles.meta}>Effective {doc.effective}</Text>
        </View>

        {doc.intro.map((p, i) => (
          <Text key={`intro-${i}`} style={styles.intro}>
            {p}
          </Text>
        ))}

        {doc.sections.map((section, si) => (
          <View key={`sec-${si}`} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            {section.paragraphs?.map((p, pi) => (
              <Text key={`p-${si}-${pi}`} style={styles.paragraph}>
                {p}
              </Text>
            ))}
            {section.bullets?.map((b, bi) => (
              <View key={`b-${si}-${bi}`} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.closing}>
          {doc.closing.map((c, ci) => (
            <Text key={`c-${ci}`} style={styles.closingText}>
              {c}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  topBar: {
    paddingTop: spacing['3xl'] + spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  eyebrow: {
    ...typography.label,
    color: colors.primary,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  title: { ...typography.display, color: colors.foreground },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  meta: { ...typography.caption, color: colors.subtleForeground },
  dot: {
    width: 3,
    height: 3,
    borderRadius: radius.full,
    backgroundColor: colors.subtleForeground,
    marginHorizontal: spacing.sm,
  },
  intro: {
    ...typography.body,
    color: colors.mutedForeground,
    lineHeight: 23,
    marginBottom: spacing.md,
  },
  section: { marginTop: spacing.xl },
  heading: {
    ...typography.title,
    fontSize: 17,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  paragraph: {
    ...typography.body,
    color: colors.mutedForeground,
    lineHeight: 23,
    marginBottom: spacing.sm,
  },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.xs },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    marginTop: 8,
    marginRight: spacing.md,
  },
  bulletText: {
    ...typography.body,
    color: colors.mutedForeground,
    lineHeight: 23,
    flex: 1,
  },
  closing: {
    marginTop: spacing['2xl'],
    paddingTop: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  closingText: {
    ...typography.caption,
    color: colors.subtleForeground,
    marginBottom: spacing.xs,
  },
});
