/**
 * Dashboard KPI aggregations.
 * Pulled from real DB tables when possible; falls back to the static
 * dashboardMetrics shape for fields with no data yet (orders, revenue).
 */

import 'server-only';

import { dashboardMetrics } from '@/lib/admin/mock-data';
import {
  isSupabaseConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';
import { getAdminSupabase, getServerSupabase } from '@/lib/supabase/server';

export interface DashboardStats {
  revenueToday: number;
  revenueTodayDelta: number;
  ordersToday: number;
  ordersTodayDelta: number;
  pendingOrders: number;
  lowStockCount: number;
  tryOnSessionsToday: number;
  tryOnSuccessRate: number;
  reviewsPending: number;
  amazonListed: number;
  amazonErrors: number;
  aov: number;
  aovDelta: number;
}

const LOW_STOCK_THRESHOLD = 5;

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('admin-stats.dashboard');
    return dashboardMetrics;
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return dashboardMetrics;

  // Run everything in parallel.
  const [
    lowStockRes,
    reviewsPendingRes,
    amazonListedRes,
    amazonErrorsRes,
    pendingOrdersRes,
    todayOrdersRes,
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
      .select('grand_total')
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ]);

  const todayOrders = (todayOrdersRes.data ?? []) as Array<{ grand_total: number | string }>;
  const ordersToday = todayOrders.length;
  const revenueToday = todayOrders.reduce((n, r) => n + Number(r.grand_total), 0);
  const aov = ordersToday > 0 ? Math.round(revenueToday / ordersToday) : 0;

  return {
    revenueToday: ordersToday > 0 ? revenueToday : dashboardMetrics.revenueToday,
    revenueTodayDelta: dashboardMetrics.revenueTodayDelta,
    ordersToday: ordersToday > 0 ? ordersToday : dashboardMetrics.ordersToday,
    ordersTodayDelta: dashboardMetrics.ordersTodayDelta,
    pendingOrders: pendingOrdersRes.count ?? 0,
    lowStockCount: lowStockRes.count ?? 0,
    tryOnSessionsToday: dashboardMetrics.tryOnSessionsToday,
    tryOnSuccessRate: dashboardMetrics.tryOnSuccessRate,
    reviewsPending: reviewsPendingRes.count ?? 0,
    amazonListed: amazonListedRes.count ?? 0,
    amazonErrors: amazonErrorsRes.count ?? 0,
    aov: ordersToday > 0 ? aov : dashboardMetrics.aov,
    aovDelta: dashboardMetrics.aovDelta,
  };
}
