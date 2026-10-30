/**
 * QiblaScreen — point toward Makkah.
 *
 * The phone's live heading (magnetometer) is combined with the exact bearing to
 * the Kaaba computed by the offline engine. A cinematic dial rotates beneath a
 * fixed pointer; when the top of the phone lines up with the Qibla, the whole
 * compass blooms gold and a soft haptic confirms it. No network, ever.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, G, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { MapPin } from 'lucide-react-native';
import useLocation from '../hooks/useLocation';
import useCompass from '../hooks/useCompass';
import { getQiblaDirection } from '../lib/prayerTimes';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const DIAL = 280;
const C = DIAL / 2;
const R = C - 18;

/** Shortest signed angular distance a→b in degrees, range (−180, 180]. */
function angleDelta(a: number, b: number): number {
  return ((b - a + 540) % 360) - 180;
}

function compassLabel(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

/** The tick marks + cardinal letters that make up the rotating dial face. */
function DialFace({ qibla }: { qibla: number }) {
  const { colors } = useTheme();
  const ticks = [];
  for (let i = 0; i < 72; i += 1) {
    const major = i % 9 === 0;
    const a = (i * 5 * Math.PI) / 180;
    const outer = R;
    const inner = R - (major ? 14 : 7);
    ticks.push(
      <Line
        key={i}
        x1={C + outer * Math.sin(a)}
        y1={C - outer * Math.cos(a)}
        x2={C + inner * Math.sin(a)}
        y2={C - inner * Math.cos(a)}
        stroke={major ? colors.mutedForeground : colors.border}
        strokeWidth={major ? 2 : 1}
        strokeLinecap="round"
      />,
    );
  }

  const cardinals: { label: string; deg: number }[] = [
    { label: 'N', deg: 0 },
    { label: 'E', deg: 90 },
    { label: 'S', deg: 180 },
    { label: 'W', deg: 270 },
  ];

  return (
    <Svg width={DIAL} height={DIAL}>
      <Circle cx={C} cy={C} r={R} stroke={colors.border} strokeWidth={1} fill="none" />
      {ticks}
      {cardinals.map((c) => {
        const a = (c.deg * Math.PI) / 180;
        const lr = R - 30;
        return (
          <SvgText
            key={c.label}
            x={C + lr * Math.sin(a)}
            y={C - lr * Math.cos(a) + 6}
            fontSize={16}
            fontWeight="700"
            fill={c.label === 'N' ? colors.primary : colors.mutedForeground}
            textAnchor="middle"
          >
            {c.label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

export default function QiblaScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { location } = useLocation();
  const { heading, available, trueNorth, accuracy } = useCompass(true);
  const wasAligned = useRef(false);

  const qibla = useMemo(
    () => getQiblaDirection(location.coords),
    [location.coords.latitude, location.coords.longitude],
  );

  // How far the phone's top is from the Qibla right now.
  const delta = heading === null ? null : angleDelta(heading, qibla);
  const aligned = delta !== null && Math.abs(delta) <= 4;

  // A gentle confirmation the instant we lock on.
  useEffect(() => {
    if (aligned && !wasAligned.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    wasAligned.current = aligned;
  }, [aligned]);

  // Rotate the dial opposite the heading so cardinal marks track the real world.
  const dialRotation = heading === null ? 0 : -heading;
  // The Kaaba sits on the dial at the Qibla bearing (0 = north at dial top).
  const kaabaA = (qibla * Math.PI) / 180;
  const kaabaX = C + (R - 30) * Math.sin(kaabaA);
  const kaabaY = C - (R - 30) * Math.cos(kaabaA);

  const turn =
    delta === null ? '' : aligned ? 'Facing the Qibla' : delta > 0 ? 'Turn right' : 'Turn left';

  const needsCalibration = accuracy !== null && accuracy < 2;

  return (
    <View style={styles.flex}>
      <View style={styles.scroll}>
        <Text style={styles.title}>Qibla</Text>

        <View style={styles.locationRow}>
          <MapPin size={14} color={colors.mutedForeground} strokeWidth={2} />
          <Text style={styles.locationText}>{location.label}</Text>
        </View>

        {available ? (
          <>
            <View style={styles.compassWrap}>
              {/* Fixed pointer — where the phone is aimed. */}
              <View style={styles.pointer}>
                <View style={[styles.pointerTri, aligned && styles.pointerTriOn]} />
              </View>

              {/* Rotating dial */}
              <View
                style={[
                  styles.dial,
                  { transform: [{ rotate: `${dialRotation}deg` }] },
                ]}
              >
                <DialFace qibla={qibla} />

                {/* The Kaaba marker, riding the dial at the Qibla bearing. */}
                <View
                  style={[
                    styles.kaaba,
                    aligned && styles.kaabaOn,
                    { left: kaabaX - 18, top: kaabaY - 18 },
                  ]}
                >
                  <View style={styles.kaabaCube}>
                    <View style={styles.kaabaBand} />
                  </View>
                </View>
              </View>

              {/* Center hub + readout */}
              <View style={styles.hub} pointerEvents="none">
                <Text style={[styles.hubDeg, aligned && styles.hubDegOn]}>
                  {Math.round(qibla)}°
                </Text>
                <Text style={styles.hubSub}>{compassLabel(qibla)}</Text>
              </View>
            </View>

            <View style={[styles.statusChip, aligned && styles.statusChipOn]}>
              <Text style={[styles.statusText, aligned && styles.statusTextOn]}>
                {turn}
              </Text>
            </View>

            <View style={styles.precisionRow}>
              <View style={[styles.precisionDot, trueNorth ? styles.precisionDotGood : styles.precisionDotWarn]} />
              <Text style={styles.precisionText}>
                {trueNorth ? 'True north · declination corrected' : 'Magnetic north'}
                {accuracy !== null ? `  ·  ${['unreliable', 'low', 'medium', 'high'][accuracy] ?? ''} accuracy` : ''}
              </Text>
            </View>

            {needsCalibration ? (
              <Text style={styles.calibrate}>
                Move your phone in a figure-8 to calibrate the compass.
              </Text>
            ) : null}

            <Text style={styles.hint}>
              Hold your phone flat and turn slowly until the Kaaba reaches the top.
            </Text>
          </>
        ) : (
          <View style={styles.noSensor}>
            <Text style={styles.noSensorTitle}>No compass detected</Text>
            <Text style={styles.noSensorText}>
              This device has no magnetometer. The Qibla from {location.label} is{' '}
              {Math.round(qibla)}° ({compassLabel(qibla)}) from true north.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
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
    gap: spacing.xs + 2,
    marginTop: spacing.md,
  },
  locationText: { ...typography.label, color: colors.mutedForeground },

  compassWrap: {
    width: DIAL,
    height: DIAL,
    marginTop: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointer: {
    position: 'absolute',
    top: -2,
    zIndex: 5,
    alignItems: 'center',
  },
  pointerTri: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.mutedForeground,
  },
  pointerTriOn: { borderTopColor: colors.primary },
  dial: {
    width: DIAL,
    height: DIAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kaaba: {
    position: 'absolute',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kaabaOn: { transform: [{ scale: 1.12 }] },
  kaabaCube: {
    width: 26,
    height: 26,
    borderRadius: 5,
    backgroundColor: '#0A0A0A',
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  kaabaBand: {
    position: 'absolute',
    top: 7,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
  },
  hub: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubDeg: { ...typography.title, color: colors.foreground, fontVariant: ['tabular-nums'] },
  hubDegOn: { color: colors.primary },
  hubSub: { ...typography.caption, color: colors.mutedForeground },

  statusChip: {
    marginTop: spacing['2xl'],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  statusChipOn: { borderColor: colors.primary, backgroundColor: colors.primary },
  statusText: { ...typography.button, color: colors.mutedForeground },
  statusTextOn: { color: colors.primaryForeground },

  hint: {
    ...typography.caption,
    color: colors.subtleForeground,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    lineHeight: 18,
  },

  precisionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  precisionDot: { width: 7, height: 7, borderRadius: 999 },
  precisionDotGood: { backgroundColor: colors.success },
  precisionDotWarn: { backgroundColor: colors.primary },
  precisionText: { ...typography.caption, color: colors.mutedForeground },
  calibrate: {
    ...typography.caption,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    lineHeight: 18,
  },

  noSensor: {
    marginTop: spacing['3xl'],
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  noSensorTitle: { ...typography.title, color: colors.foreground, marginBottom: spacing.sm },
  noSensorText: { ...typography.body, color: colors.mutedForeground, lineHeight: 22 },
});
