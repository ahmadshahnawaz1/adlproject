# Adl — Master Feature Roadmap

The planning source of truth for every remaining feature of the Adl Islamic assistant app.

Each feature follows the proven internal build pattern used for Fasting, Zakat, and Pilgrimage — an eight-stage pipeline (**P0 → P8**):

| Stage | What happens |
|-------|--------------|
| **P0 Content** | `content/<feature>/` — typed data + barrel (`index.ts`) |
| **P1 Logic** | `lib/<feature>.ts` — pure functions + `__tests__/<feature>.test.ts` |
| **P2 Hooks** | `hooks/use<Feature>*.ts` — persisted state (AsyncStorage) |
| **P3 Engine** | Shared animation/SVG primitives (if the feature needs them) |
| **P4 Scenes** | Cinematic SVG/parallax components |
| **P5 UI** | Cards, lists, sheets (each ≤ 500 lines) |
| **P6 Screen** | `screens/<Feature>Screen.tsx` orchestrator |
| **P7 Wiring** | Sidebar item + Home tile + Dashboard overlay (+ notifications) |
| **P8 Validate** | `get_errors` clean → `jest` green → offline iOS bundle export `EXIT=0` |

## Principles (apply to every feature)

- **Fully offline.** Bundled JSON content; AsyncStorage for state. The *only* networked feature is the Mosque/Halal Finder (F15).
- **Evidence-cited.** Every ruling, duʿāʾ, and dhikr carries a Qurʾān/Sunnah reference through the existing `DaleelBlock` component and `Daleel` type.
- **Cinematic & calm.** React Native `Animated` + `react-native-svg` only. No `three` / `expo-gl` / `lottie` / `reanimated` / `gesture-handler` (they crash Expo Go). `expo-sensors` for tilt, `expo-haptics` for taps.
- **Conventions.** Files ≤ 500 lines, theme tokens only, real Unicode (ﷺ ʾ ʿ ī ā ū ḥ ṣ ḍ —).

---

## Phase A — Daily Devotional Core *(highest priority)*

The everyday-use layer every top Islamic app leads with. Adl currently jumps straight to seasonal worship (Zakat/Fasting/Hajj) and is missing the daily core.

### F4 · Tasbīḥ Counter *(build first — the reusable counter primitive)*

- **P1** `lib/tasbih.ts` — presets (33 / 99 / 100), cycle + milestone logic. Tests.
- **P2** `hooks/useTasbih.ts` — count, target, session history, lifetime total, milestone haptics.
- **P5** `components/TasbihBead.tsx` (SVG ring fill), `TasbihPresetPicker.tsx`.
- **P6** `screens/TasbihScreen.tsx` — large tap zone, count readout, reset, preset switch, vibrate at target.
- **Reused by** F2 (Adhkār) and F10 (Dhikr goals).

### F1 · How to Pray — Ṣalāh Guide  ★ *flagship*

The sequel to the wudū guide: the prayer itself, posture by posture.

- **P0** `content/salah/` — `types.ts` (`Posture`: qiyām/rukūʿ/iʿtidāl/sujūd/julūs/tashahhud; `Recitation` with Arabic + transliteration + translation + `Daleel`; `RakahStep`); data for each obligatory prayer (rakʿah counts), recitations (Fātiḥah, tashahhud, ṣalāh ʿalā an-Nabī ﷺ, qunūt), common mistakes, women's-prayer notes, sutrah, sajdah sahw.
- **P1** `lib/salah.ts` — expand a prayer into its ordered step list (2/3/4 rakʿah), tag fard vs sunnah. Tests.
- **P4** `components/PostureScene.tsx` — SVG silhouette per posture with tilt-parallax (pattern from `RiteScene`).
- **P5** `SalahStepCard.tsx` (reuses `DuaCard` + `DaleelBlock`), `RakahProgressRail.tsx`, `PrayerPicker.tsx` (Fajr…Witr, optional Janāzah).
- **P6** `screens/SalahGuideScreen.tsx` — pick prayer → step-by-step runner (mirrors `JourneyRunner` / `WuduScreen`).
- **P7** Sidebar "How to Pray", Home tile beside wudū, Dashboard overlay.

### F2 · Adhkār — Fortress of the Muslim

- **P0** `content/adhkar/` — morning, evening, after-ṣalāh, sleep/waking. Each dhikr: Arabic, translit, translation, repeat count, virtue, daleel.
- **P1** `lib/adhkar.ts` — session builder + progress fraction. Tests.
- **P2** `hooks/useAdhkarProgress.ts` — per-session counts, daily reset, completion streak.
- **P5** `AdhkarCard.tsx` (tap-to-count w/ haptics, reuses F4 mechanics), `CategoryTabs.tsx`, `ProgressRing.tsx`.
- **P6** `screens/AdhkarScreen.tsx`. **P7** + optional morning/evening reminder notifications.

### F3 · Duʿāʾ Library

