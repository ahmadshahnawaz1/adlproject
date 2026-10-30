/**
 * build-quran-data.mjs — dev-only generator for the bundled offline Qurʾān core.
 *
 * Fetches three open-licensed editions — Uthmani Arabic (Ḥafṣ, CC0), a Latin
 * transliteration, and the Saheeh International English translation — VERIFIES
 * their integrity (114 surahs / 6236 ayahs / per-surah counts / cross-edition
 * coverage / content spot-checks), then emits:
 *
 *   content/quran/data/001.json … 114.json   per-surah ayah text (compact)
 *   content/quran/data/manifest.ts            lazy require map + raw types
 *   content/quran/surahs.ts                   114 typed SurahMeta
 *   content/quran/juz.ts                      30 typed JuzMark
 *
 * This NEVER fabricates scripture. If any source is unreachable or fails a
 * check, it throws and writes nothing. Run:  node scripts/build-quran-data.mjs
 */
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const QURAN_DIR = join(HERE, '..', 'content', 'quran');
const DATA_DIR = join(QURAN_DIR, 'data');

const EDITIONS = {
  arabic: 'ara-quranuthmanihaf',
  translit: 'ara-quran-la',
  saheeh: 'eng-ummmuhammad',
};
const BUNDLED_TRANSLATION = EDITIONS.saheeh;

const CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions';
const META_URL =
  'https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters/en/index.json';
const PAGES_URL =
  'https://cdn.jsdelivr.net/gh/semarketir/quranjson@master/source/surah.json';

/** Canonical ayah count per surah (Kufan / Ḥafṣ), 114 entries, sum 6236. */
const CANONICAL = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111,
  110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45,
  83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55,
  78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20,
  56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21,
  11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

function fail(msg) {
  console.error('\n\u2717 ' + msg + '\n');
  process.exit(1);
}
function ok(msg) {
  console.log('  \u2713 ' + msg);
}

async function getJSON(url, label) {
  console.log(`  \u2026 fetching ${label}`);
  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    fail(`Network error fetching ${label}: ${e.message}\n   ${url}`);
  }
  if (!res.ok) fail(`HTTP ${res.status} fetching ${label}\n   ${url}`);
  return res.json();
}

const QC_API = 'https://api.quran.com/api/v4';
const EDITIONS_URL =
  'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions.json';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Fetch JSON with backoff retry (for the paginated quran.com word API). */
async function getJSONRetry(url, label, tries = 5) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
    await sleep(500 * (i + 1));
  }
  fail(`Failed ${label} after ${tries} tries: ${lastErr && lastErr.message}\n   ${url}`);
}

