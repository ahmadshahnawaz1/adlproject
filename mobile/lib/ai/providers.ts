/**
 * lib/ai/providers — the provider-agnostic request/parse layer for ADL AI.
 *
 * All supported providers speak the OpenAI-compatible Chat Completions dialect
 * (OpenAI, OpenRouter, Groq), so one code path builds the request and parses the
 * server-sent-event stream. OpenRouter alone brokers Claude, Gemini, Llama and
 * more through this shape, so the app reaches every major model with one key.
 *
 * Pure and synchronous — no network, no native — so it is fully tested. The
 * actual streaming lives in lib/ai/stream.
 */

/** One turn of a conversation sent to the model. */
export type AIMessage = { role: 'system' | 'user' | 'assistant'; content: string };

/** A model a provider offers (users may also type a custom id). */
export type AIModel = { id: string; label: string };

/** A supported inference provider. */
export type AIProvider = {
  id: string;
  label: string;
  /** Chat-completions endpoint. */
  endpoint: string;
  /** A hint shown near the key field, e.g. "sk-…". */
  keyHint: string;
  /** Where the user gets a key. */
  keyUrl: string;
  models: AIModel[];
  defaultModel: string;
};

export const PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    keyHint: 'sk-…',
    keyUrl: 'https://platform.openai.com/api-keys',
    defaultModel: 'gpt-4o-mini',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o mini (fast, cheap)' },
      { id: 'gpt-4o', label: 'GPT-4o (most capable)' },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
    ],
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    keyHint: 'sk-or-…',
    keyUrl: 'https://openrouter.ai/keys',
    defaultModel: 'openai/gpt-4o-mini',
    models: [
      { id: 'openai/gpt-4o-mini', label: 'GPT-4o mini' },
      { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
      { id: 'google/gemini-flash-1.5', label: 'Gemini 1.5 Flash' },
      { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B' },
    ],
  },
  {
    id: 'groq',
    label: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    keyHint: 'gsk_…',
    keyUrl: 'https://console.groq.com/keys',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (versatile)' },
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (instant)' },
    ],
  },
];

export const DEFAULT_PROVIDER_ID = 'openai';

/** Resolve a provider by id, falling back to the default. */
export function providerById(id: string): AIProvider {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
}

/** The HTTP request (url, headers, body) for a streaming chat completion. */
export type ChatRequest = {
  url: string;
  headers: Record<string, string>;
  body: string;
};

/** Build an OpenAI-compatible streaming chat request (the key is added later). */
export function buildChatRequest(
  provider: AIProvider,
  opts: { model: string; messages: AIMessage[]; temperature?: number; stream?: boolean },
): ChatRequest {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  // OpenRouter recommends attribution headers.
  if (provider.id === 'openrouter') {
    headers['HTTP-Referer'] = 'https://adl.app';
    headers['X-Title'] = 'Adl';
  }
  return {
    url: provider.endpoint,
    headers,
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.4,
      stream: opts.stream ?? true,
    }),
  };
}

/** The meaning of one parsed SSE line. */
export type SSEEvent = { delta?: string; done?: boolean };

/**
 * Parse a single line of an OpenAI-compatible SSE stream. Returns a text delta,
 * a done signal, or nothing (comments/keep-alives). Malformed JSON is ignored.
 */
export function parseSSELine(line: string): SSEEvent {
  const trimmed = line.trim();
  if (!trimmed || !trimmed.startsWith('data:')) return {};
  const payload = trimmed.slice(5).trim();
  if (payload === '[DONE]') return { done: true };
  try {
    const json = JSON.parse(payload);
    const delta = json?.choices?.[0]?.delta?.content;
    return typeof delta === 'string' ? { delta } : {};
  } catch {
    return {};
  }
}
