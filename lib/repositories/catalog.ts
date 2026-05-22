/**
 * Catalog repository.
 *
 * Single data-access point for storefront product reads. Components and
 * route handlers should import from here instead of touching
 * `lib/catalog/products.ts` directly.
 *
 * Queries are split into separate calls (products → images → categories →
 * variants → attributes) instead of one giant FK-joined select, so a
 * PostgREST disambiguation error on the join doesn't blank out the rail.
 *
 * Falls back to the placeholder catalog ONLY when Supabase env vars are
 * missing. When Supabase is configured and the query succeeds with zero
 * rows, an empty array is returned — the storefront then shows its empty
 * state (which is the correct truth).
 */

import { products as placeholderProducts } from '@/lib/catalog/products';
import type { Product, Badge } from '@/lib/catalog/products';
import type { Audience } from '@/lib/catalog/taxonomy';
import {
  isSupabaseConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';
import { getServerSupabase } from '@/lib/supabase/server';

export interface ListProductsOptions {
  audience?: Audience;
  category?: string;
  subcategory?: string;
  limit?: number;
}

type DbProductBase = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  fabric: string | null;
  audience: 'women' | 'men' | 'kids';
  category_id: string | null;
  subcategory_id: string | null;
  price: number | string;
  original_price: number | string | null;
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  in_stock: boolean;
  created_at: string;
};

function pickBadge(p: DbProductBase): Badge | undefined {
  if (p.best_seller) return 'Best Seller';
  if (p.new_arrival) return 'New';
  if (p.featured) return 'Festive';
  return undefined;
}

async function hydrateProducts(
  db: NonNullable<ReturnType<typeof getServerSupabase>>,
  products: DbProductBase[],
): Promise<Product[]> {
  if (products.length === 0) return [];
  const ids = products.map((p) => p.id);
  const categoryIds = Array.from(
    new Set(
      products
        .flatMap((p) => [p.category_id, p.subcategory_id])
        .filter((v): v is string => !!v),
    ),
  );

  const [imagesRes, variantsRes, attrsRes, catsRes] = await Promise.all([
    db
      .from('product_images')
      .select('product_id, url, is_cover, position')
      .in('product_id', ids),
    db
      .from('product_variants')
      .select('product_id, size, color')
      .in('product_id', ids),
    db
      .from('product_attributes')
      .select('product_id, key, value')
      .in('product_id', ids),
    categoryIds.length
      ? db.from('categories').select('id, slug').in('id', categoryIds)
      : Promise.resolve({ data: [] as { id: string; slug: string }[], error: null }),
  ]);

  if (imagesRes.error) console.error('[catalog.hydrate] images:', imagesRes.error.message);
  if (variantsRes.error) console.error('[catalog.hydrate] variants:', variantsRes.error.message);
  if (attrsRes.error) console.error('[catalog.hydrate] attributes:', attrsRes.error.message);
  if (catsRes.error) console.error('[catalog.hydrate] categories:', catsRes.error.message);

  const images = (imagesRes.data ?? []) as Array<{
    product_id: string;
    url: string | null;
    is_cover: boolean;
    position: number;
  }>;
  const variants = (variantsRes.data ?? []) as Array<{
    product_id: string;
    size: string | null;
    color: string | null;
  }>;
  const attrs = (attrsRes.data ?? []) as Array<{
    product_id: string;
    key: string;
    value: string;
  }>;
  const catMap = new Map<string, string>(
    ((catsRes.data ?? []) as Array<{ id: string; slug: string }>).map((c) => [c.id, c.slug]),
  );

  return products.map((p) => {
    const productImages = images.filter((i) => i.product_id === p.id);
    const cover =
      productImages.find((i) => i.is_cover) ??
      productImages.slice().sort((a, b) => a.position - b.position)[0];
    const productVariants = variants.filter((v) => v.product_id === p.id);
    const productAttrs = attrs.filter((a) => a.product_id === p.id);
    const sizes = uniq(productVariants.map((v) => v.size).filter(nonNull));
    const colors = uniq(productVariants.map((v) => v.color).filter(nonNull));
    const occasion = productAttrs.filter((a) => a.key === 'occasion').map((a) => a.value);

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      audience: p.audience,
      category: (p.category_id && catMap.get(p.category_id)) || '',
      subcategory: (p.subcategory_id && catMap.get(p.subcategory_id)) || undefined,
      price: Number(p.price),
      originalPrice: p.original_price != null ? Number(p.original_price) : undefined,
      badge: pickBadge(p),
      image: cover?.url ?? '',
      sizes,
      colors,
      fabric: p.fabric ?? '',
      occasion,
      inStock: p.in_stock,
      createdAt: p.created_at,
    };
  });
}

