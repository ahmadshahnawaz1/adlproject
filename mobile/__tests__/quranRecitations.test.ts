import {
  RECITERS,
  DEFAULT_RECITER_ID,
  RECITATION_CDN_BASE,
  findReciter,
  reciterOrDefault,
  ayahAudioUrl,
  ayahAudioUrlByGlobal,
  surahAudioUrls,
  estimateSurahBytes,
} from '../lib/quranRecitations';
import { getSurah, globalAyahNumber } from '../lib/quran';

describe('reciter catalog integrity', () => {
  test('has a non-empty curated list', () => {
    expect(RECITERS.length).toBeGreaterThanOrEqual(5);
  });

  test('every reciter has a unique id and complete fields', () => {
    const ids = new Set<string>();
    for (const r of RECITERS) {
      expect(r.id).toMatch(/^ar\./);
      expect(r.name.length).toBeGreaterThan(0);
      expect(r.arabicName.length).toBeGreaterThan(0);
      expect([64, 128, 192]).toContain(r.bitrate);
      expect(r.style.length).toBeGreaterThan(0);
      expect(ids.has(r.id)).toBe(false);
      ids.add(r.id);
    }
  });

  test('the default reciter is in the catalog', () => {
    expect(findReciter(DEFAULT_RECITER_ID)).toBeDefined();
  });
});

describe('findReciter / reciterOrDefault', () => {
  test('findReciter returns undefined for an unknown id', () => {
    expect(findReciter('ar.nobody')).toBeUndefined();
  });

  test('reciterOrDefault falls back to the default', () => {
    expect(reciterOrDefault(null).id).toBe(DEFAULT_RECITER_ID);
    expect(reciterOrDefault('ar.nobody').id).toBe(DEFAULT_RECITER_ID);
    expect(reciterOrDefault('ar.husary').id).toBe('ar.husary');
  });
});

describe('ayahAudioUrlByGlobal', () => {
  test('builds a CDN URL with the reciter bitrate', () => {
    expect(ayahAudioUrlByGlobal('ar.alafasy', 1)).toBe(
      `${RECITATION_CDN_BASE}/128/ar.alafasy/1.mp3`,
    );
    expect(ayahAudioUrlByGlobal('ar.abdulbasitmurattal', 6236)).toBe(
      `${RECITATION_CDN_BASE}/64/ar.abdulbasitmurattal/6236.mp3`,
    );
  });

  test('rejects an unknown reciter or out-of-range index', () => {
    expect(ayahAudioUrlByGlobal('ar.nobody', 1)).toBe('');
    expect(ayahAudioUrlByGlobal('ar.alafasy', 0)).toBe('');
    expect(ayahAudioUrlByGlobal('ar.alafasy', 6237)).toBe('');
  });
});

describe('ayahAudioUrl', () => {
  test('maps surah:ayah through the global index', () => {
    expect(ayahAudioUrl('ar.alafasy', 1, 1)).toBe(
      `${RECITATION_CDN_BASE}/128/ar.alafasy/1.mp3`,
    );
    expect(ayahAudioUrl('ar.alafasy', 2, 1)).toBe(
      `${RECITATION_CDN_BASE}/128/ar.alafasy/8.mp3`,
    );
    expect(ayahAudioUrl('ar.alafasy', 114, 6)).toBe(
      `${RECITATION_CDN_BASE}/128/ar.alafasy/6236.mp3`,
    );
  });

  test('rejects an out-of-range ayah', () => {
    expect(ayahAudioUrl('ar.alafasy', 1, 8)).toBe('');
    expect(ayahAudioUrl('ar.alafasy', 115, 1)).toBe('');
  });
});

describe('surahAudioUrls', () => {
  test('returns one URL per ayah, in order', () => {
    const meta = getSurah(1)!;
    const urls = surahAudioUrls('ar.alafasy', 1, meta.ayahCount);
    expect(urls).toHaveLength(meta.ayahCount);
    expect(urls[0]).toBe(`${RECITATION_CDN_BASE}/128/ar.alafasy/1.mp3`);
    expect(urls[meta.ayahCount - 1]).toBe(
      `${RECITATION_CDN_BASE}/128/ar.alafasy/${globalAyahNumber(1, meta.ayahCount)}.mp3`,
    );
  });

  test('al-Baqarah produces 286 contiguous URLs', () => {
    const urls = surahAudioUrls('ar.husary', 2, 286);
    expect(urls).toHaveLength(286);
    expect(urls[0]).toBe(`${RECITATION_CDN_BASE}/128/ar.husary/8.mp3`);
    expect(urls[285]).toBe(`${RECITATION_CDN_BASE}/128/ar.husary/293.mp3`);
  });

  test('an unknown reciter yields an empty list', () => {
    expect(surahAudioUrls('ar.nobody', 1, 7)).toEqual([]);
  });
});

describe('estimateSurahBytes', () => {
  test('scales with ayah count and is zero for unknowns', () => {
    const small = estimateSurahBytes('ar.alafasy', 7);
    const large = estimateSurahBytes('ar.alafasy', 286);
    expect(small).toBeGreaterThan(0);
    expect(large).toBeGreaterThan(small);
    expect(estimateSurahBytes('ar.nobody', 7)).toBe(0);
    expect(estimateSurahBytes('ar.alafasy', 0)).toBe(0);
  });
});
