/**
 * Server-side cart re-pricing (server-only).
 *
 * The client cart is never trusted for money. Given the product + variant
 * identifiers, this recomputes each line's price from the database and
 * returns snapshot rows used for both the Stripe line items and the
 * order_items records.
 */

import 'server-only';

import { getServerSupabase } from '@/lib/supabase/server';

export interface CheckoutItemInput {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface PricedLine {
  productId: string;
  variantId: string | null;
  name: string;
  variantLabel: string | null;
  sku: string;
  /** Unit price in US dollars (from the DB). */
  unitPrice: number;
  quantity: number;
  image: string;
}

interface DbProductRow {
  id: string;
  name: string;
  price: number | string;
}
interface DbVariantRow {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  sku: string;
  price: number | string;
  sale_price: number | string | null;
}
interface DbImageRow {
  product_id: string;
  url: string | null;
  is_cover: boolean;
  position: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function norm(v: string | null | undefined): string {
  return (v ?? '').trim().toLowerCase();
}

export async function priceCart(
  items: CheckoutItemInput[],
): Promise<{ lines: PricedLine[]; subtotal: number } | null> {
  const db = getServerSupabase();
  if (!db) return null;

  const ids = Array.from(new Set(items.map((i) => i.productId).filter(Boolean)));
  if (ids.length === 0) return { lines: [], subtotal: 0 };

  const [productsRes, variantsRes, imagesRes] = await Promise.all([
    db.from('products').select('id, name, price').in('id', ids).eq('status', 'active'),
    db.from('product_variants').select('id, product_id, size, color, sku, price, sale_price').in('product_id', ids),
    db.from('product_images').select('product_id, url, is_cover, position').in('product_id', ids),
  ]);

  if (productsRes.error) {
    console.error('[priceCart] products', productsRes.error.message);
    return null;
  }
  const products = new Map(
    (productsRes.data as DbProductRow[]).map((p) => [p.id, p]),
  );
  const variants = (variantsRes.data as DbVariantRow[] | null) ?? [];
  const images = (imagesRes.data as DbImageRow[] | null) ?? [];

  function coverFor(productId: string): string {
    const imgs = images.filter((i) => i.product_id === productId);
    const cover =
      imgs.find((i) => i.is_cover) ??
      imgs.slice().sort((a, b) => a.position - b.position)[0];
    return cover?.url ?? '';
  }

  const lines: PricedLine[] = [];
  for (const item of items) {
    const product = products.get(item.productId);
    if (!product) continue; // dropped/inactive product — skip
    const pool = variants.filter((v) => v.product_id === item.productId);
    const variant =
      pool.find(
        (v) => norm(v.size) === norm(item.size) && norm(v.color) === norm(item.color),
      ) ?? pool[0];

    const unitPrice = round2(
      variant?.sale_price != null
        ? Number(variant.sale_price)
        : variant?.price != null
          ? Number(variant.price)
          : Number(product.price),
    );

    const variantLabel = [item.size, item.color].filter(Boolean).join(' / ') || null;

    lines.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      name: product.name,
      variantLabel,
      sku: variant?.sku ?? '',
      unitPrice,
      quantity: Math.max(1, item.quantity),
      image: coverFor(product.id),
    });
  }

  const subtotal = round2(
    lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
  );
  return { lines, subtotal };
}
