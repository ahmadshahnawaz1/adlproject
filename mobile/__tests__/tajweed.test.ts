/**
 * Tests for the tajwīd analyser (F25).
 *
 * Every input is assembled from named constants rather than pasted Arabic, so
 * there is no doubt about which mark sits on which letter — an invisible
 * difference in diacritics would otherwise make a test lie.
 */
import { analyze, ruleCounts, segment, tokenize } from '../lib/tajweed';
import { TAJWEED_RULES, TAJWEED_DISCLAIMER, tajweedRule } from '../content/tajweed';

// Marks
const FATHA = '\u064E';
const DAMMA = '\u064F';
const KASRA = '\u0650';
const SHADDA = '\u0651';
const SUKUN = '\u0652';
const TANWEEN_DAMM = '\u064C';

// Letters
const ALEF = '\u0627';
const BA = '\u0628';
const TA = '\u062A';
const JEEM = '\u062C';
const DAL = '\u062F';
const RA = '\u0631';
const AIN = '\u0639';
const QAF = '\u0642';
const LAM = '\u0644';
const MEEM = '\u0645';
const NOON = '\u0646';
const HA = '\u0647';
const WAW = '\u0648';
const YA = '\u064A';
const HAMZA = '\u0621';
const KHA = '\u062E';
const TAH = '\u0637';

const SP = ' ';

/** Only the rules, in order, for a piece of text. */
const rules = (text: string) => analyze(text).map((s) => s.rule);

