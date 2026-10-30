# Adl Supabase Backend: 100-Point Implementation Checklist

Status: planning only. Exactly 100 implementation tasks; none is marked complete. Supabase is the assumed backend, not an existing integration. This plan does not replace or undo the UI/UX work.

## Scope And Architecture

The current app has 44 files under [screens](screens), a separate [settings screen](components/settings/SettingsScreen.tsx), device-local accounts in [lib/auth/store.ts](lib/auth/store.ts), and per-user local persistence. The feature roadmap contains both shipped and proposed work; source code takes precedence over roadmap claims.

Target: Expo app -> existing feature hooks -> typed local repositories and a durable sync queue -> Supabase Auth, Postgres/RLS, Storage and narrowly scoped Edge Functions. Realtime signals changes; it is not the durable sync protocol. Published reference content is versioned and cached for offline use. Prayer calculations, sensor readings, animations and downloaded-file availability stay local.

Proposed table/function names below are design contracts, not claims that those resources already exist. Private rows belong to verified Supabase user IDs. Shared religious content is read-only to ordinary clients. Do not introduce public worship profiles, financial sharing, social features, payment processing or mandatory location history.

**Completion rule for every item:** identify its screen/control and owning hook; implement a typed contract or explicit local-only decision; provide migrations/policies where applicable; cover loading, empty, error, offline and retry states; attach automated evidence and relevant device checks. A database table without a working screen is not complete. Preserve every existing setting. Do not upload existing private data without explicit consent.

**Execution order:** complete 001-030 before enabling cloud writes; 031-040 before publishing remote content; connect 041-090 in dependency-sized batches; satisfy 091-100 before production rollout. Feature work can use existing bundled content while publication infrastructure is being built. All work remains subject to the repository's 500-line source-file limit.

## 01. Platform And Security Foundations

- [ ] 001. **Establish the full feature register.** Inventory every screen, settings category, sheet, action, hook, storage key, file cache and external API. Classify each as private synced data, public versioned content, device-only state or transient UI; record its owner and acceptance test. Done: every file/surface in the coverage index has a disposition, including legacy keys absent from the current migration array.

- [ ] 002. **Create isolated Supabase environments.** Configure local development, staging and production with separate project credentials, data, redirect URLs and deployment permissions. Select region, plan limits and residency from launch requirements rather than assuming global Postgres writes. Done: staging cannot read production, and development never uses real worship or financial records.

- [ ] 003. **Make schema changes reproducible.** Add versioned Supabase CLI migrations, deterministic synthetic seeds, extension declarations and compatible forward-repair procedures. Avoid dashboard-only schema edits and destructive migration shortcuts. Done: a clean local database and the previous release both migrate successfully in CI; schema drift fails the build.

- [ ] 004. **Add one typed mobile client.** Integrate the supported Supabase JavaScript client behind a single module and generated database types; validate environment configuration at startup. Only the project URL and publishable/anon client key may enter the app bundle. Done: missing configuration has a recoverable state, generated types match migrations, and no secret/service-role key is bundled.

- [ ] 005. **Separate database trust boundaries.** Expose only required schemas, tables and RPCs; isolate operational, billing, moderation and ingestion records. Give private entities constrained IDs, ownership, timestamps and explicit versions; validate JSON preference payloads rather than accepting arbitrary documents. Done: API schema/grant inspection exposes only the intended contract.

- [ ] 006. **Enforce owner isolation with RLS.** Use `auth.uid()` ownership checks for reads, inserts, updates and deletes, including `WITH CHECK`, child-parent ownership and immutable owner fields. Never authorize through client-writable profile metadata. Done: anonymous users and user B cannot read or mutate user A's records, even by guessing IDs or using direct REST calls.

- [ ] 007. **Harden RPCs, views and privileged code.** Prefer invoker rights; explicitly restrict function execution, validate authenticated identity and ownership, and use a fixed safe `search_path` for necessary definer functions. Ensure views cannot bypass underlying RLS. Done: direct invocation, forged owner parameters and privilege-escalation tests fail safely.

- [ ] 008. **Design Storage access by purpose.** Keep licensed public content releases separate from private user exports or optional uploads; apply bucket/object policies, owner paths, MIME/size limits and expiring signed URLs. Done: another user cannot list, overwrite or download private files; public buckets contain no personal data or secrets.

- [ ] 009. **Protect Edge Functions and background jobs.** Verify tokens server-side using supported Auth/JWT verification, authorize every request, validate inputs and external URLs, apply quotas/timeouts, and keep provider credentials in server secrets. Use signed webhooks and replay protection when needed. Done: unauthenticated, expired, oversized, replayed and cross-user requests are rejected without leaking internals.

- [ ] 010. **Define measurable service budgets.** Agree release targets for API latency, sync delay, availability, request sizes, retention, cost and recovery; estimate active devices and request/egress rates. Document connection, Realtime, Storage and Edge limits with a load-tested expansion path. Done: launch capacity is evidenced, not described as automatically supporting billions of users.

## 02. Authentication And Account Lifecycle

- [ ] 011. **Connect sign-up to verified identity.** Wire [screens/SignUpScreen.tsx](screens/SignUpScreen.tsx) to Supabase Auth, validated profile creation, email verification/resend and explicit consent versions. Keep unverified users out of private cloud data. Done: duplicate requests, existing email, mail failure, app restart and partially created profiles have tested, non-enumerating recovery paths.

- [ ] 012. **Connect sign-in and displayed providers.** Wire [screens/SignInScreen.tsx](screens/SignInScreen.tsx) to real Auth sessions; inventory every displayed social/provider button and configure its actual native callback flow if offered. Apply rate limits and accessible errors. Done: successful, cancelled, invalid, unverified and rate-limited attempts work without silently creating a second identity.

