/**
 * AyahMedallion — the decorative end-of-ayah marker.
 *
 * An eight-pointed Islamic star (khātim) drawn in SVG, with the ayah number in
 * Arabic-Indic digits centred on top. Purely presentational and static, so no
 * animation driver is involved.
 */
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, fontFamily } from '../../theme/tokens';
import { toArabicDigits } from '../../lib/quran';

/** Build an n-pointed star path centred at (cx, cy). */
function starPath(
  cx: number,
  cy: number,
  spikes: number,
  outerR: number,
  innerR: number,
): string {
  const step = Math.PI / spikes;
  let rot = -Math.PI / 2;
  let d = '';
  for (let i = 0; i < spikes; i++) {
    const ox = cx + Math.cos(rot) * outerR;
    const oy = cy + Math.sin(rot) * outerR;
    d += (i === 0 ? 'M' : 'L') + ox.toFixed(2) + ' ' + oy.toFixed(2);
    rot += step;
    const ix = cx + Math.cos(rot) * innerR;
    const iy = cy + Math.sin(rot) * innerR;
    d += 'L' + ix.toFixed(2) + ' ' + iy.toFixed(2);
    rot += step;
  }
  return d + 'Z';
}

export default function AyahMedallion({
  number,
  size = 30,
  color = colors.primary,
  textColor = colors.foreground,
  active = false,
}: {
  number: number;
  size?: number;
  color?: string;
  textColor?: string;
  active?: boolean;
}) {
  const c = size / 2;

  return (
    <View
      style={[styles.wrap, { width: size, height: size }]}
      accessibilityLabel={`Ayah ${number}`}
    >
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={StyleSheet.absoluteFill}
      >
        <Path
          d={starPath(c, c, 8, c - 1, size * 0.33)}
          fill={active ? color : 'none'}
          fillOpacity={active ? 0.16 : 0}
          stroke={color}
          strokeWidth={1}
          strokeOpacity={active ? 0.9 : 0.5}
          strokeLinejoin="round"
        />
        <Circle
          cx={c}
          cy={c}
          r={size * 0.3}
          fill="none"
          stroke={color}
          strokeWidth={0.75}
          strokeOpacity={0.32}
        />
      </Svg>
      <Text
        style={[
          styles.num,
          {
            fontSize: size * 0.32,
            color: active ? color : textColor,
          },
        ]}
        allowFontScaling={false}
      >
        {toArabicDigits(number)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  num: { fontFamily, fontWeight: '600', textAlign: 'center' },
});
