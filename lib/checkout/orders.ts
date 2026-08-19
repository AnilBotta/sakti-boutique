/**
 * Checkout order writes (server-only, service-role).
 *
 * Guest checkout: a customer row is upserted by email, a shipping address is
 * stored, then a `pending` order + `order_items` snapshots are created. The
 * Stripe webhook flips the order to `paid`. All writes use the service-role
 * client because anonymous shoppers can't satisfy the RLS insert policies.
 */

import 'server-only';

import { getAdminSupabase } from '@/lib/supabase/server';
import { isSupabaseAdminConfigured } from '@/lib/supabase/env';
import type { PricedLine } from './pricing';

export interface CheckoutAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface CreateOrderInput {
  email: string;
  phone?: string;
  fullName: string;
  address: CheckoutAddress;
  lines: PricedLine[];
  subtotal: number;
  shipping: number;
  tax: number;
  grandTotal: number;
}

export type OrderWriteResult =
  | { ok: true; orderId: string; orderNumber: string }
  | { ok: false; message: string };

function orderNumber(): string {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `SB-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

export async function createPendingOrder(
  input: CreateOrderInput,
): Promise<OrderWriteResult> {
  if (!isSupabaseAdminConfigured()) {
    return { ok: false, message: 'Store backend is not configured.' };
  }
  const db = getAdminSupabase();
  if (!db) return { ok: false, message: 'Store backend is not configured.' };

  // 1. Upsert the guest customer by email.
  const { data: customer, error: custErr } = await db
    .from('customers')
    .upsert(
      { email: input.email, full_name: input.fullName, phone: input.phone ?? null },
      { onConflict: 'email' },
    )
    .select('id')
    .single();
  if (custErr || !customer) {
    console.error('[createPendingOrder] customer', custErr?.message);
    return { ok: false, message: 'Could not save customer details.' };
  }
  const customerId = (customer as { id: string }).id;

  // 2. Shipping address.
  const { data: addr, error: addrErr } = await db
    .from('addresses')
    .insert({
      customer_id: customerId,
      label: 'shipping',
      full_name: input.address.fullName,
      line1: input.address.line1,
      line2: input.address.line2 || null,
      city: input.address.city,
      region: input.address.region || null,
      postal_code: input.address.postalCode,
      country: input.address.country,
      phone: input.address.phone || null,
      is_default_shipping: true,
    })
    .select('id')
    .single();
  if (addrErr || !addr) {
    console.error('[createPendingOrder] address', addrErr?.message);
    return { ok: false, message: 'Could not save shipping address.' };
  }
  const addressId = (addr as { id: string }).id;

  // 3. Order.
  const number = orderNumber();
  const { data: order, error: orderErr } = await db
    .from('orders')
    .insert({
      number,
      customer_id: customerId,
      status: 'pending',
      channel: 'storefront',
      currency: 'USD',
      subtotal: input.subtotal,
      shipping_total: input.shipping,
      tax_total: input.tax,
      discount_total: 0,
      grand_total: input.grandTotal,
      shipping_address_id: addressId,
      billing_address_id: addressId,
      payment_provider: 'stripe',
    })
    .select('id')
    .single();
  if (orderErr || !order) {
    console.error('[createPendingOrder] order', orderErr?.message);
    return { ok: false, message: 'Could not create the order.' };
  }
  const orderId = (order as { id: string }).id;

  // 4. Order items (price snapshots).
  const itemsPayload = input.lines.map((l) => ({
    order_id: orderId,
    product_id: l.productId,
    variant_id: l.variantId,
    name_snapshot: l.name,
    variant_label_snapshot: l.variantLabel,
    sku_snapshot: l.sku || l.productId,
    price_snapshot: l.unitPrice,
    quantity: l.quantity,
    image_url_snapshot: l.image || null,
  }));
  const { error: itemsErr } = await db.from('order_items').insert(itemsPayload);
  if (itemsErr) {
    console.error('[createPendingOrder] items', itemsErr.message);
    return { ok: false, message: 'Could not save order items.' };
  }

  return { ok: true, orderId, orderNumber: number };
}

/** Idempotent: mark a pending order paid. No-op if already paid. */
export async function markOrderPaid(
  orderId: string,
  paymentRef: string | null,
): Promise<void> {
  const db = getAdminSupabase();
  if (!db) return;
  const { error } = await db
    .from('orders')
    .update({
      status: 'paid',
      payment_ref: paymentRef,
      placed_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('status', 'pending');
  if (error) console.error('[markOrderPaid]', error.message);
}

// -- Confirmation read -------------------------------------------------------

export interface OrderSummaryLine {
  name: string;
  variantLabel: string | null;
  quantity: number;
  price: number;
  image: string | null;
}
export interface OrderSummary {
  number: string;
  status: string;
  email: string | null;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  lines: OrderSummaryLine[];
}

export async function getOrderSummary(number: string): Promise<OrderSummary | null> {
  const db = getAdminSupabase();
  if (!db) return null;
  const { data, error } = await db
    .from('orders')
    .select(
      'number, status, subtotal, shipping_total, tax_total, grand_total, customer:customers(email), items:order_items(name_snapshot, variant_label_snapshot, quantity, price_snapshot, image_url_snapshot)',
    )
    .eq('number', number)
    .maybeSingle();
  if (error || !data) {
    if (error) console.error('[getOrderSummary]', error.message);
    return null;
  }
  const o = data as unknown as {
    number: string;
    status: string;
    subtotal: number | string;
    shipping_total: number | string;
    tax_total: number | string;
    grand_total: number | string;
    customer: { email: string } | null;
    items: Array<{
      name_snapshot: string;
      variant_label_snapshot: string | null;
      quantity: number;
      price_snapshot: number | string;
      image_url_snapshot: string | null;
    }>;
  };
  return {
    number: o.number,
    status: o.status,
    email: o.customer?.email ?? null,
    subtotal: Number(o.subtotal),
    shipping: Number(o.shipping_total),
    tax: Number(o.tax_total),
    total: Number(o.grand_total),
    lines: (o.items ?? []).map((it) => ({
      name: it.name_snapshot,
      variantLabel: it.variant_label_snapshot,
      quantity: it.quantity,
      price: Number(it.price_snapshot),
      image: it.image_url_snapshot,
    })),
  };
}
