/**
 * Open Food Facts lookup.
 *
 * The network only ever supplies text. Everything that decides what a user is
 * told happens offline in assess.ts, so a bad or missing record degrades into
 * "we don't know" rather than a wrong answer.
 *
 * Data is licensed under the Open Database Licence and must be attributed
 * wherever it is shown.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeBarcode, type BarcodeKind } from './barcode';

const ENDPOINT = 'https://world.openfoodfacts.org/api/v2/product';
const FIELDS =
  'code,product_name,product_name_en,brands,quantity,ingredients_text,ingredients_text_en,image_front_small_url';
const REQUEST_TIMEOUT_MS = 12000;
const CACHE_KEY = 'adl.halal.cache.v1';
const CACHE_MAX_ENTRIES = 200;

export type Product = {
  barcode: string;
  name: string;
  brand: string;
  quantity: string;
  ingredientsText: string;
  imageUrl: string;
  fetchedAt: number;
};

export type LookupResult =
  | { status: 'found'; product: Product; fromCache: boolean }
  /** The record exists but carries no ingredients — very common. */
  | { status: 'no-ingredients'; product: Product; fromCache: boolean }
  | { status: 'not-found' }
  | { status: 'invalid-barcode' }
  | { status: 'error'; message: string };

type CacheMap = Record<string, Product>;

async function readCache(): Promise<CacheMap> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CacheMap) : {};
  } catch {
    return {};
  }
}

export async function loadCachedProduct(barcode: string): Promise<Product | null> {
  const map = await readCache();
  return map[barcode] ?? null;
}

/** Store a product, dropping the oldest entries beyond the cap. */
export async function saveCachedProduct(product: Product): Promise<void> {
  try {
    const map = await readCache();
    map[product.barcode] = product;
    const entries = Object.entries(map).sort((a, b) => b[1].fetchedAt - a[1].fetchedAt);
    const kept = entries.slice(0, CACHE_MAX_ENTRIES);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(kept)));
  } catch {
    // A cache failure must never break a lookup.
  }
}

export async function clearProductCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** Shape an Open Food Facts record into what we actually use. */
export function toProduct(barcode: string, raw: Record<string, unknown>): Product {
  return {
    barcode,
    name: str(raw.product_name_en) || str(raw.product_name) || 'Unnamed product',
    brand: str(raw.brands),
    quantity: str(raw.quantity),
    ingredientsText: str(raw.ingredients_text_en) || str(raw.ingredients_text),
    imageUrl: str(raw.image_front_small_url),
    fetchedAt: Date.now(),
  };
}

function classify(product: Product, fromCache: boolean): LookupResult {
  return product.ingredientsText
    ? { status: 'found', product, fromCache }
    : { status: 'no-ingredients', product, fromCache };
}

/**
 * Look a barcode up, preferring the cache so a repeat scan works with no
 * signal. `forceRefresh` re-fetches a product whose recipe may have changed.
 */
export async function lookupBarcode(
  value: string,
  opts: { kind?: BarcodeKind; forceRefresh?: boolean; signal?: AbortSignal } = {},
): Promise<LookupResult> {
  const barcode = normalizeBarcode(value, opts.kind);
  if (!barcode) return { status: 'invalid-barcode' };

  if (!opts.forceRefresh) {
    const cached = await loadCachedProduct(barcode);
    if (cached) return classify(cached, true);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  opts.signal?.addEventListener('abort', onAbort);

  try {
    const res = await fetch(`${ENDPOINT}/${barcode}.json?fields=${FIELDS}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Adl/1.0 (offline Islamic companion app)',
      },
      signal: controller.signal,
    });

    if (res.status === 404) return { status: 'not-found' };
    if (!res.ok) return { status: 'error', message: `Lookup failed (${res.status}).` };

    const json = (await res.json()) as { status?: number; product?: Record<string, unknown> };
    if (json.status === 0 || !json.product) return { status: 'not-found' };

    const product = toProduct(barcode, json.product);
    await saveCachedProduct(product);
    return classify(product, false);
  } catch (err) {
    const cached = await loadCachedProduct(barcode);
    if (cached) return classify(cached, true);
    if ((err as Error)?.name === 'AbortError') {
      return { status: 'error', message: 'The lookup timed out. Check your connection.' };
    }
    return {
      status: 'error',
      message: "Couldn't reach Open Food Facts. Check your connection, or enter the ingredients yourself.",
    };
  } finally {
    clearTimeout(timer);
    opts.signal?.removeEventListener('abort', onAbort);
  }
}