const BASE_COLUMNS =
  'id, slug, name, description, fabric, audience, category_id, subcategory_id, price, original_price, featured, best_seller, new_arrival, in_stock, created_at';

export async function listProducts(
  opts: ListProductsOptions = {},
): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('catalog.listProducts');
    return filterPlaceholder(opts);
  }
  const db = getServerSupabase();
  if (!db) {
    console.error('[catalog.listProducts] no Supabase client available');
    return [];
  }

  let q = db.from('products').select(BASE_COLUMNS).eq('status', 'active');
  if (opts.audience) q = q.eq('audience', opts.audience);
  q = q.order('created_at', { ascending: false }).limit(opts.limit ?? 24);

  const { data, error } = await q;
  if (error) {
    console.error('[catalog.listProducts]', error.message);
    return [];
  }
  let products = (data ?? []) as unknown as DbProductBase[];

  // Filter by category/subcategory slug after fetching (avoid PostgREST
  // join-filter ambiguity on the two category FKs).
  if (opts.category || opts.subcategory) {
    const catIds = Array.from(
      new Set(
        products
          .flatMap((p) => [p.category_id, p.subcategory_id])
          .filter((v): v is string => !!v),
      ),
    );
    if (catIds.length) {
      const { data: cats } = await db
        .from('categories')
        .select('id, slug')
        .in('id', catIds);
      const slugById = new Map<string, string>(
        ((cats ?? []) as Array<{ id: string; slug: string }>).map((c) => [c.id, c.slug]),
      );
      if (opts.category) {
        products = products.filter(
          (p) => p.category_id && slugById.get(p.category_id) === opts.category,
        );
      }
      if (opts.subcategory) {
        products = products.filter(
          (p) => p.subcategory_id && slugById.get(p.subcategory_id) === opts.subcategory,
        );
      }
    } else {
      products = [];
    }
  }

  return hydrateProducts(db, products);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('catalog.getProductBySlug');
    return placeholderProducts.find((p) => p.slug === slug) ?? null;
  }
  const db = getServerSupabase();
  if (!db) return null;

  const { data, error } = await db
    .from('products')
    .select(BASE_COLUMNS)
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();
  if (error) {
    console.error('[catalog.getProductBySlug]', error.message);
    return null;
  }
  if (!data) return null;
  const hydrated = await hydrateProducts(db, [data as unknown as DbProductBase]);
  return hydrated[0] ?? null;
}

/**
 * All image URLs for a product, cover first then ordered by position.
 * Used by the PDP gallery. Returns `[]` if no images, no Supabase config,
 * or the product isn't found.
 */
export async function listProductImages(productId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const db = getServerSupabase();
  if (!db) return [];

  const { data, error } = await db
    .from('product_images')
    .select('url, is_cover, position')
    .eq('product_id', productId)
    .order('position', { ascending: true });
  if (error) {
    console.error('[catalog.listProductImages]', error.message);
    return [];
  }
  const rows = (data ?? []) as Array<{
    url: string | null;
    is_cover: boolean;
    position: number;
  }>;
  // Cover image first (regardless of its position value), then everything else in position order.
  const cover = rows.find((r) => r.is_cover);
  const rest = rows
    .filter((r) => !r.is_cover)
    .sort((a, b) => a.position - b.position);
  return [cover, ...rest]
    .filter((r): r is { url: string | null; is_cover: boolean; position: number } => !!r)
    .map((r) => r.url)
    .filter((u): u is string => !!u);
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

  const baseRow = base as { id: string; audience: 'women' | 'men' | 'kids'; category_id: string | null };
  const { data, error } = await db
    .from('products')
    .select(BASE_COLUMNS)
    .eq('status', 'active')
    .eq('audience', baseRow.audience)
    .eq('category_id', baseRow.category_id)
    .neq('id', baseRow.id)
    .limit(limit);
  if (error) {
    console.error('[catalog.listRelatedProducts]', error.message);
    return [];
  }
  return hydrateProducts(db, (data ?? []) as unknown as DbProductBase[]);
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

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function nonNull<T>(v: T | null | undefined): v is T {
  return v != null;
}
