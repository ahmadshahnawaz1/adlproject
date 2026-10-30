/**
 * HomeScreen — the dashboard the app opens on.
 *
 * A glanceable board of live widgets: the next prayer with a running countdown,
 * today's logging progress, the current streak, the Qibla bearing, the day's
 * devotional status, and the Hijri date. Every widget is a doorway — tapping it
 * jumps to its full screen. All offline.
 */
import { useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Compass,
  Flame,
  CalendarDays,
  Sparkles,
  Ban,
  Droplets,
  Coins,
  HandCoins,
  Moon,
  BookOpen,
  BookOpenText,
  BookMarked,
  Target,
  GraduationCap,
  ChevronRight,
} from 'lucide-react-native';
import { Mosque } from 'phosphor-react-native';
import useBreathing from '../hooks/useBreathing';
import useResolvedSettings from '../hooks/useResolvedSettings';
import usePrayerLog from '../hooks/usePrayerLog';
import useFastingPrefs from '../hooks/useFastingPrefs';
import { getNextPrayer, getQiblaDirection, getPrayerTimes } from '../lib/prayerTimes';
import {
  countdownTarget,
  fastPhase,
  fastTimes,
  ramadanInfo,
  upcomingVoluntaryFasts,
} from '../lib/fasting';
import { toHijri } from '../lib/hijriCalendar';
import { dhulHijjahInfo, daysUntilHajj } from '../lib/pilgrimageDates';
import { getDevotionalWindows, activeForbiddenWindow } from '../lib/devotionalTimes';
import { OBLIGATORY } from '../lib/prayerLog';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import KaabaGlyph from '../components/KaabaGlyph';
import TasbihGlyph from '../components/TasbihGlyph';
import MihrabGlyph from '../components/MihrabGlyph';
import TahajjudCard from '../components/tahajjud/TahajjudCard';

const PRAYER_LABEL: Record<string, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

