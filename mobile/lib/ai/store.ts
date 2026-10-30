/**
 * lib/ai/store — on-device persistence for ADL AI chats (F19).
 *
 * Conversations (metadata) and their messages are kept in AsyncStorage — simple
 * and dependency-light for v1; the interface is small enough to swap for SQLite
 * in the backend track. Messages live under a per-conversation key so a large
 * thread never bloats the index.
 */
import AsyncStorage from '../scopedStorage';

const INDEX_KEY = 'adl.ai.conversations.v1';
const messagesKey = (convId: string): string => `adl.ai.messages.${convId}`;

export type ChatRole = 'user' | 'assistant';

/** One stored message. `citations` are parsed on render. */
export type StoredMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

/** A conversation's metadata (messages are stored separately). */
export type Conversation = {
  id: string;
  title: string;
  model: string;
  providerId: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
};

/** A collision-resistant id (matches the app's ledger id style). */
export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function loadConversations(): Promise<Conversation[]> {
  try {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}

export async function saveConversations(list: Conversation[]): Promise<void> {
  try {
    await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(list));
  } catch {
    // best-effort
  }
}

export async function loadMessages(convId: string): Promise<StoredMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(messagesKey(convId));
    return raw ? (JSON.parse(raw) as StoredMessage[]) : [];
  } catch {
    return [];
  }
}

export async function saveMessages(convId: string, msgs: StoredMessage[]): Promise<void> {
  try {
    await AsyncStorage.setItem(messagesKey(convId), JSON.stringify(msgs));
  } catch {
    // best-effort
  }
}

export async function deleteConversationData(convId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(messagesKey(convId));
  } catch {
    // best-effort
  }
}
