/**
 * Orders repository.
 *
 * Reads from `orders` joined with `customers` and `order_items`. Returns
 * `AdminOrderRow` shaped data for the admin UI. Falls back to mock data
 * when Supabase isn't configured.
 */

import 'server-only';

import { recentOrders, type AdminOrderRow, type OrderStatus } from '@/lib/admin/mock-data';
import {
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';
import { getAdminSupabase, getServerSupabase } from '@/lib/supabase/server';

interface OrderRow {
  id: string;
  number: string;
  status: OrderStatus;
  channel: string;
  grand_total: number | string;
  created_at: string;
  customer: { full_name: string | null; email: string } | null;
  items: { quantity: number }[];
}

function toAdminOrderRow(row: OrderRow): AdminOrderRow {
  return {
    id: row.number || row.id,
    customer: row.customer?.full_name || row.customer?.email || 'Guest',
    items: (row.items ?? []).reduce((n, it) => n + (it.quantity ?? 0), 0),
    total: Number(row.grand_total),
    status: row.status,
    placedAt: row.created_at,
    channel: row.channel === 'amazon' ? 'Amazon' : 'Web',
  };
}

export async function listRecentOrders(limit = 10): Promise<AdminOrderRow[]> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('orders.listRecent');
    return [];
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return [];

  const { data, error } = await db
    .from('orders')
    .select('id, number, status, channel, grand_total, created_at, customer:customers(full_name,email), items:order_items(quantity)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[orders.listRecent]', error.message);
    return [];
  }
  return (data as unknown as OrderRow[]).map(toAdminOrderRow);
}

export async function getOrder(id: string): Promise<AdminOrderRow | null> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('orders.get');
    return recentOrders.find((o) => o.id === id) ?? null;
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return recentOrders.find((o) => o.id === id) ?? null;

  // Accept either internal UUID or human-friendly order number ("SB-10284").
  const looksLikeUuid = /^[0-9a-fA-F-]{36}$/.test(id);
  const { data, error } = await db
    .from('orders')
    .select('id, number, status, channel, grand_total, created_at, customer:customers(full_name,email), items:order_items(quantity)')
    .eq(looksLikeUuid ? 'id' : 'number', id)
    .maybeSingle();
  if (error) {
    console.error('[orders.get]', error.message);
    return null;
  }
  if (!data) return recentOrders.find((o) => o.id === id) ?? null;
  return toAdminOrderRow(data as unknown as OrderRow);
}

export type OrderMutationResult =
  | { ok: true }
  | { ok: false; error: 'not_configured' | 'unknown'; message: string };

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'paid',
  paid: 'packed',
  packed: 'shipped',
  shipped: 'delivered',
};

export async function advanceOrderStatus(
  id: string,
): Promise<OrderMutationResult> {
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
  // Look up current status by id (UUID or order number).
  const looksLikeUuid = /^[0-9a-fA-F-]{36}$/.test(id);
  const { data: current, error: lookupErr } = await admin
    .from('orders')
    .select('id, status')
    .eq(looksLikeUuid ? 'id' : 'number', id)
    .maybeSingle();
  if (lookupErr || !current) {
    return { ok: false, error: 'unknown', message: lookupErr?.message ?? 'Order not found' };
  }
  const next = NEXT_STATUS[(current as { status: OrderStatus }).status];
  if (!next) {
    return { ok: false, error: 'unknown', message: 'No next status from current state' };
  }
  const { error } = await admin
    .from('orders')
    .update({ status: next })
    .eq('id', (current as { id: string }).id);
  if (error) {
    return { ok: false, error: 'unknown', message: error.message };
  }
  return { ok: true };
}

export async function cancelOrder(id: string): Promise<OrderMutationResult> {
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
  const looksLikeUuid = /^[0-9a-fA-F-]{36}$/.test(id);
  const { error } = await admin
    .from('orders')
    .update({ status: 'cancelled' })
    .eq(looksLikeUuid ? 'id' : 'number', id);
  if (error) {
    return { ok: false, error: 'unknown', message: error.message };
  }
  return { ok: true };
}
