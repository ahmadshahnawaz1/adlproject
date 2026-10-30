/**
 * Tests for the pure auth-form helpers.
 */
import {
  avatarColorFor,
  hasErrors,
  initialsOf,
  normalizeEmail,
  passwordIssue,
  validateSignUp,
} from '../lib/auth/validation';

describe('normalizeEmail', () => {
  it('lower-cases and trims', () => {
    expect(normalizeEmail('  Ahmad@Adl.APP ')).toBe('ahmad@adl.app');
  });
});

describe('validateSignUp', () => {
  it('accepts a valid trio', () => {
    const errors = validateSignUp({ name: 'Ahmad Shahnawaz', email: 'ahmad@adl.app', password: 'supersecret' });
    expect(hasErrors(errors)).toBe(false);
  });

  it('flags each bad field', () => {
    const errors = validateSignUp({ name: 'A', email: 'nope', password: 'short' });
    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });

  it('requires at least 8 characters', () => {
    expect(passwordIssue('1234567')).toBeDefined();
    expect(passwordIssue('12345678')).toBeUndefined();
  });
});

describe('initialsOf', () => {
  it('takes first + last initials', () => {
    expect(initialsOf('Ahmad Shahnawaz')).toBe('AS');
  });
  it('handles a single name', () => {
    expect(initialsOf('Ahmad')).toBe('AH');
  });
  it('handles blanks', () => {
    expect(initialsOf('   ')).toBe('?');
  });
});

describe('avatarColorFor', () => {
  it('is deterministic and returns a hex colour', () => {
    const a = avatarColorFor('ahmad@adl.app');
    expect(a).toMatch(/^#[0-9A-F]{6}$/i);
    expect(avatarColorFor('ahmad@adl.app')).toBe(a);
  });
});