describe('content integrity', () => {
  it('gives every rule a colour, an Arabic name and a description', () => {
    expect(TAJWEED_RULES.length).toBeGreaterThanOrEqual(10);
    for (const r of TAJWEED_RULES) {
      expect(r.color).toMatch(/^#[0-9A-F]{6}$/i);
      expect(r.arabic).toMatch(/[\u0600-\u06FF]/);
      expect(r.description.length).toBeGreaterThan(20);
    }
  });

  it('uses unique rule ids and resolves them', () => {
    const ids = TAJWEED_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(tajweedRule('ghunnah')?.title).toBe('Ghunnah');
    expect(tajweedRule('nope' as never)).toBeUndefined();
  });

  it('is honest that colour is not a teacher', () => {
    expect(TAJWEED_DISCLAIMER).toMatch(/teacher/i);
  });
});

describe('tokenize', () => {
  it('binds each mark to the letter it sits on', () => {
    const units = tokenize(NOON + SHADDA + FATHA + BA);
    expect(units).toHaveLength(2);
    expect(units[0]).toMatchObject({ letter: NOON, marks: SHADDA + FATHA, start: 0 });
    expect(units[1]).toMatchObject({ letter: BA, marks: '' });
  });

  it('marks spaces as separators', () => {
    const units = tokenize(NOON + SP + BA);
    expect(units.map((u) => u.separator)).toEqual([false, true, false]);
  });

  it('keeps offsets that index back into the source', () => {
    const text = BA + FATHA + NOON;
    const units = tokenize(text);
    expect(text.slice(units[0].start, units[0].end)).toBe(BA + FATHA);
    expect(text.slice(units[1].start, units[1].end)).toBe(NOON);
  });

  it('handles empty input', () => {
    expect(tokenize('')).toEqual([]);
  });
});

describe('ghunnah', () => {
  it('marks a nūn carrying shaddah', () => {
    // إِنَّ
    expect(rules(ALEF + KASRA + NOON + SHADDA + FATHA)).toContain('ghunnah');
  });

  it('marks a mīm carrying shaddah', () => {
    // ثُمَّ (using tā for the first letter — only the mīm matters)
    expect(rules(TA + DAMMA + MEEM + SHADDA + FATHA)).toContain('ghunnah');
  });

  it('does not mark a nūn with an ordinary vowel', () => {
    expect(rules(NOON + FATHA + BA + FATHA)).not.toContain('ghunnah');
  });
});

describe('the silent nūn and tanwīn', () => {
  it('iqlāb — before bāʾ', () => {
    // مِنْ بَعْدُ
    const text = MEEM + KASRA + NOON + SUKUN + SP + BA + FATHA;
    expect(rules(text)[0]).toBe('iqlab');
  });

  it('iẓhār — before a throat letter', () => {
    // مِنْ عِلْمٍ
    const text = MEEM + KASRA + NOON + SUKUN + SP + AIN + KASRA;
    expect(rules(text)[0]).toBe('idhhar');
  });

  it('idghām with ghunnah — before yāʾ across a word', () => {
    // مَنْ يَعْمَلْ
    const text = MEEM + FATHA + NOON + SUKUN + SP + YA + FATHA;
    expect(rules(text)[0]).toBe('idgham-ghunnah');
  });

  it('idghām without ghunnah — before rāʾ', () => {
    // مِنْ رَبِّ
    const text = MEEM + KASRA + NOON + SUKUN + SP + RA + FATHA;
    expect(rules(text)[0]).toBe('idgham-no-ghunnah');
  });

  it('ikhfāʾ — before one of the remaining letters', () => {
    // مِنْ قَبْلُ
    const text = MEEM + KASRA + NOON + SUKUN + SP + QAF + FATHA;
    expect(rules(text)[0]).toBe('ikhfa');
  });

  it('iẓhār muṭlaq — a silent nūn before yāʾ inside one word', () => {
    // دُنْيَا — merging would erase the word, so it is pronounced clearly
    const text = DAL + DAMMA + NOON + SUKUN + YA + FATHA + ALEF;
    expect(rules(text)[0]).toBe('idhhar');
  });

  it('applies the same rules to tanwīn', () => {
    // ـٌ followed by bāʾ → iqlāb
    const iqlab = DAL + TANWEEN_DAMM + SP + BA + FATHA;
    expect(rules(iqlab)[0]).toBe('iqlab');

    // ـٌ followed by a throat letter → iẓhār
    const idhhar = DAL + TANWEEN_DAMM + SP + HAMZA + FATHA;
    expect(rules(idhhar)[0]).toBe('idhhar');
  });

  it('ignores a nūn with nothing after it', () => {
    expect(rules(MEEM + KASRA + NOON + SUKUN)).toEqual([]);
  });
});

describe('the silent mīm', () => {
  it('ikhfāʾ shafawī — before bāʾ', () => {
    // هُمْ بِـ
    const text = HA + DAMMA + MEEM + SUKUN + SP + BA + KASRA;
    expect(rules(text)[0]).toBe('ikhfa-shafawi');
  });

  it('idghām shafawī — before another mīm', () => {
    // هُمْ مِنْ
    const text = HA + DAMMA + MEEM + SUKUN + SP + MEEM + KASRA;
    expect(rules(text)[0]).toBe('idgham-shafawi');
  });

  it('leaves a silent mīm before other letters unmarked', () => {
    const text = HA + DAMMA + MEEM + SUKUN + SP + QAF + FATHA;
    expect(rules(text)).not.toContain('ikhfa-shafawi');
    expect(rules(text)).not.toContain('idgham-shafawi');
  });
});

describe('qalqalah', () => {
  it('marks a bouncing letter carrying sukūn', () => {
    // يَقْطَعُ — the qāf bounces
    const text = YA + FATHA + QAF + SUKUN + TAH + FATHA;
    expect(rules(text)).toContain('qalqalah');
  });

  it.each([QAF, TAH, BA, JEEM, DAL])('recognises %s', (letter) => {
    expect(rules(FATHA + letter + SUKUN + TA + FATHA)).toContain('qalqalah');
  });

  it('does not bounce a vowelled letter', () => {
    expect(rules(QAF + FATHA + LAM + FATHA)).not.toContain('qalqalah');
  });
});

describe('elongation', () => {
  it('natural madd — a bare alef after fatḥah', () => {
    // قَالَ
    expect(rules(QAF + FATHA + ALEF + LAM + FATHA)).toContain('madd-asli');
  });

  it('obligatory madd — an elongation letter before a hamzah in the same word', () => {
    // جَاءَ
    expect(rules(JEEM + FATHA + ALEF + HAMZA + FATHA)).toContain('madd-muttasil');
  });

  it('necessary madd — an elongation letter before a shaddah', () => {
    // ضَالِّـ pattern: alef then lām with shaddah
    expect(rules(DAL + FATHA + ALEF + LAM + SHADDA + KASRA)).toContain('madd-lazim');
  });

  it('stretches wāw only when silent after a ḍammah', () => {
    expect(rules(QAF + DAMMA + WAW + LAM + FATHA)).toContain('madd-asli');
    // With its own vowel the wāw is a consonant, not a stretch.
    expect(rules(QAF + FATHA + WAW + FATHA + LAM + FATHA)).not.toContain('madd-asli');
  });

  it('stretches yāʾ only when silent after a kasrah', () => {
    expect(rules(QAF + KASRA + YA + LAM + FATHA)).toContain('madd-asli');
  });
});

describe('segment', () => {
  it('always reproduces the original text exactly', () => {
    const samples = [
      ALEF + KASRA + NOON + SHADDA + FATHA,
      MEEM + KASRA + NOON + SUKUN + SP + QAF + FATHA + BA + SUKUN + LAM + DAMMA,
      QAF + FATHA + ALEF + LAM + FATHA,
      HA + DAMMA + MEEM + SUKUN + SP + BA + KASRA,
      '',
      'plain ascii',
    ];
    for (const text of samples) {
      expect(segment(text).map((s) => s.text).join('')).toBe(text);
    }
  });

  it('never emits an empty run', () => {
    const text = MEEM + KASRA + NOON + SUKUN + SP + BA + FATHA;
    expect(segment(text).every((s) => s.text.length > 0)).toBe(true);
  });

  it('produces plain runs where no rule applies', () => {
    const segs = segment(QAF + FATHA + LAM + FATHA);
    expect(segs.every((s) => s.rule === null)).toBe(true);
  });

  it('marks the coloured run with its rule', () => {
    const segs = segment(ALEF + KASRA + NOON + SHADDA + FATHA);
    expect(segs.some((s) => s.rule === 'ghunnah')).toBe(true);
  });
});

describe('spans', () => {
  it('never overlap and stay in order', () => {
    const text =
      MEEM + KASRA + NOON + SUKUN + SP + BA + FATHA + AIN + SUKUN + DAL + KASRA + SP + QAF + FATHA + ALEF + LAM + FATHA;
    const spans = analyze(text);
    for (let i = 1; i < spans.length; i++) {
      expect(spans[i].start).toBeGreaterThanOrEqual(spans[i - 1].end);
    }
  });

  it('stay within the bounds of the text', () => {
    const text = KHA + FATHA + NOON + SUKUN + SP + QAF + FATHA;
    for (const s of analyze(text)) {
      expect(s.start).toBeGreaterThanOrEqual(0);
      expect(s.end).toBeLessThanOrEqual(text.length);
      expect(s.end).toBeGreaterThan(s.start);
    }
  });

  it('finds nothing in empty or non-Arabic text', () => {
    expect(analyze('')).toEqual([]);
    expect(analyze('hello world')).toEqual([]);
  });
});

describe('ruleCounts', () => {
  it('tallies each rule found', () => {
    const text =
      ALEF + KASRA + NOON + SHADDA + FATHA + SP + TA + DAMMA + MEEM + SHADDA + FATHA;
    expect(ruleCounts(text).ghunnah).toBe(2);
  });

  it('is empty for text with no rules', () => {
    expect(ruleCounts(QAF + FATHA + LAM + FATHA)).toEqual({});
  });
});
