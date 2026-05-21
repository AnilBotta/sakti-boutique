/**
 * Admin inventory repository — flat variant rows for the /admin/inventory page.
 */

import 'server-only';

import { products as placeholderProducts } from '@/lib/catalog/products';
import {
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';
import { getAdminSupabase, getServerSupabase } from '@/lib/supabase/server';

export interface VariantRow {
  productId: string;
  productName: string;
  variantId: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
}

function fallbackRows(): VariantRow[] {
  // Synthesize one row per (product, size) from placeholder catalog.
  return placeholderProducts.flatMap((p, pi) =>
    (p.sizes.length ? p.sizes : ['One Size']).map((size, si) => ({
      productId: p.id,
      productName: p.name,
      variantId: `${p.id}-${size}`,
      sku: `${p.id.toUpperCase()}-${size.replace(/\s+/g, '')}`,
      size,
      color: p.colors[0] ?? '',
      stock: p.inStock ? 6 + ((pi + si) % 12) : 0,
    })),
  );
}

interface DbVariantRow {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  sku: string;
  stock: number;
  product?: { name: string } | null;
}

export async function listAdminVariants(): Promise<VariantRow[]> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('admin-inventory.list');
    return fallbackRows();
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return fallbackRows();

  const { data, error } = await db
    .from('product_variants')
    .select('id, product_id, size, color, sku, stock, product:products(name)')
    .order('sku', { ascending: true });
  if (error) {
    console.error('[admin-inventory.list]', error.message);
    return fallbackRows();
  }
  if (!data || data.length === 0) return fallbackRows();

  return (data as unknown as DbVariantRow[]).map((r) => ({
    productId: r.product_id,
    productName: r.product?.name ?? r.product_id,
    variantId: r.id,
    sku: r.sku,
    size: r.size ?? '',
    color: r.color ?? '',
    stock: r.stock,
  }));
}

export type StockMutationResult =
  | { ok: true; data: { id: string; stock: number } }
  | { ok: false; error: 'not_configured' | 'unknown'; message: string };

export async function updateVariantStock(
  variantId: string,
  newStock: number,
): Promise<StockMutationResult> {
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
  const stock = Math.max(0, Math.floor(newStock));
  const { data, error } = await admin
    .from('product_variants')
    .update({ stock })
    .eq('id', variantId)
    .select('product_id, stock')
    .single();
  if (error || !data) {
    return { ok: false, error: 'unknown', message: error?.message ?? 'Update failed' };
  }

  // Resync the parent product's total_stock + in_stock rollup.
  const productId = (data as { product_id: string }).product_id;
  const { data: totals, error: totalsErr } = await admin
    .from('product_variants')
    .select('stock')
    .eq('product_id', productId);
  if (!totalsErr && totals) {
    const totalStock = (totals as { stock: number }[]).reduce(
      (n, v) => n + (v.stock ?? 0),
      0,
    );
    await admin
      .from('products')
      .update({ total_stock: totalStock, in_stock: totalStock > 0 })
      .eq('id', productId);
  }

  return { ok: true, data: { id: variantId, stock } };
}
