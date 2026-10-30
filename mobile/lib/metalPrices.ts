/**
 * lib/metalPrices.ts — optional, one-tap online refresh of gold & silver
 * spot prices.
 *
 * Adl is offline-first: the calculator always works with the manual prices
 * stored on the device. This fetch is only ever triggered by an explicit user
 * tap. If there's no connection (or the service is down) it fails quietly and
 * the manual prices stay exactly as they were.
 *
 * Source: gold-api.com — a free, key-less spot-price endpoint that returns the
 * price per troy ounce in USD. We convert to a per-gram price.
 */

/** Grams in one troy ounce. */
const TROY_OUNCE_IN_GRAMS = 31.1034768;

const GOLD_URL = 'https://api.gold-api.com/price/XAU';
const SILVER_URL = 'https://api.gold-api.com/price/XAG';

export type MetalPrices = {
  goldPerGram: number;
  silverPerGram: number;
  /** USD per troy ounce, as returned by the source. */
  goldPerOunce: number;
  silverPerOunce: number;
  fetchedAt: string;
  source: string;
  /** The currency the source quotes in (USD for gold-api.com). */
  currency: string;
};

async function fetchOuncePrice(url: string): Promise<number | null> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return null;
  const json = (await res.json()) as { price?: number };
  const price = Number(json?.price);
  return isFinite(price) && price > 0 ? price : null;
}

/**
 * Fetch current gold & silver prices. Returns null on any failure so callers
 * can keep the user's manual prices. Quoted in USD per gram.
 */
export async function fetchMetalPrices(): Promise<MetalPrices | null> {
  try {
    const [goldOz, silverOz] = await Promise.all([
      fetchOuncePrice(GOLD_URL),
      fetchOuncePrice(SILVER_URL),
    ]);
    if (goldOz == null || silverOz == null) return null;
    return {
      goldPerGram: goldOz / TROY_OUNCE_IN_GRAMS,
      silverPerGram: silverOz / TROY_OUNCE_IN_GRAMS,
      goldPerOunce: goldOz,
      silverPerOunce: silverOz,
      fetchedAt: new Date().toISOString(),
      source: 'gold-api.com',
      currency: 'USD',
    };
  } catch {
    return null;
  }
}
