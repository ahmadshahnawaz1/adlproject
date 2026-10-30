/**
 * StandardSheet — the user picks the position they follow on each of the three
 * contested questions. Both positions stay on screen; Adl does not choose.
 */
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { haptics } from '../../lib/haptics';
import { RULINGS, type StandardAxis } from '../../content/halal';
import type { HalalPrefs, Stance } from '../../lib/halal/assess';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

export default function StandardSheet({
  visible,
  prefs,
  onSet,
  onClose,
}: {
  visible: boolean;
  prefs: HalalPrefs;
  onSet: (axis: StandardAxis, stance: Stance) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const choose = (axis: StandardAxis, stance: Stance) => {
    haptics.selection();
    onSet(axis, stance);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <AppText style={styles.title}>Your standard</AppText>
            <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Close">
              <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <AppText style={styles.intro}>
              Scholars differ on these three questions, and the difference changes what gets flagged.
              Choose the position you follow. Adl does not choose for you, and the other view stays
              here beside it.
            </AppText>

            {RULINGS.map((ruling) => (
              <View key={ruling.axis} style={styles.card}>
                <View style={styles.cardHead}>
                  <AppText style={styles.cardTitle}>{ruling.title}</AppText>
                  <AppText style={styles.arabic}>{ruling.arabic}</AppText>
                </View>
                <AppText style={styles.question}>{ruling.question}</AppText>

                {ruling.positions.map((position) => {
                  const active = prefs[ruling.axis] === position.id;
                  return (
                    <Pressable
                      key={position.id}
                      onPress={() => choose(ruling.axis, position.id)}
                      style={[styles.option, active && styles.optionOn]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={position.title}
                    >
                      <View style={[styles.radio, active && styles.radioOn]}>
                        {active ? <Check size={13} color={colors.primaryForeground} strokeWidth={3} /> : null}
                      </View>
                      <View style={styles.optionText}>
                        <AppText style={[styles.optionTitle, active && styles.optionTitleOn]}>
                          {position.title}
                        </AppText>
                        <AppText style={styles.held}>{position.held}</AppText>
                        <AppText style={styles.detail}>{position.detail}</AppText>
                      </View>
                    </Pressable>
                  );
                })}

                <AppText style={styles.effect}>{ruling.effect}</AppText>

                {ruling.daleel.map((d) => (
                  <View key={d.source} style={styles.evidence}>
                    {d.arabic ? <AppText style={styles.evidenceArabic}>{d.arabic}</AppText> : null}
                    <AppText style={styles.detail}>{d.meaning}</AppText>
                    <AppText style={styles.ref}>{d.source}</AppText>
                  </View>
                ))}
              </View>
            ))}

            <AppText style={styles.footer}>
              Whatever you choose here, nothing prohibited by agreement is ever eased — pork, blood
              and intoxicants stay flagged.
            </AppText>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
    sheet: {
      maxHeight: '88%',
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { ...typography.title, fontSize: 18, color: colors.foreground },
    iconBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    content: { paddingVertical: spacing.md, gap: spacing.md },
    intro: { fontFamily, fontSize: 13, lineHeight: 21, color: colors.mutedForeground },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle: { ...typography.title, fontSize: 16, color: colors.foreground },
    arabic: { fontFamily, fontSize: 15, color: colors.primary },
    question: { fontFamily, fontSize: 13, lineHeight: 20, color: colors.mutedForeground },
    option: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'flex-start',
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    optionOn: { borderColor: colors.primary, backgroundColor: `${colors.primary}0F` },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    radioOn: { backgroundColor: colors.primary, borderColor: colors.primary },
    optionText: { flex: 1, gap: 2 },
    optionTitle: { fontFamily, fontSize: 14, fontWeight: '600', color: colors.foreground },
    optionTitleOn: { color: colors.primary },
    held: { ...typography.caption, fontSize: 11, color: colors.primary },
    detail: { flex: 1, fontFamily, fontSize: 12, lineHeight: 19, color: colors.mutedForeground },
    effect: { ...typography.caption, fontSize: 11, lineHeight: 18, color: colors.subtleForeground, fontStyle: 'italic' },
    evidence: {
      borderRadius: radius.md,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      backgroundColor: colors.cardElevated,
      padding: spacing.md,
      gap: 4,
    },
    evidenceArabic: { fontFamily, fontSize: 15, lineHeight: 30, color: colors.foreground, textAlign: 'right' },
    ref: { ...typography.caption, fontSize: 11, color: colors.primary },
    footer: { fontFamily, fontSize: 12, lineHeight: 19, color: colors.subtleForeground, textAlign: 'center' },
  });
