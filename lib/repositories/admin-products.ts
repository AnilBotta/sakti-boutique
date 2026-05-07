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

const FULL_SELECT = `
  *,
  variants:product_variants(*),
  images:product_images(*),
  attributes:product_attributes(*),
  channel_mappings(*),
  category:categories!products_category_id_fkey(slug,label),
  subcategory:categories!products_subcategory_id_fkey(slug,label)
`;

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
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('admin-products.list');
    return placeholderRows();
  }
  // Prefer the admin client (bypasses RLS, sees draft + archived rows).
  // Fall back to the cookie-aware server client if service role isn't set.
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return placeholderRows();

  const { data, error } = await db
    .from('products')
    .select(FULL_SELECT)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[admin-products.list]', error.message);
    return placeholderRows();
  }
  return (data as unknown as DbProductFull[]).map(toListRow);
}

export async function getAdminProduct(
  idOrSlug: string,
): Promise<EditableProduct | null> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('admin-products.get');
    return toEditableProduct(idOrSlug);
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return toEditableProduct(idOrSlug);

  // Heuristic: a UUID has 4 hyphens; otherwise treat the param as a slug.
  const looksLikeUuid = /^[0-9a-fA-F-]{36}$/.test(idOrSlug);
  const filterColumn = looksLikeUuid ? 'id' : 'slug';

  const { data, error } = await db
    .from('products')
    .select(FULL_SELECT)
    .eq(filterColumn, idOrSlug)
    .maybeSingle();
  if (error) {
    console.error('[admin-products.get]', error.message);
    return null;
  }
  if (!data) return null;
  return dbProductToEditable(data as unknown as DbProductFull);
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

function toListRow(full: DbProductFull): AdminProductListRow {
  const cover =
    (full.images ?? []).find((i) => i.is_cover) ??
    (full.images ?? []).slice().sort((a, b) => a.position - b.position)[0];
  const amazon = (full.channel_mappings ?? []).find((m) => m.channel === 'amazon');
  return {
    id: full.id,
    slug: full.slug,
    name: full.name,
    audience: full.audience,
    category: full.category?.slug ?? '',
    subcategory: full.subcategory?.slug,
    price: Number(full.price),
    originalPrice:
      full.original_price != null ? Number(full.original_price) : undefined,
    status: full.status,
    stock: full.total_stock,
    tryOnEnabled: full.try_on_enabled,
    publishToAmazon: amazon?.publish ?? false,
    amazonStatus: (amazon?.listing_status ?? 'draft') as AdminProductListRow['amazonStatus'],
    image: cover?.url ?? '',
  };
}

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
