/**
 * Dashboard KPI aggregations.
 *
 * Reads real values from Supabase. Returns zeros (not mock data) when tables
 * are empty, so the dashboard reflects the actual state of the store.
 */

import 'server-only';

import {
  isSupabaseConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';
import { getAdminSupabase, getServerSupabase } from '@/lib/supabase/server';

export interface DashboardStats {
  revenueToday: number;
  /** Day-over-day change as a fraction; null when there's nothing to compare. */
  revenueTodayDelta: number | null;
  ordersToday: number;
  ordersTodayDelta: number | null;
  pendingOrders: number;
  lowStockCount: number;
  tryOnSessionsToday: number;
  tryOnSuccessRate: number;
  reviewsPending: number;
  amazonListed: number;
  amazonErrors: number;
  aov: number;
  /** 7-day AOV delta vs prior 7 days; null when there's nothing to compare. */
  aovDelta: number | null;
  /** True when zero orders have ever been placed in the store. */
  hasAnyOrders: boolean;
}

const EMPTY_STATS: DashboardStats = {
  revenueToday: 0,
  revenueTodayDelta: null,
  ordersToday: 0,
  ordersTodayDelta: null,
  pendingOrders: 0,
  lowStockCount: 0,
  tryOnSessionsToday: 0,
  tryOnSuccessRate: 0,
  reviewsPending: 0,
  amazonListed: 0,
  amazonErrors: 0,
  aov: 0,
  aovDelta: null,
  hasAnyOrders: false,
};

const LOW_STOCK_THRESHOLD = 5;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number): Date {
  const d = startOfToday();
  d.setDate(d.getDate() - n);
  return d;
}

function pctChange(current: number, prior: number): number | null {
  if (prior === 0) return null;
  return (current - prior) / prior;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('admin-stats.dashboard');
    return EMPTY_STATS;
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return EMPTY_STATS;

  const today = startOfToday();
  const yesterday = daysAgo(1);
  const sevenDaysAgo = daysAgo(7);
  const fourteenDaysAgo = daysAgo(14);

  const [
    lowStockRes,
    reviewsPendingRes,
    amazonListedRes,
    amazonErrorsRes,
    pendingOrdersRes,
    anyOrdersRes,
    recentOrdersRes,
  ] = await Promise.all([
    db
      .from('product_variants')
      .select('id', { count: 'exact', head: true })
      .lt('stock', LOW_STOCK_THRESHOLD)
      .gt('stock', 0),
    db
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    db
      .from('channel_mappings')
      .select('id', { count: 'exact', head: true })
      .eq('channel', 'amazon')
      .eq('listing_status', 'listed'),
    db
      .from('channel_mappings')
      .select('id', { count: 'exact', head: true })
      .eq('channel', 'amazon')
      .eq('listing_status', 'error'),
    db
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    db
      .from('orders')
      .select('id', { count: 'exact', head: true }),
    // Pull last 14 days of orders once; bucket them in-process.
    db
      .from('orders')
      .select('grand_total, created_at')
      .gte('created_at', fourteenDaysAgo.toISOString()),
  ]);

  const recent = (recentOrdersRes.data ?? []) as Array<{
    grand_total: number | string;
    created_at: string;
  }>;

  let revenueToday = 0;
  let ordersToday = 0;
  let revenueYesterday = 0;
  let ordersYesterday = 0;
  let revenue7d = 0;
  let orders7d = 0;
  let revenuePrior7d = 0;
  let ordersPrior7d = 0;

  for (const row of recent) {
    const placed = new Date(row.created_at);
    const total = Number(row.grand_total);
    if (placed >= today) {
      revenueToday += total;
      ordersToday += 1;
    } else if (placed >= yesterday) {
      revenueYesterday += total;
      ordersYesterday += 1;
    }
    if (placed >= sevenDaysAgo) {
      revenue7d += total;
      orders7d += 1;
    } else {
      revenuePrior7d += total;
      ordersPrior7d += 1;
    }
  }

  const aov = orders7d > 0 ? Math.round(revenue7d / orders7d) : 0;
  const priorAov = ordersPrior7d > 0 ? revenuePrior7d / ordersPrior7d : 0;

  return {
    revenueToday,
    revenueTodayDelta: pctChange(revenueToday, revenueYesterday),
    ordersToday,
    ordersTodayDelta: pctChange(ordersToday, ordersYesterday),
    pendingOrders: pendingOrdersRes.count ?? 0,
    lowStockCount: lowStockRes.count ?? 0,
    tryOnSessionsToday: 0,
    tryOnSuccessRate: 0,
    reviewsPending: reviewsPendingRes.count ?? 0,
    amazonListed: amazonListedRes.count ?? 0,
    amazonErrors: amazonErrorsRes.count ?? 0,
    aov,
    aovDelta: pctChange(aov, priorAov),
    hasAnyOrders: (anyOrdersRes.count ?? 0) > 0,
  };
}

