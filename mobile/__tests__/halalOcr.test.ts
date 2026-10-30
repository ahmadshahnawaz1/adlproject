/**
 * Vision OCR tests.
 *
 * The sanitiser is a safety boundary: the model is asked only to transcribe,
 * but nothing stops it from volunteering a ruling. Anything that looks like a
 * judgement must be stripped before it reaches the user, and no verdict may
 * ever be taken from the model.
 */
import {
  TRANSCRIBE_PROMPT,
  VISION_MODELS,
  buildVisionRequest,
  extractContent,
  looksUnreadable,
  providerSupportsVision,
  sanitiseTranscription,
  visionModelFor,
} from '../lib/halal/ocr';
import { PROVIDERS, providerById } from '../lib/ai/providers';
import { assessIngredients } from '../lib/halal/assess';

describe('choosing a vision model', () => {
  it('keeps the user’s own model when it can see', () => {
    expect(visionModelFor('openai', 'gpt-4o')).toBe('gpt-4o');
  });

  it('falls back to one that can when theirs cannot', () => {
    expect(visionModelFor('openai', 'text-only-model')).toBe('gpt-4o-mini');
  });

  it('returns null for a provider with no vision model', () => {
    expect(visionModelFor('groq', 'llama-3.3-70b-versatile')).toBeNull();
    expect(providerSupportsVision('groq')).toBe(false);
    expect(providerSupportsVision('openai')).toBe(true);
  });

  it('lists only models the provider actually offers', () => {
    for (const provider of PROVIDERS) {
      const offered = new Set(provider.models.map((m) => m.id));
      for (const id of VISION_MODELS[provider.id] ?? []) {
        expect(offered.has(id)).toBe(true);
      }
    }
  });
});

describe('the request sent to the model', () => {
  const req = buildVisionRequest(providerById('openai'), 'gpt-4o-mini', 'BASE64DATA');
  const body = JSON.parse(req.body);

  it('posts to the provider’s endpoint', () => {
    expect(req.url).toBe(providerById('openai').endpoint);
  });

  it('never carries the API key in the built request', () => {
    expect(JSON.stringify(req)).not.toMatch(/authorization|bearer/i);
  });

  it('sends the image as a data URL', () => {
    expect(body.messages[0].content[1].image_url.url).toBe('data:image/jpeg;base64,BASE64DATA');
  });

  it('asks for transcription and forbids commentary', () => {
    expect(body.messages[0].content[0].text).toBe(TRANSCRIBE_PROMPT);
    expect(TRANSCRIBE_PROMPT).toMatch(/do not comment/i);
    expect(TRANSCRIBE_PROMPT).toMatch(/suitable for anyone/i);
  });

  it('uses zero temperature so it transcribes rather than improvises', () => {
    expect(body.temperature).toBe(0);
  });

  it('adds attribution headers for OpenRouter only', () => {
    expect(buildVisionRequest(providerById('openrouter'), 'x', 'y').headers['X-Title']).toBe('Adl');
    expect(buildVisionRequest(providerById('openai'), 'x', 'y').headers['X-Title']).toBeUndefined();
  });
});

describe('stripping the model’s commentary', () => {
  it('keeps a plain ingredients line', () => {
    const text = 'Sugar, cocoa butter, milk powder, emulsifier (E322), vanilla';
    expect(sanitiseTranscription(text)).toBe(text);
  });

  it('removes a volunteered halal verdict', () => {
    const raw = 'Sugar, gelatine, citric acid\nThis product appears to be halal.';
    const out = sanitiseTranscription(raw);
    expect(out).toMatch(/gelatine/);
    expect(out).not.toMatch(/halal/i);
  });

  it('removes a leading apology or preamble', () => {
    const raw = "I'm happy to help!\nSugar, salt, wheat flour, yeast";
    expect(sanitiseTranscription(raw)).toBe('Sugar, salt, wheat flour, yeast');
  });

  it('removes a trailing note or disclaimer', () => {
    const raw = 'Water, sugar, E471\nNote: check with a scholar.';
    expect(sanitiseTranscription(raw)).not.toMatch(/scholar/i);
  });

  it('strips markdown code fences', () => {
    expect(sanitiseTranscription('```\nSugar, salt\n```')).toBe('Sugar, salt');
  });

  it('keeps a comma-dense line even when it contains a flagged word', () => {
    // "halal beef gelatin" can genuinely be printed on a packet.
    const raw = 'Sugar, halal beef gelatin, citric acid, colour (E120)';
    expect(sanitiseTranscription(raw)).toMatch(/halal beef gelatin/);
  });

  it('collapses stray whitespace', () => {
    expect(sanitiseTranscription('  Sugar,   salt  \n\n  water, yeast ')).toBe(
      'Sugar, salt water, yeast',
    );
  });
});

describe('detecting an unreadable label', () => {
  it('recognises the agreed sentinel', () => {
    expect(looksUnreadable('UNREADABLE')).toBe(true);
    expect(looksUnreadable('  unreadable  ')).toBe(true);
  });

  it('recognises a refusal in words', () => {
    expect(looksUnreadable("I can't read the ingredients in this photo.")).toBe(true);
    expect(looksUnreadable('The text is not legible.')).toBe(true);
    expect(looksUnreadable('No visible ingredients list.')).toBe(true);
  });

  it('treats an empty or near-empty reply as unreadable', () => {
    expect(looksUnreadable('')).toBe(true);
    expect(looksUnreadable('   ')).toBe(true);
    expect(looksUnreadable('ok')).toBe(true);
  });

  it('accepts a genuine transcription', () => {
    expect(looksUnreadable('Sugar, salt, wheat flour, yeast, E471')).toBe(false);
  });
});

describe('reading the provider reply', () => {
  it('handles a plain string content', () => {
    expect(extractContent({ choices: [{ message: { content: 'Sugar, salt' } }] })).toBe('Sugar, salt');
  });

  it('handles content returned as parts', () => {
    const json = { choices: [{ message: { content: [{ type: 'text', text: 'Sugar, salt' }] } }] };
    expect(extractContent(json)).toBe('Sugar, salt');
  });

  it('returns empty for a malformed reply rather than throwing', () => {
    expect(extractContent({})).toBe('');
    expect(extractContent(null)).toBe('');
    expect(extractContent({ choices: [] })).toBe('');
  });
});

describe('the model never decides anything', () => {
  it('runs the offline engine on the transcription, not the model’s opinion', () => {
    const raw = 'Sugar, gelatine, E120\nIn my view this is perfectly fine to eat.';
    const assessment = assessIngredients(sanitiseTranscription(raw));
    expect(assessment.verdict).toBe('check');
    expect(assessment.flags.map((f) => f.additive.code).sort()).toEqual(['E120', 'E441']);
  });

  it('still flags a prohibited ingredient the model tried to excuse', () => {
    const raw = 'Pork gelatin, sugar\nThis should be acceptable for most people.';
    expect(assessIngredients(sanitiseTranscription(raw)).verdict).toBe('prohibited');
  });
});
