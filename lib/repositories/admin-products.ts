/**
 * Admin products repository.
 *
 * Provides list/read/write access for the admin product editor. All writes
 * go through the `save_product_full` Postgres RPC for atomicity, called via
 * the service-role admin client.
 */

import 'server-only';

import {
  makeEmptyEditableProduct,
  toEditableProduct,
  type EditableProduct,
} from '@/lib/admin/product-editor';
import { products as placeholderProducts } from '@/lib/catalog/products';
import {
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';
import { getAdminSupabase, getServerSupabase } from '@/lib/supabase/server';
import { dbProductToEditable, type ProductWritePayload } from '@/lib/db/mappers';
import type { DbProductFull } from '@/lib/db/types';

/** Lightweight row used by the admin products list page. */
export interface AdminProductListRow {
  id: string;
  slug: string;
  name: string;
  audience: 'women' | 'men' | 'kids';
  category: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  status: 'draft' | 'active' | 'archived';
  stock: number;
  tryOnEnabled: boolean;
  publishToAmazon: boolean;
  amazonStatus: 'listed' | 'pending' | 'error' | 'draft';
  image: string;
}

export async function listAdminProducts(): Promise<AdminProductListRow[]> {
  // Placeholder mode (no Supabase env): keep the mock catalog so local
  // demos / CI without credentials still feel populated.
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('admin-products.list');
    return placeholderRows();
  }
  // Prefer the admin client (bypasses RLS, sees draft + archived rows).
  // Fall back to the cookie-aware server client if service role isn't set.
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) {
    console.error('[admin-products.list] no Supabase client available');
    return [];
  }

  // Split the query into pieces so a PostgREST FK-disambiguation error
  // on the joined select doesn't blank out the whole list. The list view
  // only needs products + cover image + amazon channel mapping + category
  // slug — variants and attributes aren't displayed here.
  const { data: products, error: prodErr } = await db
    .from('products')
    .select(
      'id, slug, name, audience, category_id, subcategory_id, price, original_price, status, try_on_enabled, total_stock',
    )
    .order('created_at', { ascending: false });
  if (prodErr) {
    console.error('[admin-products.list] products query failed:', prodErr.message);
    return [];
  }
  if (!products || products.length === 0) return [];

  type ProductBase = {
    id: string;
    slug: string;
    name: string;
    audience: 'women' | 'men' | 'kids';
    category_id: string | null;
    subcategory_id: string | null;
    price: number | string;
    original_price: number | string | null;
    status: 'draft' | 'active' | 'archived';
    try_on_enabled: boolean;
    total_stock: number;
  };
  const productRows = products as unknown as ProductBase[];
  const productIds = productRows.map((p) => p.id);
  const categoryIds = Array.from(
    new Set(
      productRows
        .flatMap((p) => [p.category_id, p.subcategory_id])
        .filter((v): v is string => !!v),
    ),
  );

  const [imagesRes, channelRes, categoriesRes] = await Promise.all([
    db
      .from('product_images')
      .select('product_id, url, is_cover, position')
      .in('product_id', productIds),
    db
      .from('channel_mappings')
      .select('product_id, publish, listing_status')
      .eq('channel', 'amazon')
      .in('product_id', productIds),
    categoryIds.length
      ? db.from('categories').select('id, slug').in('id', categoryIds)
      : Promise.resolve({ data: [] as { id: string; slug: string }[], error: null }),
  ]);

  if (imagesRes.error) console.error('[admin-products.list] images query failed:', imagesRes.error.message);
  if (channelRes.error) console.error('[admin-products.list] channel_mappings query failed:', channelRes.error.message);
  if (categoriesRes.error)
    console.error('[admin-products.list] categories query failed:', categoriesRes.error.message);

  const images = (imagesRes.data ?? []) as Array<{
    product_id: string;
    url: string | null;
    is_cover: boolean;
    position: number;
  }>;
  const channels = (channelRes.data ?? []) as Array<{
    product_id: string;
    publish: boolean;
    listing_status: AdminProductListRow['amazonStatus'];
  }>;
  const categoriesMap = new Map<string, string>(
    ((categoriesRes.data ?? []) as Array<{ id: string; slug: string }>).map((c) => [c.id, c.slug]),
  );

  return productRows.map((p) => {
    const productImages = images.filter((i) => i.product_id === p.id);
    const cover =
      productImages.find((i) => i.is_cover) ??
      productImages.slice().sort((a, b) => a.position - b.position)[0];
    const amazon = channels.find((c) => c.product_id === p.id);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      audience: p.audience,
      category: (p.category_id && categoriesMap.get(p.category_id)) || '',
      subcategory: (p.subcategory_id && categoriesMap.get(p.subcategory_id)) || undefined,
      price: Number(p.price),
      originalPrice: p.original_price != null ? Number(p.original_price) : undefined,
      status: p.status,
      stock: p.total_stock,
      tryOnEnabled: p.try_on_enabled,
      publishToAmazon: amazon?.publish ?? false,
      amazonStatus: amazon?.listing_status ?? 'draft',
      image: cover?.url ?? '',
    };
  });
}

