# ADL — The Ultimate AI Islamic Assistant

> **Mission:** Build the greatest AI-powered Islamic assistant app in the world — engineered from day one to serve **3–4 billion users** with the **cleanest UI/UX ever shipped**.

---

## North Star

1. **Cleanest UI/UX in the world** — minimal, fast, accessible, beautiful, culturally rooted.
2. **Planet-scale** — every decision evaluated at 3–4B user scale (cost, latency, privacy, offline).
3. **Trustworthy by default** — privacy-first, source-cited Islamic content, no dark patterns.

---

## Core Engineering Rules (NON-NEGOTIABLE)

These rules apply to **every contributor — human or AI agent — in every commit**.

### 1. 500-Line File Limit
- **No source file may exceed 500 lines of code.** Hard cap.
- If a file would exceed 500 lines, **split it into smaller, single-responsibility modules** and link them from an index / barrel file (e.g. `index.ts`, `mod.rs`, `__init__.py`).
- Before editing: check current line count. After editing: verify the file is still ≤ 500 lines.
- Prefer composition over monoliths. Small files = reviewable, testable, scalable.

### 2. Context Compaction at ~50%
- When an AI assistant's context window reaches **~50% capacity**, it must:
  1. **Stop** new exploration.
  2. **Compact** — write a concise summary of state, decisions, and the remaining plan to session memory.
  3. **Continue** from the compacted summary.
- This keeps work coherent across long sessions and prevents context collapse.

### 3. UI/UX Bar
Every UI change must justify itself against:
- **Clarity** — one obvious next action per screen.
- **Speed** — sub-100ms interactions, instant perceived load.
- **Accessibility** — WCAG AAA where feasible, full keyboard + screen-reader support.
- **Localization** — Arabic-first, full RTL, 20+ languages on day one.
- **Cultural sensitivity** — respectful Islamic aesthetics, no haram imagery, calm typography.
- **Mobile-first & offline-first** — works on a low-end Android on 2G.

### 4. Scale Mindset
- Design for **3–4B users** from the first line of code: edge-first, CDN-cached, stateless where possible.
- **Privacy by default.** No tracking beyond what is strictly essential. No selling data, ever.
- Cost-per-user must stay viable at global scale.

### 5. Workflow Discipline
- **Read before editing.** Edit existing files before creating new ones.
- Keep diffs minimal and reviewable.
- Don't add features, comments, or abstractions that weren't requested.
- Every new module must have a clear single responsibility.

### 6. Brand Cardinal Principles (LOCKED)
- **The logo ALWAYS glows.** The عدل + crescent brand mark is always breathing (gentle opacity glow) wherever it appears — splash, headers, anywhere. It NEVER stops. Always use the shared `BrandMark` component, never a static logo.
- **English brand name is always "Adl"** — only the `A` is uppercase. Never "ADL". The Arabic wordmark is `عدل`.
- **Accent color = Apple Notes yellow `#FFD60A`**.
- The entire front-end is **shadcn/ui-inspired** (dark, near-black, zinc borders) from the auth screens onward.

### 7. The "npm" Command (HARD RULE)
- When the owner types **`npm`** (or asks to preview/run the app, get a QR, or says it's "offline"), it means **one thing**: start the Expo **public tunnel** and hand back a scannable QR.
- The exact command (run from `mobile/`):
  ```bash
  EXPO_NO_DEPENDENCY_VALIDATION=1 npx expo start --tunnel
  ```
- The terminal prints the QR and an `exp://….exp.direct` URL — surface both.
- If it fails with an **ngrok** error (`reading 'body'`, `remote gone away`, `failed to start tunnel`), that is a transient ngrok outage, **not the code** — just run the same command again until it connects.
- No log-parsing scripts, no LAN mode, no overcomplicating. Read the URL straight from the `Metro waiting on exp://…` line.

---

## For AI Assistants Working in This Repo

You are bound by the rules above. Specifically:

- Keep every file ≤ **500 lines**. Split and link when approaching the limit.
- At ~**50% context**, compact your working state to `/memories/session/` and continue.
- Treat UI/UX as a first-class engineering concern, not an afterthought.
- Assume **billions** of users will run your code. Optimize accordingly.
- Persist learnings and conventions to `/memories/repo/`.

These rules are also mirrored in `/memories/repo/adl-core-rules.md` so any AI agent picks them up automatically.

---

## Status

Project bootstrapping. Architecture, stack selection, and first vertical slice coming next.
