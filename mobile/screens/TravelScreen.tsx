/**
 * TravelScreen — the traveller's concessions (F24).
 *
 * Sets a home point, measures how far you are from it, and lays out the day's
 * prayers as a traveller would pray them: the four-rakʿah prayers shortened,
 * and the two pairs that may be joined. Where the schools differ — the distance
 * that counts as travel, how long the concession lasts — both are shown and the
 * user chooses. Fully offline.
 */
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { House, Info, Link2, MapPin, Minus, Plane, Plus, X } from 'lucide-react-native';
import AppText from '../components/ui/AppText';
import useTravelMode from '../hooks/useTravelMode';
import { haptics } from '../lib/haptics';
import {
  MAX_THRESHOLD_KM,
  MIN_THRESHOLD_KM,
  statusLabel,
  travelPrayers,
  type ObligatoryPrayer,
} from '../lib/travel';
import {
  DALEEL_JOIN,
  DALEEL_QASR_CHARITY,
  DALEEL_QASR_PRACTICE,
  DALEEL_QASR_QURAN,
  DISTANCE_NOTE,
  DISTANCE_POSITIONS,
  DURATION_POSITIONS,
  JOIN_KINDS,
  JOIN_NOTE,
  JOIN_RULE,
  QASR_RULE,
  TRAVEL_DISCLAIMER,
  TRAVEL_INTRO,
  TRAVEL_NOTES,
} from '../content/travel';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const LABELS: Record<ObligatoryPrayer, string> = {
  fajr: 'Fajr',
  dhuhr: 'Ẓuhr',
  asr: 'ʿAṣr',
  maghrib: 'Maghrib',
  isha: 'ʿIshāʾ',
};

