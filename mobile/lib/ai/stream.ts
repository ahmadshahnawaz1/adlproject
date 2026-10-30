/**
 * lib/ai/stream — the streaming transport for ADL AI (F19).
 *
 * Sends an OpenAI-compatible chat request through Expo's streaming `fetch` and
 * decodes the server-sent-event body token by token, so the UI can type the
 * answer out live. Supports cancellation (AbortController), surfaces auth/rate/
 * network errors clearly, and never logs the key. Native (uses expo/fetch) —
 * not imported by tests.
 */
import { fetch as expoFetch } from 'expo/fetch';
import {
  buildChatRequest,
  parseSSELine,
  providerById,
  type AIMessage,
} from './providers';

export type StreamHandlers = {
  onDelta: (text: string) => void;
  onDone: (full: string) => void;
  onError: (message: string) => void;
};

export type StreamOptions = {
  providerId: string;
  model: string;
  key: string;
  messages: AIMessage[];
  temperature?: number;
  signal?: AbortSignal;
};

/** Map an HTTP status to a friendly, non-leaking message. */
function statusMessage(status: number): string {
  if (status === 401 || status === 403) return 'Your API key was rejected. Check it in AI settings.';
  if (status === 429) return 'Rate limit reached. Please wait a moment and try again.';
  if (status >= 500) return 'The AI service is having trouble right now. Please try again.';
  return `Request failed (${status}).`;
}

/**
 * Stream a chat completion. Resolves when the stream finishes (or aborts);
 * routes text through `onDelta`, the final text through `onDone`, and any
 * failure through `onError`.
 */
export async function streamChat(opts: StreamOptions, handlers: StreamHandlers): Promise<void> {
  const provider = providerById(opts.providerId);
  const req = buildChatRequest(provider, {
    model: opts.model,
    messages: opts.messages,
    temperature: opts.temperature,
    stream: true,
  });

  let full = '';
  try {
    const res = await expoFetch(req.url, {
      method: 'POST',
      headers: { ...req.headers, Authorization: `Bearer ${opts.key}` },
      body: req.body,
      signal: opts.signal,
    });

    if (!res.ok) {
      let detail = '';
      try {
        const j = await res.json();
        detail = j?.error?.message ?? '';
      } catch {
        // ignore
      }
      handlers.onError(detail || statusMessage(res.status));
      return;
    }

    const body = res.body;
    if (!body) {
      handlers.onError('The AI service returned an empty response.');
      return;
    }

    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE events are separated by newlines; process complete lines.
      let nl: number;
      while ((nl = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 1);
        const evt = parseSSELine(line);
        if (evt.done) {
          handlers.onDone(full);
          return;
        }
        if (evt.delta) {
          full += evt.delta;
          handlers.onDelta(evt.delta);
        }
      }
    }

    // Flush any trailing buffered line.
    const evt = parseSSELine(buffer);
    if (evt.delta) {
      full += evt.delta;
      handlers.onDelta(evt.delta);
    }
    handlers.onDone(full);
  } catch (err: unknown) {
    const aborted =
      opts.signal?.aborted ||
      (err instanceof Error && (err.name === 'AbortError' || /abort/i.test(err.message)));
    if (aborted) {
      handlers.onDone(full); // keep the partial answer
      return;
    }
    handlers.onError('Couldn’t reach the AI service. Check your connection and API key.');
  }
}