function formatTime(date: Date, timeZone: string): string {
  return date.toLocaleTimeString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatCountdown(ms: number): string {
  if (ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function hijriToday(timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      timeZone,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  } catch {
    return '';
  }
}

function compassPoint(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export default function HomeScreen({
  onNavigate,
}: {
  onNavigate?: (key: string) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { opacity: glow } = useBreathing();
  const { location, timeZone, settings } = useResolvedSettings();
  const { day, stats } = usePrayerLog();
  const { prefs: fastingPrefs } = useFastingPrefs();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const next = useMemo(
    () => getNextPrayer(location.coords, now, settings),
    [now, location.coords.latitude, location.coords.longitude, settings],
  );
  const qibla = useMemo(
    () => getQiblaDirection(location.coords),
    [location.coords.latitude, location.coords.longitude],
  );
  const windows = useMemo(
    () => getDevotionalWindows(location.coords, now, settings),
    [
      now.toDateString(),
      location.coords.latitude,
      location.coords.longitude,
      settings,
    ],
  );
  const forbidden = activeForbiddenWindow(windows, now);

  const dayStr = now.toDateString();
  const fastTimesToday = useMemo(
    () => fastTimes(getPrayerTimes(location.coords, now, settings), fastingPrefs.imsakMinutes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dayStr, location.coords.latitude, location.coords.longitude, settings, fastingPrefs.imsakMinutes],
  );
  const fastTimesTomorrow = useMemo(() => {
    const t = new Date(now);
    t.setDate(t.getDate() + 1);
    return fastTimes(getPrayerTimes(location.coords, t, settings), fastingPrefs.imsakMinutes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayStr, location.coords.latitude, location.coords.longitude, settings, fastingPrefs.imsakMinutes]);
  const ramInfo = useMemo(() => ramadanInfo(toHijri(now)), [dayStr]);
  const nextVoluntary = useMemo(() => upcomingVoluntaryFasts(now)[0], [dayStr]);
  const fastTarget = countdownTarget(now, fastTimesToday, fastTimesTomorrow);
  const fastCountdown = formatCountdown(fastTarget.at.getTime() - now.getTime());
  const fastPhaseNow = fastPhase(now, fastTimesToday);

  const fastingTitle = ramInfo.isRamadan ? `Ramaḍān · Day ${ramInfo.day}` : 'Fasting';
  const fastingSub = ramInfo.isRamadan
    ? `${fastTarget.label} ${fastCountdown}`
    : nextVoluntary
      ? `Next: ${nextVoluntary.fast.name}${
          nextVoluntary.daysAway === 0
            ? ' today'
            : nextVoluntary.daysAway === 1
              ? ' tomorrow'
              : ` in ${nextVoluntary.daysAway}d`
        }`
      : 'Track your fasts & make-ups';

  const dhInfo = useMemo(() => dhulHijjahInfo(now), [dayStr]);
  const hajjAway = useMemo(() => daysUntilHajj(now), [dayStr]);
  const pilgrimageSub = dhInfo.label
    ? dhInfo.label
    : hajjAway != null && hajjAway <= 60
      ? `Ḥajj in about ${hajjAway} days`
      : 'ʿUmrah & Ḥajj — step by step';

  const today = day();
  const prayedToday = OBLIGATORY.reduce(
    (n, p) => n + (['jamaah', 'ontime', 'late', 'qaza'].includes(today[p]) ? 1 : 0),
    0,
  );

  const nextLabel = next ? PRAYER_LABEL[next.name] ?? '' : 'Fajr';
  const countdown = next ? formatCountdown(next.time.getTime() - now.getTime()) : '--';
  const hijri = hijriToday(timeZone);

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Assalamu alaikum</Text>
        {hijri ? <Text style={styles.hijri}>{hijri}</Text> : null}

        {/* Next prayer hero */}
        <Pressable
          onPress={() => onNavigate?.('prayer')}
          style={({ pressed }) => [styles.heroWrap, pressed && styles.pressed]}
        >
          <View style={styles.hero}>
            <Mosque size={26} color={colors.primary} weight="duotone" duotoneOpacity={0.35} />
            <Text style={styles.heroEyebrow}>Up next</Text>
            <Text style={styles.heroPrayer}>{nextLabel}</Text>
            <Text style={styles.heroCountdown}>{countdown}</Text>
            <Text style={styles.heroHint}>
              {next ? `at ${formatTime(next.time, timeZone)}` : 'See you at Fajr'}
            </Text>
          </View>
        </Pressable>

        {/* Read the Qurʾān — the muṣḥaf, the flagship of the app */}
        <Pressable
          onPress={() => onNavigate?.('quran')}
          style={({ pressed }) => [styles.zakatTile, pressed && styles.pressed]}
        >
          <View style={styles.wuduIcon}>
            <BookMarked size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.wideText}>
            <Text style={styles.wideTitle}>Read the Qurʾān</Text>
            <Text style={styles.wideSub}>The muṣḥaf — Arabic, meaning, offline</Text>
          </View>
          <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
        </Pressable>

        {/* Pray — the guided ṣalāh, posture by posture */}
        <Pressable
          onPress={() => onNavigate?.('salah')}
          style={({ pressed }) => [styles.zakatTile, pressed && styles.pressed]}
        >
          <View style={styles.wuduIcon}>
            <MihrabGlyph size={20} color={colors.primary} accent={colors.primary} />
          </View>
          <View style={styles.wideText}>
            <Text style={styles.wideTitle}>How to Pray</Text>
            <Text style={styles.wideSub}>The ṣalāh, posture by posture</Text>
          </View>
          <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
        </Pressable>

        {/* Remember Allāh — the daily adhkār */}
        <Pressable
          onPress={() => onNavigate?.('adhkar')}
          style={({ pressed }) => [styles.zakatTile, pressed && styles.pressed]}
        >
          <View style={styles.wuduIcon}>
            <BookOpenText size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.wideText}>
            <Text style={styles.wideTitle}>Adhkār</Text>
            <Text style={styles.wideSub}>Morning &amp; evening remembrance</Text>
          </View>
          <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
        </Pressable>

        {/* Dhikr goals — streaks for the daily remembrance */}
        <Pressable
          onPress={() => onNavigate?.('dhikr')}
          style={({ pressed }) => [styles.zakatTile, pressed && styles.pressed]}
        >
          <View style={styles.wuduIcon}>
            <Target size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.wideText}>
            <Text style={styles.wideTitle}>Dhikr Goals</Text>
            <Text style={styles.wideSub}>Daily remembrance, streaks &amp; trend</Text>
          </View>
          <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
        </Pressable>

        {/* Learn — the Sīrah, belief & the fiqh of worship */}
        <Pressable
          onPress={() => onNavigate?.('learn')}
          style={({ pressed }) => [styles.zakatTile, pressed && styles.pressed]}
        >
          <View style={styles.wuduIcon}>
            <GraduationCap size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.wideText}>
            <Text style={styles.wideTitle}>Learn</Text>
            <Text style={styles.wideSub}>New to Islam, the Sīrah, belief &amp; worship</Text>
          </View>
          <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
        </Pressable>

        {/* Tahajjud — tonight's last third, a doorway to the night prayer */}
        <View style={styles.tahajjudWrap}>
          <TahajjudCard onOpen={() => onNavigate?.('tahajjud')} />
        </View>

        {/* The duʿāʾ library — supplications for every moment */}
        <Pressable
          onPress={() => onNavigate?.('duas')}
          style={({ pressed }) => [styles.zakatTile, pressed && styles.pressed]}
        >
          <View style={styles.wuduIcon}>
            <BookOpen size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.wideText}>
            <Text style={styles.wideTitle}>Duʿāʾ</Text>
            <Text style={styles.wideSub}>Supplications for every moment</Text>
          </View>
          <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
        </Pressable>

        {/* Prepare — wudū guide (the step before prayer) */}
        <Pressable
          onPress={() => onNavigate?.('wudu')}
          style={({ pressed }) => [styles.wuduTile, pressed && styles.pressed]}
        >
          <View style={styles.wuduIcon}>
            <Droplets size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.wideText}>
            <Text style={styles.wideTitle}>Prepare for prayer</Text>
            <Text style={styles.wideSub}>Guided wudū — Qurʾān &amp; Sunnah</Text>
          </View>
          <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
        </Pressable>

        {/* Purify wealth — zakat calculator */}
        <Pressable
          onPress={() => onNavigate?.('zakat')}
          style={({ pressed }) => [styles.zakatTile, pressed && styles.pressed]}
        >
          <View style={styles.wuduIcon}>
            <Coins size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.wideText}>
            <Text style={styles.wideTitle}>Calculate your Zakat</Text>
            <Text style={styles.wideSub}>Niṣāb, ḥawl &amp; evidence — fully offline</Text>
          </View>
          <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
        </Pressable>

        {/* Give — the ṣadaqah & zakat giving log */}
        <Pressable
          onPress={() => onNavigate?.('sadaqah')}
          style={({ pressed }) => [styles.zakatTile, pressed && styles.pressed]}
        >
          <View style={styles.wuduIcon}>
            <HandCoins size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.wideText}>
            <Text style={styles.wideTitle}>Track your giving</Text>
            <Text style={styles.wideSub}>Ṣadaqah &amp; zakat log — across the year</Text>
          </View>
          <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
        </Pressable>

        {/* Fast — Ramadan command centre or fasting companion */}
        <Pressable
          onPress={() => onNavigate?.('fasting')}
          style={({ pressed }) => [styles.zakatTile, pressed && styles.pressed]}
        >
          <View style={styles.wuduIcon}>
            <Moon size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.wideText}>
            <Text style={styles.wideTitle}>{fastingTitle}</Text>
            <Text style={[styles.wideSub, fastPhaseNow === 'fasting' && styles.fastingLive]}>{fastingSub}</Text>
          </View>
          <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
        </Pressable>

        {/* Pilgrimage — the guided ʿUmrah & Ḥajj journey */}
        <Pressable
          onPress={() => onNavigate?.('pilgrimage')}
          style={({ pressed }) => [styles.zakatTile, pressed && styles.pressed]}
        >
          <View style={styles.wuduIcon}>
            <KaabaGlyph size={20} color={colors.primary} accent={colors.primary} />
          </View>
          <View style={styles.wideText}>
            <Text style={styles.wideTitle}>Ḥajj & ʿUmrah</Text>
            <Text style={styles.wideSub}>{pilgrimageSub}</Text>
          </View>
          <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
        </Pressable>

        {/* Remember Allāh — the tasbīḥ counter */}
        <Pressable
          onPress={() => onNavigate?.('tasbih')}
          style={({ pressed }) => [styles.zakatTile, pressed && styles.pressed]}
        >
          <View style={styles.wuduIcon}>
            <TasbihGlyph size={20} color={colors.primary} accent={colors.primary} />
          </View>
          <View style={styles.wideText}>
            <Text style={styles.wideTitle}>Tasbīḥ</Text>
            <Text style={styles.wideSub}>Count your remembrance of Allāh</Text>
          </View>
          <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
        </Pressable>

        {/* Progress + Streak */}
        <View style={styles.gridRow}>
          <Pressable
            onPress={() => onNavigate?.('tracker')}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          >
            <View style={styles.tileHead}>
              <Text style={styles.tileEyebrow}>Today</Text>
              <ChevronRight size={15} color={colors.subtleForeground} strokeWidth={2} />
            </View>
            <Text style={styles.tileBig}>
              {prayedToday}
              <Text style={styles.tileBigUnit}>/5</Text>
            </Text>
            <View style={styles.dots}>
              {OBLIGATORY.map((p) => {
                const done = ['jamaah', 'ontime', 'late', 'qaza'].includes(today[p]);
                return (
                  <View
                    key={p}
                    style={[styles.dot, done ? styles.dotOn : styles.dotOff]}
                  />
                );
              })}
            </View>
            <Text style={styles.tileLabel}>Prayers logged</Text>
          </Pressable>

          <Pressable
            onPress={() => onNavigate?.('tracker')}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          >
            <View style={styles.tileHead}>
              <Flame size={15} color={colors.primary} strokeWidth={2.2} />
              <ChevronRight size={15} color={colors.subtleForeground} strokeWidth={2} />
            </View>
            <Animated.View style={{ opacity: glow }}>
              <Text style={styles.tileBig}>
                {stats.streak}
                <Text style={styles.tileBigUnit}> d</Text>
              </Text>
            </Animated.View>
            <Text style={styles.tileLabel}>Day streak</Text>
          </Pressable>
        </View>

        {/* Qibla + Devotional */}
        <View style={styles.gridRow}>
          <Pressable
            onPress={() => onNavigate?.('qibla')}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          >
            <View style={styles.tileHead}>
              <Compass size={15} color={colors.primary} strokeWidth={2.2} />
              <ChevronRight size={15} color={colors.subtleForeground} strokeWidth={2} />
            </View>
            <Text style={styles.tileBig}>
              {Math.round(qibla)}
              <Text style={styles.tileBigUnit}>°</Text>
            </Text>
            <Text style={styles.tileLabel}>Qibla · {compassPoint(qibla)}</Text>
          </Pressable>

          <Pressable
            onPress={() => onNavigate?.('sunnah')}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          >
            <View style={styles.tileHead}>
              {forbidden ? (
                <Ban size={15} color={colors.destructive} strokeWidth={2.2} />
              ) : (
                <Sparkles size={15} color={colors.primary} strokeWidth={2.2} />
              )}
              <ChevronRight size={15} color={colors.subtleForeground} strokeWidth={2} />
            </View>
            <Text
              style={[
                styles.tileStatus,
                { color: forbidden ? colors.destructive : colors.success },
              ]}
            >
              {forbidden ? 'Discouraged' : 'Good to pray'}
            </Text>
            <Text style={styles.tileLabel}>
              {forbidden ? forbidden.label : 'Sunnah & forbidden'}
            </Text>
          </Pressable>
        </View>

        {/* Calendar */}
        <Pressable
          onPress={() => onNavigate?.('calendar')}
          style={({ pressed }) => [styles.wideTile, pressed && styles.pressed]}
        >
          <View style={styles.wideIcon}>
            <CalendarDays size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.wideText}>
            <Text style={styles.wideTitle}>Hijri calendar</Text>
            <Text style={styles.wideSub}>
              {now.toLocaleDateString('en-US', {
                timeZone,
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  greeting: { ...typography.display, fontSize: 24, color: colors.foreground },
  hijri: { ...typography.label, color: colors.primary, marginTop: 4, marginBottom: spacing.xl },

  heroWrap: { marginBottom: spacing.lg },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  heroEyebrow: {
    ...typography.caption,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: spacing.sm,
  },
  heroPrayer: { ...typography.display, color: colors.foreground, marginTop: 2 },
  heroCountdown: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
    marginTop: spacing.xs,
  },
  heroHint: { ...typography.caption, color: colors.mutedForeground, marginTop: 2 },

  gridRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  tile: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    minHeight: 124,
    justifyContent: 'space-between',
  },
  tileHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tileEyebrow: {
    ...typography.caption,
    color: colors.subtleForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tileBig: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.foreground,
    fontVariant: ['tabular-nums'],
    marginTop: spacing.sm,
  },
  tileBigUnit: { fontSize: 18, fontWeight: '700', color: colors.mutedForeground },
  tileStatus: { ...typography.title, fontSize: 18, marginTop: spacing.sm },
  tileLabel: { ...typography.caption, color: colors.mutedForeground, marginTop: spacing.xs },
  dots: { flexDirection: 'row', gap: 5, marginTop: spacing.sm },
  dot: { width: 9, height: 9, borderRadius: 999 },
  dotOn: { backgroundColor: colors.primary },
  dotOff: { backgroundColor: colors.cardElevated },

  wideTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  wideIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wideText: { flex: 1 },
  wideTitle: { ...typography.button, color: colors.foreground },
  wideSub: { ...typography.caption, color: colors.mutedForeground, marginTop: 2 },
  fastingLive: { color: colors.primary, fontWeight: '700', fontVariant: ['tabular-nums'] },

  wuduTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.primary}55`,
    backgroundColor: colors.card,
    marginBottom: spacing.lg,
  },
  wuduIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  zakatTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.lg,
  },

  tahajjudWrap: { marginBottom: spacing.lg },

  pressed: { opacity: 0.85 },
});
