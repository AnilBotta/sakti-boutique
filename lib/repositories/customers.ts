/**
 * Customers repository — admin reads.
 * Falls back to mock data when DB is empty so the admin UI keeps a
 * believable look while no orders/customers exist yet.
 */

import {
  recentCustomers as placeholderCustomers,
  type CustomerRow,
} from '@/lib/admin/mock-data';
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
    return placeholderCustomers.slice(0, limit);
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return placeholderCustomers.slice(0, limit);

  const { data, error } = await db
    .from('customers')
    .select('id, email, full_name, order_count, lifetime_value, updated_at, created_at')
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[customers.list]', error.message);
    return placeholderCustomers.slice(0, limit);
  }
  if (!data || data.length === 0) {
    return placeholderCustomers.slice(0, limit);
  }
  return (data as unknown as DbCustomerRow[]).map(toCustomerRow);
}
