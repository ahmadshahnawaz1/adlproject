/**
 * Splitting a translated sentence around its placeholders.
 *
 * A sentence like "you agree to our {terms} and {privacy}" cannot be assembled
 * from fragments, because word order moves between languages. The whole
 * sentence stays one translatable string and the placeholders are replaced with
 * rendered pieces in place.
 */
export type TemplatePart =
  | { kind: 'text'; value: string }
  | { kind: 'slot'; name: string };

const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * Break a template into literal text and named slots. Unknown placeholders are
 * kept as literal text so a stray brace never silently swallows a word.
 */
export function splitTemplate(template: string, slots: readonly string[]): TemplatePart[] {
  const parts: TemplatePart[] = [];
  let last = 0;
  PLACEHOLDER.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = PLACEHOLDER.exec(template)) !== null) {
    const name = match[1];
    if (!slots.includes(name)) continue;
    if (match.index > last) {
      parts.push({ kind: 'text', value: template.slice(last, match.index) });
    }
    parts.push({ kind: 'slot', name });
    last = match.index + match[0].length;
  }

  if (last < template.length) {
    parts.push({ kind: 'text', value: template.slice(last) });
  }
  return parts;
}
