/**
 * Tajwīd analyser against the real bundled muṣḥaf (F25).
 *
 * The synthetic suite proves each rule in isolation; this one proves the
 * analyser survives genuine Uthmani orthography — the small-circle sukūn, the
 * superscript alef, hamzah written as a mark on a seat, and the silent alef
 * after tanwīn fatḥ. Every one of those broke a first attempt.
 */
import { analyze, ruleCounts, segment } from '../lib/tajweed';
import { SURAH_FILES } from '../content/quran';

const ayahsOf = (surah: number) => SURAH_FILES[surah]().ayahs;

describe('the cardinal invariant', () => {
  it('never alters the text of any āyah it colours', () => {
    // A broad sweep: the opening, the closing short surahs, and a long one.
    for (const surah of [1, 2, 36, 55, 112, 113, 114]) {
      for (const a of ayahsOf(surah)) {
        expect(segment(a.arabic).map((s) => s.text).join('')).toBe(a.arabic);
      }
    }
  });

  it('produces spans that are ordered, non-overlapping and in bounds', () => {
    for (const surah of [1, 112, 113, 114]) {
      for (const a of ayahsOf(surah)) {
        const spans = analyze(a.arabic);
        for (let i = 0; i < spans.length; i++) {
          expect(spans[i].end).toBeGreaterThan(spans[i].start);
          expect(spans[i].end).toBeLessThanOrEqual(a.arabic.length);
          if (i > 0) expect(spans[i].start).toBeGreaterThanOrEqual(spans[i - 1].end);
        }
      }
    }
  });
});

describe('known readings', () => {
  it('finds both elongations in the basmalah', () => {
    // بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ — the superscript alef of ٱلرَّحۡمَٰن
    // and the yāʾ of ٱلرَّحِيم.
    expect(ruleCounts(ayahsOf(1)[0].arabic)['madd-asli']).toBe(2);
  });

  it('marks the ghunnah in ٱلنَّاس', () => {
    expect(ruleCounts(ayahsOf(114)[0].arabic).ghunnah).toBe(1);
  });

  it('bounces the dāl of لَمۡ يَلِدۡ وَلَمۡ يُولَدۡ', () => {
    expect(ruleCounts(ayahsOf(112)[2].arabic).qalqalah).toBe(2);
  });

  it('merges the nūn of يَكُن لَّهُۥ without ghunnah', () => {
    expect(ruleCounts(ayahsOf(112)[3].arabic)['idgham-no-ghunnah']).toBe(1);
  });

  it('reads كُفُوًا أَحَدٌ as iẓhār — hamzah written as a mark on its seat', () => {
    const counts = ruleCounts(ayahsOf(112)[3].arabic);
    expect(counts.idhhar).toBe(1);
    // It must not be mistaken for ikhfāʾ by stopping at the silent tanwīn alef.
    expect(counts.ikhfa).toBeUndefined();
  });

  it('does not mistake a hamzah seat for an elongation', () => {
    // أَحَدٌ is alef + combining hamzah; that alef is a consonant.
    const spans = analyze(ayahsOf(112)[3].arabic);
    expect(spans.filter((s) => s.rule === 'madd-asli')).toHaveLength(0);
  });
});

describe('coverage across a long surah', () => {
  it('finds a healthy spread of rules in al-Baqarah', () => {
    const totals: Record<string, number> = {};
    for (const a of ayahsOf(2).slice(0, 60)) {
      for (const [rule, n] of Object.entries(ruleCounts(a.arabic))) {
        totals[rule] = (totals[rule] ?? 0) + (n ?? 0);
      }
    }
    // The common rules must all actually appear in ordinary text.
    for (const rule of ['ghunnah', 'ikhfa', 'qalqalah', 'madd-asli', 'idhhar']) {
      expect(totals[rule] ?? 0).toBeGreaterThan(0);
    }
  });
});
