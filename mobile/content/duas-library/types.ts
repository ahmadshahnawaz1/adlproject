/**
 * types.ts — the data model for Adl's Duʿāʾ Library.
 *
 * A searchable, categorised collection of authentic supplications for the
 * situations of a believer's day and life: eating and dressing, the mosque,
 * travel, weather, distress, forgiveness, protection, guidance, provision,
 * health, and the great supplications of the Qurʾān and the Sunnah.
 *
 * Note on reuse: `Daleel` and `Dua` are declared here shape-compatible with the
 * Fasting and Pilgrimage hubs, so the existing <DaleelBlock> and <DuaCard>
 * components render this content unchanged (TypeScript structural typing). The
 * library's `Dua` is a *superset* — it adds a `category`, search `tags`, and an
 * optional `repeat` count and `virtue` — all of which a plain `Dua` consumer
 * simply ignores.
 *
 * Authenticity bar (matching wudū, ṣalāh, zakat, fasting and adhkār): every
 * supplication is cited to the Qurʾān or the Sunnah, with the narrator and grade
 * where applicable. Nothing here is a fatwa — see the disclaimer in index.ts.
 */

/** A single proof-text — Qurʾān or Sunnah. */
export type Daleel = {
  source: 'quran' | 'hadith';
  reference: string;
  narrator?: string;
  grade?: string;
  text: string;
};

/** The themed sections of the library. */
export type DuaCategoryId =
  | 'daily'
  | 'mosque'
  | 'travel'
  | 'nature'
  | 'distress'
  | 'forgiveness'
  | 'protection'
  | 'guidance'
  | 'provision'
  | 'health'
  | 'quran'
  | 'prophetic';

/**
 * A supplication in the library. A superset of the Fasting/Pilgrimage `Dua`
 * (adds `category`, `tags`, and optional `repeat`/`virtue`), so it renders in
 * <DuaCard> unchanged by structural typing.
 */
export type Dua = {
  id: string;
  category: DuaCategoryId;
  /** Short English name of the supplication. */
  title: string;
  /** The occasion — kept concise so it sits beside the title. */
  when: string;
  arabic: string;
  transliteration: string;
  translation: string;
  /** Lower-case search keywords: themes, situations and alternate names. */
  tags: string[];
  /** Optional repetition count (e.g. ×3, ×7). */
  repeat?: number;
  /** Optional one-line virtue or benefit. */
  virtue?: string;
  daleel?: Daleel;
};

/** A themed section of the library, shown as a card in the grid. */
export type DuaCategory = {
  id: DuaCategoryId;
  /** English section name. */
  title: string;
  /** Arabic section name. */
  arabic: string;
  /** One-line description of what the section holds. */
  subtitle: string;
  /** lucide-react-native icon name, resolved by <DuaCategoryGrid>. */
  icon: string;
};
