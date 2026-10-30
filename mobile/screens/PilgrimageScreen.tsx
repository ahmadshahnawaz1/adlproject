/**
 * PilgrimageScreen — the Ḥajj & ʿUmrah hub.
 *
 * At rest it is a threshold: two cinematic cards inviting the pilgrim into the
 * ʿUmrah or the Ḥajj. Once a journey is chosen it becomes a guided companion —
 * the JourneyRunner takes over, step by step, with its scenes, evidence and
 * counters. A date-aware banner reads the offline calendar and, in the days of
 * Ḥajj, offers to jump straight to today's rite. Nothing here leaves the device.
 */
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SlidersHorizontal, X } from 'lucide-react-native';
import { journeyOf } from '../content/pilgrimage';
import { formatHijriLong, toHijri } from '../lib/hijriCalendar';
import { dhulHijjahInfo } from '../lib/pilgrimageDates';
import { stepIndexForHijriDay } from '../lib/pilgrimage';
import usePilgrimageJourney from '../hooks/usePilgrimageJourney';
import usePilgrimagePrefs from '../hooks/usePilgrimagePrefs';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import JourneySelect from '../components/JourneySelect';
import JourneyRunner from './JourneyRunner';
import PilgrimageSettingsSheet from '../components/PilgrimageSettingsSheet';

export default function PilgrimageScreen({ onClose }: { onClose?: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const j = usePilgrimageJourney();
  const { prefs, ready: prefsReady, setPref, setReminder, reset } = usePilgrimagePrefs();

  const [now, setNow] = useState(() => new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);

  // A slow tick keeps the date-aware banner honest across midnight / ʿArafah.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const ready = j.ready && prefsReady;
  const active = j.active;
  const journey = active ? journeyOf(active) : null;

  const info = useMemo(() => dhulHijjahInfo(now), [now]);
  const previewDay = __DEV__ && prefs.previewHajj ? prefs.previewHijriDay : null;

  // The Hijri day to "jump to today" for the Ḥajj (real, or dev-previewed).
  const todayDay = previewDay ?? (info.inDhulHijjah && info.isHajjDays ? info.day : null);

  const bannerLabel = previewDay != null ? `Preview · ${previewDay} Dhū al-Ḥijjah` : info.label;
  const showBanner = !!bannerLabel;

  const title = active ? journey!.title : 'Pilgrimage';
  const sub = active ? formatHijriLong(toHijri(now)) : 'ʿUmrah & Ḥajj — step by step';

  const jumpToToday = () => {
    if (active !== 'hajj' || todayDay == null) return;
    const idx = stepIndexForHijriDay(journeyOf('hajj'), todayDay);
    if (idx != null) j.goToStep(idx);
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={active ? j.exitJourney : onClose} hitSlop={12} style={styles.iconBtn}>
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{sub}</Text>
        </View>
        <Pressable onPress={() => setSettingsOpen(true)} hitSlop={12} style={styles.iconBtn}>
          <SlidersHorizontal size={18} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
      </View>

      {/* Date-aware banner */}
      {showBanner ? (
        <View style={styles.banner}>
          <View style={styles.bannerDot} />
          <Text style={styles.bannerText} numberOfLines={2}>{bannerLabel}</Text>
          {active === 'hajj' && todayDay != null ? (
            <Pressable onPress={jumpToToday} hitSlop={8} style={styles.jumpBtn}>
              <Text style={styles.jumpText}>Go to today</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {/* Body */}
      {!ready ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : active && journey ? (
        <JourneyRunner kind={active} journey={journey} j={j} prefs={prefs} now={now} />
      ) : (
        <JourneySelect tiltEnabled={prefs.tiltParallax} onSelect={j.selectJourney} />
      )}

      <PilgrimageSettingsSheet
        visible={settingsOpen}
        prefs={prefs}
        onClose={() => setSettingsOpen(false)}
        onSetPref={setPref}
        onSetReminder={setReminder}
        onReset={reset}
      />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'] + spacing.md,
    paddingBottom: spacing.md,
  },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.sm },
  headerTitle: { ...typography.title, color: colors.foreground },
  headerSub: { ...typography.caption, fontSize: 12, color: colors.mutedForeground, marginTop: 1 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.25)',
    backgroundColor: 'rgba(255,214,10,0.08)',
  },
  bannerDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
  bannerText: { flex: 1, fontFamily, fontSize: typography.caption.fontSize, fontWeight: '600', color: colors.primary },
  jumpBtn: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: colors.primary },
  jumpText: { fontFamily, fontSize: typography.caption.fontSize, fontWeight: '700', color: colors.primaryForeground },
});