- **P0** `content/duas-library/` — situational duʿās (waking, home, mosque, travel, rain, distress, istikhārah, debt, illness, Qurʾānic & Prophetic), tagged.
- **P1** `lib/duaSearch.ts` — filter/search by category + text. Tests.
- **P2** `hooks/useDuaFavorites.ts`.
- **P5** `DuaSearchBar.tsx`, `DuaCategoryGrid.tsx`, reuse `DuaCard`.
- **P6** `screens/DuaLibraryScreen.tsx`.

---

## Phase B — The Qurʾān  ★★ *flagship*

### F7 · Qurʾān Reader (muṣḥaf)  ✅ *shipped (Phases 1–4)*

Pairs with the existing `QuranKhatmCard` and `lib/quranKhatm.ts` pace tracker.

**Phase 1 (shipped):** the full offline muṣḥaf — 114 surahs / 6236 āyāt (Uthmani
Ḥafṣ), Saheeh International translation, and a Latin transliteration, all
bundled (~3.4 MB, split per-surah for lazy loading). Surah + Juzʾ index with
forgiving search, a resume card, the reader (Amiri / Scheherazade fonts, size
stepper, transliteration & translation toggles), ayah bookmarks, share, and an
actions sheet. Reachable from the sidebar, a flagship Home tile, and the
Ramaḍān khatm card. Fully offline.

**Phase 2 (shipped):** word-by-word morphology (bundled per-surah, with a themed
`WordDetailSheet`), multi-translation stacking, five reader themes (midnight,
slate, emerald, sepia, paper), an Arabic font-size stepper **and** a line-spacing
stepper, and a redesigned `ReaderSettingsSheet` covering typeface, size, spacing,
theme, display toggles, translations, and the default tafsīr.

**Phase 3 (shipped):** an on-demand **editions library** (`QuranLibraryScreen`)
backed by the fawazahmed0 CDN — **492 downloadable translations across all
languages**, grouped by language with forgiving search and kind filters, each
streamed straight to disk via the SDK-54 `expo-file-system` `File`/`Directory`
API, validated on download (full 6236-āyah parse), with per-edition delete and a
storage-usage readout. Downloaded translations merge live into the reader. Plus a
**tafsīr layer** — 18 classical/modern tafāsīr (spa5k CDN) rendered in a themed
`TafsirSheet` with HTML sanitisation and per-āyah disk caching.

**Phase 4 (shipped):** immersive **focus mode** (the toolbar floats and
auto-hides as you read forward, returning on scroll-up or near the top, via RN
`Animated` with the native driver), one-tap **copy** (`expo-clipboard`) with a
confirmation state, and polished multi-translation **share** text.

299 dedicated tests; fully offline core (download layer is the one opt-in network
touch, by design). 0 TypeScript errors; iOS export clean.


