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

### F14 · Multi-language UI + RTL *(cross-cutting)*

- i18n string catalog, Arabic/Urdu interface, RTL layout. Introduce a `t()` helper + locale hook; audit hardcoded strings. **Do after the feature set stabilizes.**

### F15 · Mosque / Halal Finder *(the one networked feature)*

- Location-based nearby mosques + prayer-friendly/halal places (existing location stack + a maps/places API). Isolated module; degrades gracefully offline.

### F17 · Themes & Accessibility

- Optional light mode, Arabic font scaling, dynamic type, contrast. Cross-cutting on `theme/tokens.ts` (introduce a theme context).

---

## Recommended Build Order

`F4` → `F1` → `F2` → `F3` → `F7` → `F10` → `F11` → `F8` → `F13` → `F12` → `F17` → `F14` → `F15`

*Shipped so far: `F4`, `F1`, `F2`, `F3`, `F7`, `F10`, `F11`, `F8` (Qurʾān recitation; adhān-audio deferred on licensing), `F13`, `F12`. Next up: `F17` → `F14` → `F15`. (`F9` and `F16` removed from scope.)*

Rationale: F4 establishes the counter primitive; F1 is the highest-impact flagship; F2–F3 round out the daily core; F7 is the big lift once patterns are proven; engagement (F10) reuses the F2/F4 pools that now exist; F11 builds on the prayer-times engine; F8 (audio) is last in this band because it adds a new native module + asset sourcing; the cross-cutting items (F14–F15) come last.

## Decisions to Lock Before Coding

1. **Qurʾān translation source** (e.g. Saheeh International) + **tafsīr in v1 or later** + bundle-size budget.
2. **Audio strategy** — bundle vs. optional download vs. stream (affects the "fully offline" claim).
3. **i18n timing** — English-first then retrofit (recommended) vs. i18n-first.

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
