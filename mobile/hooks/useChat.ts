/**
 * useChat — the controller behind ADL AI (F19).
 *
 * Owns the conversation list and the active thread, and drives a streamed,
 * corpus-grounded reply: it guards the topic, retrieves grounding, builds the
 * prompt, streams the answer token-by-token into the last message, and persists
 * everything. Cancellable and resilient. Native (streams via expo/fetch) — not
 * imported by tests.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { classifyMessage } from '../lib/ai/topicGuard';
import { retrieve } from '../lib/ai/retrieval';
import { buildMessages } from '../lib/ai/context';
import { AI_OFFTOPIC_REDIRECT } from '../content/ai/systemPrompt';
import { streamChat } from '../lib/ai/stream';
import {
  type AIMessage,
} from '../lib/ai/providers';
import {
  deleteConversationData,
  loadConversations,
  loadMessages,
  newId,
  saveConversations,
  saveMessages,
  type Conversation,
  type StoredMessage,
} from '../lib/ai/store';

/** Everything a send needs from the settings hook. */
export type SendConfig = {
  providerId: string;
  model: string;
  temperature: number;
  grounding: boolean;
  localeLabel?: string;
  readKey: () => Promise<string | null>;
};

// Pinned float to the top; within each group the array order is the user's
// manual (reorderable) order, not recency.
function orderConversations(list: Conversation[]): Conversation[] {
  const pinned = list.filter((c) => c.pinned);
  const rest = list.filter((c) => !c.pinned);
  return [...pinned, ...rest];
}

function titleFrom(text: string): string {
  const t = text.trim().replace(/\s+/g, ' ');
  return t.length > 42 ? `${t.slice(0, 42)}…` : t || 'New chat';
}

