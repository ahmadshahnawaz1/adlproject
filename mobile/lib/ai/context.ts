/**
 * lib/ai/context — assembles the message array sent to the model (F19).
 *
 * It layers the Islamic system prompt, a grounding block built from the
 * retrieved corpus snippets (with their citations), the recent conversation
 * history (trimmed to a budget), and the new user turn. Pure & tested.
 */
import { buildSystemPrompt } from '../../content/ai/systemPrompt';
import type { AIMessage } from './providers';
import type { RetrievedDoc } from './retrieval';

/** Render the retrieved snippets into a grounding block for the system prompt. */
export function formatGrounding(docs: RetrievedDoc[]): string {
  if (docs.length === 0) return '';
  const lines = docs.map((d, i) => {
    const cite = d.citation ? ` [[${d.citation}]]` : '';
    return `[${i + 1}] (${d.source})${cite} ${d.title} — ${d.text}`;
  });
  return [
    'RETRIEVED CONTEXT — drawn from this app’s own evidence-cited sources.',
    'Prefer these, and cite them using the [[…]] format when you use them:',
    ...lines,
  ].join('\n');
}

/**
 * Build the full message list. History should be the prior turns (without the
 * new user message); it is trimmed to `maxHistory` most-recent messages.
 */
export function buildMessages(opts: {
  history: AIMessage[];
  userMessage: string;
  retrieved?: RetrievedDoc[];
  localeLabel?: string;
  maxHistory?: number;
}): AIMessage[] {
  const { history, userMessage, retrieved = [], localeLabel, maxHistory = 12 } = opts;

  let system = buildSystemPrompt(localeLabel);
  const grounding = formatGrounding(retrieved);
  if (grounding) system += `\n\n${grounding}`;

  const trimmedHistory = history.slice(-maxHistory);

  return [
    { role: 'system', content: system },
    ...trimmedHistory,
    { role: 'user', content: userMessage },
  ];
}
