/**
 * Exact rational arithmetic for farāʾiḍ.
 *
 * Inheritance shares are fractions (1/6, 2/3, 1/8...) and must stay exact —
 * floating point would drift and a rounded share divides a real estate wrongly.
 * Every value here is kept as a reduced integer numerator/denominator pair.
 */
export type Fraction = { n: number; d: number };

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

/** Build a reduced fraction. */
export function fr(n: number, d = 1): Fraction {
  if (d === 0) throw new Error('faraid: zero denominator');
  const sign = d < 0 ? -1 : 1;
  const g = gcd(n, d);
  return { n: (sign * n) / g, d: (sign * d) / g };
}

export const ZERO: Fraction = { n: 0, d: 1 };
export const ONE: Fraction = { n: 1, d: 1 };

export function add(a: Fraction, b: Fraction): Fraction {
  return fr(a.n * b.d + b.n * a.d, a.d * b.d);
}

export function sub(a: Fraction, b: Fraction): Fraction {
  return fr(a.n * b.d - b.n * a.d, a.d * b.d);
}

export function mul(a: Fraction, b: Fraction): Fraction {
  return fr(a.n * b.n, a.d * b.d);
}

export function div(a: Fraction, b: Fraction): Fraction {
  if (b.n === 0) throw new Error('faraid: divide by zero');
  return fr(a.n * b.d, a.d * b.n);
}

/** Negative when a < b, zero when equal, positive when a > b. */
export function cmp(a: Fraction, b: Fraction): number {
  return a.n * b.d - b.n * a.d;
}

export function isZero(a: Fraction): boolean {
  return a.n === 0;
}

export function sum(list: Fraction[]): Fraction {
  return list.reduce(add, ZERO);
}

export function toNumber(a: Fraction): number {
  return a.n / a.d;
}

/** "1/6", "2/3", "1" — the form a farāʾiḍ table is written in. */
export function format(a: Fraction): string {
  if (a.n === 0) return '0';
  if (a.d === 1) return String(a.n);
  return `${a.n}/${a.d}`;
}
