/**
 * Retail barcode validation and normalisation.
 *
 * Every retail barcode carries a check digit. Validating it locally means a
 * misread from the camera is rejected here rather than quietly fetching a
 * different product's ingredients.
 */
export type BarcodeKind = 'ean13' | 'ean8' | 'upc_a' | 'upc_e';

const DIGITS = /^\d+$/;

function digits(value: string): number[] {
  return value.split('').map((c) => Number(c));
}

/**
 * Check digit for a body of digits, weighting from the right: the digit
 * immediately left of the check digit counts triple.
 */
function checkDigit(body: number[]): number {
  let sum = 0;
  for (let i = body.length - 1, weight = 3; i >= 0; i -= 1, weight = weight === 3 ? 1 : 3) {
    sum += body[i] * weight;
  }
  return (10 - (sum % 10)) % 10;
}

function validFixedLength(value: string, length: number): boolean {
  if (value.length !== length || !DIGITS.test(value)) return false;
  const d = digits(value);
  return checkDigit(d.slice(0, length - 1)) === d[length - 1];
}

export function isValidEan13(value: string): boolean {
  return validFixedLength(value, 13);
}

export function isValidEan8(value: string): boolean {
  return validFixedLength(value, 8);
}

export function isValidUpcA(value: string): boolean {
  return validFixedLength(value, 12);
}

/** Expand a zero-suppressed UPC-E code to its full 12-digit UPC-A form. */
export function expandUpcE(value: string): string | null {
  if (value.length !== 8 || !DIGITS.test(value)) return null;
  const system = value[0];
  if (system !== '0' && system !== '1') return null;
  const [d1, d2, d3, d4, d5, d6] = value.slice(1, 7).split('');
  const check = value[7];

  let middle: string;
  switch (d6) {
    case '0':
    case '1':
    case '2':
      middle = `${d1}${d2}${d6}0000${d3}${d4}${d5}`;
      break;
    case '3':
      middle = `${d1}${d2}${d3}00000${d4}${d5}`;
      break;
    case '4':
      middle = `${d1}${d2}${d3}${d4}00000${d5}`;
      break;
    default:
      middle = `${d1}${d2}${d3}${d4}${d5}0000${d6}`;
      break;
  }
  const upcA = `${system}${middle}${check}`;
  return isValidUpcA(upcA) ? upcA : null;
}

/**
 * Reduce any retail barcode to the 13-digit form Open Food Facts indexes on,
 * or null when the check digit fails.
 */
export function normalizeBarcode(value: string, kind?: BarcodeKind): string | null {
  const raw = value.replace(/\s|-/g, '');
  if (!DIGITS.test(raw)) return null;

  if (kind === 'upc_e' || (raw.length === 8 && !isValidEan8(raw))) {
    const expanded = expandUpcE(raw);
    return expanded ? `0${expanded}` : null;
  }
  if (raw.length === 8) return isValidEan8(raw) ? raw : null;
  if (raw.length === 12) return isValidUpcA(raw) ? `0${raw}` : null;
  if (raw.length === 13) return isValidEan13(raw) ? raw : null;
  if (raw.length === 14) {
    // GTIN-14 case codes carry a packaging digit in front of the retail code.
    const inner = raw.slice(1);
    return isValidEan13(inner) ? inner : null;
  }
  return null;
}

export function isSupportedBarcode(value: string, kind?: BarcodeKind): boolean {
  return normalizeBarcode(value, kind) !== null;
}