- [ ] 013. **Restore sessions without blocking offline launch.** Replace local session-ID authority in [contexts/AuthContext.tsx](contexts/AuthContext.tsx) with supported token persistence, refresh rotation, app-state handling and auth subscriptions. Validate SecureStore size/lifecycle constraints on target devices. Done: expired online credentials cannot authorize cloud writes, while a locally unlocked user can still read their own offline data.

- [ ] 014. **Implement secure auth callbacks.** Register only approved native/web redirect destinations; use supported PKCE/state handling for applicable flows and distinguish verification, OAuth and recovery callbacks. Resume the intended safe route after authentication. Done: cold start, warm start, cancelled flow, reused callback and malicious redirect tests pass without tokens appearing in logs.

- [ ] 015. **Connect forgotten-password recovery.** Adapt [screens/ForgotPasswordScreen.tsx](screens/ForgotPasswordScreen.tsx) to the approved Supabase recovery flow with generic email responses, throttled resends, expiry and an authenticated password-update step. Done: expired/reused links, offline submission and wrong-device callbacks are handled; plaintext passwords never reach app tables or telemetry.

- [ ] 016. **Preserve recovery-code functionality safely.** Give [screens/RecoveryCodeScreen.tsx](screens/RecoveryCodeScreen.tsx) an explicit cloud recovery contract; do not assume Supabase accepts the existing offline codes. If custom codes remain, build server-verified, hashed, single-use, rate-limited rotation with security review. Done: concurrent redemption yields one success; old local codes cannot claim an existing cloud account.

- [ ] 017. **Migrate local identities and data deliberately.** Map legacy non-UUID IDs to a verified cloud identity only after local unlock and explicit import approval. Preserve all local records and create a resumable, idempotent import manifest with counts and rollback backup. Done: no local password hash or recovery secret is uploaded, and matching an email alone never proves cloud ownership.

- [ ] 018. **Make sign-out and account switching safe.** Stop subscriptions, uploads, streams and auth refreshes for the old user; isolate queued mutations and caches by immutable account scope. Offer clear handling of unsynced work and local/global session revocation. Done: a delayed response from account A cannot appear in or upload through account B's session.

- [ ] 019. **Secure profile and credential updates.** Connect account name/avatar color, verified email changes and password changes to their proper profile/Auth APIs; require recent authentication for sensitive changes. Never update email authority by editing a profile row. Done: failed verification preserves the previous account, duplicate identities are handled and active-session behavior is documented.

- [ ] 020. **Delete accounts across every data store.** Add recent-auth confirmation and a resumable deletion workflow covering database rows, Storage, AI history, device tokens, local keys, queues and Auth identity. Publish retention/backup exceptions and stop new writes immediately. Done: interrupted deletion resumes, no orphaned personal objects remain, and stale devices cannot resurrect deleted data.

## 03. Offline Persistence And Synchronization

- [ ] 021. **Introduce repositories behind existing hooks.** Keep components independent of Supabase queries; define typed read/mutate/subscribe contracts for the hooks under [hooks](hooks). Use existing pure calculation libraries unchanged where possible. Done: repository tests run with a fake backend, and cached feature screens render without an initial network request.

- [ ] 022. **Build durable local transactions and an outbox.** Select a supported transactional local store for new synchronized data and migrate legacy AsyncStorage safely. Commit the local mutation and its queued operation atomically with user/device IDs, schema version and an idempotency key. Done: force-closing the app cannot save a visible change while losing its upload operation.

- [ ] 023. **Implement authoritative incremental sync.** Define paginated pull/push contracts with server-controlled versions, durable deletion records and a cursor/snapshot protocol that cannot miss late-committing transactions. Do not rely on client clocks or a naive `updated_at > lastSeen` query. Done: concurrent writes and page-boundary commits are eventually delivered exactly once logically.

- [ ] 024. **Handle retries and connectivity honestly.** Classify authentication, validation, quota, conflict and transient failures; use bounded exponential backoff with jitter and a visible retry path. Respect account scope and `syncEnabled`; resume on supported connectivity/app lifecycle events. Done: airplane mode, timeouts and process restarts preserve edits without retry storms or infinite spinners.

- [ ] 025. **Make writes idempotent and versioned.** Enforce owner-scoped operation IDs, unique natural keys and expected-version checks inside transactional server operations. Return accepted versions and actionable conflicts. Done: repeating a request after a lost response does not duplicate gifts, recitations, review attempts, counter increments or completed worship entries.

- [ ] 026. **Specify conflicts by data type.** Use mergeable events for counters, explicit set/unset semantics for bookmarks and checklists, field-aware preferences and conflict review for financial edits. Define stable ordering for chats/menu items and clock-skew behavior. Done: two-device edit/delete/reorder scenarios converge according to documented rules rather than one blanket last-write-wins policy.

- [ ] 027. **Make deletion and reset durable.** Sync tombstones and scope-level reset generations; prevent delayed older writes from restoring cleared history, goals or preferences. Retain deletion evidence for the supported offline window and require a full rebase afterward. Done: an old offline device reconnects without undoing a reset or restoring a deleted record.

- [ ] 028. **Use Realtime only as an accelerator.** Subscribe only to authorized, active user scopes; invalidate or fetch durable deltas rather than treating socket events as the only data source. Reauthorize on refresh and dispose on sign-out/background transitions as appropriate. Done: missed, duplicate and out-of-order events still converge after reconnect without cross-user delivery.

- [ ] 029. **Expose one coherent sync state.** Provide per-feature pending/error/conflict status and a Settings summary without blocking reading, counting or calculations. Distinguish saved-on-device from synced-to-cloud. Done: optimistic failures can be retried or resolved, and every control uses the same accessible, localized state vocabulary.

