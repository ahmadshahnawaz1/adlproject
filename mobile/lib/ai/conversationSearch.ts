/**
 * lib/ai/conversationSearch — pure, diacritic-insensitive search over ADL AI
 * chats. Matches a conversation's title and (optionally) its message content,
 * reusing the app's shared text normaliser so search behaves like every other
 * search in Adl. Pure & tested — native message loading happens in the hook.
 */
import { normalizeText, queryTokens } from '../duaSearch';
import type { Conversation } from './store';

/** The searchable text for a conversation: its title plus any indexed content. */
export function conversationHaystack(conv: Conversation, contentText?: string): string {
  return normalizeText(`${conv.title} ${contentText ?? ''}`);
}

/** AND-token match: every query token must appear in the title or content. */
export function matchesConversation(
  conv: Conversation,
  query: string,
  contentText?: string,
): boolean {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return true;
  const hay = conversationHaystack(conv, contentText);
  return tokens.every((token) => hay.includes(token));
}

/** Filter conversations by a free-text query. Empty query → the list unchanged. */
export function filterConversations(
  conversations: Conversation[],
  query: string,
  contentById?: Record<string, string>,
): Conversation[] {
  if (!query.trim()) return conversations;
  return conversations.filter((c) => matchesConversation(c, query, contentById?.[c.id]));
}
