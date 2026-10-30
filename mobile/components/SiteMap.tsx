/**
 * SiteMap — the geography of the Ḥajj days. The five places (Makkah → Minā →
 * ʿArafah → Muzdalifah → Jamarāt) are projected from their real coordinates
 * onto the canvas, joined by a route that draws itself in, with each node
 * lit in travel order and the active stage pulsing. Honest layout from real
 * lat/lng — never for navigation, only to orient the heart.
 */
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { HAJJ_ROUTE_SITE_IDS, siteById } from '../content/pilgrimage';
import { fontFamily, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PAD = 16;
const W = 100;
const H = 72;
const SHORT: Record<string, string> = {
  haram: 'Makkah', mina: 'Minā', arafah: 'ʿArafah', muzdalifah: 'Muzdalifah', jamarat: 'Jamarāt',
};

export default function SiteMap({
  activeSiteId,
  width = 320,
  caption,
}: {
  activeSiteId?: string | null;
  width?: number;
  caption?: string;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const pts = useMemo(() => {
    const sites = HAJJ_ROUTE_SITE_IDS.map((id) => siteById(id)!).filter(Boolean);
    const lats = sites.map((s) => s.coords.latitude);
    const lngs = sites.map((s) => s.coords.longitude);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const spanLat = maxLat - minLat || 1;
    const spanLng = maxLng - minLng || 1;
    return sites.map((s) => ({
      id: s.id,
      // east = +x; north = −y (screen). Keep generous padding.
      x: PAD + ((s.coords.longitude - minLng) / spanLng) * (W - 2 * PAD),
      y: PAD + ((maxLat - s.coords.latitude) / spanLat) * (H - 2 * PAD),
    }));
  }, []);

  const pathD = useMemo(() => pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '), [pts]);

  // Approximate length to drive the draw-in.
  const len = useMemo(() => {
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    }
    return Math.max(1, total);
  }, [pts]);

  const draw = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    draw.setValue(0);
    Animated.timing(draw, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }).start();
  }, [draw, pathD]);
  const dashoffset = draw.interpolate({ inputRange: [0, 1], outputRange: [len, 0] });

  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0.4, duration: 1100, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const activeIdx = activeSiteId ? HAJJ_ROUTE_SITE_IDS.indexOf(activeSiteId as (typeof HAJJ_ROUTE_SITE_IDS)[number]) : -1;
  const height = (width * H) / W;

  return (
    <View style={styles.wrap}>
      <Svg width={width} height={height} viewBox={`0 0 ${W} ${H}`}>
        {/* the route, drawing itself in */}
        <AnimatedPath d={pathD} stroke={colors.primary} strokeWidth={1.2} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={dashoffset} opacity={0.85} />
        {pts.map((p, i) => {
          const reached = activeIdx < 0 ? true : i <= activeIdx;
          const isActive = i === activeIdx;
          return (
            <G key={p.id}>
              {isActive ? <AnimatedCircle cx={p.x} cy={p.y} r={5} fill={colors.primary} opacity={pulse.interpolate({ inputRange: [0.4, 1], outputRange: [0.1, 0.28] })} /> : null}
              <Circle cx={p.x} cy={p.y} r={2.4} fill={reached ? colors.primary : colors.cardElevated} stroke={reached ? colors.primary : colors.border} strokeWidth={0.8} />
              <SvgText x={p.x} y={p.y - 4} fill={reached ? colors.foreground : colors.subtleForeground} fontSize={4.2} fontWeight={isActive ? '700' : '400'} textAnchor="middle">{SHORT[p.id] ?? p.id}</SvgText>
            </G>
          );
        })}
      </Svg>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  caption: { fontFamily, fontSize: typography.caption.fontSize, color: colors.subtleForeground, marginTop: spacing.sm, textAlign: 'center' },
});
