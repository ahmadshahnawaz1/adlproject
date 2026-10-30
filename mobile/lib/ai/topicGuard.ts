/**
 * lib/ai/topicGuard — a fast, on-device pre-filter for ADL AI (F19).
 *
 * The system prompt is the real guardrail; this cheap check just catches
 * obviously off-topic requests (coding, sports, entertainment…) before spending
 * a token, and lets everything else through — the model then applies the full
 * Islamic-only policy. Deliberately lenient: when in doubt, allow. Pure & tested.
 */
import { normalizeText } from '../duaSearch';

/** Words that mark a request as clearly within Islamic scope. */
const ISLAMIC_TERMS = [
  'allah', 'god', 'islam', 'muslim', 'quran', 'koran', 'surah', 'sura', 'ayah', 'ayat', 'verse',
  'hadith', 'sunnah', 'prophet', 'muhammad', 'rasul', 'messenger', 'nabi', 'sahaba', 'companion',
  'salah', 'salat', 'namaz', 'prayer', 'pray', 'wudu', 'wudhu', 'ablution', 'ghusl', 'tayammum',
  'zakat', 'zakah', 'sadaqah', 'charity', 'fast', 'fasting', 'sawm', 'ramadan', 'ramadhan', 'iftar', 'suhoor',
  'hajj', 'umrah', 'kaaba', 'makkah', 'mecca', 'madinah', 'medina', 'qibla',
  'dua', 'duaa', 'supplication', 'dhikr', 'zikr', 'tasbih', 'istighfar', 'adhkar', 'adhan', 'azan',
  'halal', 'haram', 'makruh', 'sunnah', 'fard', 'wajib', 'fiqh', 'madhhab', 'madhab', 'hanafi',
  'shafii', 'maliki', 'hanbali', 'tafsir', 'tafseer', 'aqidah', 'aqeedah', 'iman', 'faith', 'tawhid',
  'shirk', 'kufr', 'jannah', 'paradise', 'jahannam', 'hellfire', 'akhirah', 'hereafter', 'qadar',
  'angel', 'jibril', 'jinn', 'shaytan', 'iblis', 'sin', 'repent', 'tawbah', 'taqwa', 'sabr', 'shukr',
  'sharia', 'shariah', 'nikah', 'marriage', 'talaq', 'divorce', 'inheritance', 'mirath', 'riba', 'interest',
  'sirah', 'seerah', 'khalifah', 'caliph', 'ummah', 'masjid', 'mosque', 'imam', 'scholar', 'sheikh', 'mufti',
  'eid', 'jumuah', 'friday prayer', 'witr', 'tahajjud', 'tarawih', 'janazah', 'shahada', 'kalimah',
  'bismillah', 'inshallah', 'mashallah', 'alhamdulillah', 'subhanallah', 'astaghfirullah',
];

/** Words that strongly mark a request as outside Islamic scope. */
const OFFTOPIC_TERMS = [
  'javascript', 'typescript', 'python', 'java ', 'react', 'html', 'css', 'sql', 'code', 'coding',
  'program', 'function', 'algorithm', 'debug', 'compile',
  'football', 'soccer', 'basketball', 'cricket', 'nba', 'fifa', 'match score', 'stock', 'crypto',
  'bitcoin', 'invest in', 'movie', 'netflix', 'song', 'lyrics', 'celebrity', 'video game',
  'weather forecast', 'horoscope', 'lottery',
];

/** What to do with a message. */
export type GuardVerdict = 'allow' | 'redirect';

/**
 * Classify a user message. Any Islamic signal → allow. Otherwise, a clear
 * off-topic signal → redirect. Everything else → allow (the model's system
 * prompt handles ambiguous cases).
 */
export function classifyMessage(text: string): GuardVerdict {
  const t = ` ${normalizeText(text)} `;
  for (const term of ISLAMIC_TERMS) {
    if (t.includes(normalizeText(term))) return 'allow';
  }
  for (const term of OFFTOPIC_TERMS) {
    if (t.includes(normalizeText(term))) return 'redirect';
  }
  return 'allow';
}

/** Convenience: whether a message should be sent to the model. */
export function isAllowed(text: string): boolean {
  return classifyMessage(text) === 'allow';
}
