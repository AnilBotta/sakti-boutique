/**
 * Catalog repository.
 *
 * Single data-access point for storefront product reads. Components and
 * route handlers should import from here instead of touching
 * `lib/catalog/products.ts` directly.
 *
 * Falls back to the placeholder catalog when Supabase env is missing,
 * so the app keeps rendering in zero-credential demos / CI.
 */

import { products as placeholderProducts } from '@/lib/catalog/products';
import type { Product } from '@/lib/catalog/products';
import type { Audience } from '@/lib/catalog/taxonomy';
import {
  isSupabaseConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';
import { getServerSupabase } from '@/lib/supabase/server';
import { dbProductToStorefront } from '@/lib/db/mappers';
import type { DbProductFull } from '@/lib/db/types';

export interface ListProductsOptions {
  audience?: Audience;
  category?: string;
  subcategory?: string;
  limit?: number;
}

const FULL_SELECT = `
  *,
  variants:product_variants(*),
  images:product_images(*),
  attributes:product_attributes(*),
  channel_mappings(*),
  category:categories!products_category_id_fkey(slug,label),
  subcategory:categories!products_subcategory_id_fkey(slug,label)
`;

export async function listProducts(
  opts: ListProductsOptions = {},
): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('catalog.listProducts');
    return filterPlaceholder(opts);
  }
  const db = getServerSupabase();
  if (!db) return filterPlaceholder(opts);

  let q = db
    .from('products')
    .select(FULL_SELECT)
    .eq('status', 'active');

  if (opts.audience) q = q.eq('audience', opts.audience);
  if (opts.category) q = q.eq('category.slug', opts.category);
  if (opts.subcategory) q = q.eq('subcategory.slug', opts.subcategory);
  q = q.limit(opts.limit ?? 24);

  const { data, error } = await q;
  if (error) {
    console.error('[catalog.listProducts]', error.message);
    return filterPlaceholder(opts);
  }
  return (data as unknown as DbProductFull[]).map(dbProductToStorefront);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('catalog.getProductBySlug');
    return placeholderProducts.find((p) => p.slug === slug) ?? null;
  }
  const db = getServerSupabase();
  if (!db) return placeholderProducts.find((p) => p.slug === slug) ?? null;

  const { data, error } = await db
    .from('products')
    .select(FULL_SELECT)
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();
  if (error) {
    console.error('[catalog.getProductBySlug]', error.message);
    return null;
  }
  if (!data) return null;
  return dbProductToStorefront(data as unknown as DbProductFull);
}

export async function listRelatedProducts(
  slug: string,
  limit = 4,
): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    const base = placeholderProducts.find((p) => p.slug === slug);
    if (!base) return [];
    return placeholderProducts
      .filter(
        (p) => p.slug !== slug && p.audience === base.audience && p.category === base.category,
      )
      .slice(0, limit);
  }
  const db = getServerSupabase();
  if (!db) return [];

  const { data: base, error: baseErr } = await db
    .from('products')
    .select('id, audience, category_id')
    .eq('slug', slug)
    .maybeSingle();
  if (baseErr || !base) return [];

  const { data, error } = await db
    .from('products')
    .select(FULL_SELECT)
    .eq('status', 'active')
    .eq('audience', base.audience)
    .eq('category_id', base.category_id)
    .neq('id', base.id)
    .limit(limit);
  if (error) {
    console.error('[catalog.listRelatedProducts]', error.message);
    return [];
  }
  return (data as unknown as DbProductFull[]).map(dbProductToStorefront);
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
