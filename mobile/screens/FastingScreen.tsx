/**
 * FastingScreen — the unified Fasting & Ramadan hub.
 *
 * Outside Ramadan it is a calm fasting companion: today's fasting window, the
 * make-up (qaḍāʾ) ledger, the recommended voluntary fasts, the duʿās and the
 * fiqh. The moment the offline Hijri calendar enters Ramadan it transforms into
 * a full command centre — month progress, the ʿashra, Laylatul-Qadr in the last
 * ten, the Qurʾān khatm and the road to Eid — all rising to the top.
 *
 * It owns no Islamic maths: prayer times come from the offline engine, the
 * Hijri position from the calendar, and every derived moment from lib/fasting.
 * State is the four persisted hooks; a one-second tick drives the live arc.
 */
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SlidersHorizontal, X } from 'lucide-react-native';
import { getPrayerTimes } from '../lib/prayerTimes';
import { formatHijriLong, toHijri, type HijriDate } from '../lib/hijriCalendar';
import {
  countdownTarget,
  daysUntilEidFitr,
  fastDurationMs,
  fastPhase,
  fastProgress,
  fastTimes,
  forbiddenFastOn,
  ramadanGridDates,
  ramadanInfo,
  upcomingVoluntaryFasts,
} from '../lib/fasting';
import { formatCountdown, formatDuration, dayKeyInZone } from '../lib/clock';
import { scheduleFastingReminders, cancelAllFasting } from '../lib/fastingNotifications';
import { ASHRAS, FASTING_DUAS, RAMADAN_MONTH } from '../content/fasting';
import useFastingPrefs from '../hooks/useFastingPrefs';
import useFastingLog from '../hooks/useFastingLog';
import useFastingLedger from '../hooks/useFastingLedger';
import useQuranKhatm from '../hooks/useQuranKhatm';
import useResolvedSettings from '../hooks/useResolvedSettings';
import useFormattedTime from '../hooks/useFormattedTime';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import FastingDayArc from '../components/FastingDayArc';
import FastingTimesCard from '../components/FastingTimesCard';
import RamadanProgressStrip from '../components/RamadanProgressStrip';
import AshraCard from '../components/AshraCard';
import LaylatulQadrCard from '../components/LaylatulQadrCard';
import EidCard from '../components/EidCard';
import FastingMonthGrid from '../components/FastingMonthGrid';
import FastingLedgerCard from '../components/FastingLedgerCard';
import FidyahKaffarahCard from '../components/FidyahKaffarahCard';
import VoluntaryFastsCard from '../components/VoluntaryFastsCard';
import QuranKhatmCard from '../components/QuranKhatmCard';
import DuaCard from '../components/DuaCard';
import FastingNotesCard from '../components/FastingNotesCard';
import FastingSettingsSheet from '../components/FastingSettingsSheet';