export async function getAdminProduct(
  idOrSlug: string,
): Promise<EditableProduct | null> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('admin-products.get');
    return toEditableProduct(idOrSlug);
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) {
    console.error('[admin-products.get] no Supabase client available');
    return null;
  }

  const looksLikeUuid = /^[0-9a-fA-F-]{36}$/.test(idOrSlug);
  const filterColumn = looksLikeUuid ? 'id' : 'slug';

  const { data: product, error: prodErr } = await db
    .from('products')
    .select('*')
    .eq(filterColumn, idOrSlug)
    .maybeSingle();
  if (prodErr) {
    console.error('[admin-products.get] product query failed:', prodErr.message);
    return null;
  }
  if (!product) return null;
  const p = product as unknown as DbProductFull;

  const [variantsRes, imagesRes, attrsRes, channelsRes, categoriesRes] = await Promise.all([
    db.from('product_variants').select('*').eq('product_id', p.id).order('position'),
    db.from('product_images').select('*').eq('product_id', p.id).order('position'),
    db.from('product_attributes').select('*').eq('product_id', p.id).order('position'),
    db.from('channel_mappings').select('*').eq('product_id', p.id),
    p.category_id || p.subcategory_id
      ? db
          .from('categories')
          .select('id, slug, label')
          .in(
            'id',
            [p.category_id, p.subcategory_id].filter((v): v is string => !!v),
          )
      : Promise.resolve({ data: [] as { id: string; slug: string; label: string }[], error: null }),
  ]);

  if (variantsRes.error) console.error('[admin-products.get] variants:', variantsRes.error.message);
  if (imagesRes.error) console.error('[admin-products.get] images:', imagesRes.error.message);
  if (attrsRes.error) console.error('[admin-products.get] attributes:', attrsRes.error.message);
  if (channelsRes.error) console.error('[admin-products.get] channel_mappings:', channelsRes.error.message);
  if (categoriesRes.error) console.error('[admin-products.get] categories:', categoriesRes.error.message);

  const catMap = new Map<string, { slug: string; label: string }>(
    ((categoriesRes.data ?? []) as Array<{ id: string; slug: string; label: string }>).map((c) => [
      c.id,
      { slug: c.slug, label: c.label },
    ]),
  );

  const full: DbProductFull = {
    ...p,
    variants: (variantsRes.data ?? []) as DbProductFull['variants'],
    images: (imagesRes.data ?? []) as DbProductFull['images'],
    attributes: (attrsRes.data ?? []) as DbProductFull['attributes'],
    channel_mappings: (channelsRes.data ?? []) as DbProductFull['channel_mappings'],
    category: p.category_id ? catMap.get(p.category_id) ?? null : null,
    subcategory: p.subcategory_id ? catMap.get(p.subcategory_id) ?? null : null,
  };
  return dbProductToEditable(full);
}

export function newEditableProduct(): EditableProduct {
  return makeEmptyEditableProduct();
}

