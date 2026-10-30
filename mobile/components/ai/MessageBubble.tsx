/**
 * MessageBubble — one turn in the ADL AI chat (F19).
 *
 * User turns are a right-aligned bubble; assistant turns render markdown, a
 * "Sources" row of tappable citation pills parsed from the reply, a thinking
 * indicator while empty, and copy / regenerate actions.
 */
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Copy, RefreshCw, Sparkles } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { arabicFont, fontFamily, radius, spacing, typography } from '../../theme/tokens';
import Markdown from './Markdown';
import TypingDots from './TypingDots';
import CitationChip, { parseCitation, type Citation } from './CitationChip';
import type { StoredMessage } from '../../lib/ai/store';

const hasArabic = (s: string): boolean => /[\u0600-\u06FF]/.test(s);

function citationsOf(content: string): Citation[] {
  const out: Citation[] = [];
  const seen = new Set<string>();
  const re = /\[\[([^\]]+)\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) {
    const c = parseCitation(m[1]);
    if (c && !seen.has(c.label)) {
      seen.add(c.label);
      out.push(c);
    }
  }
  return out;
}

export default function MessageBubble({
  message,
  pending,
  onCopy,
  onRegenerate,
  onCitation,
}: {
  message: StoredMessage;
  pending?: boolean;
  onCopy: (text: string) => void;
  onRegenerate?: () => void;
  onCitation: (c: Citation) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isUser = message.role === 'user';
  const citations = useMemo(() => (isUser ? [] : citationsOf(message.content)), [isUser, message.content]);

  if (isUser) {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={[styles.userText, hasArabic(message.content) && styles.userArabic]}>{message.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.botRow}>
      <View style={styles.avatar}>
        <Sparkles size={14} color={colors.primaryForeground} strokeWidth={2.4} />
      </View>
      <View style={styles.botBody}>
        {message.content ? <Markdown content={message.content} /> : pending ? <TypingDots /> : null}

        {citations.length > 0 ? (
          <View style={styles.sources}>
            <Text style={styles.sourcesLabel}>Sources</Text>
            <View style={styles.sourcesRow}>
              {citations.map((c) => (
                <CitationChip key={c.label} citation={c} onPress={onCitation} />
              ))}
            </View>
          </View>
        ) : null}

        {message.content && !pending ? (
          <View style={styles.actions}>
            <Pressable onPress={() => onCopy(message.content)} hitSlop={8} style={styles.action} accessibilityLabel="Copy">
              <Copy size={14} color={colors.subtleForeground} strokeWidth={2} />
            </Pressable>
            {onRegenerate ? (
              <Pressable onPress={onRegenerate} hitSlop={8} style={styles.action} accessibilityLabel="Regenerate">
                <RefreshCw size={14} color={colors.subtleForeground} strokeWidth={2} />
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    userRow: { alignItems: 'flex-end', marginVertical: spacing.xs },
    userBubble: {
      maxWidth: '86%',
      backgroundColor: colors.cardElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      borderBottomRightRadius: radius.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    userText: { fontFamily, fontSize: 15, lineHeight: 22, color: colors.foreground },
    userArabic: { fontFamily: arabicFont, fontSize: 19, lineHeight: 30, textAlign: 'right' },
    botRow: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.xs, alignItems: 'flex-start' },
    avatar: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    botBody: { flex: 1, minWidth: 0, gap: spacing.sm },
    sources: { gap: 5, marginTop: 2 },
    sourcesLabel: { ...typography.caption, fontSize: 10, fontWeight: '700', color: colors.subtleForeground, textTransform: 'uppercase', letterSpacing: 0.5 },
    sourcesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    actions: { flexDirection: 'row', gap: spacing.md, marginTop: 2 },
    action: { padding: 2 },
  });
