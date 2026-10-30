/**
 * TasbihGlyph — a minimal string of prayer-beads (subḥa) drawn in SVG: a gentle
 * loop of beads with a larger leader bead and tassel. Lucide has no misbaḥa, so
 * this serves as the Tasbīḥ entry's sidebar and home-tile icon, matching the
 * app's custom-glyph language (see KaabaGlyph).
 */
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

export default function TasbihGlyph({
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
      {/* the loop the beads are strung on */}
      <Path
        d="M6 5.5 C2.5 8, 2.5 14, 6 16.5 C9.5 19, 14.5 19, 18 16.5 C21.5 14, 21.5 8, 18 5.5"
        stroke={color}
        strokeWidth={1.3}
        strokeLinecap="round"
        opacity={0.55}
      />
      {/* beads around the loop */}
      <Circle cx={4.6} cy={11} r={1.5} fill={color} />
      <Circle cx={6.4} cy={6} r={1.5} fill={color} />
      <Circle cx={11} cy={3.9} r={1.5} fill={color} />
      <Circle cx={17.6} cy={6} r={1.5} fill={color} />
      <Circle cx={19.4} cy={11} r={1.5} fill={color} />
      <Circle cx={17.6} cy={16} r={1.5} fill={color} />
      {/* the leader bead (imām) and tassel */}
      <Circle cx={12} cy={18.2} r={2} fill={accent} />
      <Path d="M12 20 L12 22.4" stroke={accent} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}