- [ ] 030. **Normalize IDs, dates and validation.** Specify UTC instants versus local civil dates, IANA zones, Hijri provenance, prayer/verse identifiers and exact currency representations; generate runtime validators alongside types. Done: DST, midnight, travel, malformed payloads and old-client schema versions cannot silently move worship or finance entries to the wrong day.

## 04. Published Content And Downloads

- [ ] 031. **Create a governed content registry.** Track source, license, attribution, language, scholarly review, content hash and release status for every corpus under [content](content). Separate immutable source text from translation/editorial interpretation. Done: unpublished or unlicensed assets cannot become client-readable releases.

- [ ] 032. **Publish the Quran catalog accurately.** Model surahs, ayah references, juz/page mappings, Arabic text, transliteration and translation editions; preserve canonical numbering and the shipped offline corpus. Done: the 114-surah/6,236-ayah checks and edition integrity tests pass before any release is published.

- [ ] 033. **Publish tafsir, word and tajweed metadata.** Link tafsir passages, word-by-word data and tajweed annotations to valid verse/edition references with language/script metadata and source provenance. Done: missing annotations degrade gracefully, invalid references are rejected and caches are invalidated by content version rather than app reinstall.

- [ ] 034. **Publish recitation manifests.** Record licensed reciters, per-ayah/surah URLs, supported bitrates, byte sizes/checksums and availability; keep unverified adhan audio out of releases. Done: unavailable media has a retry/fallback state, remote URLs are allowlisted, and a user's downloaded files remain a device-local fact.

- [ ] 035. **Publish the graded hadith corpus.** Model collections, editions, chapters, canonical references, translations, narrators, isnad and grader-attributed authenticity. Preserve differing scholarly gradings and edition numbering. Done: authentic-only filters behave consistently, weak/disputed material keeps its warning and no import silently promotes authenticity.

- [ ] 036. **Version devotional and learning content.** Cover adhkar, duas, divine names, lessons, learning tracks, sirah events/people, wudu/salah guidance, pilgrimage rites and Ramadan/Jumuah/Eid material. Done: existing IDs remain stable or have migration aliases, all evidence links resolve, and updates do not erase user completion.

- [ ] 037. **Support multilingual reference search.** Provide indexed Arabic/translation/transliteration search, diacritic-aware normalization, reference lookup and bounded cursor pagination, starting with Postgres capabilities measured against corpus size. Keep local search for downloaded data. Done: language fixtures and predictable offline fallback pass without shipping private search history by default.

- [ ] 038. **Ship versioned offline bundles.** Publish manifests with immutable versions, hashes, sizes, minimum schema compatibility and atomic activation; serve public licensed assets through appropriate caching/CDN delivery. Done: interrupted/corrupt downloads retain the prior usable release and hash validation happens before activation.

- [ ] 039. **Separate download intent from device inventory.** If users opt in, sync preferred editions/reciters, not filesystem paths or false downloaded flags. Honor Wi-Fi-only choices, cancellation, retry, free-space checks and deletion in both libraries. Done: a second phone displays available downloads accurately without pretending it already has another device's files.

- [ ] 040. **Make content releases reversible.** Build a restricted review/publish pipeline with audit records, provenance checks, staged release and manifest rollback; bound operational payloads and keep long imports out of request-limited functions. Done: a bad release can be withdrawn while prior offline content and stable citations continue to work.

## 05. App Shell And Daily Worship

- [ ] 041. **Connect launch, dashboard, home and menu.** Reconcile cached auth/settings without prolonging the splash; derive Home cards from shared repositories and sync sidebar order/pins with stable IDs. Keep drawer/overlay state and animations local. Done: Home, dashboard and sidebar reflect the same account immediately and remain usable during backend downtime.

- [ ] 042. **Connect Prayer and its settings sheets.** Sync calculation method, madhhab, high-latitude/polar rules, adjustments, chosen location preferences and notification choices using validated schemas. Continue calculating times locally. Done: Prayer, Home, Calendar, fasting and Tahajjud share the same resolved settings and produce matching results after another-device changes.

- [ ] 043. **Connect Tracker and qaza accounting.** Model per-day/per-prayer statuses and qaza balances/completion events with deduplication, edit/reset history and owner isolation. Derive streaks, grids, totals and trends from the same records. Done: repeated taps, offline backfills and two-device corrections cannot double-count or make balances invalid.

- [ ] 044. **Define Qibla and location boundaries.** Keep compass sensors, heading calibration and current coordinates local; sync a manually selected city only under an explicit preference. Support denied permission and cached/manual locations. Done: Qibla works without Supabase, coordinate history is not retained and location changes update dependent calculations consistently.

- [ ] 045. **Connect Sunnah's dependent features.** Use the shared prayer, night-window and published devotional sources for Sunnah windows and its Wudu/Tahajjud links; persist only existing preferences or actions that genuinely need cross-device continuity. Done: the screen shows the same times/content as its destinations and requires no duplicate worship database.

- [ ] 046. **Connect Calendar consistently.** Combine local Gregorian/Hijri calculations, selected month, prayer data, regional conventions and versioned event metadata. Keep navigation transient unless explicitly saved. Done: month boundaries, regional date adjustments and links use the same calendar rules as fasting, Ramadan, Jumuah and pilgrimage.

- [ ] 047. **Connect Wudu and Salah guides.** Serve versioned steps, recitations, differences of opinion and evidence from the shared content layer; keep gesture/animation state local. Persist resume/prayer selection only if a durable preference is required. Done: every step, information sheet and reference works offline and content updates preserve valid positions.

- [ ] 048. **Connect Tasbih without network-per-tap writes.** Persist counts locally immediately, batch owner-scoped session events, and sync presets/targets/history with additive idempotent semantics. Keep haptics local. Done: fast taps, reset, target changes, app termination and parallel devices produce correct lifetime totals without excessive database writes.

