/**
 * Reading an ingredients label with a vision model (optional, BYO key).
 *
 * The model is only ever a typing aid. It is asked to transcribe and nothing
 * else, its reply is stripped of any commentary, and the text lands in an
 * editable field for the user to check against the packet before Adl assesses
 * it offline. No judgement about an ingredient is ever taken from the model.
 *
 * On-device OCR is not possible in Expo Go, which is why this route exists.
 */
import { providerById, type AIProvider } from '../ai/providers';

/** Models known to accept images, per provider. */
export const VISION_MODELS: Record<string, string[]> = {
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
  openrouter: ['openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet', 'google/gemini-flash-1.5'],
  groq: [],
};

/** A vision model for this provider — the user's own if it can see, else the first that can. */
export function visionModelFor(providerId: string, preferred?: string): string | null {
  const models = VISION_MODELS[providerId] ?? [];
  if (preferred && models.includes(preferred)) return preferred;
  return models[0] ?? null;
}

export function providerSupportsVision(providerId: string): boolean {
  return (VISION_MODELS[providerId] ?? []).length > 0;
}

export const TRANSCRIBE_PROMPT =
  'Transcribe the ingredients list in this photograph exactly as printed. Output only the ingredients, separated by commas, on a single line. Preserve E-numbers and bracketed text exactly. Do not translate, do not summarise, do not add or remove anything, and do not comment on the ingredients or say whether they are suitable for anyone. If no ingredients list is legible, reply with exactly: UNREADABLE';

const UNREADABLE = /^\s*unreadable\s*$/i;
const CANNOT_READ = /\b(can(no|')t read|not legible|unable to (read|make out)|no (visible |legible )?(text|ingredients))\b/i;

/** Lines that are the model talking rather than the packet. */
const COMMENTARY = new RegExp(
  [
    '\\bhal[\u0101a]l\\b',
    '\\bhar[\u0101a]m\\b',
    '\\bpermissible\\b',
    '\\bimpermissible\\b',
    '\\bprohibited\\b',
    '\\bforbidden\\b',
    '\\bacceptable\\b',
    '\\bsuitable for\\b',
    '\\bappears? to\\b',
    '\\bseems? to\\b',
    "\\bi'?m\\b",
    '\\bi am\\b',
    '\\bi cannot\\b',
    "\\bi can'?t\\b",
    '\\bsorry\\b',
    '\\bdisclaimer\\b',
    '\\bconclusion\\b',
    '\\bverdict\\b',
    '\\bbased on\\b',
    '\\bin my view\\b',
    '\\bhappy to help\\b',
    // Trailing colon cannot carry a word boundary, so it stands on its own.
    'note\\s*:',
    'disclaimer\\s*:',
  ].join('|'),
  'i',
);

/**
 * Reduce a model reply to the ingredients line alone.
 *
 * A real ingredients list is comma-dense, so a line with commentary wording and
 * few commas is the model editorialising and is dropped.
 */
export function sanitiseTranscription(raw: string): string {
  const withoutFences = raw.replace(/```[a-z]*\n?/gi, '').trim();
  const kept = withoutFences
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      const commas = (line.match(/,/g) ?? []).length;
      if (commas >= 2) return true;
      return !COMMENTARY.test(line);
    });
  return kept.join(' ').replace(/\s+/g, ' ').trim();
}

export function looksUnreadable(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  if (UNREADABLE.test(trimmed)) return true;
  if (CANNOT_READ.test(trimmed)) return true;
  return sanitiseTranscription(trimmed).length < 8;
}

export type VisionRequest = { url: string; headers: Record<string, string>; body: string };

/** Build the OpenAI-compatible vision request. The key is added by the caller. */
export function buildVisionRequest(
  provider: AIProvider,
  model: string,
  base64Jpeg: string,
): VisionRequest {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (provider.id === 'openrouter') {
    headers['HTTP-Referer'] = 'https://adl.app';
    headers['X-Title'] = 'Adl';
  }
  return {
    url: provider.endpoint,
    headers,
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: TRANSCRIBE_PROMPT },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Jpeg}`, detail: 'high' },
            },
          ],
        },
      ],
    }),
  };
}

export type OcrResult =
  | { status: 'ok'; text: string }
  | { status: 'unreadable' }
  | { status: 'no-vision-model' }
  | { status: 'error'; message: string };

function statusMessage(status: number): string {
  if (status === 401 || status === 403) return 'Your API key was rejected. Check it in AI settings.';
  if (status === 429) return 'Rate limit reached. Wait a moment and try again.';
  if (status >= 500) return 'The AI service is having trouble right now.';
  return `Request failed (${status}).`;
}

/** Pull the assistant text out of an OpenAI-compatible reply. */
export function extractContent(json: unknown): string {
  const choice = (json as { choices?: { message?: { content?: unknown } }[] })?.choices?.[0];
  const content = choice?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === 'object' && part && 'text' in part ? String((part as { text: unknown }).text) : ''))
      .join(' ');
  }
  return '';
}

export async function transcribeLabel(opts: {
  providerId: string;
  model?: string;
  key: string;
  base64Jpeg: string;
  signal?: AbortSignal;
}): Promise<OcrResult> {
  const provider = providerById(opts.providerId);
  const model = visionModelFor(provider.id, opts.model);
  if (!model) return { status: 'no-vision-model' };

  const req = buildVisionRequest(provider, model, opts.base64Jpeg);
  try {
    const res = await fetch(req.url, {
      method: 'POST',
      headers: { ...req.headers, Authorization: `Bearer ${opts.key}` },
      body: req.body,
      signal: opts.signal,
    });
    if (!res.ok) return { status: 'error', message: statusMessage(res.status) };

    const raw = extractContent(await res.json());
    if (looksUnreadable(raw)) return { status: 'unreadable' };
    return { status: 'ok', text: sanitiseTranscription(raw) };
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') return { status: 'error', message: 'Cancelled.' };
    return { status: 'error', message: "Couldn't reach the AI service. Check your connection." };
  }
}
