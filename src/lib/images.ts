/**
 * Central image system.
 *
 * The UI never imports an image file directly — it only ever renders whatever
 * path/URL comes from the data layer (mock data today, database rows later).
 *
 * Supported `src` values:
 *  - absolute URL      -> "https://cdn.example.com/med/1.jpg"  (used as-is)
 *  - data/blob URL     -> used as-is
 *  - server-relative   -> "/uploads/products/1.jpg"  (prefixed with VITE_IMAGE_BASE_URL)
 *  - empty / missing   -> deterministic placeholder
 *
 * To swap every product image later, change the stored path/URL in the
 * database — no component needs editing.
 */

const env = import.meta.env as Record<string, string | undefined>;

/** Optional CDN / backend origin for relative image paths. */
export const IMAGE_BASE_URL = (env.VITE_IMAGE_BASE_URL ?? "").replace(/\/$/, "");

/** Copyright-safe pharmacy placeholder photos — replaceable by backend data. */
export const PLACEHOLDER_PRODUCT_IMAGES = [
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550831107-1553da8c8464?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1585435557343-3b092031d4df?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1585435557885-1d928a4c2dfc?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580281657527-47f249e8f4df?w=600&q=80&auto=format&fit=crop",
] as const;

export const FALLBACK_PRODUCT_IMAGE = PLACEHOLDER_PRODUCT_IMAGES[0];

/** Stable placeholder for any product id/index — supports unlimited products. */
export function placeholderProductImage(seed: string | number): string {
  const n =
    typeof seed === "number"
      ? seed
      : Array.from(seed).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const idx = Math.abs(n) % PLACEHOLDER_PRODUCT_IMAGES.length;
  return PLACEHOLDER_PRODUCT_IMAGES[idx];
}

const ABSOLUTE = /^(https?:|data:|blob:)/i;

/** Turns a stored image path/URL into something the browser can render. */
export function resolveImageUrl(
  src?: string | null,
  fallback: string = FALLBACK_PRODUCT_IMAGE,
): string {
  const value = (src ?? "").trim();
  if (!value) return fallback;
  if (ABSOLUTE.test(value)) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${IMAGE_BASE_URL}${path}`;
}