- [ ] 049. **Connect Adhkar and Dhikr goals.** Sync per-day/category counts, completion, goal configuration and reset semantics; aggregate Tasbih and Adhkar activity once for the hub, Home streak and trend chart. Done: day rollover and two-device counting preserve the documented goal/streak calculation without double counting.

- [ ] 050. **Connect Dua library favorites.** Store private, unique user/dua bookmark state with reversible removal; read categories, Arabic, transliteration, translation, repetition, virtues and evidence from published content. Keep searching and copy/share local. Done: favorites survive reinstall after sync, deleted favorites stay deleted and all existing category/search views remain offline-capable.

## 06. Reading, Study And Memorization

- [ ] 051. **Connect Quran hub and resume.** Sync last-read position with validated surah/ayah IDs and a deliberate device-conflict rule; preserve Surah/Juz browsing, search and resume navigation. Done: switching devices opens the intended verse, and invalid/retired targets recover to a usable reader instead of a blank screen.

- [ ] 052. **Connect reader bookmarks and actions.** Use private unique verse bookmarks and versioned reader preferences for fonts, size, spacing, themes, translations, transliteration, word-by-word, tajweed and tafsir. Copy/share stays explicit and local. Done: reader rows, action sheets and bookmark lists stay consistent without uploading clipboard contents or transient selection state.

- [ ] 053. **Connect Quran library and playback preferences.** Wire editions, tafsir/word details, reciter selection and recitation downloads to tasks 032-039. Keep live playback, focus-mode chrome and native player lifetime local; sync only approved durable preferences. Done: stream/download/delete/cancel/error controls work and another device never inherits an invalid file path or player handle.

- [ ] 054. **Connect Hadith hub and bookmarks.** Combine daily content, collection/topic browsing, search, saved items and library entry with private bookmarks and a versioned publication ID. Done: a saved hadith resolves to the correct collection/edition and the default authenticity policy is unchanged across offline and online views.

- [ ] 055. **Connect Hadith collection and library flows.** Preserve chapter navigation, grading, narrator/isnad display, reader settings, copy/share and download/delete/storage controls. Validate edition compatibility before merging downloaded records. Done: missing editions offer a recoverable download path and filters/settings remain consistent between hub, collection and sheets.

- [ ] 056. **Connect Hifz planning and review.** Persist memorization units, target ranges, review attempts, ratings and scheduling inputs with deterministic derivations and validated verse bounds. Keep a durable attempt ID to avoid duplicate reviews. Done: offline practice, overdue reviews and two-device updates produce a consistent next-review queue without rewriting completed attempts.

- [ ] 057. **Connect the 99 Names and quiz.** Sync memorized/favorite sets and only the quiz progress/results the product intentionally retains; use stable name IDs and versioned explanations/references. Keep transient question selection local. Done: In order/Themes/Saved, detail actions and practice results agree, with the enumeration's scholarly caveat preserved.

- [ ] 058. **Connect Learn and the guided path.** Persist lesson/track completion and valid resume positions for the learning hub, lesson sheet and path runner. Reference content versions and route payloads for feature actions. Done: marking/unmarking lessons syncs correctly and every New Muslim path action opens its intended feature without losing progress.

- [ ] 059. **Connect Sirah journey and event detail.** Sync read/bookmarked event sets and resume state; version timelines, persons, grades, sources, lessons and previous/next relationships. Done: saved filters, person sheets and Quran/hadith links resolve to the correct records, preserving disputed/weak labels and progress during updates.

- [ ] 060. **Connect Quran khatm accounting.** Persist reading-plan targets and manual page/juz progress separately from mere reader position or bookmark state. Reuse the current calculation library for pace, remaining work and reset. Done: the fasting/Home plan surfaces agree and scrolling or audio playback cannot silently claim that a page was read.

## 07. Seasonal Worship, Travel And Finance

- [ ] 061. **Connect fasting logs and preferences.** Sync intention/status/date records, voluntary-fast preferences and relevant calculation/reminder settings; derive suhur/iftar/day progress locally from shared prayer data. Done: manual edits, future intentions, missed days and timezone changes display consistently in grids, times and history.

- [ ] 062. **Connect fasting ledger and notes.** Model missed/made-up days, reasons, fidyah/kaffarah inputs and notes with private access, validation and explicit reset rules; preserve authoritative evidence and differing rulings. Done: balances cannot be reduced twice and fasting-to-Zakat links carry the intended context without treating estimates as binding rulings.

- [ ] 063. **Connect Ramadan night's distinct state.** Persist taraweeh rakah counts, night habits and revived Qadr nights with an explicit sunset-based night identity separate from civil dates. Reuse fasting and khatm repositories. Done: odd-night highlights, checklist progress, ashra content and Fasting/Quran links remain correct around sunset and month boundaries.

- [ ] 064. **Connect Tahajjud preferences and reminders.** Sync enabled/mode/before-Fajr preferences but calculate night thirds locally and schedule on the authorized device. Surface permission and scheduling failures. Done: Home, Sunnah and Tahajjud agree on the window, and a settings change cancels/replaces the previous reminder rather than duplicating it.

- [ ] 065. **Connect pilgrimage journey state.** Persist journey type, rite/step progress, completed actions and existing preferences/notes for Hajj and Umrah; keep tawaf/sai/jamarat interactions responsive locally. Done: JourneyRunner resumes at a valid step, counters sync once, and switching/resetting a journey does not mix incompatible rite histories.

- [ ] 066. **Connect travel-mode preferences.** Sync deliberate travel records and user choices about dates, destinations and prayer accommodations, with location minimization and private ownership. Reuse the shared prayer/fasting settings resolver. Done: enabling, editing, ending and resetting travel mode updates affected screens without collecting a background movement trail.

- [ ] 067. **Connect Jumuah and Eid workflows.** Inventory the screen's actual checklists, preferences, guidance and date-dependent actions; persist intentional completion/settings against the correct local Friday or Eid identifier. Done: weekly/annual rollover resets only the correct period and source-backed guidance stays usable offline without inventing an attendance-tracking feature.

