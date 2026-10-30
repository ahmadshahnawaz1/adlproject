/**
 * Locale tables for the Duʿāʾ Library, required lazily so only the active
 * language is ever loaded.
 *
 * Translate `title`, `when`, `translation` and `tags` only. The Arabic, the
 * transliteration and every citation stay as they are — see PROTECTED_FIELDS
 * in lib/contentI18n.
 */
import type { LocaleLoaders } from '../../../lib/contentI18n';
import type { Dua } from '../types';

/** The only fields of a duʿāʾ that may be translated. */
export const DUA_FIELDS = ['title', 'when', 'translation', 'tags'] as const satisfies readonly (keyof Dua &
  string)[];

export const DUA_LOCALES: LocaleLoaders = {
  ar: () => require('./ar').default,
};
