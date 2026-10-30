/**
 * Template splitting tests. Word order moves between languages, so a sentence
 * with inline links has to survive its placeholders being anywhere.
 */
import { splitTemplate } from '../lib/template';

const SLOTS = ['terms', 'privacy'];

describe('splitting a template', () => {
  it('separates text from slots', () => {
    expect(splitTemplate('Agree to {terms} and {privacy}.', SLOTS)).toEqual([
      { kind: 'text', value: 'Agree to ' },
      { kind: 'slot', name: 'terms' },
      { kind: 'text', value: ' and ' },
      { kind: 'slot', name: 'privacy' },
      { kind: 'text', value: '.' },
    ]);
  });

  it('handles a slot at the very start and end', () => {
    expect(splitTemplate('{terms} and {privacy}', SLOTS)).toEqual([
      { kind: 'slot', name: 'terms' },
      { kind: 'text', value: ' and ' },
      { kind: 'slot', name: 'privacy' },
    ]);
  });

  it('survives the slots being reordered by a translation', () => {
    const parts = splitTemplate('{privacy} و {terms} على توافق', SLOTS);
    expect(parts.filter((p) => p.kind === 'slot').map((p) => (p as { name: string }).name)).toEqual([
      'privacy',
      'terms',
    ]);
  });

  it('keeps an unknown placeholder as literal text', () => {
    expect(splitTemplate('Hello {name}, see {terms}.', SLOTS)).toEqual([
      { kind: 'text', value: 'Hello {name}, see ' },
      { kind: 'slot', name: 'terms' },
      { kind: 'text', value: '.' },
    ]);
  });

  it('returns plain text when there are no slots', () => {
    expect(splitTemplate('Nothing to replace.', SLOTS)).toEqual([
      { kind: 'text', value: 'Nothing to replace.' },
    ]);
  });

  it('handles an empty template', () => {
    expect(splitTemplate('', SLOTS)).toEqual([]);
  });

  it('never loses any of the literal text', () => {
    const template = 'Agree to {terms} and {privacy}, please.';
    const rebuilt = splitTemplate(template, SLOTS)
      .map((p) => (p.kind === 'text' ? p.value : `{${p.name}}`))
      .join('');
    expect(rebuilt).toBe(template);
  });

  it('is repeatable — the regex does not carry state between calls', () => {
    const first = splitTemplate('a {terms} b', SLOTS);
    const second = splitTemplate('a {terms} b', SLOTS);
    expect(second).toEqual(first);
  });
});
