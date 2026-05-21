/**
 * Channel mappings repository — read for the admin /amazon page.
 * Joins channel_mappings with products to surface per-product Amazon listings.
 */

import {
  amazonListings as placeholderAmazon,
  type AmazonRow,
  type AmazonStatus,
} from '@/lib/admin/mock-data';
import {
  isSupabaseConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';
import { getAdminSupabase, getServerSupabase } from '@/lib/supabase/server';
import type { DbAmazonListingStatus } from '@/lib/db/types';

interface DbAmazonRow {
  id: string;
  product_id: string;
  external_sku: string | null;
  external_id: string | null;
  listing_status: DbAmazonListingStatus;
  last_sync_at: string | null;
  last_sync_error: string | null;
  product?: { id: string; name: string; slug: string } | null;
}

function toAmazonRow(row: DbAmazonRow): AmazonRow {
  return {
    id: row.product?.id ?? row.product_id,
    name: row.product?.name ?? row.product_id,
    asin: row.external_id,
    sku: row.external_sku ?? '',
    status: row.listing_status as AmazonStatus,
    lastSync: row.last_sync_at?.slice(0, 16).replace('T', ' ') ?? '—',
    error: row.last_sync_error ?? undefined,
  };
}

export async function listAmazonListings(): Promise<AmazonRow[]> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('channel-mappings.list');
    return placeholderAmazon;
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return placeholderAmazon;

  const { data, error } = await db
    .from('channel_mappings')
    .select('id, product_id, external_sku, external_id, listing_status, last_sync_at, last_sync_error, product:products(id,name,slug)')
    .eq('channel', 'amazon')
    .order('updated_at', { ascending: false });
  if (error) {
    console.error('[channel-mappings.list]', error.message);
    return placeholderAmazon;
  }
  if (!data || data.length === 0) {
    return placeholderAmazon;
  }
  return (data as unknown as DbAmazonRow[]).map(toAmazonRow);
}

export async function getAmazonStats(): Promise<{
  listed: number;
  pending: number;
  errors: number;
}> {
  const rows = await listAmazonListings();
  return {
    listed: rows.filter((r) => r.status === 'listed').length,
    pending: rows.filter((r) => r.status === 'pending').length,
    errors: rows.filter((r) => r.status === 'error').length,
  };
}
