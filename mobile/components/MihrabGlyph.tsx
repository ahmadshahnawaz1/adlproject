/**
 * MihrabGlyph — a minimal miḥrāb (prayer niche) with a hanging lamp, drawn in
 * SVG. It marks the "How to Pray" (Ṣalāh) entry in the sidebar and on the home
 * screen, where lucide has no fitting icon, and echoes the niche of the
 * PostureScene. Self-contained and sizable, with the same prop signature as
 * KaabaGlyph and TasbihGlyph.
 */
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

export default function MihrabGlyph({
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
      {/* the niche — two jambs rising to a pointed arch */}
      <Path
        d="M6 21 L6 10 Q6 4 12 2.5 Q18 4 18 10 L18 21"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* the base line / threshold */}
      <Line x1={4.5} y1={21} x2={19.5} y2={21} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      {/* the hanging lamp */}
      <Line x1={12} y1={5} x2={12} y2={8.5} stroke={accent} strokeWidth={1.2} strokeLinecap="round" />
      <Circle cx={12} cy={10} r={1.7} stroke={accent} strokeWidth={1.3} />
    </Svg>
  );
}
