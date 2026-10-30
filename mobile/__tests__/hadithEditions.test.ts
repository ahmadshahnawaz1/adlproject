/**
 * Tests for lib/hadithEditions — the pure CDN parse / grade-map / merge layer.
 */
import {
  HADITH_CDN_BASE,
  editionUrl,
  parseHadithEdition,
  gradeRulingFromText,
  gradeFromRaw,
  mergeEditions,
} from '../lib/hadithEditions';

describe('editionUrl', () => {
  it('builds a jsDelivr URL for a slug', () => {
    expect(editionUrl('eng-bukhari')).toBe(`${HADITH_CDN_BASE}/eng-bukhari.min.json`);
  });
});

describe('parseHadithEdition', () => {
  const sample = {
    metadata: { name: 'Sahih al-Bukhari' },
    hadiths: [
      { hadithnumber: 1, arabicnumber: 1, text: 'Actions are by intentions', grades: [{ name: 'al-Bukhari', grade: 'Sahih' }], reference: { book: 1, hadith: 1 } },
      { hadithnumber: 2, text: 'Another narration', grades: [] },
      { hadithnumber: 3 }, // dropped: no text
    ],
  };

  it('extracts usable narrations and drops malformed ones', () => {
    const rows = parseHadithEdition(sample);
    expect(rows).toHaveLength(2);
    expect(rows[0].number).toBe(1);
    expect(rows[0].grades[0].grade).toBe('Sahih');
  });

  it('throws on empty or malformed payloads', () => {
    expect(() => parseHadithEdition(null)).toThrow();
    expect(() => parseHadithEdition({})).toThrow();
    expect(() => parseHadithEdition({ hadiths: [] })).toThrow();
    expect(() => parseHadithEdition({ hadiths: [{ hadithnumber: 1 }] })).toThrow();
  });
});

describe('gradeRulingFromText', () => {
  it('maps common gradings', () => {
    expect(gradeRulingFromText('Sahih', 'daif')).toBe('sahih');
    expect(gradeRulingFromText('Hasan', 'daif')).toBe('hasan');
    expect(gradeRulingFromText("Da'if", 'sahih')).toBe('daif');
    expect(gradeRulingFromText('Weak', 'sahih')).toBe('daif');
    expect(gradeRulingFromText('Fabricated', 'sahih')).toBe('mawdu');
    expect(gradeRulingFromText('صحيح', 'daif')).toBe('sahih');
  });

  it('uses the fallback for unrecognised text', () => {
    expect(gradeRulingFromText('', 'sahih')).toBe('sahih');
    expect(gradeRulingFromText('unknown', 'daif')).toBe('daif');
  });
});

describe('gradeFromRaw', () => {
  it('takes the first grader and maps the ruling', () => {
    const g = gradeFromRaw([{ name: 'al-Albani', grade: 'Hasan' }], 'daif');
    expect(g.ruling).toBe('hasan');
    expect(g.grader).toBe('al-Albani');
  });

  it('falls back when there are no gradings', () => {
    expect(gradeFromRaw([], 'sahih').ruling).toBe('sahih');
  });
});

describe('mergeEditions', () => {
  it('joins Arabic + English by number into Hadith', () => {
    const arabic = [{ number: 1, text: 'إنما الأعمال بالنيات', grades: [{ name: 'al-Bukhari', grade: 'Sahih' }] }];
    const english = [{ number: 1, text: 'Actions are by intentions', grades: [] }];
    const merged = mergeEditions('bukhari', 'sahih', arabic, english);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe('bukhari-1');
    expect(merged[0].arabic).toContain('الأعمال');
    expect(merged[0].translation).toBe('Actions are by intentions');
    expect(merged[0].grade.ruling).toBe('sahih');
  });

  it('applies the fallback ruling when a narration is ungraded', () => {
    const merged = mergeEditions('muslim', 'sahih', [{ number: 5, text: 'x', grades: [] }], []);
    expect(merged[0].grade.ruling).toBe('sahih');
    expect(merged[0].translation).toBe('');
  });
});
