/**
 * Orders repository.
 *
 * Reads from `orders` joined with `customers` and `order_items`. Returns
 * `AdminOrderRow` shaped data for the admin UI. Falls back to mock data
 * when Supabase isn't configured.
 */

import { recentOrders, type AdminOrderRow, type OrderStatus } from '@/lib/admin/mock-data';
import {
  isSupabaseConfigured,
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
    return recentOrders.slice(0, limit);
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return recentOrders.slice(0, limit);

  const { data, error } = await db
    .from('orders')
    .select('id, number, status, channel, grand_total, created_at, customer:customers(full_name,email), items:order_items(quantity)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[orders.listRecent]', error.message);
    return recentOrders.slice(0, limit);
  }
  // No rows yet (Step 10B seeds catalog only) → fall back to mock so the
  // dashboard still renders believable activity until orders start landing.
  if (!data || data.length === 0) {
    return recentOrders.slice(0, limit);
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
