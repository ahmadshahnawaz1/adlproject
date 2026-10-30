/**
 * lib/auth/validation — pure helpers for the auth + profile forms. Reuses the
 * app's shared email check. No native imports, so it is fully unit-tested.
 */
import { isValidEmail } from '../validation';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export type FieldErrors = Partial<Record<'name' | 'email' | 'password', string>>;

export function validateName(name: string): string | undefined {
  const n = name.trim();
  if (n.length < 2) return 'Enter your name';
  if (n.length > 60) return 'Name is too long';
  return undefined;
}

export function validateEmailField(email: string): string | undefined {
  if (!email.trim()) return 'Enter your email';
  if (!isValidEmail(email)) return 'Enter a valid email address';
  return undefined;
}

export function passwordIssue(password: string): string | undefined {
  if (password.length < 8) return 'Use at least 8 characters';
  return undefined;
}

export function validateSignUp(fields: { name: string; email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {};
  const name = validateName(fields.name);
  if (name) errors.name = name;
  const email = validateEmailField(fields.email);
  if (email) errors.email = email;
  const password = passwordIssue(fields.password);
  if (password) errors.password = password;
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

const AVATAR_PALETTE = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#14B8A6', '#F97316'];

/** Deterministic avatar colour from a seed (name or email). */
export function avatarColorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

/** Up to two initials from a display name. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