- [ ] 068. **Connect Zakat calculations and worksheet.** Sync private asset/liability inputs, method/currency/nisab/hawl choices and any retained notes through strict schemas; retain exact arithmetic and source/as-of metadata for valuations. Keep calculations offline. Done: wizard, worksheet, result, summary and reminder agree; no client-calculated result is used to initiate a payment.

- [ ] 069. **Connect Sadaqah and Zakat payment logs.** Persist exact amounts/currencies, categories, recipients, dates and notes with validated edits/deletes and idempotency; derive lifetime, hawl and category totals from one ledger. Done: result-card and history screens agree across devices; share/export is user-triggered and no bank/payment credentials are introduced.

- [ ] 070. **Keep Faraid private and reproducible.** Keep inheritance calculations local; explicitly decide whether user-requested saved scenarios need a private table rather than uploading transient family/estate inputs. Version calculation assumptions and preserve exclusions/disclaimers. Done: every supported scenario matches existing tests, and any save/delete/export path requires consent and owner isolation.

## 08. AI, Places And Ingredient Analysis

- [ ] 071. **Define managed AI and BYO-key boundaries.** Offer a deliberate migration from current device-only provider keys to an authenticated managed service; preserve the existing provider/key controls with truthful availability. Managed keys stay in server secrets; BYO keys remain local unless separately consented. Done: no key is stored in profiles, sync queues, exports or logs.

- [ ] 072. **Connect AI conversation management.** Store private conversations/messages, stable ordering/pins, titles, timestamps, status and citations with parent-owner constraints; support new/select/rename/pin/reorder/delete and bounded history/search. Done: deleted conversations stay deleted, local search works offline and one user cannot access another's thread through guessed message IDs.

- [ ] 073. **Implement reliable AI streaming.** Authenticate sends, allocate idempotent run IDs and stream bounded output with cancellation, retry/regeneration lineage and durable completion/failure status. Reconnect by run state rather than blindly charging a second request. Done: stop, disconnect, rate limit and app termination never duplicate user messages or misrepresent partial output as complete.

- [ ] 074. **Ground AI in governed sources.** Build a server-owned retrieval contract over approved Quran/hadith/dua/lesson/sirah material; use pgvector only where measured quality warrants it, with versioned chunks and reference validation. Treat retrieved text as untrusted instructions. Done: citations resolve to exact approved passages and weak/disputed material is not presented as authoritative.

- [ ] 075. **Enforce AI safety and spending limits.** Apply input/output controls, source/fatwa boundaries, server-controlled prompts/models and per-user token/cost/concurrency budgets before provider calls. Retain only necessary sanitized abuse records. Done: prompt-injection and quota tests pass, provider failures have usable UI states and private worship/finance data is never included in prompts implicitly.

- [ ] 076. **Connect places search through a bounded gateway.** Preserve mosque/halal filters, radius, manual city/GPS choice, retry, cached results and external directions. If proxying Overpass, allowlist endpoints, bound queries, deduplicate/cache public results and enforce attribution. Done: location permission refusal and upstream outage do not erase useful cached places or persist precise location history.

- [ ] 077. **Govern place freshness and claims.** Track public-source timestamps, coordinates, categorization and provenance; separate halal source tags from verified certification and display stale/uncertain states. Add corrections only if an actual reviewed workflow is approved. Done: nearby results are not presented as religious certification and stale caches expire predictably without collecting user visits.

- [ ] 078. **Connect ingredient-analysis rules.** Version the supported ingredient/code corpus, alternatives, evidence, uncertainty and school-sensitive cautions; preserve typed/pasted ingredient analysis and existing scanner states. Run current local matching offline. Done: unknown ingredients remain unknown rather than being guessed halal, and results retain the rule version used.

- [ ] 079. **Handle camera/OCR privacy explicitly.** Follow the existing capture/OCR boundary; use local processing where available, and require informed consent before any image/text is sent to a server/provider. For uploads, use private short-lived objects, metadata stripping, bounded processing and cleanup. Done: denied permission, failed OCR and interrupted uploads recover; packaging images never enter public buckets or training by default.

- [ ] 080. **Unify external-service failure contracts.** Define timeouts, cancellation, cache freshness, retry classes and user-safe errors for AI, content downloads, tafsir, audio, places and any OCR provider. Distinguish offline from unauthorized, unavailable and quota-exhausted. Done: each network action can fail independently without crashing or freezing unrelated offline screens.

## 09. Settings, Privacy And Cross-Screen Contracts

- [ ] 081. **Connect every profile field privately.** Cover username, bio, gender, date of birth, country, city and timezone from [lib/settings/types.ts](lib/settings/types.ts), plus account display fields via task 019. Make optional fields genuinely optional, validate locale/timezone values and minimize sensitive retention. Done: edits survive sync without turning profiles into a publicly searchable directory.

- [ ] 082. **Connect appearance preferences without overriding devices.** Cover theme mode, contrast, text scale, bold text and reduced motion across Settings and the Appearance sheet. Define account defaults versus device overrides and respect OS accessibility settings. Done: cloud hydration does not flash/reset the chosen theme or force another device's system appearance.

- [ ] 083. **Connect language and regional preferences.** Cover language, time/date format, first weekday, numeral system and timezone resolution across the Language sheet and settings category. Preserve all supported catalogs, script behavior and fallback logic. Done: profile, Prayer, Calendar, history dates and exports consistently reflect the same resolved locale rules.

- [ ] 084. **Connect every notification preference.** Cover enabled, sound, vibration, previews, badges, quiet hours/start/end, daily verse/hadith, streak/prayer reminders and pre-adhan minutes, plus feature-specific notification sheets. Separate desired settings from actual OS permission. Done: every toggle has a real applied behavior or a truthful unsupported state, never a silently ignored cloud value.

