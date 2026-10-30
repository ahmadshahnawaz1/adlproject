/**
 * Markdown — a lightweight, theme-aware markdown renderer for ADL AI replies.
 *
 * Handles the subset a chat model actually emits: headings, bullet/numbered
 * lists, code blocks and inline code, bold/italic, blockquotes, and the app's
 * [[quran:…]] / [[hadith:…]] citation tokens (rendered as inline labels; the
 * tappable source pills live under the message). Arabic runs use the muṣḥaf font.
 */
import { Fragment, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { arabicFont, fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { parseCitation } from './CitationChip';

const hasArabic = (s: string): boolean => /[\u0600-\u06FF]/.test(s);
const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[\[[^\]]+\]\]|\*[^*]+\*|_[^_]+_)/g;

function useMd() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const inline = (text: string, keyBase: string): ReactNode[] =>
    text.split(INLINE).map((tok, i) => {
      const key = `${keyBase}-${i}`;
      if (!tok) return null;
      if (tok.startsWith('**') && tok.endsWith('**')) {
        return <Text key={key} style={styles.bold}>{tok.slice(2, -2)}</Text>;
      }
      if ((tok.startsWith('*') && tok.endsWith('*')) || (tok.startsWith('_') && tok.endsWith('_'))) {
        return <Text key={key} style={styles.italic}>{tok.slice(1, -1)}</Text>;
      }
      if (tok.startsWith('`') && tok.endsWith('`')) {
        return <Text key={key} style={styles.inlineCode}>{tok.slice(1, -1)}</Text>;
      }
      if (tok.startsWith('[[') && tok.endsWith(']]')) {
        const c = parseCitation(tok.slice(2, -2));
        return <Text key={key} style={styles.citation}>{c ? ` ${c.label} ` : tok}</Text>;
      }
      if (hasArabic(tok)) return <Text key={key} style={styles.arabic}>{tok}</Text>;
      return <Fragment key={key}>{tok}</Fragment>;
    });

  return { colors, styles, inline };
}

export default function Markdown({ content }: { content: string }) {
  const { styles, inline } = useMd();
  const lines = content.replace(/\r/g, '').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block.
    if (line.trim().startsWith('```')) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) buf.push(lines[i++]);
      i++; // closing fence
      blocks.push(
        <View key={`c${k++}`} style={styles.codeBlock}>
          <Text style={styles.codeText}>{buf.join('\n')}</Text>
        </View>,
      );
      continue;
    }

    // Blank line.
    if (!line.trim()) { i++; continue; }

    // Headings.
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      const style = h[1].length === 1 ? styles.h1 : h[1].length === 2 ? styles.h2 : styles.h3;
      blocks.push(<Text key={`h${k++}`} style={style}>{inline(h[2], `h${k}`)}</Text>);
      i++;
      continue;
    }

    // Blockquote.
    if (line.trimStart().startsWith('>')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith('>')) {
        buf.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      blocks.push(
        <View key={`q${k++}`} style={styles.quote}>
          <Text style={styles.quoteText}>{inline(buf.join(' '), `q${k}`)}</Text>
        </View>,
      );
      continue;
    }

    // Lists (bulleted or numbered) — consecutive item lines.
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const items: { marker: string; text: string }[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        const m = /^\s*([-*]|(\d+)\.)\s+(.*)$/.exec(lines[i])!;
        items.push({ marker: m[2] ? `${m[2]}.` : '•', text: m[3] });
        i++;
      }
      blocks.push(
        <View key={`l${k++}`} style={styles.list}>
          {items.map((it, idx) => (
            <View key={idx} style={styles.listRow}>
              <Text style={styles.listMarker}>{it.marker}</Text>
              <Text style={styles.listText}>{inline(it.text, `l${k}-${idx}`)}</Text>
            </View>
          ))}
        </View>,
      );
      continue;
    }

    // Paragraph — merge consecutive non-empty, non-special lines.
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('```') &&
      !/^(#{1,3})\s+/.test(lines[i]) &&
      !lines[i].trimStart().startsWith('>') &&
      !/^\s*([-*]|\d+\.)\s+/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(<Text key={`p${k++}`} style={styles.para}>{inline(para.join(' '), `p${k}`)}</Text>);
  }

  return <View style={styles.wrap}>{blocks}</View>;
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: { gap: spacing.sm },
    para: { fontFamily, fontSize: 15, lineHeight: 23, color: colors.foreground },
    bold: { fontWeight: '700', color: colors.foreground },
    italic: { fontStyle: 'italic' },
    inlineCode: {
      fontFamily: 'monospace',
      fontSize: 13,
      color: colors.primary,
      backgroundColor: colors.cardElevated,
    },
    citation: {
      ...typography.caption,
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },
    arabic: { fontFamily: arabicFont, fontSize: 18, color: colors.foreground },
    h1: { ...typography.title, fontSize: 19, color: colors.foreground, marginTop: 2 },
    h2: { ...typography.button, fontSize: 16, color: colors.foreground, marginTop: 2 },
    h3: { ...typography.button, fontSize: 14, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.4 },
    quote: { borderLeftWidth: 3, borderLeftColor: colors.primary, paddingLeft: spacing.md, paddingVertical: 2 },
    quoteText: { fontFamily, fontSize: 15, lineHeight: 23, color: colors.mutedForeground, fontStyle: 'italic' },
    list: { gap: 4 },
    listRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
    listMarker: { fontFamily, fontSize: 15, lineHeight: 23, color: colors.primary, minWidth: 16 },
    listText: { flex: 1, fontFamily, fontSize: 15, lineHeight: 23, color: colors.foreground },
    codeBlock: { backgroundColor: colors.cardElevated, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
    codeText: { fontFamily: 'monospace', fontSize: 13, lineHeight: 19, color: colors.foreground },
  });
