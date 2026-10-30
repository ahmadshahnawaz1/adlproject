/**
 * Tests for the pure conversation search used by the ADL AI chat history.
 */
import {
  conversationHaystack,
  matchesConversation,
  filterConversations,
} from '../lib/ai/conversationSearch';
import type { Conversation } from '../lib/ai/store';

function conv(id: string, title: string, pinned = false): Conversation {
  return {
    id,
    title,
    model: 'gpt-4o-mini',
    providerId: 'openai',
    pinned,
    createdAt: 0,
    updatedAt: 0,
  };
}

const list: Conversation[] = [
  conv('a', 'Rulings on wuḍūʾ'),
  conv('b', 'The story of Badr'),
  conv('c', 'Zakat on gold', true),
];

describe('conversationHaystack', () => {
  it('folds title diacritics and joins content', () => {
    expect(conversationHaystack(list[0])).toBe('rulings on wudu');
    expect(conversationHaystack(list[1], 'The Prophet ﷺ at Uḥud')).toContain('uhud');
  });
});

describe('matchesConversation', () => {
  it('matches on a title token, diacritic-insensitive', () => {
    expect(matchesConversation(list[0], 'wudu')).toBe(true);
    expect(matchesConversation(list[0], 'WUDŪʾ')).toBe(true);
  });

  it('matches on message content when provided', () => {
    expect(matchesConversation(list[1], 'quraysh')).toBe(false);
    expect(matchesConversation(list[1], 'quraysh', 'the Quraysh marched to Badr')).toBe(true);
  });

  it('requires every token to match (AND semantics)', () => {
    expect(matchesConversation(list[2], 'zakat gold')).toBe(true);
    expect(matchesConversation(list[2], 'zakat silver')).toBe(false);
  });

  it('treats an empty query as a match', () => {
    expect(matchesConversation(list[0], '   ')).toBe(true);
  });
});

describe('filterConversations', () => {
  it('returns the list unchanged for an empty query', () => {
    expect(filterConversations(list, '')).toEqual(list);
  });

  it('filters by title', () => {
    const hits = filterConversations(list, 'badr');
    expect(hits).toHaveLength(1);
    expect(hits[0].id).toBe('b');
  });

  it('filters by indexed content', () => {
    const hits = filterConversations(list, 'khadijah', { a: 'ask about Khadījah', b: '', c: '' });
    expect(hits.map((h) => h.id)).toEqual(['a']);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterConversations(list, 'zzznotaword')).toEqual([]);
  });
});