- [ ] 085. **Connect privacy/security preferences correctly.** Preserve app lock, biometric, auto-lock, app-switcher hiding, analytics, crash reports and personalization controls. Biometric material and unlock state stay device-only; local lock never substitutes for server authorization. Done: telemetry/personalization consent is enforced at collection time and changing account settings cannot remotely weaken a device's lock.

- [ ] 086. **Connect accessibility, sound and haptics.** Preserve larger touch targets, screen-reader hints, captions, haptics, in-app sounds and key sounds with documented account/device precedence. Apply each setting immediately in existing components and explain unavailable platform capabilities through states. Done: a sync update does not reset unrelated preferences and disabling an effect actually stops it.

- [ ] 087. **Connect Data and Storage controls end to end.** Implement sync-enabled, auto-backup and Wi-Fi-only behavior; accurate local/cloud storage usage; safe cache clearing; explicit reset; and authenticated machine-readable export/import. Backup means restorable data, not a cosmetic toggle. Done: disabling sync stops uploads, retries respect it, and cache clearing/export excludes secrets without discarding unsynced edits.

- [ ] 088. **Deliver reminders without duplicates.** Register per-user/device Expo/APNs/FCM endpoints only with consent, rotate/remove invalid tokens and process delivery receipts; schedule private content with quiet hours/timezone rules. Prefer local scheduling for prayer precision and deduplicate local versus remote notifications. Done: prayer, fasting, Tahajjud, Zakat, daily content and streak reminders cancel/reschedule correctly on edits and sign-out.

- [ ] 089. **Connect Legal and About surfaces.** Version terms/privacy/attribution documents, consent receipts and actual support/report/rating actions; preserve offline readable copies and do not force unrelated legal changes to block worship access. Done: sign-up and Settings show the same current documents, support uploads are consented/redacted and any external links are validated.

- [ ] 090. **Make every cross-feature link data-aware.** Extend the navigation contract with validated destination payloads where necessary: verse, hadith edition/reference, sirah event, lesson, plan or ledger context. Preserve back navigation and auth/unlock resumption. Done: Home/sidebar cards, AI/evidence citations, reminder taps and every sheet link open the intended record, not merely the destination's landing screen.

## 10. Verification, Operations And Release

- [ ] 091. **Automate the authorization matrix.** Add local Supabase/pgTAP or equivalent integration tests for every private table, child relation, view, RPC, bucket and Realtime channel using anonymous, owner, second-user, revoked and privileged contexts. Done: raw API bypass attempts fail and missing RLS/grants fail CI before deployment.

- [ ] 092. **Test every indexed UI/backend contract.** Exercise each screen, settings category and actionable sheet with empty/populated data, saving, conflict, 401/403/429/5xx, cancellation and denied permissions. Include screen-reader announcements, RTL and large text for new states. Done: the coverage register links each action to a passing test or recorded native-device acceptance result.

- [ ] 093. **Run a two-device destructive-sync suite.** Test offline edits, duplicate sends, out-of-order pages, concurrent resets/deletes, device clock skew, account switching, expired sessions and reconnect beyond tombstone retention. Include app termination during migration/outbox commit. Done: fixtures converge without data loss, resurrection, duplication or cross-account writes.

- [ ] 094. **Protect domain and content correctness.** Run existing prayer, calendars, fasting, finance, inheritance, Quran/hadith, language, auth and storage tests against the new repository adapters; add schema migration and malicious/corrupt-payload cases. Done: moving persistence does not alter established religious calculations, evidence, translations or precision.

- [ ] 095. **Measure database and sync performance.** Use representative tenant sizes and concurrent users; inspect RLS-aware query plans, pagination, indexes and pool limits. Bound history queries and Home aggregation; avoid N+1 access and downloading whole ledgers per screen. Done: agreed p95 budgets hold with realistic data and a documented migration/partitioning path where needed.

- [ ] 096. **Load-test expensive paths and cost controls.** Stress AI concurrency/cancellation, content egress, download retries, notifications, search and Realtime subscriptions under failure. Measure per-active-user cost and enforce admission/circuit-breaker limits. Done: a provider incident or retry storm cannot exhaust the month's budget or prevent basic private-data sync.

- [ ] 097. **Instrument reliability without exposing devotion.** Record sanitized request IDs, latency, sync backlog, errors, job age and aggregate cost; alert on auth, RLS, ingestion and deletion failures. Apply retention and consent controls; omit message bodies, secrets, precise locations and worship/financial payloads. Done: an incident can be traced without reconstructing a user's religious activity.

- [ ] 098. **Prove backup and recovery.** Configure plan-appropriate database backups/PITR and separate Storage-object/version recovery; document RPO/RTO, key access and restore procedures. Reapply the deletion ledger after restoration and verify exports independently. Done: a staging restore drill recovers representative accounts/content without resurrecting legally deleted data or assuming database backups include Storage files.

- [ ] 099. **Gate deployments and compatibility.** CI must validate migrations, generated types, RLS tests, functions, formatting, lint, TypeScript, Jest and production native exports. Deploy additive server changes before dependent clients; version contracts and retain old-client compatibility. Done: staging smoke tests pass and a failed rollout has a rehearsed, non-destructive rollback path.

- [ ] 100. **Release only with complete coverage evidence.** Reconcile all 100 items and the file/surface register against the current app; attach security review, content review, device tests, capacity/cost results and runbooks. Roll out cloud sync in consented cohorts behind a kill switch that preserves local operation. Done: no screen is marked connected solely because its table exists, and outstanding risks are explicitly accepted before production.

## Screen Coverage Index

Every current file in [screens](screens) is listed below. Numbers refer to the tasks above; shared security, sync and verification requirements apply to all rows. This is a routing/ownership index, not a claim that all code has already been audited or implemented.

