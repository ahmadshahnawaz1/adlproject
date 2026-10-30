/**
 * SunnahScreen — the day's voluntary (Sunnah) windows and the three times in
 * which prayer is discouraged, surfaced beautifully. A live banner warns when a
 * forbidden window is currently open; each window shows its span, an elegant
 * progress rail, and its Arabic name. All computed offline from the same engine
 * and authority powering the prayer schedule.
 */
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ban, Sparkles, MapPin, Droplets, ChevronRight, MoonStar } from 'lucide-react-native';
import useResolvedSettings from '../hooks/useResolvedSettings';
import {
  getDevotionalWindows,
  activeForbiddenWindow,
  type DevotionalWindow,
} from '../lib/devotionalTimes';
import { radius, spacing, typography, arabicFont } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

function formatTime(date: Date, timeZone: string): string {
  return date.toLocaleTimeString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function dayKeyInZone(date: Date, timeZone: string): string {
  return date.toLocaleDateString('en-CA', { timeZone });
}

/** How far `now` is through a window, clamped 0..1 (for the progress rail). */
function progressOf(w: DevotionalWindow, now: Date): number {
  const span = w.end.getTime() - w.start.getTime();
  if (span <= 0) return 0;
  const p = (now.getTime() - w.start.getTime()) / span;
  return Math.max(0, Math.min(1, p));
}

function WindowCard({
  w,
  now,
  timeZone,
}: {
  w: DevotionalWindow;
  now: Date;
  timeZone: string;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const forbidden = w.kind === 'forbidden';
  const ms = now.getTime();
  const live = ms >= w.start.getTime() && ms < w.end.getTime();
  const past = ms >= w.end.getTime();
  const accent = forbidden ? colors.destructive : colors.primary;
  const p = progressOf(w, now);

  return (
    <View style={[styles.card, live && { borderColor: accent }, past && styles.cardPast]}>
      <View style={styles.cardTop}>
        <View style={[styles.iconWrap, { backgroundColor: `${accent}1A` }]}>
          {forbidden ? (
            <Ban size={18} color={accent} strokeWidth={2.2} />
          ) : (
            <Sparkles size={18} color={accent} strokeWidth={2.2} />
          )}
        </View>
        <View style={styles.cardHead}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.cardTitle, past && styles.dim]}>{w.label}</Text>
            {live ? (
              <View style={[styles.liveTag, { backgroundColor: accent }]}>
                <Text style={styles.liveTagText}>NOW</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.cardArabic, past && styles.dim]}>{w.arabic}</Text>
        </View>
        <Text style={[styles.cardSpan, past && styles.dim]}>
          {formatTime(w.start, timeZone)}
          {'\n'}
          <Text style={styles.cardSpanTo}>to {formatTime(w.end, timeZone)}</Text>
        </Text>
      </View>

      <Text style={[styles.cardNote, past && styles.dim]}>{w.note}</Text>

      <View style={styles.rail}>
        <View
          style={[
            styles.railFill,
            { width: `${(live ? p : past ? 1 : 0) * 100}%`, backgroundColor: accent },
          ]}
        />
      </View>
    </View>
  );
}

export default function SunnahScreen({
  onOpenWudu,
  onOpenTahajjud,
}: {
  onOpenWudu?: () => void;
  onOpenTahajjud?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { location, timeZone, settings } = useResolvedSettings();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dayKey = dayKeyInZone(now, timeZone);
  const windows = useMemo(
    () => getDevotionalWindows(location.coords, now, settings),
    // Recompute on day rollover / location / settings, not every tick.
    [dayKey, location.coords.latitude, location.coords.longitude, settings],
  );

  const active = activeForbiddenWindow(windows, now);

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Sunnah</Text>
        <View style={styles.locationRow}>
          <MapPin size={14} color={colors.mutedForeground} strokeWidth={2} />
          <Text style={styles.locationText}>{location.label}</Text>
        </View>

        {active ? (
          <View style={styles.warnBanner}>
            <Ban size={18} color={colors.destructive} strokeWidth={2.4} />
            <View style={styles.warnTextWrap}>
              <Text style={styles.warnTitle}>
                {active.severity === 'disliked'
                  ? 'Voluntary prayer is disliked now'
                  : 'Prayer is discouraged now'}
              </Text>
              <Text style={styles.warnSub}>
                {active.label} · until {formatTime(active.end, timeZone)}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.okBanner}>
            <Sparkles size={18} color={colors.primary} strokeWidth={2.4} />
            <Text style={styles.okText}>A good time to pray</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Today’s windows</Text>
        <View style={styles.list}>
          {windows.map((w) => (
            <WindowCard key={w.id} w={w} now={now} timeZone={timeZone} />
          ))}
        </View>

        <Pressable
          onPress={onOpenTahajjud}
          style={({ pressed }) => [styles.wuduCard, pressed && { opacity: 0.85 }]}
        >
          <View style={styles.wuduIcon}>
            <MoonStar size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.wuduText}>
            <Text style={styles.wuduTitle}>The night prayer (Tahajjud)</Text>
            <Text style={styles.wuduSub}>
              Tonight’s thirds, a gentle wake, and the worship of the night
            </Text>
          </View>
          <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
        </Pressable>

        <Pressable
          onPress={onOpenWudu}
          style={({ pressed }) => [styles.wuduCard, pressed && { opacity: 0.85 }]}
        >
          <View style={styles.wuduIcon}>
            <Droplets size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.wuduText}>
            <Text style={styles.wuduTitle}>How to make wudū</Text>
            <Text style={styles.wuduSub}>
              The Prophet’s ︽ method, step by step — with evidence
            </Text>
          </View>
          <ChevronRight size={18} color={colors.subtleForeground} strokeWidth={2} />
        </Pressable>

        <Text style={styles.footnote}>
          Times are derived from the sun for your location. Voluntary windows are
          shown in gold; discouraged windows in red.
        </Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing['3xl'],
  },
  title: {
    ...typography.display,
    color: colors.foreground,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  locationText: { ...typography.label, color: colors.mutedForeground },

  warnBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.destructive,
    backgroundColor: `${colors.destructive}14`,
    marginBottom: spacing.xl,
  },
  warnTextWrap: { flex: 1 },
  warnTitle: { ...typography.button, color: colors.foreground },
  warnSub: { ...typography.caption, color: colors.mutedForeground, marginTop: 2 },
  okBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.xl,
  },
  okText: { ...typography.button, color: colors.foreground },

  sectionLabel: {
    ...typography.label,
    color: colors.subtleForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  list: { gap: spacing.md },

  wuduCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.primary}55`,
    backgroundColor: colors.card,
    marginTop: spacing.xl,
  },
  wuduIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wuduText: { flex: 1 },
  wuduTitle: { ...typography.button, color: colors.foreground },
  wuduSub: { ...typography.caption, color: colors.mutedForeground, marginTop: 2 },

  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  cardPast: { opacity: 0.55 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHead: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { ...typography.title, fontSize: 17, color: colors.foreground },
  cardArabic: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 2,
    fontFamily: arabicFont,
  },
  cardSpan: {
    ...typography.label,
    color: colors.foreground,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  cardSpanTo: { color: colors.mutedForeground },
  cardNote: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginTop: spacing.md,
    lineHeight: 18,
  },
  rail: {
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.cardElevated,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  railFill: { height: '100%', borderRadius: radius.full },
  dim: { color: colors.subtleForeground },

  liveTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  liveTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryForeground,
    letterSpacing: 0.5,
  },

  footnote: {
    ...typography.caption,
    color: colors.subtleForeground,
    lineHeight: 18,
    marginTop: spacing.xl,
  },
});