export default function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const streamTextRef = useRef('');

  const [contentIndex, setContentIndex] = useState<Record<string, string>>({});
  const contentCacheRef = useRef<Map<string, { updatedAt: number; text: string }>>(new Map());

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await loadConversations();
      if (alive) {
        setConversations(orderConversations(list));
        setReady(true);
      }
    })();
    return () => {
      alive = false;
      abortRef.current?.abort();
    };
  }, []);

  const persistConversations = useCallback((list: Conversation[]) => {
    const ordered = orderConversations(list);
    setConversations(ordered);
    void saveConversations(ordered);
    return ordered;
  }, []);

  const newChat = useCallback(() => {
    abortRef.current?.abort();
    setActiveId(null);
    setMessages([]);
    setError(null);
    setStreaming(false);
  }, []);

  const selectChat = useCallback(async (id: string) => {
    abortRef.current?.abort();
    setStreaming(false);
    setError(null);
    setActiveId(id);
    setMessages(await loadMessages(id));
  }, []);

  const renameChat = useCallback(
    (id: string, title: string) => {
      setConversations((prev) =>
        persistConversations(prev.map((c) => (c.id === id ? { ...c, title: title.trim() || c.title } : c))),
      );
    },
    [persistConversations],
  );

  const togglePin = useCallback(
    (id: string) => {
      setConversations((prev) =>
        persistConversations(prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))),
      );
    },
    [persistConversations],
  );

  const deleteChat = useCallback(
    (id: string) => {
      setConversations((prev) => persistConversations(prev.filter((c) => c.id !== id)));
      void deleteConversationData(id);
      if (activeId === id) newChat();
    },
    [activeId, newChat, persistConversations],
  );

  // Apply a user drag-reorder. Pinned still float to the top; the provided order
  // sets the manual order within each group.
  const reorderConversations = useCallback(
    (orderedIds: string[]) => {
      const byId = new Map(conversations.map((c) => [c.id, c] as const));
      const ordered = orderedIds
        .map((id) => byId.get(id))
        .filter((c): c is Conversation => Boolean(c));
      for (const c of conversations) if (!orderedIds.includes(c.id)) ordered.push(c);
      persistConversations(ordered);
    },
    [conversations, persistConversations],
  );

  // Build a cached title+content index for searching chats. Reuses cached text
  // for conversations whose timestamp is unchanged, so repeat opens are cheap.
  const refreshSearchIndex = useCallback(async () => {
    const cache = contentCacheRef.current;
    const next: Record<string, string> = {};
    for (const c of conversations) {
      const cached = cache.get(c.id);
      if (cached && cached.updatedAt === c.updatedAt) {
        next[c.id] = cached.text;
      } else {
        const msgs = await loadMessages(c.id);
        const text = msgs.map((m) => m.content).join(' ');
        cache.set(c.id, { updatedAt: c.updatedAt, text });
        next[c.id] = text;
      }
    }
    setContentIndex(next);
  }, [conversations]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // Persist a finished exchange and update (or create) its conversation.
  const commit = useCallback(
    (finalMsgs: StoredMessage[], cfg: SendConfig, firstText: string, convId: string | null) => {
      setMessages(finalMsgs);
      let id = convId;
      if (!id) {
        id = newId();
        const conv: Conversation = {
          id,
          title: titleFrom(firstText),
          model: cfg.model,
          providerId: cfg.providerId,
          pinned: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setActiveId(id);
        setConversations((prev) => persistConversations([conv, ...prev]));
      } else {
        const theId = id;
        setConversations((prev) =>
          persistConversations(
            prev.map((cv) => (cv.id === theId ? { ...cv, updatedAt: Date.now(), model: cfg.model } : cv)),
          ),
        );
      }
      void saveMessages(id, finalMsgs);
    },
    [persistConversations],
  );

  const send = useCallback(
    async (text: string, cfg: SendConfig) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;
      setError(null);
      const convId = activeId;

      // Off-topic → gentle redirect, no API call.
      if (classifyMessage(trimmed) === 'redirect') {
        const now = Date.now();
        const userMsg: StoredMessage = { id: newId(), role: 'user', content: trimmed, createdAt: now };
        const botMsg: StoredMessage = { id: newId(), role: 'assistant', content: AI_OFFTOPIC_REDIRECT, createdAt: now + 1 };
        commit([...messages, userMsg, botMsg], cfg, trimmed, convId);
        return;
      }

      const key = await cfg.readKey();
      if (!key) {
        setError('Add your API key in AI settings to start chatting.');
        return;
      }

      const now = Date.now();
      const userMsg: StoredMessage = { id: newId(), role: 'user', content: trimmed, createdAt: now };
      const botMsg: StoredMessage = { id: newId(), role: 'assistant', content: '', createdAt: now + 1 };
      const prior = messages;
      const priorHistory: AIMessage[] = prior.map((m) => ({ role: m.role, content: m.content }));

      setMessages([...prior, userMsg, botMsg]);
      setStreaming(true);
      streamTextRef.current = '';

      const retrieved = cfg.grounding ? retrieve(trimmed) : [];
      const prompt = buildMessages({
        history: priorHistory,
        userMessage: trimmed,
        retrieved,
        localeLabel: cfg.localeLabel,
      });

      const controller = new AbortController();
      abortRef.current = controller;

      const setBot = (content: string) =>
        setMessages((cur) => cur.map((m) => (m.id === botMsg.id ? { ...m, content } : m)));

      await streamChat(
        {
          providerId: cfg.providerId,
          model: cfg.model,
          key,
          messages: prompt,
          temperature: cfg.temperature,
          signal: controller.signal,
        },
        {
          onDelta: (d) => {
            streamTextRef.current += d;
            setBot(streamTextRef.current);
          },
          onDone: (full) => {
            const finalText = full || streamTextRef.current;
            setStreaming(false);
            commit([...prior, userMsg, { ...botMsg, content: finalText || '…' }], cfg, trimmed, convId);
          },
          onError: (m) => {
            setStreaming(false);
            setError(m);
            setMessages((cur) => cur.filter((x) => x.id !== botMsg.id));
          },
        },
      );
    },
    [activeId, messages, streaming, commit],
  );

  return {
    ready,
    conversations,
    activeId,
    messages,
    streaming,
    error,
    newChat,
    selectChat,
    renameChat,
    togglePin,
    deleteChat,
    reorderConversations,
    contentIndex,
    refreshSearchIndex,
    send,
    stop,
    clearError: () => setError(null),
  };
}