// ---------------------------------------------------------------------------
// Write contracts
// ---------------------------------------------------------------------------

export type RepoResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: 'not_configured' | 'validation' | 'not_found' | 'unknown'; message: string };

export async function createAdminProduct(
  payload: ProductWritePayload,
): Promise<RepoResult<{ id: string; slug: string }>> {
  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      error: 'not_configured',
      message:
        'Supabase service-role credentials are not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.',
    };
  }
  const admin = getAdminSupabase();
  if (!admin) {
    return { ok: false, error: 'not_configured', message: 'Admin client unavailable.' };
  }
  // Strip id so the RPC takes the insert branch
  const insertPayload = {
    ...payload,
    product: { ...payload.product, id: undefined },
  };
  const { data, error } = await admin.rpc('save_product_full', { payload: insertPayload });
  if (error) {
    console.error('[admin-products.create]', error.message);
    return { ok: false, error: 'unknown', message: error.message };
  }
  const result = data as { id: string; slug: string };
  return { ok: true, data: result };
}

export async function updateAdminProduct(
  id: string,
  payload: ProductWritePayload,
): Promise<RepoResult<{ id: string }>> {
  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      error: 'not_configured',
      message:
        'Supabase service-role credentials are not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.',
    };
  }
  const admin = getAdminSupabase();
  if (!admin) {
    return { ok: false, error: 'not_configured', message: 'Admin client unavailable.' };
  }
  const updatePayload = {
    ...payload,
    product: { ...payload.product, id },
  };
  const { data, error } = await admin.rpc('save_product_full', { payload: updatePayload });
  if (error) {
    console.error('[admin-products.update]', error.message);
    return { ok: false, error: 'unknown', message: error.message };
  }
  const result = data as { id: string; slug: string };
  return { ok: true, data: { id: result.id } };
}

export async function archiveAdminProduct(
  id: string,
): Promise<RepoResult<{ id: string }>> {
  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      error: 'not_configured',
      message:
        'Supabase service-role credentials are not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.',
    };
  }
  const admin = getAdminSupabase();
  if (!admin) {
    return { ok: false, error: 'not_configured', message: 'Admin client unavailable.' };
  }
  const { error } = await admin
    .from('products')
    .update({ status: 'archived' })
    .eq('id', id);
  if (error) {
    console.error('[admin-products.archive]', error.message);
    return { ok: false, error: 'unknown', message: error.message };
  }
  return { ok: true, data: { id } };
}

/**
 * Permanent delete. Cascades to variants/images/attributes/channel_mappings
 * via FK `on delete cascade`. Use sparingly — prefer archive.
 */
export async function deleteAdminProduct(
  id: string,
): Promise<RepoResult<{ id: string }>> {
  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      error: 'not_configured',
      message:
        'Supabase service-role credentials are not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.',
    };
  }
  const admin = getAdminSupabase();
  if (!admin) {
    return { ok: false, error: 'not_configured', message: 'Admin client unavailable.' };
  }
  const { error } = await admin.from('products').delete().eq('id', id);
  if (error) {
    console.error('[admin-products.delete]', error.message);
    return { ok: false, error: 'unknown', message: error.message };
  }
  return { ok: true, data: { id } };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function placeholderRows(): AdminProductListRow[] {
  return placeholderProducts.map((p, i) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    audience: p.audience,
    category: p.category,
    subcategory: p.subcategory,
    price: p.price,
    originalPrice: p.originalPrice,
    status: i % 11 === 0 ? 'archived' : i % 7 === 0 ? 'draft' : 'active',
    stock: p.inStock ? 6 + (i % 14) : 0,
    tryOnEnabled: p.audience !== 'kids' && i % 3 !== 0,
    publishToAmazon: p.audience === 'women' && i % 4 !== 0,
    amazonStatus:
      i % 9 === 0
        ? 'error'
        : i % 5 === 0
          ? 'pending'
          : p.audience === 'women'
            ? 'listed'
            : 'draft',
    image: p.image,
  }));
}
