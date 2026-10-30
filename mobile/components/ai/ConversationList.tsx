/**
 * ConversationList — the ADL AI chat history sheet (F19 + chat management).
 *
 * Start a new chat and browse, search, select, pin, rename, delete, or drag to
 * reorder past conversations. Search matches titles and message content
 * (diacritic-insensitive); with an empty query the list is drag-reorderable and
 * pinned chats float to the top.
 */
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Check, GripVertical, MessageSquarePlus, Pencil, Pin, Search, Trash2, X } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import ReorderableList from '../common/ReorderableList';
import { filterConversations } from '../../lib/ai/conversationSearch';
import type { Conversation } from '../../lib/ai/store';

const ROW_H = 46;
const ROW_GAP = 8;
const LIST_MAX = Math.round(Dimensions.get('window').height * 0.58);

export default function ConversationList({
  visible,
  onClose,
  conversations,
  activeId,
  contentIndex,
  onSelect,
  onNew,
  onDelete,
  onTogglePin,
  onRename,
  onReorder,
  onRefreshIndex,
}: {
  visible: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string | null;
  contentIndex: Record<string, string>;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onRefreshIndex: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [query, setQuery] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<Conversation | null>(null);
  const [renameText, setRenameText] = useState('');

  useEffect(() => {
    if (visible) onRefreshIndex();
  }, [visible, onRefreshIndex]);

  const searching = query.trim().length > 0;
  const filtered = filterConversations(conversations, query, contentIndex);

  const select = (id: string) => {
    onSelect(id);
    onClose();
  };
  const openRename = (c: Conversation) => {
    setRenameText(c.title);
    setRenaming(c);
  };
  const submitRename = () => {
    if (renaming && renameText.trim()) onRename(renaming.id, renameText.trim());
    setRenaming(null);
  };

  const renderRow = (c: Conversation, dragHandleProps?: object) => {
    const active = c.id === activeId;
    return (
      <View style={[styles.row, active && styles.rowActive]}>
        {dragHandleProps ? (
          <View {...dragHandleProps} style={styles.grip}>
            <GripVertical size={16} color={colors.subtleForeground} strokeWidth={2} />
          </View>
        ) : null}
        <Pressable
          style={styles.rowMain}
          onPress={() => select(c.id)}
          accessibilityRole="button"
          accessibilityLabel={c.title}
        >
          {c.pinned ? <Pin size={13} color={colors.primary} strokeWidth={2.2} /> : null}
          <Text style={styles.rowTitle} numberOfLines={1}>{c.title}</Text>
        </Pressable>
        <Pressable onPress={() => onTogglePin(c.id)} hitSlop={8} style={styles.rowBtn} accessibilityLabel="Pin">
          <Pin size={14} color={c.pinned ? colors.primary : colors.subtleForeground} strokeWidth={2} />
        </Pressable>
        <Pressable onPress={() => openRename(c)} hitSlop={8} style={styles.rowBtn} accessibilityLabel="Rename">
          <Pencil size={14} color={colors.subtleForeground} strokeWidth={2} />
        </Pressable>
        <Pressable onPress={() => setConfirmId(c.id)} hitSlop={8} style={styles.rowBtn} accessibilityLabel="Delete">
          <Trash2 size={14} color={colors.destructive} strokeWidth={2} />
        </Pressable>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Chats</Text>
            <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
              <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
            </Pressable>
          </View>

          <View style={styles.searchBar}>
            <Search size={16} color={colors.subtleForeground} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search chats"
              placeholderTextColor={colors.subtleForeground}
              returnKeyType="search"
              autoCorrect={false}
            />
            {searching ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <X size={15} color={colors.subtleForeground} strokeWidth={2} />
              </Pressable>
            ) : null}
          </View>

          <Pressable
            onPress={() => { onNew(); onClose(); }}
            style={({ pressed }) => [styles.newBtn, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <MessageSquarePlus size={18} color={colors.primaryForeground} strokeWidth={2.2} />
            <Text style={styles.newText}>New chat</Text>
          </Pressable>

          {conversations.length === 0 ? (
            <Text style={styles.empty}>No conversations yet.</Text>
          ) : searching ? (
            <ScrollView style={{ maxHeight: LIST_MAX }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
              {filtered.length === 0 ? (
                <Text style={styles.empty}>No chats match “{query.trim()}”.</Text>
              ) : (
                filtered.map((c) => <View key={c.id} style={styles.rowWrap}>{renderRow(c)}</View>)
              )}
            </ScrollView>
          ) : (
            <>
              <Text style={styles.hint}>Hold the grip to reorder · pinned stay on top</Text>
              <ReorderableList
                data={conversations}
                keyExtractor={(c) => c.id}
                itemHeight={ROW_H}
                gap={ROW_GAP}
                style={{ maxHeight: LIST_MAX }}
                onReorder={(next) => onReorder(next.map((c) => c.id))}
                renderItem={({ item, dragHandleProps }) => renderRow(item, dragHandleProps)}
              />
            </>
          )}
        </View>
      </View>

      {/* Delete confirmation */}
      <Modal visible={confirmId !== null} transparent animationType="fade" onRequestClose={() => setConfirmId(null)}>
        <View style={styles.dialogRoot}>
          <Pressable style={styles.backdrop} onPress={() => setConfirmId(null)} />
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Delete chat?</Text>
            <Text style={styles.dialogBody}>This conversation and its messages will be permanently removed.</Text>
            <View style={styles.dialogRow}>
              <Pressable style={[styles.dialogBtn, styles.dialogGhost]} onPress={() => setConfirmId(null)}>
                <Text style={styles.dialogGhostText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.dialogBtn, styles.dialogDanger]}
                onPress={() => { if (confirmId) onDelete(confirmId); setConfirmId(null); }}
              >
                <Text style={styles.dialogDangerText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rename (cross-platform) */}
      <Modal visible={renaming !== null} transparent animationType="fade" onRequestClose={() => setRenaming(null)}>
        <View style={styles.dialogRoot}>
          <Pressable style={styles.backdrop} onPress={() => setRenaming(null)} />
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Rename chat</Text>
            <TextInput
              style={styles.renameInput}
              value={renameText}
              onChangeText={setRenameText}
              placeholder="Chat name"
              placeholderTextColor={colors.subtleForeground}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={submitRename}
            />
            <View style={styles.dialogRow}>
              <Pressable style={[styles.dialogBtn, styles.dialogGhost]} onPress={() => setRenaming(null)}>
                <Text style={styles.dialogGhostText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.dialogBtn, styles.dialogPrimary]} onPress={submitRename}>
                <Check size={15} color={colors.primaryForeground} strokeWidth={2.5} />
                <Text style={styles.dialogPrimaryText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
    sheet: {
      maxHeight: '85%',
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
    title: { ...typography.title, fontSize: 18, color: colors.foreground },
    close: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    searchBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.input, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, height: 42, marginBottom: spacing.md },
    searchInput: { flex: 1, fontFamily, fontSize: 15, color: colors.foreground, padding: 0 },
    newBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, marginBottom: spacing.md },
    newText: { ...typography.button, color: colors.primaryForeground },
    pressed: { opacity: 0.85 },
    hint: { ...typography.caption, fontSize: 11, color: colors.subtleForeground, marginBottom: spacing.sm, paddingHorizontal: 2 },
    list: { paddingBottom: spacing.lg, gap: ROW_GAP },
    rowWrap: { height: ROW_H },
    empty: { fontFamily, fontSize: 14, color: colors.mutedForeground, textAlign: 'center', paddingVertical: spacing.xl },
    row: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingRight: spacing.md, paddingLeft: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, height: ROW_H },
    rowActive: { borderColor: `${colors.primary}66`, backgroundColor: colors.cardElevated },
    grip: { paddingHorizontal: 4, height: '100%', justifyContent: 'center' },
    rowMain: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6 },
    rowTitle: { flex: 1, fontFamily, fontSize: 14, color: colors.foreground },
    rowBtn: { padding: 4 },
    dialogRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
    dialog: { width: '100%', maxWidth: 360, backgroundColor: colors.background, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md },
    dialogTitle: { ...typography.title, fontSize: 17, color: colors.foreground },
    dialogBody: { fontFamily, fontSize: 14, lineHeight: 20, color: colors.mutedForeground },
    renameInput: { fontFamily, fontSize: 15, color: colors.foreground, backgroundColor: colors.input, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderFocus, paddingHorizontal: spacing.md, height: 44 },
    dialogRow: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end', marginTop: spacing.xs },
    dialogBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.md },
    dialogGhost: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    dialogGhostText: { ...typography.button, color: colors.foreground },
    dialogPrimary: { backgroundColor: colors.primary },
    dialogPrimaryText: { ...typography.button, color: colors.primaryForeground },
    dialogDanger: { backgroundColor: colors.destructive },
    dialogDangerText: { ...typography.button, color: colors.white },
  });
