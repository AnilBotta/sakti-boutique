/**
 * Admin products repository.
 *
 * Provides list/read/write access for the admin product editor. All writes
 * currently return a typed "not configured" result so the UI can show a
 * clear notice instead of silently failing.
 */

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
import type { ProductWritePayload } from '@/lib/db/mappers';
// import { editableToWritePayload } from '@/lib/db/mappers';
// import { getAdminSupabase } from '@/lib/supabase/client';

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
  // LIVE (Step 10B): admin list query against `products` with left joins on
  // `product_variants` (for stock sum), `channel_mappings` (Amazon flags),
  // then map to `AdminProductListRow`.
  return [];
}

export async function getAdminProduct(
  idOrSlug: string,
): Promise<EditableProduct | null> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('admin-products.get');
    return toEditableProduct(idOrSlug);
  }
  // LIVE (Step 10B):
  //   const db = getAdminSupabase()!;
  //   const { data } = await db.from('products')
  //     .select('*, variants:product_variants(*), images:product_images(*), attributes:product_attributes(*), channelMappings:channel_mappings(*)')
  //     .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`).single();
  //   return data ? dbProductToEditable(data as unknown as DbProductFull) : null;
  return toEditableProduct(idOrSlug);
}

export function newEditableProduct(): EditableProduct {
  return makeEmptyEditableProduct();
}

// ---------------------------------------------------------------------------
// Write contracts — placeholder-safe
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
        'Supabase service-role credentials are not configured. Create flows run in placeholder mode.',
    };
  }
  // LIVE (Step 10B): insert product → insert variants → insert images →
  // upsert channel mapping, inside a transaction (use an RPC or Edge
  // Function since supabase-js doesn't support cross-table tx directly).
  void payload;
  return { ok: false, error: 'unknown', message: 'Not yet implemented.' };
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
        'Supabase service-role credentials are not configured. Updates run in placeholder mode.',
    };
  }
  void id;
  void payload;
  return { ok: false, error: 'unknown', message: 'Not yet implemented.' };
}

export async function archiveAdminProduct(
  id: string,
): Promise<RepoResult<{ id: string }>> {
  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      error: 'not_configured',
      message:
        'Supabase service-role credentials are not configured. Archive runs in placeholder mode.',
    };
  }
  void id;
  return { ok: false, error: 'unknown', message: 'Not yet implemented.' };
}
