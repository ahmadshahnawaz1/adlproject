/**
 * TajweedText — Qurʾānic text with the recitation rules coloured.
 *
 * The analyser returns runs over the exact source string, so the text is drawn
 * as nested <Text> spans with no character added, removed, or reordered — the
 * āyah reads identically whether colouring is on or off.
 */
import { useMemo } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { segment, tajweedRule } from '../../lib/tajweed';

export default function TajweedText({
  text,
  style,
  /** Colour used where no rule applies. */
  baseColor,
  enabled = true,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
  baseColor: string;
  enabled?: boolean;
}) {
  const segments = useMemo(() => (enabled ? segment(text) : null), [text, enabled]);

  if (!segments) {
    return (
      <Text style={style} allowFontScaling={false}>
        {text}
      </Text>
    );
  }

  return (
    <Text style={style} allowFontScaling={false}>
      {segments.map((seg, i) => {
        const rule = seg.rule ? tajweedRule(seg.rule) : undefined;
        return (
          <Text key={i} style={{ color: rule ? rule.color : baseColor }}>
            {seg.text}
          </Text>
        );
      })}
    </Text>
  );
}