export default function FastingScreen({
  onClose,
  onOpenZakat,
  onOpenQuran,
}: {
  onClose?: () => void;
  onOpenZakat?: () => void;
  onOpenQuran?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const prefs = useFastingPrefs();
  const log = useFastingLog();
  const ledger = useFastingLedger();
  const khatm = useQuranKhatm();
  const { location, timeZone, settings } = useResolvedSettings();
  const formatTime = useFormattedTime();
  const coords = location.coords;

  const [now, setNow] = useState(() => new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);

  // One-second tick drives the live countdown and arc.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // The day key only changes at local midnight — anchor daily memos to it.
  const dayKey = dayKeyInZone(now, timeZone);

  // Hijri position, with a developer-only Ramadan preview overlaid off-season.
  const hijri = useMemo<HijriDate>(() => {
    const base = toHijri(now);
    if (__DEV__ && prefs.prefs.previewRamadan) {
      return {
        ...base,
        month: RAMADAN_MONTH,
        monthName: 'Ramadan',
        day: prefs.prefs.previewDay,
      };
    }
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayKey, prefs.prefs.previewRamadan, prefs.prefs.previewDay]);

  const info = useMemo(() => ramadanInfo(hijri), [hijri]);
  const ashra = info.ashraIndex >= 0 ? ASHRAS[info.ashraIndex] : null;

  // Today's and tomorrow's fasting moments (recomputed daily, not every tick).
  const todayTimes = useMemo(
    () => fastTimes(getPrayerTimes(coords, now, settings), prefs.prefs.imsakMinutes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [coords.latitude, coords.longitude, settings, prefs.prefs.imsakMinutes, dayKey],
  );
  const tomorrowTimes = useMemo(() => {
    const t = new Date(now);
    t.setDate(t.getDate() + 1);
    return fastTimes(getPrayerTimes(coords, t, settings), prefs.prefs.imsakMinutes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords.latitude, coords.longitude, settings, prefs.prefs.imsakMinutes, dayKey]);

  const phase = fastPhase(now, todayTimes);
  const progress = fastProgress(now, todayTimes);
  const target = countdownTarget(now, todayTimes, tomorrowTimes);
  const countdownText = formatCountdown(target.at.getTime() - now.getTime());
  const durationText = formatDuration(fastDurationMs(todayTimes));

  const daysToEid = info.isRamadan ? Math.max(0, 30 - info.day + 1) : daysUntilEidFitr(now);
  const suggestions = useMemo(() => upcomingVoluntaryFasts(now), [dayKey]);
  const forbidden = useMemo(() => forbiddenFastOn(now), [dayKey]);
  const ramadanDates = useMemo(() => ramadanGridDates(now), [dayKey]);

  // Keep the scheduled reminder window in sync with settings and place.
  useEffect(() => {
    if (!prefs.ready) return;
    if (prefs.prefs.remindersOn) {
      scheduleFastingReminders({
        coords,
        settings,
        config: {
          imsakMinutes: prefs.prefs.imsakMinutes,
          suhurLeadMinutes: prefs.prefs.suhurLeadMinutes,
          reminders: prefs.prefs.reminders,
        },
        cityLabel: location.label,
      }).catch(() => {});
    } else {
      cancelAllFasting().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    prefs.ready,
    prefs.prefs.remindersOn,
    prefs.prefs.imsakMinutes,
    prefs.prefs.suhurLeadMinutes,
    prefs.prefs.reminders,
    coords.latitude,
    coords.longitude,
    settings,
    location.label,
  ]);

  if (!prefs.ready || !log.ready) {
    return (
      <View style={[styles.root, styles.loading]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const showArabic = prefs.prefs.showArabic;
  const title = info.isRamadan ? 'Ramaḍān' : 'Fasting';

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSub}>{formatHijriLong(hijri)}</Text>
        </View>
        <Pressable onPress={() => setSettingsOpen(true)} hitSlop={12} style={styles.iconBtn}>
          <SlidersHorizontal size={18} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Ramadan command centre — only in Ramadan, rising to the top. */}
        {info.isRamadan && ashra ? (
          <>
            <RamadanProgressStrip info={info} ashra={ashra} showArabic={showArabic} />
            <AshraCard ashra={ashra} showArabic={showArabic} />
            {info.isLastTen ? <LaylatulQadrCard info={info} showArabic={showArabic} /> : null}
          </>
        ) : null}

        {/* The live fasting day — always present. */}
        <View style={styles.arcWrap}>
          <FastingDayArc
            phase={phase}
            progress={progress}
            countdownLabel={target.label}
            countdownText={countdownText}
            fajrText={formatTime(todayTimes.fajr, timeZone)}
            maghribText={formatTime(todayTimes.maghrib, timeZone)}
            durationText={durationText}
          />
        </View>
        <FastingTimesCard times={todayTimes} timeZone={timeZone} phase={phase} showArabic={showArabic} />

        {/* The month log — the Ramadan grid in Ramadan, or the upcoming month. */}
        <FastingMonthGrid dates={ramadanDates} fastingLog={log} />

        {/* Ramadan-only worship plans. */}
        {info.isRamadan ? (
          <>
            <QuranKhatmCard khatm={khatm} now={now} onOpenReader={onOpenQuran} />
            {daysToEid != null && daysToEid <= 12 ? (
              <EidCard daysToEid={daysToEid} onOpenZakat={onOpenZakat} showArabic={showArabic} />
            ) : null}
          </>
        ) : null}

        {/* Recommended fasts of the year. */}
        <VoluntaryFastsCard
          suggestions={suggestions}
          timeZone={timeZone}
          forbidden={forbidden}
          remindVoluntary={prefs.prefs.reminders.voluntary}
          onToggleRemind={(v) => prefs.setReminder('voluntary', v)}
          showArabic={showArabic}
        />

        {/* Make-up account and expiations. */}
        <FastingLedgerCard ledger={ledger} />
        <FidyahKaffarahCard perDay={prefs.prefs.fidyahPerDay} currency={prefs.prefs.fidyahCurrency} />

        {/* Duʿās for the fast. */}
        {FASTING_DUAS.map((d) => (
          <DuaCard key={d.id} dua={d} showArabic={showArabic} showDaleel />
        ))}

        {/* The quiet fiqh. */}
        <FastingNotesCard />
      </ScrollView>

      <FastingSettingsSheet
        visible={settingsOpen}
        prefs={prefs.prefs}
        onClose={() => setSettingsOpen(false)}
        onSetPref={prefs.setPref}
        onSetReminder={prefs.setReminder}
        onReset={prefs.reset}
      />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loading: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'] + spacing.md,
    paddingBottom: spacing.md,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
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
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] },
  arcWrap: { alignItems: 'center', marginBottom: spacing.lg },
});
