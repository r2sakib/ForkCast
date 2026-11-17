// services/open-food-facts.ts
// Talks to the public Open Food Facts API: https://openfoodfacts.github.io/openfoodfacts-server/api/
//
// This is a SEPARATE Axios instance from services/api.ts on purpose:
// api.ts adds our login token to every request, and that token must never
// be sent to a third-party server.
import axios from "axios";
import { Platform } from "react-native";
import { OffProduct } from "@/types/food";

// Open Food Facts asks every app to say who it is:  AppName/Version (contact e-mail)
// TODO: replace the e-mail with your team's real contact address.
const USER_AGENT = "ForkCast/1.0 (forkcast.team@example.com)";

// Ask only for the fields we show. A smaller answer is faster on mobile data.
const FIELDS = "code,product_name,brands,quantity,image_front_small_url,categories_tags";

const isWeb = Platform.OS === "web";

// Browsers do not allow a custom User-Agent header, so we only send it on the phone
const headers: Record<string, string> = isWeb ? {} : { "User-Agent": USER_AGENT };

// 1) The main server: barcode lookup + the older name search (cgi/search.pl)
const worldApi = axios.create({
  baseURL: "https://world.openfoodfacts.org",
  timeout: 15000,
  headers,
});

// 2) "search-a-licious", the newer search service (better results, phone only)
const searchApi = axios.create({
  baseURL: "https://search.openfoodfacts.org",
  timeout: 15000,
  headers,
});

// The raw shape Open Food Facts sends. Every field can be missing, and
// "brands" is a text in some answers but a list in search-a-licious.
interface OffRawProduct {
  code?: string;
  product_name?: string;
  brands?: string | string[];
  quantity?: string;
  image_front_small_url?: string;
  categories_tags?: string[];
}

interface OffProductResponse {
  code: string;
  status: number; // 1 = found, 0 = not found
  status_verbose: string;
  product?: OffRawProduct;
}

// search.openfoodfacts.org answers { hits: [...] }
interface SearchaliciousResponse {
  hits: OffRawProduct[];
  count: number;
}

// world.openfoodfacts.org/cgi/search.pl answers { products: [...] }
interface LegacySearchResponse {
  products: OffRawProduct[];
  count: number;
}

// Raw product -> our clean OffProduct. Products without a name are skipped (null).
function toOffProduct(raw: OffRawProduct): OffProduct | null {
  const name = raw.product_name?.trim();
  if (!raw.code || !name) return null;
  const brand = Array.isArray(raw.brands) ? raw.brands.join(", ") : (raw.brands ?? "");
  return {
    barcode: raw.code,
    name,
    brand: brand.trim(),
    quantity: raw.quantity?.trim() ?? "",
    imageUrl: raw.image_front_small_url ?? null,
    categoryTags: raw.categories_tags ?? [],
  };
}

// 8 to 14 digits = a barcode number (EAN-8, UPC-A, EAN-13 ...)
export function isBarcode(text: string): boolean {
  return /^\d{8,14}$/.test(text.trim());
}

// GET https://world.openfoodfacts.org/api/v2/product/{barcode}?fields=...
// Returns null when Open Food Facts does not know the barcode.
export async function getProductByBarcode(barcode: string): Promise<OffProduct | null> {
  try {
    const response = await worldApi.get<OffProductResponse>(`/api/v2/product/${barcode.trim()}`, {
      params: { fields: FIELDS },
    });
    if (response.data.status !== 1 || !response.data.product) return null;
    return toOffProduct({ code: response.data.code, ...response.data.product });
  } catch (error) {
    // An unknown barcode can also come back as HTTP 404: that is "not found", not a failure
    if (axios.isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}

// GET https://search.openfoodfacts.org/search?q=milk&page_size=20&langs=en&fields=...
async function searchNew(query: string): Promise<OffRawProduct[]> {
  const response = await searchApi.get<SearchaliciousResponse>("/search", {
    params: { q: query, page_size: 20, langs: "en", fields: FIELDS },
  });
  return response.data.hits;
}

// GET https://world.openfoodfacts.org/cgi/search.pl?search_terms=milk&search_simple=1&action=process&json=1&...
async function searchOld(query: string): Promise<OffRawProduct[]> {
  const response = await worldApi.get<LegacySearchResponse>("/cgi/search.pl", {
    params: { search_terms: query, search_simple: 1, action: "process", json: 1, page_size: 20, fields: FIELDS },
  });
  return response.data.products;
}

// Results are kept in memory, so searching "milk" twice costs only one request.
// (Open Food Facts allows only 10 searches per minute.)
const searchCache = new Map<string, OffProduct[]>();

export async function searchProducts(query: string): Promise<OffProduct[]> {
  const key = query.trim().toLowerCase();
  const cached = searchCache.get(key);
  if (cached) return cached;

  let raw: OffRawProduct[];
  if (isWeb) {
    // Browsers block search.openfoodfacts.org (it sends no CORS header),
    // so the web version uses the older search, which allows browsers.
    raw = await searchOld(key);
  } else {
    try {
      raw = await searchNew(key);
    } catch {
      raw = await searchOld(key); // second chance when the new service is down
    }
  }

  const products = raw.map(toOffProduct).filter((product): product is OffProduct => product !== null);
  searchCache.set(key, products);
  return products;
}

// One readable sentence for the screen
export function getOffErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Cannot reach Open Food Facts. Check your internet connection.";
    }
    if (error.response.status === 429 || error.response.status === 503) {
      return "Open Food Facts is busy right now. Wait a minute and try again.";
    }
  }
  return "The product search failed. You can still add the food by hand.";
}
