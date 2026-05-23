/**
 * Customers repository — admin reads.
 * Returns whatever is in the DB. When the DB is empty (e.g. before any
 * customer has signed up), returns []; the admin UI renders an empty state.
 */

import type { CustomerRow } from '@/lib/admin/mock-data';
import {
  isSupabaseConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';
import { getAdminSupabase, getServerSupabase } from '@/lib/supabase/server';

interface DbCustomerRow {
  id: string;
  email: string;
  full_name: string | null;
  order_count: number;
  lifetime_value: number | string;
  updated_at: string;
  created_at: string;
}

function toCustomerRow(row: DbCustomerRow): CustomerRow {
  return {
    id: row.id,
    name: row.full_name || row.email.split('@')[0] || 'Guest',
    email: row.email,
    orders: row.order_count,
    lifetime: Number(row.lifetime_value),
    lastOrder: (row.updated_at || row.created_at)?.slice(0, 10) ?? '—',
  };
}

export async function listCustomers(limit = 50): Promise<CustomerRow[]> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('customers.list');
    return [];
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return [];

  const { data, error } = await db
    .from('customers')
    .select('id, email, full_name, order_count, lifetime_value, updated_at, created_at')
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[customers.list]', error.message);
    return [];
  }
  return (data as unknown as DbCustomerRow[]).map(toCustomerRow);
}