/** Strip Arabic diacritics / tatweel and fold letter variants for matching. */
function normAr(s) {
  return String(s)
    .normalize('NFC')
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Index an edition's flat ayah list as chapter -> (verse -> text). */
function indexEdition(ed) {
  const m = new Map();
  for (const a of ed.quran) {
    const c = Number(a.chapter);
    const v = Number(a.verse);
    if (!m.has(c)) m.set(c, new Map());
    m.get(c).set(v, String(a.text).trim());
  }
  return m;
}

async function buildCore() {
  console.log('\nBuilding bundled Qurʾān core \u2026\n');

  const [arabic, translit, saheeh] = await Promise.all([
    getJSON(`${CDN}/${EDITIONS.arabic}.json`, 'Arabic (Uthmani Ḥafṣ)'),
    getJSON(`${CDN}/${EDITIONS.translit}.json`, 'Transliteration'),
    getJSON(`${CDN}/${EDITIONS.saheeh}.json`, 'Saheeh International'),
  ]);
  const meta = await getJSON(META_URL, 'surah metadata');
  const pagesRaw = await getJSON(PAGES_URL, 'start pages');

  // ---- top-level shape ----
  for (const [name, ed] of [
    ['arabic', arabic],
    ['translit', translit],
    ['saheeh', saheeh],
  ]) {
    if (!ed || !Array.isArray(ed.quran)) fail(`${name}: missing .quran array`);
  }
  if (!Array.isArray(meta) || meta.length !== 114) {
    fail(`metadata: expected 114 entries, got ${meta && meta.length}`);
  }
  if (!Array.isArray(pagesRaw) || pagesRaw.length !== 114) {
    fail(`pages: expected 114 entries, got ${pagesRaw && pagesRaw.length}`);
  }
  ok('all sources reachable with expected top-level shape');

  const arI = indexEdition(arabic);
  const trI = indexEdition(translit);
  const saI = indexEdition(saheeh);

  // ---- totals ----
  if (arabic.quran.length !== 6236) {
    fail(`Arabic: expected 6236 ayahs, got ${arabic.quran.length}`);
  }
  ok('Arabic ayah total = 6236');
  if (arI.size !== 114) fail(`Arabic: expected 114 surahs, got ${arI.size}`);
  ok('surah count = 114');

  // ---- per-surah counts + cross-edition coverage + metadata agreement ----
  const metaById = new Map(meta.map((m) => [Number(m.id), m]));
  const pagesById = new Map(pagesRaw.map((p) => [Number(p.index), p]));
  let sum = 0;
  for (let s = 1; s <= 114; s++) {
    const arc = arI.get(s);
    if (!arc) fail(`Arabic: surah ${s} missing`);
    const n = arc.size;
    if (n !== CANONICAL[s - 1]) {
      fail(`surah ${s}: Arabic count ${n} \u2260 canonical ${CANONICAL[s - 1]}`);
    }
    const md = metaById.get(s);
    if (!md) fail(`metadata: surah ${s} missing`);
    if (Number(md.total_verses) !== n) {
      fail(`surah ${s}: metadata total_verses ${md.total_verses} \u2260 ${n}`);
    }
    if (!pagesById.get(s)) fail(`pages: surah ${s} missing`);
    for (let v = 1; v <= n; v++) {
      if (!arc.get(v)) fail(`Arabic ${s}:${v} missing/empty`);
      const tv = trI.get(s) && trI.get(s).get(v);
      const sv = saI.get(s) && saI.get(s).get(v);
      if (!tv) fail(`Transliteration ${s}:${v} missing/empty`);
      if (!sv) fail(`Saheeh ${s}:${v} missing/empty`);
    }
    sum += n;
  }
  if (sum !== 6236) fail(`per-surah sum = ${sum} \u2260 6236`);
  ok('per-surah counts match canonical (sum 6236, 3 editions aligned)');

  // ---- content spot-checks (diacritic-insensitive) ----
  const spot = [
    [1, 1, '\u0628\u0633\u0645 \u0627\u0644\u0644\u0647 \u0627\u0644\u0631\u062D\u0645\u0646 \u0627\u0644\u0631\u062D\u064A\u0645'],
    [112, 1, '\u0642\u0644 \u0647\u0648 \u0627\u0644\u0644\u0647 \u0627\u062D\u062F'],
    [114, 6, '\u0645\u0646 \u0627\u0644\u062C\u0646\u0647 \u0648\u0627\u0644\u0646\u0627\u0633'],
  ];
  for (const [s, v, expect] of spot) {
    const got = normAr(arI.get(s).get(v));
    if (!got.includes(normAr(expect))) {
      fail(`spot-check ${s}:${v} mismatch\n   expected ~ "${expect}"\n   got      "${got}"`);
    }
  }
  if (!/in the name of allah/i.test(saI.get(1).get(1))) {
    fail(`Saheeh 1:1 unexpected: ${saI.get(1).get(1)}`);
  }
  ok('content spot-checks passed (basmalah, al-Ikhlāṣ, an-Nās, Saheeh 1:1)');

  // ---- reset output dir ----
  rmSync(DATA_DIR, { recursive: true, force: true });
  mkdirSync(DATA_DIR, { recursive: true });

  // ---- emit per-surah JSON (compact) ----
  for (let s = 1; s <= 114; s++) {
    const n = CANONICAL[s - 1];
    const ayahs = [];
    for (let v = 1; v <= n; v++) {
      ayahs.push({
        n: v,
        arabic: arI.get(s).get(v),
        translit: trI.get(s).get(v),
        t: { [BUNDLED_TRANSLATION]: saI.get(s).get(v) },
      });
    }
    const file = join(DATA_DIR, String(s).padStart(3, '0') + '.json');
    writeFileSync(file, JSON.stringify({ surah: s, ayahs }));
  }
  ok('wrote 114 per-surah JSON files');

  // ---- manifest.ts (lazy require map) ----
  const man = [];
  man.push('// AUTO-GENERATED by scripts/build-quran-data.mjs — do not edit by hand.');
  man.push('// Bundled offline Qurʾān core: Uthmani Arabic + transliteration + Saheeh International.');
  man.push('');
  man.push('export type RawAyah = {');
  man.push('  n: number;');
  man.push('  arabic: string;');
  man.push('  translit: string;');
  man.push('  t: Record<string, string>;');
  man.push('};');
  man.push('export type RawSurah = { surah: number; ayahs: RawAyah[] };');
  man.push('');
  man.push(`export const BUNDLED_TRANSLATION = ${JSON.stringify(BUNDLED_TRANSLATION)};`);
  man.push('');
  man.push('export const SURAH_FILES: Record<number, () => RawSurah> = {');
  for (let s = 1; s <= 114; s++) {
    man.push(`  ${s}: () => require('./${String(s).padStart(3, '0')}.json') as RawSurah,`);
  }
  man.push('};');
  man.push('');
  writeFileSync(join(DATA_DIR, 'manifest.ts'), man.join('\n'));
  ok('wrote data/manifest.ts');

  // ---- surahs.ts (114 typed SurahMeta) ----
  const sl = [];
  sl.push('// AUTO-GENERATED by scripts/build-quran-data.mjs — do not edit by hand.');
  sl.push("import type { SurahMeta } from './types';");
  sl.push('');
  sl.push('export const SURAHS: readonly SurahMeta[] = [');
  for (let s = 1; s <= 114; s++) {
    const md = metaById.get(s);
    const pg = pagesById.get(s);
    const revelation =
      String(md.type).toLowerCase() === 'medinan' ? 'medinan' : 'meccan';
    const entry = {
      number: s,
      arabicName: String(md.name),
      name: String(md.transliteration),
      meaning: String(md.translation),
      revelation,
      ayahCount: CANONICAL[s - 1],
      hasBismillah: s !== 1 && s !== 9,
      startPage: Number(pg.pages),
    };
    sl.push('  ' + JSON.stringify(entry) + ',');
  }
  sl.push('];');
  sl.push('');
  writeFileSync(join(QURAN_DIR, 'surahs.ts'), sl.join('\n'));
  ok('wrote surahs.ts (114 SurahMeta)');

  // ---- juz.ts (derive 30 start marks from page-data juz boundaries) ----
  const juzStart = new Map();
  for (let s = 1; s <= 114; s++) {
    const pg = pagesById.get(s);
    const arr = Array.isArray(pg.juz) ? pg.juz : [];
    for (const j of arr) {
      const jn = Number(j.index);
      const startV = Number(String((j.verse && j.verse.start) || '').replace(/[^0-9]/g, ''));
      if (!jn || !startV) continue;
      if (!juzStart.has(jn)) juzStart.set(jn, { juz: jn, surah: s, ayah: startV });
    }
  }
  if (juzStart.size !== 30) fail(`juz derivation: expected 30, got ${juzStart.size}`);
  const j1 = juzStart.get(1);
  if (!j1 || j1.surah !== 1 || j1.ayah !== 1) {
    fail(`juz 1 must start at 1:1, got ${JSON.stringify(j1)}`);
  }
  const jl = [];
  jl.push('// AUTO-GENERATED by scripts/build-quran-data.mjs — do not edit by hand.');
  jl.push("import type { JuzMark } from './types';");
  jl.push('');
  jl.push('export const JUZ: readonly JuzMark[] = [');
  for (let j = 1; j <= 30; j++) {
    jl.push('  ' + JSON.stringify(juzStart.get(j)) + ',');
  }
  jl.push('];');
  jl.push('');
  writeFileSync(join(QURAN_DIR, 'juz.ts'), jl.join('\n'));
  ok('wrote juz.ts (30 JuzMark)');

  ok('Qurʾān core built');
}

/**
 * Editions catalog — every downloadable translation / transliteration from
 * fawazahmed0/quran-api (the "all translations" library). The dict is keyed by
 * an underscore id, but the URL id is the `name` field (hyphenated).
 */
async function buildCatalog() {
  console.log('\nBuilding editions catalog (fawazahmed0) \u2026\n');
  const eds = await getJSONRetry(EDITIONS_URL, 'editions catalog');
  const seen = new Set();
  const entries = [];
  for (const key of Object.keys(eds)) {
    const v = eds[key] || {};
    const id = String(v.name || '').trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const author = String(v.author || '').trim();
    const language = String(v.language || '').trim() || 'Other';
    const hay = `${id} ${author}`.toLowerCase();
    const kind =
      hay.includes('translit') || /-la\d*$/.test(id)
        ? 'transliteration'
        : 'translation';
    entries.push({ id, name: author || id, language, kind });
  }
  entries.sort(
    (a, b) => a.language.localeCompare(b.language) || a.name.localeCompare(b.name),
  );
  if (entries.length < 400) fail(`catalog: only ${entries.length} editions (<400)`);

  const cl = [];
  cl.push('// AUTO-GENERATED by scripts/build-quran-data.mjs — do not edit by hand.');
  cl.push('// Every translation / transliteration edition available to download');
  cl.push('// (fawazahmed0/quran-api, CC0). Downloaded on demand in the reader.');
  cl.push("import type { DownloadableEdition } from './types';");
  cl.push('');
  cl.push('export const EDITION_CATALOG: readonly DownloadableEdition[] = [');
  for (const e of entries) cl.push('  ' + JSON.stringify(e) + ',');
  cl.push('];');
  cl.push('');
  writeFileSync(join(QURAN_DIR, 'editions-catalog.ts'), cl.join('\n'));
  ok(`wrote editions-catalog.ts (${entries.length} editions)`);
}

/**
 * Word-by-word — Arabic, transliteration, and English gloss per word, from the
 * quran.com API v4. Bundled offline so the killer feature needs zero network.
 */
async function buildWBW() {
  console.log('\nBuilding word-by-word (quran.com) \u2026\n');
  const WBW_DIR = join(DATA_DIR, 'wbw');
  rmSync(WBW_DIR, { recursive: true, force: true });
  mkdirSync(WBW_DIR, { recursive: true });

  let totalWords = 0;
  for (let s = 1; s <= 114; s++) {
    const expected = CANONICAL[s - 1];
    const byAyah = new Map();
    let page = 1;
    let totalPages = 1;
    do {
      const url =
        `${QC_API}/verses/by_chapter/${s}?words=true` +
        `&word_fields=text_uthmani,transliteration&per_page=50&page=${page}`;
      const d = await getJSONRetry(url, `WBW ${s} p${page}`);
      totalPages = (d.pagination && d.pagination.total_pages) || 1;
      for (const v of d.verses) {
        const n = Number(String(v.verse_key).split(':')[1]);
        const words = [];
        for (const w of v.words || []) {
          if (w.char_type_name !== 'word') continue;
          const a = String(w.text_uthmani || '').trim();
          const t = String((w.transliteration && w.transliteration.text) || '').trim();
          const g = String((w.translation && w.translation.text) || '').trim();
          if (!a) continue;
          words.push({ a, t, g });
        }
        byAyah.set(n, words);
      }
      page++;
      await sleep(120);
    } while (page <= totalPages);

    if (byAyah.size !== expected) {
      fail(`WBW surah ${s}: got ${byAyah.size} ayahs, expected ${expected}`);
    }
    const ayahs = [];
    for (let n = 1; n <= expected; n++) {
      const words = byAyah.get(n);
      if (!words || words.length === 0) fail(`WBW ${s}:${n} has no words`);
      ayahs.push({ n, words });
      totalWords += words.length;
    }
    writeFileSync(
      join(WBW_DIR, String(s).padStart(3, '0') + '.json'),
      JSON.stringify({ surah: s, ayahs }),
    );
    if (s % 10 === 0 || s === 114) console.log(`  \u2026 ${s}/114 surahs`);
  }
  ok(`word-by-word built (${totalWords} words across 6236 ayahs)`);

  const wm = [];
  wm.push('// AUTO-GENERATED by scripts/build-quran-data.mjs — do not edit by hand.');
  wm.push('// Bundled offline word-by-word (Arabic + transliteration + English gloss),');
  wm.push('// source: quran.com API v4.');
  wm.push('');
  wm.push('export type RawWord = { a: string; t: string; g: string };');
  wm.push('export type RawWbwAyah = { n: number; words: RawWord[] };');
  wm.push('export type RawWbwSurah = { surah: number; ayahs: RawWbwAyah[] };');
  wm.push('');
  wm.push('export const WBW_FILES: Record<number, () => RawWbwSurah> = {');
  for (let s = 1; s <= 114; s++) {
    wm.push(`  ${s}: () => require('./wbw/${String(s).padStart(3, '0')}.json') as RawWbwSurah,`);
  }
  wm.push('};');
  wm.push('');
  writeFileSync(join(DATA_DIR, 'wbw-manifest.ts'), wm.join('\n'));
  ok('wrote data/wbw-manifest.ts');
}

async function main() {
  if (typeof fetch !== 'function') {
    fail('global fetch unavailable — run with Node 18+');
  }
  const args = process.argv.slice(2);
  const want = (name) => args.length === 0 || args.includes(name);
  if (want('core')) await buildCore();
  if (want('catalog')) await buildCatalog();
  if (want('wbw')) await buildWBW();
  console.log('\n\u2713 Done.\n');
}

main().catch((e) => fail((e && e.stack) || String(e)));
