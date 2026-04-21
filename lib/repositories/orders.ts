/**
 * Orders repository shell.
 *
 * No live queries yet. Returns placeholder data from the admin mock layer
 * so the dashboard and orders page keep working without credentials.
 */

import { recentOrders, type AdminOrderRow } from '@/lib/admin/mock-data';
import {
  isSupabaseConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';

export async function listRecentOrders(limit = 10): Promise<AdminOrderRow[]> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('orders.listRecent');
    return recentOrders.slice(0, limit);
  }
  // LIVE (Step 10B): `orders` select with join on `customers` and
  // `order_items` aggregate, mapped to AdminOrderRow.
  return recentOrders.slice(0, limit);
}

export async function getOrder(id: string): Promise<AdminOrderRow | null> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('orders.get');
    return recentOrders.find((o) => o.id === id) ?? null;
  }
  return recentOrders.find((o) => o.id === id) ?? null;
}
