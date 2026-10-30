/**
 * AIChatScreen — the ADL AI companion (F19).
 *
 * A ChatGPT-style thread: streamed, corpus-grounded replies with tappable
 * citations, multiple conversations, prompt starters, and secure BYO-key
 * settings. Islamic-only by design. Rendered as a Dashboard overlay.
 */
import { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { MessageSquarePlus, PanelLeft, Settings2, Sparkles, X } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import useChat, { type SendConfig } from '../hooks/useChat';
import useAISettings from '../hooks/useAISettings';
import MessageBubble from '../components/ai/MessageBubble';
import Composer from '../components/ai/Composer';
import PromptStarters from '../components/ai/PromptStarters';
import ConversationList from '../components/ai/ConversationList';
import AISettingsSheet from '../components/ai/AISettingsSheet';
import { AI_DISCLAIMER } from '../content/ai/systemPrompt';
import type { Citation } from '../components/ai/CitationChip';
import type { StoredMessage } from '../lib/ai/store';

export default function AIChatScreen({
  onNavigate,
  onClose,
}: {
  onNavigate?: (key: string) => void;
  onClose?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { code, locales } = useLocale();
  const chat = useChat();
  const settings = useAISettings();
  const [input, setInput] = useState('');
  const [listOpen, setListOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const localeLabel = useMemo(() => locales.find((l) => l.code === code)?.label, [code, locales]);
  const cfg: SendConfig = {
    providerId: settings.providerId,
    model: settings.model,
    temperature: settings.temperature,
    grounding: settings.grounding,
    localeLabel,
    readKey: settings.readKey,
  };

  const activeTitle = chat.conversations.find((c) => c.id === chat.activeId)?.title ?? 'ADL AI';

  const submit = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setInput('');
    void chat.send(t, cfg);
  };

  const onCitation = (c: Citation) => {
    onNavigate?.(c.kind === 'quran' ? 'quran' : 'hadith');
  };

  const copy = (text: string) => {
    void Clipboard.setStringAsync(text.replace(/\[\[([^\]]+)\]\]/g, ''));
  };

  const lastUserText = useMemo(() => {
    for (let i = chat.messages.length - 1; i >= 0; i--) {
      if (chat.messages[i].role === 'user') return chat.messages[i].content;
    }
    return '';
  }, [chat.messages]);

  const reversed = useMemo(() => [...chat.messages].reverse(), [chat.messages]);

  const renderItem = ({ item, index }: { item: StoredMessage; index: number }) => {
    const isNewestBot = index === 0 && item.role === 'assistant';
    return (
      <MessageBubble
        message={item}
        pending={isNewestBot && chat.streaming && !item.content}
        onCopy={copy}
        onCitation={onCitation}
        onRegenerate={isNewestBot && !chat.streaming && lastUserText ? () => submit(lastUserText) : undefined}
      />
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={10} style={styles.iconBtn}>
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{activeTitle}</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{settings.provider.label} · {settings.model}</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable onPress={() => setListOpen(true)} hitSlop={8} style={styles.iconBtn}>
            <PanelLeft size={18} color={colors.mutedForeground} strokeWidth={2} />
          </Pressable>
          <Pressable onPress={chat.newChat} hitSlop={8} style={styles.iconBtn}>
            <MessageSquarePlus size={18} color={colors.mutedForeground} strokeWidth={2} />
          </Pressable>
          <Pressable onPress={() => setSettingsOpen(true)} hitSlop={8} style={styles.iconBtn}>
            <Settings2 size={18} color={colors.mutedForeground} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        {chat.messages.length === 0 ? (
          <FlatList
            data={[]}
            renderItem={null}
            keyExtractor={() => 'x'}
            contentContainerStyle={styles.emptyWrap}
            ListEmptyComponent={
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Sparkles size={26} color={colors.primary} strokeWidth={2} />
                </View>
                <Text style={styles.emptyTitle}>As-salāmu ʿalaykum</Text>
                <Text style={styles.emptyLead}>
                  I’m ADL AI — ask me anything about the Qurʾān, the Sunnah, and Islam.
                </Text>
                {!settings.keyPresent ? (
                  <Pressable onPress={() => setSettingsOpen(true)} style={styles.keyCta}>
                    <Text style={styles.keyCtaText}>Add your API key to begin</Text>
                  </Pressable>
                ) : null}
                <PromptStarters onPick={submit} />
                <Text style={styles.disclaimer}>{AI_DISCLAIMER}</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={reversed}
            inverted
            keyExtractor={(m) => m.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}

        {chat.error ? (
          <Pressable onPress={chat.clearError} style={styles.errorBar}>
            <Text style={styles.errorText}>{chat.error}</Text>
          </Pressable>
        ) : null}

        <View style={styles.composerWrap}>
          <Composer
            value={input}
            onChangeText={setInput}
            onSend={() => submit(input)}
            onStop={chat.stop}
            streaming={chat.streaming}
          />
        </View>
      </KeyboardAvoidingView>

      <ConversationList
        visible={listOpen}
        onClose={() => setListOpen(false)}
        conversations={chat.conversations}
        activeId={chat.activeId}
        contentIndex={chat.contentIndex}
        onSelect={chat.selectChat}
        onNew={chat.newChat}
        onDelete={chat.deleteChat}
        onTogglePin={chat.togglePin}
        onRename={chat.renameChat}
        onReorder={chat.reorderConversations}
        onRefreshIndex={chat.refreshSearchIndex}
      />
      <AISettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing['3xl'] + spacing.md,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iconBtn: { width: 34, height: 34, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    headerCenter: { flex: 1, alignItems: 'center', gap: 1 },
    headerTitle: { fontFamily, fontSize: 15, fontWeight: '700', color: colors.foreground },
    headerSub: { fontFamily, fontSize: 11, color: colors.subtleForeground },
    headerRight: { flexDirection: 'row', gap: 6 },
    list: { padding: spacing.lg, gap: spacing.xs },
    emptyWrap: { flexGrow: 1, justifyContent: 'center' },
    empty: { padding: spacing.xl, gap: spacing.md, alignItems: 'stretch' },
    emptyIcon: { alignSelf: 'center', width: 56, height: 56, borderRadius: 28, backgroundColor: `${colors.primary}1A`, alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { ...typography.title, fontSize: 22, color: colors.foreground, textAlign: 'center' },
    emptyLead: { fontFamily, fontSize: 15, lineHeight: 22, color: colors.mutedForeground, textAlign: 'center', marginBottom: spacing.sm },
    keyCta: { alignSelf: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colors.primary, marginBottom: spacing.sm },
    keyCtaText: { ...typography.button, fontSize: 14, color: colors.primaryForeground },
    disclaimer: { fontFamily, fontSize: 12, lineHeight: 18, color: colors.subtleForeground, textAlign: 'center', marginTop: spacing.sm },
    errorBar: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: `${colors.destructive}1A`, borderWidth: 1, borderColor: `${colors.destructive}55` },
    errorText: { fontFamily, fontSize: 13, color: colors.destructive, textAlign: 'center' },
    composerWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, paddingTop: spacing.xs },
  });
