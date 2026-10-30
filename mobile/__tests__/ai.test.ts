/**
 * Tests for the pure ADL AI layer — providers, topic guard, retrieval, context.
 * No native imports (secure-store / expo-fetch / storage stay out).
 */
import {
  PROVIDERS,
  DEFAULT_PROVIDER_ID,
  providerById,
  buildChatRequest,
  parseSSELine,
} from '../lib/ai/providers';
import { classifyMessage, isAllowed } from '../lib/ai/topicGuard';
import { retrieve } from '../lib/ai/retrieval';
import { buildMessages, formatGrounding } from '../lib/ai/context';

describe('providers', () => {
  it('has a default provider and resolves by id with fallback', () => {
    expect(providerById(DEFAULT_PROVIDER_ID).id).toBe(DEFAULT_PROVIDER_ID);
    expect(providerById('nope').id).toBe(PROVIDERS[0].id);
    for (const p of PROVIDERS) {
      expect(p.models.length).toBeGreaterThan(0);
      expect(p.models.some((m) => m.id === p.defaultModel)).toBe(true);
    }
  });

  it('builds an OpenAI-compatible request without embedding the key', () => {
    const req = buildChatRequest(providerById('openai'), {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'hi' }],
    });
    expect(req.url).toContain('/chat/completions');
    expect(req.headers.Authorization).toBeUndefined();
    const body = JSON.parse(req.body);
    expect(body.model).toBe('gpt-4o-mini');
    expect(body.stream).toBe(true);
    expect(body.messages[0].content).toBe('hi');
  });

  it('adds OpenRouter attribution headers', () => {
    const req = buildChatRequest(providerById('openrouter'), {
      model: 'x',
      messages: [],
    });
    expect(req.headers['X-Title']).toBe('Adl');
  });

  it('parses SSE lines: delta, done, comments, garbage', () => {
    expect(parseSSELine('data: {"choices":[{"delta":{"content":"As"}}]}')).toEqual({ delta: 'As' });
    expect(parseSSELine('data: [DONE]')).toEqual({ done: true });
    expect(parseSSELine(': keep-alive')).toEqual({});
    expect(parseSSELine('')).toEqual({});
    expect(parseSSELine('data: not-json')).toEqual({});
  });
});

describe('topic guard', () => {
  it('allows clearly Islamic questions', () => {
    expect(classifyMessage('What is the ruling on wudu?')).toBe('allow');
    expect(classifyMessage('Explain Ayat al-Kursi')).toBe('allow');
    expect(isAllowed('How do I pray tahajjud?')).toBe(true);
  });

  it('redirects clearly off-topic requests', () => {
    expect(classifyMessage('Write me a python function to sort a list')).toBe('redirect');
    expect(classifyMessage('What was the football score last night?')).toBe('redirect');
  });

  it('is lenient on ambiguous input (defaults to allow)', () => {
    expect(classifyMessage('I feel anxious and sad, what should I do?')).toBe('allow');
  });
});

describe('retrieval', () => {
  it('returns nothing for an empty query', () => {
    expect(retrieve('')).toEqual([]);
    expect(retrieve('   ')).toEqual([]);
  });

  it('grounds a query in the corpus with citations for hadith', () => {
    const docs = retrieve('intention');
    expect(docs.length).toBeGreaterThan(0);
    const hadith = docs.find((d) => d.kind === 'hadith');
    expect(hadith).toBeTruthy();
    expect(hadith?.citation).toMatch(/^hadith:/);
  });

  it('caps the total number of docs', () => {
    const docs = retrieve('prayer', { total: 3 });
    expect(docs.length).toBeLessThanOrEqual(3);
  });
});

describe('context', () => {
  it('formats grounding with citation tokens', () => {
    const block = formatGrounding([
      { kind: 'hadith', title: 'nawawi40 #1', text: 'Actions are by intentions', citation: 'hadith:nawawi40:1', source: 'Hadith' },
    ]);
    expect(block).toContain('[[hadith:nawawi40:1]]');
    expect(block).toContain('RETRIEVED CONTEXT');
  });

  it('builds a message list: system first, user last, history trimmed', () => {
    const history = Array.from({ length: 20 }, (_, i) => ({
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `m${i}`,
    }));
    const msgs = buildMessages({ history, userMessage: 'final', maxHistory: 6 });
    expect(msgs[0].role).toBe('system');
    expect(msgs[msgs.length - 1]).toEqual({ role: 'user', content: 'final' });
    // system + 6 history + 1 user = 8
    expect(msgs.length).toBe(8);
  });

  it('injects grounding into the system message', () => {
    const msgs = buildMessages({
      history: [],
      userMessage: 'q',
      retrieved: [{ kind: 'dua', title: 'Duʿāʾ', text: 'O Allah', source: 'Duʿāʾ library' }],
    });
    expect(msgs[0].content).toContain('RETRIEVED CONTEXT');
  });
});
