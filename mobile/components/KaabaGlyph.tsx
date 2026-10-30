/**
 * KaabaGlyph — a minimal, recognisable Kaʿbah drawn in SVG: the black cube,
 * the gold band (ḥizām) of the kiswah, and the door. Self-contained and
 * sizable, so it serves both as the Pilgrimage entry's sidebar icon (lucide
 * has no Kaʿbah) and as a building block in the scenes.
 */
import Svg, { Line, Path, Rect } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

export default function KaabaGlyph({
  size = 22,
  color: colorProp,
  accent: accentProp,
}: {
  size?: number;
  color?: string;
  accent?: string;
}) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.foreground;
  const accent = accentProp ?? colors.primary;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* the cube */}
      <Rect x={4.5} y={6} width={15} height={14} rx={1.2} stroke={color} strokeWidth={1.6} />
      {/* the gold band (ḥizām) */}
      <Line x1={4.5} y1={10.5} x2={19.5} y2={10.5} stroke={accent} strokeWidth={1.8} />
      {/* the door */}
      <Rect x={10.6} y={12.4} width={2.8} height={7.6} rx={0.5} stroke={accent} strokeWidth={1.2} />
      {/* a hint of the rooftop */}
      <Path d="M6 6 L12 3.4 L18 6" stroke={color} strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}