export interface TopProductRow {
  id: string;
  name: string;
  units: number;
  revenue: number;
}

/**
 * Top products for the dashboard.
 *
 * When orders exist: ranks products by units sold over the trailing window.
 * When there are no orders yet: returns the most recently created active
 * products with zero units/revenue so the operator at least sees the catalog.
 */
export async function getTopProducts(limit = 5): Promise<TopProductRow[]> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('admin-stats.topProducts');
    return [];
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return [];

  // Try real sales data first. order_items references products via
  // product_id; sum quantity + (unit_price * quantity).
  const since = daysAgo(30).toISOString();
  const { data: salesRows, error: salesErr } = await db
    .from('order_items')
    .select('product_id, quantity, price_snapshot, order:orders!inner(created_at)')
    .gte('order.created_at', since);

  if (!salesErr && salesRows && salesRows.length > 0) {
    type SalesRow = {
      product_id: string;
      quantity: number;
      price_snapshot: number | string;
    };
    const totals = new Map<string, { units: number; revenue: number }>();
    for (const row of salesRows as unknown as SalesRow[]) {
      const t = totals.get(row.product_id) ?? { units: 0, revenue: 0 };
      t.units += row.quantity;
      t.revenue += Number(row.price_snapshot) * row.quantity;
      totals.set(row.product_id, t);
    }
    const ranked = Array.from(totals.entries())
      .sort((a, b) => b[1].units - a[1].units)
      .slice(0, limit);
    const ids = ranked.map(([id]) => id);
    if (ids.length > 0) {
      const { data: products } = await db
        .from('products')
        .select('id, name')
        .in('id', ids);
      const nameById = new Map(
        ((products ?? []) as Array<{ id: string; name: string }>).map((p) => [
          p.id,
          p.name,
        ]),
      );
      return ranked.map(([id, t]) => ({
        id,
        name: nameById.get(id) ?? '(unknown product)',
        units: t.units,
        revenue: Math.round(t.revenue),
      }));
    }
  }

  // Fallback: no sales yet — list newest active products with zeros.
  const { data: products, error } = await db
    .from('products')
    .select('id, name, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[admin-stats.topProducts]', error.message);
    return [];
  }
  return ((products ?? []) as Array<{ id: string; name: string }>).map((p) => ({
    id: p.id,
    name: p.name,
    units: 0,
    revenue: 0,
  }));
}

/**
 * 30-day revenue series for the admin chart. Each entry is total revenue
 * placed during that calendar day, oldest → newest. Returns an array of
 * 30 zeros when the store has no orders yet (caller handles empty state).
 */
export async function getRevenueLast30Days(): Promise<number[]> {
  const series = new Array<number>(30).fill(0);

  if (!isSupabaseConfigured()) return series;
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return series;

  const start = daysAgo(29);
  const { data, error } = await db
    .from('orders')
    .select('grand_total, created_at')
    .gte('created_at', start.toISOString());
  if (error) {
    console.error('[admin-stats.revenue30d]', error.message);
    return series;
  }

  const startMs = start.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  for (const row of (data ?? []) as Array<{
    grand_total: number | string;
    created_at: string;
  }>) {
    const idx = Math.floor(
      (new Date(row.created_at).getTime() - startMs) / dayMs,
    );
    if (idx >= 0 && idx < 30) {
      series[idx] += Number(row.grand_total);
    }
  }
  return series;
}
