/**
 * i18n/index.ts — the locale registry and catalogue resolver.
 *
 * Registers every shipped language and resolves a locale code to a complete
 * message set by layering its (possibly partial) catalogue over the English
 * base, so a missing translation always falls back gracefully. Adding a new
 * language is a one-file change plus one entry here.
 */
import { en, type MessageKey, type Messages } from './locales/en';
import { ar } from './locales/ar';
import { ur } from './locales/ur';
import { fr } from './locales/fr';
import { id } from './locales/id';
import { tr } from './locales/tr';

export type { MessageKey, Messages };

/** A language the interface can be shown in. */
export type LocaleDef = {
  /** BCP-47 base code, e.g. 'ar'. */
  code: string;
  /** English name, e.g. 'Arabic'. */
  label: string;
  /** Endonym, shown in the picker, e.g. 'العربية'. */
  nativeLabel: string;
};

/** Every shipped language, English first. Extend by adding a catalogue + entry. */
export const LOCALES: LocaleDef[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia' },
  { code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe' },
];

export const DEFAULT_LOCALE = 'en';

/** Languages written right-to-left. */
export const RTL_LOCALES = ['ar', 'ur'] as const;

/** Whether a locale code is written right-to-left. */
export function isRTLLocale(code: string): boolean {
  return (RTL_LOCALES as readonly string[]).includes(code);
}

const CATALOGS: Record<string, Partial<Messages>> = { en, ar, ur, fr, id, tr };

/** Whether a code has a registered catalogue. */
export function isSupportedLocale(code: string): boolean {
  return code in CATALOGS;
}

/**
 * Resolve a locale code to a complete message set: the language's catalogue
 * layered over English, so every key always resolves. Unknown codes yield
 * plain English.
 */
export function getCatalog(code: string): Messages {
  const override = CATALOGS[code] ?? {};
  return { ...en, ...override };
}

/** Substitute `{name}` placeholders in a template from a params bag. */
export function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in params ? String(params[key]) : whole,
  );
}