| Existing Screen | Checklist Items |
| --- | --- |
| [screens/AIChatScreen.tsx](screens/AIChatScreen.tsx) | 071-075, 080, 090 |
| [screens/AdhkarScreen.tsx](screens/AdhkarScreen.tsx) | 036, 049, 084, 088 |
| [screens/CalendarScreen.tsx](screens/CalendarScreen.tsx) | 030, 042, 046, 083 |
| [screens/DashboardScreen.tsx](screens/DashboardScreen.tsx) | 013, 018, 041, 090 |
| [screens/DhikrHubScreen.tsx](screens/DhikrHubScreen.tsx) | 048-049, 088, 090 |
| [screens/DuaLibraryScreen.tsx](screens/DuaLibraryScreen.tsx) | 036-037, 050, 090 |
| [screens/FaraidScreen.tsx](screens/FaraidScreen.tsx) | 030, 070, 094 |
| [screens/FastingScreen.tsx](screens/FastingScreen.tsx) | 042, 060-063, 088, 090 |
| [screens/ForgotPasswordScreen.tsx](screens/ForgotPasswordScreen.tsx) | 014-016 |
| [screens/HadithCollectionScreen.tsx](screens/HadithCollectionScreen.tsx) | 035, 037-039, 054-055, 090 |
| [screens/HadithLibraryScreen.tsx](screens/HadithLibraryScreen.tsx) | 035, 038-039, 055, 080 |
| [screens/HadithScreen.tsx](screens/HadithScreen.tsx) | 035, 037, 054-055, 088, 090 |
| [screens/HalalScannerScreen.tsx](screens/HalalScannerScreen.tsx) | 078-080 |
| [screens/HifzScreen.tsx](screens/HifzScreen.tsx) | 032, 056, 090 |
| [screens/HomeScreen.tsx](screens/HomeScreen.tsx) | 041-042, 049, 054, 057, 059-060, 064, 090 |
| [screens/JourneyRunner.tsx](screens/JourneyRunner.tsx) | 036, 065 |
| [screens/JumuahScreen.tsx](screens/JumuahScreen.tsx) | 036, 046, 067, 088 |
| [screens/LearnPathScreen.tsx](screens/LearnPathScreen.tsx) | 036, 058, 090 |
| [screens/LearnScreen.tsx](screens/LearnScreen.tsx) | 036-037, 058-059, 090 |
| [screens/LegalScreen.tsx](screens/LegalScreen.tsx) | 011, 089 |
| [screens/MosqueFinderScreen.tsx](screens/MosqueFinderScreen.tsx) | 044, 076-077, 080 |
| [screens/NamesScreen.tsx](screens/NamesScreen.tsx) | 036, 057, 090 |
| [screens/PilgrimageScreen.tsx](screens/PilgrimageScreen.tsx) | 036, 046, 065 |
| [screens/PrayerScreen.tsx](screens/PrayerScreen.tsx) | 030, 042, 066, 084, 088 |
| [screens/QiblaScreen.tsx](screens/QiblaScreen.tsx) | 042, 044 |
| [screens/QuranLibraryScreen.tsx](screens/QuranLibraryScreen.tsx) | 032-034, 038-039, 053, 080 |
| [screens/QuranScreen.tsx](screens/QuranScreen.tsx) | 032, 037, 051-053, 090 |
| [screens/RamadanScreen.tsx](screens/RamadanScreen.tsx) | 036, 060-063, 090 |
| [screens/RecoveryCodeScreen.tsx](screens/RecoveryCodeScreen.tsx) | 015-017 |
| [screens/SadaqahScreen.tsx](screens/SadaqahScreen.tsx) | 030, 068-069, 087 |
| [screens/SalahGuideScreen.tsx](screens/SalahGuideScreen.tsx) | 036, 047, 090 |
| [screens/SignInScreen.tsx](screens/SignInScreen.tsx) | 012-014, 017-018 |
| [screens/SignUpScreen.tsx](screens/SignUpScreen.tsx) | 011, 014, 016-017, 089 |
| [screens/SirahEventScreen.tsx](screens/SirahEventScreen.tsx) | 036, 059, 090 |
| [screens/SirahJourneyScreen.tsx](screens/SirahJourneyScreen.tsx) | 036-037, 059, 090 |
| [screens/SplashScreen.tsx](screens/SplashScreen.tsx) | 013, 041 |
| [screens/SunnahScreen.tsx](screens/SunnahScreen.tsx) | 042, 045, 047, 064, 090 |
| [screens/SurahReaderScreen.tsx](screens/SurahReaderScreen.tsx) | 032-034, 051-053, 090 |
| [screens/TahajjudScreen.tsx](screens/TahajjudScreen.tsx) | 042, 064, 084, 088 |
| [screens/TasbihScreen.tsx](screens/TasbihScreen.tsx) | 048-049 |
| [screens/TrackerScreen.tsx](screens/TrackerScreen.tsx) | 030, 043, 087 |
| [screens/TravelScreen.tsx](screens/TravelScreen.tsx) | 030, 042, 044, 066 |
| [screens/WuduScreen.tsx](screens/WuduScreen.tsx) | 036, 047 |
| [screens/ZakatScreen.tsx](screens/ZakatScreen.tsx) | 030, 062, 068-069, 088, 090 |

## Supporting Surface Coverage

