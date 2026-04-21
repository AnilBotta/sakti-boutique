/**
 * Catalog repository.
 *
 * Single data-access point for storefront product reads. Components and
 * route handlers should import from here instead of touching
 * `lib/catalog/products.ts` directly.
 *
 * Current implementation: always returns placeholder data from the
 * existing `products` array. Once Supabase is configured, the `// LIVE`
 * branches below will load `DbProductFull` rows and pipe them through
 * `dbProductToStorefront` — the return types will not change.
 */

import { products as placeholderProducts } from '@/lib/catalog/products';
import type { Product } from '@/lib/catalog/products';
import type { Audience } from '@/lib/catalog/taxonomy';
import {
  isSupabaseConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';
// import { getServerSupabase } from '@/lib/supabase/client';
// import { dbProductToStorefront } from '@/lib/db/mappers';

export interface ListProductsOptions {
  audience?: Audience;
  category?: string;
  subcategory?: string;
  limit?: number;
}

export async function listProducts(
  opts: ListProductsOptions = {},
): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('catalog.listProducts');
    return filterPlaceholder(opts);
  }
  // LIVE (Step 10B):
  //   const db = getServerSupabase()!;
  //   const { data, error } = await db
  //     .from('products')
  //     .select('*, variants:product_variants(*), images:product_images(*), attributes:product_attributes(*), channelMappings:channel_mappings(*)')
  //     .eq('status', 'active')
  //     .match(buildMatch(opts))
  //     .limit(opts.limit ?? 24);
  //   if (error) throw error;
  //   return data.map((row) => dbProductToStorefront(row as unknown as DbProductFull));
  return filterPlaceholder(opts);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('catalog.getProductBySlug');
    return placeholderProducts.find((p) => p.slug === slug) ?? null;
  }
  // LIVE (Step 10B): single-row select by slug + join, then mapper.
  return placeholderProducts.find((p) => p.slug === slug) ?? null;
}

export async function listRelatedProducts(
  slug: string,
  limit = 4,
): Promise<Product[]> {
  const base = placeholderProducts.find((p) => p.slug === slug);
  if (!base) return [];
  return placeholderProducts
    .filter(
      (p) => p.slug !== slug && p.audience === base.audience && p.category === base.category,
    )
    .slice(0, limit);
}

// ---------------------------------------------------------------------------

function filterPlaceholder(opts: ListProductsOptions): Product[] {
  let rows = placeholderProducts.slice();
  if (opts.audience) rows = rows.filter((p) => p.audience === opts.audience);
  if (opts.category) rows = rows.filter((p) => p.category === opts.category);
  if (opts.subcategory)
    rows = rows.filter((p) => p.subcategory === opts.subcategory);
  if (opts.limit) rows = rows.slice(0, opts.limit);
  return rows;
}
