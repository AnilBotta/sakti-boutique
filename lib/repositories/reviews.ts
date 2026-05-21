/**
 * Reviews repository — admin reads + status mutations.
 * Falls back to mock data when DB is empty.
 */

import 'server-only';

import {
  reviewQueue as placeholderReviews,
  type ReviewRow,
  type ReviewStatus,
} from '@/lib/admin/mock-data';
import {
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';
import { getAdminSupabase, getServerSupabase } from '@/lib/supabase/server';
import type { DbReviewStatus } from '@/lib/db/types';

interface DbReviewRow {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  body: string;
  title: string | null;
  status: DbReviewStatus;
  submitted_at: string;
  product?: { name: string } | null;
}

function mapStatus(s: DbReviewStatus): ReviewStatus {
  // DB has 'pending' | 'approved' | 'rejected' | 'hidden';
  // admin UI collapses 'rejected' and 'hidden' under 'hidden'.
  return s === 'pending' ? 'pending' : s === 'approved' ? 'approved' : 'hidden';
}

function toReviewRow(row: DbReviewRow): ReviewRow {
  return {
    id: row.id,
    product: row.product?.name ?? row.product_id,
    author: row.author_name,
    rating: row.rating,
    excerpt:
      (row.title ? `${row.title} — ` : '') +
      (row.body.length > 120 ? `${row.body.slice(0, 117)}…` : row.body),
    status: mapStatus(row.status),
    submittedAt: row.submitted_at.slice(0, 16).replace('T', ' '),
  };
}

export async function listReviews(limit = 100): Promise<ReviewRow[]> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('reviews.list');
    return placeholderReviews.slice(0, limit);
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return placeholderReviews.slice(0, limit);

  const { data, error } = await db
    .from('reviews')
    .select('id, product_id, author_name, rating, title, body, status, submitted_at, product:products(name)')
    .order('submitted_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[reviews.list]', error.message);
    return placeholderReviews.slice(0, limit);
  }
  if (!data || data.length === 0) {
    return placeholderReviews.slice(0, limit);
  }
  return (data as unknown as DbReviewRow[]).map(toReviewRow);
}

export async function listPendingReviews(limit = 100): Promise<ReviewRow[]> {
  const all = await listReviews(limit);
  return all.filter((r) => r.status === 'pending');
}

export type ReviewMutationResult =
  | { ok: true }
  | { ok: false; error: 'not_configured' | 'unknown'; message: string };

export async function setReviewStatus(
  id: string,
  status: 'approved' | 'rejected' | 'hidden',
): Promise<ReviewMutationResult> {
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
  const { error } = await admin
    .from('reviews')
    .update({ status, moderated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    console.error('[reviews.setStatus]', error.message);
    return { ok: false, error: 'unknown', message: error.message };
  }
  return { ok: true };
}