export default function TravelScreen({ onClose }: { onClose?: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const travel = useTravelMode();
  const [infoOpen, setInfoOpen] = useState(false);

  const { status, prefs } = travel;
  const prayers = travelPrayers(status.travelling);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Close">
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <AppText style={styles.headerTitle}>Travel</AppText>
          <AppText style={styles.headerSub} numberOfLines={1}>
            {status.travelling ? 'Concessions in effect' : 'Qaṣr & jamʿ'}
          </AppText>
        </View>
        <Pressable onPress={() => setInfoOpen(true)} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="About the traveller's prayer">
          <Info size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Status */}
        <View style={[styles.statusCard, status.travelling && styles.statusOn]}>
          <View style={[styles.statusIcon, status.travelling && styles.statusIconOn]}>
            {status.travelling ? (
              <Plane size={24} color={colors.primary} strokeWidth={2} />
            ) : (
              <House size={24} color={colors.mutedForeground} strokeWidth={2} />
            )}
          </View>
          <AppText style={styles.statusTitle}>
            {status.travelling ? 'You are a traveller' : 'You are resident'}
          </AppText>
          <AppText style={styles.statusSub}>{statusLabel(status)}</AppText>

          <View style={styles.overrideRow}>
            <AppText style={styles.overrideLabel}>Take the concession</AppText>
            <Switch
              value={status.travelling}
              onValueChange={(on) => {
                haptics.selection();
                travel.setOverride(on ? 'on' : 'off');
              }}
              trackColor={{ true: colors.primary, false: colors.border }}
              accessibilityLabel="Take the traveller's concession"
            />
          </View>
          {prefs.override !== 'auto' ? (
            <Pressable
              onPress={() => travel.setOverride('auto')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Return to automatic detection"
            >
              <AppText style={styles.autoLink}>Set manually · return to automatic</AppText>
            </Pressable>
          ) : null}
        </View>

        {/* Home point */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <AppText style={styles.cardTitle}>Home</AppText>
            {prefs.home ? (
              <Pressable onPress={travel.clearHome} hitSlop={8} accessibilityRole="button" accessibilityLabel="Clear home">
                <AppText style={styles.clear}>Clear</AppText>
              </Pressable>
            ) : null}
          </View>
          <AppText style={styles.cardBody}>
            {prefs.home
              ? prefs.homeLabel || 'Home point set'
              : 'Travel is measured from your home town. Set it once from where you live.'}
          </AppText>
          <Pressable
            onPress={() => {
              if (!travel.current) return;
              haptics.success();
              travel.setHome(travel.current, travel.currentLabel || 'Home');
            }}
            disabled={!travel.current}
            style={({ pressed }) => [
              styles.homeBtn,
              !travel.current && styles.homeBtnDisabled,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Set current location as home"
          >
            <MapPin size={16} color={colors.primaryForeground} strokeWidth={2.2} />
            <AppText style={styles.homeBtnText}>
              {prefs.home ? 'Update to current location' : 'Set current location as home'}
            </AppText>
          </Pressable>

          {/* Threshold */}
          <View style={styles.thresholdRow}>
            <View style={styles.thresholdText}>
              <AppText style={styles.thresholdLabel}>Distance that counts as travel</AppText>
              <AppText style={styles.thresholdHint}>The majority take about 80 km</AppText>
            </View>
            <View style={styles.stepper}>
              <Pressable
                onPress={() => travel.setThreshold(prefs.thresholdKm - 10)}
                disabled={prefs.thresholdKm <= MIN_THRESHOLD_KM}
                style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Decrease distance"
              >
                <Minus size={15} color={colors.foreground} strokeWidth={2.4} />
              </Pressable>
              <AppText style={styles.thresholdValue}>{prefs.thresholdKm} km</AppText>
              <Pressable
                onPress={() => travel.setThreshold(prefs.thresholdKm + 10)}
                disabled={prefs.thresholdKm >= MAX_THRESHOLD_KM}
                style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Increase distance"
              >
                <Plus size={15} color={colors.foreground} strokeWidth={2.4} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Today's prayers */}
        <View style={styles.card}>
          <AppText style={styles.cardTitle}>
            {status.travelling ? 'Pray them like this' : 'As a resident'}
          </AppText>
          <View style={styles.prayers}>
            {prayers.map((p) => (
              <View key={p.prayer} style={styles.prayerRow}>
                <AppText style={styles.prayerName}>{LABELS[p.prayer]}</AppText>
                <View style={styles.prayerRight}>
                  {p.joinsWith && status.travelling ? (
                    <View style={styles.joinChip}>
                      <Link2 size={11} color={colors.primary} strokeWidth={2.2} />
                      <AppText style={styles.joinChipText}>{LABELS[p.joinsWith]}</AppText>
                    </View>
                  ) : null}
                  {p.shortened ? (
                    <AppText style={styles.wasRakahs}>{p.fullRakahs}</AppText>
                  ) : null}
                  <AppText style={[styles.rakahs, p.shortened && styles.rakahsShort]}>
                    {p.rakahs}
                  </AppText>
                  <AppText style={styles.rakahsUnit}>rakʿah</AppText>
                </View>
              </View>
            ))}
          </View>
          <AppText style={styles.cardNote}>
            {status.travelling ? JOIN_RULE : QASR_RULE}
          </AppText>
        </View>

        <AppText style={styles.disclaimer}>{TRAVEL_DISCLAIMER}</AppText>
      </ScrollView>

      <Modal visible={infoOpen} transparent animationType="slide" onRequestClose={() => setInfoOpen(false)}>
        <View style={styles.infoRoot}>
          <Pressable style={styles.backdrop} onPress={() => setInfoOpen(false)} accessibilityLabel="Close" />
          <View style={styles.infoSheet}>
            <View style={styles.handle} />
            <View style={styles.cardHead}>
              <AppText style={styles.infoTitle}>The traveller’s prayer</AppText>
              <Pressable onPress={() => setInfoOpen(false)} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Close">
                <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.infoContent}>
              <AppText style={styles.infoBody}>{TRAVEL_INTRO}</AppText>
              <Evidence daleel={DALEEL_QASR_QURAN} />
              <Evidence daleel={DALEEL_QASR_CHARITY} />

              <AppText style={styles.infoLabel}>SHORTENING</AppText>
              <AppText style={styles.infoBody}>{QASR_RULE}</AppText>
              <Evidence daleel={DALEEL_QASR_PRACTICE} />

              <AppText style={styles.infoLabel}>JOINING</AppText>
              <AppText style={styles.infoBody}>{JOIN_RULE}</AppText>
              {JOIN_KINDS.map((k) => (
                <View key={k.kind} style={styles.position}>
                  <AppText style={styles.positionLabel}>{k.label}</AppText>
                  <AppText style={styles.infoBody}>{k.detail}</AppText>
                </View>
              ))}
              <Evidence daleel={DALEEL_JOIN} />
              <AppText style={styles.infoNote}>{JOIN_NOTE}</AppText>

              <AppText style={styles.infoLabel}>WHAT COUNTS AS TRAVEL</AppText>
              {DISTANCE_POSITIONS.map((p) => (
                <View key={p.id} style={styles.position}>
                  <AppText style={styles.positionLabel}>{p.label}</AppText>
                  <AppText style={styles.positionHeld}>{p.held}</AppText>
                  <AppText style={styles.infoBody}>{p.detail}</AppText>
                </View>
              ))}
              <AppText style={styles.infoNote}>{DISTANCE_NOTE}</AppText>

              <AppText style={styles.infoLabel}>HOW LONG IT LASTS</AppText>
              {DURATION_POSITIONS.map((p) => (
                <View key={p.id} style={styles.position}>
                  <AppText style={styles.positionLabel}>{p.label}</AppText>
                  <AppText style={styles.positionHeld}>{p.held}</AppText>
                  <AppText style={styles.infoBody}>{p.detail}</AppText>
                </View>
              ))}

              <AppText style={styles.infoLabel}>NOTES</AppText>
              {TRAVEL_NOTES.map((n) => (
                <View key={n} style={styles.noteRow}>
                  <AppText style={styles.bullet}>·</AppText>
                  <AppText style={styles.infoBody}>{n}</AppText>
                </View>
              ))}

              <View style={styles.infoDisclaimer}>
                <AppText style={styles.infoDisclaimerText}>{TRAVEL_DISCLAIMER}</AppText>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Evidence({
  daleel,
}: {
  daleel: { reference: string; narrator?: string; grade?: string; text: string };
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.evidence}>
      <AppText style={styles.evidenceText}>“{daleel.text}”</AppText>
      <AppText style={styles.evidenceRef}>
        {daleel.reference}
        {daleel.narrator ? ` · ${daleel.narrator}` : ''}
        {daleel.grade ? ` · ${daleel.grade}` : ''}
      </AppText>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingTop: spacing['3xl'] + spacing.md,
      paddingBottom: spacing.md,
    },
    iconBtn: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerCenter: { flex: 1, alignItems: 'center', gap: 1 },
    headerTitle: { fontFamily, fontSize: 16, fontWeight: '700', color: colors.foreground },
    headerSub: { fontFamily, fontSize: 11, color: colors.subtleForeground },
    scroll: { paddingBottom: spacing['3xl'], gap: spacing.lg },
    statusCard: {
      alignItems: 'center',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.lg,
      gap: spacing.xs,
    },
    statusOn: { borderColor: `${colors.primary}66` },
    statusIcon: {
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cardElevated,
      marginBottom: spacing.xs,
    },
    statusIconOn: { backgroundColor: `${colors.primary}1A` },
    statusTitle: { ...typography.title, fontSize: 19, color: colors.foreground },
    statusSub: { fontFamily, fontSize: 13, color: colors.mutedForeground, textAlign: 'center' },
    overrideRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      alignSelf: 'stretch',
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      minHeight: 44,
    },
    overrideLabel: { fontFamily, fontSize: 15, color: colors.foreground },
    autoLink: { ...typography.caption, fontSize: 11, color: colors.primary, marginTop: spacing.xs },
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
    cardBody: { fontFamily, fontSize: 13, lineHeight: 20, color: colors.mutedForeground },
    cardNote: {
      fontFamily,
      fontSize: 12,
      lineHeight: 19,
      color: colors.subtleForeground,
      marginTop: spacing.xs,
    },
    clear: { ...typography.caption, fontSize: 12, color: colors.destructive },
    homeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      minHeight: 46,
    },
    homeBtnDisabled: { opacity: 0.5 },
    homeBtnText: { ...typography.button, fontSize: 14, color: colors.primaryForeground },
    thresholdRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      marginTop: spacing.sm,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    thresholdText: { flex: 1, gap: 2 },
    thresholdLabel: { fontFamily, fontSize: 14, color: colors.foreground },
    thresholdHint: { ...typography.caption, fontSize: 11, color: colors.subtleForeground },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    stepBtn: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    thresholdValue: { ...typography.label, color: colors.primary, minWidth: 54, textAlign: 'center' },
    prayers: { gap: spacing.xs },
    prayerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      minHeight: 46,
    },
    prayerName: { fontFamily, fontSize: 15, color: colors.foreground },
    prayerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    joinChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: radius.full,
      backgroundColor: `${colors.primary}14`,
    },
    joinChipText: { ...typography.caption, fontSize: 10, color: colors.primary },
    wasRakahs: {
      fontFamily,
      fontSize: 13,
      color: colors.subtleForeground,
      textDecorationLine: 'line-through',
    },
    rakahs: { ...typography.title, fontSize: 17, color: colors.foreground },
    rakahsShort: { color: colors.primary },
    rakahsUnit: { ...typography.caption, fontSize: 10, color: colors.subtleForeground },
    disclaimer: {
      fontFamily,
      fontSize: 12,
      lineHeight: 18,
      color: colors.subtleForeground,
      textAlign: 'center',
    },
    infoRoot: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
    infoSheet: {
      maxHeight: '85%',
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
    infoTitle: { ...typography.title, fontSize: 18, color: colors.foreground },
    infoContent: { paddingVertical: spacing.md, gap: spacing.sm },
    infoLabel: {
      ...typography.caption,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.primary,
      marginTop: spacing.md,
    },
    infoBody: { fontFamily, fontSize: 14, lineHeight: 22, color: colors.mutedForeground },
    infoNote: { fontFamily, fontSize: 12, lineHeight: 19, color: colors.subtleForeground, fontStyle: 'italic' },
    position: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.md,
      gap: 3,
    },
    positionLabel: { ...typography.title, fontSize: 15, color: colors.foreground },
    positionHeld: { ...typography.caption, fontSize: 11, color: colors.primary },
    noteRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
    bullet: { fontFamily, fontSize: 16, color: colors.primary, lineHeight: 22 },
    evidence: {
      borderRadius: radius.md,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      backgroundColor: colors.card,
      padding: spacing.md,
      gap: 4,
    },
    evidenceText: { fontFamily, fontSize: 14, lineHeight: 22, color: colors.foreground },
    evidenceRef: { ...typography.caption, fontSize: 11, color: colors.primary },
    infoDisclaimer: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    infoDisclaimerText: { fontFamily, fontSize: 12, lineHeight: 19, color: colors.subtleForeground },
    pressed: { opacity: 0.85 },
  });
