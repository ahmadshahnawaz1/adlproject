/**
 * Jumuʿah and Eid timing tests. Dates are constructed explicitly so a change
 * in the machine's locale or timezone cannot quietly move a Friday.
 */
import {
  DHU_AL_HIJJAH,
  FRIDAY,
  SHAWWAL,
  daysUntilJumuah,
  isJumuah,
  isKahfWindow,
  kahfWindow,
  nextEid,
  nextJumuah,
  takbirActive,
  upcomingEids,
} from '../lib/jumuah';
import { toHijri } from '../lib/hijriCalendar';
import {
  EID_RULING_OPINIONS,
  EID_SUNAN,
  EID_TAKBIR_OPINIONS,
  JUMUAH_DALEEL,
  JUMUAH_SUNAN,
  KHUTBAH_ADAB,
  TAKBIR_TEXT,
} from '../content/jumuah';

/** Local-time date, so getDay() matches the calendar the user sees. */
const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h, 0, 0, 0);

describe('finding Jumuʿah', () => {
  it('recognises a Friday', () => {
    expect(isJumuah(at(2026, 9, 4))).toBe(true); // 4 Sep 2026 is a Friday
    expect(isJumuah(at(2026, 9, 3))).toBe(false);
  });

  it('returns today when today is Friday', () => {
    const friday = at(2026, 9, 4);
    expect(nextJumuah(friday).getDate()).toBe(4);
    expect(daysUntilJumuah(friday)).toBe(0);
  });

  it('walks forward to the coming Friday', () => {
    expect(nextJumuah(at(2026, 9, 5)).getDate()).toBe(11); // Saturday → next Friday
    expect(daysUntilJumuah(at(2026, 9, 5))).toBe(6);
    expect(daysUntilJumuah(at(2026, 9, 3))).toBe(1); // Thursday
  });

  it('always lands on a Friday, from any day of the week', () => {
    for (let i = 0; i < 21; i += 1) {
      const d = at(2026, 9, 1 + i);
      expect(nextJumuah(d).getDay()).toBe(FRIDAY);
      expect(daysUntilJumuah(d)).toBeGreaterThanOrEqual(0);
      expect(daysUntilJumuah(d)).toBeLessThanOrEqual(6);
    }
  });

  it('normalises the returned Friday to the start of the day', () => {
    const d = nextJumuah(at(2026, 9, 2, 23));
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
  });
});

describe('the window for Sūrat al-Kahf', () => {
  it('opens on Thursday evening', () => {
    expect(isKahfWindow(at(2026, 9, 3, 17))).toBe(false);
    expect(isKahfWindow(at(2026, 9, 3, 19))).toBe(true);
  });

  it('stays open through Friday until Maghrib', () => {
    expect(isKahfWindow(at(2026, 9, 4, 6))).toBe(true);
    expect(isKahfWindow(at(2026, 9, 4, 14))).toBe(true);
    expect(isKahfWindow(at(2026, 9, 4, 19))).toBe(false);
  });

  it('is closed the rest of the week', () => {
    for (const day of [5, 6, 7, 8, 9]) {
      expect(isKahfWindow(at(2026, 9, day, 12))).toBe(false);
    }
  });

  it('reports the evening it opens as the day before the Friday', () => {
    const w = kahfWindow(at(2026, 9, 1));
    expect(w.closes.getDay()).toBe(FRIDAY);
    expect(w.opensEvening.getDate()).toBe(w.closes.getDate() - 1);
  });

  it('honours a different Maghrib hour', () => {
    expect(isKahfWindow(at(2026, 9, 3, 17), 16)).toBe(true);
    expect(isKahfWindow(at(2026, 9, 4, 17), 16)).toBe(false);
  });
});