| Surface Or Owner | Checklist Items And Required Boundary |
| --- | --- |
| [components/settings/SettingsScreen.tsx](components/settings/SettingsScreen.tsx) | Profile 081; Account 018-020; Display 082; Language 083; Alerts 084/088; Privacy 085; Access/Sound 086; Data 087; About 089. |
| [components/ThemeSettingsSheet.tsx](components/ThemeSettingsSheet.tsx), [components/LanguageSheet.tsx](components/LanguageSheet.tsx) | 082-083; same preferences as Settings, with explicit device overrides. |
| [contexts/AuthContext.tsx](contexts/AuthContext.tsx), [contexts/SettingsContext.tsx](contexts/SettingsContext.tsx), [lib/auth/store.ts](lib/auth/store.ts) | 011-020, 081-087; never trust a local account ID as cloud authorization. |
| [lib/scopedStorage.ts](lib/scopedStorage.ts), [lib/scopeMigration.ts](lib/scopeMigration.ts) | 017-018, 021-030; inventory actual keys, not only the legacy migration list. |
| [hooks/useNavOrder.ts](hooks/useNavOrder.ts), [lib/navigation.ts](lib/navigation.ts) | 041, 090; sync menu preferences, not the transient overlay stack. |
| [hooks/usePrayerPrefs.ts](hooks/usePrayerPrefs.ts), [hooks/usePrayerLog.ts](hooks/usePrayerLog.ts), [hooks/useQazaLedger.ts](hooks/useQazaLedger.ts), [hooks/useTrackerPrefs.ts](hooks/useTrackerPrefs.ts) | 042-043; prayer settings, tracker grid, qaza card and reset controls. |
| [hooks/useNotificationPrefs.ts](hooks/useNotificationPrefs.ts), [hooks/useTahajjud.ts](hooks/useTahajjud.ts), [hooks/useZakatReminder.ts](hooks/useZakatReminder.ts) | 064, 084, 088; every settings/reminder sheet plus scheduling cancellation. |
| [hooks/useTasbih.ts](hooks/useTasbih.ts), [hooks/useAdhkarProgress.ts](hooks/useAdhkarProgress.ts), [hooks/useDhikrGoals.ts](hooks/useDhikrGoals.ts), [hooks/useDuaFavorites.ts](hooks/useDuaFavorites.ts) | 048-050; counter/preset/category cards, goals sheet, daily rollover and favorites. |
| [hooks/useQuranReader.ts](hooks/useQuranReader.ts), [hooks/useQuranBookmarks.ts](hooks/useQuranBookmarks.ts), [hooks/useQuranSettings.ts](hooks/useQuranSettings.ts) | 051-052; toolbar, ayah actions, settings, translation/word/tafsir sheets and bookmarks. |
| [hooks/useQuranDownloads.ts](hooks/useQuranDownloads.ts), [hooks/useQuranRecitationDownloads.ts](hooks/useQuranRecitationDownloads.ts), [hooks/useRecitationPlayer.ts](hooks/useRecitationPlayer.ts), [hooks/useHadithLibrary.ts](hooks/useHadithLibrary.ts) | 038-039, 053, 055; library/download/media controls distinguish cloud intent from actual files. |
| [hooks/useHadithBookmarks.ts](hooks/useHadithBookmarks.ts), [hooks/useHadithSettings.ts](hooks/useHadithSettings.ts) | 054-055; actions/settings sheets, grades, chapters, saved items and display toggles. |
| [hooks/useHifzProgress.ts](hooks/useHifzProgress.ts), [hooks/useNamesProgress.ts](hooks/useNamesProgress.ts), [hooks/useLearnProgress.ts](hooks/useLearnProgress.ts), [hooks/useSirahProgress.ts](hooks/useSirahProgress.ts) | 056-059; detail/quiz/lesson/person sheets, review controls, completion and resume. |
| [hooks/useQuranKhatm.ts](hooks/useQuranKhatm.ts), [hooks/useFastingLog.ts](hooks/useFastingLog.ts), [hooks/useFastingLedger.ts](hooks/useFastingLedger.ts), [hooks/useFastingPrefs.ts](hooks/useFastingPrefs.ts), [hooks/useRamadanLog.ts](hooks/useRamadanLog.ts) | 060-063; plan/ledger/notes/settings cards, month grids, fidyah/kaffarah and night checklists. |
| [hooks/usePilgrimageJourney.ts](hooks/usePilgrimageJourney.ts), [hooks/usePilgrimagePrefs.ts](hooks/usePilgrimagePrefs.ts), [hooks/useTravelMode.ts](hooks/useTravelMode.ts) | 065-066; journey select, rite counters, site map, notes and settings. |
| [hooks/useZakatWorksheet.ts](hooks/useZakatWorksheet.ts), [hooks/useCharityLog.ts](hooks/useCharityLog.ts) | 068-069; wizard, worksheet, result, nisab gauge, gift-entry sheet, filters and export. |
| [hooks/useChat.ts](hooks/useChat.ts), [hooks/useAISettings.ts](hooks/useAISettings.ts) | 071-075; composer, conversation list/dialogs, citations, key testing and provider/model controls. |
| [hooks/useLocation.ts](hooks/useLocation.ts), [hooks/useCompass.ts](hooks/useCompass.ts), [hooks/usePlacesFinder.ts](hooks/usePlacesFinder.ts), [hooks/useHalalScanner.ts](hooks/useHalalScanner.ts) | 044, 076-080; city picker, permissions, filters, offline status, directions and OCR. |
| [hooks/useAppLock.ts](hooks/useAppLock.ts), [hooks/useA11ySettings.ts](hooks/useA11ySettings.ts), [hooks/useResolvedSettings.ts](hooks/useResolvedSettings.ts) | 082-086; resolved device/account preferences and native enforcement, not just stored booleans. |

## Acceptance Evidence

For each numbered task, record an owner, dependency IDs, migration/API references, affected controls, automated test command/result and required device evidence before changing its checkbox. The feature register in 001 must expand the grouped supporting rows into individual controls; the 44-screen index alone is not sufficient feature coverage.

Supabase credentials, deployment, database migrations, third-party licenses, provider billing and native acceptance tests are future implementation work. This checklist does not claim an already deployed backend, verified scalability or completed screen integration.