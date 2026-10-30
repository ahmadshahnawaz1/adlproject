import {
  stripTafsirHtml,
  tafsirUrl,
  TAFSIR_CDN_BASE,
} from '../lib/quranTafsir';
import { TAFSIRS, DEFAULT_TAFSIR_ID, getTafsir } from '../content/quran';

describe('tafsir catalog', () => {
  test('ships a curated, non-empty list', () => {
    expect(TAFSIRS.length).toBeGreaterThanOrEqual(12);
  });

  test('every tafsīr has id, name, author, and language', () => {
    for (const t of TAFSIRS) {
      expect(t.id).toMatch(/\S/);
      expect(t.name).toMatch(/\S/);
      expect(t.author).toMatch(/\S/);
      expect(t.language).toMatch(/\S/);
    }
  });

  test('tafsīr ids are unique', () => {
    const ids = new Set(TAFSIRS.map((t) => t.id));
    expect(ids.size).toBe(TAFSIRS.length);
  });

  test('the default tafsīr id is present in the catalog', () => {
    expect(TAFSIRS.some((t) => t.id === DEFAULT_TAFSIR_ID)).toBe(true);
  });

  test('getTafsir resolves a known id and rejects an unknown one', () => {
    expect(getTafsir(DEFAULT_TAFSIR_ID)?.id).toBe(DEFAULT_TAFSIR_ID);
    expect(getTafsir('not-real')).toBeUndefined();
  });
});

describe('tafsirUrl', () => {
  test('builds a per-ayah jsDelivr url', () => {
    expect(tafsirUrl('en-tafisr-ibn-kathir', 2, 255)).toBe(
      `${TAFSIR_CDN_BASE}/en-tafisr-ibn-kathir/2/255.json`,
    );
  });
});

describe('stripTafsirHtml', () => {
  test('strips tags and decodes common entities', () => {
    expect(stripTafsirHtml('<p>In the name of <b>Allah</b> &amp; mercy</p>')).toBe(
      'In the name of Allah & mercy',
    );
  });

  test('turns block tags and <br> into paragraph/line breaks', () => {
    const out = stripTafsirHtml('<p>First.</p><p>Second.</p>');
    expect(out).toBe('First.\n\nSecond.');
    expect(stripTafsirHtml('Line one<br>Line two')).toBe('Line one\nLine two');
  });

  test('collapses runaway whitespace and trims', () => {
    expect(stripTafsirHtml('  a\t\t b \n\n\n c  ')).toBe('a b\n\nc');
  });

  test('decodes numeric entities', () => {
    expect(stripTafsirHtml('A&#160;B')).toBe('A B');
  });

  test('returns empty string for empty input', () => {
    expect(stripTafsirHtml('')).toBe('');
  });
});