describe('the two Eids', () => {
  it('finds both, nearest first', () => {
    const eids = upcomingEids(at(2026, 1, 15));
    expect(eids).toHaveLength(2);
    expect(eids[0].daysAway).toBeLessThanOrEqual(eids[1].daysAway);
  });

  it('lands Eid al-Fiṭr on the first of Shawwāl', () => {
    const fitr = upcomingEids(at(2026, 1, 15)).find((e) => e.kind === 'fitr')!;
    const h = toHijri(fitr.date);
    expect(h.month).toBe(SHAWWAL);
    expect(h.day).toBe(1);
  });

  it('lands Eid al-Aḍḥā on the tenth of Dhū al-Ḥijjah', () => {
    const adha = upcomingEids(at(2026, 1, 15)).find((e) => e.kind === 'adha')!;
    const h = toHijri(adha.date);
    expect(h.month).toBe(DHU_AL_HIJJAH);
    expect(h.day).toBe(10);
  });

  it('opens the Eid night on the preceding evening', () => {
    const eid = nextEid(at(2026, 1, 15))!;
    expect(eid.startsEvening.getTime()).toBeLessThan(eid.date.getTime());
    expect(Math.round((eid.date.getTime() - eid.startsEvening.getTime()) / 86_400_000)).toBe(1);
  });

  it('never looks backwards', () => {
    for (const month of [1, 4, 7, 10]) {
      for (const e of upcomingEids(at(2026, month, 10))) {
        expect(e.daysAway).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('carries a label and Arabic name for each', () => {
    for (const e of upcomingEids(at(2026, 1, 15))) {
      expect(e.label.length).toBeGreaterThan(0);
      expect(e.arabic.length).toBeGreaterThan(0);
    }
  });
});

describe('the takbīr window', () => {
  it('is active on the day of each Eid', () => {
    const fitr = upcomingEids(at(2026, 1, 15)).find((e) => e.kind === 'fitr')!;
    expect(takbirActive(fitr.date)).toBe('fitr');
    const adha = upcomingEids(at(2026, 1, 15)).find((e) => e.kind === 'adha')!;
    expect(takbirActive(adha.date)).toBe('adha');
  });

  it('runs through the days of Tashrīq after al-Aḍḥā', () => {
    const adha = upcomingEids(at(2026, 1, 15)).find((e) => e.kind === 'adha')!;
    const third = new Date(adha.date);
    third.setDate(third.getDate() + 3); // 13 Dhū al-Ḥijjah
    expect(takbirActive(third)).toBe('adha');
  });

  it('is silent in an ordinary month', () => {
    expect(takbirActive(new Date(2026, 0, 15))).toBeNull();
  });
});

describe('content integrity', () => {
  it('gives every sunnah a title and a detail', () => {
    for (const s of [...JUMUAH_SUNAN, ...KHUTBAH_ADAB, ...EID_SUNAN.fitr, ...EID_SUNAN.adha]) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.detail.length).toBeGreaterThan(0);
    }
  });

  it('cites a source for every proof text', () => {
    for (const d of JUMUAH_DALEEL) {
      expect(d.source.length).toBeGreaterThan(0);
      expect(d.meaning.length).toBeGreaterThan(0);
    }
  });

  it('keeps sunnah ids unique within each list', () => {
    const ids = JUMUAH_SUNAN.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('shows both positions on the number of takbīrs rather than choosing', () => {
    expect(EID_TAKBIR_OPINIONS.length).toBeGreaterThanOrEqual(2);
    const held = EID_TAKBIR_OPINIONS.map((o) => o.held).join(' ');
    expect(held).toMatch(/Ḥanafī/);
    expect(held).toMatch(/Shāfiʿī/);
  });

  it('shows all three rulings on praying Eid', () => {
    expect(EID_RULING_OPINIONS).toHaveLength(3);
    for (const o of EID_RULING_OPINIONS) expect(o.held.length).toBeGreaterThan(0);
  });

  it('carries the takbīr in Arabic, transliteration and meaning', () => {
    expect(TAKBIR_TEXT.arabic).toMatch(/ٱللَّهُ أَكْبَرُ/);
    expect(TAKBIR_TEXT.transliteration).toMatch(/Allāhu akbar/);
    expect(TAKBIR_TEXT.meaning.length).toBeGreaterThan(0);
  });
});