- **P0** `content/quran/` — Uthmani Arabic (114 surahs / 6236 āyāt) + one English translation + surah metadata (name, revelation place, āyah count, juzʾ/page maps). Bundled JSON, **split per-juzʾ or per-surah** for lazy loading (largest asset in the app).
- **P1** `lib/quran.ts` — surah/āyah lookup, page↔juzʾ↔surah mapping (extend existing `pageToJuz`), search by name/number. Tests.
- **P2** `hooks/useQuranReader.ts` (last-read position, font size), `useQuranBookmarks.ts`, `useQuranSettings.ts` (script, translation on/off, tafsīr on/off).
- **P5** `AyahRow.tsx`, `SurahHeader.tsx` (bismillah), `SurahList.tsx`, `JuzList.tsx`, `ReaderToolbar.tsx`, `BookmarkSheet.tsx`.
- **P6** `screens/QuranScreen.tsx` — surah/juzʾ index → reader; "resume last read"; khatm card taps jump here.
- **Integration** — mark pages read in the khatm tracker as you scroll; bookmark = resume.
- **Phase 2 (shipped)** — multi-translation stacking + word-by-word + reader themes + line spacing.
- **Phase 3 (shipped)** — on-demand editions / tafsīr downloader (`expo-file-system`; fawazahmed0's 492 editions + 18 spa5k tafāsīr) — delivers the "all translations" long tail.
- **Phase 4 (shipped)** — focus mode + clipboard copy + share polish.
- **Deferred** — audio recitation ships with **F8**.

---

## Phase C — Audio & Engagement

### F8 · Audio Layer *(expo-audio — part of Expo SDK 54, Expo-Go-safe)*

- **Qurʾān recitation (shipped)** per āyah/surah (extends F7). Tap any āyah to recite; recitation auto-advances through the surah hands-free; a surah-level play button in the toolbar. **9 reciters** (ʿAfasy default, Ḥuṣarī, Minshāwī, ʿAbdul-Bāsiṭ, Sudais, Shaaṭree, Maher al-Muʿayqalī, Ḥudhayfī, Jibreel) via `cdn.islamic.network`. Recitation audio is large → **stream on demand + optional per-surah download** (per reciter), not bundled. This is the one place the "fully offline" claim bends — flagged consciously; downloaded surahs then recite with no network.
- **Adhān playback — deferred.** No license-verified muʾadhdhin audio source could be confirmed; per the locked "never bundle unlicensed audio" rule, in-app adhān playback + custom-notification-sound wiring is parked until a clean source is secured. The notification *scheduler* already exists.
- **P1/P2 (shipped)** `lib/quranRecitations.ts` (pure catalog + URL builders, `globalAyahNumber` in `lib/quran.ts`) + `lib/quranRecitationStore.ts` (native FS) + `hooks/useRecitationPlayer.ts` (expo-audio engine, iOS silent-mode, auto-advance) + `hooks/useQuranRecitationDownloads.ts`; reader UI: play controls on `AyahRow`/`AyahActionsSheet`/`ReaderToolbar` + new `components/quran/RecitationSheet.tsx` (reciter picker + per-surah download).

### F10 · Dhikr Goals & Streaks *(shipped)*

- Tie F4 (tasbīḥ) + F2 (adhkār) into configurable daily goals + a unified streak + a 14-day trend, with a dedicated hub screen and a Home summary card.
- **P1/P2 (shipped)** `lib/streak.ts` (shared pure) + `lib/dhikrGoals.ts` + `hooks/useDhikrGoals.ts`.

### F11 · Tahajjud / Qiyām al-Layl *(shipped)*

- Extend `lib/prayerTimes.ts`: compute the last-third-of-night window (Maghrib → Fajr).
- **P1 (shipped)** `lib/nightPrayer.ts`. Tests. Tahajjud card on Sunnah/Home + dedicated screen (night-arc timeline, thirds, virtues, duʿās) + wake reminder (3 modes).

---

## Phase D — Reach & Polish

### F12 · Learning Hub  ✅ *shipped*

- A growing teaching library: a guided **New Muslim** path (9 steps, each able to jump into the Wudū / How-to-Pray / Qurʾān / Adhkār / Mosque features), the **Sīrah** as a vertical chronological timeline (**32 evidence-cited events**, before-revelation → the farewell), **ʿAqīdah** (tawḥīd, the six pillars of īmān, the testimony) and the **Fiqh of worship** (intention, purification, ṣalāh, ṣawm, zakāh, ḥajj) as grouped lesson lists, plus a forgiving search across every lesson and event. Reading progress is remembered. Fully offline, evidence-cited via `DaleelBlock`.
- **P0/P1/P2 (shipped)** `content/learn/` (`types`, `aqidah`, `fiqh`, `sirahMakkah`, `sirahMadinah`, `newmuslim`, barrel) + `lib/learn.ts` (search/grouping/track-progress, 22 tests) + `hooks/useLearnProgress.ts` (`adl.learn.v1`); UI: `components/learn/` (`LessonView`, `TopicGrid`, `LearnCard`, `SirahTimeline`, `LearnPathRunner`, `LessonSheet`) + `screens/LearnScreen.tsx` / `SirahScreen.tsx` / `LearnPathScreen.tsx`; wired into Sidebar / Home tile / Dashboard overlay.

### F13 · Ṣadaqah Tracker + Zakāt Payment Log  ✅ *shipped*

- Extends Zakat: log every gift (zakāt, ṣadaqah, ṣadaqah jāriyah, fiṭrana, fidya/kaffāra) with amount, category, optional ASNAF recipient, note and date; a giving card inside the Zakāt result (this-ḥawl given vs. zakāt due + lifetime + sparkline), a dedicated **Ṣadaqah** screen (full history, category filters, edit/delete, share summary), and an **annual zakāt-due reminder** fired on ḥawl completion (mirrors the Tahajjud scheduler). Fully offline.
- **P1/P2 (shipped)** `lib/charity.ts` (pure ledger + derivations, 22 tests) + `hooks/useCharityLog.ts` (`adl.charityLog.v1`) + `hooks/useZakatReminder.ts` (`adl.zakatReminder.v1`) + `lib/notifications.ts` (`scheduleZakatDueReminder`/`cancelZakatDueReminder`/`sendTestZakatDue`, tag `adl.zakat-due`); UI: `components/sadaqah/SadaqahLogCard.tsx` + `SadaqahEntrySheet.tsx` + `ZakatDueReminderSheet.tsx` + `screens/SadaqahScreen.tsx`; wired into Sidebar / Home tile / Dashboard overlay and embedded in `ZakatScreen`.

### F14 · Multi-language UI  ✅ *shipped (RTL out of scope)*

- A dependency-light i18n layer: a typed English base catalogue (`i18n/locales/en.ts`) is the source of truth; each language is a partial override that falls back to English. `LocaleProvider` + `useT()` / `useLocale()` resolve the active language (saved choice → device locale via `expo-localization` → English) and translate with `{name}` interpolation, persisted under `adl.locale.v1`. Ships **English, Arabic, Urdu, French, Indonesian, Turkish** (each a one-file catalogue — more languages are trivial to add), a `LanguageSheet` picker, and localised navigation / home tiles / appearance chrome. Per decision, **RTL layout mirroring is intentionally out of scope** — Arabic & Urdu render as text within the existing layout; the evidence-cited Arabic content is not localised.

### F15 · Mosque / Halal Finder  ✅ *shipped (the one networked feature)*

- Finds nearby **mosques and halal food** using the keyless OpenStreetMap **Overpass API** (mirror-failover + hard timeout), listed nearest-first with a Directions button that opens the device maps app. Reuses the existing location stack (GPS or a pinned city via the shared `CityPicker`), with kind and radius filters. It degrades gracefully **offline** by showing the last cached results, and always carries the required “© OpenStreetMap contributors” attribution plus a verify-halal disclaimer. Expo-Go-safe (a list, not an embedded native map).
- **P1/P2 (shipped)** `lib/places.ts` (pure Overpass query/parse/haversine/format, 18 tests) + `lib/placesFetch.ts` (fetch + `adl.places.cache.v1` offline cache) + `hooks/usePlacesFinder.ts`; UI `components/places/PlaceRow.tsx` + `PlaceFilters.tsx` + `PlacesStatus.tsx` + `screens/MosqueFinderScreen.tsx`; wired into Sidebar / Home tile / Dashboard overlay.

### F17 · Themes & Accessibility  ✅ *shipped*

- App-wide light / dark / **follow-system** theming via a `ThemeProvider` + `useTheme()` / `useThemedStyles()` over a `ThemeColors` palette (dark, light, and high-contrast variants), plus a dynamic-type text-scale control — all in an **Appearance** sheet reached from the sidebar. The Qurʾān reader keeps its own independent `ReaderTheme`, and the cinematic SVG scenes stay intentionally dark by design.
- **Infra (shipped)** `theme/palettes.ts` (`darkPalette`/`lightPalette` + high-contrast, `resolvePalette`), `theme/typeScale.ts` (`scaleFont`), `theme/ThemeContext.tsx` (`useTheme`/`useThemedStyles`, persisted `adl.theme.v1`); `components/ThemeSettingsSheet.tsx`; StatusBar + root made dynamic in `App.tsx`. ~90 components/screens routed through the context.

---

## Phase E — The Sunnah  ★★ *flagship*

### F18 · Hadith Library — *the complete canonical corpus*  ✅ *Track 1 shipped*

The Sunnah counterpart to the muṣḥaf (F7): the major hadith collections — Arabic, translation, isnād, and **authenticity grading** — brought in with the same offline-first, download-on-demand architecture proven by the Qurʾān editions/tafsīr layer (F7 Phase 3). Delivered in **two tracks** so it ships fully now and grows into a backend later, with the device staying usable and offline throughout.

**Scope (honest).** Not "every hadith in existence" — much is unpublished, in manuscript, or untranslated, and most is isnād-repetition of the same matn. The achievable target is the **complete accessible canonical corpus**: Kutub al-Sittah + Muwaṭṭaʾ + Musnad Aḥmad + Dārimī + the classic thematic books (Riyāḍ al-Ṣāliḥīn, Bulūgh al-Marām, Mishkāt, 40 Nawawī/Qudsī, Adab al-Mufrad, Shamāʾil, Ḥiṣn al-Muslim) — ≈ 50–60k narrations with grading. Presented as **"the complete hadith library,"** never "every hadith ever."

**Non-negotiable principle — grading first.** Every hadith shows a colour-coded **authenticity grade** (Ṣaḥīḥ / Ḥasan / Ḍaʿīf / Mawḍūʿ) with the **grader cited**; the app defaults to an **"Authentic only"** filter; weak/fabricated narrations are reachable only behind a clear warning. This is the feature's soul and its liability shield.

**Reuse map** — ≈ 80% is a clone of already-shipped, validated patterns:

| Shipped (Qurʾān F7) | New (Hadith F18) |
|---|---|
| `scripts/build-quran-data.mjs` | `scripts/build-hadith-data.mjs` |
| `content/quran/editions-catalog.ts` | `content/hadith/collections.ts` |
| `lib/quranEditions.ts` (pure) | `lib/hadithEditions.ts` (pure) |
| `lib/quranEditionStore.ts` (native FS) | `lib/hadithStore.ts` |
| `hooks/useQuranDownloads.ts` | `hooks/useHadithLibrary.ts` |
| `screens/QuranLibraryScreen.tsx` | `screens/HadithLibraryScreen.tsx` |
| `components/DaleelBlock.tsx` + `Daleel` type | `components/hadith/HadithCard.tsx` |
| Amiri/Scheherazade fonts, ReaderThemes, ThemeContext, i18n, `normalizeText`, clipboard, Share, notifications | reused as-is |

New dependency: **`expo-sqlite`** (FTS5 full-text search at scale; Expo-Go-safe) — the only addition.

#### Track 1 — Local-first *(ships now, no backend)*

- **P0 Content** — `content/hadith/`: `types.ts` (`Hadith` {id, collection, book, chapter, number, arabic, translations, narrator, isnad, grade, references, topics}, `HadithCollection`, `Grade` {ruling, grader, source}, `GradeRuling`, `HadithTopic`); `nawawi40.ts` (the complete **40 Ḥadīth of al-Nawawī**); `qudsi40.ts` (the complete **40 Ḥadīth Qudsī**); `topics.ts` (~40 themes); `collections.ts` (catalogue of **every major collection** — id, name, Arabic, author, count, grader, downloadable — so the library shows the full scope); `index.ts` barrel.
- **P1 Logic** — `lib/hadith.ts` (grade colour/label/rank, `isAuthentic`, filter-by-grade, browse by collection/chapter/topic/narrator, diacritic-insensitive search via `normalizeText`, date-seeded Hadith of the Day; tests) + `lib/hadithEditions.ts` (CDN URL builders for the fawazahmed0 hadith-api, payload parse + count validation; tests).
- **P2 Hooks** — `lib/hadithStore.ts` (`expo-file-system` → `<documents>/hadith/<edition>.json`) + `hooks/useHadithLibrary.ts` (`adl.hadith.library.v1`, reconcile-vs-disk, progress) + `useHadithBookmarks.ts` (`adl.hadith.bookmarks.v1`) + `useHadithSettings.ts` (`adl.hadith.settings.v1`: authentic-only, translation, Arabic font/size, show-isnad) + `useHadithReader.ts` (`adl.hadith.reader.v1`).
- **P3 Search** — on download, import each edition into a local **SQLite FTS5** index (`expo-sqlite`); unified `MATCH` across attached collections (Arabic + translation + narrator + reference), ranked and diacritic-folded; the bundled core is searched in-memory.
- **P5 UI** *(each ≤ 500 lines)* — `components/hadith/`: `GradeChip.tsx` (colour-coded authenticity + grader), `HadithCard.tsx` (Arabic in bundled fonts, translation toggle, **isnād reveal**, grade chip, references, copy/share/bookmark), `CollectionCard.tsx`, `HadithChapterRow.tsx`, `HadithOfTheDayCard.tsx`, `HadithActionsSheet.tsx`, `HadithSettingsSheet.tsx`.
- **P6 Screens** — `screens/HadithScreen.tsx` (hub: Hadith of the Day + browse by collection + by topic + search + bookmarks + library entry), `HadithCollectionScreen.tsx` (chapters → hadith with the authentic-only filter), `HadithLibraryScreen.tsx` (download/delete collections + storage readout — a clone of `QuranLibraryScreen`).
- **P7 Wiring** — Sidebar item + Home tile + Dashboard overlay; `DaleelBlock` citations across Adhkār/Duʿāʾ/Ṣalāh/Learn become tappable links into the full graded hadith; āyah references link into the Qurʾān reader; optional **Hadith of the Day** notification (scheduler exists).
- **P8 Validate** — `get_errors` → `jest` → offline iOS export `EXIT=0`; bundled core fully offline; downloaded collections search instantly.

#### Track 2 — Backend + database *(end-state; additive, never breaks offline)*

- **B0 Foundations** — managed Postgres (Supabase / self-hosted), infra-as-code, staging + prod, observability, CI/CD.
- **B1 Canonical warehouse** — normalise the **entire corpus**: `collections`, `books`, `hadith` (Arabic + matn), `narrators` (rijāl), `isnad_links`, `translations` (many languages), `gradings` (per grader), `topics`, `cross_references`; ingestion + validation pipeline, versioned datasets, scholarly-review workflow before publish.
- **B2 API** — REST/GraphQL: by collection/number, batch, **delta-sync** since a timestamp, cursor pagination, edge-cached with ETags + strict rate limits.
- **B3 Server search** — Meilisearch/Typesense/OpenSearch across Arabic + all translations + narrator + topic; typo-tolerant, transliteration-aware, ranked; **semantic/embeddings** search as v2.
- **B4 Accounts & cloud sync** — real auth (replaces the current mock), cross-device sync of bookmarks/last-read/settings/reading-plans, conflict-free merge, export.
- **B5 Rijāl & isnād graph** — narrator biographies, teacher/student chains, an **isnād visualiser**, reliability ratings.
- **B6 Sharḥ & scholarship** — downloadable commentary layers (Nawawī, Ibn Ḥajar's *Fatḥ al-Bārī*…), footnotes, **takhrīj** (source-tracing), linked tafsīr.
- **B7 Community & study** — verified-scholar Q&A, collections/playlists, reading plans, notes — all moderated; server-driven Hadith of the Day.
- **B8 Delivery & governance** — CDN + prebuilt per-collection **SQLite bundles** for instant offline import; dataset **licensing register** + attribution; content-integrity signing; analytics + UX A/B.

**Data model (spine):** `Collection → Book/Chapter → Hadith`; `Hadith ⋈ Narrator` (isnād) `⋈ Grading[] ⋈ Translation[] ⋈ CrossRef[] ⋈ Topic[]`.

**Risks & mitigations:** licensing → license-clean open datasets + an attribution register (same discipline that deferred adhān audio); grading accuracy → cite graders, scholarly review, never surface weak as authoritative; size → opt-in per-collection download; offline-first → the backend is purely additive, the device never depends on the network for content it owns.

---

## Phase F — Intelligence  ★★ *flagship*

### F19 · ADL AI — the Islamic AI companion  ✅ *Track 1 shipped*

A ChatGPT-grade chat experience that is **Islamic-only** and **grounded in the app's own evidence-cited corpus** (Qurʾān, the F18 hadith library, duʿās, fiqh lessons) — so it answers *from* cited sources and returns **tappable citations** that deep-link into the reader and hadith library. Delivered in **two tracks**: Track 1 ships fully on-device with a **bring-your-own API key** (no backend, Expo-Go-safe, private); Track 2 layers a proxy backend later for a free tier, server-side retrieval, and cross-device sync. The rest of the app stays offline-first; only the model call needs the network.

**Why this isn't a ChatGPT wrapper.** Layered guardrails keep it Islamic and safe, and retrieval-augmented generation over the local corpus makes it accurate and trustworthy: it must cite retrievable evidence, present ikhtilāf with madhhab attribution, defer to scholars, and **never issue a definitive fatwā**.

**Locked decisions.** BYO-key in `expo-secure-store` (never AsyncStorage, never logged, never bundled); provider-agnostic layer (OpenAI / OpenRouter / Anthropic / Gemini / Groq); SSE **streaming** via `expo/fetch` (fallback `react-native-sse`); `expo-sqlite` persistence (reused from F18); retrieval works offline, only generation needs network.

#### Track 1 — On-device, BYO-key *(build now)*

- **P0 Foundations** — add `expo-secure-store`; de-risk streaming with an `expo/fetch` SSE spike in Expo Go; pick default provider + model list; lock disclaimer copy + i18n keys.
- **P1 Engine** — `lib/ai/secureKey.ts` (keychain get/set/clear); `lib/ai/providers.ts` (PURE: provider registry + `buildRequest` + `parseSSEChunk`, tested); `lib/ai/stream.ts` (`streamChat` with `AbortController`, `[DONE]`, partial-JSON, error mapping); `hooks/useAISettings.ts` (`adl.ai.settings.v1`).
- **P2 Persistence** — `lib/ai/db.ts` (`expo-sqlite`: `conversations` + `messages` + FTS); `hooks/useConversations.ts` (date-grouped list, create/rename/delete/pin, search); `hooks/useConversation.ts` (append-stream, persist, regenerate, edit-and-resend); auto-title.
- **P3 Guardrails** — `content/ai/systemPrompt.ts` (the Islamic persona: cite evidence, ikhtilāf w/ attribution, no grave-matter fatāwā, refuse off-topic/harmful); `lib/ai/topicGuard.ts` (PURE, tested: allow/redirect/refuse); `lib/ai/moderation.ts` (input safety + safe redirects); prompt-injection hardening (user text untrusted, corpus trusted).
- **P4 RAG grounding** *(the killer feature)* — `lib/ai/retrieval.ts` (PURE, tested: top-K over Qurʾān + hadith F18 + duʿās F3 + lessons F12 + adhkār F2 via `normalizeText`); `lib/ai/context.ts` (token-budgeted grounding block + source ids); citation contract `[[quran:2:255]]` / `[[hadith:bukhari:1]]` → chips; (v2) on-device embeddings.
- **P5 UI (ChatGPT-style)** — `components/ai/`: `MessageBubble` (markdown + Arabic fonts + streaming cursor + copy/regenerate/feedback), `Markdown`, `Composer` (growing input, send↔stop), `TypingIndicator`, `ScrollToBottomFab`, `PromptStarters` (Islamic chips), `CitationChip` (deep-links), `ConversationList`; `screens/AIChatScreen.tsx` (inverted `FlatList`, streaming, empty-state starters), `screens/AIHistoryScreen.tsx`, `components/ai/AISettingsSheet.tsx` (masked key entry + "test key" + provider/model/temperature + clear-all + disclaimer).
- **P6 Polish** — stop/regenerate/edit-resend/retry, haptics, smooth auto-scroll, citation resolution + deep-links, copy/share, 429 backoff, optional usage readout.
- **P7 Wiring** — Sidebar item + flagship Home tile + Dashboard `aiOpen` overlay; AI strings in **all six** i18n catalogs (keep parity test green); full a11y + reduce-motion.
- **P8 Validate** — `get_errors` clean → `jest` green (providers/retrieval/topic-guard) → tsc clean → offline iOS export `EXIT=0` → device test.

#### Track 2 — Backend + database *(end-state)*

- **B0** Proxy API (Cloudflare Workers / Node) — hides a server key, streams SSE, **free tier**, per-user rate limits + cost metering.
- **B1** Auth (anonymous device tokens → optional accounts; shares the F18 Track-2 backend / replaces mock auth).
- **B2** Server-side RAG — the *full* corpus + a **vector DB** (pgvector / managed) with real embeddings + reranking.
- **B3** Cloud sync — conversations across devices (SQLite ⇄ Postgres), share/export.
- **B4** Central guardrails — server-enforced system prompt + moderation + prompt updates without an app release.
- **B5** Analytics & safety — abuse detection, thumbs feedback loop, quality dashboards.
- **B6** Managed models — you choose/rotate models; users no longer need their own key.

**Data model (device):** `conversations(id,title,model,pinned,createdAt,updatedAt)` · `messages(id,convId,role,content,citationsJson,tokens,createdAt)` · FTS on `messages.content`.

**Risks & mitigations:** key security → SecureStore only, masked, "test key", never logged/exported; hallucinated rulings → RAG + citations + scholar-deferral + no-fatwā policy; streaming in Expo Go → P0 spike + `react-native-sse` fallback; cost/abuse → user's own key in Track 1, metering in Track 2; prompt injection → user text can never override system/grounding.

---

## Phase G — The Sīrah  ★★ *flagship*

### F20 · The Sīrah — the authenticity-graded life of the Prophet ﷺ  ✅ *Track 1 shipped*

A dedicated, reverent journey through the life of the Prophet ﷺ that **elevates the F12 mini-timeline into the app's definitive Sīrah**. Every event is **authenticity-graded** (established → well-supported → reported → weak → disputed) and **cited to its sources**, so the reader learns the sīrah the way the muḥaddithūn transmitted it — never presenting a weak report as established. This grading discipline (the same doctrine behind F18 Hadith) is the differentiator: most sīrah apps retell stories uncritically; Adl teaches provenance. Content is authored **in-house**, cross-linked to the Qurʾān reader and the F18 hadith library via **tappable evidence chips**, and grounds the F19 ADL AI.

**Why this isn't just a timeline.** Eight eras, 34 graded events, 18 companions/family with bios, a daily "moment from the Sīrah", search, bookmarks, and per-event lessons — every screen carries a grade badge and a sources footer, and a doctrine sheet explains the four-tier source hierarchy and the honest disclaimer that weak reports are labelled, not hidden.

**Locked decisions.** Grade *every* event (authenticity is the product, not a footnote); author content in-house and cite it (Qurʾān → Bukhārī/Muslim → al-Raḥīq al-Makhtūm / al-ʿUmarī / Mahdī Rizqullāh → Ibn Kathīr / Ibn Hishām); reuse the F12 `LessonBlock`/`Daleel` renderer for bodies; PURE↔NATIVE split (corpus + logic in `lib/sirah.ts`, tested; progress in a hook); files ≤500 lines; verify every lucide icon; fully offline (no network at all — this is pure bundled scholarship).

#### Track 1 — On-device, authored corpus *(build now)*

- **P0 Foundations** — lock the era model (8 eras: pre-prophethood → revelation → Makkan trials → Hijrah → Madīnah → battles → conquest → farewell), the five-tier grade scale + tones, the four-tier source hierarchy, and the disclaimer copy; decide reuse of `LessonBlock`/`Daleel` from F12 and cross-linking contract into F2 Qurʾān + F18 Hadith.
- **P1 Content types** — `content/sirah/types.ts`: `SirahEra`, `SirahGrade`, `SourceRef`, `AyahRef`, `HadithRef`, `SirahEvent` (id/order/era/yearLabel/hijri/title/arabic/place/geo/summary/body/grade/gradeNote/sources/quranRefs/hadithRefs/people/lessons/tags), `SirahPerson`, `SirahEraMeta`.
- **P2 Corpus** — `content/sirah/eras.ts` (era metadata + `SIRAH_SOURCES` hierarchy + `SIRAH_DISCLAIMER`); `people.ts` (18 companions/family, bios); six event files (`preRevelation`, `makkah`, `makkanTrials`, `hijrahMadinah`, `battles`, `conquestFarewell` = 34 events, each graded, sourced, cross-linked); `index.ts` barrel (`SIRAH_EVENTS` sorted, `sirahEventById`, `FIRST_EVENT_ID`).
- **P3 Logic (PURE, tested)** — `lib/sirah.ts`: `gradeMeta`/`gradeLabel`/`isEstablished` (rank scale), `eventsByEra`, `groupedByEra`, `eventsWithPerson`, `searchSirah` (diacritic-insensitive, reuses `normalizeText`/`queryTokens` + body text), `sirahOfDay` (deterministic day-of-year); `__tests__/sirah.test.ts` (corpus integrity, unique ids/ordering, grades, real people/eras, resolvers, grouping, search, event-of-day).
- **P4 Progress** — `hooks/useSirahProgress.ts` (`adl.sirah.v1`: read set, bookmark set, last event; `markRead`/`toggleBookmark`/`reset`).
- **P5 UI** — `components/sirah/`: `SirahGradeBadge` (per-grade icon + tone), `SirahEvidence` (Qurʾān/hadith chips → deep-links), `SirahTimeline` (era-grouped vertical rail with per-node grade), `EventOfDayCard` (daily hero), `SirahPersonSheet` (bio bottom-sheet); `screens/SirahEventScreen.tsx` (full event: grade, `LessonView` body, evidence, people chips, lessons, sources footer, prev/next, auto-mark-read); `screens/SirahJourneyScreen.tsx` (hub: search, event-of-day, era switcher + "★ Saved", timeline, doctrine/sources modal, person sheet).
- **P6 Grounding & cross-links** — evidence chips deep-link into F2 Qurʾān + F18 Hadith; upgrade F19 ADL AI retrieval to ground in the **graded** Sīrah corpus (citation `sirah:<id>`, grade in the source label) — replacing the F12 mini-timeline grounding.
- **P7 Wiring** — Sidebar `sirah` item (Footprints) in the knowledge cluster after Hadith; flagship Home tile; Dashboard `sirahOpen` overlay + navigate case; `nav.sirah` + `home.sirah.*` in **all six** i18n catalogs (parity test stays green).
- **P8 Validate** — `get_errors` clean → `jest` green (sirah corpus/logic) → tsc clean → offline iOS export `EXIT=0` → device test.

#### Track 2 — Enrichment *(end-state)*

- **B0** Map view — plot event `geo` on an offline Ḥijāz map (Makkah ↔ Madīnah ↔ Badr ↔ Uḥud ↔ Ṭāʾif) with an era timeline scrubber.
- **B1** Deepen the corpus — expand toward 60–80 events, add campaigns/delegations, full isnād notes, and a scholar-reviewed grading pass.
- **B2** Family & companion tree — an interactive genealogy linked into events.
- **B3** Narrated Sīrah — optional audio per era (licensing-gated, like adhān audio).
- **B4** Cross-feature threads — link each event to its Qurʾān revelation occasion (asbāb al-nuzūl) and the hadith it appears in.

**Data model (device):** `SirahEvent` corpus is bundled/static; progress persists as `adl.sirah.v1 { readIds[], bookmarkIds[], lastEventId }`.

**Risks & mitigations:** presenting weak reports as fact → grade *every* event + honest disclaimer + weak labelled, never hidden; source credibility → four-tier hierarchy cited on every event; scope creep → 34 curated events now, expand in Track 2; duplication with F12 → F12 stays as an in-context Learn timeline, F20 is the dedicated graded journey and the AI's Sīrah source of truth.

---

## Recommended Build Order

`F4` → `F1` → `F2` → `F3` → `F7` → `F10` → `F11` → `F8` → `F13` → `F12` → `F17` → `F14` → `F15` → `F18` → `F19` → `F20`

*Shipped so far: `F4`, `F1`, `F2`, `F3`, `F7`, `F10`, `F11`, `F8` (Qurʾān recitation; adhān-audio deferred on licensing), `F13`, `F12`, `F17`, `F14`, `F15`, `F18` (Hadith Library — Track 1 local-first), `F19` (ADL AI — Track 1 on-device, BYO-key), `F20` (the Sīrah — Track 1 authored, authenticity-graded). (`F9` and `F16` removed from scope.)*

Rationale: F4 establishes the counter primitive; F1 is the highest-impact flagship; F2–F3 round out the daily core; F7 is the big lift once patterns are proven; engagement (F10) reuses the F2/F4 pools that now exist; F11 builds on the prayer-times engine; F8 (audio) is last in this band because it adds a new native module + asset sourcing; the cross-cutting items (F14–F15) come last.

## Decisions to Lock Before Coding

1. **Qurʾān translation source** (e.g. Saheeh International) + **tafsīr in v1 or later** + bundle-size budget.
2. **Audio strategy** — bundle vs. optional download vs. stream (affects the "fully offline" claim).
3. **i18n timing** — English-first then retrofit (recommended) vs. i18n-first.
4. **Hadith data source & grading (F18)** — license-clean open datasets (e.g. the fawazahmed0 hadith-api on jsDelivr) + cited graders; bundle an authentic core, download the rest; **"Authentic only" default**; never surface weak/fabricated as authoritative.
5. **AI provider & key model (F19)** — **bring-your-own-key** (stored in `expo-secure-store`) via a provider-agnostic layer now; a proxy backend later. Islamic-only via layered guardrails; grounded in the app's own corpus (RAG) with tappable citations; **never a definitive fatwā**, always defer to scholars.

---

## Current Surface (already shipped)

- **Prayer times** — next prayer + countdown, official sources, elevation, calculation methods, city picker, adhān notifications.
- **Prayer tracker** — log the five daily prayers, streaks, 14-day trend, stats, Qaza ledger.
- **Qibla** — live compass.
- **Wudū guide** — evidence-cited step-by-step.
- **Ṣalāh guide** (F1) — the prayer posture-by-posture, recitations + daleel, per-prayer rakʿah runner.
- **Tasbīḥ counter** (F4) — presets, milestone haptics, lifetime total.
- **Adhkār** (F2) — Fortress of the Muslim: morning, evening, after-ṣalāh, sleep & waking; tap-to-count with progress + daily streak, evidence-cited.
- **Duʿāʾ library** (F3) — 48 authentic supplications across 12 themed sections (daily life, mosque, travel, nature, distress, forgiveness, protection, guidance, provision, health, Qurʾān, prophetic); diacritic-insensitive search, favourites, evidence-cited.
- **Sunnah / devotional** — voluntary windows + the three forbidden times.
- **Hijri calendar** — month grid + monthly times table + log overlay.
- **Zakat** — calculator, niṣāb gauge, ḥawl, metals, wizard, worksheet, daleel.
- **Fasting** — Ramadan + voluntary, ledger, qaza, fidyah/kaffārah, Laylat al-Qadr, Eid, Ashra.
- **Pilgrimage** — ʿUmrah + Ḥajj Manāsik, cinematic guided journey.
- **Qurʾān reader** (F7) — the full offline muṣḥaf: 114 surahs / 6236 āyāt (Uthmani Ḥafṣ), Saheeh International translation + transliteration; Surah/Juzʾ index with forgiving search, resume card, Amiri/Scheherazade fonts with size stepper, translation/transliteration toggles, ayah bookmarks & share.
- **Qurʾān khatm** — pace/completion planner; the card now opens the reader.
- **Auth / legal / splash.**
